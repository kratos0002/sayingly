import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AllUntranslatables = () => {
  const [untranslatables, setUntranslatables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUntranslatables();
  }, []);

  const fetchUntranslatables = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('untranslatable_words')
        .select(`
          id,
          word,
          meaning,
          examples,
          cultural_significance,
          usage_context,
          language_id,
          languages (
            id,
            name,
            code
          )
        `)
        .order('language_id', { ascending: true });

      if (error) throw error;

      setUntranslatables(data);
    } catch (error) {
      console.error('Error fetching untranslatables:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Untranslatables</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded w-3/4"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {untranslatables.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all"
              >
                <h2 className="text-xl font-bold text-blue-600">{entry.word}</h2>
                <p className="text-sm text-gray-500 italic mb-2">
                  Language: {entry.languages.name}
                </p>
                <p className="text-gray-700 mb-4">
                  <span className="font-semibold">Meaning: </span>{entry.meaning}
                </p>
                <p className="text-gray-700 mb-4">
                  <span className="font-semibold">Context: </span>{entry.cultural_significance}
                </p>
                <p className="text-gray-700 italic">
                  <span className="font-semibold not-italic">Example: </span>
                  {entry.examples}
                </p>
                <div className="mt-4">
                  <Link
                    to={`/language/${entry.languages.code}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Explore {entry.languages.name} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUntranslatables;
