import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, parseISO, startOfDay, isSameDay } from 'date-fns';
import { Activity, Droplets, Utensils, BookOpen, Calendar } from 'lucide-react';

interface ActivityData {
  date: string;
  meals: number;
  waterGlasses: number;
  journalEntries: number;
  totalActivities: number;
  completionRate: number; // percentage of daily goals met
}

interface ActivityChartProps {
  data: ActivityData[];
  timeframe: string;
  className?: string;
}

const ACTIVITY_COLORS = {
  excellent: '#22c55e', // 80-100%
  good: '#84cc16',      // 60-79%
  fair: '#eab308',      // 40-59%
  poor: '#f97316',      // 20-39%
  minimal: '#ef4444'    // 0-19%
};

export function ActivityChart({ data, timeframe, className = "" }: ActivityChartProps) {
  
  // Sort data by date
  const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate average activity
  const averageActivity = data.length > 0 
    ? data.reduce((sum, day) => sum + day.totalActivities, 0) / data.length 
    : 0;

  const averageCompletionRate = data.length > 0
    ? data.reduce((sum, day) => sum + day.completionRate, 0) / data.length
    : 0;

  // Get color based on completion rate
  const getBarColor = (completionRate: number) => {
    if (completionRate >= 80) return ACTIVITY_COLORS.excellent;
    if (completionRate >= 60) return ACTIVITY_COLORS.good;
    if (completionRate >= 40) return ACTIVITY_COLORS.fair;
    if (completionRate >= 20) return ACTIVITY_COLORS.poor;
    return ACTIVITY_COLORS.minimal;
  };

  // Get performance level
  const getPerformanceLevel = (rate: number) => {
    if (rate >= 80) return { label: 'Excellent', color: 'text-green-600' };
    if (rate >= 60) return { label: 'Good', color: 'text-lime-600' };
    if (rate >= 40) return { label: 'Fair', color: 'text-yellow-600' };
    if (rate >= 20) return { label: 'Needs Work', color: 'text-orange-600' };
    return { label: 'Getting Started', color: 'text-red-600' };
  };

  const performance = getPerformanceLevel(averageCompletionRate);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-2xl p-4 shadow-lg min-w-[200px]">
          <p className="text-sm font-medium mb-2">{format(parseISO(label), 'MMM dd, yyyy')}</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-orange-500" />
                <span className="text-xs">Meals</span>
              </div>
              <span className="text-xs font-medium">{data.meals}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-xs">Water</span>
              </div>
              <span className="text-xs font-medium">{data.waterGlasses} glasses</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span className="text-xs">Journal</span>
              </div>
              <span className="text-xs font-medium">{data.journalEntries}</span>
            </div>
            
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Completion</span>
                <span className="text-xs font-semibold" style={{ color: getBarColor(data.completionRate) }}>
                  {Math.round(data.completionRate)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data.length) {
    return (
      <div className={`h-64 flex items-center justify-center bg-secondary/20 rounded-2xl border border-dashed border-border ${className}`}>
        <div className="text-center p-4">
          <Activity className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No activity data yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Start logging meals, water, and journal entries
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Daily Activity</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Average</p>
          <p className={`text-sm font-semibold ${performance.color}`}>
            {performance.label}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
          <Utensils className="w-4 h-4 mx-auto mb-1 text-orange-500" />
          <p className="text-xs text-muted-foreground">Avg Meals</p>
          <p className="text-sm font-bold text-orange-600">
            {(data.reduce((sum, day) => sum + day.meals, 0) / data.length).toFixed(1)}
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
          <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" />
          <p className="text-xs text-muted-foreground">Avg Water</p>
          <p className="text-sm font-bold text-blue-600">
            {(data.reduce((sum, day) => sum + day.waterGlasses, 0) / data.length).toFixed(1)}
          </p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
          <BookOpen className="w-4 h-4 mx-auto mb-1 text-purple-500" />
          <p className="text-xs text-muted-foreground">Journal Days</p>
          <p className="text-sm font-bold text-purple-600">
            {data.filter(day => day.journalEntries > 0).length}
          </p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date"
              tickFormatter={(date) => format(parseISO(date), timeframe === '1M' ? 'dd' : 'MM/dd')}
              className="text-xs"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={(value) => `${Math.round(value)}%`}
              className="text-xs"
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="completionRate" 
              radius={[4, 4, 0, 0]}
              fill="#6366f1"
            >
              {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.completionRate)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Indicator */}
      <div className="mt-4 p-3 bg-secondary/30 rounded-xl">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-muted-foreground">Overall Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${performance.color}`}>
              {Math.round(averageCompletionRate)}%
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${performance.color.replace('text-', 'bg-').replace('600', '100')} ${performance.color}`}>
              {performance.label}
            </span>
          </div>
        </div>
        
        {/* Performance Bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min(averageCompletionRate, 100)}%`,
              backgroundColor: getBarColor(averageCompletionRate)
            }}
          />
        </div>
      </div>
    </div>
  );
}