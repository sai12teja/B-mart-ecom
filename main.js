// Main shared functionality for B-Mart E-commerce
console.log('Loading B-Mart Main JS...');

// Global variables
let allProducts = [];
let categories = [];
let isProductsLoaded = false;
let isCategoriesLoaded = false;

// API Configuration
const APIS = {
    fakestore: {
        products: 'https://fakestoreapi.com/products',
        categories: 'https://fakestoreapi.com/products/categories'
    },
    dummyjson: {
        products: 'https://dummyjson.com/products?limit=100',
        categories: 'https://dummyjson.com/products/categories'
    }
};

// Initialize main functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('B-Mart Main JS Initialized');
    initializeMain();
});

async function initializeMain() {
    try {
        // Load essential data that might be needed across pages
        await Promise.all([loadCategories(), loadProducts()]);
        setupGlobalEventListeners();
        updateCartCount();
        
        console.log('Main functionality initialized successfully');
    } catch (error) {
        console.error('Error initializing main functionality:', error);
    }
}

// Load categories from APIs
async function loadCategories() {
    try {
        console.log('Loading categories from APIs...');
        
        let categoriesSet = new Set();
        
        // Try DummyJSON API first
        try {
            const response = await fetchWithTimeout(APIS.dummyjson.categories, 5000);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    // DummyJSON returns category objects with slug and name
                    data.forEach(cat => {
                        if (typeof cat === 'object' && cat !== null) {
                            if (cat.slug) {
                                categoriesSet.add(cat.slug); // Use slug as category identifier
                            } else if (cat.name) {
                                categoriesSet.add(cat.name);
                            }
                        } else if (typeof cat === 'string') {
                            categoriesSet.add(cat);
                        }
                    });
                    console.log('Loaded categories from DummyJSON:', data);
                }
            }
        } catch (error) {
            console.warn('DummyJSON categories failed:', error);
        }
        
        // Try FakeStore API
        try {
            const response = await fetchWithTimeout(APIS.fakestore.categories, 5000);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    data.forEach(cat => {
                        if (typeof cat === 'string') {
                            categoriesSet.add(cat);
                        }
                    });
                    console.log('Loaded categories from FakeStore:', data);
                }
            }
        } catch (error) {
            console.warn('FakeStore categories failed:', error);
        }
        
        // Convert Set to Array and ensure we have categories
        categories = Array.from(categoriesSet);
        
        // If no categories loaded, use comprehensive defaults
        if (categories.length === 0) {
            categories = [
                'electronics', 'jewelery', 'men clothing', 'women clothing',
                'smartphones', 'laptops', 'fragrances', 'skincare', 
                'groceries', 'home-decoration', 'furniture', 'tops'
            ];
        }
        
        isCategoriesLoaded = true;
        console.log('Final categories loaded:', categories.length, categories);
        
    } catch (error) {
        console.error('Error loading categories:', error);
        categories = [
            'electronics', 'jewelery', 'men clothing', 'women clothing',
            'smartphones', 'laptops', 'fragrances', 'skincare'
        ];
        isCategoriesLoaded = true;
    }
}

// Load products from APIs
async function loadProducts() {
    try {
        console.log('Loading products from APIs...');
        
        let productsData = [];
        
        // Load from FakeStore API
        try {
            console.log('Fetching from FakeStore API...');
            const response = await fetchWithTimeout(APIS.fakestore.products, 8000);
            if (response.ok) {
                const fakestoreProducts = await response.json();
                console.log(`FakeStore API returned: ${fakestoreProducts.length} products`);
                
                const transformedProducts = fakestoreProducts.map(product => ({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    description: product.description,
                    category: product.category,
                    image: product.image,
                    rating: {
                        rate: product.rating?.rate || 4.0,
                        count: product.rating?.count || 100
                    },
                    isSale: Math.random() > 0.7,
                    brand: extractBrandFromTitle(product.title),
                    stock: Math.floor(Math.random() * 100) + 10,
                    apiSource: 'fakestore'
                }));
                productsData = [...productsData, ...transformedProducts];
                console.log(`Added ${transformedProducts.length} products from FakeStore`);
            }
        } catch (error) {
            console.warn('FakeStore products failed:', error);
        }
        
        // Load from DummyJSON API
        try {
            console.log('Fetching from DummyJSON API...');
            const response = await fetchWithTimeout(APIS.dummyjson.products, 8000);
            if (response.ok) {
                const data = await response.json();
                const dummyjsonProducts = data.products || [];
                console.log(`DummyJSON API returned: ${dummyjsonProducts.length} products`);
                
                const transformedProducts = dummyjsonProducts.map(product => ({
                    id: product.id + 1000, // Offset to avoid ID conflicts
                    title: product.title,
                    price: product.price,
                    description: product.description,
                    category: product.category,
                    image: product.thumbnail || product.images?.[0] || `https://picsum.photos/300/200?random=${product.id}`,
                    rating: {
                        rate: product.rating || 4.0,
                        count: product.reviews || Math.floor(Math.random() * 1000)
                    },
                    isSale: product.discountPercentage > 0,
                    brand: product.brand || 'Generic Brand',
                    stock: product.stock || Math.floor(Math.random() * 100),
                    discountPercentage: product.discountPercentage,
                    apiSource: 'dummyjson'
                }));
                productsData = [...productsData, ...transformedProducts];
                console.log(`Added ${transformedProducts.length} products from DummyJSON`);
            }
        } catch (error) {
            console.warn('DummyJSON products failed:', error);
        }
        
        // Remove duplicates based on title
        productsData = removeDuplicateProducts(productsData);
        
        // If we still have few products, generate sample data
        if (productsData.length < 20) {
            console.log('Generating additional sample products...');
            const additionalProducts = generateSampleProducts(30);
            productsData = [...productsData, ...additionalProducts];
        }
        
        allProducts = productsData;
        isProductsLoaded = true;
        
        console.log(`Total unique products loaded: ${allProducts.length}`);
        
    } catch (error) {
        console.error('Error loading products:', error);
        allProducts = generateSampleProducts(50);
        isProductsLoaded = true;
    }
}

// Remove duplicate products
function removeDuplicateProducts(products) {
    const seen = new Set();
    return products.filter(product => {
        const identifier = product.title.toLowerCase().trim();
        if (seen.has(identifier)) {
            return false;
        }
        seen.add(identifier);
        return true;
    });
}

// Generate sample products
function generateSampleProducts(count) {
    const sampleProducts = [];
    const sampleCategories = ['electronics', 'jewelery', 'men clothing', 'women clothing', 'smartphones', 'laptops', 'home', 'beauty'];
    const brands = ['Samsung', 'Apple', 'Sony', 'Nike', 'Adidas', 'Zara', 'Dell', 'HP'];
    const productTypes = ['Pro', 'Max', 'Lite', 'Premium', 'Ultra', 'Standard'];
    
    for (let i = 1; i <= count; i++) {
        const category = sampleCategories[Math.floor(Math.random() * sampleCategories.length)];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
        
        sampleProducts.push({
            id: i + 2000, // Start from 2000 to avoid conflicts
            title: `${brand} ${category} ${productType} ${i}`,
            price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
            description: `High-quality ${category} product from ${brand}. Features premium design and excellent performance for everyday use.`,
            category: category,
            image: `https://picsum.photos/300/200?random=${i}`,
            rating: {
                rate: parseFloat((Math.random() * 3 + 2).toFixed(1)),
                count: Math.floor(Math.random() * 1000)
            },
            isSale: Math.random() > 0.6,
            brand: brand,
            stock: Math.floor(Math.random() * 100) + 10,
            apiSource: 'sample'
        });
    }
    
    return sampleProducts;
}

// Fetch with timeout utility
async function fetchWithTimeout(url, timeout = 8000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Extract brand from title
function extractBrandFromTitle(title) {
    const brands = ['Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP', 'Nike', 'Adidas', 'Puma', 'Zara', 'H&M', 'Microsoft', 'Canon', 'Nikon'];
    for (let brand of brands) {
        if (title.toLowerCase().includes(brand.toLowerCase())) {
            return brand;
        }
    }
    return 'Generic Brand';
}

// Setup global event listeners
function setupGlobalEventListeners() {
    // Search form submission
    const searchForms = document.querySelectorAll('form[action="search.html"]');
    searchForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const searchInput = this.querySelector('input[name="q"]');
            if (searchInput && searchInput.value.trim() === '') {
                e.preventDefault();
                showNotification('Please enter a search term', 'error');
            }
        });
    });
    
    // Single event listener for add to cart to prevent duplicates
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-to-cart')) {
            e.preventDefault();
            e.stopPropagation();
            
            const button = e.target.closest('.add-to-cart');
            // Disable button temporarily to prevent double clicks
            button.disabled = true;
            
            const productId = button.dataset.productId;
            const product = getProductById(productId);
            
            if (product) {
                const discountedPrice = product.discountPercentage ? 
                    (product.price * (1 - product.discountPercentage/100)).toFixed(2) : 
                    product.price;
                
                const cartProduct = {
                    id: product.id,
                    title: product.title,
                    price: parseFloat(discountedPrice),
                    image: product.image
                };
                
                addToCart(cartProduct);
            }
            
            // Re-enable button after a short delay
            setTimeout(() => {
                button.disabled = false;
            }, 1000);
        }
    });
}

// Cart functionality
function loadCart() {
    try {
        const savedCart = localStorage.getItem('bMartCart');
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.error('Error loading cart:', error);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem('bMartCart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const cart = loadCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        if (totalItems > 0) {
            element.style.display = 'flex';
        } else {
            element.style.display = 'none';
        }
    });
}

// Add to cart function - make it globally available
window.addToCart = function(product) {
    const cart = loadCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`Increased quantity of "${product.title}"`, 'success');
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1
        });
        showNotification(`"${product.title}" added to cart! 🛒`, 'success');
    }
    
    saveCart(cart);
    updateCartCount();
}

// Product page utilities
function getProductById(productId) {
    return allProducts.find(product => product.id === parseInt(productId));
}

function getRelatedProducts(product, limit = 4) {
    const sameCategoryProducts = allProducts.filter(p => 
        p.id !== product.id && 
        p.category === product.category
    );
    
    // Shuffle and return limited results
    return [...sameCategoryProducts]
        .sort(() => 0.5 - Math.random())
        .slice(0, limit);
}

// Product card creation utility
function createProductCard(product) {
    const discount = product.discountPercentage || (product.isSale ? Math.floor(Math.random() * 50) + 10 : 0);
    const discountedPrice = discount > 0 ? (product.price * (1 - discount/100)).toFixed(2) : null;

    const element = document.createElement('div');
    element.className = 'col-md-3 col-6 mb-4';
    element.innerHTML = `
        <div class="card product-card h-100 position-relative">
            ${discount > 0 ? `<span class="badge bg-danger position-absolute top-0 start-0 m-2">${Math.round(discount)}% OFF</span>` : ''}
            ${product.stock < 10 ? '<span class="badge bg-warning position-absolute top-0 end-0 m-2">Low Stock</span>' : ''}
            
            <a href="product.html?id=${product.id}" class="text-decoration-none">
                <img src="${product.image}" class="card-img-top product-image" alt="${product.title}" 
                     style="height: 200px; object-fit: cover;"
                     onerror="this.src='https://picsum.photos/300/200?random=${product.id}'">
            </a>
            
            <div class="card-body d-flex flex-column">
                <small class="text-muted text-uppercase">${product.brand}</small>
                <a href="product.html?id=${product.id}" class="text-decoration-none text-dark">
                    <h6 class="card-title">${product.title.length > 50 ? product.title.substring(0, 50) + '...' : product.title}</h6>
                </a>
                <p class="card-text small text-muted flex-grow-1">${product.description.substring(0, 80)}...</p>
                
                <div class="mt-auto">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            ${discountedPrice ? `
                                <span class="text-danger fw-bold">$${discountedPrice}</span>
                                <small class="text-muted text-decoration-line-through ms-1">$${product.price.toFixed(2)}</small>
                            ` : `
                                <span class="fw-bold">$${product.price.toFixed(2)}</span>
                            `}
                        </div>
                        <span class="text-warning small">
                            <i class="fas fa-star"></i> ${product.rating.rate}
                        </span>
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn btn-primary btn-sm w-100 add-to-cart" 
                                data-product-id="${product.id}">
                            <i class="fas fa-cart-plus me-1"></i>Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return element;
}

// Category utilities
function getCategoryIcon(category) {
    const icons = {
        'electronics': 'mobile-alt',
        'jewelery': 'gem',
        'jewelry': 'gem',
        'men clothing': 'tshirt',
        'women clothing': 'female',
        'smartphones': 'mobile-alt',
        'laptops': 'laptop',
        'fragrances': 'wind',
        'skincare': 'spa',
        'home-decoration': 'home',
        'furniture': 'couch',
        'groceries': 'shopping-basket',
        'beauty': 'spa',
        'tops': 'tshirt',
        'womens-dresses': 'female',
        'mens-shirts': 'tshirt',
        'sunglasses': 'sun',
        'automotive': 'car',
        'motorcycle': 'motorcycle',
        'lighting': 'lightbulb',
        'mens-shoes': 'shoe-prints',
        'womens-shoes': 'shoe-prints',
        'mens-watches': 'clock',
        'womens-watches': 'clock',
        'womens-bags': 'shopping-bag',
        'womens-jewellery': 'gem'
    };
    
    return icons[category] || 'shopping-bag';
}

function formatCategoryName(category) {
    // Ensure category is a string
    if (typeof category !== 'string') {
        console.warn('Category is not a string:', category);
        category = String(category);
    }
    
    const nameMap = {
        'men clothing': 'Men\'s Fashion',
        'women clothing': 'Women\'s Fashion',
        'home-decoration': 'Home Decor',
        'smartphones': 'Smartphones',
        'laptops': 'Laptops',
        'electronics': 'Electronics',
        'jewelery': 'Jewelry',
        'jewelry': 'Jewelry',
        'fragrances': 'Fragrances',
        'skincare': 'Skincare',
        'groceries': 'Groceries',
        'furniture': 'Furniture',
        'beauty': 'Beauty',
        'mens-shirts': 'Men\'s Shirts',
        'mens-shoes': 'Men\'s Shoes',
        'mens-watches': 'Men\'s Watches',
        'womens-dresses': 'Women\'s Dresses',
        'womens-shoes': 'Women\'s Shoes',
        'womens-watches': 'Women\'s Watches',
        'womens-bags': 'Women\'s Bags',
        'womens-jewellery': 'Women\'s Jewelry',
        'sunglasses': 'Sunglasses',
        'automotive': 'Automotive',
        'motorcycle': 'Motorcycle',
        'lighting': 'Lighting'
    };
    
    // Check if we have a mapped name
    if (nameMap[category]) {
        return nameMap[category];
    }
    
    // Safe string splitting
    try {
        return category
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .replace(/-/g, ' ');
    } catch (error) {
        console.error('Error formatting category name:', error, category);
        return String(category).replace(/-/g, ' ');
    }
}

// Filter and search utilities
function filterProductsByCategory(category) {
    if (category === 'all') {
        return [...allProducts];
    }
    return allProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase() ||
        product.category.toLowerCase().includes(category.toLowerCase())
    );
}

function searchProducts(query) {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [...allProducts];
    
    return allProducts.filter(product => 
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm))
    );
}

function sortProducts(products, sortBy) {
    const sortedProducts = [...products];
    
    switch (sortBy) {
        case 'price-low':
            return sortedProducts.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sortedProducts.sort((a, b) => b.price - a.price);
        case 'rating':
            return sortedProducts.sort((a, b) => b.rating.rate - a.rating.rate);
        case 'name':
            return sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
        case 'relevance':
        default:
            return sortedProducts;
    }
}

// Notification system
window.showNotification = function(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${getNotificationIcon(type)} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Loading utility
function showLoading(container, show = true, message = 'Loading...') {
    if (!container) return;
    
    if (show) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">${message}</p>
            </div>
        `;
    }
}

// Wait for data to be loaded
function waitForData(callback) {
    const checkData = () => {
        if (isProductsLoaded && isCategoriesLoaded) {
            callback();
        } else {
            setTimeout(checkData, 100);
        }
    };
    checkData();
}

// Export global utilities
window.BMart = {
    // Data
    getAllProducts: () => allProducts,
    getCategories: () => categories,
    isDataLoaded: () => isProductsLoaded && isCategoriesLoaded,
    waitForData: waitForData,
    
    // Utilities
    filterByCategory: filterProductsByCategory,
    searchProducts: searchProducts,
    sortProducts: sortProducts,
    createProductCard: createProductCard,
    formatCategoryName: formatCategoryName,
    getCategoryIcon: getCategoryIcon,
    
    // Product Page
    getProductById: getProductById,
    getRelatedProducts: getRelatedProducts,
    
    // Cart
    addToCart: window.addToCart,
    getCart: loadCart,
    saveCart: saveCart,
    updateCartCount: updateCartCount,
    
    // Notifications
    showNotification: window.showNotification,
    
    // Loading
    showLoading: showLoading
};

// Initialize cart count on page load
updateCartCount();

console.log('B-Mart Main JS loaded successfully');