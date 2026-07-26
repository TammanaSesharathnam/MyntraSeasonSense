import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  Heart, 
  ArrowLeft, 
  Shield, 
  Truck, 
  RotateCcw, 
  Info, 
  Percent, 
  Gift, 
  Zap, 
  TrendingUp, 
  Star, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { catalogService, recommendationService, utilityService } from '../services/api';

export default function ProductDetailPage({ productId, onBack, addToCart, setActiveTab, location }) {
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const [savingsMode, setSavingsMode] = useState('B'); // A, B, or C

  // Accordion state
  const [openSection, setOpenSection] = useState('description');

  // Fetch product data on load/change
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError('');

    catalogService.getProductDetails(productId)
      .then(data => {
        setProduct(data);
        setSelectedColor(data.color || 'Standard');
        return catalogService.getSimilarProducts(productId);
      })
      .then(simData => {
        setSimilar(simData || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching product detail:', err);
        setError('Failed to load product details.');
        setLoading(false);
      });
  }, [productId]);

  // Gallery images list (generating realistic alternate angles for presentation quality)
  const getGalleryImages = () => {
    if (!product) return [];
    return [
      product.image,
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80"
    ];
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${getGalleryImages()[activeImageIdx]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  const handleAddSingleToCart = () => {
    if (!product) return;
    addToCart({
      ...product,
      selectedSize,
      selectedColor
    });
    setSuccessMsg('Successfully added to your shopping bag!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddBundleToCart = () => {
    if (!product || !product.combo) return;
    
    // Add main product
    addToCart({
      ...product,
      selectedSize,
      selectedColor,
      appliedDiscountType: 'combo_offer'
    });

    // Add companion product
    addToCart({
      id: `companion-${Date.now()}`,
      name: product.combo.companionName,
      brand: product.brand,
      price: product.combo.companionPrice,
      originalPrice: Math.round(product.combo.companionPrice * 1.3),
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&q=80',
      category: product.category,
      appliedDiscountType: 'combo_offer'
    });

    setSuccessMsg('AI Smart Combo successfully added!');
    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('checkout');
    }, 1500);
  };

  const handleSmartSavingsAdd = () => {
    if (savingsMode === 'A') {
      addToCart({
        ...product,
        price: Math.round(product.price * 0.8),
        name: `${product.name} (20% Off)`,
        appliedDiscountType: 'instant_20'
      });
      setActiveTab('checkout');
    } else if (savingsMode === 'B') {
      handleAddBundleToCart();
    } else if (savingsMode === 'C') {
      // Option C Premium Bundle (includes 3 items: Outfit, Shoes, Accessories)
      addToCart({
        ...product,
        price: Math.round(product.price * 0.75),
        name: `${product.name} (Premium Bundle)`,
        appliedDiscountType: 'combo_offer'
      });
      addToCart({
        id: `companion-shoes-${Date.now()}`,
        name: 'Myntra Smart Running Shoes',
        brand: 'Myntra AI Studio',
        price: 1999,
        originalPrice: 2999,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
        category: 'Footwear',
        appliedDiscountType: 'combo_offer'
      });
      setSuccessMsg('Premium AI Bundle successfully added!');
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('checkout');
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-[#FF3F6C] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-[#282C3F] tracking-wide">Syncing catalog details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 bg-white rounded-2xl shadow-sm border border-[#EAEAEC] p-8">
        <Info size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-[#282C3F] mb-2">Something went wrong</h2>
        <p className="text-sm text-[#686B78] mb-6">{error || 'Product not found.'}</p>
        <button onClick={onBack} className="btn-fashion-primary">Back to Catalog</button>
      </div>
    );
  }

  const discountPercent = Math.round((1 - product.price / product.originalPrice) * 100);
  const gallery = getGalleryImages();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Back button */}
      <button 
        onClick={onBack} 
        className="group flex items-center gap-2 text-sm font-bold text-[#686B78] hover:text-[#FF3F6C] transition-colors"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Catalog
      </button>

      {/* Main product view split columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* LEFT COLUMN: Gallery & Thumbnails */}
        <div className="space-y-6">
          <div 
            className="relative overflow-hidden bg-white border border-[#EAEAEC] rounded-2xl aspect-[3/4] cursor-zoom-in group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={gallery[activeImageIdx]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-300"
            />
            {/* AI Confidence Badge */}
            {product.aiConfidence && (
              <span className="absolute top-4 left-4 bg-white/95 border border-[#7C3AED]/20 text-[#7C3AED] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <Sparkles size={12} className="fill-[#7C3AED]/10" /> {product.aiConfidence}% Climate Match
              </span>
            )}
            {/* Magnifier Glass overlay */}
            <div 
              style={zoomStyle} 
              className="absolute inset-0 pointer-events-none bg-no-repeat bg-white transition-opacity duration-200"
            />
          </div>

          {/* Gallery Thumbnails */}
          <div className="grid grid-cols-4 gap-4">
            {gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`aspect-[3/4] overflow-hidden rounded-xl border-2 transition-all ${
                  activeImageIdx === idx ? 'border-[#FF3F6C]' : 'border-transparent hover:border-[#EAEAEC]'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Product Detail Info */}
        <div className="space-y-8">
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-widest text-[#FF3F6C]">{product.brand}</h4>
            <h1 className="text-2xl font-extrabold text-[#282C3F] mt-2 leading-tight">{product.name}</h1>
            
            {/* Reviews / Star ratings */}
            <div className="flex items-center gap-4 mt-4">
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
                ★ {product.rating}
              </span>
              <span className="text-xs text-[#686B78] font-semibold">| &nbsp;&nbsp;{product.reviews} customer reviews</span>
              <span className="text-xs text-[#686B78] bg-slate-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{product.season} Wear</span>
            </div>
          </div>

          <hr className="border-[#EAEAEC]" />

          {/* Pricing Info */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-extrabold text-[#282C3F]">₹{product.price}</span>
              <span className="text-lg text-[#686B78] line-through font-medium">₹{product.originalPrice}</span>
              <span className="text-lg text-orange-500 font-extrabold">({discountPercent}% OFF)</span>
            </div>
            <p className="text-xs text-green-600 font-bold">Inclusive of all taxes</p>
          </div>

          {/* Selectors */}
          <div className="space-y-6">
            {/* Size Selector */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#282C3F]">Select Size</span>
                <button className="text-xs font-bold text-[#FF3F6C] hover:underline">Size Chart</button>
              </div>
              <div className="flex gap-3">
                {['S', 'M', 'L', 'XL'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-full border-2 font-bold text-xs flex items-center justify-center transition-all ${
                      selectedSize === size 
                        ? 'border-[#FF3F6C] text-[#FF3F6C] bg-[#FF3F6C]/5' 
                        : 'border-[#EAEAEC] text-[#282C3F] hover:border-[#282C3F]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selector */}
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#282C3F] block mb-3">Selected Color</span>
              <span className="inline-block text-xs font-bold capitalize px-4 py-2 bg-slate-50 border border-[#EAEAEC] rounded-full text-[#282C3F]">
                {selectedColor}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <button 
                onClick={handleAddSingleToCart}
                className="flex-1 bg-gradient-to-r from-[#FF3F6C] to-[#ff527b] text-white font-extrabold text-sm py-4 rounded-xl shadow-lg hover:shadow-[#FF3F6C]/25 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                <ShoppingBag size={18} /> Add to Bag
              </button>
              <button className="border-2 border-[#EAEAEC] hover:border-[#FF3F6C] hover:text-[#FF3F6C] text-[#686B78] rounded-xl px-5 transition-all flex items-center justify-center">
                <Heart size={20} />
              </button>
            </div>

            {successMsg && (
              <p className="text-xs text-center text-emerald-600 bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl font-bold animate-pulse">
                {successMsg}
              </p>
            )}
          </div>

          {/* Delivery Card */}
          <div className="bg-slate-50 border border-[#EAEAEC] rounded-2xl p-6 space-y-4 text-xs font-semibold text-[#686B78]">
            <div className="flex items-center gap-3">
              <Truck size={18} className="text-[#282C3F]" />
              <p>Estimated Delivery: <span className="font-bold text-[#282C3F]">Within 2-4 business days</span></p>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw size={18} className="text-[#282C3F]" />
              <p>Returns: <span className="font-bold text-[#282C3F]">Easy 15-day return policy</span></p>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-[#282C3F]" />
              <p>AI Protection: <span className="font-bold text-[#282C3F]">Price protection &amp; climate advisory coverage</span></p>
            </div>
          </div>

          {/* Product Details Accordion */}
          <div className="border border-[#EAEAEC] rounded-2xl divide-y divide-[#EAEAEC] overflow-hidden bg-white">
            {/* Description */}
            <div>
              <button 
                onClick={() => setOpenSection(openSection === 'description' ? '' : 'description')}
                className="w-full px-6 py-4 flex justify-between items-center font-bold text-xs uppercase tracking-wider text-[#282C3F]"
              >
                Product Specifications
                {openSection === 'description' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openSection === 'description' && (
                <div className="px-6 pb-5 text-sm text-[#686B78] space-y-3 leading-relaxed">
                  <p>{product.description || 'Premium wardrobe addition sourced carefully for custom seasonal styling matches.'}</p>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#94969F] block">Material</span>
                      <span className="font-semibold text-[#282C3F]">{product.material || 'Premium Cotton Blend'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#94969F] block">Category</span>
                      <span className="font-semibold text-[#282C3F]">{product.category}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sustainability */}
            <div>
              <button 
                onClick={() => setOpenSection(openSection === 'sustainability' ? '' : 'sustainability')}
                className="w-full px-6 py-4 flex justify-between items-center font-bold text-xs uppercase tracking-wider text-[#282C3F]"
              >
                Sustainability &amp; Care
                {openSection === 'sustainability' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openSection === 'sustainability' && (
                <div className="px-6 pb-5 text-sm text-[#686B78] leading-relaxed">
                  <p>Guaranteed sustainable sourcing. Machine wash warm with similar colors. Line dry inside out.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* CHOOSE YOUR SMART SAVINGS */}
      <div className="bg-white border border-[#EAEAEC] rounded-2xl p-8 space-y-6">
        <div className="border-b border-[#EAEAEC] pb-4">
          <div className="flex items-center gap-2 text-[#7C3AED]">
            <Sparkles size={20} className="fill-[#7C3AED]/10" />
            <h3 className="text-lg font-extrabold text-[#282C3F]">Compare Smart Savings Options</h3>
          </div>
          <p className="text-xs text-[#686B78] mt-1">
            We use real-time climate data for {location} to propose bundled savings strategies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card A: 20% Off */}
          <div 
            onClick={() => setSavingsMode('A')}
            className={`border-2 rounded-2xl p-6 cursor-pointer transition-all flex flex-col justify-between ${
              savingsMode === 'A' 
                ? 'border-[#FF3F6C] bg-[#FF3F6C]/[0.01]' 
                : 'border-[#EAEAEC] hover:border-[#686B78]'
            }`}
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Percent size={18} className="text-[#FF3F6C]" />
                  <h4 className="font-extrabold text-[#282C3F] text-sm">Option A: Direct Save</h4>
                </div>
                <span className="bg-orange-50 text-orange-600 font-extrabold px-2 py-0.5 rounded text-[10px] border border-orange-100 uppercase tracking-wide">
                  PROMO
                </span>
              </div>
              <p className="text-xs text-[#686B78] mb-6 leading-relaxed">
                Order this single item with an instant 20% coupon discount applied at checkout.
              </p>
            </div>
            <div className="space-y-1 mt-auto pt-4 border-t border-[#F5F5F6]">
              <p className="text-[11px] text-[#686B78] line-through font-medium">Original: ₹{product.originalPrice}</p>
              <p className="text-base font-extrabold text-[#FF3F6C]">Discounted: ₹{Math.round(product.price * 0.8)}</p>
            </div>
          </div>

          {/* Card B: AI Combo Offer */}
          {product.combo ? (
            <div 
              onClick={() => setSavingsMode('B')}
              className={`border-2 rounded-2xl p-6 cursor-pointer transition-all flex flex-col justify-between ${
                savingsMode === 'B' 
                  ? 'border-[#7C3AED] bg-[#7C3AED]/[0.01]' 
                  : 'border-[#EAEAEC] hover:border-[#686B78]'
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Gift size={18} className="text-[#7C3AED]" />
                    <h4 className="font-extrabold text-[#282C3F] text-sm">Option B: Smart Combo</h4>
                  </div>
                  <span className="bg-[#7C3AED] text-white font-extrabold px-2.5 py-0.5 rounded text-[10px] tracking-wider uppercase">
                    AI RECOMMENDED
                  </span>
                </div>
                <p className="text-xs text-[#686B78] mb-4 leading-relaxed">
                  Weather bundle matching <span className="font-bold text-[#282C3F]">{product.combo.companionName}</span> for full-fit climate protection.
                </p>
              </div>
              <div className="space-y-1 mt-auto pt-4 border-t border-[#F5F5F6]">
                <p className="text-[11px] text-[#686B78] line-through font-medium">Combined Total: ₹{product.price + product.combo.companionPrice}</p>
                <p className="text-base font-extrabold text-[#7C3AED]">Bundle: ₹{product.combo.bundlePrice}</p>
              </div>
            </div>
          ) : (
            <div className="border border-[#EAEAEC] bg-slate-50/50 rounded-2xl p-6 flex flex-col justify-center items-center text-center min-h-[180px]">
              <Info size={22} className="text-[#94969F] mb-2" />
              <p className="text-xs font-bold text-[#282C3F]">No Active Combo</p>
              <p className="text-[10px] text-[#686B78] mt-1 px-4 leading-normal">Our models compile custom pairings dynamically. Check back later.</p>
            </div>
          )}

          {/* Card C: Premium AI Bundle */}
          <div 
            onClick={() => setSavingsMode('C')}
            className={`border-2 rounded-2xl p-6 cursor-pointer transition-all flex flex-col justify-between ${
              savingsMode === 'C' 
                ? 'border-emerald-600 bg-emerald-500/[0.01]' 
                : 'border-[#EAEAEC] hover:border-[#686B78]'
            }`}
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-emerald-600" />
                  <h4 className="font-extrabold text-[#282C3F] text-sm">Option C: Premium Outfit</h4>
                </div>
                <span className="bg-emerald-50 text-emerald-600 font-extrabold px-2 py-0.5 rounded text-[10px] border border-emerald-100 uppercase tracking-wide">
                  95% Match
                </span>
              </div>
              <p className="text-xs text-[#686B78] mb-6 leading-relaxed">
                Complete multi-item wardrobe set including curated smart-fit running shoes.
              </p>
            </div>
            <div className="space-y-1 mt-auto pt-4 border-t border-[#F5F5F6]">
              <p className="text-[11px] text-[#686B78] line-through font-medium">Standard Total: ₹{product.price + 2999}</p>
              <p className="text-base font-extrabold text-emerald-600">Bundle: ₹{Math.round(product.price * 0.75) + 1999}</p>
            </div>
          </div>
        </div>

        {/* Combo Value Meter & CTA */}
        <div className="bg-slate-50 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between border border-[#EAEAEC]">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <TrendingUp size={24} className="text-[#FF3F6C] shrink-0" />
            <div className="space-y-1 w-full">
              <div className="flex justify-between text-xs font-extrabold text-[#282C3F]">
                <span>Savings Value Meter</span>
                <span>{savingsMode === 'C' ? '9.5/10' : savingsMode === 'B' ? '8.8/10' : '5.2/10'}</span>
              </div>
              <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    savingsMode === 'C' ? 'bg-emerald-600 w-[95%]' : savingsMode === 'B' ? 'bg-[#7C3AED] w-[88%]' : 'bg-[#FF3F6C] w-[52%]'
                  }`} 
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleSmartSavingsAdd}
            className="w-full md:w-auto bg-[#282C3F] hover:bg-[#282C3F]/90 text-white font-extrabold text-xs py-3.5 px-8 rounded-xl tracking-wider uppercase transition-all"
          >
            Apply Option {savingsMode} &amp; Checkout
          </button>
        </div>
      </div>

      {/* SIMILAR PRODUCTS */}
      <div className="space-y-6">
        <h3 className="text-lg font-extrabold text-[#282C3F] flex items-center gap-2">
          <Sparkles size={20} className="text-[#7C3AED]" /> Complete the Look Recommendations
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
          {similar.map(item => {
            const pct = Math.round((1 - item.price / item.originalPrice) * 100);
            return (
              <div 
                key={item.id} 
                className="bg-white border border-[#EAEAEC] rounded-2xl overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                onClick={() => {
                  setProduct(item);
                  setSelectedColor(item.color || 'Standard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="aspect-[3/4] overflow-hidden bg-slate-50 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute top-2 right-2 bg-white/95 border border-[#EAEAEC] rounded-full p-1.5 shadow-sm">
                    <Heart size={12} className="text-[#686B78]" />
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#686B78]">{item.brand}</span>
                  <h4 className="text-xs font-semibold text-[#282C3F] truncate">{item.name}</h4>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xs font-extrabold text-[#282C3F]">₹{item.price}</span>
                    <span className="text-[10px] text-[#94969F] line-through font-medium">₹{item.originalPrice}</span>
                    <span className="text-[10px] text-orange-500 font-bold">({pct}% OFF)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
