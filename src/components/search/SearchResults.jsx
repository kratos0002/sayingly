import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ResultCard = ({ result, type }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    switch (type) {
      case 'idiom':
        navigate(`/idiom/${result.id}`);
        break;
      case 'proverb':
        navigate(`/proverb/${result.id}`);
        break;
      case 'untranslatable':
        navigate(`/untranslatable/${result.id}`);
        break;
      // Add other types as needed
      default:
        navigate(`/${type}/${result.id}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl hover:bg-blue-50 transition-all"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
          {result.language && (
            <span className="text-sm text-gray-500">
              {result.language}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-gray-800">
          {result.title || result.content}
        </h3>
        {result.description && (
          <p className="text-gray-600 line-clamp-2">
            {result.description}
          </p>
        )}
        {result.tags && result.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {result.tags.map((tag, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SearchResults = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const [idioms, proverbs, untranslatables] = await Promise.all([
          supabase
            .from('idioms')
            .select('*')
            .textSearch('content', query)
            .limit(5),
          supabase
            .from('proverbs')
            .select('*')
            .textSearch('content', query)
            .limit(5),
          supabase
            .from('untranslatables')
            .select('*')
            .textSearch('content', query)
            .limit(5),
        ]);

        const allResults = [
          ...(idioms.data || []).map(item => ({ ...item, type: 'idiom' })),
          ...(proverbs.data || []).map(item => ({ ...item, type: 'proverb' })),
          ...(untranslatables.data || []).map(item => ({ ...item, type: 'untranslatable' })),
        ];

        setResults(allResults);
      } catch (err) {
        setError('Failed to fetch search results');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  if (!query) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">No search query provided</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Search Results for "{query}"
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin text-4xl">🔄</div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">
          {error}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center text-gray-600 py-8">
          No results found for "{query}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result, index) => (
            <ResultCard 
              key={`${result.type}-${result.id}`} 
              result={result} 
              type={result.type}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;