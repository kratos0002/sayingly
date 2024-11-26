import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CountryView = () => {
 const { countryCode } = useParams();
 const [countryData, setCountryData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 // Country name mappings
 const countryNames = {
   'IND': 'India',
   'NLD': 'Netherlands',
   'FRA': 'France',
   'ITA': 'Italy',
   'ZAF': 'South Africa'
 };

 useEffect(() => {
   fetchCountryData();
 }, [countryCode]);

 const fetchCountryData = async () => {
   try {
     setLoading(true);
     // First, get all languages for this country
     const { data: languageData, error: langError } = await supabase
       .from('country_languages')
       .select(`
         language_id,
         is_primary
       `)
       .eq('country_code', countryCode.toUpperCase());

     if (langError) throw langError;

     if (!languageData || languageData.length === 0) {
       throw new Error('No languages found for this country');
     }

     // Get language details and idioms for each language
     const languagePromises = languageData.map(async (lang) => {
       const { data, error } = await supabase
         .from('languages')
         .select(`
           id,
           name,
           code,
           idioms (
             id,
             original,
             pronunciation,
             english_translation,
             meaning,
             usage_context,
             example,
             popularity_rank
           )
         `)
         .eq('id', lang.language_id)
         .order('popularity_rank', { foreignTable: 'idioms', ascending: true });

       if (error) throw error;
       return { ...data[0], is_primary: lang.is_primary };
     });

     const languages = await Promise.all(languagePromises);
     setCountryData({
       country_name: countryNames[countryCode.toUpperCase()],
       languages: languages
     });
   } catch (error) {
     console.error('Error fetching country data:', error);
     setError(error.message);
   } finally {
     setLoading(false);
   }
 };

 if (loading) {
   return (
     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
       <div className="max-w-4xl mx-auto">
         {/* Loading Skeleton */}
         <div className="animate-pulse space-y-8">
           <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
           <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
           {[1, 2].map((n) => (
             <div key={n} className="bg-white rounded-xl shadow-md p-6">
               <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
               <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                 ))}
               </div>
             </div>
           ))}
         </div>
       </div>
     </div>
   );
 }

 if (error) {
   return (
     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
       <div className="max-w-4xl mx-auto">
         <Link 
           to="/" 
           className="inline-block mb-6 text-blue-600 hover:text-blue-800"
         >
           ← Back to World Map
         </Link>
         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
           <div className="flex">
             <div className="ml-3">
               <h3 className="text-sm font-medium text-red-800">Error loading country data</h3>
               <div className="mt-2 text-sm text-red-700">{error}</div>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 }

 return (
   <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
     <div className="max-w-4xl mx-auto p-4">
       {/* Back to Map Link */}
       <Link 
         to="/" 
         className="inline-block mb-6 text-blue-600 hover:text-blue-800 transition-colors"
       >
         ← Back to World Map
       </Link>

       {/* Country Header */}
       <div className="text-center mb-8">
         <h1 className="text-4xl font-bold text-gray-900 mb-2">
           {countryData?.country_name}
         </h1>
         <p className="text-lg text-gray-600">
           Explore idioms from {countryData?.country_name}
         </p>
       </div>

       {/* Languages Grid */}
       <div className="space-y-8">
         {countryData?.languages?.map((language) => (
           <div 
             key={language.id}
             className="bg-white rounded-xl shadow-lg overflow-hidden"
           >
             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
               <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-semibold text-gray-900">
                   {language.name}
                 </h2>
                 {language.is_primary && (
                   <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                     Primary Language
                   </span>
                 )}
               </div>
             </div>
             
             <div className="p-6 space-y-6">
               {language.idioms?.map((idiom) => (
                 <div 
                   key={idiom.id}
                   className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                 >
                   <h3 className="text-xl font-medium text-blue-600 mb-2">
                     {idiom.original}
                   </h3>
                   <div className="space-y-2">
                     <p className="text-gray-600 font-mono text-sm">
                       {idiom.pronunciation}
                     </p>
                     <p>
                       <span className="font-medium">English: </span>
                       {idiom.english_translation}
                     </p>
                     <p>
                       <span className="font-medium">Meaning: </span>
                       {idiom.meaning}
                     </p>
                     <p className="italic text-gray-700 bg-white p-3 rounded">
                       <span className="font-medium not-italic">Example: </span>
                       {idiom.example}
                     </p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         ))}
       </div>
     </div>
   </div>
 );
};

export default CountryView;