// Mock Database for Myntra SeasonSense

export const initialCampaigns = [
  {
    id: 'camp-1',
    title: 'Pre-Monsoon Splash Sale',
    subtitle: 'Prepare before the skies open up. Lock prices now!',
    discount: 'Up to 40% Off on Waterproof Gear',
    bgGradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    active: true,
  },
  {
    id: 'camp-2',
    title: 'Winter Warm-Up Campaign',
    subtitle: 'Pre-book winter jackets at summer rates.',
    discount: 'Price Lock enabled for all Thermals & Coats',
    bgGradient: 'linear-gradient(135deg, #4c1d95 0%, #d946ef 100%)',
    active: true,
  }
];

export const initialProducts = [
  // Monsoon Gear
  {
    id: 'p-1',
    name: 'Myntra Active Waterproof Raincoat',
    brand: 'Roadster',
    price: 1299,
    originalPrice: 1999,
    rating: 4.3,
    reviews: 1205,
    category: 'Monsoon',
    image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=500&q=80',
    aiConfidence: 97,
    reason: 'Waterproof, breathable fabric perfect for heavy downpours.',
    essentials: true,
    combo: {
      name: 'Monsoon Shield Combo',
      companionName: 'Anti-Skid Waterproof Boots',
      companionPrice: 999,
      bundlePrice: 1799,
      savingsValue: 499
    }
  },
  {
    id: 'p-2',
    name: 'Quick-Dry Breathable Windbreaker',
    brand: 'HRX by Hrithik Roshan',
    price: 1899,
    originalPrice: 2999,
    rating: 4.5,
    reviews: 843,
    category: 'Monsoon',
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500&q=80',
    aiConfidence: 94,
    reason: 'Quick-dry mesh ventilation designed for humid rainy runs.',
    essentials: true,
    combo: {
      name: 'Dry & Active Combo',
      companionName: 'Waterproof Sport Watch',
      companionPrice: 1499,
      bundlePrice: 2699,
      savingsValue: 699
    }
  },
  {
    id: 'p-3',
    name: 'Anti-Skid Rain-Ready Boots',
    brand: 'Mast & Harbour',
    price: 1499,
    originalPrice: 2499,
    rating: 4.1,
    reviews: 512,
    category: 'Monsoon',
    image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500&q=80',
    aiConfidence: 91,
    reason: 'Special rubber tread for slippery monsoon street walks.',
    essentials: true
  },
  
  // Winter Gear
  {
    id: 'p-4',
    name: 'Thermoregulation Puffer Jacket',
    brand: 'Wildcraft',
    price: 3499,
    originalPrice: 4999,
    rating: 4.7,
    reviews: 3209,
    category: 'Winter',
    image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=500&q=80',
    aiConfidence: 98,
    reason: 'Locks body heat in sub-zero climates with minimal bulk.',
    essentials: true,
    combo: {
      name: 'Sub-Zero Protection Kit',
      companionName: 'Merino Wool Thermal Innerwear',
      companionPrice: 1299,
      bundlePrice: 3999,
      savingsValue: 799
    }
  },
  {
    id: 'p-5',
    name: 'Merino Wool Thermal Top & Bottom Set',
    brand: 'Marks & Spencer',
    price: 1999,
    originalPrice: 2999,
    rating: 4.6,
    reviews: 1445,
    category: 'Winter',
    image: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=500&q=80',
    aiConfidence: 96,
    reason: 'Premium ultra-soft thermal layer ensuring long-lasting warmth.',
    essentials: true,
    combo: {
      name: 'Thermal Warmth Set',
      companionName: 'Fleece Lined Beanie & Gloves',
      companionPrice: 799,
      bundlePrice: 2299,
      savingsValue: 499
    }
  },
  {
    id: 'p-6',
    name: 'Knitted Fleece Beanie and Touchscreen Gloves',
    brand: 'DressBerry',
    price: 699,
    originalPrice: 999,
    rating: 4.2,
    reviews: 730,
    category: 'Winter',
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=500&q=80',
    aiConfidence: 89,
    reason: 'Essential protection for extremities during wind-chill days.',
    essentials: false
  },

  // Summer Gear
  {
    id: 'p-7',
    name: 'Ultra-Light Breathable Linen Shirt',
    brand: 'WROGN',
    price: 1199,
    originalPrice: 1999,
    rating: 4.4,
    reviews: 2110,
    category: 'Summer',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80',
    aiConfidence: 95,
    reason: 'Pure linen blend keeping your body cool in high summer heat.',
    essentials: true,
    combo: {
      name: 'Summer Cruise Outfit',
      companionName: 'Polarized UV Sunglasses',
      companionPrice: 899,
      bundlePrice: 1699,
      savingsValue: 399
    }
  },
  {
    id: 'p-8',
    name: 'UV Protection Sport Sunglasses',
    brand: 'Ray-Ban',
    price: 2499,
    originalPrice: 3999,
    rating: 4.8,
    reviews: 642,
    category: 'Summer',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80',
    aiConfidence: 92,
    reason: '100% block against harmful UV rays with polarized coating.',
    essentials: true,
    combo: {
      name: 'Cool Vision Combo',
      companionName: 'Breathable Cotton Sun Cap',
      companionPrice: 499,
      bundlePrice: 2699,
      savingsValue: 299
    }
  },
  {
    id: 'p-9',
    name: 'Cotton Casual Cap with Sweatband',
    brand: 'Puma',
    price: 599,
    originalPrice: 899,
    rating: 4.3,
    reviews: 994,
    category: 'Summer',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80',
    aiConfidence: 87,
    reason: 'Blocks facial sun exposure and manages moisture during hot afternoons.',
    essentials: false
  }
];

export const initialWeatherPresets = {
  Mumbai: {
    temp: 28,
    humidity: 92,
    condition: 'Heavy Rain',
    season: 'Monsoon',
    readinessScore: 40,
    missingEssentials: ['Waterproof Raincoat', 'Anti-Skid Rain-Ready Boots']
  },
  Delhi: {
    temp: 9,
    humidity: 60,
    condition: 'Dense Fog & Chill',
    season: 'Winter',
    readinessScore: 35,
    missingEssentials: ['Thermoregulation Puffer Jacket', 'Merino Wool Thermal Top & Bottom Set']
  },
  Bangalore: {
    temp: 34,
    humidity: 45,
    condition: 'Sunny & Dry',
    season: 'Summer',
    readinessScore: 50,
    missingEssentials: ['Ultra-Light Breathable Linen Shirt', 'UV Protection Sport Sunglasses']
  }
};

export const initialAnalytics = {
  sales: 24890,
  revenue: 3204900,
  bundleConversion: 18.4,
  aiAccuracy: 94.2,
  mostPurchasedCombo: 'Monsoon Shield Combo',
  seasonalDemand: [
    { name: 'Monsoon', value: 45 },
    { name: 'Winter', value: 35 },
    { name: 'Summer', value: 20 }
  ],
  revenueTrend: [
    { date: 'Mon', revenue: 420000 },
    { date: 'Tue', revenue: 380000 },
    { date: 'Wed', revenue: 510000 },
    { date: 'Thu', revenue: 490000 },
    { date: 'Fri', revenue: 620000 },
    { date: 'Sat', revenue: 780000 },
    { date: 'Sun', revenue: 840000 }
  ]
};
