import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import EmbedCard from './EmbedCard';
import SEO from '../common/SEO';

const EmbedPage = () => {
  const { type, id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Remove 's' from type if it exists (idioms -> idiom)
        const tableName = type.endsWith('s') ? type : `${type}s`;
        
        const { data, error: fetchError } = await supabase
          .from(tableName)
          .select(`
            *,
            languages (
              name,
              code
            )
          `)
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Content not found');

        setContent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [type, id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      <SEO 
        content={content}
        contentType={type}
      />
      <EmbedCard 
        content={{
          ...content,
          type: type.endsWith('s') ? type.slice(0, -1) : type
        }}
      />
    </div>
  );
};

export default EmbedPage;
