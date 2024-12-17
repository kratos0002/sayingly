import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AllSlangs = () => {
  const navigate = useNavigate();
  const [slangs, setSlangs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSlangs();
  }, []);

  const fetchSlangs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('slangs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setSlangs(data);
    setLoading(false);
  };

  const filteredSlangs = slangs.filter(
    (slang) =>
      slang.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slang.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Explore Slangs</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Discover and learn about unique slang terms across the world!
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search slang terms..."
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Slang Cards */}
        {loading ? (
          <div className="text-center text-gray-600">Loading slangs...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSlangs.map((slang) => (
              <div
                key={slang.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-4 flex flex-col justify-between cursor-pointer"
                onClick={() => navigate(`/slang/${slang.id}`)}
              >
                <div>
                  {/* Slang Term */}
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                    {slang.text}
                  </h2>
                  {/* Meaning */}
                  <p className="text-gray-700 text-sm mb-3">
                    <span className="font-semibold">Meaning:</span> {slang.meaning}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-gray-500 text-xs">
                  {slang.region && (
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      {slang.region}
                    </span>
                  )}
                  <span className="italic">{slang.created_at.split('T')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredSlangs.length === 0 && (
          <div className="text-center text-gray-500 mt-4">No slang terms found.</div>
        )}
      </div>
    </div>
  );
};

export default AllSlangs;
