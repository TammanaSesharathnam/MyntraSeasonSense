import React, { useState } from 'react';
import { Sparkles, Sliders, Info, ShoppingBag, Loader2, ArrowRight, TrendingUp } from 'lucide-react';

export default function BundleBuilderPage({ 
  userBudget, 
  userPrefs, 
  addToCart, 
  setActiveTab 
}) {
  const [season, setSeason] = useState('Monsoon');
  const [budget, setBudget] = useState(userBudget);
  const [generating, setGenerating] = useState(false);
  const [kit, setKit] = useState(null);

  const handleGenerate = () => {
    setGenerating(true);
    setKit(null);

    fetch('/api/bundles/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        season,
        budget,
        preferences: userPrefs
      })
    })
      .then(res => res.json())
      .then(data => {
        setTimeout(() => {
          setKit(data);
          setGenerating(false);
        }, 1000);
      })
      .catch(err => {
        console.error(err);
        setGenerating(false);
      });
  };

  const handleAddBundleToCart = () => {
    if (!kit) return;
    const bundleProduct = {
      id: `bundle-${Date.now()}`,
      name: kit.bundleName,
      price: kit.bundleTotal,
      originalPrice: kit.originalTotal,
      image: kit.items[0]?.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80',
      itemsInBundle: kit.items.map(item => item.name),
      appliedDiscountType: 'combo_offer'
    };
    addToCart(bundleProduct);
    setActiveTab('checkout');
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      <div style={styles.grid}>
        {/* Wizard Controls */}
        <div className="fashion-card" style={styles.card}>
          <div style={styles.cardHeader}>
            <Sliders size={20} color="#ff3f6c" />
            <h3 style={styles.cardTitle}>AI Kit Wizard</h3>
          </div>
          <p style={styles.cardDesc}>Specify your parameters to generate a custom-tailored seasonal wardrobe.</p>

          <div style={styles.formGroup}>
            <label style={styles.label}>Select Target Season</label>
            <div style={styles.seasonOptions}>
              {['Monsoon', 'Winter', 'Summer'].map(s => (
                <button
                  key={s}
                  onClick={() => setSeason(s)}
                  style={{
                    ...styles.seasonBtn,
                    borderColor: season === s ? '#ff3f6c' : '#d4d5d9',
                    backgroundColor: season === s ? 'rgba(255,63,108,0.06)' : 'transparent',
                    color: season === s ? '#ff3f6c' : '#282c3f',
                    fontWeight: season === s ? '700' : '500'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Kit Spending Cap: ₹{budget}</label>
            <input
              type="range"
              min="2000"
              max="15000"
              step="500"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              style={styles.slider}
            />
            <div style={styles.limits}>
              <span>Min: ₹2,000</span>
              <span>Max: ₹15,000</span>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Selected Aesthetics</label>
            <div style={styles.prefs}>
              {userPrefs.length === 0 ? (
                <span style={styles.noPrefs}>No specific style selected. Customize in profile.</span>
              ) : (
                userPrefs.map((pref, i) => (
                  <span key={i} className="fashion-badge badge-purple" style={styles.prefBadge}>{pref}</span>
                ))
              )}
            </div>
          </div>

          <button 
            className="btn-fashion-primary" 
            onClick={handleGenerate}
            disabled={generating}
            style={styles.genBtn}
          >
            {generating ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Generating Kit...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate Personalized Kit
              </>
            )}
          </button>
        </div>

        {/* Wizard Results Output */}
        <div style={styles.resultsArea}>
          {generating && (
            <div className="fashion-card" style={styles.loaderCard}>
              <div className="loader" style={styles.loaderBig} />
              <h3 style={styles.loaderText}>Myntra AI is scanning products...</h3>
              <p style={styles.loaderSub}>Sorting weather ratings and matching budgets.</p>
            </div>
          )}

          {!generating && !kit && (
            <div className="fashion-card" style={styles.emptyCard}>
              <ShoppingBag size={44} color="#7c3aed" style={styles.emptyIcon} />
              <h3 style={styles.emptyTitle}>Your generated kit will appear here</h3>
              <p style={styles.emptyDesc}>Choose your target season and hit Generate to build a tailored bundle.</p>
            </div>
          )}

          {!generating && kit && (
            <div className="fashion-card animate-fade-in" style={styles.kitCard}>
              <div style={styles.kitHeader}>
                <div>
                  <h3 style={styles.kitTitle}>{kit.bundleName}</h3>
                  <span style={styles.kitCount}>{kit.items.length} clothing items matched</span>
                </div>
                <div style={styles.savingsTag}>
                  <span style={styles.savingsLbl}>Savings</span>
                  <span style={styles.savingsVal}>₹{kit.savings}</span>
                </div>
              </div>

              {/* Items listing */}
              <div style={styles.kitItems}>
                {kit.items.map((item, idx) => (
                  <div key={idx} style={styles.kitItem}>
                    <img src={item.image} alt={item.name} style={styles.itemThumb} />
                    <div style={styles.itemMeta}>
                      <span style={styles.itemBrand}>{item.brand}</span>
                      <h4 style={styles.itemName}>{item.name}</h4>
                      <span style={styles.itemConfidence}>{item.aiConfidence}% match score</span>
                    </div>
                    <div style={styles.itemPrices}>
                      <span style={styles.itemPrice}>₹{item.price}</span>
                      <span style={styles.itemOldPrice}>₹{item.originalPrice}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Value Meter Gauge */}
              <div style={styles.valueMeter}>
                <div style={styles.vMeterHeader}>
                  <span style={styles.vLabel}><TrendingUp size={14} color="#7c3aed" /> Combo Value Index</span>
                  <span style={styles.vIndex}>{kit.valueIndex}% Efficiency</span>
                </div>
                <div style={styles.vBarTrack}>
                  <div style={{ ...styles.vBarFill, width: `${kit.valueIndex}%` }} />
                </div>
              </div>

              {/* Price summary and checkout */}
              <div style={styles.kitFooter}>
                <div style={styles.summaryPrices}>
                  <div style={styles.summaryRow}>
                    <span>Total A-la-carte:</span>
                    <span style={styles.delPrice}>₹{kit.originalTotal}</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>AI Combo Rate:</span>
                    <span style={styles.bundlePrice}>₹{kit.bundleTotal}</span>
                  </div>
                </div>

                <button 
                  className="btn-fashion-primary" 
                  onClick={handleAddBundleToCart}
                  style={styles.addCartBtn}
                >
                  Add Kit & Checkout <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1.8fr',
    gap: '24px',
  },
  card: {
    padding: '28px',
    backgroundColor: '#ffffff',
    height: 'fit-content',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  cardDesc: {
    fontSize: '0.82rem',
    color: '#686b78',
    marginBottom: '24px',
    lineHeight: '1.45',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#282c3f',
    textTransform: 'uppercase',
  },
  seasonOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  seasonBtn: {
    padding: '10px',
    border: '1.5px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
  },
  slider: {
    width: '100%',
    accentColor: '#ff3f6c',
    cursor: 'pointer',
  },
  limits: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#94969f',
  },
  prefs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  prefBadge: {
    fontSize: '0.65rem',
  },
  noPrefs: {
    fontSize: '0.75rem',
    color: '#94969f',
    fontStyle: 'italic',
  },
  genBtn: {
    width: '100%',
    marginTop: '8px',
    padding: '12px',
  },
  resultsArea: {
    display: 'flex',
    flexDirection: 'column',
  },
  loaderCard: {
    padding: '48px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    backgroundColor: '#ffffff',
  },
  loaderBig: {
    width: '40px',
    height: '40px',
    borderWidth: '4px',
    borderColor: '#ff3f6c',
  },
  loaderText: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  loaderSub: {
    fontSize: '0.85rem',
    color: '#686b78',
  },
  emptyCard: {
    padding: '48px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    backgroundColor: '#ffffff',
    minHeight: '380px',
  },
  emptyIcon: {
    opacity: '0.5',
  },
  emptyTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  emptyDesc: {
    fontSize: '0.82rem',
    color: '#686b78',
    maxWidth: '280px',
    lineHeight: '1.5',
  },
  kitCard: {
    padding: '28px',
    backgroundColor: '#ffffff',
  },
  kitHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    borderBottom: '1px solid #f5f5f6',
    paddingBottom: '16px',
    marginBottom: '16px',
  },
  kitTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  kitCount: {
    fontSize: '0.8rem',
    color: '#ff3f6c',
    fontWeight: '700',
    display: 'block',
    marginTop: '2px',
  },
  savingsTag: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#e6f7f0',
    padding: '6px 14px',
    borderRadius: '8px',
  },
  savingsLbl: {
    fontSize: '0.6rem',
    color: '#10b981',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  savingsVal: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#10b981',
  },
  kitItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  kitItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#fafafa',
    border: '1px solid #eaeaec',
    borderRadius: '8px',
    padding: '12px',
  },
  itemThumb: {
    width: '50px',
    height: '60px',
    borderRadius: '6px',
    objectFit: 'cover',
  },
  itemMeta: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  itemBrand: {
    fontSize: '0.65rem',
    color: '#ff3f6c',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  itemName: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#282c3f',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '220px',
  },
  itemConfidence: {
    fontSize: '0.7rem',
    color: '#686b78',
  },
  itemPrices: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'end',
  },
  itemPrice: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  itemOldPrice: {
    fontSize: '0.75rem',
    color: '#94969f',
    textDecoration: 'line-through',
  },
  valueMeter: {
    backgroundColor: '#f3e8ff',
    padding: '14px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  vMeterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#7c3aed',
    marginBottom: '6px',
  },
  vLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  vIndex: {
    color: '#7c3aed',
    fontWeight: '700',
  },
  vBarTrack: {
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  vBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ff3f6c 0%, #7c3aed 100%)',
    borderRadius: '999px',
  },
  kitFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f5f5f6',
    paddingTop: '20px',
  },
  summaryPrices: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  summaryRow: {
    display: 'flex',
    gap: '8px',
    fontSize: '0.8rem',
    color: '#686b78',
    alignItems: 'baseline',
  },
  delPrice: {
    textDecoration: 'line-through',
  },
  bundlePrice: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#282c3f',
  },
  addCartBtn: {
    padding: '12px 20px',
  }
};
