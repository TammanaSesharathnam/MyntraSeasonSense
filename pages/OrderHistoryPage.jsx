import React, { useState, useEffect } from 'react';
import { ShoppingBag, FileText, CheckCircle, Clock, Truck, ShieldAlert, X, Printer, ArrowLeft } from 'lucide-react';
import { checkoutService } from '../services/api';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeInvoice, setActiveInvoice] = useState(null);

  useEffect(() => {
    checkoutService.getOrders()
      .then(data => {
        setOrders(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
        setError('Failed to load order history.');
        setLoading(false);
      });
  }, []);

  const handleReturn = (orderId) => {
    alert(`Return request submitted successfully for Order: ${orderId}. Our courier partner will contact you for pickup within 24-48 hours.`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div className="loader" style={styles.loader} />
        <p style={styles.loadingText}>Fetching secure order ledger...</p>
      </div>
    );
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>My Orders & Invoices</h1>
        <p style={styles.subtitle}>Track shipping logistics, download invoices, and manage post-purchase returns.</p>
      </div>

      {error && <p style={styles.errorMsg}>{error}</p>}

      {orders.length === 0 ? (
        <div className="fashion-card" style={styles.emptyCard}>
          <ShoppingBag size={48} color="#94969f" />
          <h3 style={styles.emptyTitle}>No Orders Placed Yet</h3>
          <p style={styles.emptyDesc}>Items purchased via checkout will be compiled and displayed here.</p>
        </div>
      ) : (
        <div style={styles.ordersList}>
          {orders.map(order => {
            const orderDate = new Date(order.date).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={order.orderId} className="fashion-card" style={styles.orderCard}>
                {/* Order Summary Ribbon */}
                <div style={styles.ribbon}>
                  <div style={styles.ribbonMeta}>
                    <span style={styles.metaLabel}>Order Placed</span>
                    <span style={styles.metaVal}>{orderDate}</span>
                  </div>
                  <div style={styles.ribbonMeta}>
                    <span style={styles.metaLabel}>Transaction ID</span>
                    <span style={styles.metaValCode}>{order.orderId}</span>
                  </div>
                  <div style={styles.ribbonMeta}>
                    <span style={styles.metaLabel}>Payment Status</span>
                    <span style={styles.statusBadge}>PAID via UPI</span>
                  </div>
                  <div style={styles.ribbonActions}>
                    <button 
                      onClick={() => setActiveInvoice(order)}
                      style={styles.invoiceBtn}
                    >
                      <FileText size={14} /> View Invoice
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div style={styles.itemsContainer}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={styles.itemRow}>
                      <img src={item.image} alt={item.name} style={styles.itemImage} />
                      <div style={styles.itemMeta}>
                        <span style={styles.itemBrand}>{item.brand}</span>
                        <h4 style={styles.itemName}>{item.name}</h4>
                        {item.selectedSize && (
                          <span style={styles.itemSize}>Size: {item.selectedSize}</span>
                        )}
                        {item.appliedDiscountType && (
                          <span style={styles.discountBadge}>
                            {item.appliedDiscountType === 'combo_offer' ? 'AI Combo Pricing' : 'Coupon Discount Applied'}
                          </span>
                        )}
                      </div>
                      <div style={styles.itemPriceCol}>
                        <span style={styles.itemPrice}>₹{item.price}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span style={styles.itemOldPrice}>₹{item.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking Simulation Status */}
                <div style={styles.trackingContainer}>
                  <h4 style={styles.trackingTitle}>Delivery Progress Status</h4>
                  <div style={styles.trackingTimeline}>
                    <div style={styles.timelineStep}>
                      <div style={{ ...styles.stepCircle, backgroundColor: '#10b981' }}>
                        <CheckCircle size={16} color="#ffffff" />
                      </div>
                      <span style={styles.stepLabelActive}>Order Placed</span>
                    </div>

                    <div style={styles.timelineStep}>
                      <div style={{ ...styles.stepCircle, backgroundColor: '#10b981' }}>
                        <Truck size={16} color="#ffffff" />
                      </div>
                      <span style={styles.stepLabelActive}>Dispatched</span>
                    </div>

                    <div style={styles.timelineStep}>
                      <div style={{ ...styles.stepCircle, backgroundColor: '#7c3aed', animation: 'pulse 2s infinite' }}>
                        <Clock size={16} color="#ffffff" />
                      </div>
                      <span style={{ ...styles.stepLabelActive, color: '#7c3aed' }}>In Transit</span>
                    </div>

                    {/* Connecting Line */}
                    <div style={styles.timelineLine} />
                  </div>
                </div>

                {/* Footer Section */}
                <div style={styles.orderFooter}>
                  <div style={styles.totalsGroup}>
                    <span style={styles.grandTotalLabel}>Grand Total Paid:</span>
                    <span style={styles.grandTotalValue}>₹{order.checkoutTotal}</span>
                    {order.savings > 0 && (
                      <span style={styles.savingsLabel}>You saved ₹{order.savings}!</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleReturn(order.orderId)}
                    style={styles.returnBtn}
                  >
                    <ShieldAlert size={14} /> Request Return
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal Overlay */}
      {activeInvoice && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="animate-scale-up">
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderTitle}>
                <span style={styles.invoiceLogo}>M</span>
                <div>
                  <h2 style={styles.invoiceTitleText}>TAX INVOICE</h2>
                  <p style={styles.invoiceSubtitleText}>Myntra Wardrobe Integration</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveInvoice(null)}
                style={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            {/* Invoice Metadata */}
            <div style={styles.invoiceDetailsGrid}>
              <div style={styles.detailsCol}>
                <p style={styles.detailsLabel}>BILLED TO:</p>
                <p style={styles.detailsValBold}>TestShopper</p>
                <p style={styles.detailsValMuted}>testshopper@myntra.com</p>
                <p style={styles.detailsValMuted}>Climate Zone: Delhi, India</p>
              </div>
              <div style={{ ...styles.detailsCol, textAlign: 'right' }}>
                <p style={styles.detailsLabel}>INVOICE DETAILS:</p>
                <p style={styles.detailsValMuted}>Invoice No: <span style={styles.detailsValBold}>INV-{activeInvoice.orderId.split('-')[1]}</span></p>
                <p style={styles.detailsValMuted}>Date: <span style={styles.detailsValBold}>{new Date(activeInvoice.date).toLocaleDateString('en-IN')}</span></p>
                <p style={styles.detailsValMuted}>Payment Mode: <span style={styles.detailsValBold}>UPI (Secured)</span></p>
              </div>
            </div>

            {/* Invoice Table */}
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.thLeft}>Fashion Item Details</th>
                    <th style={styles.thRight}>Retail Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {activeInvoice.items.map((item, index) => (
                    <tr key={index} style={styles.tableBodyRow}>
                      <td style={styles.tdLeft}>
                        <p style={styles.invoiceItemName}>{item.name}</p>
                        <span style={styles.invoiceItemBrand}>{item.brand}</span>
                      </td>
                      <td style={styles.tdRight}>₹{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div style={styles.calcWrapper}>
              <div style={styles.calcRow}>
                <span style={styles.calcLabel}>Item Subtotal:</span>
                <span style={styles.calcVal}>₹{activeInvoice.items.reduce((sum, item) => sum + item.price, 0)}</span>
              </div>
              
              <div style={styles.calcRow}>
                <span style={styles.calcLabel}>CGST (9%):</span>
                <span style={styles.calcVal}>₹{Math.round(activeInvoice.checkoutTotal * 0.09)}</span>
              </div>

              <div style={styles.calcRow}>
                <span style={styles.calcLabel}>SGST (9%):</span>
                <span style={styles.calcVal}>₹{Math.round(activeInvoice.checkoutTotal * 0.09)}</span>
              </div>

              {activeInvoice.discountApplied !== 'none' && (
                <div style={{ ...styles.calcRow, color: '#10b981', fontWeight: '700' }}>
                  <span style={styles.calcLabel}>Discount Applied:</span>
                  <span style={styles.calcVal}>-₹{activeInvoice.savings}</span>
                </div>
              )}

              <div style={styles.grandTotalRow}>
                <span style={styles.grandTotalLabelInvoice}>Net Invoice Value:</span>
                <span style={styles.grandTotalValInvoice}>₹{activeInvoice.checkoutTotal}</span>
              </div>
            </div>

            {/* Guarantee Seal / Info */}
            <div style={styles.guaranteeBox}>
              <p style={styles.guaranteeText}>• Myntra certifies that these items are climate-optimized for the Delhi winter.</p>
              <p style={styles.guaranteeText}>• Price Surge protection insurance of ₹99 fully waived under campaign rules.</p>
            </div>

            {/* Print Action button */}
            <div style={styles.modalActions}>
              <button onClick={handlePrint} style={styles.printBtn}>
                <Printer size={16} /> Print Receipt / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px 0',
  },
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
  },
  loader: {
    width: '40px',
    height: '40px',
    border: '3px solid #f5f5f6',
    borderTop: '3px solid #ff3f6c',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '0.85rem',
    color: '#686b78',
    fontWeight: '500',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#282c3f',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#686b78',
    marginTop: '4px',
  },
  errorMsg: {
    color: '#ef4444',
    fontSize: '0.8rem',
    fontWeight: '700',
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
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #eaeaec',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  ribbon: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderBottom: '1px solid #eaeaec',
    padding: '16px 20px',
    gap: '16px',
  },
  ribbonMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metaLabel: {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    color: '#94969f',
    fontWeight: '700',
  },
  metaVal: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  metaValCode: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#282c3f',
    fontFamily: 'monospace',
  },
  statusBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#10b981',
    backgroundColor: '#e6f7f0',
    padding: '4px 10px',
    borderRadius: '20px',
    display: 'inline-block',
  },
  invoiceBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1.5px solid #d4d5d9',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#ff3f6c',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  itemsContainer: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  itemImage: {
    width: '64px',
    height: '76px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid #eaeaec',
  },
  itemMeta: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  itemBrand: {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    color: '#ff3f6c',
    fontWeight: '800',
  },
  itemName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#282c3f',
  },
  itemSize: {
    fontSize: '0.7rem',
    color: '#686b78',
  },
  discountBadge: {
    fontSize: '0.65rem',
    color: '#7c3aed',
    fontWeight: '600',
    backgroundColor: '#f3e8ff',
    padding: '2px 8px',
    borderRadius: '4px',
    width: 'fit-content',
    marginTop: '4px',
  },
  itemPriceCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },
  itemPrice: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  itemOldPrice: {
    fontSize: '0.75rem',
    color: '#94969f',
    textDecoration: 'line-through',
  },
  trackingContainer: {
    padding: '20px',
    backgroundColor: '#fafafa',
    borderTop: '1px solid #eaeaec',
    borderBottom: '1px solid #eaeaec',
  },
  trackingTitle: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: '#282c3f',
    fontWeight: '700',
    marginBottom: '16px',
  },
  trackingTimeline: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    maxWidth: '450px',
    margin: '0 auto',
  },
  timelineStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    zIndex: 10,
  },
  stepCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabelActive: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  timelineLine: {
    position: 'absolute',
    top: '16px',
    left: '16%',
    right: '16%',
    height: '3px',
    backgroundColor: '#10b981',
    zIndex: 1,
  },
  orderFooter: {
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalsGroup: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  grandTotalLabel: {
    fontSize: '0.8rem',
    fontWeight: '500',
    color: '#686b78',
  },
  grandTotalValue: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#282c3f',
  },
  savingsLabel: {
    fontSize: '0.75rem',
    color: '#10b981',
    fontWeight: '700',
  },
  returnBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#fff7ed',
    border: '1px solid #ffedd5',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#f97316',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1500,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    padding: '28px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'relative',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalHeaderTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  invoiceLogo: {
    backgroundColor: '#ff3f6c',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontWeight: '800',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceTitleText: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#282c3f',
    letterSpacing: '0.5px',
  },
  invoiceSubtitleText: {
    fontSize: '0.65rem',
    color: '#94969f',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#94969f',
    cursor: 'pointer',
    padding: '4px',
  },
  invoiceDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    backgroundColor: '#fafafa',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #eaeaec',
  },
  detailsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  detailsLabel: {
    fontSize: '0.6rem',
    fontWeight: '800',
    color: '#ff3f6c',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  detailsValBold: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  detailsValMuted: {
    fontSize: '0.72rem',
    color: '#686b78',
  },
  tableWrapper: {
    border: '1px solid #eaeaec',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.75rem',
  },
  tableHeaderRow: {
    backgroundColor: '#fafafa',
    borderBottom: '1px solid #eaeaec',
  },
  thLeft: {
    textAlign: 'left',
    padding: '10px 14px',
    fontWeight: '700',
    color: '#282c3f',
  },
  thRight: {
    textAlign: 'right',
    padding: '10px 14px',
    fontWeight: '700',
    color: '#282c3f',
  },
  tableBodyRow: {
    borderBottom: '1px solid #f5f5f6',
  },
  tdLeft: {
    padding: '12px 14px',
    textAlign: 'left',
  },
  tdRight: {
    padding: '12px 14px',
    textAlign: 'right',
    fontWeight: '600',
    color: '#282c3f',
  },
  invoiceItemName: {
    fontWeight: '600',
    color: '#282c3f',
  },
  invoiceItemBrand: {
    fontSize: '0.65rem',
    color: '#686b78',
    textTransform: 'uppercase',
  },
  calcWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-end',
    borderTop: '1px solid #eaeaec',
    paddingTop: '14px',
  },
  calcRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '200px',
    fontSize: '0.75rem',
    color: '#686b78',
  },
  calcLabel: {},
  calcVal: {
    fontWeight: '600',
    color: '#282c3f',
  },
  grandTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '200px',
    borderTop: '1px dashed #d4d5d9',
    paddingTop: '8px',
    marginTop: '4px',
  },
  grandTotalLabelInvoice: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  grandTotalValInvoice: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#ff3f6c',
  },
  guaranteeBox: {
    backgroundColor: '#fafafa',
    borderLeft: '3px solid #ff3f6c',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  guaranteeText: {
    fontSize: '0.65rem',
    color: '#686b78',
    lineHeight: '1.4',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '8px',
  },
  printBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#282c3f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};
