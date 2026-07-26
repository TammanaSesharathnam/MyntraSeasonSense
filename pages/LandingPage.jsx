import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ShieldCheck, ArrowRight, TrendingUp, CloudRain, ShoppingBag } from 'lucide-react';

const CATEGORIES = [
  { name: 'Western Wear', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', tag: 'Up to 50% Off' },
  { name: 'Casual Wear', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80', tag: 'New Arrivals' },
  { name: 'Ethnic Wear', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80', tag: 'Festive Special' },
  { name: 'Sports Wear', image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=400&q=80', tag: 'Flat 30% Off' },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&q=80', tag: 'Min 40% Off' },
  { name: 'Footwear', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', tag: 'Top Brands' }
];

export default function LandingPage({ setActiveTab, setLocation }) {
  const [campaigns, setCampaigns] = useState([]);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    // Fetch campaigns
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => setCampaigns(data))
      .catch(err => console.error('Error fetching campaigns:', err));

    // Fetch trending preview products (first 3)
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setTrending(data.slice(0, 3)))
      .catch(err => console.error('Error fetching trending products:', err));
  }, []);

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* 1. Large Hero Promotion Banner */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badgeRow}>
            <span className="fashion-badge">AI CLIMATE ADVISORY</span>
            <span className="fashion-badge badge-purple">PRE-SEASON VALUE</span>
          </div>
          <h1 style={styles.heroTitle}>
            Align Your Fashion With <br />
            <span style={styles.gradientText}>Weather Dynamics</span>
          </h1>
          <p style={styles.heroSub}>
            Beat climate shifts and seasonal demand surges. Our predictive algorithms secure current prices and curate weather-ready wardrobes before early monsoons or sudden winter waves hit.
          </p>
          <button 
            className="btn-fashion-primary"
            onClick={() => setActiveTab('prediction')}
          >
            Check Wardrobe Readiness <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 2. active Pre-season Campaign grids */}
      <section style={styles.section}>
        <h3 style={styles.sectionHeader}><TrendingUp size={20} color="#ff3f6c" /> Pre-Season Campaigns</h3>
        <div style={styles.campaignGrid}>
          {campaigns.map(camp => (
            <div 
              key={camp.id} 
              style={{ ...styles.campCard, background: camp.bgGradient }}
            >
              <div>
                <span style={styles.campBadge}>Hot Deal</span>
                <h4 style={styles.campTitle}>{camp.title}</h4>
                <p style={styles.campSub}>{camp.subtitle}</p>
              </div>
              <div style={styles.campFooter}>
                <span style={styles.campDiscount}>{camp.discount}</span>
                <button 
                  className="btn-fashion-secondary" 
                  style={styles.campBtn}
                  onClick={() => {
                    if (camp.title.toLowerCase().includes('monsoon')) {
                      setLocation('Mumbai');
                    } else {
                      setLocation('Delhi');
                    }
                    setActiveTab('recommendation');
                  }}
                >
                  Explore <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Category Showcase Section */}
      <section style={styles.section}>
        <h3 style={styles.sectionHeader}><ShoppingBag size={20} color="#ff3f6c" /> Shop By Category</h3>
        <div style={styles.categoryGrid}>
          {CATEGORIES.map((cat, idx) => (
            <div 
              key={idx} 
              style={styles.catCard} 
              className="fashion-card"
              onClick={() => setActiveTab('recommendation')}
            >
              <div style={styles.catImgContainer}>
                <img src={cat.image} alt={cat.name} style={styles.catImg} />
                <div style={styles.catOverlay} />
              </div>
              <div style={styles.catInfo}>
                <h4 style={styles.catName}>{cat.name}</h4>
                <span style={styles.catTag}>{cat.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Trending Products / AI Matches */}
      <section style={styles.section}>
        <h3 style={styles.sectionHeader}><Sparkles size={20} color="#ff3f6c" /> Trending AI Matches</h3>
        <div style={styles.productGrid}>
          {trending.map(product => (
            <div key={product.id} className="fashion-card" style={styles.productCard}>
              <div style={styles.imgContainer}>
                <img src={product.image} alt={product.name} style={styles.productImg} />
                <span style={styles.confidenceBadge}>{product.aiConfidence}% AI Compatibility</span>
              </div>
              <div style={styles.productBody}>
                <span style={styles.brand}>{product.brand}</span>
                <h4 style={styles.prodName}>{product.name}</h4>
                <div style={styles.priceRow}>
                  <span style={styles.price}>₹{product.price}</span>
                  <span style={styles.oldPrice}>₹{product.originalPrice}</span>
                  <span style={styles.pctOff}>({Math.round((1 - product.price/product.originalPrice)*100)}% OFF)</span>
                </div>
                <button 
                  className="btn-fashion-outline" 
                  style={styles.matchBtn}
                  onClick={() => setActiveTab('recommendation')}
                >
                  View Smart Savings
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Premium Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <div style={styles.footerCol}>
            <h5 style={styles.footerTitle}>ONLINE SHOPPING</h5>
            <span style={styles.footerLink}>Men</span>
            <span style={styles.footerLink}>Women</span>
            <span style={styles.footerLink}>Kids</span>
            <span style={styles.footerLink}>Home & Living</span>
            <span style={styles.footerLink}>Beauty</span>
          </div>
          <div style={styles.footerCol}>
            <h5 style={styles.footerTitle}>CUSTOMER POLICIES</h5>
            <span style={styles.footerLink}>Contact Us</span>
            <span style={styles.footerLink}>FAQ</span>
            <span style={styles.footerLink}>T&C</span>
            <span style={styles.footerLink}>Terms Of Use</span>
            <span style={styles.footerLink}>Track Orders</span>
          </div>
          <div style={styles.footerCol}>
            <h5 style={styles.footerTitle}>EXPERIENCE MYNTRA APP</h5>
            <p style={styles.footerText}>
              Enjoy real-time climate-optimized personal styling recommendations powered by Myntra AI.
            </p>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>© 2026 Myntra AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '48px',
  },
  hero: {
    padding: '64px 32px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(255, 63, 108, 0.04) 0%, rgba(124, 58, 237, 0.04) 100%)',
    borderRadius: '16px',
    border: '1px solid #f5f5f6'
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  badgeRow: {
    display: 'flex',
    gap: '12px'
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#282c3f',
    lineHeight: '1.2',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #ff3f6c 0%, #7c3aed 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: '0.95rem',
    color: '#686b78',
    lineHeight: '1.65',
    maxWidth: '650px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionHeader: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#282c3f',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid #f5f5f6',
    paddingBottom: '12px'
  },
  campaignGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  campCard: {
    padding: '32px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '220px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
  },
  campBadge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: '#ff3f6c',
    backgroundColor: '#ffffff',
    padding: '3px 10px',
    borderRadius: '999px',
    textTransform: 'uppercase',
    display: 'inline-block'
  },
  campTitle: {
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#ffffff',
    marginTop: '16px',
  },
  campSub: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.9)',
    marginTop: '6px',
  },
  campFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
  },
  campDiscount: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  campBtn: {
    padding: '8px 16px',
    fontSize: '0.75rem',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '16px',
  },
  catCard: {
    cursor: 'pointer',
    position: 'relative',
    height: '220px',
    display: 'flex',
    flexDirection: 'column',
  },
  catImgContainer: {
    height: '150px',
    position: 'relative',
    overflow: 'hidden'
  },
  catImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease'
  },
  catOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, transparent 50%, rgba(40,44,63,0.3) 100%)'
  },
  catInfo: {
    padding: '12px',
    textAlign: 'center',
    backgroundColor: '#ffffff'
  },
  catName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#282c3f',
  },
  catTag: {
    fontSize: '0.7rem',
    color: '#ff3f6c',
    fontWeight: '700',
    marginTop: '2px',
    display: 'block'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  productCard: {
    overflow: 'hidden',
  },
  imgContainer: {
    position: 'relative',
    height: '260px',
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  confidenceBadge: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#7c3aed',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '999px',
    border: '1.5px solid #7c3aed'
  },
  productBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: '#ffffff'
  },
  brand: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#282c3f',
    textTransform: 'uppercase',
  },
  prodName: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#686b78',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  priceRow: {
    display: 'flex',
    gap: '6px',
    alignItems: 'baseline',
  },
  price: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  oldPrice: {
    fontSize: '0.75rem',
    color: '#94969f',
    textDecoration: 'line-through',
  },
  pctOff: {
    fontSize: '0.75rem',
    color: '#ff9f00',
    fontWeight: '700'
  },
  matchBtn: {
    marginTop: '8px',
    width: '100%',
  },
  footer: {
    borderTop: '1px solid #eaeaec',
    paddingTop: '40px',
    marginTop: '32px',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 2fr',
    gap: '40px',
    paddingBottom: '32px',
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  footerTitle: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#282c3f',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  footerLink: {
    fontSize: '0.8rem',
    color: '#686b78',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  footerText: {
    fontSize: '0.8rem',
    color: '#686b78',
    lineHeight: '1.5',
  },
  footerBottom: {
    borderTop: '1px solid #f5f5f6',
    padding: '24px 0',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#94969f',
  }
};
