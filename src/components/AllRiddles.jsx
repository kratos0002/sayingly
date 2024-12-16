import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AllRiddles = () => {
  const [riddles, setRiddles] = useState([]); // All riddles
  const [languages, setLanguages] = useState([]); // Available languages
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Search input
  const [selectedLanguage, setSelectedLanguage] = useState("all"); // Selected language filter

  // Fetch all riddles and languages on page load
  useEffect(() => {
    fetchRiddles();
    fetchLanguages();
  }, []);

  // Fetch Riddles
  const fetchRiddles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("riddles")
      .select(`*, languages (id, name, code)`)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching riddles:", error);
    } else {
      setRiddles(data || []);
    }
    setLoading(false);
  };

  // Fetch Languages
  const fetchLanguages = async () => {
    const { data, error } = await supabase.from("languages").select("id, name, code");
    if (error) {
      console.error("Error fetching languages:", error);
    } else {
      setLanguages(data || []);
    }
  };

  // Apply search and language filters
  const filteredRiddles = riddles.filter((riddle) => {
    const matchesLanguage =
      selectedLanguage === "all" || riddle.language_id === selectedLanguage;
    const matchesSearchTerm =
      riddle.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
      riddle.english_translation?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLanguage && matchesSearchTerm;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Title */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">All Riddles</h1>
          <p className="text-gray-600">{filteredRiddles.length} puzzling riddles</p>
        </div>

        {/* Search and Language Filter */}
        <div className="flex gap-4 mb-8">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search riddles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500"
          />

          {/* Language Dropdown */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500"
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
        ) : filteredRiddles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRiddles.map((riddle) => (
              <div
                key={riddle.id}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                  {riddle.original}
                </h3>
                <p className="text-gray-600 text-sm mb-2 truncate">
                  {riddle.english_translation || "No translation"}
                </p>
                <p className="text-green-500 text-sm font-medium">
                  Answer: {riddle.answer_translation || "Not provided"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No riddles found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default AllRiddles;
