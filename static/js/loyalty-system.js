// Loyalty Coupon System for JoyeSpoon

// Generate unique coupon code
function generateCouponCode() {
  const prefix = 'JOY';
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${randomPart}`;
}

// Get user's loyalty data
function getUserLoyalty() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return null;
  
  const loyaltyKey = `loyalty_${currentUser.email}`;
  const loyaltyData = localStorage.getItem(loyaltyKey);
  
  if (!loyaltyData) {
    // Initialize loyalty data for new user
    const newLoyalty = {
      purchaseCount: 0,
      totalSpent: 0,
      activeCoupon: null,
      usedCoupons: [],
      purchaseHistory: []
    };
    localStorage.setItem(loyaltyKey, JSON.stringify(newLoyalty));
    return newLoyalty;
  }
  
  return JSON.parse(loyaltyData);
}

// Save user's loyalty data
function saveLoyalty(loyaltyData) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  const loyaltyKey = `loyalty_${currentUser.email}`;
  localStorage.setItem(loyaltyKey, JSON.stringify(loyaltyData));
}

// Track purchase and generate coupon if eligible
function trackPurchase(orderTotal) {
  const loyalty = getUserLoyalty();
  if (!loyalty) return null;
  
  // Only count purchases above ₹500
  if (orderTotal >= 500) {
    loyalty.purchaseCount++;
    loyalty.totalSpent += orderTotal;
    
    // Add to purchase history
    loyalty.purchaseHistory.push({
      date: new Date().toISOString(),
      amount: orderTotal
    });
    
    // Check if eligible for coupon (5 purchases above ₹500)
    // Only generate if no active coupon exists
    if (loyalty.purchaseCount >= 5 && !loyalty.activeCoupon) {
      const newCoupon = {
        code: generateCouponCode(),
        discount: 200,
        minAmount: 400,
        generatedDate: new Date().toISOString(),
        used: false
      };
      
      loyalty.activeCoupon = newCoupon;
      loyalty.purchaseCount = 0; // Reset counter
      
      saveLoyalty(loyalty);
      return newCoupon;
    }
  }
  
  saveLoyalty(loyalty);
  return null;
}

// Validate and apply coupon
function applyCoupon(couponCode, cartTotal) {
  const loyalty = getUserLoyalty();
  if (!loyalty) {
    return { success: false, message: 'Please login to use coupons' };
  }
  
  // Check if user has an active coupon
  if (!loyalty.activeCoupon) {
    return { success: false, message: 'Invalid coupon code' };
  }
  
  // Check if coupon code matches
  if (loyalty.activeCoupon.code !== couponCode.toUpperCase()) {
    return { success: false, message: 'Invalid coupon code' };
  }
  
  // Check if coupon is already used
  if (loyalty.activeCoupon.used) {
    return { success: false, message: 'This coupon has already been used' };
  }
  
  // Check minimum cart amount
  if (cartTotal < loyalty.activeCoupon.minAmount) {
    return { 
      success: false, 
      message: `Minimum cart value of ₹${loyalty.activeCoupon.minAmount} required` 
    };
  }
  
  // Apply discount
  const discount = loyalty.activeCoupon.discount;
  const newTotal = cartTotal - discount;
  
  return {
    success: true,
    discount: discount,
    newTotal: newTotal,
    message: `Coupon applied! You saved ₹${discount}`
  };
}

// Mark coupon as used
function markCouponAsUsed() {
  const loyalty = getUserLoyalty();
  if (!loyalty || !loyalty.activeCoupon) return;
  
  // Mark as used and move to used coupons
  loyalty.activeCoupon.used = true;
  loyalty.activeCoupon.usedDate = new Date().toISOString();
  loyalty.usedCoupons.push(loyalty.activeCoupon);
  
  // Remove active coupon
  loyalty.activeCoupon = null;
  
  saveLoyalty(loyalty);
}

// Get loyalty status for display
function getLoyaltyStatus() {
  const loyalty = getUserLoyalty();
  if (!loyalty) return null;
  
  return {
    purchaseCount: loyalty.purchaseCount,
    remainingPurchases: Math.max(0, 5 - loyalty.purchaseCount),
    activeCoupon: loyalty.activeCoupon,
    totalSpent: loyalty.totalSpent,
    usedCouponsCount: loyalty.usedCoupons.length
  };
}

// Show coupon notification
function showCouponNotification(coupon) {
  // Remove existing notification if any
  const existingNotification = document.querySelector('.coupon-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'coupon-notification';
  notification.innerHTML = `
    <div class="coupon-notification-content">
      <div class="coupon-icon">
        <i class="fas fa-gift"></i>
      </div>
      <div class="coupon-details">
        <h4>🎉 Congratulations!</h4>
        <p>You've earned a loyalty coupon!</p>
        <div class="coupon-code-display">
          <strong>${coupon.code}</strong>
        </div>
        <p class="coupon-info">Get ₹${coupon.discount} off on orders above ₹${coupon.minAmount}</p>
        <button class="btn-copy-coupon" onclick="copyCouponCode('${coupon.code}')">
          <i class="fas fa-copy"></i> Copy Code
        </button>
      </div>
      <button class="btn-close-notification" onclick="closeCouponNotification()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    closeCouponNotification();
  }, 10000);
}

// Copy coupon code to clipboard
function copyCouponCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.querySelector('.btn-copy-coupon');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    btn.style.background = '#4CAF50';
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
    }, 2000);
  });
}

// Close coupon notification
function closeCouponNotification() {
  const notification = document.querySelector('.coupon-notification');
  if (notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }
}

// Add CSS for coupon notification
const couponStyles = document.createElement('style');
couponStyles.textContent = `
  .coupon-notification {
    position: fixed;
    top: 100px;
    right: -450px;
    width: 420px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 15px;
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
    z-index: 10001;
    transition: right 0.4s ease;
    overflow: hidden;
  }
  
  .coupon-notification.show {
    right: 30px;
  }
  
  .coupon-notification-content {
    padding: 25px;
    color: white;
    position: relative;
  }
  
  .coupon-icon {
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 30px;
    animation: bounceIn 0.6s ease;
  }
  
  @keyframes bounceIn {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  
  .coupon-details h4 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 10px;
    text-align: center;
  }
  
  .coupon-details p {
    font-size: 14px;
    margin-bottom: 15px;
    text-align: center;
    opacity: 0.95;
  }
  
  .coupon-code-display {
    background: rgba(255, 255, 255, 0.2);
    border: 2px dashed rgba(255, 255, 255, 0.5);
    border-radius: 10px;
    padding: 15px;
    text-align: center;
    margin: 15px 0;
  }
  
  .coupon-code-display strong {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: 3px;
    color: #FFD700;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .coupon-info {
    font-size: 13px !important;
    opacity: 0.9 !important;
  }
  
  .btn-copy-coupon {
    width: 100%;
    padding: 12px;
    background: rgba(255, 255, 255, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 10px;
  }
  
  .btn-copy-coupon:hover {
    background: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
  }
  
  .btn-close-notification {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 30px;
    height: 30px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .btn-close-notification:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
  
  @media (max-width: 768px) {
    .coupon-notification {
      width: calc(100% - 40px);
      right: -100%;
    }
    
    .coupon-notification.show {
      right: 20px;
    }
  }
`;
document.head.appendChild(couponStyles);
