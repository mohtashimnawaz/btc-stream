import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Calendar,
  Filter,
  Download,
  Zap,
  Clock,
  Target,
  Award
} from 'lucide-react';
import { format, subDays, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import useBTCStreamStore from '../store/useBTCStreamStore.js';
import { AnimatedCard, AnimatedButton, AnimatedList, AnimatedListItem } from './animations.jsx';
import { toast } from '../utils/toast.js';

const Analytics = () => {
  const { streams, globalStats, getUserStats } = useBTCStreamStore();
  const [dateRange, setDateRange] = useState('7d');
  const [chartType, setChartType] = useState('volume');
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const stats = await getUserStats();
        setUserStats(stats);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      }
    };

    fetchUserStats();
  }, [getUserStats]);

  const formatSats = (sats) => {
    return new Intl.NumberFormat().format(sats);
  };

  const getDateRangeData = () => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    return streams.filter(stream => {
      const streamDate = new Date(stream.created_at);
      return isAfter(streamDate, startOfDay(startDate)) && isBefore(streamDate, endOfDay(endDate));
    });
  };

  const getChartData = () => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const endDate = new Date();
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(endDate, i);
      const dayStreams = streams.filter(stream => {
        const streamDate = new Date(stream.created_at);
        return format(streamDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      let value = 0;
      switch (chartType) {
        case 'volume':
          value = dayStreams.reduce((sum, stream) => sum + stream.total_locked, 0);
          break;
        case 'streams':
          value = dayStreams.length;
          break;
        case 'claimed':
          value = dayStreams.reduce((sum, stream) => sum + stream.claimed, 0);
          break;
        default:
          value = 0;
      }

      data.push({
        date: format(date, 'MMM dd'),
        value,
        streams: dayStreams.length
      });
    }

    return data;
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map(d => d.value));

  const getStatusStats = () => {
    const statusCounts = {};
    streams.forEach(stream => {
      const status = Object.keys(stream.status)[0];
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return statusCounts;
  };

  const statusStats = getStatusStats();

  const getPerformanceMetrics = () => {
    const totalVolume = streams.reduce((sum, stream) => sum + stream.total_locked, 0);
    const totalClaimed = streams.reduce((sum, stream) => sum + stream.claimed, 0);
    const activeStreams = streams.filter(s => Object.keys(s.status)[0] === 'Active').length;
    const completedStreams = streams.filter(s => Object.keys(s.status)[0] === 'Completed').length;
    const avgStreamSize = streams.length > 0 ? totalVolume / streams.length : 0;
    const claimRate = totalVolume > 0 ? (totalClaimed / totalVolume) * 100 : 0;

    return {
      totalVolume,
      totalClaimed,
      activeStreams,
      completedStreams,
      avgStreamSize,
      claimRate
    };
  };

  const metrics = getPerformanceMetrics();

  const exportData = () => {
    const data = {
      summary: {
        totalStreams: streams.length,
        totalVolume: metrics.totalVolume,
        totalClaimed: metrics.totalClaimed,
        activeStreams: metrics.activeStreams,
        completedStreams: metrics.completedStreams,
        avgStreamSize: metrics.avgStreamSize,
        claimRate: metrics.claimRate
      },
      streams: streams.map(stream => ({
        id: stream.id,
        recipient: stream.recipient,
        status: Object.keys(stream.status)[0],
        sats_per_sec: stream.sats_per_sec,
        total_locked: stream.total_locked,
        claimed: stream.claimed,
        created_at: stream.created_at
      })),
      chartData,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `btc-stream-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics data exported successfully!');
  };

  const kpiCards = [
    {
      title: 'Total Volume',
      value: formatSats(metrics.totalVolume),
      unit: 'sats',
      icon: <DollarSign className="w-6 h-6 text-green-400" />,
      color: 'from-green-600/20 to-green-500/20',
      borderColor: 'border-green-500/30',
      trend: '+12.5%',
      trendUp: true
    },
    {
      title: 'Total Claimed',
      value: formatSats(metrics.totalClaimed),
      unit: 'sats',
      icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
      color: 'from-blue-600/20 to-blue-500/20',
      borderColor: 'border-blue-500/30',
      trend: '+8.2%',
      trendUp: true
    },
    {
      title: 'Active Streams',
      value: metrics.activeStreams,
      icon: <Zap className="w-6 h-6 text-orange-400" />,
      color: 'from-orange-600/20 to-orange-500/20',
      borderColor: 'border-orange-500/30',
      trend: '+5.1%',
      trendUp: true
    },
    {
      title: 'Completion Rate',
      value: `${metrics.claimRate.toFixed(1)}%`,
      icon: <Target className="w-6 h-6 text-purple-400" />,
      color: 'from-purple-600/20 to-purple-500/20',
      borderColor: 'border-purple-500/30',
      trend: '+2.3%',
      trendUp: true
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BarChart3 className="w-8 h-8 text-orange-400" />
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Analytics</h2>
            <p className="text-gray-400">Track your Bitcoin streaming performance</p>
          </div>
        </div>
        <AnimatedButton
          onClick={exportData}
          className="bg-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </AnimatedButton>
      </div>

      {/* KPI Cards */}
      <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <AnimatedListItem key={kpi.title}>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`bg-gradient-to-br ${kpi.color} backdrop-blur-sm rounded-2xl p-6 border ${kpi.borderColor} hover:border-opacity-60 transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/5 rounded-xl">
                  {kpi.icon}
                </div>
                <div className={`flex items-center space-x-1 text-sm ${kpi.trendUp ? 'text-green-400' : 'text-red-400'}`}>
                  {kpi.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{kpi.trend}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">{kpi.title}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  {kpi.unit && <p className="text-xs text-gray-500">{kpi.unit}</p>}
                </div>
              </div>
            </motion.div>
          </AnimatedListItem>
        ))}
      </AnimatedList>

      {/* Chart Controls */}
      <AnimatedCard className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="volume">Volume</option>
                <option value="streams">Stream Count</option>
                <option value="claimed">Claimed Amount</option>
              </select>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">
              {chartType === 'volume' ? 'Total Volume' : 
               chartType === 'streams' ? 'Stream Count' : 'Claimed Amount'}
            </p>
            <p className="text-white font-mono text-lg">
              {chartType === 'volume' ? formatSats(chartData.reduce((sum, d) => sum + d.value, 0)) :
               chartType === 'streams' ? chartData.reduce((sum, d) => sum + d.value, 0) :
               formatSats(chartData.reduce((sum, d) => sum + d.value, 0))}
              {(chartType === 'volume' || chartType === 'claimed') && ' sats'}
            </p>
          </div>
        </div>
      </AnimatedCard>

      {/* Chart */}
      <AnimatedCard className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="h-80">
          <div className="flex items-end space-x-2 h-full">
            {chartData.map((data, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${maxValue > 0 ? (data.value / maxValue) * 100 : 0}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex-1 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-lg min-h-[4px] relative group"
              >
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  <div className="text-center">
                    <div className="font-semibold">{data.date}</div>
                    <div>
                      {chartType === 'volume' ? formatSats(data.value) + ' sats' :
                       chartType === 'streams' ? data.value + ' streams' :
                       formatSats(data.value) + ' sats'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-gray-400 text-sm">
            {chartData.map((data, index) => (
              <div key={index} className="flex-1 text-center">
                {index % Math.ceil(chartData.length / 5) === 0 && data.date}
              </div>
            ))}
          </div>
        </div>
      </AnimatedCard>

      {/* Stream Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimatedCard className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Stream Status Distribution</h3>
          <div className="space-y-4">
            {Object.entries(statusStats).map(([status, count]) => {
              const percentage = (count / streams.length) * 100;
              const colors = {
                Active: 'bg-green-500',
                Paused: 'bg-yellow-500',
                Completed: 'bg-blue-500',
                Cancelled: 'bg-red-500'
              };
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{status}</span>
                    <span className="text-gray-400">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-2 rounded-full ${colors[status] || 'bg-gray-500'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </AnimatedCard>

        <AnimatedCard className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Performance Metrics</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-600/20 rounded-lg">
                  <Activity className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Average Stream Size</p>
                  <p className="text-gray-400 text-sm">Per stream volume</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-mono">{formatSats(metrics.avgStreamSize)}</p>
                <p className="text-gray-400 text-sm">sats</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Claim Rate</p>
                  <p className="text-gray-400 text-sm">Percentage claimed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-mono">{metrics.claimRate.toFixed(1)}%</p>
                <p className="text-gray-400 text-sm">of total volume</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Award className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Success Rate</p>
                  <p className="text-gray-400 text-sm">Completed streams</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-mono">
                  {streams.length > 0 ? ((metrics.completedStreams / streams.length) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-gray-400 text-sm">completion rate</p>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Recent Activity */}
      <AnimatedCard className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {streams.slice(0, 5).map((stream) => (
            <div key={stream.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-orange-600/20 rounded-lg">
                  <Zap className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Stream #{stream.id}</p>
                  <p className="text-gray-400 text-sm">
                    {formatSats(stream.sats_per_sec)} sats/sec • {Object.keys(stream.status)[0]}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-mono">{formatSats(stream.total_locked)} sats</p>
                <p className="text-gray-400 text-sm">
                  {format(new Date(stream.created_at), 'MMM dd, HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default Analytics;
