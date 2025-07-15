import { create } from 'zustand';
import { btc_stream_backend } from '../declarations/btc-stream-backend';
import { Principal } from '@dfinity/principal';

const useBTCStreamStore = create((set, get) => ({
  // State
  streams: [],
  notifications: [],
  userStats: null,
  globalStats: null,
  loading: false,
  error: null,
  currentPrincipal: null,
  
  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // Initialize with mock principal
  initialize: () => {
    const mockPrincipal = Principal.fromText('rrkah-fqaaa-aaaaa-aaaaq-cai');
    set({ currentPrincipal: mockPrincipal });
    get().loadData();
  },
  
  // Load all data
  loadData: async () => {
    try {
      set({ loading: true, error: null });
      const { currentPrincipal } = get();
      
      if (!currentPrincipal) return;
      
      // Load streams
      const streamsResult = await btc_stream_backend.list_streams_for_user(currentPrincipal);
      
      // Load notifications  
      const notificationsResult = await btc_stream_backend.get_notifications();
      
      // Load user stats
      const userStatsResult = await btc_stream_backend.get_user_stats(currentPrincipal);
      
      // Load global stats
      const globalStatsResult = await btc_stream_backend.get_global_stats();
      
      set({
        streams: streamsResult,
        notifications: notificationsResult,
        userStats: userStatsResult[0] || null,
        globalStats: globalStatsResult,
      });
    } catch (err) {
      console.error('Error loading data:', err);
      set({ error: err.message || 'Failed to load data' });
    } finally {
      set({ loading: false });
    }
  },
  
  // Create stream
  createStream: async (recipient, satsPerSec, duration, totalLocked) => {
    try {
      const recipientPrincipal = Principal.fromText(recipient);
      const result = await btc_stream_backend.create_stream(
        recipientPrincipal,
        satsPerSec,
        duration,
        totalLocked
      );
      
      // Reload data after creation
      await get().loadData();
      return result;
    } catch (err) {
      console.error('Error creating stream:', err);
      set({ error: err.message || 'Failed to create stream' });
      throw err;
    }
  },
  
  // Claim stream
  claimStream: async (streamId) => {
    try {
      const result = await btc_stream_backend.claim_stream(streamId);
      if (result.ok) {
        await get().loadData();
        return result;
      } else {
        set({ error: result.err });
        throw new Error(result.err);
      }
    } catch (err) {
      console.error('Error claiming stream:', err);
      set({ error: err.message || 'Failed to claim stream' });
      throw err;
    }
  },
  
  // Pause stream
  pauseStream: async (streamId) => {
    try {
      const result = await btc_stream_backend.pause_stream(streamId);
      if (result.ok) {
        await get().loadData();
        return result;
      } else {
        set({ error: result.err });
        throw new Error(result.err);
      }
    } catch (err) {
      console.error('Error pausing stream:', err);
      set({ error: err.message || 'Failed to pause stream' });
      throw err;
    }
  },
  
  // Resume stream
  resumeStream: async (streamId) => {
    try {
      const result = await btc_stream_backend.resume_stream(streamId);
      if (result.ok) {
        await get().loadData();
        return result;
      } else {
        set({ error: result.err });
        throw new Error(result.err);
      }
    } catch (err) {
      console.error('Error resuming stream:', err);
      set({ error: err.message || 'Failed to resume stream' });
      throw err;
    }
  },
  
  // Clear error
  clearError: () => set({ error: null }),
}));

export default useBTCStreamStore;
