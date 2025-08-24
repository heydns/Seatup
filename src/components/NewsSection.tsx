import { useState, useEffect } from 'react';
import { ExternalLink, Rss } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

interface NewsSectionProps {
  query: string;
}

export const NewsSection = ({ query }: NewsSectionProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, [query]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching news for:', query);

      const { data, error } = await supabase.functions.invoke('fetch-news', {
        body: { query }
      });

      if (error) throw error;

      console.log('News data received:', data);
      setNews(data.news || []);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Impossible de charger les actualités');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return new Date().toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
            <Rss className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Actualités</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-50 rounded-xl p-4">
              <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
            <Rss className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Actualités</h3>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchNews} variant="sport" size="sm">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
          <Rss className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Actualités</h3>
      </div>
      <div>
        {news.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-gray-600">Aucune actualité trouvée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(() => {
              console.log('Rendering', news.length, 'news items');
              return news.slice(0, 5).map((item, index) => (
              <article 
                key={index} 
                className="group bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200"
              >
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-2 leading-snug">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-3 w-3 text-primary opacity-60" />
                        <span className="text-xs text-gray-500 font-medium">Lire l'article</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <time className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">
                        {formatDate(item.pubDate)}
                      </time>
                    </div>
                  </div>
                </a>
              </article>
              ))
            })()}
            
            <div className="pt-2">
              <Button 
                onClick={fetchNews} 
                variant="sport" 
                size="sm" 
                className="w-full bg-gray-50 text-gray-700 border border-gray-200 hover:bg-primary hover:text-white transition-colors duration-200"
              >
                <Rss className="h-3 w-3 mr-2" />
                Actualiser les actualités
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};