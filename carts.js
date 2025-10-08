// Cart page functionality
console.log('Loading B-Mart Cart Page JS...');

let cart = [];

// Initialize cart page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart Page JS Initialized');
    initializeCartPage();
});

function initializeCartPage() {
    loadCart();
    displayCartPage();
    setupCartPageEventListeners();
    console.log('Cart page initialized successfully');
}

function loadCart() {
    cart = window.BMart.getCart();
    console.log('Cart loaded:', cart.length, 'items');
}

function displayCartPage() {
    const emptyCart = document.getElementById('empty-cart');
    const cartWithItems = document.getElementById('cart-with-items');
    const cartItemsList = document.getElementById('cart-items-list');
    
    if (!emptyCart || !cartWithItems || !cartItemsList) return;
    
    if (cart.length === 0) {
        emptyCart.classList.remove('d-none');
        cartWithItems.classList.add('d-none');
        return;
    }
    
    emptyCart.classList.add('d-none');
    cartWithItems.classList.remove('d-none');
    
    // Display cart items
    cartItemsList.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = createCartItemElement(item);
        cartItemsList.appendChild(cartItem);
    });
    
    updateCartSummary();
}

function createCartItemElement(item) {
    const element = document.createElement('div');
    element.className = 'cart-item-page mb-3 pb-3 border-bottom';
    element.innerHTML = `
        <div class="row align-items-center">
            <div class="col-2">
                <img src="${item.image}" class="img-fluid rounded" alt="${item.title}"
                     onerror="this.src='https://picsum.photos/100/100?random=${item.id}'">
            </div>
            <div class="col-4">
                <h6 class="mb-1">${item.title.length > 40 ? item.title.substring(0, 40) + '...' : item.title}</h6>
                <p class="text-muted mb-0">$${item.price.toFixed(2)} each</p>
            </div>
            <div class="col-3">
                <div class="quantity-controls d-flex align-items-center">
                    <button class="btn btn-outline-secondary btn-sm quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="quantity mx-3">${item.quantity}</span>
                    <button class="btn btn-outline-secondary btn-sm quantity-btn increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <div class="col-2 text-end">
                <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
            <div class="col-1 text-end">
                <button class="btn btn-outline-danger btn-sm remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return element;
}

function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const tax = subtotal * 0.08; // 8% tax
    
    const subtotalElement = document.getElementById('cart-subtotal');
    const shippingElement = document.getElementById('cart-shipping');
    const taxElement = document.getElementById('cart-tax');
    const totalElement = document.getElementById('cart-total');
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${(subtotal + shipping + tax).toFixed(2)}`;
}

function setupCartPageEventListeners() {
    // Use event delegation for dynamic elements
    document.addEventListener('click', (e) => {
        // Decrease quantity
        if (e.target.closest('.decrease')) {
            const button = e.target.closest('.decrease');
            const productId = parseInt(button.dataset.id);
            updateQuantity(productId, -1);
        }
        
        // Increase quantity
        if (e.target.closest('.increase')) {
            const button = e.target.closest('.increase');
            const productId = parseInt(button.dataset.id);
            updateQuantity(productId, 1);
        }
        
        // Remove item
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const productId = parseInt(button.dataset.id);
            removeFromCart(productId);
        }
    });
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        const newQuantity = item.quantity + change;
        
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        
        item.quantity = newQuantity;
        saveCart();
        displayCartPage();
        window.BMart.updateCartCount();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    displayCartPage();
    window.BMart.updateCartCount();
    showNotification('Item removed from cart', 'info');
}

function saveCart() {
    window.BMart.saveCart(cart);
}

function handleCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    if (!window.auth || !window.auth.isLoggedIn()) {
        showNotification('Please login to checkout', 'error');
        if (window.auth && window.auth.openAuthModal) {
            window.auth.openAuthModal('login');
        }
        return;
    }
    
    // Simulate checkout process
    showNotification('Order placed successfully! Thank you for your purchase. 🎉', 'success');
    
    // Clear cart
    cart = [];
    saveCart();
    displayCartPage();
    window.BMart.updateCartCount();
}

// Show notification
function showNotification(message, type = 'info') {
    window.BMart.showNotification(message, type);
}

console.log('B-Mart Cart Page JS loaded successfully');