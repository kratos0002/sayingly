import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FaBookOpen, FaMapMarkerAlt, FaList, FaRandom } from 'react-icons/fa';
import ContentCard from './common/ContentCard';

const AllIdioms = () => {
  const navigate = useNavigate();
  const [idioms, setIdioms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [languages, setLanguages] = useState([]);
  const [randomIdiom, setRandomIdiom] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const fetchRandomIdiom = () => {
    if (idioms.length === 0) return;
    const randomIndex = Math.floor(Math.random() * idioms.length);
    setRandomIdiom(idioms[randomIndex]);
    setShowModal(true);
  };

  const filteredIdioms = idioms.filter(
    (idiom) =>
      (selectedLanguage === 'all' || idiom.languages.code === selectedLanguage) &&
      (idiom.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idiom.english_translation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 pb-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-block text-blue-500 hover:text-blue-700 mt-4 mb-6"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">All Idioms</h1>
          <p className="text-gray-600">Explore a variety of idioms and their meanings</p>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-lg font-medium">
            <FaList className="text-blue-600" />
            <p>Total Idioms: <span className="font-bold">{idioms.length}</span></p>
          </div>
          <div className="flex items-center gap-2 text-lg font-medium">
            <FaGlobe className="text-green-600" />
            <p>Total Languages: <span className="font-bold">{languages.length}</span></p>
          </div>
          <button
            onClick={fetchRandomIdiom}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            <FaRandom className="inline mr-2" /> Show Random Idiom
          </button>
        </div>

        {/* Modal Popup */}
        {showModal && randomIdiom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
              <button
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-blue-600 mb-2">{randomIdiom.original}</h2>
              <p className="text-gray-700 italic mb-2">
                Translation: {randomIdiom.english_translation}
              </p>
              {randomIdiom.pronunciation && (
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Pronunciation:</span> {randomIdiom.pronunciation}
                </p>
              )}
              {randomIdiom.example && (
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Example:</span> {randomIdiom.example}
                </p>
              )}
              {randomIdiom.usage_context && (
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Usage Context:</span> {randomIdiom.usage_context}
                </p>
              )}
              <div className="flex justify-between text-sm text-gray-500 mt-4">
                <span>
                  <FaGlobe className="inline mr-1" /> {randomIdiom.languages.name}
                </span>
              </div>
            </div>
          </div>
        )}

                {/* Why Are Slangs Important */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6 shadow">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Why Are Idioms Important?</h2>
          <p className="text-gray-700 leading-relaxed">
          Idioms bring language to life by adding color, creativity, and cultural context to everyday communication. They reflect the history, values, and humor of a culture, helping us understand deeper meanings while connecting ideas in a vivid and memorable way.
          </p>
        </div>

        {/* Filters */}
        <div className="sticky top-0 z-10 bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search idioms..."
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

        {/* Idioms Grid */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdioms.map((idiom) => (
              <ContentCard
                key={idiom.id}
                content={{
                  original: idiom.original,
                  english_translation: idiom.english_translation,
                  pronunciation: idiom.pronunciation,
                  example: idiom.example,
                  usage_context: idiom.usage_context,
                  language: {
                    name: idiom.languages.name,
                    code: idiom.languages.code
                  },
                  type: 'idiom'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllIdioms;
