import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// Icons
const BookIcon = () => <span className="text-4xl">📖</span>;
const ScrollIcon = () => <span className="text-4xl">📜</span>;
const ChatIcon = () => <span className="text-4xl">💬</span>;
const GlobeIcon = () => <span className="text-4xl">🌍</span>;
const PuzzleIcon = () => <span className="text-4xl">🧩</span>;
const BrainIcon = () => <span className="text-4xl">🧠</span>;
const MythIcon = () => <span className="text-4xl">🐉</span>;

// Category Card Component
const CategoryCard = ({ title, count, icon, tagline, navigateTo }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(navigateTo)} // Add navigation
      className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl hover:bg-blue-50 transition-all"
    >
      <div className="flex flex-col items-center text-center gap-2">
        <div className="text-4xl">{icon}</div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-gray-600">{count} entries</p>
        <p className="text-gray-500 italic text-sm">{tagline}</p>
      </div>
    </div>
  );
};



// Moving Horizontal Language Row
const MovingFlagRow = ({ languages }) => {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden bg-white shadow-inner py-6">
      <div className="animate-scroll whitespace-nowrap flex gap-8">
        {languages.map((lang, index) => (
          <div
            key={`${lang.code}-${index}`}
            onClick={() => navigate(`/language/${lang.code}`)} // Add navigation
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg shadow hover:shadow-lg hover:bg-blue-100 transition-all cursor-pointer"
          >
            <span className="text-3xl">{lang.flag}</span>
            <span className="font-medium text-gray-700 hover:underline">{lang.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HomePage = () => {
  const [totals, setTotals] = useState({ idioms: 0, proverbs: 0, untranslatables: 0, slang: 0, riddles: 0, wisdomConcepts: 0, myths: 0 });
  const [languages, setLanguages] = useState([]);
  const [languageCount, setLanguageCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();




  const fetchTotals = async () => {
    const [idioms, proverbs, untranslatables, slang, riddles, wisdomConcepts, myths, langs] = await Promise.all([
      supabase.from("idioms").select("*", { count: "exact" }),
      supabase.from("proverbs").select("*", { count: "exact" }),
      supabase.from("untranslatable_words").select("*", { count: "exact" }),
      supabase.from("slang_expressions").select("*", { count: "exact" }),
      supabase.from("riddles").select("*", { count: "exact" }),
      supabase.from("wisdom_concepts").select("*", { count: "exact" }),
      supabase.from("myths_legends").select("*", { count: "exact" }),
      supabase.from("languages").select("name, code, country_languages (country_code)",{ count: "exact" }),
    ]);

    setTotals({
      idioms: idioms.count || 0,
      proverbs: proverbs.count || 0,
      untranslatables: untranslatables.count || 0,
      slang: slang.count || 0,
      riddles: riddles.count || 0,
      wisdomConcepts: wisdomConcepts.count || 0,
      myths: myths.count || 0,
    });

    setLanguages(
      langs.data.map((lang) => ({
        name: lang.name,
        code: lang.code,
        flag: lang.country_languages?.[0]?.country_code
          ?.toUpperCase()
          .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt())) || "🏳",
      }))
    );
    setLanguageCount(langs.count || 0);
  };

  useEffect(() => {
    fetchTotals();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Title Section */}
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Discover the World's Wisdom
        </h1>
        <p className="text-lg text-gray-600">
          We have covered <span className="text-blue-500 font-bold text-2xl">{languageCount} languages</span> across the globe.
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-8 lg:px-16">
  <CategoryCard
    title="Idioms"
    count={totals.idioms}
    icon={<span role="img" aria-label="book">📖</span>}
    tagline="Dive into vivid expressions!"
    navigateTo="/idioms"
  />
  <CategoryCard
    title="Proverbs"
    count={totals.proverbs}
    icon={<span role="img" aria-label="scroll">📜</span>}
    tagline="Unlock timeless wisdom."
    navigateTo="/proverbs"
  />
  <CategoryCard
    title="Untranslatables"
    count={totals.untranslatables}
    icon={<span role="img" aria-label="globe">🌍</span>}
    tagline="Words too unique to translate!"
    navigateTo="/untranslatables"
  />
  <CategoryCard
    title="Slang"
    count={totals.slang}
    icon={<span role="img" aria-label="chat">💬</span>}
    tagline="Catch modern, edgy lingo!"
    navigateTo="/slang"
  />
  <CategoryCard
    title="Riddles"
    count={totals.riddles}
    icon={<span role="img" aria-label="puzzle">🧩</span>}
    tagline="Solve the puzzling wisdom!"
    navigateTo="/riddles"
  />
  <CategoryCard
    title="Wisdom Concepts"
    count={totals.wisdomConcepts}
    icon={<span role="img" aria-label="brain">🧠</span>}
    tagline="Discover profound insights."
    navigateTo="/wisdom-concepts"
  />
  <CategoryCard
    title="Myths & Legends"
    count={totals.myths}
    icon={<span role="img" aria-label="dragon">🐉</span>}
    tagline="Explore ancient stories."
    navigateTo="/myths"
  />
</div>



            {/* Search Bar */}
            {/* Search Bar */}
<div className="max-w-6xl mx-auto px-4 py-4 relative">
  <input
    type="text"
    placeholder="Search for a language..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring focus:ring-blue-200"
  />
  {searchQuery && (
    <ul className="absolute top-16 left-0 w-full bg-white shadow-lg rounded-lg z-50">
      {languages
        .filter((lang) =>
          lang.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((lang) => (
          <li
            key={lang.id}
            onClick={() => navigate(`/language/${lang.code}`)}
            className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
          >
            {lang.name} ({lang.code.toUpperCase()})
          </li>
        ))}
      {languages.filter((lang) =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).length === 0 && (
        <li className="p-3 text-gray-500">No matching languages found</li>
      )}
    </ul>
  )}
</div>


      {/* Moving Flag Row */}
      <MovingFlagRow languages={languages} />

      <div className="relative mt-12">
  {/* Background Shape */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 rounded-tl-[100px] rounded-br-[100px]"></div>
  
  {/* Content Container */}
  <div className="relative z-10 px-6 sm:px-12 py-12 max-w-5xl mx-auto text-center">
    {/* Decorative Heading */}
    <h2 className="text-4xl sm:text-5xl font-extrabold text-blue-800 leading-snug">
      Connecting Cultures, <br />
      Preserving the Wisdom of the World
    </h2>

    {/* Divider Line */}
    <div className="w-16 h-1 bg-blue-500 mx-auto my-6 rounded-full"></div>

    {/* Supporting Text */}
    <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
      Across time and space, words have carried meaning and stories across generations. 
      Our mission is to uncover the beauty of idioms, the depth of proverbs, and the magic of myths, 
      bridging humanity through shared wisdom and timeless tales. 
    </p>

    {/* Decorative Icons or Elements */}
    <div className="flex justify-center mt-8 gap-8">
      <div className="text-4xl sm:text-5xl text-blue-500 animate-bounce-slow">
        🌍
      </div>
      <div className="text-4xl sm:text-5xl text-blue-400 animate-bounce-slow delay-200">
        📜
      </div>
      <div className="text-4xl sm:text-5xl text-blue-300 animate-bounce-slow delay-400">
        🧠
      </div>
    </div>
  </div>
</div>



    </div>
  );
};

export default HomePage;
