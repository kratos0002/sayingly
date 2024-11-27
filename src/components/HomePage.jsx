import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const HomePage = () => {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguageStats();
  }, []);

  const fetchLanguageStats = async () => {
    try {
      // First get all languages
      const { data: languagesData } = await supabase
        .from('languages')
        .select(`
          *,
          language_details (regions),
          idioms!inner (count)
        `);
  
      // Then get idiom counts separately to ensure accuracy
      const idiomCounts = await Promise.all(
        languagesData.map(async (lang) => {
          const { count } = await supabase
            .from('idioms')
            .select('*', { count: 'exact' })
            .eq('language_id', lang.id);
          return { id: lang.id, count: count || 0 };
        })
      );
  
      // Merge counts with language data
      const languages = languagesData.map(lang => ({
        ...lang,
        idiomCount: idiomCounts.find(ic => ic.id === lang.id)?.count || 0
      }));
  
      setLanguages(languages);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <div className="max-w-6xl mx-auto">

<div className="text-center mb-16">
  <h1 className="text-4xl font-bold text-gray-900 mb-3">Sayingly</h1>
  <p className="text-lg text-gray-600">Learn the wisdom of the world through idioms and local sayings</p>
</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languages.map(lang => (
            <div 
              key={lang.code}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
              onClick={() => navigate(`/language/${lang.code}`)}
            >
              <h2 className="text-2xl font-bold text-blue-600 mb-4">{lang.name}</h2>
              <div className="space-y-2 text-gray-600">
              <p>Idioms: {lang.idiomCount}</p>
                <p>Regions: {lang.language_details?.regions?.length || 0}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Footer Section */}
<div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-xl font-semibold mb-4">Collection Stats</h2>
    <div className="space-y-3">
      <p className="text-gray-700">Total Languages: {languages.length}</p>
      <p className="text-gray-700">Total Idioms: {languages.reduce((acc, lang) => acc + lang.idiomCount, 0)}</p>
      <p className="text-gray-700">Countries Covered: {Array.from(new Set(languages.flatMap(lang => lang.language_details?.regions || []))).length}</p>
    </div>
  </div>

  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-xl font-semibold mb-4">Featured Idioms</h2>
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="font-medium text-blue-600">"In bocca al lupo"</p>
        <p className="text-sm text-gray-600">Italian - "Into the mouth of the wolf"</p>
      </div>
      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="font-medium text-blue-600">"Nu komt de aap uit de mouw"</p>
        <p className="text-sm text-gray-600">Dutch - "Now the monkey comes out of the sleeve"</p>
      </div>
    </div>
  </div>
</div>
    </div>
    
  );
};

export default HomePage;