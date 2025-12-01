import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { useWeightUnit } from '@/contexts/WeightUnitContext';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface WeightDataPoint {
  date: string;
  weight: number;
  source: 'profile' | 'photo' | 'checkin';
}

interface WeightChartProps {
  data: WeightDataPoint[];
  goalWeight?: number;
  timeframe: string;
  className?: string;
}

export function WeightChart({ data, goalWeight, timeframe, className = "" }: WeightChartProps) {
  const { formatWeight, unit } = useWeightUnit();

  // Sort data by date
  const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate weight change
  const firstWeight = sortedData[0]?.weight;
  const lastWeight = sortedData[sortedData.length - 1]?.weight;
  const weightChange = firstWeight && lastWeight ? lastWeight - firstWeight : 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-2xl p-3 shadow-lg">
          <p className="text-sm font-medium">{format(parseISO(label), 'MMM dd, yyyy')}</p>
          <p className="text-sm text-primary font-semibold">
            {formatWeight(payload[0].value)}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {data.source === 'profile' ? 'Profile Update' : 
             data.source === 'photo' ? 'Progress Photo' : 'Weekly Check-in'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Determine chart color based on weight trend
  const getChartColor = () => {
    if (weightChange < 0) return '#22c55e'; // green for weight loss
    if (weightChange > 0) return '#f59e0b'; // amber for weight gain
    return '#6366f1'; // primary for no change
  };

  const getTrendIcon = () => {
    if (Math.abs(weightChange) < 0.5) return <Minus className="w-4 h-4" />;
    return weightChange < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />;
  };

  const getTrendText = () => {
    if (Math.abs(weightChange) < 0.5) return 'Maintaining';
    return weightChange < 0 ? 'Losing' : 'Gaining';
  };

  if (!data.length) {
    return (
      <div className={`h-64 flex items-center justify-center bg-secondary/20 rounded-2xl border border-dashed border-border ${className}`}>
        <div className="text-center p-4">
          <TrendingDown className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No weight data yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Add weight data in your profile or progress photos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className="text-sm font-medium" style={{ color: getChartColor() }}>
            {getTrendText()} {formatWeight(Math.abs(weightChange))}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Current</p>
          <p className="text-sm font-semibold">{formatWeight(lastWeight)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date"
              tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
              className="text-xs"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `${value}${unit === 'kg' ? 'kg' : 'lb'}`}
              className="text-xs"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Goal weight reference line */}
            {goalWeight && (
              <ReferenceLine 
                y={goalWeight} 
                stroke="#10b981" 
                strokeDasharray="5 5"
                strokeOpacity={0.7}
              />
            )}
            
            {/* Weight trend line */}
            <Line
              type="monotone"
              dataKey="weight"
              stroke={getChartColor()}
              strokeWidth={3}
              dot={{ fill: getChartColor(), strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: getChartColor() }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Goal Weight Info */}
      {goalWeight && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700 dark:text-green-300">Goal: {formatWeight(goalWeight)}</span>
            {lastWeight && (
              <span className="text-green-600 dark:text-green-400 font-medium">
                {lastWeight <= goalWeight ? '🎉 Goal Reached!' : 
                 `${formatWeight(lastWeight - goalWeight)} to go`}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}