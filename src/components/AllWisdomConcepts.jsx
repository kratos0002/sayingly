import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AllWisdomConcepts = () => {
  const [wisdomConcepts, setWisdomConcepts] = useState([]); // All wisdom concepts
  const [languages, setLanguages] = useState([]); // Available languages
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Search input
  const [selectedLanguage, setSelectedLanguage] = useState("all"); // Selected language filter

  useEffect(() => {
    fetchWisdomConcepts();
    fetchLanguages();
  }, []);

  // Fetch Languages
  const fetchLanguages = async () => {
    const { data, error } = await supabase.from("languages").select("id, name, code");
    if (!error) setLanguages(data || []);
  };

  // Fetch Wisdom Concepts
  const fetchWisdomConcepts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("wisdom_concepts")
      .select(`*, languages (id, name, code)`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wisdom concepts:", error);
    } else {
      setWisdomConcepts(data || []);
    }
    setLoading(false);
  };

  // Apply Search and Language Filters
  const filteredWisdomConcepts = wisdomConcepts.filter((concept) => {
    const matchesLanguage =
      selectedLanguage === "all" || concept.language_id === selectedLanguage;
    const matchesSearchTerm =
      concept.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concept.literal_translation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concept.brief_definition?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesLanguage && matchesSearchTerm;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Title */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">All Wisdom Concepts</h1>
          <p className="text-gray-600">{filteredWisdomConcepts.length} profound insights</p>
        </div>

        {/* Search and Language Filter */}
        <div className="flex gap-4 mb-8">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search wisdom concepts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-500"
          />

          {/* Language Dropdown */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-500"
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
        ) : filteredWisdomConcepts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWisdomConcepts.map((concept) => (
              <div
                key={concept.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">{concept.term}</h3>
                <p className="text-gray-600 mb-2">
                  <strong>Translation:</strong> {concept.literal_translation || "N/A"}
                </p>
                <p className="text-gray-500 text-sm">
                  {concept.brief_definition || "No definition provided"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No wisdom concepts found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
};

export default AllWisdomConcepts;
