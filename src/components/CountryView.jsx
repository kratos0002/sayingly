import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CountryView = () => {
  const { countryCode } = useParams();
  const [countryData, setCountryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCountryData();
  }, [countryCode]);

  const fetchCountryData = async () => {
    try {
      const { data, error } = await supabase
        .from('country_languages')
        .select(`
          country_name,
          languages:language_id (
            id,
            name,
            code,
            idioms:idioms (*)
          )
        `)
        .eq('country_code', countryCode.toUpperCase());

      if (error) throw error;
      setCountryData(data[0]);
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
        <div className="max-w-4xl mx-auto text-center">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-4xl mx-auto text-center text-red-600">
          Error: {error}
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
          className="inline-block mb-6 text-blue-600 hover:text-blue-800"
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
        <div className="grid grid-cols-1 gap-6">
          {countryData?.languages?.map((language) => (
            <div 
              key={language.id}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-semibold mb-4">
                {language.name}
              </h2>
              
              <div className="space-y-4">
                {language.idioms?.map((idiom) => (
                  <div 
                    key={idiom.id}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <h3 className="text-xl font-medium text-blue-600 mb-2">
                      {idiom.original}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {idiom.pronunciation}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Meaning: </span>
                      {idiom.meaning}
                    </p>
                    <p className="italic text-gray-700">
                      Example: {idiom.example}
                    </p>
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