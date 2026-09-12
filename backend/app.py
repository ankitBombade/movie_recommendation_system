from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
# OMDB API Configuration
OMDB_API_KEY = 'REMOVED_API_KEY'
OMDB_URL = 'http://www.omdbapi.com/'

@app.route('/api/search-movies', methods=['GET'])
def search_movies():
    query = request.args.get('query', '')
    if not query:
        return jsonify({'Error': 'No search query provided'}), 400
    
    try:
        # Make request to OMDB API
        params = {
            'apikey': OMDB_API_KEY,
            's': query,
            'type': 'movie'
        }
        response = requests.get(OMDB_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Return the OMDB response directly to frontend
        return jsonify(data)
    
    except requests.exceptions.RequestException as e:
        return jsonify({'Error': f'Failed to fetch movies: {str(e)}'}), 500

@app.route('/api/movie-details', methods=['GET'])
def movie_details():
    imdb_id = request.args.get('imdbID', '')
    if not imdb_id:
        return jsonify({'Error': 'No IMDb ID provided'}), 400
    
    try:
        # Make request to OMDB API for detailed movie info
        params = {
            'apikey': OMDB_API_KEY,
            'i': imdb_id,
            'plot': 'full'
        }
        response = requests.get(OMDB_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        return jsonify(data)
    
    except requests.exceptions.RequestException as e:
        return jsonify({'Error': f'Failed to fetch movie details: {str(e)}'}), 500

@app.route('/api/similar-movies', methods=['GET'])
def similar_movies():
    imdb_id = request.args.get('imdbID', '')
    if not imdb_id:
        return jsonify({'Error': 'No IMDb ID provided'}), 400
    
    try:
        # First get the movie details to find its genre
        details_params = {
            'apikey': OMDB_API_KEY,
            'i': imdb_id
        }
        details_response = requests.get(OMDB_URL, params=details_params)
        details_response.raise_for_status()
        movie_data = details_response.json()
        
        if movie_data.get('Response') != 'True':
            return jsonify({'Error': 'Movie not found'}), 404
        
        # Get the first genre to search for similar movies
        genres = movie_data.get('Genre', '').split(',')
        if not genres:
            return jsonify({'Error': 'No genre information available'}), 404
        
        primary_genre = genres[0].strip()
        
        # Search for movies with the same genre
        search_params = {
            'apikey': OMDB_API_KEY,
            's': primary_genre,
            'type': 'movie'
        }
        search_response = requests.get(OMDB_URL, params=search_params)
        search_response.raise_for_status()
        search_data = search_response.json()
        
        # Filter out the current movie and limit results
        if search_data.get('Response') == 'True':
            similar_movies = [m for m in search_data['Search'] if m['imdbID'] != imdb_id]
            return jsonify({
                'Response': 'True',
                'Search': similar_movies[:6]  # Return max 6 similar movies
            })
        else:
            return jsonify({'Error': 'No similar movies found'}), 404
    
    except requests.exceptions.RequestException as e:
        return jsonify({'Error': f'Failed to find similar movies: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)