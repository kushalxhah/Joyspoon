// Cart Offcanvas System

// Helper function to get correct path
function getPagePath(page) {
  const isInPagesFolder = window.location.pathname.includes('/pages/');
  if (page === 'index.html') {
    return isInPagesFolder ? '../index.html' : 'index.html';
  }
  return isInPagesFolder ? page : 'pages/' + page;
}

// Update cart badge
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = totalItems;
    if (totalItems > 0) {
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Direct add to cart from product card button
function addToCartDirect(button) {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    if (typeof showNotification === 'function') {
      showNotification('Please login to add items to cart', 'error');
    }
    setTimeout(() => {
      window.location.href = getPagePath('login.html');
    }, 1500);
    return;
  }
  
  // Get product info from card
  const productCard = button.closest('.product-card');
  if (!productCard) return;
  
  const title = productCard.querySelector('.product-info h5')?.textContent.trim();
  const priceElement = productCard.querySelector('.price');
  const priceText = priceElement?.childNodes[0]?.textContent.trim() || '';
  const image = productCard.querySelector('.product-img-main')?.src || '';
  
  if (!title || !priceText) return;
  
  // Get existing cart
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if item already exists (default 100g size)
  const existingIndex = cart.findIndex(item => 
    item.title === title && item.size === '100g'
  );
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      title: title,
      price: priceText,
      image: image,
      quantity: 1,
      size: '100g'
    });
  }
  
  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update badge
  updateCartBadge();
  
  // Show notification
  if (typeof showNotification === 'function') {
    showNotification(`${title} added to cart!`, 'success');
  }
  
  // Button animation
  const originalHTML = button.innerHTML;
  button.innerHTML = '<i class="fas fa-check"></i> ADDED!';
  button.style.background = '#4CAF50';
  
  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.style.background = '';
  }, 2000);
}

// Open cart offcanvas
function openCartOffcanvas() {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    if (typeof showNotification === 'function') {
      showNotification('Please login to view your cart', 'error');
    }
    setTimeout(() => {
      window.location.href = getPagePath('login.html');
    }, 1500);
    return;
  }
  
  // Load and display cart
  renderCartOffcanvas();
  
  // Show offcanvas
  const offcanvas = new bootstrap.Offcanvas(document.getElementById('cartOffcanvas'));
  offcanvas.show();
}

// Render cart items in offcanvas
function renderCartOffcanvas() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartItemsContainer = document.getElementById('cartOffcanvasItems');
  
  // Update badge
  updateCartBadge();
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart-message">
        <i class="fas fa-shopping-cart"></i>
        <p>Your cart is empty</p>
        <a href="${getPagePath('products.html')}" class="btn-continue-shopping">Continue Shopping</a>
      </div>
    `;
    
    // Update total
    const totalElement = document.getElementById('cartOffcanvasTotal');
    if (totalElement) {
      totalElement.textContent = '₹0';
    }
    
    // Disable checkout button
    const checkoutBtn = document.getElementById('cartOffcanvasCheckoutBtn');
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = '0.5';
      checkoutBtn.style.cursor = 'not-allowed';
    }
    
    return;
  }
  
  // Render cart items
  cartItemsContainer.innerHTML = cart.map((item, index) => {
    const priceValue = parseInt(item.price.replace(/[^0-9]/g, ''));
    const itemTotal = priceValue * item.quantity;
    
    return `
      <div class="cart-offcanvas-item">
        <img src="${item.image}" alt="${item.title}" class="cart-offcanvas-item-image">
        <div class="cart-offcanvas-item-details">
          <h6>${item.title}</h6>
          ${item.size ? `<p class="cart-item-size">Size: ${item.size}</p>` : ''}
          <p class="cart-item-price">${item.price}</p>
          <div class="cart-item-quantity-controls">
            <button class="cart-qty-btn" onclick="updateCartItemQuantity(${index}, -1)">
              <i class="fas fa-minus"></i>
            </button>
            <span class="cart-qty-value">${item.quantity}</span>
            <button class="cart-qty-btn" onclick="updateCartItemQuantity(${index}, 1)">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <p class="cart-item-total">Total: ₹${itemTotal}</p>
        </div>
        <button class="cart-item-remove-btn" onclick="removeCartItem(${index})" title="Remove item">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  }).join('');
  
  // Calculate total (sum of all item prices × quantities)
  const total = cart.reduce((sum, item) => {
    const priceValue = parseInt(item.price.replace(/[^0-9]/g, ''));
    return sum + (priceValue * item.quantity);
  }, 0);
  
  // Update total
  const totalElement = document.getElementById('cartOffcanvasTotal');
  if (totalElement) {
    totalElement.textContent = `₹${total}`;
  }
  
  // Enable checkout button
  const checkoutBtn = document.getElementById('cartOffcanvasCheckoutBtn');
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = '1';
    checkoutBtn.style.cursor = 'pointer';
  }
}

// Update cart item quantity
function updateCartItemQuantity(index, change) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cart[index]) {
    cart[index].quantity += change;
    
    // Remove item if quantity becomes 0
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update badge
    updateCartBadge();
    
    // Re-render cart
    renderCartOffcanvas();
    
    // Show notification
    if (typeof showNotification === 'function') {
      showNotification('Cart updated', 'success');
    }
  }
}

// Remove cart item
function removeCartItem(index) {
  if (confirm('Remove this item from cart?')) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    cart.splice(index, 1);
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update badge
    updateCartBadge();
    
    // Re-render cart
    renderCartOffcanvas();
    
    // Show notification
    if (typeof showNotification === 'function') {
      showNotification('Item removed from cart', 'success');
    }
  }
}

// Clear entire cart
function clearCartOffcanvas() {
  if (confirm('Remove all items from cart?')) {
    localStorage.removeItem('cart');
    updateCartBadge();
    renderCartOffcanvas();
    
    if (typeof showNotification === 'function') {
      showNotification('Cart cleared', 'success');
    }
  }
}

// Proceed to checkout
function proceedToCheckout() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cart.length === 0) {
    if (typeof showNotification === 'function') {
      showNotification('Your cart is empty', 'error');
    }
    return;
  }
  
  // Close offcanvas
  const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('cartOffcanvas'));
  if (offcanvas) {
    offcanvas.hide();
  }
  
  // Redirect to payment page
  setTimeout(() => {
    window.location.href = getPagePath('payment.html');
  }, 300);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Cart Offcanvas System Loaded');
  
  // Update badge on page load
  updateCartBadge();
  
  // Add click handler to cart icon
  const cartIcons = document.querySelectorAll('#cartIcon, .fa-shopping-cart');
  
  cartIcons.forEach(icon => {
    // Remove existing href to prevent default navigation
    const parentLink = icon.closest('a');
    if (parentLink) {
      parentLink.addEventListener('click', function(e) {
        e.preventDefault();
        openCartOffcanvas();
      });
    }
  });
  
  // Add click handlers to all "Add to Cart" buttons
  const addToCartButtons = document.querySelectorAll('.btn-add-cart');
  console.log('Found Add to Cart buttons:', addToCartButtons.length);
  
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent opening product detail offcanvas
      addToCartDirect(this);
    });
  });
  
  // Checkout button handler
  const checkoutBtn = document.getElementById('cartOffcanvasCheckoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', proceedToCheckout);
  }
  
  // Clear cart button handler
  const clearBtn = document.getElementById('cartOffcanvasClearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearCartOffcanvas);
  }
  
  // Fix backdrop issue - remove backdrop when offcanvas is hidden
  const cartOffcanvasElement = document.getElementById('cartOffcanvas');
  if (cartOffcanvasElement) {
    cartOffcanvasElement.addEventListener('hidden.bs.offcanvas', function() {
      // Remove any lingering backdrops
      const backdrops = document.querySelectorAll('.offcanvas-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
      
      // Remove modal-open class from body
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    });
  }
});
