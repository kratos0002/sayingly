import React from 'react';
import { FaGlobe, FaShare, FaTwitter, FaFacebook, FaLink, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useToast } from '../../contexts/ToastContext';
import { useBookmarks } from '../../contexts/BookmarkContext';
import { useAuth } from '../../contexts/AuthContext';
import { trackShare } from '../../utils/analytics';

const ContentCard = ({ 
  content = {
    original: '',
    id: '',
    english_translation: '',
    pronunciation: '',
    example: '',
    usage_context: '',
    language: { name: '', code: '' },
    type: 'content', // idiom, proverb, untranslatable, etc.
  },
  expanded = false,
  customContent = null,
}) => {
  const { showToast } = useToast();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { user } = useAuth();
  const bookmarked = isBookmarked(content.type, content.id);
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
      {/* Custom Content - Moved before actions for better visual hierarchy */}
      {customContent}
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
        
        <div className="flex gap-3 items-center">
          {user && (
            <button
              onClick={() => toggleBookmark(content.type, content.id)}
              className={`transition-colors ${
                bookmarked ? 'text-blue-600 hover:text-blue-800' : 'text-gray-500 hover:text-blue-600'
              }`}
              aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
            </button>
          )}
          <button
            onClick={() => {
              trackShare(content.type, content.id, 'twitter');
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${content.original} - ${content.english_translation}`)}%0A%0ALearn more at Sayingly&url=${encodeURIComponent(window.location.href)}`, '_blank');
            }}
            className="text-gray-500 hover:text-blue-500 transition-colors"
            aria-label="Share on Twitter"
          >
            <FaTwitter />
          </button>
          <button
            onClick={() => {
              trackShare(content.type, content.id, 'facebook');
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
            }}
            className="text-gray-500 hover:text-blue-600 transition-colors"
            aria-label="Share on Facebook"
          >
            <FaFacebook />
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              trackShare(content.type, content.id, 'copy_link');
              showToast('Link copied to clipboard!', 'success');
            }}
            className="text-gray-500 hover:text-green-600 transition-colors"
            aria-label="Copy link"
          >
            <FaLink />
          </button>
          <button
            onClick={() => {
              const embedCode = `<iframe src="${window.location.origin}/embed/${content.type}/${content.id}" width="100%" height="300" frameborder="0"></iframe>`;
              navigator.clipboard.writeText(embedCode);
              trackShare(content.type, content.id, 'embed');
              showToast('Embed code copied to clipboard!', 'success');
            }}
            className="text-gray-500 hover:text-purple-600 transition-colors"
            aria-label="Get embed code"
          >
            <FaShare />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
