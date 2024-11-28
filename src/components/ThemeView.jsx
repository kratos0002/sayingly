import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ThemeView = () => {
  const { themeId } = useParams();
  const [theme, setTheme] = useState(null);
  const [idioms, setIdioms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchThemeAndIdioms();
  }, [themeId]);

  const fetchThemeAndIdioms = async () => {
    try {
      // Get theme details
      const { data: themeData, error: themeError } = await supabase
        .from('idiom_meaning_groups')
        .select('*')
        .eq('id', themeId)
        .single();

      if (themeError) throw themeError;

      // Get all idioms for this theme
      const { data: idiomsData, error: idiomsError } = await supabase
        .from('idiom_meaning_connections')
        .select(`
          idioms (
            id,
            original,
            pronunciation,
            english_translation,
            meaning,
            usage_context,
            example,
            difficulty_level,
            languages (
              name,
              code
            )
          )
        `)
        .eq('group_id', themeId);

      if (idiomsError) throw idiomsError;

      setTheme(themeData);
      setIdioms(idiomsData.map(item => item.idioms));
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/themes" 
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Themes
          </Link>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{theme.name}</h1>
              <p className="text-xl text-gray-600 mb-4">{theme.core_meaning}</p>
              <p className="text-gray-500 italic">{theme.context}</p>
            </div>

            <div className="space-y-6">
              {idioms.map((idiom) => (
                <div 
                  key={idiom.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-blue-600">
                      {idiom.original}
                    </h2>
                    <Link 
                      to={`/language/${idiom.languages.code}`}
                      className="text-sm font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {idiom.languages.name}
                    </Link>
                  </div>
                  
                  <div className="text-gray-600 mb-4">
                    <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                      {idiom.pronunciation}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <span className="font-semibold text-blue-900">English: </span>
                      <span className="text-blue-800">{idiom.english_translation}</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-gray-800">
                        <span className="font-semibold">Meaning: </span>
                        {idiom.meaning}
                      </p>
                      <p className="text-gray-800">
                        <span className="font-semibold">Usage: </span>
                        {idiom.usage_context}
                      </p>
                      <div className="bg-gray-50 p-3 rounded-lg italic text-gray-700">
                        <span className="font-semibold not-italic">Example: </span>
                        {idiom.example}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ThemeView;