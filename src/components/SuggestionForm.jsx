import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const SuggestionForm = () => {
  const [category, setCategory] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [language, setLanguage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Please sign in to submit a suggestion', 'error');
      return;
    }

    if (!category || !suggestion || !language) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('suggestions')
        .insert({
          user_id: user.id,
          category,
          suggestion,
          language,
          status: 'pending'
        });

      if (error) {
        console.error('Supabase Insert Error:', error);
        throw new Error(error.message || 'Failed to submit suggestion');
      }

      showToast('Suggestion submitted successfully!', 'success');
      
      // Reset form
      setCategory('');
      setSuggestion('');
      setLanguage('');
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      showToast(`Error submitting suggestion: ${errorMessage}`, 'error');
      console.error('Suggestion submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Idioms', 
    'Proverbs', 
    'Untranslatables', 
    'Slang', 
    'Riddles', 
    'Wisdom Concepts', 
    'Myths & Legends', 
     'False Friends',
     'Feature Request'
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mt-8 max-w-xl mx-auto">
      <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">
        Help Expand Our Wisdom Collection 🌍 <span className={category === 'Feature Request' ? 'text-blue-600 font-bold' : 'hidden'}>✨ Feature Request Mode</span>
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            required
          >
            <option value="">Select a Category</option>
            {categories.map((cat) => (
               <option 
                 key={cat} 
                 value={cat} 
                 className={cat === 'Feature Request' ? 'text-blue-600 font-bold bg-blue-50' : ''}
               >{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <input
            type="text"
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Enter language (e.g., Spanish, Mandarin)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            required
          />
        </div>

        <div>
          <label htmlFor="suggestion" className="block text-sm font-medium text-gray-700 mb-1">
            Your Suggestion
          </label>
          <textarea
            id="suggestion"
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="Share your wisdom..."
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg transition-colors duration-300 disabled:opacity-50 ${
            category === 'Feature Request' 
              ? 'bg-blue-700 text-white hover:bg-blue-800' 
              : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
        </button>
      </form>
    </div>
  );
};

export default SuggestionForm;