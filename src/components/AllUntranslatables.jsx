import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FaGlobe, FaLanguage, FaList, FaRandom } from 'react-icons/fa';

const AllUntranslatables = () => {
  const navigate = useNavigate();
  const [untranslatables, setUntranslatables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [languages, setLanguages] = useState([]);
  const [randomWord, setRandomWord] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUntranslatables();
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    const { data, error } = await supabase.from('languages').select('*').order('name');
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

  const fetchRandomWord = () => {
    if (untranslatables.length === 0) return;
    const randomIndex = Math.floor(Math.random() * untranslatables.length);
    setRandomWord(untranslatables[randomIndex]);
    setShowModal(true);
  };

  const filteredUntranslatables = untranslatables.filter(
    (word) =>
      (selectedLanguage === 'all' || word.languages?.code === selectedLanguage) &&
      (word.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.meaning?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.context?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.example?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 pb-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-block text-blue-600 hover:text-blue-700 mt-4 mb-6"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center justify-center gap-2">
            <FaLanguage className="text-blue-600" />
            Untranslatable Words
          </h1>
          <p className="text-gray-600">
            Unique words and expressions that defy translation. Dive into the beauty of language and culture!
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-lg font-medium">
            <FaList className="text-blue-600" />
            <p>Total Words: <span className="font-bold">{untranslatables.length}</span></p>
          </div>
          <div className="flex items-center gap-2 text-lg font-medium">
            <FaGlobe className="text-green-600" />
            <p>Total Languages: <span className="font-bold">{languages.length}</span></p>
          </div>
          <button
            onClick={fetchRandomWord}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            <FaRandom className="inline mr-2" /> Show Random Word
          </button>
        </div>

        {/* Modal Popup */}
        {showModal && randomWord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
              <button
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-blue-600 mb-2">{randomWord.word}</h2>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Meaning:</span> {randomWord.meaning}
              </p>
              {randomWord.cultural_significance && (
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Cultural Significance:</span> {randomWord.cultural_significance}
                </p>
              )}
              {randomWord.examples && (
                <p className="text-gray-600">
                  <span className="font-semibold">Example:</span> {randomWord.examples}
                </p>
              )}
              <div className="flex justify-between text-sm text-gray-500 mt-4">
                <span>
                  <FaGlobe className="inline mr-1" /> {randomWord.languages?.name}
                </span>
              </div>
            </div>
          </div>
        )}

                {/* Why Are Untranslatable Words Important?*/}
                <div className="bg-blue-50 rounded-lg p-4 mb-6 shadow">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Why Are Untranslatable Words Important?</h2>
          <p className="text-gray-700 leading-relaxed">
          Untranslatable words capture the essence of emotions, experiences, and concepts that have no direct equivalent in other languages. They offer a glimpse into the unique perspectives of different cultures, enriching our understanding of the human experience and the beauty of linguistic diversity.
          </p>
        </div>

        {/* Filters */}
        <div className="sticky top-0 z-10 bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search untranslatables..."
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

        {/* Untranslatables Grid */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUntranslatables.map((word) => (
              <div key={word.id} className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-transform transform hover:-translate-y-1">
                <h2 className="text-xl font-bold text-blue-600 mb-2">{word.word}</h2>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Meaning:</span> {word.meaning}
                </p>
                {word.cultural_significance && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Cultural Significance:</span> {word.cultural_significance}
                  </p>
                )}
                {word.examples && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Example:</span> {word.examples}
                  </p>
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
