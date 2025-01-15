import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FaGlobe, FaVolumeUp, FaMapMarkerAlt, FaRandom, FaTimes } from 'react-icons/fa';
import { playTextToSpeech } from '../utils/textToSpeech';
import ContentCard from './common/ContentCard';

const SlangExpressions = () => {
  const [slangList, setSlangList] = useState([]);
  const [filteredSlangList, setFilteredSlangList] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [randomSlang, setRandomSlang] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSlangs();
  }, []);

  const fetchSlangs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('slang_expressions')
        .select(`
          *,
          languages!inner(
            name,
            code
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const uniqueLanguages = [
        ...new Map(data.map((slang) => [slang.languages.code, slang.languages])).values(),
      ];

      setSlangList(data);
      setAvailableLanguages(uniqueLanguages);
      setFilteredSlangList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = slangList;

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter((slang) => slang.languages.code === selectedLanguage);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (slang) =>
          slang.expression.toLowerCase().includes(searchTerm.toLowerCase()) ||
          slang.meaning.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSlangList(filtered);
  }, [searchTerm, selectedLanguage, slangList]);

  const fetchRandomSlang = () => {
    if (slangList.length === 0) return;
    const randomIndex = Math.floor(Math.random() * slangList.length);
    setRandomSlang(slangList[randomIndex]);
    setShowModal(true);
  };

  const handlePlayAudio = (text) => {
    playTextToSpeech(text, 'en_us_male1', 'YOUR_UNREAL_API_KEY');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 pb-8">
        {/* Back Button */}
        <Link to="/" className="inline-block text-blue-500 hover:text-blue-700 mt-4 mb-6">
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">Slang & Colloquialisms</h1>
          <p className="text-gray-600">Discover modern and regional slang expressions</p>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-lg font-medium">
            <FaRandom className="text-blue-600" />
            <p>Total Slangs: <span className="font-bold">{slangList.length}</span></p>
          </div>
          <div className="flex items-center gap-2 text-lg font-medium">
            <FaGlobe className="text-green-600" />
            <p>Total Languages: <span className="font-bold">{availableLanguages.length}</span></p>
          </div>
          <button
            onClick={fetchRandomSlang}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Show Random Slang
          </button>
        </div>

        {/* Modal Popup */}
        {showModal && randomSlang && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
              <button
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
                onClick={() => setShowModal(false)}
              >
                <FaTimes size={20} />
              </button>
              <h2 className="text-2xl font-bold text-blue-600 mb-2">{randomSlang.expression}</h2>
              <p className="text-gray-700 italic mb-2">{randomSlang.literal_translation}</p>
              <button
                onClick={() => handlePlayAudio(randomSlang.expression)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-2"
              >
                <FaVolumeUp /> Hear Pronunciation
              </button>
              <p className="text-gray-800 mb-2">
                <span className="font-semibold">Meaning:</span> {randomSlang.meaning}
              </p>
              {randomSlang.context && (
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Context:</span> {randomSlang.context}
                </p>
              )}
              <div className="flex justify-between text-sm text-gray-500 mt-4">
                <span><FaGlobe className="inline mr-1" /> {randomSlang.languages.name}</span>
                {randomSlang.region && (
                  <span><FaMapMarkerAlt className="inline mr-1" /> {randomSlang.region}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Why Are Slangs Important */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 shadow">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Why Are Slangs Important?</h2>
          <p className="text-gray-700 leading-relaxed">
            Slangs reflect the soul of a culture, capturing its wit, humor, and identity. 
            They make communication vibrant, relatable, and fun while preserving cultural nuances 
            and fostering connections across generations and regions.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="sticky top-0 z-10 bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4">
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
            {availableLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Slang Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredSlangList.map((slang) => (
            <ContentCard
              key={slang.id}
              content={{
                id: slang.id,
                original: slang.expression,
                english_translation: slang.literal_translation,
                example: slang.meaning,
                usage_context: slang.context || slang.region || '',
                pronunciation: '',
                language: slang.languages,
                type: 'slang_expression',
                language_id: slang.language_id
              }}
            />
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center mt-6 text-blue-600">
            <p>Loading slangs...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center mt-6 text-red-600">
            <p>Error: {error}</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredSlangList.length === 0 && (
          <div className="text-center text-gray-500 mt-4 bg-blue-50 p-4 rounded-lg">
            No slang expressions found. Try a different search or language filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default SlangExpressions;