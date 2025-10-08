// Search page functionality
console.log('Loading B-Mart Search JS...');

let searchResults = [];
let searchQuery = '';

// Initialize search page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Search JS Initialized');
    initializeSearchPage();
});

function initializeSearchPage() {
    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    searchQuery = urlParams.get('q') || '';
    
    // Set search input value
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchQuery) {
        searchInput.value = searchQuery;
    }
    
    // Wait for data to load before performing search
    window.BMart.waitForData(() => {
        if (searchQuery) {
            performSearch(searchQuery);
        } else {
            showNoResults('Please enter a search term');
        }
    });
    
    setupSearchEventListeners();
}

function performSearch(query) {
    try {
        showLoading(true);
        
        // Update results count
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = `Searching for "${query}"...`;
        }
        
        const allProducts = window.BMart.getAllProducts();
        
        if (!allProducts || allProducts.length === 0) {
            showNoResults('No products available for search');
            return;
        }
        
        // Filter products based on search query
        searchResults = window.BMart.searchProducts(query);
        
        displaySearchResults();
        
    } catch (error) {
        console.error('Error performing search:', error);
        showNoResults('Error performing search');
    } finally {
        showLoading(false);
    }
}

function displaySearchResults() {
    const container = document.getElementById('search-results-container');
    const noResults = document.getElementById('no-results');
    const resultsCount = document.getElementById('results-count');
    
    if (!container) return;
    
    // Update results count
    if (resultsCount) {
        if (searchResults.length === 0) {
            resultsCount.textContent = `No results found for "${searchQuery}"`;
        } else {
            resultsCount.textContent = `${searchResults.length} results found for "${searchQuery}"`;
        }
    }
    
    // Show/hide no results message
    if (noResults) {
        if (searchResults.length === 0) {
            noResults.classList.remove('d-none');
            container.innerHTML = '';
        } else {
            noResults.classList.add('d-none');
        }
    }
    
    // Display results
    if (searchResults.length > 0) {
        container.innerHTML = '';
        searchResults.forEach(product => {
            const productElement = window.BMart.createProductCard(product);
            container.appendChild(productElement);
        });
    }
}

function setupSearchEventListeners() {
    // Sort functionality
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            sortSearchResults(this.value);
        });
    }
}

function sortSearchResults(sortBy) {
    searchResults = window.BMart.sortProducts(searchResults, sortBy);
    displaySearchResults();
}

function showLoading(show) {
    const container = document.getElementById('search-results-container');
    if (!container) return;

    if (show) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Searching products...</p>
            </div>
        `;
    }
}

function showNoResults(message) {
    const container = document.getElementById('search-results-container');
    const noResults = document.getElementById('no-results');
    const resultsCount = document.getElementById('results-count');
    
    if (container) container.innerHTML = '';
    if (noResults) {
        noResults.classList.remove('d-none');
        if (message) {
            noResults.querySelector('h4').textContent = message;
        }
    }
    if (resultsCount && message) {
        resultsCount.textContent = message;
    }
}

console.log('B-Mart Search JS loaded successfully');