import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (username, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: `${username}@sayingly.user`,
      password,
      options: {
        data: {
          username,
        }
      }
    });
    
    if (error) throw error;
    return data;
  };

  const signIn = async (username, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@sayingly.user`,
      password,
    });
    
    if (error) throw error;
    return data;
  };

  const value = {
    signUp,
    signIn,
    signOut: () => supabase.auth.signOut(),
    user,
    getUsername: () => user?.user_metadata?.username,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
