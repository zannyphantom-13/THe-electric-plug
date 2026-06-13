import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { listenToCategories, listenToBrands, DEFAULT_CATEGORIES, DEFAULT_BRANDS } from '../../utils/catalogService';
import {
  ArrowLeft, Save, Image as ImageIcon, AlertCircle,
  Tag, DollarSign, Star, Upload, X, CheckCircle2, Sparkles, Infinity, Loader2, Package
} from 'lucide-react';
import { uploadImage } from '../../utils/cloudinaryService';

const TAGS = ['', 'Best Seller', 'New Arrival', 'Hot Deal', 'Top Rated', 'Trending', 'Clearance', 'Premium', 'Limited'];

function FieldGroup({ label, icon, accent = 'var(--primary)', children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: accent }}>
        {icon} {label}
      </label>
      {children}
      {hint && <p style={{ margin: 0, fontSize: '11px', color: 'var(--gray-2)' }}>{hint}</p>}
    </div>
  );
}

const inputStyle = {
  width: '100%', background: 'var(--dark)', border: '1.5px solid var(--dark-border)',
  borderRadius: 'var(--radius-sm)', padding: '11px 16px', fontSize: '14px',
  fontWeight: 500, color: 'var(--white)', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const [formData, setFormData] = useState({
    name: '', category: 'Smartphones', brand: '', description: '',
    price: '', originalPrice: '', badge: '', stock: 0,
    unlimited_stock: false, is_hidden: false, featured: false, featuredPosition: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [positionInput, setPositionInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Fetch catalogs
  useEffect(() => {
    const unsubCats = listenToCategories(list => setCategories(list.length ? list : DEFAULT_CATEGORIES));
    const unsubBrands = listenToBrands(list => setBrands(list.length ? list : DEFAULT_BRANDS));
    return () => { unsubCats(); unsubBrands(); };
  }, []);

  // Fetch existing product data if editing
  useEffect(() => {
    if (!isEditing) return;
    const fetchProduct = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'products', id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({ ...data, price: String(data.price || ''), originalPrice: String(data.originalPrice || ''), stock: String(data.stock || 0) });
          if (data.image || data.imgUrl || data.img) setImagePreview(data.image || data.imgUrl || data.img);
          if (data.featured) setPositionInput(String(data.featuredPosition || ''));
        } else {
          setError('Product not found.');
        }
      } catch (e) {
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, isEditing]);

  // Fetch featured products list
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), where('featured', '==', true));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.featuredPosition || 999) - (b.featuredPosition || 999));
        setFeaturedProducts(list);
      } catch {}
    };
    fetchFeatured();
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const processFile = file => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFeaturedToggle = () => {
    if (!formData.featured) {
      setPositionInput(String(featuredProducts.length + 1));
      setShowFeaturedModal(true);
    } else {
      setFormData(p => ({ ...p, featured: false, featuredPosition: '' }));
    }
  };

  const handleSetFeaturedPosition = () => {
    if (!positionInput || isNaN(positionInput)) { alert('Please enter a valid position.'); return; }
    setFormData(p => ({ ...p, featured: true, featuredPosition: positionInput }));
    setShowFeaturedModal(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      let imageUrl = formData.image || formData.imgUrl || formData.img || '';
      if (imageFile) imageUrl = await uploadImage(imageFile);
      if (!imageUrl && !isEditing) throw new Error('A product image is required.');

      const payload = {
        name: formData.name,
        brand: formData.brand || '',
        category: formData.category,
        description: formData.description || '',
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        badge: formData.badge || null,
        stock: formData.unlimited_stock ? 9999 : Number(formData.stock || 0),
        unlimited_stock: formData.unlimited_stock,
        is_hidden: formData.is_hidden,
        featured: formData.featured,
        featuredPosition: formData.featured ? (Number(positionInput) || 0) : null,
        image: imageUrl, imgUrl: imageUrl,
        rating: formData.rating || 5,
        reviews: formData.reviews || 0,
        updatedAt: new Date(),
      };

      if (isEditing) {
        await updateDoc(doc(db, 'products', id), payload);
      } else {
        const newRef = doc(collection(db, 'products'));
        payload.createdAt = new Date();
        payload.sales = 0;
        await setDoc(newRef, payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const hasDiscount = formData.originalPrice && formData.price && Number(formData.price) < Number(formData.originalPrice);
  const discountPct = hasDiscount ? Math.round(100 - (Number(formData.price) / Number(formData.originalPrice)) * 100) : 0;
  const currentImg = imagePreview;
  const stockOk = formData.unlimited_stock || Number(formData.stock || 0) > 0;

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px' }}>
      <Loader2 className="spinner" size={48} color="var(--primary)" style={{ margin: '0 auto' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '760px' }}>
      <Link to="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--gray-1)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', transition: 'var(--transition)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-1)'}
      >
        <ArrowLeft size={15} /> Back to Products
      </Link>

      {/* Card Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a0800, #2d1100)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Product Management</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-display)' }}>
            {isEditing ? '✏️ Edit Product' : '✨ Add New Product'}
          </h1>
        </div>
        {currentImg && (
          <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(255,94,0,0.3)', flexShrink: 0 }}>
            <img src={currentImg} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </div>

      {/* Form Card */}
      <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', padding: '32px' }}>
        {error && (
          <div style={{ background: 'rgba(255,61,0,0.08)', border: '1px solid rgba(255,61,0,0.3)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ff8066', fontWeight: 600, fontSize: '14px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* Name */}
          <FieldGroup label="Product Name" icon={<Tag size={14} />} accent="var(--primary)">
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. iPhone 15 Pro Max" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
          </FieldGroup>

          {/* Category / Brand / Badge */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <FieldGroup label="Category" icon={<Tag size={14} />} accent="#7c3aed">
              <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'}>
                <option value="" disabled>Select category...</option>
                {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Brand" icon={<Tag size={14} />} accent="#10b981">
              <select name="brand" value={formData.brand} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'}>
                <option value="" disabled>Select brand...</option>
                {brands.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Product Tag" icon={<Sparkles size={14} />} accent="#ec4899">
              <select name="badge" value={formData.badge || ''} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#ec4899'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'}>
                {TAGS.map(t => <option key={t} value={t}>{t || 'None'}</option>)}
              </select>
            </FieldGroup>
          </div>

          {/* Description */}
          <FieldGroup label="Description / Features" icon={<Sparkles size={14} />} accent="#8b5cf6">
            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Enter product features and specs…" style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = '#8b5cf6'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
          </FieldGroup>

          {/* Price / Original Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FieldGroup label="Selling Price (₦)" icon={<DollarSign size={14} />} accent="#1d4ed8">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-1)', fontWeight: 700, fontSize: '14px' }}>₦</span>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required placeholder="0" style={{ ...inputStyle, paddingLeft: '34px' }}
                  onFocus={e => e.target.style.borderColor = '#1d4ed8'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
              </div>
            </FieldGroup>
            <FieldGroup label="Original Price (₦) — for sale" icon={<DollarSign size={14} />} accent="var(--danger)" hint="Leave empty if no discount">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-1)', fontWeight: 700, fontSize: '14px' }}>₦</span>
                <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="0" style={{ ...inputStyle, paddingLeft: '34px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--danger)'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
                {hasDiscount && (
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'var(--danger)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '20px' }}>
                    -{discountPct}% OFF
                  </span>
                )}
              </div>
            </FieldGroup>
          </div>

          {/* Inventory & Visibility */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
            <FieldGroup label="Stock Qty" icon={<Tag size={14} />} accent="#059669">
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" disabled={formData.unlimited_stock} placeholder="0" style={{ ...inputStyle, opacity: formData.unlimited_stock ? 0.5 : 1 }}
                onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
            </FieldGroup>
            <FieldGroup label="Unlimited Stock" icon={<Infinity size={14} />} accent="#059669">
              <div style={{ display: 'flex', alignItems: 'center', height: '43px', paddingLeft: '12px', background: formData.unlimited_stock ? 'rgba(5,150,105,0.1)' : 'var(--dark)', border: `1.5px solid ${formData.unlimited_stock ? '#059669' : 'var(--dark-border)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} onClick={() => setFormData(p => ({ ...p, unlimited_stock: !p.unlimited_stock }))}>
                <input type="checkbox" name="unlimited_stock" checked={formData.unlimited_stock} onChange={handleChange} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#059669' }} />
                <span style={{ marginLeft: '8px', fontSize: '13px', fontWeight: 600, color: formData.unlimited_stock ? '#059669' : 'var(--gray-1)' }}>Unlimited</span>
              </div>
            </FieldGroup>
            <FieldGroup label="Stock Status" icon={<CheckCircle2 size={14} />} accent="#059669">
              <div style={{ display: 'flex', alignItems: 'center', height: '43px', paddingLeft: '12px', background: stockOk ? 'rgba(0,230,118,0.08)' : 'rgba(255,61,0,0.08)', border: `1.5px solid ${stockOk ? 'var(--success)' : 'var(--danger)'}`, borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 700, color: stockOk ? 'var(--success)' : 'var(--danger)' }}>
                {stockOk ? '✓ In Stock' : '✗ Out of Stock'}
              </div>
            </FieldGroup>
            <FieldGroup label="Visibility" icon={<AlertCircle size={14} />} accent="var(--danger)">
              <div style={{ display: 'flex', alignItems: 'center', height: '43px', paddingLeft: '12px', background: formData.is_hidden ? 'rgba(255,61,0,0.08)' : 'var(--dark)', border: `1.5px solid ${formData.is_hidden ? 'var(--danger)' : 'var(--dark-border)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} onClick={() => setFormData(p => ({ ...p, is_hidden: !p.is_hidden }))}>
                <input type="checkbox" name="is_hidden" checked={formData.is_hidden} onChange={handleChange} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--danger)' }} />
                <span style={{ marginLeft: '8px', fontSize: '13px', fontWeight: 600, color: formData.is_hidden ? 'var(--danger)' : 'var(--gray-1)' }}>Hide Product</span>
              </div>
            </FieldGroup>
          </div>

          {/* Image Upload */}
          <FieldGroup label="Product Image" icon={<ImageIcon size={14} />} accent="var(--warning)">
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              style={{ border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--dark-border)'}`, borderRadius: 'var(--radius-sm)', padding: currentImg ? '16px' : '40px', background: dragOver ? 'rgba(255,94,0,0.05)' : 'var(--dark)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: currentImg ? 'row' : 'column', alignItems: 'center', justifyContent: currentImg ? 'flex-start' : 'center', gap: '16px', position: 'relative' }}
            >
              {currentImg ? (
                <>
                  <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--dark-border)', flexShrink: 0 }}>
                    <img src={currentImg} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: 'var(--white)' }}>{imageFile ? imageFile.name : 'Current Image'}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--gray-1)' }}>Click or drop to replace</p>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); clearImage(); }} style={{ position: 'absolute', top: '10px', right: '10px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--danger)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={12} />
                  </button>
                </>
              ) : (
                <>
                  <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(255,94,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={24} color="var(--primary)" />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>Drop image here or <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>browse</span></p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--gray-1)' }}>PNG, JPG, WEBP up to 10MB · Hosted via Cloudinary</p>
                  </div>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={e => processFile(e.target.files[0])} style={{ display: 'none' }} />
          </FieldGroup>

          {/* Featured Toggle */}
          <div
            onClick={handleFeaturedToggle}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: `2px solid ${formData.featured ? 'rgba(255,206,30,0.4)' : 'var(--dark-border)'}`, background: formData.featured ? 'rgba(255,206,30,0.05)' : 'var(--dark)', transition: 'all 0.25s', userSelect: 'none' }}
          >
            <div style={{ width: '48px', height: '26px', borderRadius: '99px', background: formData.featured ? 'linear-gradient(135deg,#f59e0b,#fbbf24)' : 'var(--dark-border)', position: 'relative', transition: 'all 0.25s', flexShrink: 0, boxShadow: formData.featured ? '0 2px 8px rgba(245,158,11,0.4)' : 'none' }}>
              <div style={{ position: 'absolute', top: '3px', left: formData.featured ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '99px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', transition: 'left 0.25s' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
                <Star size={16} color={formData.featured ? 'var(--warning)' : 'var(--gray-2)'} fill={formData.featured ? 'currentColor' : 'none'} />
                Feature on Homepage
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--gray-1)' }}>This product will appear in the featured section</p>
            </div>
            {formData.featured && (
              <span style={{ background: 'var(--warning)', color: '#000', fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.08em', flexShrink: 0 }}>
                ⭐ FEATURED #{positionInput}
              </span>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={saving} style={{ width: '100%', padding: '16px', background: saving ? 'var(--dark-border)' : 'var(--primary)', color: saving ? 'var(--gray-1)' : 'var(--black)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: saving ? 'none' : '0 8px 24px var(--primary-glow)', transition: 'all 0.2s', marginTop: '8px' }}>
            {saving ? <><Loader2 className="spinner" size={18} /> Saving…</> : <><CheckCircle2 size={18} /> {isEditing ? 'Update Product' : 'Save Product'}</>}
          </button>
        </form>

        {/* Featured Modal */}
        {showFeaturedModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', padding: '28px', maxWidth: '380px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <h2 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 800 }}>Set Featured Position</h2>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--gray-1)' }}>
                Enter the position (1–12) where this product should appear in the featured section.
                {featuredProducts.length > 0 && <> Currently {featuredProducts.length} products are featured.</>}
              </p>
              <input type="number" min="1" max="12" value={positionInput} onChange={e => setPositionInput(e.target.value)} placeholder="e.g. 1" autoFocus
                style={{ ...inputStyle, marginBottom: '16px' }}
                onFocus={e => e.target.style.borderColor = 'var(--warning)'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowFeaturedModal(false)} style={{ flex: 1, padding: '12px', background: 'var(--dark)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 700, color: 'var(--gray-1)', transition: 'var(--transition)' }}>Cancel</button>
                <button onClick={handleSetFeaturedPosition} style={{ flex: 1, padding: '12px', background: 'var(--warning)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 700, color: '#000', transition: 'var(--transition)' }}>Set Position</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
