import express from 'express';
import cors from 'cors';
import {
  initialCampaigns,
  initialProducts,
  initialWeatherPresets,
  initialAnalytics
} from './data.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory "Database" state
let products = [...initialProducts];
let campaigns = [...initialCampaigns];
let weatherPresets = { ...initialWeatherPresets };
let analytics = { ...initialAnalytics };
let priceLocks = [];
let orders = [];

// Helper to calculate readiness score based on weather and order history
function calculateReadiness(location, userItems = []) {
  const weather = weatherPresets[location] || weatherPresets['Mumbai'];
  const totalEssentials = products.filter(p => p.category === weather.season && p.essentials).map(p => p.name);
  if (totalEssentials.length === 0) return 100;
  
  // Find which essentials the user has purchased
  const ownedEssentials = totalEssentials.filter(essential => 
    userItems.some(item => item.name.toLowerCase().includes(essential.toLowerCase()))
  );

  const score = Math.round((ownedEssentials.length / totalEssentials.length) * 100);
  const missing = totalEssentials.filter(essential => 
    !userItems.some(item => item.name.toLowerCase().includes(essential.toLowerCase()))
  );

  return {
    score,
    missingEssentials: missing
  };
}

// 1. Weather and predicted season
app.get('/api/weather', (req, res) => {
  const { location } = req.query;
  const currentCity = location || 'Mumbai';
  const weather = weatherPresets[currentCity] || {
    temp: 22,
    humidity: 70,
    condition: 'Overcast',
    season: 'Autumn',
    readinessScore: 50,
    missingEssentials: []
  };

  res.json({
    location: currentCity,
    ...weather
  });
});

// 2. Product Catalog
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  if (category) {
    return res.json(products.filter(p => p.category.toLowerCase() === category.toLowerCase()));
  }
  res.json(products);
});

// 3. Campaigns List
app.get('/api/campaigns', (req, res) => {
  res.json(campaigns.filter(c => c.active));
});

// 4. AI Bundle Builder Wizard
app.post('/api/bundles/generate', (req, res) => {
  const { season, budget, preferences } = req.body;
  
  // Filter products by season
  const seasonalProducts = products.filter(p => p.category.toLowerCase() === season.toLowerCase());
  
  // Greedy select items that fit budget and preferences
  let selected = [];
  let remainingBudget = budget || 5000;
  
  // Sort essentials first
  const sortedProducts = [...seasonalProducts].sort((a, b) => {
    if (a.essentials && !b.essentials) return -1;
    if (!a.essentials && b.essentials) return 1;
    return b.aiConfidence - a.aiConfidence;
  });

  for (const product of sortedProducts) {
    if (product.price <= remainingBudget) {
      selected.push(product);
      remainingBudget -= product.price;
    }
  }

  // Calculate bundle price and total discount
  const originalTotal = selected.reduce((sum, p) => sum + p.originalPrice, 0);
  const bundleTotal = selected.reduce((sum, p) => sum + p.price, 0);
  const comboSavings = originalTotal - bundleTotal;
  
  // Add a bundle-specific discount (e.g. extra 10% for package)
  const finalBundlePrice = Math.round(bundleTotal * 0.9);
  const finalSavings = originalTotal - finalBundlePrice;

  res.json({
    bundleName: `${season} AI-Curated Kit`,
    items: selected,
    originalTotal,
    bundleTotal: finalBundlePrice,
    savings: finalSavings,
    valueIndex: selected.length > 0 ? Math.round((finalSavings / originalTotal) * 100) : 0
  });
});

// 5. Price Lock endpoints
app.get('/api/pricelocks', (req, res) => {
  res.json(priceLocks);
});

app.post('/api/pricelock', (req, res) => {
  const { productId, lockFee, userLocation } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existingLock = priceLocks.find(l => l.product.id === productId);
  if (existingLock) {
    return res.json(existingLock);
  }

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30); // 30 days lock

  const newLock = {
    id: `lock-${Date.now()}`,
    product,
    lockedPrice: product.price,
    lockFee: lockFee || 99,
    expiresAt: expiryDate.toISOString(),
    daysRemaining: 30
  };

  priceLocks.push(newLock);
  
  // Record price lock in analytics
  analytics.sales += 1;
  analytics.revenue += newLock.lockFee;

  res.json(newLock);
});

// Delete price lock (unlocked or purchased)
app.delete('/api/pricelock/:id', (req, res) => {
  const { id } = req.params;
  priceLocks = priceLocks.filter(lock => lock.id !== id);
  res.json({ success: true, message: 'Price lock removed' });
});

// 6. Analytics dashboard data
app.get('/api/analytics', (req, res) => {
  res.json(analytics);
});

// 7. Checkout process
app.post('/api/checkout', (req, res) => {
  const { items, selectedDiscountType, location } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  const originalTotal = items.reduce((sum, item) => sum + (item.originalPrice || item.price * 1.4), 0);
  let checkoutTotal = items.reduce((sum, item) => sum + item.price, 0);
  
  let appliedDiscount = 'none';
  if (selectedDiscountType === 'instant_20') {
    checkoutTotal = Math.round(checkoutTotal * 0.8);
    appliedDiscount = '20% Instant Discount';
  } else if (selectedDiscountType === 'combo_offer') {
    // Curated combo savings applied
    checkoutTotal = Math.round(checkoutTotal * 0.85); // 15% average combo bonus
    appliedDiscount = 'AI Combo Special Savings';
  }

  const orderId = `order-${Math.floor(100000 + Math.random() * 900000)}`;
  const newOrder = {
    orderId,
    items,
    originalTotal: Math.round(originalTotal),
    checkoutTotal,
    discountApplied: appliedDiscount,
    savings: Math.round(originalTotal - checkoutTotal),
    date: new Date().toISOString()
  };

  orders.push(newOrder);

  // Update backend analytics
  analytics.sales += items.length;
  analytics.revenue += checkoutTotal;
  
  // Calculate new readiness score
  const readiness = calculateReadiness(location || 'Mumbai', items);
  
  res.json({
    success: true,
    order: newOrder,
    readinessScore: readiness.score,
    missingEssentials: readiness.missingEssentials
  });
});

// 8. Notifications Center
app.get('/api/notifications', (req, res) => {
  const { location } = req.query;
  const city = location || 'Mumbai';
  const weather = weatherPresets[city] || weatherPresets['Mumbai'];
  
  const notifications = [
    {
      id: 'notif-1',
      type: 'weather',
      title: `${weather.season} Alert for ${city}`,
      message: `Weather is currently ${weather.condition} at ${weather.temp}°C. Check your seasonal readiness.`,
      time: 'Just now'
    },
    {
      id: 'notif-2',
      type: 'deal',
      title: 'Combo Savings unlocked!',
      message: 'Choose 20% Instant Discount or Bundle up to save up to 45% on essentials.',
      time: '5 mins ago'
    }
  ];

  // Append notification if price lock is expiring
  if (priceLocks.length > 0) {
    notifications.push({
      id: 'notif-3',
      type: 'lock',
      title: 'Price Lock Active',
      message: `You have ${priceLocks.length} locked item(s) protected from seasonal price hikes.`,
      time: '1 hour ago'
    });
  }

  res.json(notifications);
});

// 9. Admin operations
app.post('/api/admin/products', (req, res) => {
  const { name, brand, price, originalPrice, category, image, aiConfidence, reason, essentials } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Missing product details' });
  }

  const newProduct = {
    id: `p-${Date.now()}`,
    name,
    brand: brand || 'Myntra Brand',
    price: parseFloat(price),
    originalPrice: parseFloat(originalPrice || price * 1.5),
    rating: 4.0 + Math.random(),
    reviews: Math.floor(Math.random() * 500),
    category,
    image: image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80',
    aiConfidence: parseInt(aiConfidence || 90),
    reason: reason || 'AI matched seasonal essential.',
    essentials: !!essentials
  };

  products.push(newProduct);
  
  // Re-calculate analytics values slightly
  analytics.aiAccuracy = parseFloat((90 + Math.random() * 8).toFixed(1));

  res.json({ success: true, product: newProduct });
});

app.post('/api/admin/campaigns', (req, res) => {
  const { title, subtitle, discount, bgGradient } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Campaign title is required' });
  }

  const newCampaign = {
    id: `camp-${Date.now()}`,
    title,
    subtitle: subtitle || 'New campaign subtitle',
    discount: discount || 'Special discount',
    bgGradient: bgGradient || 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    active: true
  };

  campaigns.push(newCampaign);
  res.json({ success: true, campaign: newCampaign });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
