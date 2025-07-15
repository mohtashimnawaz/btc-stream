import React, { useState, useEffect } from 'react';
import { btc_stream_backend } from 'declarations/btc-stream-backend';
import { Principal } from '@dfinity/principal';
import { 
  Play, 
  Pause, 
  Plus, 
  TrendingUp, 
  Clock, 
  Bitcoin, 
  Bell, 
  Search,
  User,
  Settings,
  LogOut,
  Wallet,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Zap,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

const App = () => {
  const [streams, setStreams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPrincipal, setCurrentPrincipal] = useState(null);
  const [showBalance, setShowBalance] = useState(true);

  // Form states
  const [createForm, setCreateForm] = useState({
    recipient: '',
    satsPerSec: '',
    duration: '',
    totalLocked: ''
  });

  useEffect(() => {
    // Generate a mock principal for demo purposes
    // In a real app, this would come from Internet Identity
    const mockPrincipal = Principal.fromText('rrkah-fqaaa-aaaaa-aaaaq-cai');
    setCurrentPrincipal(mockPrincipal);
    
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load streams - using mock principal for demo
      const mockPrincipal = Principal.fromText('rrkah-fqaaa-aaaaa-aaaaq-cai');
      const streamsResult = await btc_stream_backend.list_streams_for_user(mockPrincipal);
      setStreams(streamsResult);
      
      // Load notifications
      const notificationsResult = await btc_stream_backend.get_notifications();
      setNotifications(notificationsResult);
      
      // Load user stats
      const userStatsResult = await btc_stream_backend.get_user_stats(mockPrincipal);
      setUserStats(userStatsResult[0] || null);
      
      // Load global stats
      const globalStatsResult = await btc_stream_backend.get_global_stats();
      setGlobalStats(globalStatsResult);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStream = async (e) => {
    e.preventDefault();
    try {
      const recipient = Principal.fromText(createForm.recipient);
      const satsPerSec = parseInt(createForm.satsPerSec);
      const duration = parseInt(createForm.duration);
      const totalLocked = parseInt(createForm.totalLocked);
      
      const result = await btc_stream_backend.create_stream(
        recipient,
        satsPerSec,
        duration,
        totalLocked
      );
      
      setShowCreateForm(false);
      setCreateForm({
        recipient: '',
        satsPerSec: '',
        duration: '',
        totalLocked: ''
      });
      
      await loadData();
    } catch (err) {
      console.error('Error creating stream:', err);
      setError(err.message || 'Failed to create stream');
    }
  };

  const handleClaimStream = async (streamId) => {
    try {
      const result = await btc_stream_backend.claim_stream(streamId);
      if (result.ok) {
        await loadData();
      } else {
        setError(result.err);
      }
    } catch (err) {
      console.error('Error claiming stream:', err);
      setError(err.message || 'Failed to claim stream');
    }
  };

  const handlePauseStream = async (streamId) => {
    try {
      const result = await btc_stream_backend.pause_stream(streamId);
      if (result.ok) {
        await loadData();
      } else {
        setError(result.err);
      }
    } catch (err) {
      console.error('Error pausing stream:', err);
      setError(err.message || 'Failed to pause stream');
    }
  };

  const handleResumeStream = async (streamId) => {
    try {
      const result = await btc_stream_backend.resume_stream(streamId);
      if (result.ok) {
        await loadData();
      } else {
        setError(result.err);
      }
    } catch (err) {
      console.error('Error resuming stream:', err);
      setError(err.message || 'Failed to resume stream');
    }
  };

  const formatSats = (sats) => {
    return new Intl.NumberFormat().format(sats);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
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
      case 'Active': return <Play className="w-4 h-4" />;
      case 'Paused': return <Pause className="w-4 h-4" />;
      case 'Completed': return <TrendingUp className="w-4 h-4" />;
      case 'Cancelled': return <LogOut className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-500 border-t-transparent mx-auto mb-6"></div>
            <Bitcoin className="w-8 h-8 text-orange-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white text-lg font-medium">Loading BTC Stream...</p>
          <p className="text-gray-400 mt-2">Connecting to Internet Computer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo.svg" alt="BTC Stream" className="w-10 h-10 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-white">BTC Stream</h1>
                <p className="text-xs text-gray-400">Real-time Bitcoin Payments</p>
              </div>
            </div>
            
            <nav className="flex space-x-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Activity },
                { id: 'streams', label: 'Streams', icon: Zap },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'stats', label: 'Analytics', icon: TrendingUp }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === tab.id 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-200 shadow-lg shadow-orange-600/25"
              >
                <Plus className="w-4 h-4" />
                <span>Create Stream</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-600/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-200 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome to BTC Stream</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Stream Bitcoin payments in real-time on the Internet Computer. 
                Create streams, receive payments, and manage your Bitcoin flow seamlessly.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Streams</p>
                    <p className="text-2xl font-bold text-white">{streams.filter(s => Object.keys(s.status)[0] === 'Active').length}</p>
                  </div>
                  <div className="p-3 bg-green-600/20 rounded-xl">
                    <Zap className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Streams</p>
                    <p className="text-2xl font-bold text-white">{streams.length}</p>
                  </div>
                  <div className="p-3 bg-blue-600/20 rounded-xl">
                    <Activity className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Locked</p>
                    <p className="text-2xl font-bold text-white">{formatSats(streams.reduce((sum, s) => sum + s.total_locked, 0))}</p>
                    <p className="text-xs text-gray-500">sats</p>
                  </div>
                  <div className="p-3 bg-orange-600/20 rounded-xl">
                    <Shield className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Unread Notifications</p>
                    <p className="text-2xl font-bold text-white">{notifications.filter(n => !n.read).length}</p>
                  </div>
                  <div className="p-3 bg-purple-600/20 rounded-xl">
                    <Bell className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Streams */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Recent Streams</h3>
                <button
                  onClick={() => setActiveTab('streams')}
                  className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              {streams.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No streams found</p>
                  <p className="text-gray-500 mt-2">Create your first stream to get started</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
                  >
                    Create Stream
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {streams.slice(0, 3).map((stream) => (
                    <div key={stream.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Streams Tab */}
        {activeTab === 'streams' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Your Streams</h2>
              <button
                onClick={loadData}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm border border-white/10"
              >
                Refresh
              </button>
            </div>
            
            {streams.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No streams found</p>
                <p className="text-gray-500 mt-2">Create your first stream to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {streams.map((stream) => (
                  <div key={stream.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(Object.keys(stream.status)[0])}
                        <span className={`text-sm font-medium ${getStatusColor(Object.keys(stream.status)[0])}`}>
                          {Object.keys(stream.status)[0]}
                        </span>
                      </div>
                      <span className="text-gray-400 text-sm font-mono">#{stream.id}</span>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Total Locked</span>
                        <span className="text-white font-mono text-sm">{formatSats(stream.total_locked)} sats</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Released</span>
                        <span className="text-white font-mono text-sm">{formatSats(stream.total_released)} sats</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Available</span>
                        <span className="text-orange-400 font-mono text-sm font-medium">{formatSats(stream.buffer)} sats</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Rate</span>
                        <span className="text-white font-mono text-sm">{formatSats(stream.sats_per_sec)} sats/sec</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{Math.round((stream.total_released / stream.total_locked) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((stream.total_released / stream.total_locked) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {stream.buffer > 0 && (
                        <button
                          onClick={() => handleClaimStream(stream.id)}
                          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex-1 transition-all duration-200"
                        >
                          Claim
                        </button>
                      )}
                      {Object.keys(stream.status)[0] === 'Active' && (
                        <button
                          onClick={() => handlePauseStream(stream.id)}
                          className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex-1 transition-all duration-200"
                        >
                          Pause
                        </button>
                      )}
                      {Object.keys(stream.status)[0] === 'Paused' && (
                        <button
                          onClick={() => handleResumeStream(stream.id)}
                          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex-1 transition-all duration-200"
                        >
                          Resume
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Notifications</h2>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No notifications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border ${
                      notification.read ? 'border-white/10' : 'border-orange-500/30'
                    } transition-all duration-200`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${
                          notification.read ? 'bg-gray-600/20' : 'bg-orange-600/20'
                        }`}>
                          <Bell className={`w-5 h-5 ${
                            notification.read ? 'text-gray-400' : 'text-orange-400'
                          }`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{notification.message}</p>
                          <p className="text-gray-400 text-sm mt-1">
                            Stream #{notification.stream_id} • {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Analytics</h2>
            {userStats ? (
              <div className="space-y-8">
                {/* User Stats */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Your Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Streams Created</h4>
                        <ArrowUp className="w-5 h-5 text-green-400" />
                      </div>
                      <p className="text-3xl font-bold text-orange-400">{userStats.streams_created}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Total Sent</h4>
                        <ArrowUp className="w-5 h-5 text-green-400" />
                      </div>
                      <p className="text-3xl font-bold text-green-400">{formatSats(userStats.total_sent)}</p>
                      <p className="text-gray-400 text-sm">sats</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Total Received</h4>
                        <ArrowDown className="w-5 h-5 text-blue-400" />
                      </div>
                      <p className="text-3xl font-bold text-blue-400">{formatSats(userStats.total_received)}</p>
                      <p className="text-gray-400 text-sm">sats</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Avg Stream Size</h4>
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                      </div>
                      <p className="text-3xl font-bold text-purple-400">{formatSats(userStats.avg_stream_size)}</p>
                      <p className="text-gray-400 text-sm">sats</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Streams Received</h4>
                        <ArrowDown className="w-5 h-5 text-yellow-400" />
                      </div>
                      <p className="text-3xl font-bold text-yellow-400">{userStats.streams_received}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Fees Paid</h4>
                        <ArrowUp className="w-5 h-5 text-red-400" />
                      </div>
                      <p className="text-3xl font-bold text-red-400">{formatSats(userStats.total_fees_paid)}</p>
                      <p className="text-gray-400 text-sm">sats</p>
                    </div>
                  </div>
                </div>
                
                {/* Global Stats */}
                {globalStats && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Global Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white font-medium mb-2">Total Streams</h4>
                        <p className="text-2xl font-bold text-orange-400">{globalStats.total_streams_created}</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white font-medium mb-2">Volume Locked</h4>
                        <p className="text-2xl font-bold text-green-400">{formatSats(globalStats.total_volume_locked)}</p>
                        <p className="text-gray-400 text-sm">sats</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white font-medium mb-2">Volume Claimed</h4>
                        <p className="text-2xl font-bold text-blue-400">{formatSats(globalStats.total_volume_claimed)}</p>
                        <p className="text-gray-400 text-sm">sats</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white font-medium mb-2">Active Streams</h4>
                        <p className="text-2xl font-bold text-purple-400">{globalStats.active_streams}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No statistics available</p>
                <p className="text-gray-500 mt-2">Create some streams to see your stats</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Stream Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 w-full max-w-md mx-4 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Create New Stream</h3>
            <form onSubmit={handleCreateStream} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient Principal
                </label>
                <input
                  type="text"
                  value={createForm.recipient}
                  onChange={(e) => setCreateForm({...createForm, recipient: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="rrkah-fqaaa-aaaaa-aaaaq-cai"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sats per Second
                </label>
                <input
                  type="number"
                  value={createForm.satsPerSec}
                  onChange={(e) => setCreateForm({...createForm, satsPerSec: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="100"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={createForm.duration}
                  onChange={(e) => setCreateForm({...createForm, duration: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="3600"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total Locked (sats)
                </label>
                <input
                  type="number"
                  value={createForm.totalLocked}
                  onChange={(e) => setCreateForm({...createForm, totalLocked: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="360000"
                  min="1"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg backdrop-blur-sm border border-white/10 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200"
                >
                  Create Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
