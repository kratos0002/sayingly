import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { FaList, FaGlobe, FaRandom } from "react-icons/fa";

const AllFalseFriends = () => {
  const [falseFriends, setFalseFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [languages, setLanguages] = useState([]);
  const [randomFriend, setRandomFriend] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  // Fetch data on component load
  useEffect(() => {
    fetchFalseFriends();
  }, []);

  // Fetch all false friends and derive unique languages
  const fetchFalseFriends = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("false_friends")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) {
      setFalseFriends(data);

      // Extract unique languages
      const uniqueLanguages = new Set();
      data.forEach((row) => {
        uniqueLanguages.add(row.language_1);
        uniqueLanguages.add(row.language_2);
      });
      setLanguages([...uniqueLanguages]);
    }
    setLoading(false);
  };

  // Filtered list based on search term and language filter
  const filteredFalseFriends = falseFriends.filter((item) =>
    (selectedLanguage === "all" ||
      item.language_1 === selectedLanguage ||
      item.language_2 === selectedLanguage) &&
    (item.word_1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.word_2.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Fetch random false friend
  const fetchRandomFalseFriend = () => {
    if (filteredFalseFriends.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredFalseFriends.length);
    setRandomFriend(filteredFalseFriends[randomIndex]);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4 pb-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">All False Friends</h1>
          <p className="text-gray-600">Explore false friends across languages and their meanings!</p>
        </div>

        {/* Stats and Random Generator */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-lg font-medium">
              <FaList className="text-yellow-600" />
              <p>Total Entries: <span className="font-bold">{filteredFalseFriends.length}</span></p>
            </div>
            <div className="flex items-center gap-2 text-lg font-medium">
              <FaGlobe className="text-blue-600" />
              <p>Total Languages: <span className="font-bold">{languages.length}</span></p>
            </div>
          </div>
          <button
            onClick={fetchRandomFalseFriend}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
          >
            <FaRandom className="inline mr-2" /> Show Random False Friend
          </button>
        </div>

        {/* Why Are Slangs Important */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 shadow">
          <h2 className="text-lg font-semibold text-yellow-700 mb-2">Why Are False Friends Important?</h2>
          <p className="text-gray-700 leading-relaxed">
          False friends highlight the fascinating quirks of language, where similar words carry different meanings across languages. They remind us of the complexity of cross-cultural communication, helping learners avoid misunderstandings while fostering deeper connections and appreciation for linguistic diversity.
          </p>
        </div>

        {/* Search Bar and Language Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search for words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-2/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
          />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
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
          <p className="text-gray-600 text-center">Loading false friends...</p>
        ) : filteredFalseFriends.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFalseFriends.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-2">
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

        {/* Random False Friend Modal */}
        {showModal && randomFriend && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-yellow-600">
                {randomFriend.word_1} ({randomFriend.language_1}) &mdash;{" "}
                {randomFriend.word_2} ({randomFriend.language_2})
              </h2>
              <p className="text-gray-600 mb-2">
                <strong>False Meaning:</strong> {randomFriend.false_meaning}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Actual Meaning:</strong> {randomFriend.actual_meaning}
              </p>
              {randomFriend.cultural_note && (
                <p className="text-sm text-gray-500 italic mb-2">
                  {randomFriend.cultural_note}
                </p>
              )}
              <button
                className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
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

export default AllFalseFriends;
