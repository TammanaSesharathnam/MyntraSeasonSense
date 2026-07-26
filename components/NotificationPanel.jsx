import React from 'react';
import { motion } from 'framer-motion';
import { X, CloudRain, ShieldCheck, Tag, Sparkles, Clock } from 'lucide-react';

export default function NotificationPanel({ notifications, onClose, setActiveTab }) {
  const getIcon = (type) => {
    switch (type) {
      case 'weather': return <CloudRain size={18} color="#3b82f6" />;
      case 'price_lock': return <Tag size={18} color="#7c3aed" />;
      case 'bundle': return <Sparkles size={18} color="#ff3f6c" />;
      default: return <Clock size={18} color="#686b78" />;
    }
  };

  const handleAction = (type) => {
    onClose();
    if (type === 'price_lock') {
      setActiveTab('price-lock');
    } else if (type === 'bundle') {
      setActiveTab('bundle-builder');
    } else {
      setActiveTab('recommendation');
    }
  };

  return (
    <div style={styles.overlay}>
      {/* Backdrop */}
      <motion.div 
        style={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <motion.div 
        style={styles.panel}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
      >
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>Smart Alerts</h3>
            <p style={styles.sub}>Climate & Saving updates</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          {notifications.length === 0 ? (
            <div style={styles.empty}>
              <ShieldCheck size={32} color="#10b981" />
              <p style={styles.emptyText}>All caught up! No active climate threats or discount drops.</p>
            </div>
          ) : (
            <div style={styles.list}>
              {notifications.map(n => (
                <div key={n.id} style={styles.card} className="fashion-card">
                  <div style={styles.cardHeader}>
                    {getIcon(n.type)}
                    <span style={styles.cardTitle}>{n.title}</span>
                  </div>
                  <p style={styles.cardText}>{n.message}</p>
                  <div style={styles.cardFooter}>
                    <span style={styles.timeText}>Just Now</span>
                    <button 
                      style={styles.actionBtn}
                      onClick={() => handleAction(n.type)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: '#000',
  },
  panel: {
    position: 'relative',
    width: '380px',
    maxWidth: '100vw',
    height: '100%',
    background: '#ffffff',
    boxShadow: '-4px 0 24px rgba(40,44,63,0.15)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '24px 20px',
    borderBottom: '1px solid #f5f5f6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  sub: {
    fontSize: '0.75rem',
    color: '#686b78',
    marginTop: '2px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#686b78',
    padding: '4px',
  },
  body: {
    padding: '20px 16px',
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#fafafa',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '48px 16px',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: '0.8rem',
    color: '#686b78',
    lineHeight: '1.4',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    padding: '16px',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  cardText: {
    fontSize: '0.78rem',
    color: '#686b78',
    lineHeight: '1.45',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
  },
  timeText: {
    fontSize: '0.7rem',
    color: '#94969f',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: '#ff3f6c',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  }
};
