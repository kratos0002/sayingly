import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const SlangExpressions = () => {
  const { languageCode } = useParams();
  const [languages, setLanguages] = useState([]);
  const [slangList, setSlangList] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(languageCode || 'nl');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      fetchSlang(selectedLanguage);
    }
  }, [selectedLanguage]);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name');

      if (error) throw error;
      setLanguages(data);
    } catch (error) {
      console.error('Error fetching languages:', error);
      setError(error.message);
    }
  };

  const fetchSlang = async (langCode) => {
    setLoading(true);
    try {
      const { data: langData, error: langError } = await supabase
        .from('languages')
        .select('id')
        .eq('code', langCode)
        .single();

      if (langError) throw langError;

      const { data, error } = await supabase
        .from('slang_expressions')
        .select(`
          *,
          languages!inner (
            name,
            code
          )
        `)
        .eq('language_id', langData.id);

      if (error) throw error;
      setSlangList(data || []);
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
        <Link 
          to="/" 
          className="inline-block mb-6 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Slang & Colloquialisms</h1>
          <p className="text-lg text-gray-600">Modern everyday expressions</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="max-w-md mx-auto">
            <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Language
            </label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading expressions</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          ) : (
            slangList.map((slang) => (
              <div
                key={slang.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-600">
                      {slang.expression}
                    </h2>
                    <span className="text-sm text-gray-500">{slang.literal_translation}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-sm font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      {slang.register}
                    </span>
                    <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {slang.time_period}
                    </span>
                  </div>
                </div>
                
                <div className="text-gray-600 mb-4">
                  <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                    {slang.pronunciation}
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-gray-800">
                    <span className="font-semibold">Meaning: </span>
                    {slang.meaning}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-semibold">Context: </span>
                    {slang.context}
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg italic text-gray-700">
                    <span className="font-semibold not-italic">Example: </span>
                    {slang.example}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-600">
                    <span>Region: {slang.region}</span>
                    <span>Age group: {slang.age_group}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SlangExpressions;