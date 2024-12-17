import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const SlangExpressions = () => {
  const [slangList, setSlangList] = useState([]);
  const [filteredSlangList, setFilteredSlangList] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLanguages();
    fetchSlangs();
  }, []);

  const fetchLanguages = async () => {
    const { data, error } = await supabase.from('languages').select('*').order('name');
    if (!error) setLanguages(data);
  };

  const fetchSlangs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('slang_expressions')
        .select(`
          *,
          languages!inner(name, code)
        `);

      if (error) throw error;

      setSlangList(data);
      setFilteredSlangList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter based on search term and selected language
  useEffect(() => {
    let filtered = slangList;

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter((slang) => slang.languages.code === selectedLanguage);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (slang) =>
          slang.expression.toLowerCase().includes(searchTerm.toLowerCase()) ||
          slang.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
          slang.context?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSlangList(filtered);
  }, [searchTerm, selectedLanguage, slangList]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <Link to="/" className="inline-block text-blue-500 hover:text-blue-700 mb-4">
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">Slang & Colloquialisms</h1>
          <p className="text-gray-600">Discover modern and regional slang expressions</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search slangs..."
            className="w-full md:w-2/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Languages</option>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Slangs List */}
        {loading ? (
          <div className="text-center text-gray-500">Loading slangs...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : filteredSlangList.length === 0 ? (
          <div className="text-center text-gray-500">No slang expressions found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSlangList.map((slang) => (
              <div
                key={slang.id}
                className="bg-white rounded-lg shadow hover:shadow-lg p-4 flex flex-col justify-between transition-transform transform hover:-translate-y-1"
              >
                {/* Slang Term */}
                <h2 className="text-xl font-bold text-blue-600 mb-1">{slang.expression}</h2>
                <p className="text-gray-700 mb-3 italic">{slang.literal_translation}</p>

                {/* Meaning */}
                <p className="text-gray-800 mb-2">
                  <span className="font-semibold">Meaning: </span>
                  {slang.meaning}
                </p>

                {/* Context */}
                {slang.context && (
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-semibold">Context: </span>
                    {slang.context}
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{slang.languages.name}</span>
                  {slang.region && <span>{slang.region}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlangExpressions;
