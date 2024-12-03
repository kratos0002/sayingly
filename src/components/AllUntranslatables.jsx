import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AllUntranslatables = () => {
  const navigate = useNavigate();
  const [untranslatables, setUntranslatables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    fetchUntranslatables();
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('name');
    if (!error) setLanguages(data);
  };

  const fetchUntranslatables = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('untranslatable_words')
      .select(`
        *,
        languages (
          name,
          code
        )
      `)
      .order('created_at', { ascending: false });

    if (!error) setUntranslatables(data);
    setLoading(false);
  };
  const filteredUntranslatables = untranslatables.filter((word) =>
    (selectedLanguage === 'all' || word.languages?.code === selectedLanguage) &&
    (word.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     word.meaning?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     word.context?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     word.example?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Untranslatable Words</h1>
            <p className="text-gray-600 mt-2">
              Unique words and expressions that defy translation. Dive into the beauty of language and culture!
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium text-gray-900">
              {filteredUntranslatables.length} Untranslatables
            </p>
            <p className="text-sm text-gray-500">{languages.length} Languages</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search untranslatables..."
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Languages</option>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Untranslatables Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-white rounded-xl shadow-md p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredUntranslatables.map((word) => (
              <div
                key={word.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                      {word.languages.name}
                    </span>
                  </div>
                </div>

                {/* Word Content */}
                <h2 className="text-xl font-bold text-gray-900 mb-2">{word.word}</h2>
                <p className="text-gray-700 mb-3">
                  <span className="font-semibold">Meaning: </span>
                  {word.meaning}
                </p>
                <p className="text-gray-600 italic mb-3">
                  <span className="font-semibold not-italic">Cultural Significance: </span>
                  {word.cultural_significance}
                </p>

                {/* Example */}
                {word.examples && (
                  <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Example: </span>
                      {word.examples}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUntranslatables;
