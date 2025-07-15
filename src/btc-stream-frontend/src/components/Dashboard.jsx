import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Shield, 
  Bell, 
  ArrowRight, 
  TrendingUp,
  Bitcoin,
  ChevronRight,
  Star,
  Users,
  Globe,
  Lock,
  DollarSign,
  Sparkles
} from 'lucide-react';
import useBTCStreamStore from '../store/useBTCStreamStore.js';
import { AnimatedCard, AnimatedList, AnimatedListItem, AnimatedButton } from './animations.jsx';

const Dashboard = () => {
  const { streams, notifications, userStats, globalStats } = useBTCStreamStore();
  const [currentPrice, setCurrentPrice] = useState(67250);
  const [priceChange, setPriceChange] = useState(2.4);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 100;
      setCurrentPrice(prev => Math.max(60000, prev + change));
      setPriceChange((Math.random() - 0.5) * 5);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-yellow-500/5 animate-pulse"></div>
      
      {/* Floating Bitcoin Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 text-orange-500/10 text-6xl"
        >
          ₿
        </motion.div>
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 30, 0],
            rotate: [0, -360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-20 text-orange-500/10 text-8xl"
        >
          ₿
        </motion.div>
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 right-1/4 text-orange-500/10 text-4xl"
        >
          ₿
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center py-16 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mr-6"
              >
                <Bitcoin className="w-10 h-10 text-white" />
              </motion.div>
              <div className="text-left">
                <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                  BTC Stream
                </h1>
                <p className="text-orange-300 text-xl font-semibold">Real-time Bitcoin Payments</p>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Stream Bitcoin payments in real-time on the Internet Computer. 
              Create streams, receive payments, and manage your Bitcoin flow seamlessly with cutting-edge technology.
            </p>
          </motion.div>

          {/* Live Bitcoin Price */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <AnimatedCard className="inline-block bg-gradient-to-r from-orange-500/20 to-amber-500/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-8 shadow-2xl shadow-orange-500/20">
              <div className="flex items-center space-x-6">
                <div className="text-orange-400 text-4xl">₿</div>
                <div>
                  <div className="text-4xl font-bold text-white">
                    ${currentPrice.toLocaleString()}
                  </div>
                  <div className={`text-lg ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}% 24h
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">Live</span>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
          >
            <AnimatedButton className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/25 flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>Start Streaming</span>
            </AnimatedButton>
            <AnimatedButton className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Explore Platform</span>
            </AnimatedButton>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16"
        >
          {quickStats.map((stat, index) => (
            <AnimatedCard key={stat.label} className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm border ${stat.borderColor} rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 shadow-lg`}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-center mb-4"
              >
                {stat.icon}
              </motion.div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}{stat.unit && <span className="text-sm text-gray-400 ml-1">{stat.unit}</span>}</div>
              <div className="text-gray-400 font-semibold">{stat.label}</div>
            </AnimatedCard>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose BTC Stream?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built on the Internet Computer with enterprise-grade security and lightning-fast performance
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedCard className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:border-orange-500/30 group">
              <div className="text-orange-400 text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">⚡</div>
              <h3 className="text-2xl font-semibold text-white mb-4">Lightning Fast</h3>
              <p className="text-gray-400 leading-relaxed">
                Real-time Bitcoin streaming with instant settlement on the Internet Computer blockchain. Experience sub-second transaction finality.
              </p>
            </AnimatedCard>

            <AnimatedCard className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:border-orange-500/30 group">
              <div className="text-orange-400 text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🔒</div>
              <h3 className="text-2xl font-semibold text-white mb-4">Secure & Trustless</h3>
              <p className="text-gray-400 leading-relaxed">
                Built with cryptographic security and decentralized architecture. Your funds are protected by smart contracts and Web3 principles.
              </p>
            </AnimatedCard>

            <AnimatedCard className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:border-orange-500/30 group">
              <div className="text-orange-400 text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">💰</div>
              <h3 className="text-2xl font-semibold text-white mb-4">Ultra Low Fees</h3>
              <p className="text-gray-400 leading-relaxed">
                Minimal transaction costs with efficient smart contract execution. Save money on every transaction with our optimized fee structure.
              </p>
            </AnimatedCard>
          </div>
        </motion.div>

        {/* Recent Streams Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Recent Streams</h2>
            <AnimatedButton className="text-orange-400 hover:text-orange-300 transition-colors duration-300 flex items-center space-x-2 group">
              <span>View All</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </AnimatedButton>
          </div>

          <AnimatedCard className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
            {streams.length === 0 ? (
              <div className="text-center py-20">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-12 h-12 text-orange-400" />
                  </div>
                  <h3 className="text-3xl font-semibold text-white mb-4">Ready to Stream?</h3>
                  <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                    Create your first Bitcoin stream and start receiving payments in real-time
                  </p>
                  <AnimatedButton className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/25">
                    Create Your First Stream
                  </AnimatedButton>
                </motion.div>
              </div>
            ) : (
              <AnimatedList className="space-y-4">
                {streams.slice(0, 3).map((stream, index) => (
                  <AnimatedListItem key={stream.id}>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10 hover:border-orange-500/30 transition-all duration-300"
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
                        <p className="text-white font-mono text-lg">{formatSats(stream.buffer)} sats</p>
                        <p className="text-gray-400 text-sm">available</p>
                      </div>
                    </motion.div>
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            )}
          </AnimatedCard>
        </motion.div>

        {/* Global Stats */}
        {globalStats && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16"
          >
            <AnimatedCard className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-2">Platform Statistics</h3>
                <p className="text-gray-400">Real-time metrics from the BTC Stream network</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-400 mb-2">{globalStats.total_streams_created}</div>
                  <div className="text-gray-400">Total Streams</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">{formatSats(globalStats.total_volume_locked)}</div>
                  <div className="text-gray-400">Volume Locked</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">{formatSats(globalStats.total_volume_claimed)}</div>
                  <div className="text-gray-400">Volume Claimed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">{globalStats.active_streams}</div>
                  <div className="text-gray-400">Active Now</div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
