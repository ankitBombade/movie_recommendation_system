// Flask backend URL
// For local testing, use http://127.0.0.1:5000
// Later, replace this with your Render backend URL.
const API_URL = 'http://127.0.0.1:5000';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const moviesContainer = document.getElementById('moviesContainer');

async function searchMovies(query) {
    try {
        showLoading();

        const response = await fetch(
            `${API_URL}/api/search-movies?query=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        if (data.Response === "True") {
            displayMovies(data.Search);
        } else {
            showError(data.Error || "No movies found");
        }
    } catch (error) {
        console.error("Search error:", error);
        showError("Failed to fetch movies. Please try again.");
    } finally {
        hideLoading();
    }
}

function displayMovies(movies) {
    moviesContainer.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}"
                 class="movie-poster"
                 alt="${movie.Title}">

            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <p class="movie-year">${movie.Year}</p>

                <button class="similar-btn" onclick="showMovieDetails('${movie.imdbID}')">
                    More Details <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `).join('');
}

async function showMovieDetails(imdbID) {
    try {
        showLoading();

        const response = await fetch(
            `${API_URL}/api/movie-details?imdbID=${encodeURIComponent(imdbID)}`
        );

        const data = await response.json();

        if (data.Response === 'True') {
            displayMovieDetails(data);
        } else {
            showError('Failed to load movie details');
        }
    } catch (error) {
        console.error('Details error:', error);
        showError('Failed to load details');
    } finally {
        hideLoading();
    }
}

function displayMovieDetails(movie) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>

            <div class="modal-poster">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}"
                     alt="${movie.Title}">
            </div>

            <div class="modal-info">
                <h2>${movie.Title} (${movie.Year})</h2>
                <p><strong>Rating:</strong> ${movie.imdbRating}/10</p>
                <p><strong>Runtime:</strong> ${movie.Runtime}</p>
                <p><strong>Genre:</strong> ${movie.Genre}</p>
                <p><strong>Director:</strong> ${movie.Director}</p>
                <p><strong>Cast:</strong> ${movie.Actors}</p>
                <p><strong>Plot:</strong> ${movie.Plot}</p>

                <button class="similar-btn" onclick="fetchSimilarMovies('${movie.imdbID}')">
                    More Like This <i class="fas fa-film"></i>
                </button>
            </div>
        </div>
    `;

    modal.querySelector('.close-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    document.body.appendChild(modal);
}

async function fetchSimilarMovies(imdbID) {
    try {
        showLoading();

        const response = await fetch(
            `${API_URL}/api/similar-movies?imdbID=${encodeURIComponent(imdbID)}`
        );

        const data = await response.json();

        if (data.Response === "True") {
            const similarMovies = data.Search;

            if (similarMovies && similarMovies.length > 0) {
                displayMovies(similarMovies.slice(0, 6));

                const modal = document.querySelector('.modal');
                if (modal) {
                    modal.remove();
                }
            } else {
                showError("No similar movies found");
            }
        } else {
            showError(data.Error || "No similar movies found");
        }
    } catch (error) {
        console.error("Similar movies error:", error);
        showError("Failed to find similar movies");
    } finally {
        hideLoading();
    }
}

// Helper functions
function showError(message) {
    moviesContainer.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            ${message}
        </div>
    `;
}

function showLoading() {
    moviesContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    `;
}

function hideLoading() {
    const loadingElement = document.querySelector('.loading-spinner');

    if (loadingElement) {
        loadingElement.parentElement.remove();
    }
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();

    if (query) {
        searchMovies(query);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();

        if (query) {
            searchMovies(query);
        }
    }
});

// Initialize with popular movies
window.addEventListener('DOMContentLoaded', () => {
    searchMovies('action');
});
