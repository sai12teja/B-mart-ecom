// Product page functionality
console.log('Loading B-Mart Product JS...');

let currentProduct = null;
let currentImageIndex = 0;

// Initialize product page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Product JS Initialized');
    initializeProductPage();
});

function initializeProductPage() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showError('Product not found');
        return;
    }
    
    // Wait for data to load before showing product
    window.BMart.waitForData(() => {
        loadProductDetails(productId);
    });
    
    // Setup auth event listeners
    setupAuthEventListeners();
}

function setupAuthEventListeners() {
    // Login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const authModal = new bootstrap.Modal(document.getElementById('authModal'));
            document.getElementById('login-tab').click();
            authModal.show();
        });
    }
    
    // Register button
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const authModal = new bootstrap.Modal(document.getElementById('authModal'));
            document.getElementById('register-tab').click();
            authModal.show();
        });
    }
    
    // Auth forms
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Login functionality would be implemented here!', 'info');
        });
    }
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Registration functionality would be implemented here!', 'info');
        });
    }
}

function loadProductDetails(productId) {
    try {
        const product = window.BMart.getProductById(productId);
        
        if (!product) {
            showError('Product not found');
            return;
        }
        
        currentProduct = product;
        displayProductDetails(product);
        loadRelatedProducts(product);
        
    } catch (error) {
        console.error('Error loading product details:', error);
        showError('Error loading product details');
    }
}

function displayProductDetails(product) {
    const container = document.getElementById('product-container');
    if (!container) return;
    
    const discount = product.discountPercentage || (product.isSale ? Math.floor(Math.random() * 50) + 10 : 0);
    const discountedPrice = discount > 0 ? (product.price * (1 - discount/100)).toFixed(2) : null;
    
    // Update breadcrumb
    const categoryLink = document.getElementById('category-link');
    const productNameBreadcrumb = document.getElementById('product-name-breadcrumb');
    
    if (categoryLink) {
        categoryLink.textContent = window.BMart.formatCategoryName(product.category);
        categoryLink.href = `search.html?category=${encodeURIComponent(product.category)}`;
    }
    if (productNameBreadcrumb) {
        productNameBreadcrumb.textContent = product.title;
    }
    
    container.innerHTML = `
        <div class="col-lg-6 col-md-6">
            <div class="product-gallery">
                <div class="image-magnifier mb-3">
                    <img src="${product.image}" 
                         alt="${product.title}" 
                         class="img-fluid main-image w-100" 
                         id="main-product-image"
                         onerror="this.src='https://picsum.photos/600/600?random=${product.id}'">
                </div>
                <div class="thumbnail-container d-flex gap-2">
                    <img src="${product.image}" 
                         alt="${product.title}" 
                         class="thumbnail img-fluid active" 
                         style="width: 80px; height: 80px; object-fit: cover;"
                         onclick="changeMainImage(this, '${product.image}')"
                         onerror="this.src='https://picsum.photos/80/80?random=${product.id}'">
                    <!-- Additional thumbnails can be added here for products with multiple images -->
                </div>
            </div>
        </div>
        
        <div class="col-lg-6 col-md-6">
            <div class="product-info">
                <h1 class="product-title mb-3">${product.title}</h1>
                
                <div class="rating-section mb-3">
                    <div class="d-flex align-items-center">
                        <div class="rating-stars me-2">
                            ${generateStarRating(product.rating.rate)}
                        </div>
                        <span class="text-muted me-3">${product.rating.rate}/5</span>
                        <span class="text-muted">(${product.rating.count} reviews)</span>
                    </div>
                </div>
                
                <div class="price-section mb-4">
                    ${discountedPrice ? `
                        <div class="d-flex align-items-center">
                            <span class="product-price me-3">$${discountedPrice}</span>
                            <span class="original-price me-2">$${product.price.toFixed(2)}</span>
                            <span class="badge bg-success">${Math.round(discount)}% OFF</span>
                        </div>
                    ` : `
                        <span class="product-price">$${product.price.toFixed(2)}</span>
                    `}
                </div>
                
                <div class="delivery-info mb-4">
                    <div class="benefit-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>1 Year Warranty</span>
                    </div>
                    <div class="benefit-item">
                        <i class="fas fa-truck"></i>
                        <span>Free delivery within 2-3 days</span>
                    </div>
                    <div class="benefit-item">
                        <i class="fas fa-undo"></i>
                        <span>7 Days Return Policy</span>
                    </div>
                    <div class="benefit-item">
                        <i class="fas fa-box"></i>
                        <span>Genuine Product</span>
                    </div>
                </div>
                
                ${product.stock < 10 ? `
                    <div class="alert alert-warning mb-4">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Only ${product.stock} left in stock!
                    </div>
                ` : ''}
                
                <div class="action-buttons mb-4">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label">Quantity</label>
                            <select class="form-select quantity-selector" id="quantity-selector">
                                ${Array.from({length: Math.min(10, product.stock)}, (_, i) => 
                                    `<option value="${i + 1}">${i + 1}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-8">
                            <label class="form-label d-block">&nbsp;</label>
                            <div class="d-grid gap-2 d-md-flex">
                                <button class="btn btn-primary flex-fill add-to-cart" 
                                        data-product-id="${product.id}">
                                    <i class="fas fa-cart-plus me-2"></i>Add to Cart
                                </button>
                                <button class="btn btn-outline-danger flex-fill" id="buy-now-btn">
                                    <i class="fas fa-bolt me-2"></i>Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="product-highlights">
                    <h6 class="mb-3">Product Highlights</h6>
                    <ul>
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Premium Quality Materials</li>
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Excellent Performance</li>
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i>User-Friendly Design</li>
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Long-Lasting Durability</li>
                        <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Great Value for Money</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // Show details section
    document.getElementById('product-details').classList.remove('d-none');
    loadProductTabsContent(product);
    
    // Add event listeners
    setupProductEventListeners();
}

function loadProductTabsContent(product) {
    // Description tab
    const descriptionContent = document.getElementById('product-description-content');
    if (descriptionContent) {
        descriptionContent.innerHTML = `
            <h5>About this item</h5>
            <p>${product.description}</p>
            <p>Experience the premium quality and exceptional performance of ${product.title}. 
            This product is designed to meet your needs with its outstanding features and reliable performance.</p>
            
            <h6 class="mt-4">Key Features:</h6>
            <ul>
                <li>High-quality materials and construction</li>
                <li>Excellent performance and reliability</li>
                <li>User-friendly design for easy operation</li>
                <li>Long-lasting durability and warranty</li>
                <li>Great value for money with competitive pricing</li>
                <li>Trusted brand with excellent customer support</li>
            </ul>
            
            <h6 class="mt-4">Why choose this product?</h6>
            <p>This ${product.title} offers the perfect combination of quality, performance, and value. 
            Whether you're using it for personal or professional purposes, you can count on its 
            reliable performance and durable construction.</p>
        `;
    }
    
    // Specifications tab
    const specsContent = document.getElementById('product-specifications-content');
    if (specsContent) {
        specsContent.innerHTML = `
            <table>
                <tr>
                    <td>Brand</td>
                    <td>${product.brand}</td>
                </tr>
                <tr>
                    <td>Product Name</td>
                    <td>${product.title}</td>
                </tr>
                <tr>
                    <td>Category</td>
                    <td>${window.BMart.formatCategoryName(product.category)}</td>
                </tr>
                <tr>
                    <td>Price</td>
                    <td>$${product.price.toFixed(2)}</td>
                </tr>
                ${product.discountPercentage ? `
                <tr>
                    <td>Discount</td>
                    <td>${Math.round(product.discountPercentage)}% OFF</td>
                </tr>
                ` : ''}
                <tr>
                    <td>Rating</td>
                    <td>${product.rating.rate} stars (${product.rating.count} reviews)</td>
                </tr>
                <tr>
                    <td>Stock Available</td>
                    <td>${product.stock} units</td>
                </tr>
                <tr>
                    <td>Warranty</td>
                    <td>1 Year Manufacturer Warranty</td>
                </tr>
                <tr>
                    <td>Return Policy</td>
                    <td>7 Days Return Available</td>
                </tr>
                <tr>
                    <td>Delivery</td>
                    <td>Free shipping within 2-3 business days</td>
                </tr>
            </table>
        `;
    }
    
    // Reviews tab
    const reviewsContent = document.getElementById('product-reviews-content');
    if (reviewsContent) {
        reviewsContent.innerHTML = generateReviewsContent(product);
    }
}

function generateReviewsContent(product) {
    const reviews = generateSampleReviews(product.rating.rate, product.rating.count);
    
    return `
        <div class="row">
            <div class="col-md-4">
                <div class="card text-center">
                    <div class="card-body">
                        <h2 class="text-warning">${product.rating.rate}</h2>
                        <div class="rating-stars mb-2">
                            ${generateStarRating(product.rating.rate)}
                        </div>
                        <p class="text-muted">${product.rating.count} reviews</p>
                    </div>
                </div>
                
                <div class="mt-4">
                    <h6>Rating Breakdown</h6>
                    <div class="mt-2">
                        <div class="d-flex align-items-center mb-1">
                            <span class="small me-2">5★</span>
                            <div class="progress flex-grow-1" style="height: 8px;">
                                <div class="progress-bar bg-warning" style="width: ${(Math.random() * 30 + 60)}%"></div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-1">
                            <span class="small me-2">4★</span>
                            <div class="progress flex-grow-1" style="height: 8px;">
                                <div class="progress-bar bg-warning" style="width: ${(Math.random() * 20 + 20)}%"></div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-1">
                            <span class="small me-2">3★</span>
                            <div class="progress flex-grow-1" style="height: 8px;">
                                <div class="progress-bar bg-warning" style="width: ${(Math.random() * 10 + 5)}%"></div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-1">
                            <span class="small me-2">2★</span>
                            <div class="progress flex-grow-1" style="height: 8px;">
                                <div class="progress-bar bg-warning" style="width: ${(Math.random() * 5)}%"></div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center">
                            <span class="small me-2">1★</span>
                            <div class="progress flex-grow-1" style="height: 8px;">
                                <div class="progress-bar bg-warning" style="width: ${(Math.random() * 3)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="reviews-list">
                    ${reviews.map(review => `
                        <div class="review-item border-bottom pb-3 mb-3">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <strong>${review.author}</strong>
                                <small class="text-muted">${review.date}</small>
                            </div>
                            <div class="rating-stars small mb-2">
                                ${generateStarRating(review.rating)}
                            </div>
                            <p class="mb-1">${review.comment}</p>
                            <small class="text-muted">Verified Purchase</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function generateSampleReviews(averageRating, count) {
    const reviews = [];
    const authors = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Alex Brown', 'Emily Davis', 'Chris Miller'];
    const comments = [
        'Excellent product! Highly recommended for everyone.',
        'Good quality and fast delivery. Very satisfied with my purchase.',
        'Met my expectations perfectly. Will buy again in the future.',
        'Great value for money. Better than I expected!',
        'Would definitely buy again! Fast shipping and good packaging.',
        'Product is exactly as described. Very happy with the quality.',
        'Fast shipping and good packaging. Product works perfectly.',
        'Satisfied with the purchase. Good customer service too.',
        'Better than expected! The quality is outstanding.',
        'Good product for the price. Would recommend to friends.'
    ];
    
    for (let i = 0; i < Math.min(6, count); i++) {
        reviews.push({
            author: authors[Math.floor(Math.random() * authors.length)],
            rating: Math.max(3, Math.min(5, averageRating + (Math.random() - 0.5))),
            comment: comments[Math.floor(Math.random() * comments.length)],
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        });
    }
    
    return reviews;
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

function loadRelatedProducts(product) {
    const relatedProducts = window.BMart.getRelatedProducts(product, 4);
    const container = document.getElementById('related-products-container');
    const section = document.getElementById('related-products-section');
    
    if (!container || !section) return;
    
    if (relatedProducts.length > 0) {
        container.innerHTML = '';
        relatedProducts.forEach(relatedProduct => {
            const productElement = window.BMart.createProductCard(relatedProduct);
            container.appendChild(productElement);
        });
        section.classList.remove('d-none');
    }
}

function setupProductEventListeners() {
    // Buy now button
    const buyNowBtn = document.getElementById('buy-now-btn');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', function() {
            if (!currentProduct) return;
            
            const quantity = parseInt(document.getElementById('quantity-selector').value) || 1;
            const discountedPrice = currentProduct.discountPercentage ? 
                (currentProduct.price * (1 - currentProduct.discountPercentage/100)).toFixed(2) : 
                currentProduct.price;
            
            const product = {
                id: currentProduct.id,
                title: currentProduct.title,
                price: parseFloat(discountedPrice),
                image: currentProduct.image
            };
            
            // Add to cart and redirect to cart page
            for (let i = 0; i < quantity; i++) {
                window.BMart.addToCart(product);
            }
            
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 1000);
        });
    }
}

function changeMainImage(thumbnail, imageUrl) {
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
        mainImage.src = imageUrl;
    }
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    thumbnail.classList.add('active');
}

function showError(message) {
    const container = document.getElementById('product-container');
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h4>${message}</h4>
                <p class="text-muted">Please try again later</p>
                <a href="index.html" class="btn btn-primary mt-3">Back to Home</a>
            </div>
        `;
    }
}

// Auth helper functions
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentNode.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function demoLogin() {
    document.getElementById('login-email').value = 'demo@bmart.com';
    document.getElementById('login-password').value = 'password';
    showNotification('Demo credentials filled! Click Sign In to continue.', 'info');
}

function showNotification(message, type = 'info') {
    if (window.BMart && window.BMart.showNotification) {
        window.BMart.showNotification(message, type);
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
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

console.log('B-Mart Product JS loaded successfully');