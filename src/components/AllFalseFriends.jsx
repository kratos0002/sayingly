import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const AllFalseFriends = () => {
  const [falseFriends, setFalseFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [languages, setLanguages] = useState([]);
  const navigate = useNavigate();

  // Fetch false friends and languages on component load
  useEffect(() => {
    fetchFalseFriends();
    fetchLanguages();
  }, []);

  // Fetch all false friends
  const fetchFalseFriends = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("false_friends")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setFalseFriends(data);
    setLoading(false);
  };

  // Fetch all unique languages for filtering
  const fetchLanguages = async () => {
    const { data, error } = await supabase
      .from("false_friends")
      .select("language_1, language_2");
    if (!error) {
      const uniqueLanguages = new Set();
      data.forEach((row) => {
        uniqueLanguages.add(row.language_1);
        uniqueLanguages.add(row.language_2);
      });
      setLanguages([...uniqueLanguages]);
    }
  };

  // Filtered list based on search term and language filter
  const filteredFalseFriends = falseFriends.filter((item) =>
    (selectedLanguage === "all" ||
      item.language_1 === selectedLanguage ||
      item.language_2 === selectedLanguage) &&
    (item.word_1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.word_2.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">All False Friends</h1>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:underline"
          >
            Back to Home
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Search for words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-500"
          />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-500"
          >
            <option value="all">All Languages</option>
            {languages.map((lang, index) => (
              <option key={index} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-gray-600">Loading false friends...</p>
        ) : filteredFalseFriends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFalseFriends.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {item.word_1} ({item.language_1}) &mdash;{" "}
                  {item.word_2} ({item.language_2})
                </h2>
                <p className="text-gray-600 mb-2">
                  <strong>False Meaning:</strong> {item.false_meaning}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Actual Meaning:</strong> {item.actual_meaning}
                </p>
                {item.cultural_note && (
                  <p className="text-sm text-gray-500 italic mb-2">
                    {item.cultural_note}
                  </p>
                )}
                {item.example_sentence && (
                  <p className="text-sm text-gray-700">
                    <strong>Example:</strong> {item.example_sentence}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            No false friends found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
};

export default AllFalseFriends;
