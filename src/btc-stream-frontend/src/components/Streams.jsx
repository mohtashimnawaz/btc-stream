import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Activity, 
  Zap, 
  Pause, 
  Play,
  Square,
  Eye,
  Settings,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import useBTCStreamStore from '../store/useBTCStreamStore.js';
import { AnimatedCard, AnimatedButton, AnimatedModal, AnimatedList, AnimatedListItem } from './animations.jsx';
import { toast } from '../utils/toast.jsx';

const Streams = () => {
  const { streams, createStream, updateStream, deleteStream, loading } = useBTCStreamStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newStream, setNewStream] = useState({
    recipient: '',
    sats_per_sec: '',
    duration: '',
    buffer: ''
  });

  const handleCreateStream = async (e) => {
    e.preventDefault();
    try {
      await createStream(
        newStream.recipient,
        parseInt(newStream.sats_per_sec),
        parseInt(newStream.duration),
        parseInt(newStream.buffer)
      );
      setShowCreateModal(false);
      setNewStream({ recipient: '', sats_per_sec: '', duration: '', buffer: '' });
      toast.success('Stream created successfully!');
    } catch (error) {
      toast.error('Failed to create stream');
    }
  };

  const handleStreamAction = async (streamId, action) => {
    try {
      await updateStream(streamId, action);
      toast.success(`Stream ${action} successfully!`);
    } catch (error) {
      toast.error(`Failed to ${action} stream`);
    }
  };

  const formatSats = (sats) => {
    return new Intl.NumberFormat().format(sats);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-600/20 border-green-600/30';
      case 'Paused': return 'text-yellow-600 bg-yellow-600/20 border-yellow-600/30';
      case 'Completed': return 'text-blue-600 bg-blue-600/20 border-blue-600/30';
      case 'Cancelled': return 'text-red-600 bg-red-600/20 border-red-600/30';
      default: return 'text-gray-600 bg-gray-600/20 border-gray-600/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <Zap className="w-4 h-4" />;
      case 'Paused': return <Pause className="w-4 h-4" />;
      case 'Completed': return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled': return <X className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const filteredStreams = streams.filter(stream => {
    const matchesSearch = stream.id.toString().includes(searchTerm) || 
                         stream.recipient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || Object.keys(stream.status)[0].toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getProgressPercentage = (stream) => {
    if (stream.duration === 0) return 0;
    const elapsed = Date.now() - stream.created_at;
    const totalDuration = stream.duration * 1000;
    return Math.min((elapsed / totalDuration) * 100, 100);
  };

  const formatTimeRemaining = (stream) => {
    if (stream.duration === 0) return 'Continuous';
    const elapsed = Date.now() - stream.created_at;
    const totalDuration = stream.duration * 1000;
    const remaining = Math.max(totalDuration - elapsed, 0);
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Streams</h2>
          <p className="text-gray-400">Manage your Bitcoin payment streams</p>
        </div>
        <AnimatedButton
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:from-orange-700 hover:to-orange-600 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Create Stream</span>
        </AnimatedButton>
      </div>

      {/* Search and Filter */}
      <AnimatedCard className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search streams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </AnimatedCard>

      {/* Streams List */}
      <AnimatedList className="space-y-4">
        {filteredStreams.length === 0 ? (
          <AnimatedCard className="text-center py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No streams found</p>
              <p className="text-gray-500 mt-2">Create your first stream to get started</p>
            </motion.div>
          </AnimatedCard>
        ) : (
          filteredStreams.map((stream) => (
            <AnimatedListItem key={stream.id}>
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 border ${getStatusColor(Object.keys(stream.status)[0])}`}>
                      {getStatusIcon(Object.keys(stream.status)[0])}
                      <span>{Object.keys(stream.status)[0]}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Stream #{stream.id}</h3>
                      <p className="text-gray-400 text-sm font-mono">{stream.recipient}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AnimatedButton
                      onClick={() => {
                        setSelectedStream(stream);
                        setShowStreamModal(true);
                      }}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </AnimatedButton>
                    {Object.keys(stream.status)[0] === 'Active' && (
                      <AnimatedButton
                        onClick={() => handleStreamAction(stream.id, 'pause')}
                        className="p-2 bg-yellow-600/20 rounded-lg hover:bg-yellow-600/30 transition-all duration-300"
                      >
                        <Pause className="w-4 h-4 text-yellow-400" />
                      </AnimatedButton>
                    )}
                    {Object.keys(stream.status)[0] === 'Paused' && (
                      <AnimatedButton
                        onClick={() => handleStreamAction(stream.id, 'resume')}
                        className="p-2 bg-green-600/20 rounded-lg hover:bg-green-600/30 transition-all duration-300"
                      >
                        <Play className="w-4 h-4 text-green-400" />
                      </AnimatedButton>
                    )}
                    {(Object.keys(stream.status)[0] === 'Active' || Object.keys(stream.status)[0] === 'Paused') && (
                      <AnimatedButton
                        onClick={() => handleStreamAction(stream.id, 'cancel')}
                        className="p-2 bg-red-600/20 rounded-lg hover:bg-red-600/30 transition-all duration-300"
                      >
                        <Square className="w-4 h-4 text-red-400" />
                      </AnimatedButton>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Rate</p>
                    <p className="text-white font-mono">{formatSats(stream.sats_per_sec)} sats/sec</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Buffer</p>
                    <p className="text-white font-mono">{formatSats(stream.buffer)} sats</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Locked</p>
                    <p className="text-white font-mono">{formatSats(stream.total_locked)} sats</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Time Remaining</p>
                    <p className="text-white font-mono">{formatTimeRemaining(stream)}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage(stream)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-gradient-to-r from-orange-600 to-orange-500 h-2 rounded-full"
                  />
                </div>
              </motion.div>
            </AnimatedListItem>
          ))
        )}
      </AnimatedList>

      {/* Create Stream Modal */}
      <AnimatedModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Stream"
      >
        <form onSubmit={handleCreateStream} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              required
              value={newStream.recipient}
              onChange={(e) => setNewStream({ ...newStream, recipient: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter recipient address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Sats per Second
              </label>
              <input
                type="number"
                required
                min="1"
                value={newStream.sats_per_sec}
                onChange={(e) => setNewStream({ ...newStream, sats_per_sec: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Duration (seconds)
              </label>
              <input
                type="number"
                required
                min="1"
                value={newStream.duration}
                onChange={(e) => setNewStream({ ...newStream, duration: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="3600"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Buffer Amount (sats)
            </label>
            <input
              type="number"
              required
              min="1"
              value={newStream.buffer}
              onChange={(e) => setNewStream({ ...newStream, buffer: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="10000"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <AnimatedButton
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300"
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Stream'}
            </AnimatedButton>
          </div>
        </form>
      </AnimatedModal>

      {/* Stream Detail Modal */}
      {selectedStream && (
        <AnimatedModal
          isOpen={showStreamModal}
          onClose={() => {
            setShowStreamModal(false);
            setSelectedStream(null);
          }}
          title={`Stream #${selectedStream.id}`}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-3">Stream Details</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(Object.keys(selectedStream.status)[0])}`}>
                      {getStatusIcon(Object.keys(selectedStream.status)[0])}
                      <span>{Object.keys(selectedStream.status)[0]}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Recipient</p>
                    <p className="text-white font-mono text-sm break-all">{selectedStream.recipient}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Rate</p>
                    <p className="text-white font-mono">{formatSats(selectedStream.sats_per_sec)} sats/sec</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-white font-mono">{selectedStream.duration} seconds</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">Financial Details</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Buffer</p>
                    <p className="text-white font-mono">{formatSats(selectedStream.buffer)} sats</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Locked</p>
                    <p className="text-white font-mono">{formatSats(selectedStream.total_locked)} sats</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Claimed</p>
                    <p className="text-white font-mono">{formatSats(selectedStream.claimed)} sats</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Remaining</p>
                    <p className="text-white font-mono">{formatSats(selectedStream.total_locked - selectedStream.claimed)} sats</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Progress</h4>
              <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage(selectedStream)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-orange-600 to-orange-500 h-3 rounded-full"
                />
              </div>
              <p className="text-gray-400 text-sm">
                {getProgressPercentage(selectedStream).toFixed(1)}% complete • {formatTimeRemaining(selectedStream)} remaining
              </p>
            </div>
          </div>
        </AnimatedModal>
      )}
    </div>
  );
};

export default Streams;
