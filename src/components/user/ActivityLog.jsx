import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';

const ActivityLog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchActivities();
  }, [user, page]); // Fetch when page changes

  const fetchActivities = async () => {
    try {
      const { data, error, count } = await supabase
        .from('user_activity')
        .select('*, content_ref:content_id(*)', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      setActivities(current => 
        page === 1 ? data : [...current, ...data]
      );
      setHasMore(count > page * ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching activities:', error);
      showToast('Error loading activity log', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getActivityDescription = (activity) => {
    switch (activity.action_type) {
      case 'bookmark_add':
        return `Bookmarked a ${activity.content_type}`;
      case 'bookmark_remove':
        return `Removed bookmark from ${activity.content_type}`;
      case 'share':
        return `Shared a ${activity.content_type}`;
      case 'view':
        return `Viewed a ${activity.content_type}`;
      default:
        return `Interacted with a ${activity.content_type}`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
            <p className="text-gray-600 mt-1">Track your interactions and activity</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Profile
          </button>
        </div>

        {/* Activity List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading && page === 1 ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No activity recorded yet</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-900">
                          {getActivityDescription(activity)}
                        </p>
                        {activity.content_ref && (
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.content_ref.original}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(activity.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={loading}
                    className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;