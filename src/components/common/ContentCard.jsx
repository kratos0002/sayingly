import React from 'react';
import { FaGlobe } from 'react-icons/fa6';

const ContentCard = ({ 
  content = {
    original: '',
    english_translation: '',
    pronunciation: '',
    example: '',
    usage_context: '',
    language: { name: '', code: '' },
    type: 'content', // idiom, proverb, untranslatable, etc.
  },
  expanded = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(expanded);

  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 transition-all duration-300">
      {/* Language Badge */}
      <div className="flex justify-between items-center mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <FaGlobe className="mr-2" />
          {content.language.name}
        </span>
        <span className="text-sm font-medium text-gray-500 capitalize">
          {content.type}
        </span>
      </div>

      {/* Original Text */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {content.original}
      </h2>

      {/* Translation */}
      <p className="text-gray-700 italic mb-4">
        {content.english_translation}
      </p>

      {/* Expandable Content */}
      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-96' : 'max-h-0'
      }`}>
        {content.pronunciation && (
          <div className="mb-3">
            <span className="font-semibold text-gray-700">Pronunciation: </span>
            <span className="text-gray-600">{content.pronunciation}</span>
          </div>
        )}

        {content.example && (
          <div className="mb-3">
            <span className="font-semibold text-gray-700">Example: </span>
            <span className="text-gray-600">{content.example}</span>
          </div>
        )}

        {content.usage_context && (
          <div className="mb-3">
            <span className="font-semibold text-gray-700">Usage: </span>
            <span className="text-gray-600">{content.usage_context}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
        
        {/* Action buttons will be added later with auth/sharing features */}
      </div>
    </div>
  );
};

export default ContentCard;
