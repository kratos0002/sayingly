import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AllIdioms = () => {
  const navigate = useNavigate();
  const [idioms, setIdioms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    fetchIdioms();
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    const { data, error } = await supabase.from('languages').select('*');
    if (!error) setLanguages(data);
  };

  const fetchIdioms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('idioms')
      .select(`
        *,
        languages (
          name,
          code
        )
      `)
      .order('popularity_rank', { ascending: false });

    if (!error) setIdioms(data);
    setLoading(false);
  };

  const filteredIdioms = idioms.filter(idiom => 
    (selectedLanguage === 'all' || idiom.languages.code === selectedLanguage) &&
    (idiom.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
     idiom.english_translation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">All Idioms</h1>
          <p className="text-gray-600">{filteredIdioms.length} expressions</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Search idioms..."
            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Languages</option>
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Idioms Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse bg-white rounded-xl shadow-md p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdioms.map((idiom) => (
              <div
                key={idiom.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => navigate(`/language/${idiom.languages.code}`)}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                    {idiom.languages.name}
                  </span>
                  {idiom.difficulty_level && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                      {idiom.difficulty_level}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{idiom.original}</h2>
                <p className="text-gray-600 mb-3">{idiom.english_translation}</p>
                <p className="text-sm text-gray-500">{idiom.meaning}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllIdioms;