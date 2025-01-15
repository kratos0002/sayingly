import React from 'react';
import { FaGlobe, FaShare, FaLink, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { FaWhatsapp, FaTelegram, FaInstagram } from 'react-icons/fa';
import { useToast } from '../../contexts/ToastContext';
import { useBookmarks } from '../../contexts/BookmarkContext';
import { useNavigate } from 'react-router-dom';
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
     language: { name: 'Unknown', code: 'unknown' },
    type: 'content', // idiom, proverb, untranslatable, etc.
  },
  expanded = false,
  customContent = null,
}) => {
  const { showToast } = useToast();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const navigate = useNavigate();
  const { user } = useAuth();
  const bookmarked = isBookmarked(content.type, content.id);
  const [isExpanded, setIsExpanded] = React.useState(expanded);

  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 transition-all duration-300">
      {/* Language Badge */}
      <div className="flex justify-between items-center mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <FaGlobe className="mr-2" />
          {(() => {
            if (typeof content.language === 'object') {
               return content.language.name || content.language.name_en || content.language.code || 'Unknown Language';
            }
            if (typeof content.language === 'string') {
              return content.language;
            }
            return content.languages?.name || content.languages?.code || 'Unknown Language';
          })()}
        </span>
        <span className="text-sm font-medium text-gray-500 capitalize">
          {content.type}
        </span>
      </div>

      {/* Original Text */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        <button 
          onClick={() => navigate(`/content/${content.type}/${content.id}`)}
          className="text-left w-full hover:text-blue-600 transition-colors"
        >
          {content.original}
        </button>
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
        
        <div className="flex gap-3 items-center relative">
          {/* New Share Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const shareOptions = [
                {
                  name: 'WhatsApp',
                  icon: 'fab fa-whatsapp',
                  action: () => {
                    const shareUrl = `${window.location.origin}/content/${content.type}/${content.id}`;
                    const shareText = `${content.original} - ${content.english_translation}\n\nLearn more at Sayingly`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
                    trackShare(content.type, content.id, 'whatsapp');
                  }
                },
                {
                  name: 'Telegram',
                  icon: 'fab fa-telegram',
                  action: () => {
                    const shareUrl = `${window.location.origin}/content/${content.type}/${content.id}`;
                    const shareText = `${content.original} - ${content.english_translation}\n\nLearn more at Sayingly`;
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
                    trackShare(content.type, content.id, 'telegram');
                  }
                },
                {
                  name: 'Instagram',
                  icon: 'fab fa-instagram',
                  action: () => {
                    const shareUrl = `${window.location.origin}/content/${content.type}/${content.id}`;
                    const shareText = `${content.original} - ${content.english_translation}\n\nLearn more at Sayingly`;
                    // Instagram doesn't have a direct share API, so we'll copy the text
                    navigator.clipboard.writeText(shareText + '\n\n' + shareUrl);
                    showToast('Instagram share text copied to clipboard. Open Instagram to paste.', 'info');
                    trackShare(content.type, content.id, 'instagram');
                  }
                },
                {
                  name: 'Copy Link',
                  icon: 'fas fa-link',
                  action: () => {
                    const shareUrl = `${window.location.origin}/content/${content.type}/${content.id}`;
                    navigator.clipboard.writeText(shareUrl);
                    trackShare(content.type, content.id, 'copy_link');
                    showToast('Shareable link copied to clipboard!', 'success');
                  }
                }
              ];

              // Create a modal or dropdown for share options
              const shareModal = document.createElement('div');
              shareModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
              shareModal.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-sm w-full">
                  <h2 class="text-xl font-bold mb-4 text-center">Share Content</h2>
                  <div class="space-y-3">
                    ${shareOptions.map(option => `
                      <button 
                        class="w-full py-2 px-4 text-left hover:bg-gray-100 flex items-center rounded-md"
                        onclick="(${option.action})()"
                      >
                        <i class="${option.icon} mr-3"></i>
                        ${option.name}
                      </button>
                    `).join('')}
                    <button 
                      class="w-full py-2 px-4 text-center text-red-500 hover:bg-gray-100 rounded-md"
                      onclick="this.closest('.fixed').remove()"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              `;
              document.body.appendChild(shareModal);
              
              // Close modal when clicking outside
              shareModal.addEventListener('click', (e) => {
                if (e.target === shareModal) {
                  shareModal.remove();
                }
              });
            }}
            className="text-gray-500 hover:text-blue-600 transition-colors"
            aria-label="Share options"
          >
            <FaShare />
          </button>

          <button
            onClick={() => {
              if (!user) {
                showToast('Please sign in to bookmark content', 'error');
                // Optionally, you could trigger a login modal or redirect here
                return;
              }
              toggleBookmark(content.type, content.id);
            }}
            className={`transition-colors ${
              user && bookmarked 
                ? 'text-blue-600 hover:text-blue-800' 
                : 'text-gray-500 hover:text-blue-600'
            }`}
            aria-label={user && bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {user && bookmarked ? <FaBookmark /> : <FaRegBookmark />}
          </button>
          <button
            onClick={() => {
              const shareUrl = `${window.location.origin}/content/${content.type}/${content.id}`;
              navigator.clipboard.writeText(shareUrl);
              trackShare(content.type, content.id, 'copy_link');
              showToast('Shareable link copied to clipboard!', 'success');
            }}
            className="text-gray-500 hover:text-green-600 transition-colors"
            aria-label="Copy link"
          >
            <FaLink />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;