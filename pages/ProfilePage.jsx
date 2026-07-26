import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Compass, 
  Settings, 
  ShieldCheck, 
  Mail, 
  LogOut, 
  Lock, 
  Key, 
  CreditCard, 
  Bell, 
  Gift, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  ChevronRight, 
  Check, 
  Info, 
  Award, 
  Zap, 
  Heart, 
  Eye, 
  ShoppingBag,
  Sliders,
  Phone,
  Layers,
  ArrowRight
} from 'lucide-react';
import { authService, utilityService } from '../services/api';

const PRESETS_PREFS = [
  'Casual',
  'Streetwear',
  'Ethnic',
  'Minimal',
  'Luxury',
  'Sports',
  'Formal',
  'Office',
  'Oversized',
  'Vintage'
];

export default function ProfilePage({ 
  currentUser,
  setCurrentUser,
  location, 
  setLocation, 
  userBudget, 
  setUserBudget, 
  userPrefs, 
  setUserPrefs,
  setActiveTab
}) {
  const [authTab, setAuthTab] = useState('login'); // login | register | forgot
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLocation, setRegLocation] = useState('Mumbai');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Edit fields
  const [editUsername, setEditUsername] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('98765 43210');
  const [editGender, setEditGender] = useState('Female');

  // Price locks
  const [priceLocks, setPriceLocks] = useState([]);

  const [isLocating, setIsLocating] = useState(false);
  const [authError, setAuthError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Personalization toggles
  const [personalization, setPersonalization] = useState({
    seasonalRecs: true,
    weatherSuggestions: true,
    localTrending: true,
    festivalRecs: false,
    comboOffers: true,
    priceDropAlerts: true,
    newArrivals: true,
    darkMode: false
  });

  // Floating label active states
  const [focusName, setFocusName] = useState(false);
  const [focusPhone, setFocusPhone] = useState(false);
  const [focusAddress, setFocusAddress] = useState(false);

  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync edit fields on user load
  useEffect(() => {
    if (currentUser) {
      setEditUsername(currentUser.username || '');
      setEditAddress(currentUser.address || '');
      fetchLocks();
    }
  }, [currentUser]);

  const fetchLocks = () => {
    utilityService.getPriceLocks()
      .then(locks => setPriceLocks(locks || []))
      .catch(err => console.error('Error fetching price locks:', err));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMsg('');
    try {
      const data = await authService.login(loginEmail, loginPassword);
      if (data.success) {
        setCurrentUser(data.user);
        setLocation(data.user.location || 'Mumbai');
        setUserBudget(data.user.budget || 5000);
        setUserPrefs(data.user.preferences || ['Casual']);
        setSuccessMsg('Logged in successfully!');
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Invalid credentials. Try user@myntra.com / password123.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMsg('');
    try {
      const data = await authService.register(
        regUsername, 
        regEmail, 
        regPassword, 
        regLocation, 
        userPrefs.length > 0 ? userPrefs : ['Casual'], 
        userBudget
      );
      if (data.success) {
        setSuccessMsg('Registration successful! Please login.');
        setAuthTab('login');
        setLoginEmail(regEmail);
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Registration failed.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMsg('');
    try {
      const data = await authService.resetPassword(resetEmail, resetPassword);
      if (data.success) {
        setSuccessMsg('Password updated successfully! Please login.');
        setAuthTab('login');
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Failed to reset password.');
    }
  };

  const handleSaveProfile = async () => {
    setAuthError('');
    setSuccessMsg('');
    try {
      const data = await authService.updateProfile({
        username: editUsername,
        address: editAddress,
        location,
        budget: userBudget,
        preferences: userPrefs
      });
      if (data.success) {
        setCurrentUser(data.user);
        setSuccessMsg('Profile configurations updated successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setAuthError('Failed to save profile changes.');
    }
  };

  const handlePreferences = (pref) => {
    let updated;
    if (userPrefs.includes(pref)) {
      updated = userPrefs.filter(p => p !== pref);
    } else {
      updated = [...userPrefs, pref];
    }
    setUserPrefs(updated);
  };

  const handleAutoLocate = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      const cities = ['Mumbai', 'Delhi', 'Bangalore'];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      setLocation(randomCity);
      setSuccessMsg(`GPS Sync complete: Switched to ${randomCity}`);
      setTimeout(() => setSuccessMsg(''), 2500);
    }, 1000);
  };

  const handleUnlockLock = async (lockId) => {
    try {
      await utilityService.unlockPrice(lockId);
      fetchLocks();
      setSuccessMsg('Price lock released successfully.');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = () => {
    authService.logout();
    setCurrentUser(null);
    setSuccessMsg('Signed out.');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const togglePersonalization = (key) => {
    setPersonalization(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const calculateCompletion = () => {
    let score = 30; // base score for registered
    if (editUsername) score += 15;
    if (editAddress) score += 15;
    if (editPhone && editPhone !== '98765 43210') score += 10;
    if (userPrefs.length > 0) score += 15;
    if (userBudget !== 5000) score += 15;
    return Math.min(score, 100);
  };

  const profileCompletion = calculateCompletion();
  const budgetRange = userBudget <= 5000 ? 'Budget Friendly' : userBudget <= 10000 ? 'Balanced' : 'Premium';

  // 1. UNAUTHENTICATED VIEWS
  if (!currentUser) {
    return (
      <div style={styles.unauthBg}>
        <div style={styles.unauthCard}>
          {/* Brand header */}
          <div style={styles.centerText}>
            <span style={styles.brandBadge}>SS</span>
            <h2 style={styles.unauthTitle}>Myntra Portal</h2>
            <p style={styles.unauthSub}>Myntra AI Wardrobe Planner & Savings Hub</p>
          </div>
          
          {/* Tab Headers */}
          <div style={styles.tabHeaderRow}>
            <button 
              onClick={() => { setAuthTab('login'); setAuthError(''); }}
              style={{
                ...styles.tabBtn,
                borderColor: authTab === 'login' ? '#FF3F6C' : 'transparent',
                color: authTab === 'login' ? '#FF3F6C' : '#696E79'
              }}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setAuthTab('register'); setAuthError(''); }}
              style={{
                ...styles.tabBtn,
                borderColor: authTab === 'register' ? '#FF3F6C' : 'transparent',
                color: authTab === 'register' ? '#FF3F6C' : '#696E79'
              }}
            >
              Register
            </button>
          </div>

          {authError && <p style={styles.alertError}>{authError}</p>}
          {successMsg && <p style={styles.alertSuccess}>{successMsg}</p>}

          {/* LOGIN VIEW */}
          {authTab === 'login' && (
            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="user@myntra.com" 
                  style={styles.formInput}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  style={styles.formInput}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <div style={styles.checkboxRow}>
                <label style={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#FF3F6C' }}
                  /> Remember Me
                </label>
                <button 
                  type="button" 
                  onClick={() => setAuthTab('forgot')}
                  style={styles.forgotBtn}
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" style={styles.gradientBtn}>
                Login with Secure JWT
              </button>
            </form>
          )}

          {/* REGISTER VIEW */}
          {authTab === 'register' && (
            <form onSubmit={handleRegister} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Username</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ananya Sharma" 
                  style={styles.formInput}
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="ananya@example.com" 
                  style={styles.formInput}
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  style={styles.formInput}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Default Weather Center</label>
                <select 
                  style={styles.formSelect}
                  value={regLocation}
                  onChange={(e) => setRegLocation(e.target.value)}
                >
                  <option value="Mumbai">Mumbai (Monsoon)</option>
                  <option value="Delhi">Delhi (Winter)</option>
                  <option value="Bangalore">Bengaluru (Summer)</option>
                </select>
              </div>

              <button type="submit" style={styles.gradientBtn}>
                Create Account
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {authTab === 'forgot' && (
            <form onSubmit={handleResetPassword} style={styles.form}>
              <h3 style={styles.forgotHeader}>Reset Password Credentials</h3>
              <p style={styles.forgotSubText}>Directly replace password in local database storage.</p>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Registered Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="user@myntra.com" 
                  style={styles.formInput}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>New Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  style={styles.formInput}
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                />
              </div>

              <div style={styles.flexRowGap}>
                <button 
                  type="button" 
                  onClick={() => setAuthTab('login')} 
                  style={styles.outlineBtnSimple}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.primaryBtnSimple}>
                  Save Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED LOGGED IN VIEW
  return (
    <div style={styles.authBg}>
      <div style={styles.mainWrapper}>
        
        {/* Success Alert Banner */}
        {successMsg && (
          <div style={styles.alertSuccessBanner}>
            <Check size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: (isMobile || isTablet) ? '1fr' : '1.2fr 2.8fr',
          gap: '32px',
          alignItems: 'start'
        }}>
          
          {/* LEFT SIDEBAR COLUMN */}
          <div style={styles.sidebarColumn}>
            
            {/* 1. Top Hero Profile Card */}
            <div style={styles.heroCard}>
              {/* Profile Avatar */}
              <div style={styles.avatarWrapper}>
                <div style={styles.avatarCircle}>
                  <User size={44} color="#ffffff" />
                </div>
                <span style={styles.eliteBadge}>
                  <Award size={10} color="#facc15" /> Elite Insider
                </span>
              </div>

              {/* User Identity Details */}
              <div style={styles.identityDetails}>
                <h2 style={styles.usernameText}>{currentUser.username}</h2>
                <div style={styles.emailRow}>
                  <Mail size={12} color="#696E79" />
                  <span>{currentUser.email}</span>
                </div>
                <p style={styles.loyaltyText}>Loyalty Level: Gold VIP (1,450 pts)</p>
              </div>

              {/* Profile Completion strength bar */}
              <div style={styles.strengthWrapper}>
                <div style={styles.strengthLabelRow}>
                  <span>Profile Strength</span>
                  <span>{profileCompletion}%</span>
                </div>
                <div style={styles.progressBarTrack}>
                  <div style={{ ...styles.progressBarFill, width: `${profileCompletion}%` }} />
                </div>
              </div>

              {/* Profile Quick Stats rounded pills */}
              <div style={styles.statsGrid}>
                <div style={styles.statPill}>
                  <p style={styles.statVal}>₹{userBudget}</p>
                  <p style={styles.statLabel}>Budget</p>
                </div>
                <div style={styles.statPill}>
                  <p style={styles.statVal}>{location}</p>
                  <p style={styles.statLabel}>Location</p>
                </div>
                <div style={styles.statPill}>
                  <p style={styles.statVal}>{userPrefs.length}</p>
                  <p style={styles.statLabel}>Aesthetics</p>
                </div>
                <div style={styles.statPill}>
                  <p style={styles.statVal}>{priceLocks.length}</p>
                  <p style={styles.statLabel}>Wishlist</p>
                </div>
              </div>

              {/* Streak info */}
              <div style={styles.streakBox}>
                <span style={styles.streakLabel}><Zap size={14} /> Seasonal Streak</span>
                <span style={styles.streakVal}>3 Seasons Active</span>
              </div>
            </div>

            {/* 2. Quick Actions Card */}
            <div style={styles.actionsCard}>
              <h3 style={styles.cardHeaderTitle}>
                <Layers size={18} color="#FF3F6C" /> Quick Actions
              </h3>
              
              <div style={styles.quickActionsGrid}>
                <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} style={styles.quickActionBtn}>
                  <User size={18} color="#696E79" />
                  <span style={styles.quickActionLbl}>Edit Details</span>
                </button>
                <button onClick={() => setActiveTab('orders')} style={styles.quickActionBtn}>
                  <ShoppingBag size={18} color="#696E79" />
                  <span style={styles.quickActionLbl}>My Orders</span>
                </button>
                <button onClick={() => setActiveTab('pricelock')} style={styles.quickActionBtn}>
                  <Heart size={18} color="#696E79" />
                  <span style={styles.quickActionLbl}>Wishlist</span>
                </button>
                <button onClick={() => window.scrollTo({top: 600, behavior: 'smooth'})} style={styles.quickActionBtn}>
                  <MapPin size={18} color="#696E79" />
                  <span style={styles.quickActionLbl}>Addresses</span>
                </button>
                <button onClick={() => alert('Notifications system loaded.')} style={styles.quickActionBtn}>
                  <Bell size={18} color="#696E79" />
                  <span style={styles.quickActionLbl}>Alerts</span>
                </button>
                <button onClick={() => alert('Security center validated.')} style={styles.quickActionBtn}>
                  <ShieldCheck size={18} color="#696E79" />
                  <span style={styles.quickActionLbl}>Privacy</span>
                </button>
                <button onClick={() => alert('Loyalty club: 1,450 points available.')} style={styles.quickActionBtn}>
                  <Gift size={18} color="#696E79" />
                  <span style={styles.quickActionLbl}>Rewards</span>
                </button>
                <button onClick={handleSignOut} style={{ ...styles.quickActionBtn, backgroundColor: '#fef2f2' }}>
                  <LogOut size={18} color="#ef4444" />
                  <span style={{ ...styles.quickActionLbl, color: '#ef4444' }}>Logout</span>
                </button>
              </div>
            </div>

            {/* 3. Your Style DNA Card */}
            <div style={styles.dnaCard}>
              <h3 style={styles.cardHeaderTitle}>
                <Sparkles size={18} color="#7c3aed" /> Your Style DNA
              </h3>
              <p style={styles.cardDescText}>Vector indices matches built dynamically based on your aesthetics choices.</p>
              
              <div style={styles.dnaChipsWrapper}>
                <span style={styles.dnaChipPurple}>Pre-Season Pioneer</span>
                <span style={styles.dnaChipGreen}>Climate Smart</span>
                <span style={styles.dnaChipPink}>Budget Shield Enabled</span>
                {userPrefs.map((p, idx) => (
                  <span key={idx} style={styles.dnaChipBlue}>{p} Enthusiast</span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT EDITABLE CONFIGURATIONS COLUMN */}
          <div style={styles.contentColumn}>
            
            {/* 4. Profile Details Card */}
            <div style={styles.formCard}>
              <h3 style={styles.formCardTitle}>Profile Details</h3>
              <p style={styles.cardDescText}>Manage shipping coordinates, gender identities, and phone records.</p>
              
              <div style={styles.grid2Col}>
                
                {/* Display Name with Floating Label Effect */}
                <div style={styles.inputWrapper}>
                  <input 
                    type="text" 
                    id="username"
                    style={{
                      ...styles.inputField,
                      borderColor: focusName ? '#FF3F6C' : '#EAEAEC',
                    }}
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    onFocus={() => setFocusName(true)}
                    onBlur={() => setFocusName(false)}
                  />
                  <label 
                    htmlFor="username"
                    style={{
                      ...styles.floatingLabel,
                      fontSize: (focusName || editUsername) ? '10px' : '13px',
                      transform: (focusName || editUsername) ? 'translateY(4px)' : 'translateY(16px)',
                      fontWeight: (focusName || editUsername) ? '700' : '500',
                      color: (focusName) ? '#FF3F6C' : '#696E79'
                    }}
                  >
                    Display Name
                  </label>
                </div>

                {/* Email Address (Read-Only) */}
                <div style={styles.inputWrapper}>
                  <input 
                    type="email" 
                    disabled
                    style={styles.disabledInputField}
                    value={currentUser.email}
                  />
                  <label style={{ ...styles.floatingLabel, fontSize: '10px', transform: 'translateY(4px)', fontWeight: '700' }}>
                    Email Address (Account ID)
                  </label>
                </div>

                {/* Phone Number with Floating Label Effect */}
                <div style={styles.inputWrapper}>
                  <input 
                    type="tel" 
                    id="phone"
                    style={{
                      ...styles.inputField,
                      borderColor: focusPhone ? '#FF3F6C' : '#EAEAEC',
                    }}
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    onFocus={() => setFocusPhone(true)}
                    onBlur={() => setFocusPhone(false)}
                  />
                  <label 
                    htmlFor="phone"
                    style={{
                      ...styles.floatingLabel,
                      fontSize: (focusPhone || editPhone) ? '10px' : '13px',
                      transform: (focusPhone || editPhone) ? 'translateY(4px)' : 'translateY(16px)',
                      fontWeight: (focusPhone || editPhone) ? '700' : '500',
                      color: (focusPhone) ? '#FF3F6C' : '#696E79'
                    }}
                  >
                    Phone Number
                  </label>
                </div>

                {/* Gender Selector Buttons */}
                <div style={styles.genderGroup}>
                  <label style={styles.genderLabel}>Gender Identity</label>
                  <div style={styles.genderButtons}>
                    {['Male', 'Female', 'Other'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setEditGender(g)}
                        style={{
                          ...styles.genderBtn,
                          borderColor: editGender === g ? '#FF3F6C' : '#EAEAEC',
                          backgroundColor: editGender === g ? 'rgba(255, 63, 108, 0.05)' : '#ffffff',
                          color: editGender === g ? '#FF3F6C' : '#282C3F'
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shipping Address with Floating Label Effect */}
                <div style={{ ...styles.inputWrapper, gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <input 
                    type="text" 
                    id="address"
                    style={{
                      ...styles.inputField,
                      borderColor: focusAddress ? '#FF3F6C' : '#EAEAEC',
                    }}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    onFocus={() => setFocusAddress(true)}
                    onBlur={() => setFocusAddress(false)}
                  />
                  <label 
                    htmlFor="address"
                    style={{
                      ...styles.floatingLabel,
                      fontSize: (focusAddress || editAddress) ? '10px' : '13px',
                      transform: (focusAddress || editAddress) ? 'translateY(4px)' : 'translateY(16px)',
                      fontWeight: (focusAddress || editAddress) ? '700' : '500',
                      color: (focusAddress) ? '#FF3F6C' : '#696E79'
                    }}
                  >
                    Shipping Destination Address
                  </label>
                </div>
              </div>
            </div>

            {/* 5. Location Sync Card */}
            <div style={styles.locationCard}>
              <div style={styles.locationHeaderRow}>
                <h3 style={styles.cardHeaderTitle}>
                  <MapPin size={18} color="#FF3F6C" /> Live Location Calibration
                </h3>
                <span style={styles.locationPill}>
                  Active Center: {location}
                </span>
              </div>
              
              <p style={styles.cardDescText}>Sync your fashion recommendations with your live location. Myntra AI maps local temperature gradients to secure early prices.</p>
              
              <div style={styles.syncBox}>
                <div style={styles.syncMeta}>
                  <p style={styles.syncTitle}>📍 Current Location Zone: {location}</p>
                  <p style={styles.syncSub}>Last synced: Live GPS calibration active</p>
                </div>
                <button 
                  onClick={handleAutoLocate}
                  disabled={isLocating}
                  style={styles.scanBtn}
                >
                  <Compass size={14} className={isLocating ? 'animate-spin' : ''} />
                  {isLocating ? 'Scanning GPS...' : 'Scan Current Location'}
                </button>
              </div>
            </div>

            {/* 6. Fashion Preferences Card */}
            <div style={styles.formCard}>
              <h3 style={styles.cardHeaderTitle}>
                <Sliders size={18} color="#FF3F6C" /> Personal Style Preferences
              </h3>
              <p style={styles.cardDescText}>Select wardrobe styles to customize the ML recomendations feeds. Outfits satisfying these aesthetics will be marked with a matching tag.</p>
              
              <div style={styles.chipsWrapper}>
                {PRESETS_PREFS.map(pref => {
                  const active = userPrefs.includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => handlePreferences(pref)}
                      style={{
                        ...styles.chipBtn,
                        borderColor: active ? '#FF3F6C' : '#EAEAEC',
                        backgroundColor: active ? '#FF3F6C' : '#ffffff',
                        color: active ? '#ffffff' : '#282C3F',
                        fontWeight: active ? '700' : '500'
                      }}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Budget Limit Card */}
            <div style={styles.formCard}>
              <div style={styles.budgetHeaderRow}>
                <h3 style={styles.cardHeaderTitle}>Wardrobe Budget Threshold</h3>
                <span style={styles.budgetValueText}>₹{userBudget}</span>
              </div>
              <p style={styles.cardDescText}>Set spending thresholds. Our pre-season bundle algorithm builds optimal combos fitting within this budget.</p>
              
              <div style={styles.sliderWrapper}>
                <input 
                  type="range" 
                  min="2000" 
                  max="15000" 
                  step="500"
                  value={userBudget}
                  onChange={(e) => setUserBudget(parseInt(e.target.value))}
                  style={styles.rangeSlider}
                />
                
                <div style={styles.sliderLabels}>
                  <span style={{ color: userBudget <= 5000 ? '#FF3F6C' : '#696E79', fontWeight: userBudget <= 5000 ? '700' : '500' }}>Budget Friendly (Min ₹2000)</span>
                  <span style={{ color: (userBudget > 5000 && userBudget <= 10000) ? '#FF3F6C' : '#696E79', fontWeight: (userBudget > 5000 && userBudget <= 10000) ? '700' : '500' }}>Balanced (₹5k - ₹10k)</span>
                  <span style={{ color: userBudget > 10000 ? '#FF3F6C' : '#696E79', fontWeight: userBudget > 10000 ? '700' : '500' }}>Premium (Max ₹15000)</span>
                </div>
              </div>
            </div>

            {/* 8. Personalization switches */}
            <div style={styles.formCard}>
              <h3 style={styles.cardHeaderTitle}>Aesthetic Personalization</h3>
              <p style={styles.cardDescText}>Toggle specific parameters mapping recommendation models.</p>
              
              <div style={styles.switchesGrid}>
                {[
                  { key: 'seasonalRecs', label: 'Seasonal Recommendations', desc: 'Predictive catalog feeds' },
                  { key: 'weatherSuggestions', label: 'Weather-based Suggestions', desc: 'Live temperature tracking adjustments' },
                  { key: 'localTrending', label: 'Local Trending Fashion', desc: 'Delhi/Mumbai regional fashion stats' },
                  { key: 'festivalRecs', label: 'Festival Recommendations', desc: 'Festive wardrobe outfits suggestions' },
                  { key: 'comboOffers', label: 'Combo Offers', desc: 'Unlock Smart Choice Bundle discounts' },
                  { key: 'priceDropAlerts', label: 'Price Drop Alerts', desc: 'Instant warning of cost changes' },
                  { key: 'newArrivals', label: 'New Arrival Alerts', desc: 'Early alerts for catalog updates' },
                  { key: 'darkMode', label: 'Dark Mode Theme', desc: 'Toggle dark interface' }
                ].map(item => (
                  <div key={item.key} style={styles.switchRow}>
                    <div>
                      <p style={styles.switchLabel}>{item.label}</p>
                      <p style={styles.switchDesc}>{item.desc}</p>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => togglePersonalization(item.key)}
                      style={{
                        ...styles.switchTrack,
                        backgroundColor: personalization[item.key] ? '#03A685' : '#D4D5D9'
                      }}
                    >
                      <div 
                        style={{
                          ...styles.switchKnob,
                          left: personalization[item.key] ? '26px' : '4px'
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 9. Security Card */}
            <div style={styles.formCard}>
              <h3 style={styles.cardHeaderTitle}>Security & Access Management</h3>
              <p style={styles.cardDescText}>Hardened token validations and local session parameters.</p>
              
              <div style={styles.securityGrid}>
                <button 
                  type="button"
                  onClick={() => alert('Password modification portal initialized.')}
                  style={styles.securityBtn}
                >
                  <span style={styles.securityBtnLeft}>
                    <Key size={14} color="#696E79" /> Change Account Password
                  </span>
                  <ChevronRight size={14} color="#696E79" />
                </button>

                <button 
                  type="button"
                  onClick={() => alert('Two-factor auth ledger active.')}
                  style={styles.securityBtn}
                >
                  <span style={styles.securityBtnLeft}>
                    <Smartphone size={14} color="#696E79" /> Two-Factor Authentication
                  </span>
                  <ChevronRight size={14} color="#696E79" />
                </button>

                <button 
                  type="button"
                  onClick={() => alert('Current session: Windows WebBrowser (Delhi, India)')}
                  style={styles.securityBtn}
                >
                  <span style={styles.securityBtnLeft}>
                    <Monitor size={14} color="#696E79" /> Manage Active Devices
                  </span>
                  <ChevronRight size={14} color="#696E79" />
                </button>

                <button 
                  type="button"
                  onClick={() => alert('Privacy configuration: telemetry sharing blocked.')}
                  style={styles.securityBtn}
                >
                  <span style={styles.securityBtnLeft}>
                    <Lock size={14} color="#696E79" /> Privacy & Telemetry Settings
                  </span>
                  <ChevronRight size={14} color="#696E79" />
                </button>
              </div>
            </div>

            {/* 10. Footer Action Buttons */}
            <div style={styles.footerActions}>
              <button
                type="button"
                onClick={() => {
                  setEditUsername(currentUser.username);
                  setEditAddress(currentUser.address);
                  setEditPhone('98765 43210');
                  setEditGender('Female');
                }}
                style={styles.footerResetBtn}
              >
                Reset Preferences
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                style={styles.footerLogoutBtn}
              >
                Logout
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                style={styles.footerSaveBtn}
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Save Button for Mobile / Small Screens */}
      {isMobile && (
        <div style={styles.stickyFooterMobile}>
          <button
            type="button"
            onClick={handleSignOut}
            style={styles.mobileLogoutBtn}
          >
            Logout
          </button>
          <button
            type="button"
            onClick={handleSaveProfile}
            style={styles.mobileSaveBtn}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  // Unauth View Styles
  unauthBg: {
    backgroundColor: '#F8F9FB',
    minHeight: '75vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  unauthCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #EAEAEC',
    borderRadius: '18px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '400px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  centerText: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  brandBadge: {
    backgroundColor: '#FF3F6C',
    color: '#ffffff',
    fontWeight: '900',
    fontSize: '1.2rem',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(255, 63, 108, 0.2)',
  },
  unauthTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#282C3F',
  },
  unauthSub: {
    fontSize: '12px',
    color: '#696E79',
  },
  tabHeaderRow: {
    display: 'flex',
    borderBottom: '1px solid #EAEAEC',
  },
  tabBtn: {
    flex: 1,
    paddingBottom: '12px',
    fontSize: '14px',
    fontWeight: '700',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  alertError: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '12px',
    fontWeight: '700',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
  },
  alertSuccess: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    fontSize: '12px',
    fontWeight: '700',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #bbf7d0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#282C3F',
  },
  formInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #EAEAEC',
    fontSize: '14px',
    color: '#282C3F',
    outline: 'none',
    boxSizing: 'border-box',
  },
  formSelect: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #EAEAEC',
    fontSize: '14px',
    color: '#282C3F',
    backgroundColor: '#ffffff',
    outline: 'none',
  },
  checkboxRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#696E79',
    cursor: 'pointer',
  },
  forgotBtn: {
    background: 'none',
    border: 'none',
    color: '#FF3F6C',
    fontWeight: '700',
    cursor: 'pointer',
  },
  gradientBtn: {
    height: '48px',
    borderRadius: '24px',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '14px',
    border: 'none',
    background: 'linear-gradient(90deg, #FF3F6C 0%, #FF527B 100%)',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255, 63, 108, 0.2)',
  },
  forgotHeader: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#282C3F',
    textTransform: 'uppercase',
  },
  forgotSubText: {
    fontSize: '10px',
    color: '#696E79',
  },
  flexRowGap: {
    display: 'flex',
    gap: '16px',
    marginTop: '8px',
  },
  outlineBtnSimple: {
    flex: 1,
    padding: '10px',
    borderRadius: '12px',
    border: '1px solid #EAEAEC',
    color: '#282C3F',
    fontSize: '12px',
    fontWeight: '700',
    background: 'none',
    cursor: 'pointer',
  },
  primaryBtnSimple: {
    flex: 1,
    padding: '10px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#FF3F6C',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  // Auth Authenticated View Styles
  authBg: {
    backgroundColor: '#F8F9FB',
    minHeight: '100vh',
    padding: '40px 0',
  },
  mainWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  alertSuccessBanner: {
    backgroundColor: '#f0fdf4',
    color: '#03A685',
    fontSize: '14px',
    fontWeight: '600',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #bbf7d0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sidebarColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  contentColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    border: '1px solid rgba(234, 234, 236, 0.8)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarWrapper: {
    position: 'relative',
    marginTop: '8px',
  },
  avatarCircle: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF3F6C 0%, #FF527B 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(255, 63, 108, 0.2)',
  },
  eliteBadge: {
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#282C3F',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '9px',
    textTransform: 'uppercase',
    padding: '4px 12px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
  },
  identityDetails: {
    textAlign: 'center',
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  usernameText: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#282C3F',
  },
  emailRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#696E79',
  },
  loyaltyText: {
    fontSize: '11px',
    color: '#03A685',
    fontWeight: '700',
    marginTop: '4px',
  },
  strengthWrapper: {
    width: '100%',
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  strengthLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    fontWeight: '700',
    color: '#282C3F',
  },
  progressBarTrack: {
    width: '100%',
    height: '8px',
    backgroundColor: '#EAEAEC',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #FF3F6C 0%, #FF527B 100%)',
    borderRadius: '4px',
    transition: 'all 0.5s ease-out',
  },
  statsGrid: {
    width: '100%',
    marginTop: '24px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    borderTop: '1px solid #EAEAEC',
    paddingTop: '20px',
  },
  statPill: {
    backgroundColor: '#F8F9FB',
    borderRadius: '12px',
    padding: '12px',
    textAlign: 'center',
    border: '1px solid #EAEAEC',
  },
  statVal: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#282C3F',
  },
  statLabel: {
    fontSize: '9px',
    color: '#696E79',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginTop: '2px',
  },
  streakBox: {
    width: '100%',
    backgroundColor: '#fff5f7',
    border: '1px solid #ffe4e6',
    borderRadius: '12px',
    padding: '12px',
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    boxSizing: 'border-box',
  },
  streakLabel: {
    fontWeight: '600',
    color: '#FF3F6C',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  streakVal: {
    fontWeight: '800',
    color: '#FF3F6C',
  },
  actionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    border: '1px solid #EAEAEC',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cardHeaderTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#282C3F',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  quickActionBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '14px',
    backgroundColor: '#F8F9FB',
    borderRadius: '12px',
    border: '1px solid #EAEAEC',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  quickActionLbl: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#282C3F',
    marginTop: '8px',
  },
  dnaCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    border: '1px solid #EAEAEC',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardDescText: {
    fontSize: '12px',
    color: '#696E79',
    lineHeight: '1.5',
  },
  dnaChipsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  dnaChipPurple: {
    fontSize: '10px',
    padding: '6px 12px',
    backgroundColor: '#f5f3ff',
    color: '#7c3aed',
    border: '1px solid #ddd6fe',
    borderRadius: '20px',
    fontWeight: '700',
  },
  dnaChipGreen: {
    fontSize: '10px',
    padding: '6px 12px',
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #bbf7d0',
    borderRadius: '20px',
    fontWeight: '700',
  },
  dnaChipPink: {
    fontSize: '10px',
    padding: '6px 12px',
    backgroundColor: '#fff1f2',
    color: '#e11d48',
    border: '1px solid #fecdd3',
    borderRadius: '20px',
    fontWeight: '700',
  },
  dnaChipBlue: {
    fontSize: '10px',
    padding: '6px 12px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    borderRadius: '20px',
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  // Editable configurations cards
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    border: '1px solid #EAEAEC',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formCardTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#282C3F',
  },
  grid2Col: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    paddingTop: '8px',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  inputField: {
    width: '100%',
    padding: '24px 16px 8px 16px',
    borderRadius: '12px',
    border: '1px solid #EAEAEC',
    color: '#282C3F',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
  },
  disabledInputField: {
    width: '100%',
    padding: '24px 16px 8px 16px',
    borderRadius: '12px',
    border: '1px solid #EAEAEC',
    backgroundColor: '#F8F9FB',
    color: '#696E79',
    fontSize: '14px',
    cursor: 'not-allowed',
    boxSizing: 'border-box',
  },
  floatingLabel: {
    position: 'absolute',
    left: '16px',
    top: '0px',
    pointerEvents: 'none',
    transition: 'all 0.2s ease-out',
  },
  genderGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  genderLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#696E79',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  genderButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '10px',
  },
  genderBtn: {
    padding: '12px',
    borderRadius: '12px',
    border: '1.5px solid',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },

  locationCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    border: '1px solid #EAEAEC',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  locationHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  locationPill: {
    fontSize: '12px',
    padding: '4px 14px',
    backgroundColor: '#fff1f2',
    color: '#FF3F6C',
    fontWeight: '750',
    borderRadius: '20px',
  },
  syncBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '16px',
    backgroundColor: '#F8F9FB',
    borderRadius: '12px',
    border: '1px solid #EAEAEC',
    gap: '16px',
  },
  syncMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  syncTitle: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#282C3F',
  },
  syncSub: {
    fontSize: '10px',
    color: '#696E79',
  },
  scanBtn: {
    height: '44px',
    padding: '0 24px',
    borderRadius: '22px',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '12px',
    border: 'none',
    background: 'linear-gradient(90deg, #FF3F6C 0%, #FF527B 100%)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(255, 63, 108, 0.15)',
  },

  chipsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    paddingTop: '8px',
  },
  chipBtn: {
    padding: '10px 20px',
    borderRadius: '20px',
    border: '1.5px solid',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },

  budgetHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  budgetValueText: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#FF3F6C',
  },
  sliderWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingTop: '8px',
  },
  rangeSlider: {
    width: '100%',
    accentColor: '#FF3F6C',
    cursor: 'pointer',
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
  },

  switchesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    paddingTop: '8px',
  },
  switchRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#F8F9FB',
    borderRadius: '12px',
    border: '1px solid #EAEAEC',
  },
  switchLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#282C3F',
  },
  switchDesc: {
    fontSize: '10px',
    color: '#696E79',
    marginTop: '2px',
  },
  switchTrack: {
    width: '48px',
    height: '24px',
    borderRadius: '12px',
    position: 'relative',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  switchKnob: {
    width: '16px',
    height: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    position: 'absolute',
    top: '4px',
    transition: 'all 0.3s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
  },

  securityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '12px',
    paddingTop: '8px',
  },
  securityBtn: {
    height: '44px',
    padding: '0 16px',
    borderRadius: '12px',
    border: '1px solid #EAEAEC',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  securityBtnLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#282C3F',
  },

  footerActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTop: '1px solid #EAEAEC',
    paddingTop: '24px',
    marginTop: '12px',
  },
  footerResetBtn: {
    height: '48px',
    padding: '0 24px',
    borderRadius: '24px',
    border: '1px solid #EAEAEC',
    fontSize: '12px',
    fontWeight: '700',
    color: '#282C3F',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  footerLogoutBtn: {
    height: '48px',
    padding: '0 24px',
    borderRadius: '24px',
    border: '1px solid #EAEAEC',
    fontSize: '12px',
    fontWeight: '700',
    color: '#ef4444',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  footerSaveBtn: {
    height: '48px',
    padding: '0 32px',
    borderRadius: '24px',
    border: 'none',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '12px',
    background: 'linear-gradient(90deg, #FF3F6C 0%, #FF527B 100%)',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255, 63, 108, 0.2)',
    transition: 'all 0.2s',
  },

  stickyFooterMobile: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTop: '1px solid #EAEAEC',
    padding: '16px',
    display: 'flex',
    gap: '16px',
    zIndex: 1000,
    boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
  },
  mobileLogoutBtn: {
    flex: 1,
    height: '48px',
    borderRadius: '24px',
    border: '1px solid #EAEAEC',
    fontSize: '12px',
    fontWeight: '700',
    color: '#ef4444',
    backgroundColor: '#ffffff',
  },
  mobileSaveBtn: {
    flex: 2,
    height: '48px',
    borderRadius: '24px',
    border: 'none',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '12px',
    background: 'linear-gradient(90deg, #FF3F6C 0%, #FF527B 100%)',
  }
};
