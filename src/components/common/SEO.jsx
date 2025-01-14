import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ 
  title = 'Sayingly - Discover the World\'s Wisdom',
  description = 'Explore idioms, proverbs, and untranslatable words from cultures around the world.',
  image = '', // Default OG image URL
  url = '',
  type = 'website',
  contentType = '',
  content = null
}) => {
  // If we have specific content, create custom meta tags
  const contentMeta = content ? {
    title: `${content.original} - ${content.english_translation} | Sayingly`,
    description: content.usage_context || `Learn the meaning of "${content.original}" in ${content.language.name}`,
    type: 'article',
  } : {};

  const meta = {
    title: contentMeta.title || title,
    description: contentMeta.description || description,
    type: contentMeta.type || type,
    url: url || typeof window !== 'undefined' ? window.location.href : '',
    image: image || 'https://sayingly.me/og-image.png', // Add your default OG image
  };

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={meta.type} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={meta.url} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />

      {/* Additional meta for content pages */}
      {contentType && (
        <>
          <meta property="og:article:section" content={contentType} />
          <meta property="og:locale" content="en_US" />
        </>
      )}
    </Helmet>
  );
};

export default SEO;