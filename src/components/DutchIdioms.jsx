import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const DutchIdioms = () => {
  const { languageCode } = useParams();
  const [languages, setLanguages] = useState([]);
  const [idioms, setIdioms] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(languageCode || 'nl');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [languageDetails, setLanguageDetails] = useState(null);
  const [slangExpressions, setSlangExpressions] = useState([]);
  const [activeTab, setActiveTab] = useState('idioms');
  const [proverbs, setProverbs] = useState([]);
  const [untranslatables, setUntranslatables] = useState([]);
  const [wisdomConcepts, setWisdomConcepts] = useState([]);
  const [mythsLegends, setMythsLegends] = useState([]);
  const [riddles, setRiddles] = useState([]);

  


  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      fetchLanguageDetails(selectedLanguage);
      fetchLanguageContent(selectedLanguage); // Updated from fetchIdioms
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (languageCode) {
      setSelectedLanguage(languageCode);
    }
  }, [languageCode]);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name');

      if (error) throw error;
      setLanguages(data);
    } catch (error) {
      console.error('Error fetching languages:', error);
      setError(error.message);
    }
  };

  const fetchLanguageDetails = async (langCode) => {
    try {
      const { data: langData, error: langError } = await supabase
        .from('languages')
        .select(`
          id,
          code,
          name,
          language_details!inner(
            description,
            speakers,
            regions,
            age_description,
            unique_features
          )
        `)
        .eq('code', langCode)
        .single();
  
      if (langError) {
        // Don't throw error for missing language details
        if (langError.code === 'PGRST116') {
          setLanguageDetails(null);
          return;
        }
        throw langError;
      }
      setLanguageDetails(langData.language_details);
    } catch (error) {
      console.error('Error:', error);
      setLanguageDetails(null); // Set null instead of error state
    }
  };

  const fetchStoryContent = async (storyUrl) => {
    try {
      const response = await fetch(storyUrl);
      if (!response.ok) {
        console.error(`Failed to fetch story content from ${storyUrl}`);
        throw new Error('Story URL is inaccessible');
      }
      const text = await response.text();
      console.log(`Fetched Story Content:`, text);
      return text;
    } catch (error) {
      console.error('Error fetching story content:', error);
      return 'Story content unavailable';
    }
  };
  
  const fetchLanguageContent = async (langCode) => {    
    setLoading(true);
    try {
      // 1. Get language ID
      const { data: langData, error: langError } = await supabase
        .from('languages')
        .select(`
          id,
          code,
          name
        `)
        .eq('code', langCode)
        .single();
  
      console.log('Language Data:', { langCode, langData });
  
      if (langError) {
        console.log('Language Error:', langError);
        throw langError;
      }
  
      if (!langData) {
        throw new Error('Language not found');
      }
  
      // 2. Fetch all category data for this language
      const [
        idiomsResult,
        slangResult,
        proverbsResult,
        untranslatablesResult,
        wisdomConceptsResult,
        mythsLegendsResult,
        storiesResult, // New fetch for stories
        riddlesResult // New fetch for riddles

      ] = await Promise.all([
        supabase
          .from('idioms')
          .select(`
            *,
            languages!inner (
              code,
              name
            )
          `)
          .eq('language_id', langData.id)
          .order('popularity_rank'),
      
        supabase
          .from('slang_expressions')
          .select('*')
          .eq('language_id', langData.id),
      
        supabase
          .from('proverbs')
          .select('*')
          .eq('language_id', langData.id),
      
        supabase
          .from('untranslatable_words')
          .select('*')
          .eq('language_id', langData.id),
      
        supabase
          .from('wisdom_concepts')
          .select('*')
          .eq('language_id', langData.id),
      
        supabase
          .from('myths_legends')
          .select('*')
          .eq('language_id', langData.id),
      
        supabase
          .from('story_texts') // Fetch all stories for this language
          .select('*')
          .eq('language_id', langData.id),

          supabase
          .from('riddles') // Fetch riddles
          .select('*')
          .eq('language_id', langData.id),
      ]);
      
      if (idiomsResult.error) throw idiomsResult.error;
      if (slangResult.error) throw slangResult.error;
      if (proverbsResult.error) throw proverbsResult.error;
      if (untranslatablesResult.error) throw untranslatablesResult.error;
      if (wisdomConceptsResult.error) throw wisdomConceptsResult.error;
      if (mythsLegendsResult.error) throw mythsLegendsResult.error;
      if (storiesResult.error) throw storiesResult.error;
      if (riddlesResult.error) throw riddlesResult.error;


      
  
      // 3. For each idiom, get its meaning connections
      const idiomsWithConnections = await Promise.all(
        idiomsResult.data.map(async (idiom) => {
          const { data: connections, error: connectionsError } = await supabase
            .from('idiom_meaning_connections')
            .select(`
              *,
              idiom_meaning_groups (
                id,
                name,
                core_meaning
              )
            `)
            .eq('idiom_id', idiom.id);
  
          console.log(`Connections for idiom ${idiom.id}:`, connections);
  
          if (connectionsError) {
            console.error('Connection Error for idiom:', idiom.id, connectionsError);
            return idiom;
          }
  
          if (!connections || connections.length === 0) {
            return idiom;
          }
  
          const groupId = connections[0].idiom_meaning_groups?.id;
          if (!groupId) {
            return { ...idiom, idiom_meaning_connections: connections };
          }
  
          
          // Fetch related idioms for each connection
          const { data: related, error: relatedError } = await supabase
            .from('idiom_meaning_connections')
            .select(`
              idiom_id,
              idioms (
                id,
                original,
                english_translation,
                languages!inner (
                  name,
                  code
                )
              )
            `)
            .eq('group_id', groupId)
            .neq('idiom_id', idiom.id);
  
          console.log(`Related idioms for group ${groupId}:`, related);
  
          if (relatedError) {
            console.error('Related Error:', relatedError);
            return { ...idiom, idiom_meaning_connections: connections };
          }
  
          // Filter out any related idioms that don't have valid language data
          const validRelated = related?.filter(
            (r) => r.idioms && r.idioms.languages && r.idioms.languages.code
          );
  
          return {
            ...idiom,
            idiom_meaning_connections: connections,
            related_idioms: validRelated,
          };
        })
      );
  
      console.log('Final Enriched Data:', {
        count: idiomsWithConnections.length,
        sample: idiomsWithConnections[0],
      });

      console.log('Fetched Stories:', storiesResult.data);


      const mythsWithStories = await Promise.all(
        mythsLegendsResult.data.map(async (myth) => {
          const linkedStories = storiesResult.data.filter((story) => story.myth_id === myth.id);
          console.log(`Myth ID: ${myth.id}, Linked Stories:`, linkedStories);
  
          const enrichedStories = await Promise.all(
            linkedStories.map(async (story) => ({
              ...story,
              text: await fetchStoryContent(story.story_url), // Fetch the story text
            }))
          );
          return { ...myth, stories: enrichedStories };
        })
      );

  
      // 4. Set state for all categories
      setIdioms(idiomsWithConnections);
      setSlangExpressions(slangResult.data || []);
      setProverbs(proverbsResult.data || []);
      setUntranslatables(untranslatablesResult.data || []);
      setWisdomConcepts(wisdomConceptsResult.data || []);
      setError(null);
      setMythsLegends(mythsWithStories);
      setRiddles(riddlesResult.data || []);

    } catch (error) {
      console.error('Final Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
    


    console.log('Fetched Myths:', mythsLegendsResult.data);

    
  };

  

  

// Get current language name
const currentLanguage = languages.find(lang => lang.code === selectedLanguage)?.name;
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-4">
        <Link 
          to="/" 
          className="inline-block mb-6 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sayingly</h1>
          <p className="text-lg text-gray-600">Discover the world's wisdom through idioms</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="max-w-md mx-auto">
            <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Language
            </label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {languageDetails && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">About {currentLanguage}</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {languageDetails.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Quick Facts</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Speakers: {new Intl.NumberFormat().format(languageDetails.speakers)}+</li>
                    <li>• Age: {languageDetails.age_description}</li>
                    <li>• Regions: {languageDetails.regions.join(', ')}</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Unique Features</h3>
                  <ul className="space-y-2 text-blue-800">
                    {languageDetails.unique_features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

<div className="mb-8 border-b border-gray-200">
<div className="flex overflow-x-scroll space-x-4 pb-4 border-b border-gray-200">
  {[
    { label: "Idioms", count: idioms.length },
    { label: "Slang", count: slangExpressions.length },
    { label: "Proverbs", count: proverbs.length },
    { label: "Untranslatables", count: untranslatables.length },
    { label: "Myths", count: mythsLegends.length },
    { label: "WisdomConcepts", count: wisdomConcepts.length },
    { label: "Riddles", count: riddles.length }, // New Riddles Tab

  ].map((tab) => (
    <button
      key={tab.label}
      onClick={() => setActiveTab(tab.label.toLowerCase().replace(/ /g, '_'))}
      className={`pb-2 px-4 text-sm font-medium border-b-2 ${
        activeTab === tab.label.toLowerCase().replace(/ /g, '_')
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {tab.label} ({tab.count})
    </button>
  ))}
</div>

</div>




<div className="space-y-6">
  {loading ? (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div key={n} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      ))}
    </div>
  ) : error ? (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error loading idioms</h3>
          <div className="mt-2 text-sm text-red-700">{error}</div>
        </div>
      </div>
    </div>
  ) : (
    <>
      {activeTab === 'idioms' && (
        <div className="space-y-6">
          {idioms.map((idiom, index) => (
            <div
              key={idiom.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-200"
            >
              {/* Header Section */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <h2 className="text-2xl font-bold text-blue-600">
                    {idiom.original}
                  </h2>
                  {idiom.idiom_meaning_connections?.length > 0 && idiom.related_idioms?.length > 0 && (
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors cursor-help"
                      title={`This idiom has ${idiom.related_idioms.length} similar expressions in other languages`}
                    >
                      <svg 
                        className="w-3 h-3 mr-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
                        />
                      </svg>
                      Related Expressions
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {idiom.difficulty_level && (
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {idiom.difficulty_level}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    #{index + 1}
                  </span>
                </div>
              </div>

              {/* Pronunciation */}
              <div className="text-gray-600 mb-4">
                <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                  {idiom.pronunciation}
                </span>
              </div>

              {/* Main Content */}
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <span className="font-semibold text-blue-900">English: </span>
                  <span className="text-blue-800">{idiom.english_translation}</span>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-800">
                    <span className="font-semibold">Meaning: </span>
                    {idiom.meaning}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-semibold">Usage: </span>
                    {idiom.usage_context}
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg italic text-gray-700">
                    <span className="font-semibold not-italic">Example: </span>
                    {idiom.example}
                  </div>
                </div>

                {/* Related Idioms Section */}
                {idiom.idiom_meaning_connections && idiom.related_idioms && idiom.related_idioms.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">Similar Expressions</h3>
                        <span className="text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {idiom.related_idioms.length}
                        </span>
                      </div>
                      {idiom.idiom_meaning_connections[0]?.idiom_meaning_groups && (
                        <p className="text-sm text-gray-600">
                          Theme: {idiom.idiom_meaning_connections[0].idiom_meaning_groups.name}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {idiom.related_idioms
                        .filter(related => related.idioms?.id !== idiom.id)
                        .map((related) => (
                          <div 
                            key={related.idioms.id}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2.5 py-1 bg-white/50 rounded-full text-sm font-medium text-blue-800 border border-blue-200">
                                {related.idioms.languages.name}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <p className="font-medium text-gray-900">
                                {related.idioms.original}
                              </p>
                              <p className="text-sm text-gray-600 pb-2 border-b border-blue-100">
                                {related.idioms.english_translation}
                              </p>
                              {related.notes && (
                                <p className="text-xs text-gray-500 italic pt-1">
                                  {related.notes}
                                </p>
                              )}
                            </div>
                            <div className="mt-3 flex justify-end">
                              <Link 
                                to={`/language/${related.idioms.languages.code}`}
                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors group"
                              >
                                Explore {related.idioms.languages.name} Idioms
                                <svg 
                                  className="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </Link>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slang Section */}
      {activeTab === 'slang' && (
        <div className="space-y-6">
          {slangExpressions.map((slang) => (
            <div
              key={slang.id}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-purple-600">
                  {slang.expression}
                </h3>
              </div>

              <div className="text-gray-600 mb-4">
                <span className="font-mono text-sm bg-white/50 px-2 py-1 rounded">
                  {slang.pronunciation}
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-white/50 p-3 rounded-lg">
                  <span className="font-semibold text-purple-900">Literal: </span>
                  <span className="text-purple-800">{slang.literal_translation}</span>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-800">
                    <span className="font-semibold">Meaning: </span>
                    {slang.meaning}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-semibold">Context: </span>
                    {slang.context}
                  </p>
                  <div className="bg-white/50 p-3 rounded-lg italic text-gray-700">
                    <span className="font-semibold not-italic">Example: </span>
                    {slang.example}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {slang.register && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {slang.register}
                    </span>
                  )}
                  {slang.age_group && (
                    <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                      {slang.age_group}
                    </span>
                  )}
                  {slang.time_period && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                      {slang.time_period}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      

{activeTab === 'proverbs' && (
  <div className="space-y-6">
    {proverbs.map((proverb) => (
      <div
        key={proverb.id}
        className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-200"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-amber-600">
            {proverb.text}
          </h3>
        </div>

        <div className="text-gray-600 mb-4">
          <span className="font-mono text-sm bg-white/50 px-2 py-1 rounded">
            {proverb.pronunciation}
          </span>
        </div>

        <div className="space-y-3">
          <div className="bg-white/50 p-3 rounded-lg">
            <span className="font-semibold text-amber-900">Literal: </span>
            <span className="text-amber-800">{proverb.literal_translation}</span>
          </div>

          <div className="space-y-2">
            <p className="text-gray-800">
              <span className="font-semibold">Meaning: </span>
              {proverb.meaning}
            </p>
            <p className="text-gray-800">
              <span className="font-semibold">Cultural Context: </span>
              {proverb.cultural_context}
            </p>
            <div className="bg-white/50 p-3 rounded-lg italic text-gray-700">
              <span className="font-semibold not-italic">Example: </span>
              {proverb.usage_example}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {proverb.historical_period && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                {proverb.historical_period}
              </span>
            )}
            {proverb.region && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                {proverb.region}
              </span>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
)}

{activeTab === 'untranslatables' &&
  untranslatables.map((word) => (
    <div key={word.id} className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-green-600">{word.word}</h3>
      <p>{word.meaning}</p>
    </div>
  ))}

{activeTab === "myths" &&
  mythsLegends.map((myth) => (
    <div
      key={myth.id}
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all"
    >
      <h3 className="text-lg font-bold text-blue-600">{myth.title}</h3>
      <p className="text-sm text-red-700">{myth.pronunciation}</p>
      <p className="text-sm text-gray-700">{myth.origin_culture}</p>
      <p className="text-sm text-gray-700">{myth.synopsis}</p>


      {/* Render linked stories */}
     {myth.stories?.length > 0 ? (
  <div className="mt-6">
    <h4 className="text-lg font-semibold text-gray-900 mb-4">Stories:</h4>
    {myth.stories.map((story) => (
      <div
        key={story.id}
        className="bg-blue-50 rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow"
      >
        <h5 className="text-md font-bold text-blue-700 mb-2">
          {story.is_original ? 'Original Story' : 'Translated Story'}
        </h5>
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {story.text || (
            <span className="italic text-gray-500">Story content unavailable</span>
          )}
        </p>
      </div>
    ))}
  </div>
) : (
  <p className="text-sm text-gray-500 italic">No stories available</p>
)}

    </div>
  ))
}

{activeTab === "riddles" &&
  riddles.map((riddle) => (
    <div
      key={riddle.id}
      className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold text-green-600">
          {riddle.original}
        </h3>
      </div>

      <div className="text-gray-600 mb-4">
        <span className="font-mono text-sm bg-white/50 px-2 py-1 rounded">
          {riddle.pronunciation}
        </span>
      </div>

      <div className="space-y-3">
        <div className="bg-white/50 p-3 rounded-lg">
          <span className="font-semibold text-green-900">English: </span>
          <span className="text-green-800">{riddle.english_translation}</span>
        </div>
        <div className="bg-white/50 p-3 rounded-lg">
          <span className="font-semibold text-green-900">Answer: </span>
          <span className="text-green-800">{riddle.answer_translation}</span>
        </div>
        <p className="text-gray-800">
          <span className="font-semibold">Context: </span>
          {riddle.context}
        </p>
        <p className="text-gray-800">
          <span className="font-semibold">Cultural Notes: </span>
          {riddle.cultural_notes}
        </p>
      </div>
    </div>
  ))}


{activeTab === "wisdomconcepts" &&
    wisdomConcepts.map((term) => (
      <div
        key={term.id}
        className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all"
      >
        <h3 className="text-lg font-bold text-green-600">{term.term}</h3>
        <p className="text-sm text-red-700">{term.pronunciation}</p>
        <p className="text-sm text-gray-700">{term.literal_translation}</p>
        <p className="text-xs text-gray-500">{term.detailed_explanation}</p>
      </div>
    ))}

    </>
  )}
</div>
</div>
</div>

);
};

export default DutchIdioms;
