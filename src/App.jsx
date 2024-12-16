import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DutchIdioms from './components/DutchIdioms';
import { Analytics } from "@vercel/analytics/react"
import HomePage from './components/HomePage';
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
import './App.css';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
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


  <Route path="/slang" element={<AllSlangs />} />
  <Route path="/untranslatables" element={<AllUntranslatables />} />

      </Routes>
      <Analytics />
    </Router>
  );
}

export default App;