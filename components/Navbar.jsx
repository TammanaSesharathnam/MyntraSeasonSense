import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Bell, 
  Search, 
  MapPin, 
  Compass, 
  CloudRain, 
  Sun, 
  Cloud, 
  ShieldCheck 
} from 'lucide-react';
import NotificationPanel from './NotificationPanel';

export default function Navbar({
  location,
  setLocation,
  weather,
  cart,
  readinessScore,
  notifications,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Check scroll to apply shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.length > 2) {
      const matches = ['Raincoat', 'Puffer Jacket', 'Linen Shirt', 'Thermal Pants', 'Rain Boots', 'Sunglasses']
        .filter(item => item.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (term) => {
    setSearchTerm(term);
    setSuggestions([]);
    setActiveTab('recommendation');
  };

  const getWeatherIcon = (season) => {
    switch (season?.toLowerCase()) {
      case 'monsoon': return <CloudRain size={16} color="#60a5fa" />;
      case 'summer': return <Sun size={16} color="#fbbf24" />;
      case 'winter': return <Cloud size={16} color="#93c5fd" />;
      default: return <Sun size={16} color="#ff3f6c" />;
    }
  };

  return (
    <>
      <header 
        style={{
          ...styles.header,
          boxShadow: isScrolled ? '0 4px 12px rgba(40,44,63,0.08)' : 'none',
          borderBottom: isScrolled ? 'none' : '1px solid #f5f5f6'
        }}
      >
        <div style={styles.navContainer}>
          {/* Logo & Platform Name */}
          <div style={styles.logoGroup} onClick={() => setActiveTab('landing')}>
            <div style={styles.logoBadge}>M</div>
            <span style={styles.logoText}>Myntra</span>
          </div>

          {/* Core Fashion Categories */}
          <nav style={styles.categories}>
            {[
              { label: 'MEN',    gender: 'Men' },
              { label: 'WOMEN',  gender: 'Women' },
              { label: 'KIDS',   gender: 'Kids' },
              { label: 'BEAUTY', style: 'Beauty' },
              { label: 'GENZ',   style: 'GenZ' },
              { label: 'STUDIO', style: 'Studio' },
            ].map(cat => {
              const catKey = cat.gender || cat.style;
              const isActive = selectedCategory === catKey && activeTab === 'recommendation';
              return (
                <span
                  key={cat.label}
                  style={{
                    ...styles.catLink,
                    color: isActive ? '#ff3f6c' : '#282c3f',
                    borderBottom: isActive ? '2px solid #ff3f6c' : '2px solid transparent',
                  }}
                  onClick={() => {
                    setSelectedCategory(catKey);
                    setActiveTab('recommendation');
                  }}
                >
                  {cat.label}
                </span>
              );
            })}
          </nav>

          {/* Centered Search Bar */}
          <div style={styles.searchContainer}>
            <div style={styles.searchBar}>
              <Search size={18} color="#686b78" />
              <input 
                type="text" 
                placeholder="Search for brands, seasonal essentials..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={styles.searchInput}
              />
            </div>
            {suggestions.length > 0 && (
              <div style={styles.suggestions}>
                {suggestions.map((item, idx) => (
                  <div 
                    key={idx} 
                    style={styles.sItem}
                    onClick={() => handleSuggestionSelect(item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location & Climate Widget */}
          <div style={styles.climateWidget}>
            <div style={styles.weatherStat}>
              {getWeatherIcon(weather?.season)}
              <span style={styles.weatherText}>{weather?.temp}°C</span>
            </div>
            <div style={styles.locationSelector}>
              <MapPin size={14} color="#ff3f6c" />
              <select 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                style={styles.locSelect}
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
              </select>
            </div>
          </div>

          {/* Utility Icons */}
          <div style={styles.utilityIcons}>
            {/* Readiness score pill */}
            <div 
              style={styles.readinessPill} 
              onClick={() => setActiveTab('seasonal-readiness')}
              title="Seasonal Readiness"
            >
              <ShieldCheck size={16} color="#10b981" />
              <span style={styles.readinessTextSpan}>{readinessScore}%</span>
            </div>

            {/* Profile */}
            <div 
              style={styles.iconItem} 
              onClick={() => setActiveTab('profile')}
              title="Profile"
            >
              <User size={20} color="#282c3f" />
              <span style={styles.iconLabel}>Profile</span>
            </div>

            {/* Wishlist / Price Lock */}
            <div 
              style={styles.iconItem} 
              onClick={() => setActiveTab('price-lock')}
              title="Wishlist (Price Lock)"
            >
              <Heart size={20} color="#282c3f" />
              <span style={styles.iconLabel}>Wishlist</span>
            </div>

            {/* Cart */}
            <div 
              style={styles.iconItem} 
              onClick={() => setActiveTab('checkout')}
              title="Shopping Cart"
            >
              <div style={styles.cartWrapper}>
                <ShoppingBag size={20} color="#282c3f" />
                {cart.length > 0 && (
                  <span style={styles.badge}>{cart.length}</span>
                )}
              </div>
              <span style={styles.iconLabel}>Bag</span>
            </div>

            {/* Notifications */}
            <div 
              style={styles.iconItem} 
              onClick={() => setShowNotifications(true)}
              title="Notifications"
            >
              <div style={styles.cartWrapper}>
                <Bell size={20} color="#282c3f" />
                {notifications.length > 0 && (
                  <span style={styles.badge}>{notifications.length}</span>
                )}
              </div>
              <span style={styles.iconLabel}>Alerts</span>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out notifications panel */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationPanel 
            notifications={notifications} 
            onClose={() => setShowNotifications(false)}
            setActiveTab={setActiveTab}
          />
        )}
      </AnimatePresence>
    </>
  );
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    left: 0,
    width: '100%',
    height: '80px',
    backgroundColor: '#ffffff',
    zIndex: 900,
    transition: 'all 0.25s ease'
  },
  navContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    height: '100%',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px'
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer'
  },
  logoBadge: {
    backgroundColor: '#ff3f6c',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '1.2rem',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(255, 63, 108, 0.25)'
  },
  logoText: {
    fontWeight: '800',
    fontSize: '1.15rem',
    color: '#282c3f',
    letterSpacing: '-0.5px'
  },
  categories: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  },
  catLink: {
    fontWeight: '700',
    fontSize: '0.85rem',
    color: '#282c3f',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'color 0.2s',
    borderBottom: '2px solid transparent',
    padding: '28px 0'
  },
  searchContainer: {
    flex: 1,
    maxWidth: '380px',
    position: 'relative'
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f5f5f6',
    border: '1px solid transparent',
    borderRadius: '8px',
    padding: '8px 16px',
    height: '40px',
    transition: 'all 0.2s'
  },
  searchInput: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '0.85rem',
    color: '#282c3f'
  },
  suggestions: {
    position: 'absolute',
    top: '46px',
    left: 0,
    width: '100%',
    backgroundColor: '#ffffff',
    border: '1px solid #eaeaec',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    zIndex: 950
  },
  sItem: {
    padding: '10px 16px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  climateWidget: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#fafafa',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid #eaeaec'
  },
  weatherStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderRight: '1px solid #eaeaec',
    paddingRight: '10px'
  },
  weatherText: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#282c3f'
  },
  locationSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  locSelect: {
    border: 'none',
    background: 'transparent',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#282c3f',
    outline: 'none',
    cursor: 'pointer'
  },
  utilityIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  readinessPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#e6f7f0',
    padding: '6px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#10b981'
  },
  readinessTextSpan: {
    color: '#10b981'
  },
  iconItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    gap: '2px'
  },
  iconLabel: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: '#282c3f',
    textTransform: 'uppercase'
  },
  cartWrapper: {
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: '-6px',
    right: '-8px',
    backgroundColor: '#ff3f6c',
    color: '#ffffff',
    fontSize: '0.6rem',
    fontWeight: '800',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
