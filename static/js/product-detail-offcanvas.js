// Product Detail Offcanvas System
let currentProductData = null;

// Helper function to get correct path
function getPagePath(page) {
  const isInPagesFolder = window.location.pathname.includes('/pages/');
  if (page === 'index.html') {
    return isInPagesFolder ? '../index.html' : 'index.html';
  }
  return isInPagesFolder ? page : 'pages/' + page;
}

// Open product detail offcanvas
function openProductDetail(productData) {
  currentProductData = productData;
  
  // Store base price for calculations
  currentProductData.basePrice = productData.price;
  
  // Set product image with proper path handling
  const imageElement = document.getElementById('detailProductImage');
  if (imageElement && productData.image) {
    let imagePath = productData.image;
    
    // If it's a relative path, make it work from any page
    if (!imagePath.startsWith('http') && !imagePath.startsWith('/')) {
      // Check if we're in a subfolder (pages/)
      const isInPagesFolder = window.location.pathname.includes('/pages/');
      
      if (isInPagesFolder && !imagePath.startsWith('../')) {
        // We're in pages/ folder, need to go up one level
        imagePath = '../' + imagePath;
      } else if (!isInPagesFolder && imagePath.startsWith('../')) {
        // We're in root, remove the ../
        imagePath = imagePath.replace('../', '');
      }
    }
    
    imageElement.src = imagePath;
    
    // Fallback if image fails to load
    imageElement.onerror = function() {
      console.error('Failed to load image:', this.src);
      // Try alternative path
      if (this.src.includes('../static/')) {
        this.src = this.src.replace('../static/', 'static/');
      } else if (this.src.includes('static/') && !this.src.includes('../')) {
        this.src = this.src.replace('static/', '../static/');
      }
    };
  }
  
  // Set product title
  document.getElementById('detailProductTitle').textContent = productData.title;
  
  // Set initial price
  updatePriceDisplay();
  
  // Set description
  document.getElementById('detailProductDescription').textContent = productData.description;
  
  // Set key benefits
  const benefitsList = document.getElementById('detailBenefitsList');
  benefitsList.innerHTML = productData.benefits.map(benefit => 
    `<li><i class="fas fa-check-circle"></i> ${benefit}</li>`
  ).join('');
  
  // Set ingredients
  document.getElementById('detailIngredients').textContent = productData.ingredients;
  
  // Set usage info
  document.getElementById('detailUsageInfo').textContent = productData.usage;
  
  // Set additional info
  document.getElementById('detailAdditionalInfo').innerHTML = `
    <p><strong>Shelf Life:</strong> ${productData.shelfLife}</p>
    <p><strong>Storage:</strong> Store in a cool, dry place away from direct sunlight</p>
    <p><strong>Package:</strong> Comes in a premium sealed bottle</p>
  `;
  
  // Reset quantity
  document.getElementById('detailQuantity').value = 1;
  
  // Reset size selection
  document.querySelectorAll('.detail-size-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.size === '100g') {
      btn.classList.add('active');
    }
  });
  
  // Initialize total price on button
  updateTotalPrice();
  
  // Show offcanvas
  const offcanvas = new bootstrap.Offcanvas(document.getElementById('productDetailOffcanvas'));
  offcanvas.show();
}

// Update price display based on selected size
function updatePriceDisplay() {
  if (!currentProductData) return;
  
  const sizeBtn = document.querySelector('.detail-size-btn.active');
  const size = sizeBtn ? sizeBtn.dataset.size : '100g';
  
  let multiplier = 1;
  if (size === '200g') {
    multiplier = 2; // 2x100g = double price
  } else if (size === '300g') {
    multiplier = 2; // 200g = double price
  }
  
  const basePrice = parseInt(currentProductData.basePrice);
  const newPrice = basePrice * multiplier;
  
  // Update current price for cart
  currentProductData.currentPrice = newPrice.toString();
  
  const priceContainer = document.getElementById('detailProductPrice');
  
  if (currentProductData.oldPrice) {
    const baseOldPrice = parseInt(currentProductData.oldPrice);
    const newOldPrice = baseOldPrice * multiplier;
    
    priceContainer.innerHTML = `
      MRP ₹ ${newPrice} 
      <span class="detail-old-price">MRP ₹ ${newOldPrice}</span>
      <span class="detail-save-badge">SAVE ${currentProductData.discount}%</span>
    `;
  } else {
    priceContainer.innerHTML = `MRP ₹ ${newPrice}`;
  }
  
  // Update total price
  updateTotalPrice();
}

// Quantity controls
function increaseDetailQuantity() {
  const input = document.getElementById('detailQuantity');
  input.value = parseInt(input.value) + 1;
  updateTotalPrice();
}

function decreaseDetailQuantity() {
  const input = document.getElementById('detailQuantity');
  if (parseInt(input.value) > 1) {
    input.value = parseInt(input.value) - 1;
    updateTotalPrice();
  }
}

// Update total price based on quantity and size
function updateTotalPrice() {
  if (!currentProductData) return;
  
  const quantity = parseInt(document.getElementById('detailQuantity').value);
  const pricePerUnit = parseInt(currentProductData.currentPrice || currentProductData.basePrice);
  const totalPrice = pricePerUnit * quantity;
  
  // Update the Add to Cart button to show total
  const addToCartBtn = document.getElementById('detailAddToCartBtn');
  if (addToCartBtn) {
    addToCartBtn.innerHTML = `ADD TO CART - ₹${totalPrice}`;
  }
}

// Size selection
function selectSize(button) {
  document.querySelectorAll('.detail-size-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  button.classList.add('active');
  
  // Update price and total when size changes
  updatePriceDisplay();
}

// Add to cart from detail
function addToCartFromDetail() {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    showNotification('Please login to add items to cart', 'error');
    setTimeout(() => {
      window.location.href = getPagePath('login.html');
    }, 1500);
    return;
  }
  
  if (!currentProductData) return;
  
  const quantity = parseInt(document.getElementById('detailQuantity').value);
  const sizeBtn = document.querySelector('.detail-size-btn.active');
  const size = sizeBtn ? sizeBtn.dataset.size : '100g';
  
  // Use current price (which is updated based on size)
  const priceValue = currentProductData.currentPrice || currentProductData.basePrice;
  const priceWithSymbol = `₹${priceValue}`; // Add ₹ symbol for consistency
  
  // Get existing cart
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if item already exists with same size
  const existingIndex = cart.findIndex(item => 
    item.title === currentProductData.title && item.size === size
  );
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      title: currentProductData.title,
      price: priceWithSymbol,
      image: currentProductData.image,
      quantity: quantity,
      size: size
    });
  }
  
  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  console.log('Cart saved:', cart); // Debug log
  
  // Update cart badge
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }
  
  // Show success notification
  if (typeof showNotification === 'function') {
    showNotification(`${currentProductData.title} (${size}) added to cart!`, 'success');
  } else {
    // Fallback notification if showNotification doesn't exist
    alert(`${currentProductData.title} (${size}) added to cart!`);
  }
  
  // Close offcanvas after a short delay
  setTimeout(() => {
    const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('productDetailOffcanvas'));
    if (offcanvas) {
      offcanvas.hide();
    }
  }, 500);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Product Detail Offcanvas Loaded');
  
  // Add click handlers to all product cards
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    card.style.cursor = 'pointer';
    
    card.addEventListener('click', function(e) {
      // Don't open if clicking the Add to Cart button
      if (e.target.closest('.btn-add-cart')) {
        return;
      }
      
      // Extract product data
      const title = card.querySelector('.product-info h5')?.textContent.trim();
      const priceElement = card.querySelector('.price');
      const priceText = priceElement?.childNodes[0]?.textContent.trim().replace('₹', '') || '';
      const oldPriceElement = priceElement?.querySelector('.old-price');
      const oldPrice = oldPriceElement ? oldPriceElement.textContent.trim().replace('₹', '') : '';
      const image = card.querySelector('.product-img-main')?.src || '';
      
      // Calculate discount
      let discount = 0;
      if (oldPrice && priceText) {
        const currentPrice = parseInt(priceText);
        const originalPrice = parseInt(oldPrice);
        discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
      }
      
      if (!title || !priceText) return;
      
      // Create product data
      const productData = {
        title: title,
        price: priceText,
        oldPrice: oldPrice,
        discount: discount,
        image: image,
        description: `Indulge in the captivating taste of JoySpoon's ${title}, a premium and healthy mukhwas made with the finest ingredients. This delicious blend is a perfect treat for your taste buds.`,
        benefits: [
          'Packed with protein, fiber, vitamins, and essential minerals',
          'Helps improve digestion and alleviate bloating',
          'Enhances hair health and skin radiance',
          'Rich in iron and fatty acids for strong bones',
          'A thoughtful and healthy gift for loved ones'
        ],
        ingredients: 'Fennel seeds, Sugar, Natural flavors, Edible colors, Premium spices',
        usage: 'Consume after meals for better digestion. Can be enjoyed anytime as a mouth freshener.',
        shelfLife: '6 months from the date of packaging'
      };
      
      // Open offcanvas
      openProductDetail(productData);
    });
  });
  
  // Size button handlers
  document.querySelectorAll('.detail-size-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      selectSize(this);
    });
  });
  
  // Add to cart button
  const addToCartBtn = document.getElementById('detailAddToCartBtn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', addToCartFromDetail);
  }
  
  // Fix backdrop issue - remove backdrop when offcanvas is hidden
  const productDetailOffcanvasElement = document.getElementById('productDetailOffcanvas');
  if (productDetailOffcanvasElement) {
    productDetailOffcanvasElement.addEventListener('hidden.bs.offcanvas', function() {
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
