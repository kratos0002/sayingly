import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const DutchIdioms = () => {
  const [languages, setLanguages] = useState([]);
  const [idioms, setIdioms] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('nl');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      fetchIdioms(selectedLanguage);
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

  const fetchIdioms = async (languageCode) => {
    setLoading(true);
    try {
      const { data: languageData, error: langError } = await supabase
        .from('languages')
        .select('id')
        .eq('code', languageCode)
        .single();

      if (langError) throw langError;

      const { data, error } = await supabase
        .from('idioms')
        .select('*')
        .eq('language_id', languageData.id)
        .order('popularity_rank', { ascending: true });

      if (error) throw error;
      setIdioms(data);
    } catch (error) {
      console.error('Error fetching idioms:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(idioms.length / itemsPerPage);
  const currentIdioms = idioms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sayingly</h1>
          <p className="text-lg text-gray-600">Discover the world's wisdom through idioms</p>
        </div>

        {/* Language Selector */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="max-w-md mx-auto">
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setCurrentPage(1);  // Reset to first page on language change
              }}
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

        {/* Idioms List */}
        <div className="space-y-6">
          {loading ? (
            // Loading Skeleton
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
            <>
              {currentIdioms.map((idiom, index) => (
                <div
                  key={idiom.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-blue-600">
                      {idiom.original}
                    </h2>
                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      #{(currentPage - 1) * itemsPerPage + index + 1}
                    </span>
                  </div>
                  
                  <div className="text-gray-600 mb-4">
                    <span className="font-mono text-sm">{idiom.pronunciation}</span>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DutchIdioms;