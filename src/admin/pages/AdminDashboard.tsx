import { useEffect, useState } from 'react';
import { adminApiService } from '../lib/adminApi';
import { Users, UtensilsCrossed, BookOpen, Droplet, TrendingUp, Activity } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalMeals: number;
  totalJournals: number;
  totalWaterGlasses: number;
  userGrowth: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMeals: 0,
    totalJournals: 0,
    totalWaterGlasses: 0,
    userGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Implement backend endpoint for dashboard stats
      // const response = await adminApiService.getDashboardStats();
      // setStats(response.data);
      
      // Using zeros until backend is connected
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalMeals: 0,
        totalJournals: 0,
        totalWaterGlasses: 0,
        userGrowth: 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      change: `+${stats.userGrowth}%`,
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Activity,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Total Meals Logged',
      value: stats.totalMeals,
      icon: UtensilsCrossed,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      title: 'Journal Entries',
      value: stats.totalJournals,
      icon: BookOpen,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Water Glasses',
      value: stats.totalWaterGlasses,
      icon: Droplet,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
    {
      title: 'Growth Rate',
      value: `${stats.userGrowth}%`,
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-3xl p-6 border border-border animate-pulse">
              <div className="h-20 bg-secondary/50 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your wellness platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-card rounded-3xl p-6 shadow-card border border-border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.change && (
                  <span className="text-sm font-semibold text-green-500">{stat.change}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-muted-foreground">
          Activity feed coming soon...
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
