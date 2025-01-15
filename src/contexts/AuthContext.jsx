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

      // Authenticate using Supabase auth
      const { data: { user, session }, error: authError } = await supabase.auth.signInWithPassword({
        email: `${lowercaseUsername}@sayingly.local`, // Fallback for existing accounts
        password,
      });

      if (authError) {
        throw new Error(authError.message || 'Authentication failed');
      }

      showToast('Successfully signed in!', 'success');
      return { user, session };
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const signUp = async (username, password, email = null) => {
    try {
      const lowercaseUsername = username.toLowerCase();
      
      // Check if username is available
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('username', lowercaseUsername)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      if (existingUser) {
        throw new Error('Username is already taken');
      }

      // Generate a unique email for Supabase auth
      const uniqueEmail = `${lowercaseUsername}@sayingly.local`;

      const { data: { user, session }, error } = await supabase.auth.signUp({
        email: email || uniqueEmail,
        password,
        options: {
          data: {
            username: lowercaseUsername,
            display_username: username
          }
        }
      });
      
      if (error) throw error;

      if (!user) {
        throw new Error('User creation failed');
      }

      // Insert user record in users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          username: lowercaseUsername,
          display_username: username,
          email: `${lowercaseUsername}@sayingly.local`
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