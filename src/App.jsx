import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DutchIdioms from './components/DutchIdioms';
import { Analytics } from "@vercel/analytics/react"
import HomePage from './components/HomePage';
import Themes from './components/Themes';  // Import from components
import ThemeView from './components/ThemeView';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/language/:languageCode" element={<DutchIdioms />} />
        <Route path="/themes" element={<Themes />} />
        <Route path="/themes/:themeId" element={<ThemeView />} /> {/* Changed this line */}
        
      </Routes>
      <Analytics />
    </Router>
  );
}

export default App;