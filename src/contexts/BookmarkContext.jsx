import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const BookmarkContext = createContext();

export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
    
    // Subscribe to bookmark changes
    const subscription = supabase
      .channel('bookmark_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookmarks' 
      }, fetchBookmarks)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_bookmarks');
      
      if (error) throw error;
      
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (contentType, contentId) => {
    try {
      const { data, error } = await supabase
        .rpc('toggle_bookmark', {
          p_content_type: contentType,
          p_content_id: contentId
        });

      if (error) throw error;

      // Refresh bookmarks
      fetchBookmarks();
      
      return data; // Returns true if bookmarked, false if unbookmarked
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return false;
    }
  };

  const isBookmarked = (contentType, contentId) => {
    return bookmarks.some(
      bookmark => 
        bookmark.content_type === contentType && 
        bookmark.content_id === contentId
    );
  };

  return (
    <BookmarkContext.Provider 
      value={{ 
        bookmarks, 
        loading, 
        toggleBookmark, 
        isBookmarked,
        refreshBookmarks: fetchBookmarks 
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
}