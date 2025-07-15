import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  BellRing, 
  Check, 
  X, 
  Filter, 
  Search,
  Archive,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useBTCStreamStore from '../store/useBTCStreamStore.js';
import { AnimatedCard, AnimatedButton, AnimatedList, AnimatedListItem } from './animations.jsx';
import { toast } from '../utils/toast.jsx';

const Notifications = () => {
  const { notifications, markNotificationAsRead, deleteNotification, clearAllNotifications } = useBTCStreamStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'stream_created':
        return <Zap className="w-5 h-5 text-green-400" />;
      case 'stream_completed':
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case 'stream_paused':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'stream_resumed':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'stream_cancelled':
        return <X className="w-5 h-5 text-red-400" />;
      case 'payment_received':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'low_balance':
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      case 'system':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationColor = (type, read) => {
    const opacity = read ? '20' : '30';
    switch (type) {
      case 'stream_created':
      case 'stream_resumed':
      case 'payment_received':
        return `border-green-500/${opacity} bg-green-600/10`;
      case 'stream_completed':
      case 'system':
        return `border-blue-500/${opacity} bg-blue-600/10`;
      case 'stream_paused':
      case 'low_balance':
        return `border-yellow-500/${opacity} bg-yellow-600/10`;
      case 'stream_cancelled':
        return `border-red-500/${opacity} bg-red-600/10`;
      default:
        return `border-gray-500/${opacity} bg-gray-600/10`;
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'stream_created':
        return 'Stream Created';
      case 'stream_completed':
        return 'Stream Completed';
      case 'stream_paused':
        return 'Stream Paused';
      case 'stream_resumed':
        return 'Stream Resumed';
      case 'stream_cancelled':
        return 'Stream Cancelled';
      case 'payment_received':
        return 'Payment Received';
      case 'low_balance':
        return 'Low Balance Warning';
      case 'system':
        return 'System Notification';
      default:
        return 'Notification';
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getNotificationTitle(notification.type).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'unread' && !notification.read) ||
                         (filterStatus === 'read' && notification.read);
    return matchesSearch && matchesType && matchesStatus;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <BellRing className="w-8 h-8 text-orange-400" />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
              >
                {unreadCount}
              </motion.div>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Notifications</h2>
            <p className="text-gray-400">Stay updated with your stream activities</p>
          </div>
        </div>
        {notifications.length > 0 && (
          <AnimatedButton
            onClick={handleClearAll}
            className="bg-red-600/20 text-red-400 px-4 py-2 rounded-xl hover:bg-red-600/30 transition-all duration-300 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </AnimatedButton>
        )}
      </div>

      {/* Search and Filter */}
      <AnimatedCard className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Types</option>
                <option value="stream_created">Stream Created</option>
                <option value="stream_completed">Stream Completed</option>
                <option value="stream_paused">Stream Paused</option>
                <option value="stream_resumed">Stream Resumed</option>
                <option value="stream_cancelled">Stream Cancelled</option>
                <option value="payment_received">Payment Received</option>
                <option value="low_balance">Low Balance</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Notifications List */}
      <AnimatedList className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <AnimatedCard className="text-center py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No notifications found</p>
              <p className="text-gray-500 mt-2">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'You\'ll see stream updates and system notifications here'}
              </p>
            </motion.div>
          </AnimatedCard>
        ) : (
          filteredNotifications.map((notification) => (
            <AnimatedListItem key={notification.id}>
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`p-6 rounded-2xl border transition-all duration-300 ${getNotificationColor(notification.type, notification.read)} ${
                  !notification.read ? 'hover:border-opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-semibold">
                          {getNotificationTitle(notification.type)}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-gray-300 mb-2">{notification.message}</p>
                      <p className="text-gray-500 text-sm">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <AnimatedButton
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 bg-green-600/20 rounded-lg hover:bg-green-600/30 transition-all duration-300"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4 text-green-400" />
                      </AnimatedButton>
                    )}
                    <AnimatedButton
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 bg-red-600/20 rounded-lg hover:bg-red-600/30 transition-all duration-300"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </AnimatedButton>
                  </div>
                </div>
              </motion.div>
            </AnimatedListItem>
          ))
        )}
      </AnimatedList>

      {/* Stats */}
      {notifications.length > 0 && (
        <AnimatedCard className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold text-white">{notifications.length}</span>
              </div>
              <p className="text-gray-400 text-sm">Total Notifications</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <BellRing className="w-5 h-5 text-orange-400" />
                <span className="text-2xl font-bold text-white">{unreadCount}</span>
              </div>
              <p className="text-gray-400 text-sm">Unread</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Archive className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold text-white">{notifications.length - unreadCount}</span>
              </div>
              <p className="text-gray-400 text-sm">Read</p>
            </div>
          </div>
        </AnimatedCard>
      )}
    </div>
  );
};

export default Notifications;
