import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import countriesGeoJSON from './data/countries.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons'; 
import { useCallback } from "react";
import debounce from "lodash/debounce";



// Helper function to get flag emoji from country code
const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '🏳'; // Default flag
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
};


const MapHomePage = () => {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState({});
  const [languageCodes, setLanguageCodes] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: 20,
    longitude: 0,
    zoom: 1.5,
  });
  const [loading, setLoading] = useState(true);
  const [idioms, setIdioms] = useState([]);
  const [proverbs, setProverbs] = useState([]);
  const [untranslatableWords, setUntranslatableWords] = useState([]);
  const [slangExpressions, setSlangExpressions] = useState([]);
  const [counts, setCounts] = useState({
    languages: 0,
    idioms: 0,
    proverbs: 0,
    untranslatables: 0,
    slangs: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false); // State for footer info panel
  const [showTooltip, setShowTooltip] = useState(true);
  



const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

const handleMove = useCallback(
  debounce((evt) => {
    setViewport(evt.viewState); // Update viewport after a small delay
  }, 100),
  []
);


// Calculate centroid from GeoJSON geometry
const calculateCentroid = (geometry) => {
  if (geometry.type === 'Polygon') {
    const coordinates = geometry.coordinates[0];
    const longitudes = coordinates.map((coord) => coord[0]);
    const latitudes = coordinates.map((coord) => coord[1]);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);

    return [(minLng + maxLng) / 2, (minLat + maxLat) / 2]; // Center of bounds
  } else if (geometry.type === 'MultiPolygon') {
    const allCoordinates = geometry.coordinates.flatMap((polygon) => polygon[0]);
    const longitudes = allCoordinates.map((coord) => coord[0]);
    const latitudes = allCoordinates.map((coord) => coord[1]);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);

    return [(minLng + maxLng) / 2, (minLat + maxLat) / 2]; // Center of bounds
  }
  return null;
};


  const calculateBounds = (countries) => {
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;
  
    countries.forEach((country) => {
      const countryData = countriesGeoJSON.features.find(
        (feature) => feature.id === country.iso_a3
      );
  
      if (!countryData) {
        console.warn('Country not found in GeoJSON:', country.iso_a3);
        return;
      }
  
      const coordinates =
        countryData.geometry.type === 'Polygon'
          ? countryData.geometry.coordinates[0]
          : countryData.geometry.coordinates[0][0];
  
      coordinates.forEach(([lng, lat]) => {
        if (lng < minLng) minLng = lng;
        if (lat < minLat) minLat = lat;
        if (lng > maxLng) maxLng = lng;
        if (lat > maxLat) maxLat = lat;
      });
    });
  
    console.log('Calculated Bounds:', [[minLng, minLat], [maxLng, maxLat]]);
    return [[minLng, minLat], [maxLng, maxLat]];
  };

  const adjustViewportToFitMarkers = (countries) => {
    const bounds = calculateBounds(countries);
  
    if (!bounds || bounds.length !== 2) return;
  
    const [minLng, minLat] = bounds[0];
    const [maxLng, maxLat] = bounds[1];
  
    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;
  
    // Calculate a zoom level to fit all points
    const lngDiff = maxLng - minLng;
    const latDiff = maxLat - minLat;
    const paddingFactor = 1.2; // Add a bit of padding around bounds
  
    const zoom = Math.floor(
      Math.log2(360 / Math.max(lngDiff * paddingFactor, latDiff * paddingFactor))
    );
  
    setViewport((prev) => ({
      ...prev,
      longitude: centerLng,
      latitude: centerLat,
      zoom: Math.max(0, zoom),
    }));
  };
  
  


  // Country Markers Component
  const CountryMarkers = ({ language, setSelectedCountry, selectedCountry }) => {
    if (!language || !language.countries || !language.countries.length) {
      console.warn("No countries provided for the language:", language?.name);
      return null; // Gracefully handle missing or invalid data
    }
  
    return (
      <>
        {language.countries.map((country) => {
          // Find the country data in the GeoJSON features
          const countryData = countriesGeoJSON.features.find(
            (feature) => feature.id === country.iso_a3
          );
  
          if (!countryData) {
            console.warn("Country not found in GeoJSON:", country.iso_a3);
            return null; // Skip rendering this country if data is missing
          }
  
          // Calculate the centroid for marker placement
          const centroid = calculateCentroid(countryData.geometry);
          if (!centroid) {
            console.warn("Centroid could not be calculated for country:", country.iso_a3);
            return null; // Skip rendering if centroid is invalid
          }
  
          const [longitude, latitude] = centroid;
  
          // Render Marker and Popup
          return (
            <React.Fragment key={country.iso_a3}>
              {/* Marker */}
              <Marker longitude={longitude} latitude={latitude}>
                <div
                  onClick={() => setSelectedCountry({ ...country, longitude, latitude })}
                  style={{
                    cursor: "pointer",
                    transform: "translate(-50%, -100%)", // Position the pin correctly
                  }}
                  title={`${country.percentage}% of people speak ${language.name}`}
                >
                  {/* SVG Pin */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={
                      selectedCountry?.iso_a3 === country.iso_a3
                        ? "rgba(255, 0, 0, 0.8)" // Highlighted color for selected
                        : "rgba(0, 123, 255, 0.8)" // Default pin color
                    }
                    width="40px" // Adjusted pin size
                    height="40px"
                  >
                    <path d="M12 2C8.134 2 5 5.134 5 9c0 4.293 4.532 10.074 6.525 12.614a1.67 1.67 0 0 0 2.95 0C14.468 19.074 19 13.293 19 9c0-3.866-3.134-7-7-7zm0 12.5c-2.485 0-4.5-2.015-4.5-4.5S9.515 5.5 12 5.5s4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5z" />
                  </svg>
  
                  {/* Percentage Text */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: "-20px", // Position text below the pin
                      left: "50%",
                      transform: "translateX(-50%)",
                      color: "#000",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {Math.round(country.percentage)}%
                  </span>
                </div>
              </Marker>
  
              {/* Popup */}
              {selectedCountry?.iso_a3 === country.iso_a3 && (
                <Popup
                  longitude={longitude}
                  latitude={latitude}
                  closeOnClick={false}
                  onClose={() => setSelectedCountry(null)}
                  offset={[0, -40]} // Adjust offset for better positioning
                >
                  <div>
                    <h3 className="text-lg font-bold">{language.name}</h3>
                    <p>{`${country.percentage}% of people in this country speak ${language.name}`}</p>
                  </div>
                </Popup>
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  };
  
  
  
  // Fetch counts for the sidebar
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { count: languageCount } = await supabase
          .from('languages')
          .select('*', { count: 'exact' });
        const { count: idiomCount } = await supabase
          .from('idioms')
          .select('*', { count: 'exact' });
        const { count: proverbCount } = await supabase
          .from('proverbs')
          .select('*', { count: 'exact' });
        const { count: untranslatableCount } = await supabase
          .from('untranslatable_words')
          .select('*', { count: 'exact' });
        const { count: slangCount } = await supabase
          .from('slang_expressions')
          .select('*', { count: 'exact' });

        setCounts({
          languages: languageCount || 0,
          idioms: idiomCount || 0,
          proverbs: proverbCount || 0,
          untranslatables: untranslatableCount || 0,
          slangs: slangCount || 0,
        });
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };
    fetchCounts();
  }, []);

  // Fetch language codes
  useEffect(() => {
    const fetchLanguageCodes = async () => {
      try {
        const { data } = await supabase
          .from('languages')
          .select('id, name, code');
        const processedLanguageCodes = data.reduce((acc, row) => {
          acc[row.id] = { name: row.name, code: row.code };
          return acc;
        }, {});
        setLanguageCodes(processedLanguageCodes);
      } catch (error) {
        console.error('Error fetching language codes:', error);
      }
    };
    fetchLanguageCodes();
  }, []);

  // Fetch language and country data
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        const { data } = await supabase
          .from('country_languages')
          .select(`
            country_code,
            iso_a3,
            percentage,
            language_id,
            languages (
              id,
              name
            )
          `);

        const processedData = data.reduce((acc, row) => {
          const language = row.languages;
          if (!language) return acc;

          if (!acc[language.id]) {
            acc[language.id] = {
              name: language.name,
              code: row.country_code,
              countries: [],
              countryCodes: [],
            };
          }

          if (
            row.country_code &&
            !acc[language.id].countryCodes.includes(row.country_code)
          ) {
            acc[language.id].countryCodes.push(row.country_code);
          }

          acc[language.id].countries.push({
            iso_a3: row.iso_a3,
            percentage: row.percentage,
          });
          return acc;
        }, {});

        setLanguages(processedData);
      } catch (error) {
        console.error('Error fetching languages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  const fetchLanguagesByTheme = async (theme) => {
    const { data } = await supabase
        .from('language_objects')
        .select('id, name, type, theme')
        .eq('theme', theme);
    setLanguages(data);
};


  // Fetch highlights
  const fetchLanguageHighlights = async (languageId) => {
    try {
      const idiomResponse = await supabase
        .from('idioms')
        .select('original')
        .eq('language_id', languageId)
        .limit(5);
      const proverbResponse = await supabase
        .from('proverbs')
        .select('text')
        .eq('language_id', languageId)
        .limit(5);
      const untranslatableResponse = await supabase
        .from('untranslatable_words')
        .select('word, meaning')
        .eq('language_id', languageId)
        .limit(3);
      const slangResponse = await supabase
        .from('slang_expressions')
        .select('expression, meaning')
        .eq('language_id', languageId)
        .limit(3);

      // Set data in state
      if (idiomResponse.data) setIdioms(idiomResponse.data);
      if (proverbResponse.data) setProverbs(proverbResponse.data);
      if (untranslatableResponse.data)
        setUntranslatableWords(untranslatableResponse.data);
      if (slangResponse.data) setSlangExpressions(slangResponse.data);
    } catch (error) {
      console.error('Error fetching language highlights:', error);
    }
  };
  

  const handleLanguageSelect = (languageId) => {
    const selectedLang = languages[languageId];
    if (!selectedLang) {
      console.error('No language found for ID:', languageId);
      return;
    }
  
    setSelectedLanguage({
      ...selectedLang,
      id: languageId,
    });
  
    fetchLanguageHighlights(languageId);
  
    if (selectedLang.countries.length > 0) {
      adjustViewportToFitMarkers(selectedLang.countries); // Dynamically adjust the viewport
    }
  };
  
  
  const getCountryCoordinates = (countryCode) => {
    const country = countriesGeoJSON.features.find(
      (feature) => feature.id === countryCode
    );

    if (!country) return null;

    if (country.geometry.type === 'Polygon') {
      const coordinates = country.geometry.coordinates[0];
      const [longitude, latitude] = coordinates[Math.floor(coordinates.length / 2)];
      return { latitude, longitude };
    }

    if (country.geometry.type === 'MultiPolygon') {
      const coordinates = country.geometry.coordinates[0][0];
      const [longitude, latitude] = coordinates[Math.floor(coordinates.length / 2)];
      return { latitude, longitude };
    }

    return null;
  };

  const filteredLanguages = Object.keys(languages)
    .filter((languageId) =>
      languages[languageId].name.toLowerCase().includes(searchTerm)
    )
    .reduce((acc, key) => {
      acc[key] = languages[key];
      return acc;
    }, {});

  return loading ? (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">Loading...</p>
    </div>
  ) : (
    <div className="min-h-screen bg-gray-100">
      <div className="map-container flex h-screen">

              {/* Toggle to HomePage */}
      <button
        className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50 hover:bg-blue-600"
        onClick={() => navigate('/')} // Navigate to HomePage
      >
        Switch to Basic View
      </button>
        {/* Sidebar */}
        {showTooltip && (
  <div
    className="absolute top-16 left-6 bg-white text-gray-800 p-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 tooltip"
    style={{
      animation: "fadeIn 0.5s ease-in-out",
      border: "1px solid #d1d5db",
    }}
  >
    <div className="flex items-center">
      <span className="mr-2 text-lg">🌍</span>
      <p className="text-sm font-medium">
        Click here to explore languages!
      </p>
    </div>
    <button
      onClick={() => setShowTooltip(false)}
      className="text-sm font-medium underline hover:text-blue-500 ml-2"
    >
      Got it
    </button>
  </div>
)}


        
          {/* Toggle Button */}
          <button
        className="fixed top-4 left-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-50 flex items-center justify-center"
        onClick={() => {
          setIsSidebarOpen(true); // Open the sidebar
          setShowTooltip(false); // Hide tooltip when clicked
        }}

        style={{ width: '48px', height: '48px' }} // Circle button
      >
        <FontAwesomeIcon icon={faGlobe} size="lg" />
      </button>

<div
  className={`sidebar fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 ${
    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
  }`}
  style={{ width: '80%',
    maxWidth: '300px',
    overflowY: 'auto', // Enable scrolling for sidebar content
    height: '100%', }}
>
  <button
    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
    onClick={() => setIsSidebarOpen(false)}
  >
    ✕
  </button>
  <h1 className="text-3xl font-bold mb-4 mt-6 pl-4">Wisdom of the World</h1>
  <p className="text-sm text-gray-500 mb-4 pl-4">
    {counts.languages} Languages • {counts.idioms} Idioms • {counts.proverbs} Proverbs • {counts.untranslatables} Untranslatables • {counts.slangs} Slangs
  </p>
  <p className="text-gray-600 mb-4 pl-4 pr-4">
    Explore the wisdom across the world. Select a language to learn more!
  </p>

  {/* Search Bar */}
  <input
    type="text"
    placeholder="Search for a language..."
    className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
  />

  {/* Language List */}
  <ul className="space-y-3 pl-4 pr-4">
    {Object.keys(filteredLanguages).map((languageId) => (
      <li
        key={languageId}
        className={`p-3 rounded-lg cursor-pointer ${
          selectedLanguage?.name === filteredLanguages[languageId].name
            ? 'bg-blue-100 text-blue-600'
            : 'hover:bg-gray-100'
        }`}
        onClick={() => {
          handleLanguageSelect(languageId);
          setIsSidebarOpen(false); // Close the sidebar after selecting
          setIsInfoPanelOpen(true); // Show the info panel
        }}
      >
        {filteredLanguages[languageId].name}
      </li>
    ))}
  </ul>
</div>

{/* Backdrop */}
{isSidebarOpen && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 z-40"
    onClick={() => setIsSidebarOpen(false)}
  ></div>
)}


        {/* Map */}
        <div className="map flex-1 relative">
        <Map
  initialViewState={viewport} // Use `initialViewState` for better control
  style={{ width: '100%', height: '100vh' }}
  mapStyle="mapbox://styles/mapbox/light-v10"
  mapboxAccessToken={
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 
    process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
  }
  onMove={handleMove}
  scrollZoom={true}
  dragPan={true}
  dragRotate={false}
  doubleClickZoom={true}

>
  {/* Add Markers and Popups */}
  {selectedLanguage && (
    <CountryMarkers
      countries={selectedLanguage.countries}
      language={selectedLanguage}
    />
  )}

  {/* Add all country markers for languages */}
  {!selectedLanguage &&
    Object.keys(languages).map((languageId) => (
      <CountryMarkers key={languageId} language={languages[languageId]} />
    ))}
</Map>


          {/* Info Panel */}
          {selectedLanguage && (
 <div className={`info-panel fixed bottom-0 left-0 w-full bg-white shadow-lg transition-transform ${
  isInfoPanelOpen ? 'translate-y-0' : 'translate-y-[90%]'
}`} style={{ height: '40vh', overflowY: 'auto', // Enable scrolling for sidebar content
}}>
 {isInfoPanelOpen && (
   <button
     className="w-full text-center py-2 bg-blue-500 text-black"
     onClick={() => setIsInfoPanelOpen(false)}
   >
     Collapse
   </button>
 )}
 {!isInfoPanelOpen && (
   <button
     className="toggle-info-panel w-full text-center py-2 bg-blue-500 text-black"
     onClick={() => setIsInfoPanelOpen(true)}
   >
     Expand
   </button>
 )}


    {isInfoPanelOpen && (
      <div className="p-4">
        <h2 className="text-lg font-bold mb-2 flex items-center">
          {selectedLanguage.name}
          {selectedLanguage.countryCodes?.length > 0 && (
            <span className="ml-2 flex items-center space-x-2">
              {selectedLanguage.countryCodes.map((code) => (
                <span
                  key={code}
                  title={`Country: ${code}`}
                  className="text-2xl"
                >
                  {getFlagEmoji(code)}
                </span>
              ))}
            </span>
          )}
        </h2>

        {/* Highlights */}
        <div>
          <h3 className="text-sm font-semibold mb-1">Idioms:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {idioms.length > 0
              ? idioms.map((idiom, index) => <li key={index}>{idiom.original}</li>)
              : <li>No idioms found.</li>}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-1">Proverbs:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {proverbs.length > 0
              ? proverbs.map((proverb, index) => <li key={index}>{proverb.text}</li>)
              : <li>No proverbs found.</li>}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-1">Untranslatable Words:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {untranslatableWords.length > 0
              ? untranslatableWords.map((word, index) => (
                  <li key={index}>
                    <strong>{word.word}</strong>: {word.meaning}
                  </li>
                ))
              : <li>No untranslatable words found.</li>}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-1">Slang Expressions:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {slangExpressions.length > 0
              ? slangExpressions.map((slang, index) => (
                  <li key={index}>
                    <strong>{slang.expression}</strong>: {slang.meaning}
                  </li>
                ))
              : <li>No slang expressions found.</li>}
          </ul>
        </div>

        <button
          onClick={() => {
            const langCode = languageCodes[selectedLanguage?.id]?.code;
            if (langCode) navigate(`/language/${langCode}`);
          }}
          className="block mt-4 text-blue-600 hover:text-blue-800 text-sm"
        >
          Explore more about {selectedLanguage?.name} →
        </button>
      </div>
    )}
  </div>
)}


        </div>
      </div>
    </div>
  );
};

export default MapHomePage;
