import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Themes = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('idiom_meaning_groups')
        .select(`
          id,
          name,
          core_meaning,
          context,
          idiom_meaning_connections (
            idiom:idioms (
              id,
              original,
              english_translation,
              languages (
                name,
                code
              )
            )
          )
        `);

      if (error) throw error;

      const processedThemes = data.map(theme => ({
        ...theme,
        idiomCount: theme.idiom_meaning_connections?.length || 0
      }));
  
      setThemes(processedThemes);
      console.log('Themes data:', data);
      // setThemes(data || []);
    } catch (error) {
      console.error('Error fetching themes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto p-4">
        <Link 
          to="/" 
          className="inline-block mb-6 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to World Map
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Themes</h1>
          <p className="text-lg text-gray-600">Discover how different cultures express similar ideas</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading themes</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((theme) => (
  <Link
    key={theme.id}
    to={`/themes/${theme.id}`}
    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200"
  >
    <div className="flex justify-between items-start mb-3">
      <h2 className="text-xl font-bold text-blue-600">{theme.name}</h2>
      <span className="text-sm font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
        {theme.idiomCount} idioms
      </span>
    </div>
    <p className="text-gray-600 mb-4">{theme.core_meaning}</p>
    <p className="text-sm text-gray-500 italic">{theme.context}</p>
  </Link>
))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Themes;