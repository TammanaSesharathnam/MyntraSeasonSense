import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart, Star, ShoppingBag, CloudSun, Percent, Gift, TrendingUp, ChevronRight, Zap } from 'lucide-react';

// Category metadata for UI display
const CATEGORY_META = {
  Men:    { title: "Men's Fashion",    subtitle: "Topwear, Bottomwear & Footwear for Men",     emoji: "👔", color: "#1d4ed8", bg: "#eff6ff" },
  Women:  { title: "Women's Fashion",  subtitle: "Dresses, Kurtas, Tops & more for Women",     emoji: "👗", color: "#be185d", bg: "#fdf2f8" },
  Kids:   { title: "Kids' Collection", subtitle: "Fun & Comfortable styles for little ones",   emoji: "🧒", color: "#15803d", bg: "#f0fdf4" },
  Beauty: { title: "Beauty & Accessories", subtitle: "Bags, Sunglasses, Jewellery & more",    emoji: "💄", color: "#7c3aed", bg: "#faf5ff" },
  GenZ:   { title: "GenZ Trends",      subtitle: "Streetwear, Athleisure & Viral styles",      emoji: "⚡", color: "#ea580c", bg: "#fff7ed" },
  Studio: { title: "Studio Collection","subtitle": "Formal, Office & Premium Workwear",        emoji: "🎨", color: "#0e7490", bg: "#ecfeff" },
};

const SEASONS = ['Monsoon', 'Winter', 'Summer', 'Spring'];

function buildApiUrl(selectedCategory, climateFilter) {
  const params = new URLSearchParams({ limit: 100 });
  if (climateFilter) params.set('category', climateFilter);
  if (selectedCategory) {
    const genderCats = ['Men', 'Women', 'Kids'];
    const styleCats  = ['Beauty', 'GenZ', 'Studio'];
    if (genderCats.includes(selectedCategory)) params.set('gender', selectedCategory);
    if (styleCats.includes(selectedCategory))  params.set('style', selectedCategory);
  }
  return `/api/products?${params.toString()}`;
}

export default function RecommendationsPage({
  weather, addToCart, setActiveTab, triggerPriceLock, setSelectedProductId,
  selectedCategory, setSelectedCategory
}) {
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [savingsMode, setSavingsMode]   = useState('B');
  const [climateFilter, setClimateFilter] = useState('');
  const [wishlist, setWishlist]         = useState({});
  const gridRef = useRef(null);

  // Fetch whenever category or climate filter changes
  useEffect(() => {
    setLoading(true);
    const effectiveClimate = climateFilter || (selectedCategory ? '' : weather?.season || 'Monsoon');
    fetch(buildApiUrl(selectedCategory, effectiveClimate))
      .then(r => r.json())
      .then(data => {
        setProducts(data || []);
        setSelectedProduct(data?.[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCategory, climateFilter, weather?.season]);

  const toggleWishlist = (id, e) => {
    e.stopPropagation();
    setWishlist(w => ({ ...w, [id]: !w[id] }));
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product);
    setActiveTab('checkout');
  };

  const handleSmartSavings = () => {
    if (!selectedProduct) return;
    if (savingsMode === 'A') {
      addToCart({ ...selectedProduct, price: Math.round(selectedProduct.price * 0.8), appliedDiscountType: 'instant_20' });
    } else {
      addToCart({ ...selectedProduct, appliedDiscountType: 'combo_offer' });
    }
    setActiveTab('checkout');
  };

  const meta = selectedCategory ? CATEGORY_META[selectedCategory] : null;
  const discount = p => Math.round((1 - p.price / (p.originalPrice || p.price * 1.3)) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 0 40px' }}>

      {/* ── Category Hero Banner ── */}
      {meta && (
        <div style={{
          background: `linear-gradient(135deg, ${meta.bg} 0%, #ffffff 100%)`,
          border: `1px solid ${meta.color}22`,
          borderRadius: 16,
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}>
          <span style={{ fontSize: '3rem' }}>{meta.emoji}</span>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#282c3f', margin: 0 }}>{meta.title}</h1>
            <p style={{ color: '#686b78', fontSize: '0.9rem', margin: '4px 0 12px' }}>{meta.subtitle}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SEASONS.map(s => (
                <button key={s}
                  onClick={() => setClimateFilter(climateFilter === s ? '' : s)}
                  style={{
                    padding: '4px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                    border: `1.5px solid ${climateFilter === s ? meta.color : '#d4d5d9'}`,
                    background: climateFilter === s ? meta.color : '#fff',
                    color: climateFilter === s ? '#fff' : '#282c3f',
                    transition: 'all .2s',
                  }}>{s}</button>
              ))}
              {climateFilter && (
                <button onClick={() => setClimateFilter('')}
                  style={{ padding: '4px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: '1.5px solid #eaeaec', background: '#fff', color: '#686b78' }}>
                  Clear ✕
                </button>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: meta.color }}>{products.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#686b78', fontWeight: 600 }}>Products Found</div>
          </div>
        </div>
      )}

      {/* ── Climate Filter (shown when no category selected) ── */}
      {!meta && (
        <div className="fashion-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, background: '#fff' }}>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#282c3f', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CloudSun size={18} color="#ff3f6c" /> Climate Zone:
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            {SEASONS.map(s => (
              <button key={s}
                onClick={() => setClimateFilter(climateFilter === s ? '' : s)}
                style={{
                  padding: '8px 20px', border: '1.5px solid', borderRadius: 999, cursor: 'pointer',
                  fontWeight: 700, fontFamily: 'inherit', fontSize: '0.8rem', transition: 'all .2s',
                  borderColor: (climateFilter || weather?.season) === s ? '#ff3f6c' : '#d4d5d9',
                  backgroundColor: (climateFilter || weather?.season) === s ? '#ff3f6c' : '#fafafa',
                  color: (climateFilter || weather?.season) === s ? '#fff' : '#282c3f',
                }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Grid + Smart Savings Panel ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* LEFT: Product Grid */}
        <div ref={gridRef}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#282c3f', marginBottom: 16 }}>
            {meta ? `${meta.title} — All Items` : `Climate-Optimized Matches`} ({products.length})
          </h3>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ background: '#f5f5f6', borderRadius: 12, height: 320, animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 16, border: '1px solid #eaeaec' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🛍️</div>
              <h3 style={{ color: '#282c3f', fontWeight: 700 }}>No products found</h3>
              <p style={{ color: '#686b78', fontSize: '0.85rem', marginTop: 6 }}>
                Try a different season filter or category.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {products.map(p => {
                const disc = discount(p);
                const isSelected = selectedProduct?.id === p.id;
                const isWishlisted = wishlist[p.id];
                return (
                  <div key={p.id}
                    className="fashion-card"
                    style={{
                      cursor: 'pointer', background: '#fff',
                      border: isSelected ? '2px solid #ff3f6c' : '1px solid #eaeaec',
                      borderRadius: 12, overflow: 'hidden', transition: 'all .25s',
                    }}
                    onClick={() => { setSelectedProduct(p); setSelectedProductId(p.id); }}>

                    {/* Image */}
                    <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
                      <img src={p.image} alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                      {/* Discount badge */}
                      {disc > 0 && (
                        <div style={{ position: 'absolute', top: 10, left: 10, background: '#ff3f6c', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>
                          {disc}% OFF
                        </div>
                      )}
                      {/* Wishlist */}
                      <button onClick={e => toggleWishlist(p.id, e)}
                        style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,.9)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Heart size={14} fill={isWishlisted ? '#ff3f6c' : 'none'} color={isWishlisted ? '#ff3f6c' : '#686b78'} />
                      </button>
                      {/* AI badge */}
                      <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,.95)', border: '1px solid #7c3aed', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', fontWeight: 700, color: '#7c3aed' }}>
                        <Sparkles size={10} /> AI Match
                      </div>
                      {/* Category chip */}
                      <div style={{ position: 'absolute', bottom: 10, right: 10, background: '#282c3f', color: '#fff', borderRadius: 4, padding: '3px 8px', fontSize: '0.65rem', fontWeight: 700 }}>
                        {p.category}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#282c3f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.brand}</div>
                      <div style={{ fontSize: '0.82rem', color: '#686b78', marginTop: 2, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>

                      {/* Rating */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <span style={{ background: '#14804a', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Star size={8} fill="#fff" /> {p.rating || '4.2'}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: '#94969f' }}>({p.reviews || 120})</span>
                      </div>

                      {/* Price */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#282c3f' }}>₹{p.price}</span>
                        <span style={{ fontSize: '0.78rem', color: '#94969f', textDecoration: 'line-through' }}>₹{p.originalPrice || Math.round(p.price * 1.3)}</span>
                        <span style={{ fontSize: '0.75rem', color: '#ff9f00', fontWeight: 700 }}>{disc}% OFF</span>
                      </div>

                      {/* Season tag */}
                      <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                        <span style={{ fontSize: '0.62rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                          {p.season}
                        </span>
                        <span style={{ fontSize: '0.62rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                          {p.gender}
                        </span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, marginTop: 12 }}>
                        <button className="btn-fashion-primary"
                          style={{ fontSize: '0.72rem', padding: '9px 8px' }}
                          onClick={e => { e.stopPropagation(); setSelectedProductId(p.id); setActiveTab('product-detail'); }}>
                          View Details
                        </button>
                        <button
                          style={{ fontSize: '0.72rem', padding: '9px 8px', background: '#fff', border: '1.5px solid #eaeaec', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontWeight: 700, color: '#686b78', transition: 'all .2s' }}
                          onClick={e => handleAddToCart(p, e)}
                          title="Add to Bag">
                          <ShoppingBag size={13} /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Smart Savings Panel */}
        {selectedProduct && (
          <div className="fashion-card" style={{ padding: 24, background: '#fff', position: 'sticky', top: 104 }}>
            <div style={{ borderBottom: '1px solid #f5f5f6', paddingBottom: 14, marginBottom: 20 }}>
              <span style={{ background: '#7c3aed', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: 999 }}>USP FEATURE</span>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#282c3f', marginTop: 8 }}>Smart Choice Savings</h2>
              <p style={{ fontSize: '0.8rem', color: '#686b78', marginTop: 4 }}>
                Best deal for <b style={{ color: '#282c3f' }}>{selectedProduct.name?.slice(0, 40)}…</b>
              </p>
            </div>

            {/* Selected product preview */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, padding: 12, background: '#fafafa', borderRadius: 10, border: '1px solid #eaeaec' }}>
              <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: 56, height: 68, objectFit: 'cover', borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ff3f6c', textTransform: 'uppercase' }}>{selectedProduct.brand}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#282c3f', marginTop: 2 }}>{selectedProduct.name?.slice(0, 50)}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 800, color: '#282c3f' }}>₹{selectedProduct.price}</span>
                  <span style={{ fontSize: '0.72rem', textDecoration: 'line-through', color: '#94969f' }}>₹{selectedProduct.originalPrice}</span>
                </div>
              </div>
            </div>

            {/* Option A */}
            <div onClick={() => setSavingsMode('A')}
              style={{ border: `2px solid ${savingsMode === 'A' ? '#ff3f6c' : '#d4d5d9'}`, borderRadius: 12, padding: 16, cursor: 'pointer', marginBottom: 12, transition: 'all .2s', background: savingsMode === 'A' ? 'rgba(255,63,108,0.02)' : '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Percent size={16} color="#ff3f6c" />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#282c3f' }}>Option A — 20% Instant Discount</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ff3f6c' }}>₹{Math.round(selectedProduct.price * 0.8)}</span>
                <span style={{ fontSize: '0.78rem', textDecoration: 'line-through', color: '#94969f' }}>₹{selectedProduct.price}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981' }}>Save ₹{selectedProduct.price - Math.round(selectedProduct.price * 0.8)}</span>
              </div>
            </div>

            {/* Option B */}
            <div onClick={() => setSavingsMode('B')}
              style={{ border: `2px solid ${savingsMode === 'B' ? '#7c3aed' : '#d4d5d9'}`, borderRadius: 12, padding: 16, cursor: 'pointer', marginBottom: 12, position: 'relative', transition: 'all .2s', background: savingsMode === 'B' ? 'rgba(124,58,237,0.02)' : '#fff' }}>
              <div style={{ position: 'absolute', top: -9, right: 12, background: '#7c3aed', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>AI RECOMMENDED</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Gift size={16} color="#7c3aed" />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#7c3aed' }}>Option B — Weather Combo Offer</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#686b78', marginBottom: 8 }}>Bundle with matching {selectedProduct.category === 'Topwear' ? 'Bottomwear' : 'Topwear'} for extra savings</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7c3aed' }}>₹{Math.round(selectedProduct.price * 0.85)}</span>
                <span style={{ fontSize: '0.78rem', textDecoration: 'line-through', color: '#94969f' }}>₹{selectedProduct.price}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981' }}>Save ₹{selectedProduct.price - Math.round(selectedProduct.price * 0.85)}</span>
              </div>
            </div>

            {/* Option C */}
            <div onClick={() => setSavingsMode('C')}
              style={{ border: `2px solid ${savingsMode === 'C' ? '#ea580c' : '#d4d5d9'}`, borderRadius: 12, padding: 16, cursor: 'pointer', marginBottom: 20, transition: 'all .2s', background: savingsMode === 'C' ? 'rgba(234,88,12,0.02)' : '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Zap size={16} color="#ea580c" />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ea580c' }}>Option C — Premium AI Bundle</span>
                <span style={{ marginLeft: 'auto', background: '#fff7ed', color: '#ea580c', fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, border: '1px solid #fed7aa' }}>95% MATCH</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#686b78', marginBottom: 8 }}>Complete outfit: Top + Bottom + Footwear</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ea580c' }}>₹{Math.round(selectedProduct.price * 0.75)}</span>
                <span style={{ fontSize: '0.78rem', textDecoration: 'line-through', color: '#94969f' }}>₹{selectedProduct.price}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981' }}>Save ₹{selectedProduct.price - Math.round(selectedProduct.price * 0.75)}</span>
              </div>
            </div>

            {/* Value meter */}
            <div style={{ background: '#fafafa', border: '1px solid #eaeaec', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <TrendingUp size={14} color="#ff3f6c" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ff3f6c', letterSpacing: '0.5px' }}>SAVINGS VALUE METER</span>
              </div>
              <div style={{ height: 6, background: '#eaeaec', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', borderRadius: 999, transition: 'width .4s', width: savingsMode === 'C' ? '95%' : savingsMode === 'B' ? '75%' : '48%', background: savingsMode === 'C' ? 'linear-gradient(90deg,#ea580c,#ff3f6c)' : savingsMode === 'B' ? 'linear-gradient(90deg,#ff3f6c,#7c3aed)' : '#ff3f6c' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#686b78', fontWeight: 700 }}>
                <span>Net Save: ₹{savingsMode === 'C' ? selectedProduct.price - Math.round(selectedProduct.price * 0.75) : savingsMode === 'B' ? selectedProduct.price - Math.round(selectedProduct.price * 0.85) : selectedProduct.price - Math.round(selectedProduct.price * 0.8)}</span>
                <span>Score: {savingsMode === 'C' ? '9.5' : savingsMode === 'B' ? '7.5' : '4.8'} / 10</span>
              </div>
            </div>

            <button className="btn-fashion-primary" style={{ width: '100%', padding: 14 }} onClick={handleSmartSavings}>
              Choose Option {savingsMode} &amp; Checkout <ChevronRight size={16} />
            </button>

            <button
              style={{ width: '100%', marginTop: 10, padding: '10px', background: '#fff', border: '1.5px solid #eaeaec', borderRadius: 8, cursor: 'pointer', fontWeight: 700, color: '#686b78', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              onClick={e => { e.stopPropagation(); triggerPriceLock(selectedProduct.id); }}>
              <Heart size={14} color="#ff3f6c" /> Lock Price Instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
