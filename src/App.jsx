import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DutchIdioms from './components/DutchIdioms';
import { Analytics } from "@vercel/analytics/react"
import HomePage from './components/HomePage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/language/:languageCode" element={<DutchIdioms />} />
      </Routes>
      <Analytics />
    </Router>
  );
}

export default App;