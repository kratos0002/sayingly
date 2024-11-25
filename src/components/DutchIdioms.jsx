import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '../lib/supabase';

const DutchIdioms = () => {
  const [languages, setLanguages] = useState([]);
  const [idioms, setIdioms] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('nl');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      fetchIdioms(selectedLanguage);
    }
  }, [selectedLanguage]);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name');

      if (error) throw error;
      setLanguages(data);
    } catch (error) {
      console.error('Error fetching languages:', error);
      setError(error.message);
    }
  };

  const fetchIdioms = async (languageCode) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('idioms')
        .select(`
          *,
          languages:language_id(name)
        `)
        .eq('languages.code', languageCode)
        .order('popularity_rank')
        .limit(10);

      if (error) throw error;
      setIdioms(data);
    } catch (error) {
      console.error('Error fetching idioms:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Popular Idioms Explorer</CardTitle>
          <div className="w-[240px]">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading idioms...</div>
          ) : error ? (
            <div className="text-red-500 py-4">{error}</div>
          ) : (
            <div className="space-y-6">
              {idioms.map((idiom, index) => (
                <Card key={idiom.id} className="bg-white">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-blue-600">{idiom.original}</h3>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-mono">🔊</span>
                            <span className="font-mono">{idiom.pronunciation}</span>
                          </div>
                        </div>
                        <span className="text-lg font-medium text-gray-700">#{index + 1}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-gray-800">
                          <span className="font-semibold">English:</span> {idiom.english_translation}
                        </p>
                        <p className="text-gray-800">
                          <span className="font-semibold">Meaning:</span> {idiom.meaning}
                        </p>
                        <p className="text-gray-800">
                          <span className="font-semibold">Usage:</span> {idiom.usage_context}
                        </p>
                        <p className="text-gray-700 italic bg-gray-50 p-2 rounded">
                          <span className="font-semibold">Example:</span> {idiom.example}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DutchIdioms;