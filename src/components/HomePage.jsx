import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const ScrollIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const CategoryCard = ({ title, count, icon, navigateTo }) => {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all w-64"
      onClick={() => navigate(navigateTo)}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-50 rounded-lg">{icon}</div>
        <div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-gray-600">{count} entries</p>
        </div>
      </div>
    </div>
  );
};

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '🏳'; // Default to a white flag if no code is provided
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
};

const LanguageCard = ({
  name,
  code,
  idiomCount,
  slangCount,
  proverbCount,
  language_details,
  countryCodes = [],
  onClick,
}) => (
  <div
    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer w-full md:w-80"
    onClick={onClick}
  >
    <div className="p-8 border-b border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-700">{name}</h2>
        <div className="flex space-x-2">
          {countryCodes.length > 0 ? (
            countryCodes.map((country) => (
              <span
                key={country.code}
                className="text-3xl"
                title={country.isPrimary ? 'Primary Country' : ''}
              >
                {getFlagEmoji(country.code)}
              </span>
            ))
          ) : (
            <span className="text-gray-400">🌐</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-3xl font-bold text-gray-800">{idiomCount}</div>
          <div className="text-lg text-gray-500">Idioms</div>
          <div className="mt-2 h-2 bg-blue-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full"
              style={{ width: `${Math.min((idiomCount / 50) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-800">{slangCount}</div>
          <div className="text-lg text-gray-500">Slang</div>
          <div className="mt-2 h-2 bg-purple-200 rounded-full">
            <div
              className="h-2 bg-purple-600 rounded-full"
              style={{ width: `${Math.min((slangCount / 20) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-800">{proverbCount}</div>
          <div className="text-lg text-gray-500">Proverbs</div>
          <div className="mt-2 h-2 bg-amber-200 rounded-full">
            <div
              className="h-2 bg-amber-600 rounded-full"
              style={{ width: `${Math.min((proverbCount / 20) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-800">
            {language_details?.regions?.length || 0}
          </div>
          <div className="text-lg text-gray-500">Regions</div>
          <div className="mt-2 h-2 bg-green-200 rounded-full">
            <div
              className="h-2 bg-green-600 rounded-full"
              style={{
                width: `${Math.min(
                  ((language_details?.regions?.length || 0) / 10) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLanguageStats = async () => {
    try {
      const { data: languagesData } = await supabase
        .from('languages')
        .select(`
          *,
          language_details (regions),
          idioms!inner (count),
          country_languages (country_code, is_primary)
        `);

      const counts = await Promise.all(
        languagesData.map(async (lang) => {
          const [idiomResult, slangResult, proverbResult] = await Promise.all([
            supabase
              .from('idioms')
              .select('*', { count: 'exact' })
              .eq('language_id', lang.id),
            supabase
              .from('slang_expressions')
              .select('*', { count: 'exact' })
              .eq('language_id', lang.id),
            supabase
              .from('proverbs')
              .select('*', { count: 'exact' })
              .eq('language_id', lang.id),
          ]);

          return {
            id: lang.id,
            idiomCount: idiomResult.count || 0,
            slangCount: slangResult.count || 0,
            proverbCount: proverbResult.count || 0,
          };
        })
      );

      const languages = languagesData.map((lang) => ({
        ...lang,
        idiomCount: counts.find((c) => c.id === lang.id)?.idiomCount || 0,
        slangCount: counts.find((c) => c.id === lang.id)?.slangCount || 0,
        proverbCount: counts.find((c) => c.id === lang.id)?.proverbCount || 0,
        countryCodes: Array.from(
          new Set(lang.country_languages?.map((cl) => cl.country_code) || [])
        ).map((code) => ({
          code,
          isPrimary: lang.country_languages?.find((cl) => cl.country_code === code)?.is_primary || false,
        })),
      }));

      setLanguages(languages);
    } catch (error) {
      console.error('Error fetching language stats:', error);
    }
  };

  const fetchThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('idiom_meaning_groups')
        .select(`
          id,
          name,
          core_meaning,
          context,
          idiom_meaning_connections (
            idiom:idioms (
              id
            )
          )
        `);

      if (error) throw error;

      // Process the themes to count idioms
      const processedThemes = data.map((theme) => ({
        ...theme,
        idiomCount: theme.idiom_meaning_connections?.length || 0,
      }));

      setThemes(processedThemes);
    } catch (error) {
      console.error('Error fetching themes:', error);
    } finally {
      setLoading(false); // Ensure loading state is managed properly
    }
  };

  // Call both fetch functions in useEffect
  useEffect(() => {
    fetchLanguageStats();
    fetchThemes();
  }, []);

  
  // Calculate totals
  const totalIdioms = languages.reduce((acc, lang) => acc + lang.idiomCount, 0);
  const totalSlang = languages.reduce((acc, lang) => acc + lang.slangCount, 0);
  const totalProverbs = languages.reduce((acc, lang) => acc + lang.proverbCount, 0);
  const totalRegions = Array.from(new Set(languages.flatMap(lang => lang.language_details?.regions || []))).length;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="min-h-[30vh] bg-gradient-to-b from-blue-50 to-white relative">
        <div className="max-w-6xl mx-auto px-4 pt-16 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Discover the World's Wisdom</h1>
          <p className="text-xl text-gray-600 mb-12">
            {languages.length} Languages • {totalIdioms} Idioms • {totalProverbs} Proverbs
          </p>
          
          {/* Category Cards */}
          <div className="flex justify-center gap-8 ">
  <CategoryCard
    title="Idioms"
    count={totalIdioms}
    icon={<BookIcon className="w-6 h-6 text-blue-500" />}
    navigateTo="/idioms"
  />
  <CategoryCard
    title="Proverbs"
    count={totalProverbs}
    icon={<ScrollIcon className="w-6 h-6 text-purple-500" />}
    navigateTo="/proverbs"
  />
  <CategoryCard
    title="Slang"
    count={totalSlang}
    icon={<ChatIcon className="w-6 h-6 text-green-500" />}
    navigateTo="/slang"
  />
</div>
        </div>
      </div>

           {/* Themes Section */}
           <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold">Explore Themes</h2>
          <Link to="/themes" className="text-blue-600 hover:text-blue-800">
            View All Themes →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.slice(0, 6).map((theme) => (
            <Link
              key={theme.id}
              to={`/themes/${theme.id}`}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-blue-600">{theme.name}</h3>
                <span className="text-sm font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                  {theme.idiomCount} idioms
                </span>
              </div>
              <p className="text-gray-600 mb-4">{theme.core_meaning}</p>
              <p className="text-sm text-gray-500 italic">{theme.context}</p>
            </Link>
          ))}
        </div>
      </div>


      {/* Featured Languages Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
  <div className="flex justify-between items-center mb-8">
    <h2 className="text-3xl font-bold">Featured Languages</h2>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {languages.map((lang) => (
      <LanguageCard
        key={lang.code}
        name={lang.name}
        code={lang.code}
        idiomCount={lang.idiomCount}
        slangCount={lang.slangCount}
        proverbCount={lang.proverbCount}
        countryCodes={lang.countryCodes}
        onClick={() => navigate(`/language/${lang.code}`)}
      />
    ))}
  </div>
</div>

      {/* Collection Stats */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Collection Overview</h2>
            <div className="space-y-4">
              <p className="text-lg">
                <span className="text-gray-600">Languages: </span>
                <span className="font-semibold">{languages.length}</span>
              </p>
              <p className="text-lg">
                <span className="text-gray-600">Total Expressions: </span>
                <span className="font-semibold">{totalIdioms + totalSlang + totalProverbs}</span>
              </p>
              <p className="text-lg">
                <span className="text-gray-600">Regions Covered: </span>
                <span className="font-semibold">{totalRegions}</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Featured Expressions</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-600">"In bocca al lupo"</p>
                <p className="text-sm text-gray-600">Italian - "Into the mouth of the wolf"</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-600">"Nu komt de aap uit de mouw"</p>
                <p className="text-sm text-gray-600">Dutch - "Now the monkey comes out of the sleeve"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;