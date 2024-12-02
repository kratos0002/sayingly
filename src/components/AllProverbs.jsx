// pages/AllProverbs.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AllProverbs = () => {
  const navigate = useNavigate();
  const [proverbs, setProverbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [languages, setLanguages] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    fetchProverbs();
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('name');
    if (!error) setLanguages(data);
  };

  const fetchProverbs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('proverbs')
      .select(`
        *,
        languages (
          name,
          code
        )
      `)
      .order('created_at', { ascending: false });

    if (!error) setProverbs(data);
    setLoading(false);
  };

  // Get unique historical periods for filter
  const historicalPeriods = [...new Set(proverbs.map(p => p.historical_period).filter(Boolean))];

  const filteredProverbs = proverbs.filter(proverb => 
    (selectedLanguage === 'all' || proverb.languages.code === selectedLanguage) &&
    (selectedPeriod === 'all' || proverb.historical_period === selectedPeriod) &&
    (proverb.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
     proverb.literal_translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
     proverb.meaning.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Traditional Proverbs</h1>
            <p className="text-gray-600 mt-2">Wisdom passed down through generations</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium text-gray-900">{filteredProverbs.length} Proverbs</p>
            <p className="text-sm text-gray-500">{languages.length} Languages</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search proverbs..."
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Languages</option>
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Periods</option>
              {historicalPeriods.map(period => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Proverbs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-white rounded-xl shadow-md p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProverbs.map((proverb) => (
              <div
                key={proverb.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => navigate(`/language/${proverb.languages.code}`)}
              >
                {/* Language and Period Tags */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-amber-100 text-amber-600 text-sm rounded-full">
                    {proverb.languages.name}
                  </span>
                  {proverb.historical_period && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                      {proverb.historical_period}
                    </span>
                  )}
                  {proverb.region && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                      {proverb.region}
                    </span>
                  )}
                </div>

                {/* Proverb Content */}
                <h2 className="text-xl font-bold text-gray-900 mb-2">{proverb.text}</h2>
                <p className="text-gray-600 italic mb-3">{proverb.literal_translation}</p>
                <p className="text-sm text-gray-500 mb-3">{proverb.meaning}</p>
                
                {/* Cultural Context */}
                {proverb.cultural_context && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-700">{proverb.cultural_context}</p>
                  </div>
                )}

                {/* Usage Example */}
                {proverb.usage_example && (
                  <div className="mt-3 text-sm text-gray-500">
                    <span className="font-medium">Example: </span>
                    {proverb.usage_example}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProverbs;