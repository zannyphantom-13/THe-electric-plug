/**
 * THE ELECTRIC PLUG - E-Commerce Website JavaScript
 * Jumia-Inspired | Electronics Store
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---- Initialization ----
  initThemeSwitcher();
  initCarousel();
  initFlashSaleTimer();
  populateProducts();
  initSearch();
  initCart();
});

// =============================================
// HERO CAROUSEL
// =============================================
function initCarousel() {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dots = document.querySelectorAll('.dot');
  
  if (!track || !prevBtn || !nextBtn || dots.length === 0) return;

  let currentIndex = 0;
  const slideCount = dots.length;
  let autoplayInterval;

  const updateCarousel = (index) => {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach(d => d.classList.remove('active'));
    dots[index].classList.add('active');
    currentIndex = index;
  };

  const nextSlide = () => updateCarousel((currentIndex + 1) % slideCount);
  const prevSlide = () => updateCarousel((currentIndex - 1 + slideCount) % slideCount);

  // Event Listeners
  nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
  prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
  
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      updateCarousel(parseInt(e.target.dataset.index));
      resetAutoplay();
    });
  });

  // Autoplay functionality
  const startAutoplay = () => { autoplayInterval = setInterval(nextSlide, 5000); };
  const resetAutoplay = () => { clearInterval(autoplayInterval); startAutoplay(); };
  
  // Pause on hover
  track.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
  track.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
}

// =============================================
// FLASH SALE TIMER
// =============================================
function initFlashSaleTimer() {
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const annTimerEl = document.getElementById('ann-timer');
  
  if (!hoursEl || !minutesEl || !secondsEl) return;

  // Set time to 2 hours, 14 mins, 37 seconds from now
  let timeRemaining = (2 * 3600) + (14 * 60) + 37;

  const updateTimerDisplay = () => {
    const h = Math.floor(timeRemaining / 3600);
    const m = Math.floor((timeRemaining % 3600) / 60);
    const s = timeRemaining % 60;

    const hStr = h.toString().padStart(2, '0');
    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');

    hoursEl.textContent = hStr;
    minutesEl.textContent = mStr;
    secondsEl.textContent = sStr;
    
    if (annTimerEl) annTimerEl.textContent = `${hStr}:${mStr}:${sStr}`;

    if (timeRemaining > 0) {
      timeRemaining--;
    } else {
      // Reset timer if it hits 0 (for demo purposes)
      timeRemaining = (2 * 3600) + (14 * 60) + 37;
    }
  };

  setInterval(updateTimerDisplay, 1000);
}

// =============================================
// PRODUCT DATA & RENDERING
// =============================================
const productData = {
  flashSale: [
    { id: 'f1', name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', brand: 'Sony', price: 350000, oldPrice: 420000, img: '🎧', rating: 4.9, reviews: 342, sold: 85 },
    { id: 'f2', name: 'LG 9kg Front Load Washing Machine', brand: 'LG', price: 580000, oldPrice: 750000, img: '🧺', rating: 4.7, reviews: 128, sold: 62 },
    { id: 'f3', name: 'Samsung Galaxy Watch 6 Classic', brand: 'Samsung', price: 280000, oldPrice: 350000, img: '⌚', rating: 4.8, reviews: 215, sold: 90 },
    { id: 'f4', name: 'JBL Flip 6 Portable Bluetooth Speaker', brand: 'JBL', price: 95000, oldPrice: 125000, img: '🔊', rating: 4.6, reviews: 540, sold: 78 },
    { id: 'f5', name: 'Hisense 1.5HP Split Air Conditioner', brand: 'Hisense', price: 320000, oldPrice: 410000, img: '❄️', rating: 4.5, reviews: 180, sold: 45 }
  ],
  featured: [
    { id: 'p1', name: 'PlayStation 5 Console - Disc Edition', brand: 'Sony', price: 850000, img: '🎮', rating: 4.9, reviews: 890, badge: 'hot' },
    { id: 'p2', name: 'HP Envy x360 2-in-1 Laptop (Intel Core i7, 16GB RAM)', brand: 'HP', price: 1150000, img: '💻', rating: 4.7, reviews: 234 },
    { id: 'p3', name: 'Apple AirPods Pro (2nd Generation)', brand: 'Apple', price: 295000, oldPrice: 320000, img: '🎧', rating: 4.8, reviews: 1205 },
    { id: 'p4', name: 'Samsung 50" Crystal UHD 4K Smart TV', brand: 'Samsung', price: 450000, img: '📺', rating: 4.6, reviews: 310, badge: 'sale' },
    { id: 'p5', name: 'Canon EOS Rebel T7 DSLR Camera', brand: 'Canon', price: 480000, img: '📷', rating: 4.7, reviews: 185 }
  ],
  newArrivals: [
    { id: 'n1', name: 'Samsung Galaxy S24 Ultra 512GB', brand: 'Samsung', price: 1550000, img: '📱', rating: 5.0, reviews: 42, badge: 'new' },
    { id: 'n2', name: 'Nintendo Switch OLED Model', brand: 'Nintendo', price: 380000, img: '🎮', rating: 4.8, reviews: 512 },
    { id: 'n3', name: 'Ninja 4qt Air Fryer', brand: 'Ninja', price: 120000, img: '🍳', rating: 4.7, reviews: 89, badge: 'new' },
    { id: 'n4', name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor', brand: 'Dell', price: 420000, img: '🖥️', rating: 4.9, reviews: 28 }
  ]
};

function formatCurrency(amount) {
  return '₦' + amount.toLocaleString('en-NG');
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  let starsHtml = '';
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHtml += '★';
    } else if (i === fullStars && halfStar) {
      // Simple half star approach for text
      starsHtml += '★'; 
    } else {
      starsHtml += '☆';
    }
  }
  return `<span class="stars" aria-label="Rating: ${rating} out of 5 stars">${starsHtml}</span>`;
}

function createProductCard(product, isFlashSale = false) {
  const priceHtml = product.oldPrice 
    ? `<span class="product-old-price">${formatCurrency(product.oldPrice)}</span>
       <span class="product-price">${formatCurrency(product.price)}</span>
       <span class="product-discount">-${Math.round((1 - product.price/product.oldPrice) * 100)}%</span>`
    : `<span class="product-price">${formatCurrency(product.price)}</span>`;

  let badgeHtml = '';
  if (product.badge === 'hot') badgeHtml = `<span class="product-badge hot">HOT</span>`;
  if (product.badge === 'new') badgeHtml = `<span class="product-badge new">NEW</span>`;
  if (product.badge === 'sale' || product.oldPrice) badgeHtml = `<span class="product-badge">SALE</span>`;

  let flashSaleHtml = '';
  if (isFlashSale && product.sold) {
    flashSaleHtml = `
      <div class="flash-progress">
        <div class="progress-label">${product.sold}% Sold</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${product.sold}%"></div>
        </div>
      </div>
    `;
  }

  // Escape single quotes for inline JS handler
  const escapedName = product.name.replace(/'/g, "\\'");

  return `
    <article class="product-card" tabindex="0">
      <div class="product-img-wrap">
        ${badgeHtml}
        <button class="product-wishlist" aria-label="Add to wishlist" onclick="toggleWishlist(event, this)">❤️</button>
        <span class="product-emoji-placeholder" role="img" aria-label="${product.name}">${product.img}</span>
        
        <div class="product-actions">
          <button style="background:transparent; font:inherit; font-weight:700; width:100%; height:100%;" 
                  onclick="addToCart('${escapedName}', ${product.price}, '${product.img}')">
            🛒 ADD TO CART
          </button>
        </div>
      </div>
      
      <div class="product-info">
        <div class="product-brand">${product.brand}</div>
        <h3 class="product-name" title="${product.name}">${product.name}</h3>
        <div class="product-rating">
          ${generateStars(product.rating)}
          <span class="rating-count">(${product.reviews})</span>
        </div>
        <div class="product-price-wrap">
          ${priceHtml}
        </div>
        ${flashSaleHtml}
      </div>
    </article>
  `;
}

function populateProducts() {
  const flashContainer = document.getElementById('flash-products');
  const featuredContainer = document.getElementById('featured-products');
  const newContainer = document.getElementById('new-arrivals');

  if (flashContainer) {
    flashContainer.innerHTML = productData.flashSale.map(p => createProductCard(p, true)).join('');
  }
  if (featuredContainer) {
    featuredContainer.innerHTML = productData.featured.map(p => createProductCard(p)).join('');
  }
  if (newContainer) {
    newContainer.innerHTML = productData.newArrivals.map(p => createProductCard(p)).join('');
  }
}

// =============================================
// SEARCH FUNCTIONALITY
// =============================================
function initSearch() {
  const searchInput = document.getElementById('main-search');
  const searchDropdown = document.getElementById('search-dropdown');
  const searchBtn = document.getElementById('search-btn');

  if (!searchInput || !searchDropdown) return;

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length > 0) {
      searchDropdown.classList.add('show');
    }
  });

  searchInput.addEventListener('input', () => {
    if (searchInput.value.trim().length > 0) {
      searchDropdown.classList.add('show');
    } else {
      searchDropdown.classList.remove('show');
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
      searchDropdown.classList.remove('show');
    }
  });

  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      showToast(`Searching for "${query}"...`, 'info');
      searchDropdown.classList.remove('show');
    }
  });
  
  // Enter key
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });
}

// =============================================
// CART FUNCTIONALITY
// =============================================
let cart = [];

function initCart() {
  const cartBtn = document.getElementById('cart-btn');
  const cartClose = document.getElementById('cart-close');
  const cartOverlay = document.getElementById('cart-overlay');
  
  if (!cartBtn || !cartClose || !cartOverlay) return;

  const toggleCart = () => {
    const drawer = document.getElementById('cart-drawer');
    const isOpen = drawer.classList.contains('open');
    
    if (isOpen) {
      drawer.classList.remove('open');
      cartOverlay.classList.remove('open');
      document.body.style.overflow = '';
    } else {
      drawer.classList.add('open');
      cartOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      renderCart();
    }
  };

  cartBtn.addEventListener('click', toggleCart);
  cartClose.addEventListener('click', toggleCart);
  cartOverlay.addEventListener('click', toggleCart);
}

window.addToCart = function(name, price, img) {
  const existingItem = cart.find(item => item.name === name);
  
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ id: Date.now().toString(), name, price, img, qty: 1 });
  }
  
  updateCartBadge();
  showToast(`${name} added to cart!`, 'success');
  
  // If cart is open, re-render it
  if (document.getElementById('cart-drawer').classList.contains('open')) {
    renderCart();
  }
};

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartBadge();
  renderCart();
}

function updateQty(id, change) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += change;
    if (item.qty <= 0) {
      removeFromCart(id);
    } else {
      renderCart();
      updateCartBadge();
    }
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  const countSpan = document.getElementById('cart-item-count');
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  
  if (badge) badge.textContent = totalQty;
  if (countSpan) countSpan.textContent = totalQty;
}

function renderCart() {
  const itemsContainer = document.getElementById('cart-items');
  const emptyState = document.getElementById('cart-empty');
  const footer = document.getElementById('cart-footer');
  const totalEl = document.getElementById('cart-total');
  
  if (!itemsContainer || !emptyState || !footer || !totalEl) return;

  if (cart.length === 0) {
    emptyState.style.display = 'block';
    itemsContainer.innerHTML = '';
    footer.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  footer.style.display = 'block';

  let totalAmount = 0;
  
  itemsContainer.innerHTML = cart.map(item => {
    totalAmount += item.price * item.qty;
    return `
      <div class="cart-item">
        <div class="cart-item-img">${item.img}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatCurrency(item.price)}</div>
          <div class="cart-qty">
            <button class="qty-btn" onclick="updateQty('${item.id}', -1)" aria-label="Decrease quantity">-</button>
            <span class="qty-num" aria-live="polite">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove item">🗑️</button>
      </div>
    `;
  }).join('');

  totalEl.textContent = formatCurrency(totalAmount);
}

// =============================================
// UTILITIES (TOAST & WISH LIST)
// =============================================
window.showToast = function(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  // Remove element after animation finishes (0.3s slide in + 2.7s stay + 0.3s slide out = 3.3s total)
  setTimeout(() => {
    if (container.contains(toast)) {
      container.removeChild(toast);
    }
  }, 3500);
};

window.toggleWishlist = function(event, btnElement) {
  event.stopPropagation(); // Prevent card click
  const isWished = btnElement.style.background === 'var(--danger)';
  
  if (isWished) {
    btnElement.style.background = '';
    btnElement.style.borderColor = '';
    showToast('Removed from wishlist', 'info');
  } else {
    btnElement.style.background = 'var(--danger)';
    btnElement.style.borderColor = 'var(--danger)';
    showToast('Added to wishlist!', 'success');
  }
};

window.handleNewsletter = function(event) {
  event.preventDefault();
  const emailInput = document.getElementById('newsletter-email');
  if (emailInput && emailInput.value) {
    showToast('Thanks for subscribing! 🎉', 'success');
    emailInput.value = '';
  } else {
    showToast('Please enter a valid email.', 'error');
  }
};

// =============================================
// THEME SWITCHER
// =============================================
function initThemeSwitcher() {
  const selectors = document.querySelectorAll('.theme-selector');
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  const setTheme = (theme) => {
    if (theme === 'auto') {
      if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('selected-theme', theme);
    if (selectors) {
      selectors.forEach(s => s.value = theme);
    }
  };

  const currentTheme = localStorage.getItem('selected-theme') || 'light';
  setTheme(currentTheme);

  if (selectors) {
    selectors.forEach(selector => {
      selector.addEventListener('change', (e) => {
        setTheme(e.target.value);
      });
    });
  }

  prefersDarkScheme.addEventListener('change', (e) => {
    if (localStorage.getItem('selected-theme') === 'auto') {
      setTheme('auto');
    }
  });
}

