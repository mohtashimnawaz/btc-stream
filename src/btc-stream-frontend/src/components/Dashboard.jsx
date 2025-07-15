import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Shield, 
  Bell, 
  ArrowRight, 
  TrendingUp,
  Bitcoin
} from 'lucide-react';
import useBTCStreamStore from '../store/useBTCStreamStore.js';
import { AnimatedCard, AnimatedList, AnimatedListItem } from './animations.jsx';

const Dashboard = () => {
  const { streams, notifications, userStats, globalStats } = useBTCStreamStore();

  const formatSats = (sats) => {
    return new Intl.NumberFormat().format(sats);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-600';
      case 'Paused': return 'text-yellow-600';
      case 'Completed': return 'text-blue-600';
      case 'Cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Zap className="w-4 h-4" /></motion.div>;
      case 'Paused': return <Activity className="w-4 h-4" />;
      case 'Completed': return <TrendingUp className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const quickStats = [
    {
      label: 'Active Streams',
      value: streams.filter(s => Object.keys(s.status)[0] === 'Active').length,
      icon: <Zap className="w-6 h-6 text-green-400" />,
      color: 'from-green-600/20 to-green-500/20',
      borderColor: 'border-green-500/30',
    },
    {
      label: 'Total Streams',
      value: streams.length,
      icon: <Activity className="w-6 h-6 text-blue-400" />,
      color: 'from-blue-600/20 to-blue-500/20',
      borderColor: 'border-blue-500/30',
    },
    {
      label: 'Total Locked',
      value: formatSats(streams.reduce((sum, s) => sum + s.total_locked, 0)),
      unit: 'sats',
      icon: <Shield className="w-6 h-6 text-orange-400" />,
      color: 'from-orange-600/20 to-orange-500/20',
      borderColor: 'border-orange-500/30',
    },
    {
      label: 'Notifications',
      value: notifications.filter(n => !n.read).length,
      icon: <Bell className="w-6 h-6 text-purple-400" />,
      color: 'from-purple-600/20 to-purple-500/20',
      borderColor: 'border-purple-500/30',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <AnimatedCard className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <Bitcoin className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Welcome to BTC Stream</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Stream Bitcoin payments in real-time on the Internet Computer. 
          Create streams, receive payments, and manage your Bitcoin flow seamlessly.
        </p>
      </AnimatedCard>

      {/* Quick Stats */}
      <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <AnimatedListItem key={stat.label}>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm rounded-2xl p-6 border ${stat.borderColor} hover:border-opacity-60 transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    {stat.unit && <p className="text-xs text-gray-500">{stat.unit}</p>}
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          </AnimatedListItem>
        ))}
      </AnimatedList>

      {/* Recent Streams */}
      <AnimatedCard className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Recent Streams</h3>
          <motion.button
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
        
        {streams.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No streams found</p>
              <p className="text-gray-500 mt-2">Create your first stream to get started</p>
            </motion.div>
          </div>
        ) : (
          <AnimatedList className="space-y-4">
            {streams.slice(0, 3).map((stream, index) => (
              <AnimatedListItem key={stream.id}>
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-orange-500/30 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(Object.keys(stream.status)[0])}
                      <span className={`text-sm font-medium ${getStatusColor(Object.keys(stream.status)[0])}`}>
                        {Object.keys(stream.status)[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Stream #{stream.id}</p>
                      <p className="text-gray-400 text-sm">{formatSats(stream.sats_per_sec)} sats/sec</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-mono">{formatSats(stream.buffer)} sats</p>
                    <p className="text-gray-400 text-sm">available</p>
                  </div>
                </motion.div>
              </AnimatedListItem>
            ))}
          </AnimatedList>
        )}
      </AnimatedCard>

      {/* Global Stats */}
      {globalStats && (
        <AnimatedCard className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Platform Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-400">{globalStats.total_streams_created}</p>
              <p className="text-gray-400 text-sm">Total Streams</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">{formatSats(globalStats.total_volume_locked)}</p>
              <p className="text-gray-400 text-sm">Volume Locked</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">{formatSats(globalStats.total_volume_claimed)}</p>
              <p className="text-gray-400 text-sm">Volume Claimed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{globalStats.active_streams}</p>
              <p className="text-gray-400 text-sm">Active Now</p>
            </div>
          </div>
        </AnimatedCard>
      )}
    </div>
  );
};

export default Dashboard;
