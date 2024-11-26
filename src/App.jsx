import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WorldMap from './components/WorldMap';
import CountryView from './components/CountryView';
import DutchIdioms from './components/DutchIdioms';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WorldMap />} />
        <Route path="/country/:countryCode" element={<CountryView />} />
        <Route path="/language/:languageCode" element={<DutchIdioms />} />
      </Routes>
    </Router>
  );
}

export default App;