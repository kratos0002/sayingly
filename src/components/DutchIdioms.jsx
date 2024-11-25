import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DutchIdioms = () => {
  const [languages, setLanguages] = useState([]);
  const [idioms, setIdioms] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('nl');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      console.log('Fetching languages...'); // Debug log
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name');

      if (error) throw error;
      console.log('Languages data:', data); // Debug log
      setLanguages(data);
    } catch (error) {
      console.error('Error fetching languages:', error);
      setError(error.message);
    }
  };

  const fetchIdioms = async (languageCode) => {
    setLoading(true);
    try {
      console.log('Fetching idioms for language:', languageCode); // Debug log

      const { data: languageData, error: langError } = await supabase
        .from('languages')
        .select('id')
        .eq('code', languageCode)
        .single();

      if (langError) throw langError;

      const { data, error } = await supabase
        .from('idioms')
        .select(`
          id,
          original,
          pronunciation,
          english_translation,
          meaning,
          usage_context,
          example,
          popularity_rank
        `)
        .eq('language_id', languageData.id)
        .order('popularity_rank', { ascending: true })
        .limit(10);

      if (error) throw error;
      console.log('Fetched idioms:', data); // Debug log
      setIdioms(data);
    } catch (error) {
      console.error('Error fetching idioms:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Popular Idioms Explorer</h2>
          <div className="mt-4 w-64">
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">Loading idioms...</div>
          ) : error ? (
            <div className="text-red-500 py-4">{error}</div>
          ) : (
            <div className="space-y-6">
              {idioms.map((idiom, index) => (
                <div key={idiom.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-blue-600">{idiom.original}</h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-mono">{idiom.pronunciation}</span>
                        </div>
                      </div>
                      <span className="text-lg font-medium text-gray-700">#{index + 1}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-gray-800">
                        <span className="font-semibold">English:</span> {idiom.english_translation}
                      </p>
                      <p className="text-gray-800">
                        <span className="font-semibold">Meaning:</span> {idiom.meaning}
                      </p>
                      <p className="text-gray-800">
                        <span className="font-semibold">Usage:</span> {idiom.usage_context}
                      </p>
                      <p className="text-gray-700 italic bg-gray-50 p-2 rounded">
                        <span className="font-semibold">Example:</span> {idiom.example}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DutchIdioms;