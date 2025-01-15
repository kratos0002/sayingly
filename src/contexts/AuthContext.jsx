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
      const lowercaseUsername = username.toLowerCase();
      
      // Use username as email with a consistent domain
      const email = `${lowercaseUsername}@sayingly.app`;

      const { data: { user, session }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Provide more user-friendly error messages
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Incorrect username or password');
        }
        throw new Error(authError.message || 'Unable to sign in');
      }

      showToast('Welcome back!', 'success');
      return { user, session };
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const signUp = async (username, password) => {
    try {
      const lowercaseUsername = username.toLowerCase();
      
      // Validate username
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
        throw new Error('Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens');
      }
      
      // Check if username exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', lowercaseUsername)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      if (existingUser) {
        throw new Error('This username is already taken');
      }

      // Create auth user with consistent email format
      const email = `${lowercaseUsername}@sayingly.app`;
      
      const { data: { user, session }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: lowercaseUsername,
            display_username: username
          }
        }
      });

      if (error) {
        if (error.message.includes('Password')) {
          throw new Error('Password must be at least 6 characters long');
        }
        throw error;
      }

      if (!user) {
        throw new Error('Unable to create account');
      }

      // Create user profile
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          username: lowercaseUsername,
          display_username: username,
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      showToast('Account created successfully!', 'success');
      return { user, session };
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showToast('You\'ve been signed out', 'success');
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