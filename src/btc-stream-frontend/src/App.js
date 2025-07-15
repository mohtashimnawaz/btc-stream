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
    const mockPrincipal = Principal.fromText('rdmx6-jaaaa-aaaah-qcaiq-cai');
    setCurrentPrincipal(mockPrincipal);
    
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load streams - using mock principal for demo
      const mockPrincipal = Principal.fromText('rdmx6-jaaaa-aaaah-qcaiq-cai');
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading BTC Stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Bitcoin className="w-8 h-8 text-orange-500 mr-3" />
              <h1 className="text-xl font-bold text-white">BTC Stream</h1>
            </div>
            
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('streams')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'streams' 
                    ? 'bg-orange-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Streams
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'notifications' 
                    ? 'bg-orange-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'stats' 
                    ? 'bg-orange-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Stats
              </button>
            </nav>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Stream
              </button>
              <User className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-600 border border-red-500 text-white px-4 py-3 rounded">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'streams' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Your Streams</h2>
              <button
                onClick={loadData}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Refresh
              </button>
            </div>
            
            {streams.length === 0 ? (
              <div className="text-center py-12">
                <Bitcoin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No streams found</p>
                <p className="text-gray-500 mt-2">Create your first stream to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {streams.map((stream) => (
                  <div key={stream.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        {getStatusIcon(Object.keys(stream.status)[0])}
                        <span className={`ml-2 text-sm font-medium ${getStatusColor(Object.keys(stream.status)[0])}`}>
                          {Object.keys(stream.status)[0]}
                        </span>
                      </div>
                      <span className="text-gray-400 text-sm">#{stream.id}</span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Locked:</span>
                        <span className="text-white font-mono">{formatSats(stream.total_locked)} sats</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Released:</span>
                        <span className="text-white font-mono">{formatSats(stream.total_released)} sats</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Buffer:</span>
                        <span className="text-orange-400 font-mono">{formatSats(stream.buffer)} sats</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rate:</span>
                        <span className="text-white font-mono">{formatSats(stream.sats_per_sec)} sats/sec</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {stream.buffer > 0 && (
                        <button
                          onClick={() => handleClaimStream(stream.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex-1"
                        >
                          Claim
                        </button>
                      )}
                      {Object.keys(stream.status)[0] === 'Active' && (
                        <button
                          onClick={() => handlePauseStream(stream.id)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm flex-1"
                        >
                          Pause
                        </button>
                      )}
                      {Object.keys(stream.status)[0] === 'Paused' && (
                        <button
                          onClick={() => handleResumeStream(stream.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex-1"
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
                    className={`bg-gray-800 rounded-lg p-4 border-l-4 ${
                      notification.read ? 'border-gray-600' : 'border-orange-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{notification.message}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Stream #{notification.stream_id} • {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Statistics</h2>
            {userStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-2">Streams Created</h3>
                  <p className="text-3xl font-bold text-orange-500">{userStats.streams_created}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-2">Total Sent</h3>
                  <p className="text-3xl font-bold text-green-500">{formatSats(userStats.total_sent)} sats</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-2">Total Received</h3>
                  <p className="text-3xl font-bold text-blue-500">{formatSats(userStats.total_received)} sats</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-2">Avg Stream Size</h3>
                  <p className="text-3xl font-bold text-purple-500">{formatSats(userStats.avg_stream_size)} sats</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-2">Streams Received</h3>
                  <p className="text-3xl font-bold text-yellow-500">{userStats.streams_received}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-2">Fees Paid</h3>
                  <p className="text-3xl font-bold text-red-500">{formatSats(userStats.total_fees_paid)} sats</p>
                </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Create New Stream</h3>
            <form onSubmit={handleCreateStream} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Recipient Principal
                </label>
                <input
                  type="text"
                  value={createForm.recipient}
                  onChange={(e) => setCreateForm({...createForm, recipient: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="rdmx6-jaaaa-aaaah-qcaiq-cai"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Sats per Second
                </label>
                <input
                  type="number"
                  value={createForm.satsPerSec}
                  onChange={(e) => setCreateForm({...createForm, satsPerSec: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="100"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={createForm.duration}
                  onChange={(e) => setCreateForm({...createForm, duration: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="3600"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Total Locked (sats)
                </label>
                <input
                  type="number"
                  value={createForm.totalLocked}
                  onChange={(e) => setCreateForm({...createForm, totalLocked: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="360000"
                  min="1"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md"
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
