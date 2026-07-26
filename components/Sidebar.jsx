import React from 'react';
import {
  Home,
  User,
  CloudLightning,
  Sparkles,
  Percent,
  Gift,
  Lock,
  Compass,
  Bell,
  Settings,
  BarChart3,
  CreditCard,
  CheckCircle,
  ShoppingBag
} from 'lucide-react';

const sidebarItems = [
  { id: 'landing', label: '1. Landing Page', icon: Home },
  { id: 'profile', label: '2. Login & Profile', icon: User },
  { id: 'prediction', label: '3. AI Prediction Dashboard', icon: CloudLightning },
  { id: 'recommendation', label: '4. Product Recommendation', icon: Sparkles },
  { id: 'smart-savings', label: '5. Smart Savings (USP)', icon: Percent },
  { id: 'bundle-builder', label: '6. AI Bundle Builder', icon: Gift },
  { id: 'price-lock', label: '7. Price Lock', icon: Lock },
  { id: 'seasonal-readiness', label: '8. Seasonal Readiness', icon: Compass },
  { id: 'notifications', label: '9. Smart Notifications', icon: Bell },
  { id: 'admin', label: '10. Admin Dashboard', icon: Settings },
  { id: 'analytics', label: '11. Analytics Dashboard', icon: BarChart3 },
  { id: 'checkout', label: '12. Checkout', icon: CreditCard },
  { id: 'success', label: '13. Success Page', icon: CheckCircle },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <ShoppingBag size={28} color="#ff3f6c" style={styles.logoIcon} />
        <div>
          <h2 style={styles.logoText}>Myntra</h2>
          <span style={styles.logoSubtext}>Myntra AI</span>
        </div>
      </div>
      <nav style={styles.nav}>
        {sidebarItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navItem,
                backgroundColor: isActive ? 'rgba(255, 63, 108, 0.15)' : 'transparent',
                borderColor: isActive ? '#ff3f6c' : 'transparent',
                color: isActive ? '#ff3f6c' : '#94a3b8',
              }}
            >
              <Icon size={18} style={styles.icon} />
              <span style={styles.navLabel}>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div style={styles.footer}>
        <span style={styles.version}>v1.2 Blueprint Active</span>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(15, 7, 30, 0.85)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflowY: 'auto',
  },
  logoContainer: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  logoIcon: {
    filter: 'drop-shadow(0 0 8px rgba(255, 63, 108, 0.4))',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '800',
    letterSpacing: '1px',
    color: '#fff',
  },
  logoSubtext: {
    fontSize: '0.75rem',
    color: '#ff3f6c',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid transparent',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  icon: {
    flexShrink: 0,
  },
  navLabel: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    textAlign: 'center',
  },
  version: {
    fontSize: '0.7rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  }
};
