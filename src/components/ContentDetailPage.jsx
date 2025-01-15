import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';
import ContentCard from './common/ContentCard';
import { useToast } from '../contexts/ToastContext';

const ContentDetailPage = () => {
  const { contentType, contentId } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedContent, setRelatedContent] = useState([]);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Reset states when starting a new fetch
        setContent(null);
        setError(null);
        setRelatedContent([]);
        setLoading(true);

        // Validate content type and ID
        // Map URL parameter to database table name and content type
        const contentTypeMap = {
          'false_friends': { table: 'false_friends', type: 'false_friend' },
          'false_friend': { table: 'false_friends', type: 'false_friend' },
          'untranslatable_words': { table: 'untranslatable_words', type: 'untranslatable_words' },
          'untranslatable': { table: 'untranslatable_words', type: 'untranslatable_words' },
          'wisdom-concepts': { table: 'wisdom_concepts', type: 'wisdom_concept' },
          'wisdom_concept': { table: 'wisdom_concepts', type: 'wisdom_concept' },
          'myths-legends': { table: 'myths_legends', type: 'myth_legend' },
          'myths_legends': { table: 'myths_legends', type: 'myth_legend' },
          'myth-legend': { table: 'myths_legends', type: 'myth_legend' },
          'myth_legend': { table: 'myths_legends', type: 'myth_legend' },
          'slangs': { table: 'slangs', type: 'slang' },
          'slang': { table: 'slangs', type: 'slang' },
          'idioms': { table: 'idioms', type: 'idiom' },
          'idiom': { table: 'idioms', type: 'idiom' },
          'proverbs': { table: 'proverbs', type: 'proverb' },
          'proverb': { table: 'proverbs', type: 'proverb' },
          'riddle': { table: 'riddles', type: 'riddle' },
          'riddles': { table: 'riddles', type: 'riddle' }
        };

        const mapping = contentTypeMap[contentType];

        if (!mapping) {
          throw new Error(`Invalid content type: ${contentType}`);
        }

        const dbTableName = mapping.table;
        const normalizedContentType = mapping.type;


        // Fetch content directly
        const { data, error } = await supabase
          .from(dbTableName)
          .select('*, languages(*)')
          .eq('id', contentId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        // Map content fields based on content type
        const mappedContent = {
          id: data.id,
          original: (() => {
            if (dbTableName === 'untranslatable_words') return data.word;
            if (dbTableName === 'false_friends') return data.word;
            if (dbTableName === 'myths_legends') return data.title;
            return data.original || data.text || data.expression;
          })(),
          english_translation: (() => {
            if (dbTableName === 'untranslatable_words') return data.meaning;
            if (dbTableName === 'false_friends') return data.meaning;
            if (dbTableName === 'myths_legends') return data.summary;
            return data.english_translation || data.translation;
          })(),
          example: (() => {
            if (dbTableName === 'myths_legends') return data.moral_lesson || '';
            return data.examples || data.example || data.usage_examples || '';
          })(),
          usage_context: (() => {
            if (dbTableName === 'myths_legends') return data.cultural_significance || '';
            return data.cultural_notes || data.usage_context || data.context || '';
          })(),
          languages: data.languages || { name: 'Unknown Language', code: 'unknown' },
          type: normalizedContentType,
          language_id: data.language_id
        };
        setContent(mappedContent);

        if (!data) {
          throw new Error(`No content found for ${contentType} with ID ${contentId}`);
        }

        // Fetch related content from the same language and type
        const { data: related, error: relatedError } = await supabase
          .from(dbTableName)
          .select('*, languages(*)')
          .eq('language_id', data.language_id)
          .neq('id', contentId)
          .limit(4);

        if (relatedError) throw relatedError;
        
        // Map related content fields
        const mappedRelated = (related || []).map(item => ({
          id: item.id,
          original: (() => {
            if (dbTableName === 'untranslatable_words') return item.word;
            if (dbTableName === 'false_friends') return item.word;
            if (dbTableName === 'myths_legends') return item.title;
            return item.original || item.text || item.expression;
          })(),
          english_translation: (() => {
            if (dbTableName === 'untranslatable_words') return item.meaning;
            if (dbTableName === 'false_friends') return item.meaning;
            if (dbTableName === 'myths_legends') return item.summary;
            return item.english_translation || item.translation;
          })(),
          example: item.examples || item.example || item.usage_examples || item.moral_lesson || '',
          usage_context: item.cultural_notes || item.usage_context || item.context || item.cultural_significance || '',
          languages: item.languages || { name: 'Unknown Language', code: 'unknown' },
          type: normalizedContentType,
          language_id: item.language_id
        }));
        
        setRelatedContent(mappedRelated);
      } catch (error) {
        console.error('Error fetching content:', error.message);
        setError(error.message);
        showToast(`Failed to load ${contentType} content: ${error.message}`, 'error');
        // Don't navigate away, let user see the error state
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentType, contentId, navigate, showToast]);

  // Render Helmet meta tags when content is available
  const renderHelmetTags = () => {
    if (!content) return null;
     
     const contentTypeImages = {
      'idiom': '/og-images/og-idiom.png',
      'proverb': '/og-images/og-proverb.png',
       'slang': '/og-images/og-wisdom.png',
       'false_friend': '/og-images/og-wisdom.png',
      'untranslatable_words': '/og-images/og-untranslatable.png',
      'myth_legend': '/og-images/og-myth.png',
      'wisdom_concept': '/og-images/og-wisdom.png',
       'riddle': '/og-images/og-wisdom.png',
      'default': '/og-images/og-wisdom.png'
    };
     const imageUrl = contentTypeImages[content.type] || contentTypeImages['default'];
     const fullImageUrl = imageUrl.startsWith('http') 
       ? imageUrl 
        : `https://sayingly.app${imageUrl}`;

    return (
      <Helmet>
        <title>{`${content.original} | Sayingly`}</title>
         <meta property="og:title" content={`${content.original} | Sayingly`} />
         <meta 
           property="og:description" 
           content={
              content.english_translation && content.english_translation.length > 10
                ? `${content.original}: ${content.english_translation}`
                : `Discover the meaning of "${content.original}" on Sayingly - Explore global wisdom, language, and cultural insights.`
           } 
         />
        <meta property="og:url" content={window.location.href} />
          <meta property="og:image" content={fullImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:alt" content={`${content.original} - Sayingly`} />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
         <meta property="og:image:secure_url" content={fullImageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="Sayingly" />
        
        {/* Additional platform-specific meta tags */}
        <meta property="og:site_name" content="Sayingly" />
        <meta property="og:locale" content="en_US" />
        
        
        <meta name="twitter:title" content={content.original} />
        <meta name="twitter:description" content={content.english_translation} />
         <meta name="twitter:image" content={fullImageUrl} />
        <meta name="twitter:image:alt" content={`${content.original} - Sayingly`} />
        <meta name="twitter:site" content="@sayingly_app" />
        <meta name="twitter:creator" content="@sayingly_app" />
        <meta name="twitter:url" content={window.location.href} />
        
        <meta name="twitter:card" content="summary_large_image" />
        
        {/* WhatsApp specific meta tags */}
        <meta property="og:type" content="article" />
      </Helmet>
    );
  };

  // Remove the extra code block that was causing syntax errors
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Content</h2>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {renderHelmetTags()}
      <div className="max-w-2xl mx-auto">
        {content && (
          <ContentCard content={content} expanded={true} />
        )}

        {/* Related Content Section */}
        {relatedContent.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              More from {content.languages.name}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {relatedContent.map(item => (
                <ContentCard key={item.id} content={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentDetailPage;