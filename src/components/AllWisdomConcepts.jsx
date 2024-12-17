import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { FaList, FaRandom, FaGlobe } from "react-icons/fa";

const AllWisdomConcepts = () => {
  const [wisdomConcepts, setWisdomConcepts] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [revealedExplanations, setRevealedExplanations] = useState({});
  const [randomConcept, setRandomConcept] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchWisdomConcepts();
    fetchLanguages();
  }, []);

  // Fetch Wisdom Concepts
  const fetchWisdomConcepts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("wisdom_concepts")
      .select(`*, languages (id, name, code)`)
      .order("created_at", { ascending: false });

    if (!error) setWisdomConcepts(data || []);
    setLoading(false);
  };

  // Fetch Languages
  const fetchLanguages = async () => {
    const { data, error } = await supabase.from("languages").select("id, name, code");
    if (!error) setLanguages(data || []);
  };

  // Toggle Detailed Explanation
  const toggleExplanation = (id) => {
    setRevealedExplanations((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch Random Wisdom Concept
  const fetchRandomConcept = () => {
    if (wisdomConcepts.length === 0) return;
    const randomIndex = Math.floor(Math.random() * wisdomConcepts.length);
    setRandomConcept(wisdomConcepts[randomIndex]);
    setShowModal(true);
  };

  // Apply Filters
  const filteredWisdomConcepts = wisdomConcepts.filter((concept) => {
    const matchesLanguage = selectedLanguage === "all" || concept.language_id === selectedLanguage;
    const matchesSearchTerm =
      concept.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concept.literal_translation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concept.brief_definition?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesLanguage && matchesSearchTerm;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4 pb-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">All Wisdom Concepts</h1>
          <p className="text-gray-600">Explore profound insights and timeless wisdom!</p>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-lg font-medium">
            <FaList className="text-yellow-600" />
            <p>Total Concepts: <span className="font-bold">{wisdomConcepts.length}</span></p>
          </div>
          <div className="flex items-center gap-2 text-lg font-medium">
            <FaGlobe className="text-blue-600" />
            <p>Total Languages: <span className="font-bold">{languages.length}</span></p>
          </div>
          <button
            onClick={fetchRandomConcept}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
          >
            <FaRandom className="inline mr-2" /> Show Random Concept
          </button>
        </div>

        {/* Random Wisdom Concept Modal */}
        {showModal && randomConcept && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
              <button
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-yellow-600 mb-2">{randomConcept.term}</h2>
              <p className="text-gray-700 mb-2">
              <span className="font-semibold">Pronunciation:</span> {randomConcept.pronunciation || "N/A"}
                <span className="font-semibold"> Translation:</span> {randomConcept.literal_translation || "N/A"}
              </p>
              <p className="text-gray-500">
                <span className="font-semibold">Explanation:</span> {randomConcept.detailed_explanation || "No explanation provided"}
              </p>
            </div>
          </div>
        )}

                {/* Why Are Slangs Important */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6 shadow">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Why Are Wisdom Concepts Important?
          </h2>
          <p className="text-gray-700 leading-relaxed">
          Wisdom concepts encapsulate the profound ideas, values, and philosophies of a culture. They offer timeless insights into human nature, ethics, and the meaning of life, fostering deeper understanding, reflection, and connection across generations and societies.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search wisdom concepts..."
            className="w-full md:w-2/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
          >
            <option value="all">All Languages</option>
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Wisdom Concepts Grid */}
        {loading ? (
          <p className="text-center text-gray-500">Loading wisdom concepts...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWisdomConcepts.map((concept) => (
              <div key={concept.id} className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition">
                <h3 className="text-xl font-bold text-yellow-600 mb-2">{concept.term}</h3>
                {concept.pronunciation && (
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Pronunciation:</span> {concept.pronunciation}
                  </p>
                )}
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Translation:</span> {concept.literal_translation || "N/A"}
                </p>
                <button
                  onClick={() => toggleExplanation(concept.id)}
                  className="text-yellow-600 font-medium hover:underline"
                >
                  {revealedExplanations[concept.id] ? "Hide Explanation" : "Show Explanation"}
                </button>
                {revealedExplanations[concept.id] && (
                  <p className="text-gray-500 mt-2">
                    <span className="font-semibold">Explanation:</span> {concept.detailed_explanation || "No explanation provided"}
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

export default AllWisdomConcepts;
