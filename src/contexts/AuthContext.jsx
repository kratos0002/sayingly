import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastContext';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (username, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@sayingly.user`,
        password,
      });
      if (error) throw error;
      showToast('Successfully signed in!', 'success');
      return data;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const signUp = async (username, password) => {
    try {
      // Check if username is available
      const { data: isAvailable, error: checkError } = await supabase
        .rpc('is_username_available', { username: username.toLowerCase() });
      
      if (checkError) throw checkError;
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }

      const { data, error } = await supabase.auth.signUp({
        email: `${username}@sayingly.user`,
        password,
        options: {
          data: {
            username: username.toLowerCase(),
          }
        }
      });
      
      if (error) throw error;
      showToast('Account created successfully!', 'success');
      return data;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showToast('Successfully signed out', 'success');
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const getUsername = () => {
    return user?.user_metadata?.username || 'User';
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getUsername,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};