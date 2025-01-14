import React from 'react';
import { FaGlobe } from 'react-icons/fa';

const EmbedCard = ({ 
  content = {
    original: '',
    english_translation: '',
    pronunciation: '',
    language: { name: '', code: '' },
    type: 'content',
  }
}) => {
  return (
    <div className="bg-white p-4 h-full">
      {/* Language Badge */}
      <div className="flex justify-between items-center mb-3">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FaGlobe className="mr-1" />
          {content.language.name}
        </span>
        <span className="text-xs font-medium text-gray-500 capitalize">
          {content.type}
        </span>
      </div>

      {/* Original Text */}
      <h2 className="text-lg font-bold text-gray-900 mb-2">
        {content.original}
      </h2>

      {/* Translation */}
      <p className="text-gray-700 italic mb-2 text-sm">
        {content.english_translation}
      </p>

      {/* Pronunciation if available */}
      {content.pronunciation && (
        <div className="text-sm">
          <span className="font-semibold text-gray-700">Pronunciation: </span>
          <span className="text-gray-600">{content.pronunciation}</span>
        </div>
      )}

      {/* Sayingly Attribution */}
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
        <a 
          href={`${window.location.origin}/${content.type}s/${content.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600"
        >
          View on Sayingly
        </a>
      </div>
    </div>
  );
};

export default EmbedCard;