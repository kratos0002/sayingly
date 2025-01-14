import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { FaList, FaRandom, FaGlobe } from "react-icons/fa";
import ContentCard from './common/ContentCard';

const AllRiddles = () => {
  const [riddles, setRiddles] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [randomRiddle, setRandomRiddle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRiddles();
    fetchLanguages();
  }, []);

  const fetchRiddles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("riddles")
      .select(`*, languages (id, name, code)`)
      .order("id", { ascending: true });

    if (!error) setRiddles(data || []);
    setLoading(false);
  };

  const fetchLanguages = async () => {
    const { data, error } = await supabase.from("languages").select("id, name, code");
    if (!error) setLanguages(data || []);
  };
  
  const toggleAnswer = (id) => {
    setRevealedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchRandomRiddle = () => {
    if (riddles.length === 0) return;
    const randomIndex = Math.floor(Math.random() * riddles.length);
    setRandomRiddle(riddles[randomIndex]);
    setShowModal(true);
  };

  const filteredRiddles = riddles.filter((riddle) => {
    const matchesLanguage = selectedLanguage === "all" || riddle.language_id === selectedLanguage;
    const matchesSearchTerm =
      riddle.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
      riddle.english_translation?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLanguage && matchesSearchTerm;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 pb-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">All Riddles</h1>
          <p className="text-gray-600">Discover puzzling riddles from around the world!</p>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-lg font-medium">
            <FaList className="text-green-600" />
            <p>Total Riddles: <span className="font-bold">{riddles.length}</span></p>
          </div>
          <div className="flex items-center gap-2 text-lg font-medium">
            <FaGlobe className="text-blue-600" />
            <p>Total Languages: <span className="font-bold">{languages.length}</span></p>
          </div>
          <button
            onClick={fetchRandomRiddle}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            <FaRandom className="inline mr-2" /> Show Random Riddle
          </button>
        </div>

        {/* Modal Popup for Random Riddle */}
        {showModal && randomRiddle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
              <button
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-green-600 mb-2">{randomRiddle.original}</h2>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Translation:</span> {randomRiddle.english_translation || "No translation"}
              </p>
              <p className="text-gray-800">
                <span className="font-semibold">Answer:</span> {randomRiddle.answer_translation || "Not provided"}
              </p>
            </div>
          </div>
        )}
        {/* Why Are Slangs Important */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 shadow">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Why Are Riddles Important?
          </h2>
          <p className="text-gray-700 leading-relaxed">
          Riddles challenge our minds, encouraging critical thinking, creativity, and problem-solving. They serve as a playful way to pass down wisdom, entertain, and teach cultural values, offering insight into the wit and ingenuity of different societies.
          </p>
        </div>
        

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search riddles..."
            className="w-full md:w-2/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400"
          >
            <option value="all">All Languages</option>
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Riddles Grid */}
        {loading ? (
          <p className="text-center text-gray-500">Loading riddles...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRiddles.map((riddle) => (
              <ContentCard
                key={riddle.id}
                content={{
                  id: riddle.id,
                  original: riddle.original,
                  english_translation: riddle.english_translation || "No translation",
                  pronunciation: riddle.pronunciation,
                  example: "",
                  usage_context: "",
                  language: {
                    name: riddle.languages.name,
                    code: riddle.languages.code
                  },
                  type: 'riddle'
                }}
                customContent={
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => toggleAnswer(riddle.id)}
                      className="w-full py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
                    >
                      {revealedAnswers[riddle.id] ? 'Hide Answer' : 'Show Answer'}
                    </button>
                    {revealedAnswers[riddle.id] && (
                      <div className="mt-4 text-gray-800">
                        <p><span className="font-semibold">Answer:</span> {riddle.answer || "Not provided"}</p>
                        {riddle.answer_translation && (
                          <p className="mt-2"><span className="font-semibold">Answer Translation:</span> {riddle.answer_translation}</p>
                        )}
                      </div>
                    )}
                  </div>
                }
                expanded={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRiddles;