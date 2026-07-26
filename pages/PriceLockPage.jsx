import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Clock, ShieldCheck, HelpCircle } from 'lucide-react';
import { utilityService } from '../services/api';

export default function PriceLockPage({ addToCart, setActiveTab }) {
  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLocks = () => {
    utilityService.getPriceLocks()
      .then(data => {
        setLocks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLocks();
  }, []);

  const handleUnlockAndBuy = (lock) => {
    const productItem = {
      ...lock.product,
      price: lock.lockedPrice,
      name: `${lock.product.name} (Price Locked)`,
      appliedDiscountType: 'price_lock'
    };
    
    addToCart(productItem);

    utilityService.unlockPrice(lock.id)
      .then(() => {
        fetchLocks();
        setActiveTab('checkout');
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      {/* Information Header Block */}
      <section style={styles.infoBanner} className="fashion-card">
        <div style={styles.bannerContent}>
          <div style={styles.iconCircle}>
            <Lock size={28} color="#ff3f6c" />
          </div>
          <div>
            <h2 style={styles.bannerTitle}>Myntra Price Lock Guard</h2>
            <p style={styles.bannerText}>
              Seasonal clothing demand drives prices up by 30-50% during peak months. Pay a small holding fee (₹99) now to freeze current rates for 30 days. No obligations, unlock anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Grid: Locks list & FAQ */}
      <div style={styles.grid}>
        {/* Active Locks Panel */}
        <div style={styles.locksPanel}>
          <h3 style={styles.sectionHeader}>Active Price Locks ({locks.length})</h3>

          {loading ? (
            <div style={styles.loaderArea}>
              <div className="loader" style={styles.loaderSpinner} />
            </div>
          ) : locks.length === 0 ? (
            <div className="fashion-card" style={styles.emptyCard}>
              <Unlock size={36} color="#94969f" style={styles.emptyIcon} />
              <h4 style={styles.emptyTitle}>No active price locks</h4>
              <p style={styles.emptyDesc}>Explore recommendations and click "Lock Price" on items you plan to buy later.</p>
              <button 
                className="btn-fashion-primary" 
                onClick={() => setActiveTab('recommendation')}
                style={styles.browseBtn}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div style={styles.locksList}>
              {locks.map(lock => (
                <div key={lock.id} className="fashion-card" style={styles.lockCard}>
                  <img src={lock.product.image} alt={lock.product.name} style={styles.thumb} />
                  <div style={styles.meta}>
                    <span style={styles.brand}>{lock.product.brand}</span>
                    <h4 style={styles.name}>{lock.product.name}</h4>
                    <div style={styles.timerRow}>
                      <Clock size={13} color="#ff3f6c" />
                      <span style={styles.days}>{lock.daysRemaining} days remaining</span>
                    </div>
                  </div>
                  
                  <div style={styles.priceMeta}>
                    <div style={styles.pBox}>
                      <span style={styles.pLbl}>Locked Rate</span>
                      <span style={styles.pVal}>₹{lock.lockedPrice}</span>
                    </div>
                    <div style={styles.pBox}>
                      <span style={styles.pLbl}>Token Fee</span>
                      <span style={styles.pValFee}>₹{lock.lockFee}</span>
                    </div>
                  </div>

                  <button 
                    className="btn-fashion-primary" 
                    onClick={() => handleUnlockAndBuy(lock)}
                    style={styles.unlockBtn}
                  >
                    <Unlock size={13} /> Unlock & Buy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info / FAQ Panel */}
        <div className="fashion-card" style={styles.faqCard}>
          <h3 style={styles.faqTitle}><HelpCircle size={18} color="#7c3aed" /> Price Lock Policy</h3>
          <div style={styles.faqList}>
            <div style={styles.faqItem}>
              <span style={styles.faqNum}>1</span>
              <div>
                <h4 style={styles.faqQ}>Lock current rates</h4>
                <p style={styles.faqA}>Click "Lock Price" in the recommendations catalog and pay a token fee of ₹99.</p>
              </div>
            </div>
            <div style={styles.faqItem}>
              <span style={styles.faqNum}>2</span>
              <div>
                <h4 style={styles.faqQ}>Hassle-free 30 days protection</h4>
                <p style={styles.faqA}>We guarantee the product price will not increase for you, regardless of market demand hikes.</p>
              </div>
            </div>
            <div style={styles.faqItem}>
              <span style={styles.faqNum}>3</span>
              <div>
                <h4 style={styles.faqQ}>Checkout at locked rate</h4>
                <p style={styles.faqA}>Click "Unlock & Buy" from this dashboard. The item will load in your cart with the frozen rate.</p>
              </div>
            </div>
          </div>
          <div style={styles.trustBadge}>
            <ShieldCheck size={20} color="#10b981" />
            <span>Guaranteed Price Protection Policy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  infoBanner: {
    padding: '24px',
    backgroundColor: '#ffffff',
    borderColor: '#f5f5f6',
  },
  bannerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  iconCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 63, 108, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 63, 108, 0.1)',
  },
  bannerTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  bannerText: {
    fontSize: '0.85rem',
    color: '#686b78',
    lineHeight: '1.5',
    marginTop: '4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1.1fr',
    gap: '24px',
  },
  locksPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionHeader: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  loaderArea: {
    display: 'flex',
    justifyContent: 'center',
    padding: '32px 0',
  },
  loaderSpinner: {
    borderColor: '#ff3f6c',
  },
  emptyCard: {
    padding: '48px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: '#ffffff',
  },
  emptyIcon: {
    opacity: '0.6',
  },
  emptyTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  emptyDesc: {
    fontSize: '0.82rem',
    color: '#686b78',
    lineHeight: '1.4',
  },
  browseBtn: {
    marginTop: '8px',
  },
  locksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  lockCard: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: '#ffffff',
  },
  thumb: {
    width: '60px',
    height: '75px',
    borderRadius: '6px',
    objectFit: 'cover',
  },
  meta: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  brand: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#ff3f6c',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#282c3f',
  },
  timerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '2px',
  },
  days: {
    fontSize: '0.75rem',
    color: '#ff3f6c',
    fontWeight: '700',
  },
  priceMeta: {
    display: 'flex',
    gap: '20px',
    paddingRight: '12px',
  },
  pBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  pLbl: {
    fontSize: '0.65rem',
    color: '#94969f',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  pVal: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#282c3f',
  },
  pValFee: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#7c3aed',
  },
  unlockBtn: {
    padding: '10px 16px',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  faqCard: {
    padding: '24px',
    backgroundColor: '#ffffff',
    height: 'fit-content',
  },
  faqTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#282c3f',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid #f5f5f6',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  faqItem: {
    display: 'flex',
    gap: '16px',
  },
  faqNum: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(124, 58, 237, 0.06)',
    color: '#7c3aed',
    border: '1.5px solid rgba(124, 58, 237, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: '700',
    flexShrink: 0,
  },
  faqQ: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  faqA: {
    fontSize: '0.78rem',
    color: '#686b78',
    lineHeight: '1.45',
    marginTop: '2px',
  },
  trustBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '24px',
    padding: '12px',
    backgroundColor: '#e6f7f0',
    border: '1px solid #b7ebd5',
    borderRadius: '8px',
    fontSize: '0.75rem',
    color: '#10b981',
    fontWeight: '700',
  }
};
