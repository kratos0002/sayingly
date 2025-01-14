import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const BookmarkContext = createContext({});

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    } else {
      setBookmarks([]);
      setLoading(false);
    }
  }, [user]);

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      showToast('Failed to load bookmarks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (contentType, contentId) => {
    if (!user) {
      showToast('Please sign in to bookmark content', 'error');
      return false;
    }

    try {
      const existingBookmark = bookmarks.find(
        b => b.content_type === contentType && b.content_id === contentId
      );

      if (existingBookmark) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .match({ id: existingBookmark.id });

        if (error) throw error;
        
        setBookmarks(bookmarks.filter(b => b.id !== existingBookmark.id));
        showToast('Bookmark removed', 'success');
        return false;
      } else {
        // Add bookmark
        const { data, error } = await supabase
          .from('bookmarks')
          .insert([
            {
              user_id: user.id,
              content_type: contentType,
              content_id: contentId
            }
          ])
          .select()
          .single();

        if (error) throw error;
        
        setBookmarks([...bookmarks, data]);
        showToast('Bookmark added', 'success');
        return true;
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      showToast('Failed to update bookmark', 'error');
      return false;
    }
  };

  const isBookmarked = (contentType, contentId) => {
    return bookmarks.some(
      b => b.content_type === contentType && b.content_id === contentId
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
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};