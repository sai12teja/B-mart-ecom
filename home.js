// Home page functionality
console.log('Loading B-Mart Home JS...');

let featuredProducts = [];

// Initialize home page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Home JS Initialized');
    initializeHomePage();
});

async function initializeHomePage() {
    try {
        // Wait for main data to load
        window.BMart.waitForData(() => {
            loadFeaturedCategories();
            loadFeaturedProducts();
            setupHomeEventListeners();
            console.log('Home page initialized successfully');
        });
    } catch (error) {
        console.error('Error initializing home page:', error);
        showNotification('Error loading home page content', 'error');
    }
}

// Load featured categories for home page
function loadFeaturedCategories() {
    try {
        const categoriesContainer = document.getElementById('featured-categories');
        if (!categoriesContainer) return;

        const categories = window.BMart.getCategories();
        const featuredCategories = categories.slice(0, 6); // Show first 6 categories
        
        categoriesContainer.innerHTML = '';

        if (featuredCategories.length === 0) {
            categoriesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">No categories available</p>
                </div>
            `;
            return;
        }

        featuredCategories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'col-md-2 col-4 mb-3';
            categoryCard.innerHTML = `
                <a href="search.html?q=${encodeURIComponent(category)}" class="text-decoration-none">
                    <div class="card category-card h-100">
                        <div class="card-body text-center">
                            <div class="category-icon">
                                <i class="fas fa-${getCategoryIcon(category)} fa-2x text-primary mb-2"></i>
                            </div>
                            <h6 class="card-title mt-2">${window.BMart.formatCategoryName(category)}</h6>
                        </div>
                    </div>
                </a>
            `;
            categoriesContainer.appendChild(categoryCard);
        });

    } catch (error) {
        console.error('Error loading featured categories:', error);
        const categoriesContainer = document.getElementById('featured-categories');
        if (categoriesContainer) {
            categoriesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Error loading categories</p>
                </div>
            `;
        }
    }
}

// Load featured products for home page
function loadFeaturedProducts() {
    try {
        const productsContainer = document.getElementById('featured-products');
        if (!productsContainer) return;

        const allProducts = window.BMart.getAllProducts();
        
        if (!allProducts || allProducts.length === 0) {
            productsContainer.innerHTML = `
                <div class="col-12 text-center py-4">
                    <i class="fas fa-exclamation-triangle text-warning fa-2x mb-3"></i>
                    <p>No products available</p>
                </div>
            `;
            return;
        }

        // Get random featured products
        featuredProducts = [...allProducts]
            .sort(() => 0.5 - Math.random())
            .slice(0, 8);

        displayFeaturedProducts();

    } catch (error) {
        console.error('Error loading featured products:', error);
        const productsContainer = document.getElementById('featured-products');
        if (productsContainer) {
            productsContainer.innerHTML = `
                <div class="col-12 text-center py-4">
                    <i class="fas fa-exclamation-triangle text-warning fa-2x mb-3"></i>
                    <p>Unable to load featured products</p>
                    <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
                </div>
            `;
        }
    }
}

// Display featured products
function displayFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    container.innerHTML = '';

    if (featuredProducts.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-4">
                <p class="text-muted">No featured products available</p>
            </div>
        `;
        return;
    }

    featuredProducts.forEach(product => {
        const productElement = window.BMart.createProductCard(product);
        container.appendChild(productElement);
    });
}

// Helper function for category icons
function getCategoryIcon(category) {
    const icons = {
        'electronics': 'mobile-alt',
        'jewelery': 'gem',
        'men clothing': 'tshirt',
        'women clothing': 'female',
        'smartphones': 'mobile-alt',
        'laptops': 'laptop',
        'fragrances': 'wind',
        'skincare': 'spa',
        'home-decoration': 'home',
        'furniture': 'couch',
        'groceries': 'shopping-basket',
        'beauty': 'spa'
    };
    return icons[category] || 'shopping-bag';
}

// Setup home page event listeners
function setupHomeEventListeners() {
    console.log('Home page event listeners setup');
}

console.log('B-Mart Home JS loaded successfully');