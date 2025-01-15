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
      
      // Fetch user by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', lowercaseUsername)
        .single();

      if (userError || !userData) {
        throw new Error('Username not found');
      }

      // Authenticate using Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password,
      });

      if (authError) throw new Error('Invalid password');

      showToast('Successfully signed in!', 'success');
      return authData;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const signUp = async (username, password) => {
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

      const { data, error } = await supabase.auth.signUp({
        email: uniqueEmail,
        password,
        options: {
          data: {
            username: lowercaseUsername,
            display_username: username,
          }
        }
      });
      
      if (error) throw error;

      // Insert user record in users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          username: lowercaseUsername,
          display_username: username,
          email: uniqueEmail
        });

      if (insertError) throw insertError;

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