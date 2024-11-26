import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
 ComposableMap,
 Geographies,
 Geography,
} from "react-simple-maps";

const WorldMap = () => {
 const navigate = useNavigate();

 // Countries we have idioms for
 const highlightedCountries = {
   'NLD': 'nl', // Netherlands -> Dutch
   'FRA': 'fr', // France -> French
   'ITA': 'it', // Italy -> Italian
   'IND': ['ta', 'ml', 'bn'], // India -> Tamil, Malayalam, Bengali
   'ZAF': 'af', // South Africa -> Afrikaans
 };

 const handleCountryClick = (countryCode) => {
   const languageCode = highlightedCountries[countryCode];
   if (languageCode) {
     if (Array.isArray(languageCode)) {
       // If country has multiple languages, navigate to country view
       navigate(`/country/${countryCode}`);
     } else {
       // If country has single language, navigate directly to language view
       navigate(`/language/${languageCode}`);
     }
   }
 };

 return (
   <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
     <div className="max-w-7xl mx-auto p-4">
       {/* Header */}
       <div className="text-center mb-8 pt-8">
         <h1 className="text-4xl font-bold text-gray-900 mb-2">Sayingly</h1>
         <p className="text-lg text-gray-600">Explore idioms from around the world</p>
       </div>

       {/* Map Container */}
       <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
         <ComposableMap
           projectionConfig={{
             rotate: [-10, 0, 0],
             scale: 147
           }}
         >
           <Geographies geography="https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json">
             {({ geographies }) =>
               geographies.map((geo) => {
                 const isHighlighted = highlightedCountries[geo.properties.ISO_A3];
                 return (
                   <Geography
                     key={geo.rsmKey}
                     geography={geo}
                     onClick={() => handleCountryClick(geo.properties.ISO_A3)}
                     style={{
                       default: {
                         fill: isHighlighted ? "#93c5fd" : "#D6D6DA",
                         outline: "none",
                         stroke: "#FFF",
                         strokeWidth: 0.5,
                       },
                       hover: {
                         fill: isHighlighted ? "#60a5fa" : "#D6D6DA",
                         outline: "none",
                         stroke: "#FFF",
                         strokeWidth: 0.5,
                         cursor: isHighlighted ? 'pointer' : 'default'
                       },
                       pressed: {
                         fill: "#3b82f6",
                         outline: "none"
                       }
                     }}
                     title={geo.properties.NAME}
                   />
                 );
               })
             }
           </Geographies>
         </ComposableMap>
       </div>

       {/* Quick Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Available Languages */}
         <div className="bg-white rounded-xl shadow-lg p-6">
           <h2 className="text-xl font-semibold mb-4">Available Languages</h2>
           <div className="space-y-2">
             {[
               { code: 'nl', name: 'Dutch' },
               { code: 'fr', name: 'French' },
               { code: 'it', name: 'Italian' },
               { code: 'ta', name: 'Tamil' },
               { code: 'ml', name: 'Malayalam' },
               { code: 'bn', name: 'Bengali' },
               { code: 'af', name: 'Afrikaans' },
             ].map((lang) => (
               <button
                 key={lang.code}
                 onClick={() => navigate(`/language/${lang.code}`)}
                 className="block w-full text-left px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition-colors"
               >
                 {lang.name}
               </button>
             ))}
           </div>
         </div>

         {/* Featured Idioms */}
         <div className="bg-white rounded-xl shadow-lg p-6">
           <h2 className="text-xl font-semibold mb-4">Featured Idioms</h2>
           <div className="space-y-3">
             <div className="p-3 rounded-lg hover:bg-gray-50">
               <p className="font-medium text-blue-600">"In bocca al lupo"</p>
               <p className="text-sm text-gray-600">Italian - "Into the mouth of the wolf"</p>
             </div>
             <div className="p-3 rounded-lg hover:bg-gray-50">
               <p className="font-medium text-blue-600">"Il pleut des cordes"</p>
               <p className="text-sm text-gray-600">French - "It's raining ropes"</p>
             </div>
             <div className="p-3 rounded-lg hover:bg-gray-50">
               <p className="font-medium text-blue-600">"Nu komt de aap uit de mouw"</p>
               <p className="text-sm text-gray-600">Dutch - "Now the monkey comes out of the sleeve"</p>
             </div>
           </div>
         </div>

         {/* Stats */}
         <div className="bg-white rounded-xl shadow-lg p-6">
           <h2 className="text-xl font-semibold mb-4">Collection Stats</h2>
           <div className="space-y-4">
             <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
               <span className="font-medium">Languages</span>
               <span className="font-bold text-blue-600">7</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
               <span className="font-medium">Idioms</span>
               <span className="font-bold text-blue-600">35+</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
               <span className="font-medium">Countries</span>
               <span className="font-bold text-blue-600">5</span>
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
};

export default WorldMap;