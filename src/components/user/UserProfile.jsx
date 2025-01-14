import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBookmarks } from '../../contexts/BookmarkContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, getUsername } = useAuth();
  const { bookmarks } = useBookmarks();
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalBookmarks: 0,
    bookmarksByType: {},
    joinDate: null,
    lastActive: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchUserStats = async () => {
      try {
        // Get user's join date
        const joinDate = new Date(user.created_at);

        // Calculate bookmarks by type
        const bookmarksByType = bookmarks.reduce((acc, bookmark) => {
          acc[bookmark.content_type] = (acc[bookmark.content_type] || 0) + 1;
          return acc;
        }, {});

        // Get user's last activity
        const { data: activity, error } = await supabase
          .from('user_activity')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw error;
        }

        setStats({
          totalBookmarks: bookmarks.length,
          bookmarksByType,
          joinDate,
          lastActive: activity?.created_at ? new Date(activity.created_at) : joinDate
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        showToast('Error loading profile data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user, bookmarks, navigate, showToast]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                @{getUsername()}
              </h1>
              <p className="text-gray-600 mt-1">
                Member since {stats.joinDate.toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Bookmarks</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.totalBookmarks}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900">Last Active</h3>
            <p className="text-gray-600 mt-2">
              {stats.lastActive.toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900">Favorite Type</h3>
            <p className="text-gray-600 mt-2 capitalize">
              {Object.entries(stats.bookmarksByType).reduce((a, b) => 
                (a[1] > b[1] ? a : b)
              )[0] || 'None'}
            </p>
          </div>
        </div>

        {/* Bookmarks by Type */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Bookmarks by Type
          </h2>
          <div className="space-y-4">
            {Object.entries(stats.bookmarksByType).map(([type, count]) => (
              <div 
                key={type}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <span className="text-gray-600 capitalize">{type}s</span>
                <span className="text-gray-900 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;