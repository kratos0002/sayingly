import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DutchIdioms from './components/DutchIdioms';
import { Analytics } from "@vercel/analytics/react"
import HomePage from './components/HomePage';
import BookmarksPage from './components/BookmarksPage';
import ProfilePage from './components/ProfilePage';
import { AuthProvider } from './contexts/AuthContext';
import { BookmarkProvider } from './contexts/BookmarkContext';
import { ToastProvider } from './contexts/ToastContext';
import Navigation from './components/common/Navigation';
import Themes from './components/Themes';  // Import from components
import ThemeView from './components/ThemeView';
import SlangExpressions from './components/SlangExpressions';  // Add this import
import AllIdioms from './components/AllIdioms';
import AllProverbs from './components/AllProverbs';
import AllSlangs from './components/AllSlangs'
import AllUntranslatables from './components/AllUntranslatables';
import MapHomePage from './components/MapHomePage';
import AllRiddles from './components/AllRiddles';
import AllWisdomConcepts from './components/AllWisdomConcepts';
import AllMythsLegends from './components/AllMythsLegends';
import AllFalseFriends from './components/AllFalseFriends';
import './App.css';



function App() {
  const [appLoading, setAppLoading] = useState(true);
  
  useEffect(() => {
  // Check if Supabase is configured
  if (!supabase) {
  console.error('Supabase client is not initialized');
  setAppLoading(false);
  return;
  }
  
  // Initial auth check
  supabase.auth.getSession().then(({ data: { session } }) => {
  setAppLoading(false);
  });
  }, []);
  
  if (appLoading) {
  return <LoadingSpinner fullScreen />;
  }
  
  return (
  <ErrorBoundary>
    <ToastProvider>
      <AuthProvider>
        <BookmarkProvider>
      <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/language/:languageCode" element={<DutchIdioms />} />
        <Route path="/themes" element={<Themes />} />
        <Route path="/themes/:themeId" element={<ThemeView />} /> {/* Changed this line */}
        <Route path="/slang" element={<SlangExpressions />} />  {/* Add this route */}
        <Route path="/map" element={<MapHomePage />} />

  <Route path="/idioms" element={<AllIdioms />} />
  <Route path="/riddles" element={<AllRiddles />} />
  <Route path="/proverbs" element={<AllProverbs />} />
  <Route path="/wisdom-concepts" element={<AllWisdomConcepts />} />
  <Route path="/myths" element={<AllMythsLegends />} />
  <Route path="/false-friends" element={<AllFalseFriends />} />




  <Route path="/untranslatables" element={<AllUntranslatables />} />

      </Routes>
      <Analytics />
          </Router>
        </BookmarkProvider>
      </AuthProvider>
    </ToastProvider>
  </ErrorBoundary>
  );
}

export default App;
