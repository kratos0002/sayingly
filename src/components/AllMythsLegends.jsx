import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const AllMythsLegends = () => {
  const [myths, setMyths] = useState([]);
  const [filteredMyths, setFilteredMyths] = useState([]); // Filtered myths
  const [loading, setLoading] = useState(true);
  const [storyContent, setStoryContent] = useState(null);
  const [selectedMyth, setSelectedMyth] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMythsLegends();
    fetchLanguages();
  }, []);

  // Fetch myths and legends with story availability
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
          story_texts (story_url)
        `);

      if (error) throw error;

      const processedMyths = data.map((myth) => ({
        ...myth,
        storyAvailable: myth.story_texts?.length > 0 && myth.story_texts[0].story_url,
      }));

      setMyths(processedMyths);
      setFilteredMyths(processedMyths); // Initialize filtered myths
    } catch (err) {
      console.error("Error fetching myths and legends:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch list of languages for the dropdown filter
  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase.from("languages").select("id, name");
      if (error) throw error;
      setLanguages(data);
    } catch (err) {
      console.error("Error fetching languages:", err.message);
    }
  };

  // Filter myths based on selected language
  const handleLanguageFilter = (e) => {
    const selected = e.target.value;
    setSelectedLanguage(selected);
    if (selected === "all") {
      setFilteredMyths(myths);
    } else {
      setFilteredMyths(myths.filter((myth) => myth.language_id === selected));
    }
  };

  // Fetch and display story content
  const fetchStoryContent = async (mythId) => {
    try {
      const { data: storyData, error } = await supabase
        .from("story_texts")
        .select("story_url")
        .eq("myth_id", mythId)
        .limit(1);

      if (error) throw error;
      if (!storyData.length) throw new Error("No story found for this myth.");

      const response = await fetch(storyData[0].story_url);
      const content = await response.text();

      setStoryContent(content);
      setSelectedMyth(myths.find((myth) => myth.id === mythId)?.title || "Myth Story");
    } catch (err) {
      console.error("Error fetching story content:", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900">All Myths & Legends</h1>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <select
            value={selectedLanguage}
            onChange={handleLanguageFilter}
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Languages</option>
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {loading ? (
          <p className="text-gray-600">Loading myths and legends...</p>
        ) : (
          <>
            {/* Myths Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMyths.map((myth) => (
                <div
                  key={myth.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() =>
                    myth.storyAvailable && fetchStoryContent(myth.id)
                  }
                >
                  <h2 className="text-xl font-bold mb-2">{myth.title}</h2>
                  <p className="text-gray-600 mb-3">{myth.synopsis}</p>
                  <p className="text-sm text-gray-500 italic">
                    Origin: {myth.origin_culture}
                  </p>
                  <p
                    className={`mt-3 font-medium ${
                      myth.storyAvailable ? "text-blue-500" : "text-gray-400"
                    }`}
                  >
                    {myth.storyAvailable
                      ? "Click to read story"
                      : "Story not available"}
                  </p>
                </div>
              ))}
            </div>

            {/* Story Content Modal */}
            {storyContent && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg max-w-3xl mx-auto overflow-auto max-h-[80vh]">
                  <h2 className="text-2xl font-bold mb-4">{selectedMyth}</h2>
                  <pre
                    className="whitespace-pre-wrap text-gray-700"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {storyContent}
                  </pre>
                  <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => setStoryContent(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllMythsLegends;
