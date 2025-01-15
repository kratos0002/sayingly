import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ContentCard from './common/ContentCard';
import { FaList, FaGlobe, FaRandom, FaLanguage } from 'react-icons/fa';

const AllSlangs = () => {
  const navigate = useNavigate();
  const [slangs, setSlangs] = useState([]);
  const [filteredSlangs, setFilteredSlangs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [languages, setLanguages] = useState([]);
  const [randomSlang, setRandomSlang] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await fetchSlangs();
      await fetchLanguages();
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = slangs.filter(
      (slang) =>
        (selectedLanguage === 'all' || slang.languages?.code === selectedLanguage) &&
        (slang.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
         slang.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
         slang.example?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         slang.region?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSlangs(filtered);
  }, [slangs, selectedLanguage, searchTerm]);

  const fetchSlangs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('slangs')
      .select(`
        *,
        languages (
          name,
          code
        )
      `)
      .order('created_at', { ascending: false });

    if (!error) setSlangs(data);
    setLoading(false);
  };

  const fetchLanguages = async () => {
    const { data, error } = await supabase.from('languages').select('*').order('name');
    if (!error) setLanguages(data);
  };

  const fetchRandomSlang = () => {
    if (slangs.length === 0) return;
    const randomIndex = Math.floor(Math.random() * slangs.length);
    setRandomSlang(slangs[randomIndex]);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="inline-block text-blue-600 hover:text-blue-700 mb-6"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center justify-center gap-2">
            <FaLanguage className="text-blue-600" />
            Slang Expressions
          </h1>
          <p className="text-gray-600">
            Discover and learn about unique slang terms across the world!
          </p>
        </div>

        {/* Stats and Random Generator */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-lg font-medium">
            <FaList className="text-blue-600" />
            <p>Total Slangs: <span className="font-bold">{slangs.length}</span></p>
          </div>
          <div className="flex items-center gap-2 text-lg font-medium">
            <FaGlobe className="text-green-600" />
            <p>Total Languages: <span className="font-bold">{languages.length}</span></p>
          </div>
          <button
            onClick={fetchRandomSlang}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
            <FaRandom className="inline mr-2" /> Show Random Slang
          </button>
        </div>

        {/* Why Are Slangs Important */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 shadow">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Why Are Slangs Important?</h2>
          <p className="text-gray-700 leading-relaxed">
             Slang expressions are the vibrant, ever-changing pulse of language. They reveal the creativity, humor, and cultural nuances of communication, offering a unique window into how people truly speak and connect in different communities.
          </p>
        </div>

        {/* Search Bar and Language Filter */}
        <div className="sticky top-0 z-10 bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search slang terms..."
            className="w-full md:w-2/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
          >
            <option value="all">All Languages</option>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Slang Cards */}
        {loading ? (
          <div className="text-center text-gray-600">Loading slang terms...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredSlangs.map((slang) => (
              <ContentCard
                key={slang.id}
                content={{
                  id: slang.id,
                  original: slang.text, 
                  english_translation: slang.meaning || '',
                  pronunciation: slang.pronunciation || '',
                  example: slang.example || '',
                  usage_context: slang.region 
                    ? `Region: ${slang.region}` 
                    : 'No specific region',
                  language: {
                    name: slang.languages?.name || 'Multilingual',
                    code: slang.languages?.code || 'multi'
                  },
                  type: 'slang'
                }}
                expanded={false}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredSlangs.length === 0 && (
          <div className="text-center text-gray-500 mt-4 bg-blue-50 p-4 rounded-lg">
            No slang terms found. Try a different search or language filter.
          </div>
        )}
      </div>

      {/* Random Slang Modal */}
      {showModal && randomSlang && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-blue-600 mb-2">{randomSlang.text}</h2>
            <p className="text-gray-700 italic mb-2">
              Translation: {randomSlang.meaning}
            </p>
            {randomSlang.pronunciation && (
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Pronunciation:</span> {randomSlang.pronunciation}
              </p>
            )}
            {randomSlang.example && (
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Example:</span> {randomSlang.example}
              </p>
            )}
            {randomSlang.region && (
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Usage Context:</span> Region: {randomSlang.region}
              </p>
            )}
            <div className="flex justify-between text-sm text-gray-500 mt-4">
              <span>
                <FaGlobe className="inline mr-1" /> {randomSlang.languages?.name || 'Multilingual'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllSlangs;