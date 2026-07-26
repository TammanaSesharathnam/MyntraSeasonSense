import React from 'react';
import CircularScore from '../components/CircularScore';
import { CloudRain, Sun, Cloud, Thermometer, Droplets, Info, AlertTriangle } from 'lucide-react';

export default function AIDashboard({ 
  location, 
  weather, 
  readinessScore, 
  missingEssentials, 
  setActiveTab 
}) {
  const getBigWeatherIcon = (season) => {
    switch (season?.toLowerCase()) {
      case 'monsoon': 
        return <CloudRain size={52} color="#3b82f6" />;
      case 'summer': 
        return <Sun size={52} color="#fbbf24" />;
      case 'winter': 
        return <Cloud size={52} color="#60a5fa" />;
      default: 
        return <Sun size={52} color="#ff3f6c" />;
    }
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      {/* Upper Grid - Climate Forecast & Readiness Circular score */}
      <div style={styles.grid}>
        {/* Weather Prediction Dashboard (Section 3) */}
        <div className="fashion-card" style={styles.weatherCard}>
          <div style={styles.cardHeader}>
            <span style={styles.preTitle}>Local Forecast Center</span>
            <h2 style={styles.cardTitle}>AI Climate Prediction</h2>
          </div>
          
          <div style={styles.weatherBody}>
            <div style={styles.iconCircle}>
              {getBigWeatherIcon(weather?.season)}
            </div>
            <div style={styles.weatherMeta}>
              <span style={styles.city}>{location}</span>
              <span style={styles.seasonLabel}>{weather?.season} Season Predicted</span>
              <span style={styles.condition}>{weather?.condition}</span>
            </div>
          </div>

          <div style={styles.weatherStats}>
            <div style={styles.wStatBox}>
              <Thermometer size={18} color="#ff3f6c" />
              <div>
                <span style={styles.wStatVal}>{weather?.temp}°C</span>
                <span style={styles.wStatLbl}>Temperature</span>
              </div>
            </div>
            <div style={styles.wStatBox}>
              <Droplets size={18} color="#3b82f6" />
              <div>
                <span style={styles.wStatVal}>{weather?.humidity}%</span>
                <span style={styles.wStatLbl}>Humidity Index</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seasonal Readiness Score (Section 8) */}
        <div className="fashion-card" style={styles.readinessCard}>
          <div style={styles.cardHeader}>
            <span style={styles.preTitle}>Diagnostics</span>
            <h2 style={styles.cardTitle}>Wardrobe Readiness</h2>
          </div>
          <div style={styles.readinessBody}>
            <CircularScore score={readinessScore} size={120} strokeWidth={10} />
            <div style={styles.readinessText}>
              <h3 style={styles.readinessTitle}>
                {readinessScore === 100 ? 'Fully Prepared!' : readinessScore > 50 ? 'Partially Prepared' : 'Critically Exposed'}
              </h3>
              <p style={styles.readinessDesc}>
                {readinessScore === 100 
                  ? 'Your wardrobe matches all climate essentials for this region.' 
                  : `You are missing key essentials to safely beat the upcoming ${weather?.season} season.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Missing Essentials & Actions */}
      <div className="fashion-card" style={styles.essentialsCard}>
        <div style={styles.essentialsHeader}>
          <AlertTriangle size={20} color={missingEssentials.length > 0 ? "#ff9f00" : "#10b981"} />
          <h3 style={styles.essentialsTitle}>Wardrobe Gap Analysis</h3>
        </div>

        {missingEssentials.length === 0 ? (
          <div style={styles.fullyReadyMessage}>
            <span style={styles.readySuccessBadge}>✓ 100% Prepared</span>
            <p style={styles.readyText}>Outstanding! You have purchased all predicted essentials for {location}'s {weather?.season} season.</p>
          </div>
        ) : (
          <div style={styles.gapContainer}>
            <p style={styles.gapDesc}>
              Our predictive algorithms suggest these items will undergo sharp demand hikes in {location} soon. Secure them now to guarantee low pricing.
            </p>
            <div style={styles.essentialList}>
              {missingEssentials.map((item, idx) => (
                <div key={idx} style={styles.essentialItem}>
                  <div style={styles.dot} />
                  <span style={styles.essentialName}>{item}</span>
                  <span className="fashion-badge badge-purple" style={styles.essentialTag}>Essential</span>
                </div>
              ))}
            </div>
            <div style={styles.essentialsFooter}>
              <button 
                className="btn-fashion-primary" 
                onClick={() => setActiveTab('recommendation')}
              >
                Buy Missing Essentials
              </button>
              <button 
                className="btn-fashion-secondary" 
                onClick={() => setActiveTab('bundle-builder')}
              >
                Build Personalized AI Kit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* System info advisory */}
      <div style={styles.advisory} className="fashion-card">
        <Info size={16} color="#7c3aed" />
        <span style={styles.advText}>
          Myntra AI recalculates predictions hourly using regional climate indexes and catalog metrics.
        </span>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  weatherCard: {
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    marginBottom: '16px',
  },
  preTitle: {
    fontSize: '0.65rem',
    color: '#ff3f6c',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#282c3f',
    marginTop: '2px',
  },
  weatherBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '12px 0',
  },
  iconCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#fafafa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #eaeaec',
  },
  weatherMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  city: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#282c3f',
  },
  seasonLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#ff3f6c',
  },
  condition: {
    fontSize: '0.85rem',
    color: '#686b78',
  },
  weatherStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    borderTop: '1px solid #f5f5f6',
    paddingTop: '16px',
    marginTop: '16px',
  },
  wStatBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#fafafa',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #eaeaec',
  },
  wStatVal: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#282c3f',
    display: 'block',
  },
  wStatLbl: {
    fontSize: '0.65rem',
    color: '#94969f',
    textTransform: 'uppercase',
  },
  readinessCard: {
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  readinessBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '24px 0',
  },
  readinessText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  readinessTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  readinessDesc: {
    fontSize: '0.85rem',
    color: '#686b78',
    lineHeight: '1.5',
  },
  essentialsCard: {
    padding: '28px',
    backgroundColor: '#ffffff',
  },
  essentialsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid #f5f5f6',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  essentialsTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#282c3f',
  },
  fullyReadyMessage: {
    textAlign: 'center',
    padding: '24px 0',
  },
  readySuccessBadge: {
    backgroundColor: '#e6f7f0',
    color: '#10b981',
    padding: '6px 16px',
    borderRadius: '999px',
    fontWeight: '700',
    fontSize: '0.8rem',
    display: 'inline-block',
    marginBottom: '12px',
  },
  readyText: {
    fontSize: '0.85rem',
    color: '#686b78',
  },
  gapContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  gapDesc: {
    fontSize: '0.85rem',
    color: '#686b78',
  },
  essentialList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  essentialItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#fafafa',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #eaeaec',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#ff3f6c',
  },
  essentialName: {
    flex: 1,
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#282c3f',
  },
  essentialTag: {
    fontSize: '0.65rem',
  },
  essentialsFooter: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  advisory: {
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#f3e8ff',
    borderColor: '#e9d5ff',
    borderRadius: '8px',
  },
  advText: {
    fontSize: '0.8rem',
    color: '#7c3aed',
  }
};
