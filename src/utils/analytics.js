// Analytics utility for tracking user interactions
export const trackEvent = (eventName, properties = {}) => {
  try {
    // Check if analytics is available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

// Specific share event tracking
export const trackShare = (contentType, contentId, platform) => {
  trackEvent('share_content', {
    content_type: contentType,
    content_id: contentId,
    share_platform: platform,
  });
};