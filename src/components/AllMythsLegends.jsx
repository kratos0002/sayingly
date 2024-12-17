import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { FaList, FaGlobe, FaRandom } from "react-icons/fa";

const AllMythsLegends = () => {
  const [myths, setMyths] = useState([]);
  const [filteredMyths, setFilteredMyths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storyContent, setStoryContent] = useState(null);
  const [selectedMyth, setSelectedMyth] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [randomMyth, setRandomMyth] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMythsLegends();
  }, []);

  // Fetch myths and filter relevant languages
  const fetchMythsLegends = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("myths_legends")
        .select(`
          id,
          title,
          synopsis,
          origin_culture,
          language_id,
          story_texts (story_url),
          languages (id, name)
        `);

      if (error) throw error;

      // Map myths and filter unique languages
      const processedMyths = data.map((myth) => ({
        ...myth,
        storyAvailable: myth.story_texts?.length > 0 && myth.story_texts[0].story_url,
      }));

      const uniqueLanguages = [
        ...new Map(processedMyths.map((myth) => [myth.languages.id, myth.languages])).values(),
      ];

      setMyths(processedMyths);
      setFilteredMyths(processedMyths);
      setLanguages(uniqueLanguages); // Set only languages with myths
    } catch (err) {
      console.error("Error fetching myths and legends:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter myths based on search term and selected language
  const handleFilter = () => {
    let updatedMyths = myths;

    if (selectedLanguage !== "all") {
      updatedMyths = updatedMyths.filter((myth) => myth.language_id === selectedLanguage);
    }

    if (searchTerm) {
      updatedMyths = updatedMyths.filter(
        (myth) =>
          myth.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          myth.synopsis.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMyths(updatedMyths);
  };

  useEffect(() => {
    handleFilter();
  }, [selectedLanguage, searchTerm]);

  // Fetch story content
  const fetchStoryContent = (mythId) => {
    const myth = myths.find((m) => m.id === mythId);
    setStoryContent(myth.synopsis || "Story not available.");
    setSelectedMyth(myth.title);
  };

  // Fetch random myth
  const fetchRandomMyth = () => {
    if (myths.length === 0) return;
    const randomIndex = Math.floor(Math.random() * myths.length);
    setRandomMyth(myths[randomIndex]);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4 pb-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">All Myths & Legends</h1>
          <p className="text-gray-600">Explore stories passed down through generations!</p>
        </div>

        {/* Stats and Random Generator */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-lg font-medium">
              <FaList className="text-green-600" />
              <p>Total Myths: <span className="font-bold">{filteredMyths.length}</span></p>
            </div>
            <div className="flex items-center gap-2 text-lg font-medium">
              <FaGlobe className="text-blue-600" />
              <p>Total Languages: <span className="font-bold">{languages.length}</span></p>
            </div>
          </div>
          <button
            onClick={fetchRandomMyth}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            <FaRandom className="inline mr-2" /> Show Random Myth
          </button>
        </div>

                {/* Why Are Slangs Important */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6 shadow">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Why Are Myths & Legends Important?
          </h2>
          <p className="text-gray-700 leading-relaxed">
          Myths and legends are the stories that shape cultures, carrying their history, beliefs, and values across generations. They inspire imagination, teach moral lessons, and explain the mysteries of the world, fostering a shared sense of identity and connection within societies.
          </p>
        </div>


        {/* Search Bar and Language Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search myths..."
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

        {/* Myths Grid */}
        {loading ? (
          <p className="text-gray-600 text-center">Loading myths and legends...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMyths.map((myth) => (
              <div
                key={myth.id}
                className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition cursor-pointer"
                onClick={() => fetchStoryContent(myth.id)}
              >
                <h2 className="text-xl font-bold text-green-600 mb-2">{myth.title}</h2>
                <p className="text-gray-700 mb-3">{myth.synopsis}</p>
                <p className="text-sm text-gray-500 italic">
                  Origin: {myth.origin_culture}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Story Modal */}
        {storyContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-3xl mx-auto overflow-auto max-h-[80vh]">
              <h2 className="text-2xl font-bold mb-4 text-green-600">{selectedMyth}</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{storyContent}</p>
              <button
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => setStoryContent(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Random Myth Modal */}
        {showModal && randomMyth && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-green-600">{randomMyth.title}</h2>
              <p className="text-gray-700 mb-3">{randomMyth.synopsis}</p>
              <p className="text-sm text-gray-500 italic">
                Origin: {randomMyth.origin_culture}
              </p>
              <button
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllMythsLegends;
