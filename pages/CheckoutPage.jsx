import React, { useState } from 'react';
import { CreditCard, ShoppingBag, CheckCircle, ShieldCheck, ArrowRight, X, Sparkles } from 'lucide-react';
import CircularScore from '../components/CircularScore';
import { checkoutService } from '../services/api';

export default function CheckoutPage({ 
  cart, 
  setCart, 
  location, 
  setReadinessScore, 
  setMissingEssentials, 
  setActiveTab 
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderConfirm, setOrderConfirm] = useState(null);
  const [discountType, setDiscountType] = useState('none');
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.originalPrice || item.price * 1.3), 0);
  const cartPrice = cart.reduce((sum, item) => sum + item.price, 0);
  const originalSavings = subtotal - cartPrice;

  let finalTotal = cartPrice;
  let additionalSavings = 0;
  if (discountType === 'instant_20') {
    finalTotal = Math.round(cartPrice * 0.8);
    additionalSavings = cartPrice - finalTotal;
  } else if (discountType === 'combo_offer') {
    finalTotal = Math.round(cartPrice * 0.85);
    additionalSavings = cartPrice - finalTotal;
  }

  const handleRemoveItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setSubmitting(true);

    checkoutService.checkout(cart, discountType, location)
      .then(data => {
        setTimeout(() => {
          setSubmitting(false);
          setIsSubmitted(true);
          setOrderConfirm(data.order);
          setReadinessScore(data.readinessScore);
          setMissingEssentials(data.missingEssentials);
        }, 1200);
      })
      .catch(err => {
        console.error(err);
        setSubmitting(false);
      });
  };

  const handleResetCheckout = () => {
    setCart([]);
    setIsSubmitted(false);
    setOrderConfirm(null);
    setDiscountType('none');
    setActiveTab('landing');
  };

  // State 2: Success Page (Section 13)
  if (isSubmitted && orderConfirm) {
    return (
      <div className="fashion-card animate-fade-in" style={styles.successCard}>
        <div style={styles.successHeader}>
          <CheckCircle size={56} color="#10b981" />
          <h2 style={styles.successTitle}>Order Confirmed!</h2>
          <span style={styles.orderId}>Transaction ID: {orderConfirm.orderId}</span>
        </div>

        <div style={styles.successSplit}>
          {/* Left panel: Receipt Details */}
          <div style={styles.orderReview} className="fashion-card">
            <h4 style={styles.subHeader}>Order Receipt</h4>
            <div style={styles.receiptItems}>
              {orderConfirm.items.map((item, idx) => (
                <div key={idx} style={styles.receiptItem}>
                  <span style={styles.rName}>{item.name}</span>
                  <span style={styles.rPrice}>₹{item.price}</span>
                </div>
              ))}
            </div>
            <div style={styles.receiptTotals}>
              <div style={styles.rRow}>
                <span>Original Price:</span>
                <span style={styles.rDel}>₹{orderConfirm.originalTotal}</span>
              </div>
              <div style={styles.rRow}>
                <span>Discount Applied:</span>
                <span style={styles.rGreen}>-₹{orderConfirm.savings}</span>
              </div>
              <div style={styles.rRowFinal}>
                <span>Paid Total:</span>
                <span>₹{orderConfirm.checkoutTotal}</span>
              </div>
            </div>
          </div>

          {/* Right panel: Readiness Score Upgrade */}
          <div style={styles.readinessUpgrade} className="fashion-card">
            <h4 style={styles.subHeader}>Myntra Wardrobe Readiness</h4>
            <p style={styles.upgradeText}>
              By checking out these essentials, your wardrobe is now officially climate-adapted.
            </p>
            
            <div style={styles.successMeter}>
              <CircularScore score={100} size={110} strokeWidth={8} />
            </div>

            <div style={styles.upgradeStatus}>
              <ShieldCheck size={18} color="#10b981" />
              <span>Readiness Level: 100% Prepared</span>
            </div>
          </div>
        </div>

        <button className="btn-fashion-primary" onClick={handleResetCheckout} style={styles.successBtn}>
          Continue Shopping <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // State 1: Checkout Form (Section 12)
  return (
    <div className="animate-fade-in" style={styles.container}>
      {cart.length === 0 ? (
        <div className="fashion-card animate-fade-in" style={styles.emptyCartCard}>
          <ShoppingBag size={40} color="#94969f" style={styles.emptyCartIcon} />
          <h3 style={styles.emptyTitle}>Your shopping bag is empty</h3>
          <p style={styles.emptyDesc}>Go to Recommendations and choose a product or AI Bundle package.</p>
          <button className="btn-fashion-primary" onClick={() => setActiveTab('recommendation')} style={styles.browseBtn}>
            Find Seasonal Outfits
          </button>
        </div>
      ) : (
        <div style={styles.checkoutLayout}>
          {/* Left panel: Order Summary */}
          <div style={styles.summaryPane}>
            <h3 style={styles.sectionHeader}>Order Summary ({cart.length})</h3>
            <div style={styles.cartList}>
              {cart.map(item => (
                <div key={item.id} className="fashion-card" style={styles.cartItem}>
                  {item.image && <img src={item.image} alt={item.name} style={styles.itemThumb} />}
                  <div style={styles.itemMeta}>
                    <span style={styles.itemBrand}>{item.brand || 'Myntra Design'}</span>
                    <h4 style={styles.itemName}>{item.name}</h4>
                    {item.itemsInBundle && (
                      <div style={styles.bundleDetails}>
                        <span style={styles.bundleLbl}>Includes:</span>
                        {item.itemsInBundle.map((sub, i) => (
                          <span key={i} className="fashion-badge badge-purple" style={styles.subItem}>{sub}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={styles.itemPrices}>
                    <span style={styles.itemPrice}>₹{item.price}</span>
                    <span style={styles.itemOld}>₹{Math.round(item.originalPrice || item.price * 1.3)}</span>
                  </div>
                  <button onClick={() => handleRemoveItem(item.id)} style={styles.removeBtn}>
                    <X size={16} color="#94969f" />
                  </button>
                </div>
              ))}
            </div>

            {/* Discount selector (Section 5) */}
            <div className="fashion-card" style={styles.promoCard}>
              <h4 style={styles.promoTitle}><Sparkles size={16} color="#ff3f6c" /> Extra Checkout Savings</h4>
              <p style={styles.promoDesc}>Choose an additional voucher configuration below:</p>
              <div style={styles.promoOptions}>
                <label style={styles.promoOpt}>
                  <input 
                    type="radio" 
                    name="promo" 
                    value="none" 
                    checked={discountType === 'none'}
                    onChange={() => setDiscountType('none')}
                    style={styles.radio}
                  />
                  <span>No discount (A-la-carte)</span>
                </label>
                <label style={styles.promoOpt}>
                  <input 
                    type="radio" 
                    name="promo" 
                    value="instant_20" 
                    checked={discountType === 'instant_20'}
                    onChange={() => setDiscountType('instant_20')}
                    style={styles.radio}
                  />
                  <span>20% Instant Discount (Option A)</span>
                </label>
                <label style={styles.promoOpt}>
                  <input 
                    type="radio" 
                    name="promo" 
                    value="combo_offer" 
                    checked={discountType === 'combo_offer'}
                    onChange={() => setDiscountType('combo_offer')}
                    style={styles.radio}
                  />
                  <span>AI Curated Combo Discount (Option B)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right panel: Payment details and placement */}
          <div style={styles.paymentPane}>
            <div className="fashion-card" style={styles.payCard}>
              <h3 style={styles.sectionHeader}><CreditCard size={18} color="#ff3f6c" /> Secure Payment</h3>
              
              {/* Order total breakdowns */}
              <div style={styles.breakdowns}>
                <div style={styles.bRow}>
                  <span>Original subtotal:</span>
                  <span style={styles.delTotal}>₹{Math.round(subtotal)}</span>
                </div>
                <div style={styles.bRow}>
                  <span>Catalog discount:</span>
                  <span style={styles.saveGreen}>-₹{Math.round(originalSavings)}</span>
                </div>
                {additionalSavings > 0 && (
                  <div style={styles.bRow}>
                    <span>Promo discount:</span>
                    <span style={styles.saveGreen}>-₹{additionalSavings}</span>
                  </div>
                )}
                <div style={styles.bRowFinal}>
                  <span>Estimated Total:</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>

              <form onSubmit={handlePlaceOrder} style={styles.payForm}>
                <input 
                  type="text" 
                  placeholder="Card Number (simulated)" 
                  className="fashion-input" 
                  value={cardForm.number}
                  onChange={e => setCardForm({ ...cardForm, number: e.target.value })}
                  maxLength="19"
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Cardholder Name" 
                  className="fashion-input" 
                  value={cardForm.name}
                  onChange={e => setCardForm({ ...cardForm, name: e.target.value })}
                  required 
                />
                <div style={styles.formRow}>
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    className="fashion-input" 
                    value={cardForm.expiry}
                    onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                    maxLength="5"
                    required 
                  />
                  <input 
                    type="password" 
                    placeholder="CVV" 
                    className="fashion-input" 
                    value={cardForm.cvv}
                    onChange={e => setCardForm({ ...cardForm, cvv: e.target.value })}
                    maxLength="3"
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-fashion-primary" 
                  disabled={submitting}
                  style={styles.payBtn}
                >
                  {submitting ? 'Verifying payment...' : `Pay ₹${finalTotal.toLocaleString('en-IN')}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  checkoutLayout: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  summaryPane: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionHeader: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#282c3f',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cartList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  itemThumb: {
    width: '60px',
    height: '75px',
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
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#ff3f6c',
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#282c3f',
  },
  bundleDetails: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '4px',
  },
  bundleLbl: {
    fontSize: '0.7rem',
    color: '#686b78',
  },
  subItem: {
    fontSize: '0.65rem',
    padding: '2px 8px',
  },
  itemPrices: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'end',
    paddingRight: '20px',
  },
  itemPrice: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  itemOld: {
    fontSize: '0.78rem',
    color: '#94969f',
    textDecoration: 'line-through',
  },
  removeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  promoCard: {
    padding: '20px',
    backgroundColor: '#ffffff',
  },
  promoTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#282c3f',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  promoDesc: {
    fontSize: '0.8rem',
    color: '#686b78',
    marginBottom: '12px',
  },
  promoOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  promoOpt: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.82rem',
    color: '#282c3f',
    cursor: 'pointer',
    fontWeight: '500',
  },
  radio: {
    accentColor: '#ff3f6c',
  },
  paymentPane: {
    position: 'sticky',
    top: '104px',
  },
  payCard: {
    padding: '24px',
    backgroundColor: '#ffffff',
  },
  breakdowns: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    margin: '16px 0',
    paddingBottom: '16px',
    borderBottom: '1px solid #f5f5f6',
  },
  bRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.82rem',
    color: '#686b78',
  },
  delTotal: {
    textDecoration: 'line-through',
  },
  saveGreen: {
    color: '#10b981',
    fontWeight: '700',
  },
  bRowFinal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#282c3f',
    marginTop: '6px',
  },
  payForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  payBtn: {
    width: '100%',
    padding: '14px',
    marginTop: '8px',
  },
  emptyCartCard: {
    padding: '64px 32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: '#ffffff',
    maxWidth: '450px',
    margin: '40px auto 0',
  },
  emptyCartIcon: {
    opacity: '0.6',
  },
  emptyTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  emptyDesc: {
    fontSize: '0.82rem',
    color: '#686b78',
    lineHeight: '1.45',
  },
  browseBtn: {
    marginTop: '8px',
  },

  /* Success Card Styles */
  successCard: {
    padding: '48px 32px',
    maxWidth: '780px',
    margin: '20px auto 0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '32px',
    backgroundColor: '#ffffff',
  },
  successHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  successTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#282c3f',
  },
  orderId: {
    fontSize: '0.8rem',
    color: '#94969f',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  successSplit: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    width: '100%',
    textAlign: 'left',
  },
  orderReview: {
    padding: '24px',
    backgroundColor: '#fafafa',
  },
  subHeader: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#ff3f6c',
    textTransform: 'uppercase',
    borderBottom: '1px solid #eaeaec',
    paddingBottom: '8px',
    marginBottom: '12px',
  },
  receiptItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
    maxHeight: '140px',
    overflowY: 'auto',
  },
  receiptItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.82rem',
    color: '#282c3f',
    fontWeight: '500',
  },
  rName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '220px',
  },
  rPrice: {
    fontWeight: '600',
  },
  receiptTotals: {
    borderTop: '1px solid #eaeaec',
    paddingTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  rRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#686b78',
  },
  rDel: {
    textDecoration: 'line-through',
  },
  rGreen: {
    color: '#10b981',
    fontWeight: '700',
  },
  rRowFinal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#282c3f',
    marginTop: '6px',
  },
  readinessUpgrade: {
    padding: '24px',
    backgroundColor: '#fafafa',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  upgradeText: {
    fontSize: '0.8rem',
    color: '#686b78',
    lineHeight: '1.45',
    marginBottom: '16px',
  },
  successMeter: {
    margin: '12px 0',
  },
  upgradeStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#e6f7f0',
    border: '1px solid #b7ebd5',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    color: '#10b981',
    fontWeight: '700',
  },
  successBtn: {
    padding: '14px 28px',
  }
};
