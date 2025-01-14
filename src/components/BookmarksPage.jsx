import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookmarks } from '../contexts/BookmarkContext';
import ContentCard from './common/ContentCard';
import { supabase } from '../lib/supabase';

const BookmarksPage = () => {
  const navigate = useNavigate();
  const { bookmarks, loading } = useBookmarks();
  const [contentItems, setContentItems] = React.useState({});
  const [loadingContent, setLoadingContent] = React.useState(true);

  React.useEffect(() => {
    const fetchBookmarkedContent = async () => {
      setLoadingContent(true);
      const items = {};

      // Group bookmarks by content type
      const bookmarksByType = bookmarks.reduce((acc, bookmark) => {
        if (!acc[bookmark.content_type]) {
          acc[bookmark.content_type] = [];
        }
        acc[bookmark.content_type].push(bookmark.content_id);
        return acc;
      }, {});

      // Fetch content for each type
      await Promise.all(
        Object.entries(bookmarksByType).map(async ([type, ids]) => {
          const { data, error } = await supabase
            .from(type + 's') // assuming table names are plural
            .select(`
              *,
              languages (
                name,
                code
              )
            `)
            .in('id', ids);

          if (!error && data) {
            items[type] = data;
          }
        })
      );

      setContentItems(items);
      setLoadingContent(false);
    };

    if (bookmarks.length > 0) {
      fetchBookmarkedContent();
    } else {
      setLoadingContent(false);
    }
  }, [bookmarks]);

  if (loading || loadingContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin text-4xl">🔄</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Bookmarks</h1>
            <p className="text-gray-600 mt-2">
              {bookmarks.length} saved items
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
        </div>

        {/* Content */}
        {bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              You haven't bookmarked any content yet.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Browse content
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(contentItems).map(([type, items]) => (
              <div key={type}>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 capitalize">
                  {type}s
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <ContentCard
                      key={`${type}-${item.id}`}
                      content={{
                        id: item.id,
                        original: item.original,
                        english_translation: item.english_translation,
                        pronunciation: item.pronunciation,
                        example: item.example,
                        usage_context: item.usage_context,
                        language: {
                          name: item.languages.name,
                          code: item.languages.code
                        },
                        type: type
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;