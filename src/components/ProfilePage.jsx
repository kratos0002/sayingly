import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBookmarks } from '../contexts/BookmarkContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, getUsername, signOut } = useAuth();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks();

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                @{getUsername()}
              </h1>
              <p className="text-gray-600 mt-1">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900">Bookmarks</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {bookmarksLoading ? '...' : bookmarks.length}
            </p>
          </div>
          {/* Add more stats as needed */}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Activity
          </h2>
          {bookmarksLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : bookmarks.length > 0 ? (
            <div className="space-y-4">
              {bookmarks.slice(0, 5).map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Bookmarked a {bookmark.content_type}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(bookmark.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/${bookmark.content_type}s/${bookmark.content_id}`)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No activity yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;