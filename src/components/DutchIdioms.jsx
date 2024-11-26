import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const DutchIdioms = () => {
  const { languageCode } = useParams();
  const [languages, setLanguages] = useState([]);
  const [idioms, setIdioms] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(languageCode || 'nl');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [languageDetails, setLanguageDetails] = useState(null);

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      fetchLanguageDetails(selectedLanguage);
      fetchIdioms(selectedLanguage);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (languageCode) {
      setSelectedLanguage(languageCode);
    }
  }, [languageCode]);

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

  const fetchLanguageDetails = async (langCode) => {
    try {
      const { data: langData, error: langError } = await supabase
        .from('languages')
        .select(`
          id,
          code,
          name,
          language_details!inner(
            description,
            speakers,
            regions,
            age_description,
            unique_features
          )
        `)
        .eq('code', langCode)
        .single();
  
      if (langError) {
        // Don't throw error for missing language details
        if (langError.code === 'PGRST116') {
          setLanguageDetails(null);
          return;
        }
        throw langError;
      }
      setLanguageDetails(langData.language_details);
    } catch (error) {
      console.error('Error:', error);
      setLanguageDetails(null); // Set null instead of error state
    }
  };
  
  const fetchIdioms = async (langCode) => {
    setLoading(true);
    try {
      const { data: langData, error: langError } = await supabase
        .from('languages')
        .select('id')
        .eq('code', langCode)
        .single();
  
      if (langError) {
        console.log('Language Error:', langError);
        throw langError;
      }
  
      if (!langData) {
        throw new Error('Language not found');
      }
  
      const { data, error } = await supabase
        .from('idioms')
        .select('*')
        .eq('language_id', langData.id)
        .order('popularity_rank');
  
      if (error) throw error;
      setIdioms(data || []);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get current language name
  const currentLanguage = languages.find(lang => lang.code === selectedLanguage)?.name;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-4">
        <Link 
          to="/" 
          className="inline-block mb-6 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to World Map
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sayingly</h1>
          <p className="text-lg text-gray-600">Discover the world's wisdom through idioms</p>
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

        {languageDetails && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">About {currentLanguage}</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {languageDetails.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Quick Facts</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Speakers: {new Intl.NumberFormat().format(languageDetails.speakers)}+</li>
                    <li>• Age: {languageDetails.age_description}</li>
                    <li>• Regions: {languageDetails.regions.join(', ')}</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Unique Features</h3>
                  <ul className="space-y-2 text-blue-800">
                    {languageDetails.unique_features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  <h3 className="text-sm font-medium text-red-800">Error loading idioms</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          ) : (
            idioms.map((idiom, index) => (
              <div
                key={idiom.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-blue-600">
                    {idiom.original}
                  </h2>
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    #{index + 1}
                  </span>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DutchIdioms;