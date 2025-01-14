import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FaBookOpen, FaGlobe, FaMapMarkerAlt, FaList, FaRandom } from 'react-icons/fa';
import ContentCard from './common/ContentCard';

const AllProverbs = () => {
  const navigate = useNavigate();
  const [proverbs, setProverbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [languages, setLanguages] = useState([]);
  const [randomProverb, setRandomProverb] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProverbs();
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    const { data, error } = await supabase.from('languages').select('*').order('name');
    if (!error) setLanguages(data);
  };

  const fetchProverbs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('proverbs')
      .select(`
        *,
        languages (
          name,
          code
        )
      `)
      .order('created_at', { ascending: false });

    if (!error) setProverbs(data);
    setLoading(false);
  };

  const fetchRandomProverb = () => {
    if (proverbs.length === 0) return;
    const randomIndex = Math.floor(Math.random() * proverbs.length);
    setRandomProverb(proverbs[randomIndex]);
    setShowModal(true);
  };

  const filteredProverbs = proverbs.filter(
    (proverb) =>
      (selectedLanguage === 'all' || proverb.languages.code === selectedLanguage) &&
      (proverb.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proverb.literal_translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proverb.meaning.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 pb-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-block text-amber-600 hover:text-amber-700 mt-4 mb-6"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">Traditional Proverbs</h1>
          <p className="text-gray-600">Wisdom passed down through generations</p>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-lg font-medium">
            <FaList className="text-amber-600" />
            <p>Total Proverbs: <span className="font-bold">{proverbs.length}</span></p>
          </div>
          <div className="flex items-center gap-2 text-lg font-medium">
            <FaGlobe className="text-green-600" />
            <p>Total Languages: <span className="font-bold">{languages.length}</span></p>
          </div>
          <button
            onClick={fetchRandomProverb}
            className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition"
          >
            <FaRandom className="inline mr-2" /> Show Random Proverb
          </button>
        </div>

        {/* Modal Popup */}
        {showModal && randomProverb && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
              <button
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-amber-600 mb-2">{randomProverb.text}</h2>
              <p className="text-gray-700 italic mb-2">
                Literal Translation: {randomProverb.literal_translation}
              </p>
              <p className="text-gray-800 mb-2">
                <span className="font-semibold">Meaning:</span> {randomProverb.meaning}
              </p>
              {randomProverb.pronunciation && (
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Pronunciation:</span> {randomProverb.pronunciation}
                </p>
              )}
              {randomProverb.cultural_context && (
                <p className="text-gray-600">
                  <span className="font-semibold">Cultural Context:</span> {randomProverb.cultural_context}
                </p>
              )}
              <div className="flex justify-between text-sm text-gray-500 mt-4">
                <span>
                  <FaGlobe className="inline mr-1" /> {randomProverb.languages.name}
                </span>
              </div>
            </div>
          </div>
        )}

<div className="bg-blue-50 rounded-lg p-4 mb-6 shadow">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Why Are Proverbs Important?</h2>
          <p className="text-gray-700 leading-relaxed">
          Proverbs carry the timeless wisdom of cultures, offering insights into shared values, morals, and life lessons. They serve as a bridge between generations, preserving traditions while teaching universal truths in concise and memorable ways.
          </p>
        </div>

        {/* Filters */}
        <div className="sticky top-0 z-10 bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search proverbs..."
            className="w-full md:w-2/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400"
          >
            <option value="all">All Languages</option>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Proverbs Grid */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProverbs.map((proverb) => (
              <ContentCard
                key={proverb.id}
                content={{
                  id: proverb.id,
                  original: proverb.text,
                  english_translation: proverb.literal_translation,
                  pronunciation: proverb.pronunciation,
                  example: proverb.meaning,
                  usage_context: proverb.cultural_context,
                  language: {
                    name: proverb.languages.name,
                    code: proverb.languages.code
                  },
                  type: 'proverb'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProverbs;
