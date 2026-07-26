import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Percent, PlusCircle, Sparkles, CheckCircle, Database, Volume2 } from 'lucide-react';
import { adminService } from '../services/api';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [prodForm, setProdForm] = useState({
    name: '', brand: '', price: '', originalPrice: '',
    category: 'Monsoon', aiConfidence: '95', reason: '',
    image: '', essentials: true
  });
  const [campForm, setCampForm] = useState({
    title: '', subtitle: '', discount: '',
    bgGradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
  });
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchAnalytics = () => {
    adminService.getAnalytics()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching admin analytics:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.price) return;
    
    try {
      const data = await adminService.addProduct({
        ...prodForm,
        price: parseFloat(prodForm.price),
        originalPrice: parseFloat(prodForm.originalPrice || prodForm.price),
        aiConfidence: parseInt(prodForm.aiConfidence)
      });
      if (data.success) {
        setFeedbackMsg(`Successfully added product: ${prodForm.name}`);
        setProdForm({
          name: '', brand: '', price: '', originalPrice: '',
          category: 'Monsoon', aiConfidence: '95', reason: '',
          image: '', essentials: true
        });
        fetchAnalytics();
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    if (!campForm.title) return;

    try {
      const data = await adminService.addCampaign(campForm);
      if (data.success) {
        setFeedbackMsg(`Successfully added campaign: ${campForm.title}`);
        setCampForm({
          title: '', subtitle: '', discount: '',
          bgGradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
        });
        fetchAnalytics();
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !stats) {
    return <div className="text-center py-20 font-semibold text-charcoal">Loading administration dashboards...</div>;
  }

  // Chart configs
  const doughnutData = {
    labels: stats.seasonalDemand.map(item => item.name),
    datasets: [
      {
        label: 'Demand Index',
        data: stats.seasonalDemand.map(item => item.value),
        backgroundColor: [
          'rgba(96, 165, 250, 0.85)', // Monsoon
          'rgba(124, 58, 237, 0.85)', // Winter
          'rgba(251, 191, 36, 0.85)'   // Summer
        ],
        borderWidth: 1,
        borderColor: '#ffffff'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
    }
  };

  const lineData = {
    labels: stats.revenueTrend.map(t => t.date),
    datasets: [
      {
        label: 'Gross Daily Revenue',
        data: stats.revenueTrend.map(t => t.revenue),
        fill: true,
        borderColor: '#ff3f6c',
        backgroundColor: 'rgba(255, 63, 108, 0.05)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#ff3f6c'
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    scales: {
      y: { ticks: { font: { size: 9 } } },
      x: { ticks: { font: { size: 9 } } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 bg-white border-2 border-green-500 rounded-xl p-4 shadow-2xl flex items-center gap-2.5 z-[1000] animate-bounce">
          <CheckCircle size={18} className="text-green-500" />
          <span className="text-xs font-bold text-charcoal">{feedbackMsg}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-charcoal">Real-time Platform Analytics</h1>
        <p className="text-xs text-text-muted mt-1">Manage clothing catalog lists, create marketing campaigns, and monitor sales.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="fashion-card p-4 bg-white border border-border flex flex-col gap-2">
          <div className="flex items-center gap-2 text-text-muted">
            <Users size={16} className="text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Sales</span>
          </div>
          <span className="text-base font-extrabold text-charcoal">{stats.sales.toLocaleString()} units</span>
        </div>

        <div className="fashion-card p-4 bg-white border border-border flex flex-col gap-2">
          <div className="flex items-center gap-2 text-text-muted">
            <TrendingUp size={16} className="text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Gross Revenue</span>
          </div>
          <span className="text-base font-extrabold text-charcoal">₹{stats.revenue.toLocaleString('en-IN')}</span>
        </div>

        <div className="fashion-card p-4 bg-white border border-border flex flex-col gap-2">
          <div className="flex items-center gap-2 text-text-muted">
            <Percent size={16} className="text-green-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Combo Conversion</span>
          </div>
          <span className="text-base font-extrabold text-charcoal">{stats.bundleConversion}%</span>
        </div>

        <div className="fashion-card p-4 bg-white border border-border flex flex-col gap-2">
          <div className="flex items-center gap-2 text-text-muted">
            <Sparkles size={16} className="text-yellow-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">AI Accuracy</span>
          </div>
          <span className="text-base font-extrabold text-charcoal">{stats.aiAccuracy}%</span>
        </div>

        <div className="fashion-card p-4 bg-white border border-border flex flex-col gap-2 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-text-muted">
            <CheckCircle size={16} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Top Combo Offer</span>
          </div>
          <span className="text-xs font-bold text-charcoal truncate">{stats.mostPurchasedCombo}</span>
        </div>
      </div>

      {/* Graphical Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="fashion-card p-6 bg-white border border-border space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal border-b border-border pb-2">
            Seasonal Demand index
          </h4>
          <div className="h-[200px] flex justify-center items-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        <div className="fashion-card p-6 bg-white border border-border space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal border-b border-border pb-2">
            Weekly Revenue Trend
          </h4>
          <div className="h-[200px]">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>

      {/* Forms management section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Product entry */}
        <div className="lg:col-span-7 fashion-card p-6 bg-white border border-border space-y-4">
          <h4 className="text-sm font-extrabold text-charcoal flex items-center gap-2">
            <PlusCircle size={18} className="text-primary" /> Add Seasonal Clothing Product
          </h4>
          <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Product Name" 
                className="fashion-input w-full"
                value={prodForm.name}
                onChange={e => setProdForm({ ...prodForm, name: e.target.value })}
                required 
              />
              <input 
                type="text" 
                placeholder="Brand (e.g. Roadster)" 
                className="fashion-input w-full"
                value={prodForm.brand}
                onChange={e => setProdForm({ ...prodForm, brand: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="number" 
                placeholder="Price (₹)" 
                className="fashion-input w-full"
                value={prodForm.price}
                onChange={e => setProdForm({ ...prodForm, price: e.target.value })}
                required 
              />
              <input 
                type="number" 
                placeholder="Original Price (₹)" 
                className="fashion-input w-full"
                value={prodForm.originalPrice}
                onChange={e => setProdForm({ ...prodForm, originalPrice: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select 
                className="fashion-input w-full"
                value={prodForm.category}
                onChange={e => setProdForm({ ...prodForm, category: e.target.value })}
              >
                <option value="Monsoon">Monsoon</option>
                <option value="Winter">Winter</option>
                <option value="Summer">Summer</option>
              </select>
              <input 
                type="number" 
                placeholder="AI Confidence Score (90-99)" 
                className="fashion-input w-full"
                value={prodForm.aiConfidence}
                onChange={e => setProdForm({ ...prodForm, aiConfidence: e.target.value })}
              />
            </div>

            <input 
              type="text" 
              placeholder="AI Recommendation Reason" 
              className="fashion-input w-full"
              value={prodForm.reason}
              onChange={e => setProdForm({ ...prodForm, reason: e.target.value })}
            />

            <input 
              type="text" 
              placeholder="Unsplash Image URL (Optional)" 
              className="fashion-input w-full"
              value={prodForm.image}
              onChange={e => setProdForm({ ...prodForm, image: e.target.value })}
            />

            <label className="flex items-center gap-2 text-text-muted cursor-pointer">
              <input 
                type="checkbox" 
                checked={prodForm.essentials} 
                onChange={e => setProdForm({ ...prodForm, essentials: e.target.checked })}
                className="accent-primary"
              />
              <span>Mark as Seasonal Essential (For Readiness calculations)</span>
            </label>

            <button type="submit" className="btn-fashion-primary w-full py-2.5 flex items-center justify-center gap-1.5">
              <Database size={16} /> Insert Into Catalog
            </button>
          </form>
        </div>

        {/* Campaign entry */}
        <div className="lg:col-span-5 fashion-card p-6 bg-white border border-border space-y-4">
          <h4 className="text-sm font-extrabold text-charcoal flex items-center gap-2">
            <Volume2 size={18} className="text-accent" /> Launch Pre-Season Campaign
          </h4>
          <form onSubmit={handleCampaignSubmit} className="space-y-4 text-xs">
            <input 
              type="text" 
              placeholder="Campaign Title" 
              className="fashion-input w-full"
              value={campForm.title}
              onChange={e => setCampForm({ ...campForm, title: e.target.value })}
              required 
            />
            <input 
              type="text" 
              placeholder="Subtitle / Slogan" 
              className="fashion-input w-full"
              value={campForm.subtitle}
              onChange={e => setCampForm({ ...campForm, subtitle: e.target.value })}
            />
            <input 
              type="text" 
              placeholder="Discount Details (e.g. 40% Off)" 
              className="fashion-input w-full"
              value={campForm.discount}
              onChange={e => setCampForm({ ...campForm, discount: e.target.value })}
            />
            
            <div className="space-y-1">
              <label className="block text-text-muted font-bold text-[10px]">Theme Gradient Theme</label>
              <select 
                className="fashion-input w-full"
                value={campForm.bgGradient}
                onChange={e => setCampForm({ ...campForm, bgGradient: e.target.value })}
              >
                <option value="linear-gradient(135deg, #ff3f6c 0%, #7c3aed 100%)">Sunset Gradient (Primary)</option>
                <option value="linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)">Deep Ocean (Blue)</option>
                <option value="linear-gradient(135deg, #4c1d95 0%, #d946ef 100%)">Neon Eclipse (Violet)</option>
                <option value="linear-gradient(135deg, #059669 0%, #10b981 100%)">Emerald Forest (Green)</option>
              </select>
            </div>

            <button type="submit" className="btn-fashion-primary w-full py-2.5 bg-accent hover:bg-accent/95 flex items-center justify-center gap-1.5">
              <CheckCircle size={16} /> Deploy Campaign Banner
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
