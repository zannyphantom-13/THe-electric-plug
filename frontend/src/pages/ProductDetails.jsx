import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { allProducts } from '../data/productData';
import { getProductIcon, formatCurrency } from './Home';
import { 
  ShoppingCart, Heart, Truck, ShieldCheck, 
  BatteryCharging, MicOff, Package, Speaker, Cable
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductDetails() {
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  
  const product = allProducts.find(p => p.id === id) || allProducts[0];
  
  // Provide a generic set of fallback icons if we can't map properly
  const thumbnails = [
    getProductIcon(product.category), 
    <Package size={48} strokeWidth={1} color="var(--gray-2)" />, 
    <Speaker size={48} strokeWidth={1} color="var(--gray-2)" />, 
    <Cable size={48} strokeWidth={1} color="var(--gray-2)" />
  ];

  return (
    <main className="main-content" id="main">
      <div className="text-primary" style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
        <Link to="/" style={{ color: 'var(--gray-1)' }}>Home</Link> / 
        <Link to="/shop" style={{ color: 'var(--gray-1)' }}> {product.category || 'Shop'} </Link> / 
        {product.name}
      </div>

      <div className="product-detail-layout">
        
        {/* 1. IMAGE GALLERY */}
        <div className="product-gallery">
          <div className="pg-main">
            {product.badge && (
              <span className={`pg-badge ${product.badge === 'hot' ? 'hot' : product.badge === 'new' ? 'new' : ''}`}>
                {product.badge.toUpperCase()}
              </span>
            )}
            <div style={{ transform: 'scale(2.5)' }}>
              {thumbnails[activeThumb]}
            </div>
          </div>
          <div className="pg-thumbnails">
            {thumbnails.map((thumb, idx) => (
              <div 
                key={idx}
                className={`pg-thumb ${activeThumb === idx ? 'active' : ''}`}
                onClick={() => setActiveThumb(idx)}
                style={{ padding: '16px' }}
              >
                {thumb}
              </div>
            ))}
          </div>
        </div>

        {/* 2. PRODUCT INFO */}
        <div className="product-detail-info">
          <div>
            <div className="pd-brand">{product.brand}</div>
            <h1 className="pd-title">{product.name}</h1>
          </div>
          
          <div className="pd-rating">
            <span className="stars" style={{ color: 'var(--primary)', fontSize: '16px', letterSpacing: '2px' }}>
              {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
            </span>
            <span style={{ fontWeight: 700, color: 'var(--white)', marginLeft: '8px' }}>{product.rating}</span>
            <span>({product.reviews} verified ratings)</span>
          </div>

          <div>
            {product.oldPrice && (
              <div className="pd-discount">
                -{Math.round((1 - product.price/product.oldPrice) * 100)}% Discount
              </div>
            )}
            <div className="pd-price-wrap">
              <span className="pd-price">{formatCurrency(product.price)}</span>
              {product.oldPrice && <span className="pd-old-price">{formatCurrency(product.oldPrice)}</span>}
            </div>
          </div>

          <div className="pd-variants">
            <div className="variant-title">Color: <span style={{ color: 'var(--white)' }}>Midnight Black</span></div>
            <div className="variant-options">
              <button className="variant-btn active">Midnight Black</button>
              <button className="variant-btn">Platinum Silver</button>
              <button className="variant-btn">Midnight Blue</button>
            </div>
          </div>

          <div className="pd-features">
            <div className="pd-feature">
              <span className="pd-feature-icon"><BatteryCharging size={20} /></span>
              <span>Up to 30 hours of battery life with quick charging.</span>
            </div>
            <div className="pd-feature">
              <span className="pd-feature-icon"><MicOff size={20} /></span>
              <span>Industry-leading noise cancellation optimized for you.</span>
            </div>
            <div className="pd-feature">
              <span className="pd-feature-icon"><ShieldCheck size={20} /></span>
              <span>1 Year Official Warranty Included.</span>
            </div>
          </div>
        </div>

        {/* 3. ACTION SIDEBAR */}
        <div className="product-action-sidebar">
          <div className="pas-delivery">
            <div className="pas-delivery-icon" style={{ color: 'var(--primary)' }}><Truck size={32} strokeWidth={1.5} /></div>
            <div className="pas-delivery-text">
              <strong>Free Delivery</strong>
              <span>Estimated delivery: 2-4 working days across Lagos.</span>
            </div>
          </div>
          <div className="pas-delivery" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <div className="pas-delivery-icon" style={{ color: 'var(--primary)' }}><ShieldCheck size={32} strokeWidth={1.5} /></div>
            <div className="pas-delivery-text">
              <strong>Return Policy</strong>
              <span>Free return within 7 days for defective items.</span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--dark-border)', margin: 0 }} />

          <div className="pas-qty">
            <span>Quantity</span>
            <div className="qty-selector">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
              <input type="number" value={qty} readOnly />
              <button onClick={() => setQty(q => Math.min(10, q + 1))}>+</button>
            </div>
          </div>

          <div>
            <button className="pas-add-btn" onClick={() => {
              addToCart(product, qty);
              alert(`${qty}x ${product.name} added to cart!`);
            }}>
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button 
              className={`pas-wish-btn ${isInWishlist(product.id) ? 'active' : ''}`} 
              onClick={() => toggleWishlist(product)} 
              style={{ marginTop: '10px', color: isInWishlist(product.id) ? 'var(--primary)' : 'inherit', borderColor: isInWishlist(product.id) ? 'var(--primary)' : 'inherit' }}
            >
              <Heart size={18} fill={isInWishlist(product.id) ? 'var(--primary)' : 'none'} /> {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>

      </div>

      {/* 4. PRODUCT TABS */}
      <div className="product-tabs-section">
        <div className="tabs-nav">
          <button className={`tab-btn ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>Overview</button>
          <button className={`tab-btn ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>Specifications</button>
          <button className={`tab-btn ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>Verified Reviews ({product.reviews})</button>
        </div>
        
        {activeTab === 0 && (
          <div className="tab-content active">
            <h3>Premium Experience with {product.brand}</h3>
            <p>Experience unparalleled quality and performance with the latest {product.name}. Designed to seamlessly integrate into your lifestyle, this product sets a new standard for excellence.</p>
            <p>Every detail has been meticulously crafted to provide you with the best experience possible. From the premium materials to the advanced internal components, this is technology at its finest.</p>
          </div>
        )}

        {activeTab === 1 && (
          <div className="tab-content active">
            <h3>Technical Specifications</h3>
            <table className="specs-table">
              <tbody>
                <tr><th>Brand</th><td>{product.brand}</td></tr>
                <tr><th>Category</th><td>{product.category || 'Electronics'}</td></tr>
                <tr><th>Model Year</th><td>2026</td></tr>
                <tr><th>Warranty</th><td>1 Year Limited Warranty</td></tr>
                <tr><th>Weight</th><td>Approx. 1.2kg</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 2 && (
          <div className="tab-content active">
            <div className="reviews-grid">
              <div className="rating-summary">
                <h3>Customer Feedback</h3>
                <div>
                  <div className="rs-score">{product.rating}</div>
                  <div className="rs-stars" style={{ color: 'var(--primary)', letterSpacing: '2px' }}>★★★★★</div>
                  <div style={{ fontSize: '13px', color: 'var(--gray-1)' }}>Based on {product.reviews} reviews</div>
                </div>
                <div className="rs-bars">
                  <div className="rs-bar-row">5★ <div className="rs-bar-track"><div className="rs-bar-fill" style={{ width: '85%' }}></div></div> 85%</div>
                  <div className="rs-bar-row">4★ <div className="rs-bar-track"><div className="rs-bar-fill" style={{ width: '10%' }}></div></div> 10%</div>
                  <div className="rs-bar-row">3★ <div className="rs-bar-track"><div className="rs-bar-fill" style={{ width: '3%' }}></div></div> 3%</div>
                  <div className="rs-bar-row">2★ <div className="rs-bar-track"><div className="rs-bar-fill" style={{ width: '1%' }}></div></div> 1%</div>
                  <div className="rs-bar-row">1★ <div className="rs-bar-track"><div className="rs-bar-fill" style={{ width: '1%' }}></div></div> 1%</div>
                </div>
              </div>
              <div className="review-list">
                <div className="review-card">
                  <div className="rc-header">
                    <span className="rc-user">Hassan Adebayo <span style={{ color: 'var(--success)', fontSize: '11px' }}>✓ Verified Buyer</span></span>
                    <span className="rc-date">May 12, 2026</span>
                  </div>
                  <div className="rc-stars">★★★★★</div>
                  <div className="rc-text">Absolutely incredible quality. I upgraded from the previous model and the difference is noticeable. Highly recommend buying from The Electric Plug, delivery was very fast!</div>
                </div>
                <div className="review-card">
                  <div className="rc-header">
                    <span className="rc-user">Chidinma Okafor <span style={{ color: 'var(--success)', fontSize: '11px' }}>✓ Verified Buyer</span></span>
                    <span className="rc-date">April 28, 2026</span>
                  </div>
                  <div className="rc-stars">★★★★★</div>
                  <div className="rc-text">Worth every Naira. Very comfortable and premium feel. Customer service was also very helpful when I called to confirm my order.</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
