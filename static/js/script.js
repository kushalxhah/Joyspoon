// Cart Management System
let cartItems = [];

// Helper function to get correct path based on current location
function getPagePath(page) {
  const isInPagesFolder = window.location.pathname.includes('/pages/');
  if (page === 'index.html') {
    return isInPagesFolder ? '../index.html' : 'index.html';
  }
  return isInPagesFolder ? page : 'pages/' + page;
}

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem('joyespoonCart');
  if (savedCart) {
    cartItems = JSON.parse(savedCart);
    updateCartUI();
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('joyespoonCart', JSON.stringify(cartItems));
}

// Add item to cart
function addToCart(product) {
  // Check if item already exists in cart
  const existingItem = cartItems.find((item) => item.name === product.name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      ...product,
      quantity: 1,
    });
  }

  saveCart();
  updateCartUI();
}

// Remove item from cart
function removeFromCart(productName) {
  cartItems = cartItems.filter((item) => item.name !== productName);
  saveCart();
  updateCartUI();
}

// Update item quantity
function updateQuantity(productName, newQuantity) {
  const item = cartItems.find((item) => item.name === productName);
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(productName);
    } else {
      item.quantity = newQuantity;
      saveCart();
      updateCartUI();
    }
  }
}

// Cart drawer functions removed - cart data is saved to localStorage only
// Cart is viewed on payment page

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  });
});

// Navbar Scroll Effect
window.addEventListener('scroll', function () {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Scroll to Top Button
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', function () {
  if (window.scrollY > 300) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
});

scrollTopBtn.addEventListener('click', function () {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});

// Add to Cart Functionality
function initAddToCartButtons() {
  const addToCartButtons = document.querySelectorAll('.btn-add-cart');

  addToCartButtons.forEach((button) => {
    // Remove existing listeners
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    newButton.addEventListener('click', function (e) {
      e.preventDefault();

      // Check if user is logged in
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (!isLoggedIn) {
        showNotification('Please login to add items to cart', 'error');
        setTimeout(() => {
          window.location.href = getPagePath('login.html');
        }, 1500);
        return;
      }

      // Get product information from the card
      const productCard = this.closest('.product-card, .gift-card');
      if (!productCard) return;

      const productName = productCard.querySelector('h5').textContent;
      const productImage = productCard.querySelector('img').src;
      const priceElement = productCard.querySelector('.price');

      // Extract price (remove ₹ and get the main price)
      let price, oldPrice;
      const priceText = priceElement.textContent;
      const priceMatch = priceText.match(/₹(\d+)/g);

      if (priceMatch && priceMatch.length >= 1) {
        price = parseInt(priceMatch[0].replace('₹', ''));
        if (priceMatch.length >= 2) {
          oldPrice = parseInt(priceMatch[1].replace('₹', ''));
        }
      }

      // Create product object
      const product = {
        name: productName,
        image: productImage,
        price: price,
        oldPrice: oldPrice,
      };

      // Add to cart
      addToCart(product);

      // Add animation class
      this.innerHTML = '<i class="fas fa-check"></i> ADDED!';
      this.style.background = '#4CAF50';

      // Reset after 2 seconds
      setTimeout(() => {
        this.innerHTML = 'ADD TO CART';
        this.style.background = '';
      }, 2000);

      // Show notification
      showNotification('Product added to cart!');
    });
  });
}

// Initialize Add to Cart buttons on page load
initAddToCartButtons();

// Notification Function
function showNotification(message, type = 'success') {
  // Check if notification already exists
  let existingNotification = document.querySelector('.cart-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  const bgColor = type === 'success' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 'linear-gradient(135deg, #ff4444, #cc0000)';
  
  notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

  // Style the notification
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${bgColor};
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.5s ease;
        font-weight: 600;
    `;

  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.5s ease';
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 3000);
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Newsletter Signup
// const newsletterBtn = document.querySelector('.btn-newsletter');
// if (newsletterBtn) {
//   newsletterBtn.addEventListener('click', function (e) {
//     e.preventDefault();

//     // Create modal/prompt for email
//     const email = prompt('Enter your email address to subscribe:');

//     if (email && validateEmail(email)) {
//       showNotification('Successfully subscribed to newsletter!');
//     } else if (email) {
//       alert('Please enter a valid email address.');
//     }
//   });
// }

// Email Validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Product Card Hover Effects
const productCards = document.querySelectorAll('.product-card, .gift-card');

productCards.forEach((card) => {
  card.addEventListener('mouseenter', function () {
    this.style.transform = 'translateY(-10px) scale(1.02)';
  });

  card.addEventListener('mouseleave', function () {
    this.style.transform = 'translateY(0) scale(1)';
  });
});

// Collection Cards Click Handler
const collectionCards = document.querySelectorAll('.collection-card');

collectionCards.forEach((card) => {
  card.addEventListener('click', function () {
    const collectionName = this.querySelector('h3').textContent;
    showNotification(`Exploring ${collectionName}...`);
  });
});

// Lazy Loading Images
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });

  const images = document.querySelectorAll('img');
  images.forEach((img) => imageObserver.observe(img));
}

// Counter Animation for Stats (if needed)
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);

  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start);
    }
  }, 16);
}

// Rating Stars Interaction
const ratingStars = document.querySelectorAll('.rating i');

ratingStars.forEach((star, index) => {
  star.addEventListener('mouseenter', function () {
    this.style.transform = 'scale(1.3) rotate(10deg)';
  });

  star.addEventListener('mouseleave', function () {
    this.style.transform = 'scale(1) rotate(0deg)';
  });
});

// Platform Logos Animation on Scroll
const observerOptions = {
  threshold: 0.5,
  rootMargin: '0px 0px -100px 0px',
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    }
  });
}, observerOptions);

const sections = document.querySelectorAll('section');
sections.forEach((section) => {
  sectionObserver.observe(section);
});

// Mobile Menu Close on Click
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
const navbarCollapse = document.querySelector('.navbar-collapse');

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (window.innerWidth < 992) {
      const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    }
  });
});

// Search Functionality (Basic)
// const searchIcon = document.querySelector('.nav-link .fa-search');
// if (searchIcon) {
//   searchIcon.parentElement.addEventListener('click', function (e) {
//     e.preventDefault();
//     const searchQuery = prompt('What are you looking for?');
//     if (searchQuery) {
//       showNotification(`Searching for "${searchQuery}"...`);
//     }
//   });
// }

// Cart drawer removed - cart icon now links directly to payment page

// Cart drawer removed - all cart interactions happen on payment page

// Search Drawer Functionality
const searchIcon = document.getElementById('searchIcon');
const searchDrawer = document.getElementById('searchDrawer');
const searchOverlay = document.getElementById('searchOverlay');
const searchClose = document.getElementById('searchClose');
const searchInput = document.getElementById('searchInput');

// Open search drawer
if (searchIcon) {
  searchIcon.addEventListener('click', function (e) {
    e.preventDefault();
    openSearch();
  });
}

// Close search drawer
if (searchClose) {
  searchClose.addEventListener('click', function () {
    closeSearch();
  });
}

// Close on overlay click
if (searchOverlay) {
  searchOverlay.addEventListener('click', function () {
    closeSearch();
  });
}

// Close on ESC key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && searchDrawer.classList.contains('active')) {
    closeSearch();
  }
});

function openSearch() {
  searchDrawer.classList.add('active');
  searchOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Focus on search input
  setTimeout(() => {
    searchInput.focus();
  }, 300);
}

function closeSearch() {
  searchDrawer.classList.remove('active');
  searchOverlay.classList.remove('active');
  document.body.style.overflow = '';
  searchInput.value = '';
}

// Close search drawer when any category card is clicked
document.addEventListener('DOMContentLoaded', function() {
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', function() {
      closeSearch();
    });
  });
});

// User Icon Click - Check Login Status
const userIcon = document.querySelector('.fa-user');
if (userIcon) {
  // Check if user is logged in and update UI
  checkLoginStatus();
  
  userIcon.parentElement.addEventListener('click', function (e) {
    e.preventDefault();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
      // Show user menu
      showUserMenu(e);
    } else {
      window.location.href = getPagePath('login.html');
    }
  });
}

// Check login status and update navbar
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userIcon = document.querySelector('.fa-user');
  
  if (isLoggedIn && userIcon) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      // Change user icon to show logged in state
      const userNavItem = userIcon.closest('.nav-item');
      userNavItem.innerHTML = `
        <a class="nav-link user-menu-trigger" href="#" id="userMenuTrigger">
          <i class="fas fa-user-circle"></i>
          <span class="user-name-nav">${currentUser.fullName.split(' ')[0]}</span>
        </a>
      `;
      
      // Add user menu dropdown
      addUserMenuDropdown(userNavItem);
    }
  }
}

// Add user menu dropdown
function addUserMenuDropdown(userNavItem) {
  const userMenu = document.createElement('div');
  userMenu.className = 'user-dropdown-menu';
  userMenu.id = 'userDropdownMenu';
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  userMenu.innerHTML = `
    <div class="user-menu-header">
      <i class="fas fa-user-circle"></i>
      <div>
        <strong>${currentUser.fullName}</strong>
        <p>${currentUser.email}</p>
      </div>
    </div>
    <div class="user-menu-divider"></div>
    <a href="#" class="user-menu-item" onclick="showUserProfile(event)">
      <i class="fas fa-user"></i> My Profile
    </a>
    <a href="#" class="user-menu-item" onclick="showUserAddress(event)">
      <i class="fas fa-map-marker-alt"></i> My Address
    </a>
    <a href="#" class="user-menu-item" onclick="showMyCoupons(event)">
      <i class="fas fa-ticket-alt"></i> My Coupons
      <span id="couponBadge" class="coupon-badge" style="display: none;">1</span>
    </a>
    <div class="user-menu-divider"></div>
    <a href="#" class="user-menu-item logout-item" onclick="logout(event)">
      <i class="fas fa-sign-out-alt"></i> Logout
    </a>
  `;
  
  userNavItem.appendChild(userMenu);
  
  // Update coupon badge
  updateCouponBadge();
  
  // Toggle menu on click
  const menuTrigger = document.getElementById('userMenuTrigger');
  if (menuTrigger) {
    menuTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      userMenu.classList.toggle('show');
    });
  }
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!userNavItem.contains(e.target)) {
      userMenu.classList.remove('show');
    }
  });
}

// Show user menu
function showUserMenu(e) {
  const userMenu = document.getElementById('userDropdownMenu');
  if (userMenu) {
    userMenu.classList.toggle('show');
  }
}

// Show user profile
function showUserProfile(e) {
  e.preventDefault();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!currentUser) {
    alert('Please login to view your profile');
    return;
  }
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'coupons-modal-overlay';
  modal.id = 'profileModal';
  
  modal.innerHTML = `
    <div class="coupons-modal">
      <div class="coupons-modal-header">
        <h3><i class="fas fa-user"></i> My Profile</h3>
        <button class="btn-close-modal" onclick="closeProfileModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="coupons-modal-body">
        <div class="profile-info-card">
          <div class="profile-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="profile-details">
            <div class="profile-detail-row">
              <i class="fas fa-user"></i>
              <div>
                <label>Full Name</label>
                <p>${currentUser.fullName}</p>
              </div>
            </div>
            <div class="profile-detail-row">
              <i class="fas fa-envelope"></i>
              <div>
                <label>Email</label>
                <p>${currentUser.email}</p>
              </div>
            </div>
            <div class="profile-detail-row">
              <i class="fas fa-phone"></i>
              <div>
                <label>Phone</label>
                <p>${currentUser.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Show modal with animation
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

// Close profile modal
function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Show user address
function showUserAddress(e) {
  e.preventDefault();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!currentUser) {
    alert('Please login to view your address');
    return;
  }
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'coupons-modal-overlay';
  modal.id = 'addressModal';
  
  let addressHTML = '';
  
  if (currentUser.address) {
    const addr = currentUser.address;
    addressHTML = `
      <div class="address-card">
        <div class="address-header">
          <i class="fas fa-map-marker-alt"></i>
          <span class="address-status">Saved Address</span>
        </div>
        <div class="address-details">
          <p class="address-name"><strong>${addr.fullName}</strong></p>
          <p><i class="fas fa-home"></i> ${addr.addressLine1}</p>
          ${addr.addressLine2 ? `<p style="padding-left: 24px;">${addr.addressLine2}</p>` : ''}
          <p><i class="fas fa-map-marker-alt"></i> ${addr.city}, ${addr.state} - ${addr.pincode}</p>
          ${addr.landmark ? `<p><i class="fas fa-landmark"></i> Landmark: ${addr.landmark}</p>` : ''}
          <p><i class="fas fa-phone"></i> ${addr.phone}</p>
          <p><i class="fas fa-envelope"></i> ${addr.email}</p>
        </div>
      </div>
    `;
  } else {
    addressHTML = `
      <div class="no-coupons">
        <i class="fas fa-map-marker-alt"></i>
        <h4>No Address Saved</h4>
        <p>Add your delivery address during checkout</p>
      </div>
    `;
  }
  
  modal.innerHTML = `
    <div class="coupons-modal">
      <div class="coupons-modal-header">
        <h3><i class="fas fa-map-marker-alt"></i> My Address</h3>
        <button class="btn-close-modal" onclick="closeAddressModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="coupons-modal-body">
        ${addressHTML}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Show modal with animation
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

// Close address modal
function closeAddressModal() {
  const modal = document.getElementById('addressModal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Logout function
function logout(e) {
  e.preventDefault();
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    showNotification('Logged out successfully!');
    setTimeout(() => {
      window.location.href = getPagePath('index.html');
    }, 1000);
  }
}

// Update coupon badge
function updateCouponBadge() {
  const badge = document.getElementById('couponBadge');
  if (!badge) return;
  
  // Check if loyalty system is available
  if (typeof getLoyaltyStatus === 'function') {
    const loyaltyStatus = getLoyaltyStatus();
    if (loyaltyStatus && loyaltyStatus.activeCoupon) {
      badge.style.display = 'inline-block';
      badge.textContent = '1';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Show My Coupons modal
function showMyCoupons(e) {
  e.preventDefault();
  
  // Check if loyalty system is available
  if (typeof getLoyaltyStatus !== 'function') {
    alert('Loyalty system is not available');
    return;
  }
  
  const loyaltyStatus = getLoyaltyStatus();
  if (!loyaltyStatus) {
    alert('Please login to view your coupons');
    return;
  }
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'coupons-modal-overlay';
  modal.id = 'couponsModal';
  
  let couponsHTML = '';
  
  // Active Coupon
  if (loyaltyStatus.activeCoupon) {
    couponsHTML += `
      <div class="coupon-card active-coupon">
        <div class="coupon-header">
          <i class="fas fa-gift"></i>
          <span class="coupon-status">Active</span>
        </div>
        <div class="coupon-code-box">
          <div class="coupon-code">${loyaltyStatus.activeCoupon.code}</div>
          <button class="btn-copy-code" onclick="copyCouponToClipboard('${loyaltyStatus.activeCoupon.code}', this)">
            <i class="fas fa-copy"></i> Copy
          </button>
        </div>
        <div class="coupon-details">
          <p><i class="fas fa-tag"></i> Get ₹${loyaltyStatus.activeCoupon.discount} OFF</p>
          <p><i class="fas fa-shopping-cart"></i> Min. order: ₹${loyaltyStatus.activeCoupon.minAmount}</p>
          <p><i class="fas fa-calendar"></i> Generated: ${new Date(loyaltyStatus.activeCoupon.generatedDate).toLocaleDateString()}</p>
        </div>
      </div>
    `;
  }
  
  // Progress towards next coupon
  if (!loyaltyStatus.activeCoupon) {
    const progress = (loyaltyStatus.purchaseCount / 5) * 100;
    couponsHTML += `
      <div class="coupon-progress-card">
        <h4><i class="fas fa-trophy"></i> Earn Your Next Coupon</h4>
        <p>Make ${loyaltyStatus.remainingPurchases} more purchase${loyaltyStatus.remainingPurchases > 1 ? 's' : ''} above ₹500 to unlock a ₹200 discount coupon!</p>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${progress}%"></div>
        </div>
        <p class="progress-text">${loyaltyStatus.purchaseCount} / 5 purchases completed</p>
      </div>
    `;
  }
  
  // Used Coupons
  if (loyaltyStatus.usedCouponsCount > 0) {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    const loyaltyKey = `loyalty_${userData.email}`;
    const fullLoyalty = JSON.parse(localStorage.getItem(loyaltyKey));
    
    couponsHTML += `<div class="used-coupons-section">
      <h4><i class="fas fa-history"></i> Used Coupons</h4>`;
    
    fullLoyalty.usedCoupons.forEach(coupon => {
      couponsHTML += `
        <div class="coupon-card used-coupon">
          <div class="coupon-code-box">
            <div class="coupon-code">${coupon.code}</div>
            <span class="used-badge">Used</span>
          </div>
          <div class="coupon-details">
            <p><i class="fas fa-check-circle"></i> Used on: ${new Date(coupon.usedDate).toLocaleDateString()}</p>
          </div>
        </div>
      `;
    });
    
    couponsHTML += `</div>`;
  }
  
  if (!loyaltyStatus.activeCoupon && loyaltyStatus.purchaseCount === 0 && loyaltyStatus.usedCouponsCount === 0) {
    couponsHTML = `
      <div class="no-coupons">
        <i class="fas fa-ticket-alt"></i>
        <h4>No Coupons Yet</h4>
        <p>Make 5 purchases above ₹500 to earn your first coupon!</p>
      </div>
    `;
  }
  
  modal.innerHTML = `
    <div class="coupons-modal">
      <div class="coupons-modal-header">
        <h3><i class="fas fa-ticket-alt"></i> My Coupons</h3>
        <button class="btn-close-modal" onclick="closeCouponsModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="coupons-modal-body">
        ${couponsHTML}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Show modal with animation
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

// Close coupons modal
function closeCouponsModal() {
  const modal = document.getElementById('couponsModal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Copy coupon to clipboard
function copyCouponToClipboard(code, button) {
  navigator.clipboard.writeText(code).then(() => {
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
    button.style.background = '#4CAF50';
    
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.style.background = '';
    }, 2000);
  });
}

// Explore Now Button
const exploreBtn = document.querySelector('.btn-hero');
if (exploreBtn) {
  exploreBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const shopSection = document.querySelector('#shop');
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// Shop Now Buttons in Collections
const shopNowButtons = document.querySelectorAll('.btn-collection');
shopNowButtons.forEach((button) => {
  button.addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    const collectionName = this.parentElement.querySelector('h3').textContent;
    showNotification(`Loading ${collectionName}...`);
  });
});

// Learn More Button
const learnMoreBtn = document.querySelector('.btn-shark-tank');
if (learnMoreBtn) {
  learnMoreBtn.addEventListener('click', function (e) {
    e.preventDefault();
    showNotification('Loading our story...');
  });
}

// Parallax Effect for Hero Section
window.addEventListener('scroll', function () {
  const scrolled = window.pageYOffset;
  const heroSection = document.querySelector('.hero-section');

  if (heroSection && scrolled < window.innerHeight) {
    heroSection.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
});

// Add Loading Animation
window.addEventListener('load', function () {
  document.body.classList.add('loaded');

  // Animate product cards on load
  const cards = document.querySelectorAll('.product-card, .gift-card');
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });
});

// Price Animation on Hover
const prices = document.querySelectorAll('.price');
prices.forEach((price) => {
  price.addEventListener('mouseenter', function () {
    this.style.transform = 'scale(1.1)';
    this.style.transition = 'transform 0.3s ease';
  });

  price.addEventListener('mouseleave', function () {
    this.style.transform = 'scale(1)';
  });
});

// Social Icons Animation
const socialIcons = document.querySelectorAll('.social-icon');
socialIcons.forEach((icon, index) => {
  icon.addEventListener('mouseenter', function () {
    this.style.transform = 'translateY(-5px) rotate(360deg)';
    this.style.transition = 'transform 0.5s ease';
  });

  icon.addEventListener('mouseleave', function () {
    this.style.transform = 'translateY(0) rotate(0deg)';
  });
});

// Hero Carousel Auto-slide Configuration
document.addEventListener('DOMContentLoaded', function () {
  const heroCarousel = document.getElementById('heroCarousel');
  if (heroCarousel && typeof bootstrap !== 'undefined') {
    const carousel = new bootstrap.Carousel(heroCarousel, {
      interval: 5000, // Auto-slide every 5 seconds
      ride: 'carousel',
      pause: 'hover', // Pause on hover
      wrap: true, // Loop continuously
    });
  }
});

// Console Welcome Message
console.log(
  '%c Welcome to JoyeSpoon! ',
  'background: linear-gradient(135deg, #D2691E, #C85A54); color: white; font-size: 20px; padding: 10px 20px; border-radius: 5px;'
);
console.log(
  '%c Discover the joy of authentic Indian mouth fresheners! ',
  'color: #D2691E; font-size: 14px; font-weight: bold;'
);

// Initialize tooltips if Bootstrap is loaded
if (typeof bootstrap !== 'undefined') {
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// Initialize cart on page load
window.addEventListener('DOMContentLoaded', function () {
  loadCart();
});


// ============================================
// SORT FUNCTIONALITY FOR PRODUCTS PAGE
// ============================================
// Add this code to your existing script.js file

document.addEventListener('DOMContentLoaded', function() {
    const sortFilter = document.getElementById('sortFilter');
    
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            const sortValue = this.value;
            const productsContainer = document.querySelector('.all-products-section .row.g-4');
            const productCards = Array.from(productsContainer.querySelectorAll('.col-lg-3'));
            
            if (sortValue === '') {
                return; // No sorting if "Sort By" is selected
            }
            
            let sortedProducts = [...productCards];
            
            switch(sortValue) {
                case 'price-low':
                    // Sort by Price: Low to High
                    sortedProducts.sort((a, b) => {
                        const priceA = parseFloat(a.querySelector('.price').textContent.replace('₹', '').trim().split(' ')[0]);
                        const priceB = parseFloat(b.querySelector('.price').textContent.replace('₹', '').trim().split(' ')[0]);
                        return priceA - priceB;
                    });
                    break;
                    
                case 'price-high':
                    // Sort by Price: High to Low
                    sortedProducts.sort((a, b) => {
                        const priceA = parseFloat(a.querySelector('.price').textContent.replace('₹', '').trim().split(' ')[0]);
                        const priceB = parseFloat(b.querySelector('.price').textContent.replace('₹', '').trim().split(' ')[0]);
                        return priceB - priceA;
                    });
                    break;
                    
                case 'popular':
                    // Sort by Most Popular (based on review count)
                    sortedProducts.sort((a, b) => {
                        const reviewsA = parseInt(a.querySelector('.rating span').textContent.replace(/[()]/g, ''));
                        const reviewsB = parseInt(b.querySelector('.rating span').textContent.replace(/[()]/g, ''));
                        return reviewsB - reviewsA;
                    });
                    break;
            }
            
            // Clear the container
            productsContainer.innerHTML = '';
            
            // Append sorted products with smooth animation
            sortedProducts.forEach((product, index) => {
                setTimeout(() => {
                    product.style.opacity = '0';
                    product.style.transform = 'translateY(20px)';
                    productsContainer.appendChild(product);
                    
                    setTimeout(() => {
                        product.style.transition = 'all 0.3s ease';
                        product.style.opacity = '1';
                        product.style.transform = 'translateY(0)';
                    }, 50);
                }, index * 50);
            });
        });
    }
});

// ============================================
// SORT FUNCTIONALITY FOR PRODUCTS PAGE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const sortFilter = document.getElementById('sortFilter');
    
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            const sortValue = this.value;
            const productsContainer = document.querySelector('.all-products-section .row.g-4');
            const productCards = Array.from(productsContainer.querySelectorAll('.col-lg-3'));
            
            if (sortValue === '') {
                return; // No sorting if "Sort By" is selected
            }
            
            let sortedProducts = [...productCards];
            
            switch(sortValue) {
                case 'price-low':
                    // Sort by Price: Low to High
                    sortedProducts.sort((a, b) => {
                        const priceA = parseFloat(a.querySelector('.price').textContent.replace('₹', '').trim().split(' ')[0]);
                        const priceB = parseFloat(b.querySelector('.price').textContent.replace('₹', '').trim().split(' ')[0]);
                        return priceA - priceB;
                    });
                    break;
                    
                case 'price-high':
                    // Sort by Price: High to Low
                    sortedProducts.sort((a, b) => {
                        const priceA = parseFloat(a.querySelector('.price').textContent.replace('₹', '').trim().split(' ')[0]);
                        const priceB = parseFloat(b.querySelector('.price').textContent.replace('₹', '').trim().split(' ')[0]);
                        return priceB - priceA;
                    });
                    break;
                    
                case 'popular':
                    // Sort by Most Popular (based on review count)
                    sortedProducts.sort((a, b) => {
                        const reviewsA = parseInt(a.querySelector('.rating span').textContent.replace(/[()]/g, ''));
                        const reviewsB = parseInt(b.querySelector('.rating span').textContent.replace(/[()]/g, ''));
                        return reviewsB - reviewsA;
                    });
                    break;
            }
            
            // Clear the container
            productsContainer.innerHTML = '';
            
            // Append sorted products with smooth animation
            sortedProducts.forEach((product, index) => {
                setTimeout(() => {
                    product.style.opacity = '0';
                    product.style.transform = 'translateY(20px)';
                    productsContainer.appendChild(product);
                    
                    setTimeout(() => {
                        product.style.transition = 'all 0.3s ease';
                        product.style.opacity = '1';
                        product.style.transform = 'translateY(0)';
                    }, 50);
                }, index * 50);
            });
        });
    }
});


// ===== SEARCH FUNCTIONALITY =====

// Product database for search
const productDatabase = [
  { name: 'Combo Mukhwas of 6', price: '₹400', image: 'static/images/i1.png', oldPrice: '₹480' },
  { name: 'Pachak Combo', price: '₹349', image: 'static/images/i3.png', oldPrice: '₹449' },
  { name: 'Hotseller Mukhwas', price: '₹399', image: 'static/images/i5.png', oldPrice: '₹499' },
  { name: 'Heritage Combo', price: '₹360', image: 'static/images/i7.png', oldPrice: '₹460' },
  { name: 'CLASSIC MUKHWAS', price: '₹199', image: 'static/images/i12.png', oldPrice: '' },
  { name: 'MUKHWAS CANDY PACK', price: '₹240', image: 'static/images/i14.png', oldPrice: '' },
  { name: 'PREMIUM BOTTLE', price: '₹299', image: 'static/images/i16.png', oldPrice: '' },
  { name: 'DELUXE MUKHWAS', price: '₹349', image: 'static/images/i24.png', oldPrice: '' },
  { name: 'GIFT PACK 1', price: '₹599', image: 'static/images/i20.png', oldPrice: '' },
  { name: 'PREMIUM GIFT BOX', price: '₹799', image: 'static/images/i22.png', oldPrice: '' },
  { name: 'DELUXE GIFT SET', price: '₹999', image: 'static/images/i24.png', oldPrice: '' },
  { name: 'FESTIVE PACK', price: '₹1299', image: 'static/images/i26.png', oldPrice: '' }
];

// Search input handler (using existing searchInput variable from line 631)
if (searchInput) {
  searchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.trim().toLowerCase();
    
    if (searchTerm.length === 0) {
      // Show categories, hide results
      document.getElementById('searchResults').style.display = 'none';
      document.getElementById('topCategories').style.display = 'block';
      return;
    }
    
    // Filter products
    const results = productDatabase.filter(product => 
      product.name.toLowerCase().includes(searchTerm)
    );
    
    // Show results section
    document.getElementById('searchResults').style.display = 'block';
    document.getElementById('topCategories').style.display = 'none';
    
    // Display results
    displaySearchResults(results);
  });
}

// Display search results
function displaySearchResults(results) {
  const container = document.getElementById('searchResultsContainer');
  
  if (results.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>No products found. Try a different search term.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = results.map(product => `
    <div class="search-result-item" onclick="openProductFromSearch('${product.name}', '${product.price}', '${product.image}', '${product.oldPrice}')">
      <div class="search-result-info">
        <div class="search-result-title">${product.name}</div>
        <div class="search-result-price">${product.price} ${product.oldPrice ? `<span style="text-decoration: line-through; color: #999; font-size: 14px; margin-left: 8px;">${product.oldPrice}</span>` : ''}</div>
      </div>
      <i class="fas fa-chevron-right" style="color: #D2691E;"></i>
    </div>
  `).join('');
}

// Open product details from search - opens product detail offcanvas
function openProductFromSearch(name, price, image, oldPrice) {
  // Close search drawer
  const searchDrawer = document.getElementById('searchDrawer');
  const searchOverlay = document.getElementById('searchOverlay');
  if (searchDrawer) searchDrawer.classList.remove('active');
  if (searchOverlay) searchOverlay.classList.remove('active');
  document.body.style.overflow = '';
  
  // Calculate discount if old price exists
  let discount = 0;
  if (oldPrice) {
    const currentPrice = parseInt(price.replace(/[^0-9]/g, ''));
    const originalPrice = parseInt(oldPrice.replace(/[^0-9]/g, ''));
    discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }
  
  // Create product data object
  const productData = {
    title: name,
    price: price.replace('₹', ''),
    oldPrice: oldPrice ? oldPrice.replace('₹', '') : '',
    discount: discount,
    image: image,
    description: `Indulge in the captivating taste of JoySpoon's ${name}, a premium and healthy mukhwas made with the finest ingredients. This delicious blend is a perfect treat for your taste buds.`,
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
  
  // Check if openProductDetail function exists (from product-detail-offcanvas.js)
  if (typeof openProductDetail === 'function') {
    openProductDetail(productData);
  } else {
    // Fallback: redirect to products page
    window.location.href = getPagePath('products.html');
  }
}

// Removed conflicting openProductOffcanvas, addToCartFromDetail, increaseDetailQty, decreaseDetailQty functions
// These were referencing non-existent DOM elements and conflicting with product-offcanvas.js


// Removed conflicting More Details toggle code that referenced non-existent elements


// Product card click handlers removed - no offcanvas functionality
