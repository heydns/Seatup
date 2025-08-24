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

  // Auto refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNews();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
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
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const articleDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (articleDate.getTime() === today.getTime()) {
        return 'aujourd\'hui';
      } else if (articleDate.getTime() === yesterday.getTime()) {
        return 'hier';
      } else {
        return date.toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'long'
        });
      }
    } catch {
      return 'aujourd\'hui';
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
          <div className="space-y-1">
            {(() => {
              console.log('Rendering', news.length, 'news items');
              return news.slice(0, 5).map((item, index) => (
              <article 
                key={index} 
                className="group py-3 px-2 hover:bg-gray-50 rounded-lg transition-all duration-200 border-b border-gray-100 last:border-b-0"
              >
                <a 
                  href={`https://news.google.com/search?q=${encodeURIComponent(item.title)}&hl=fr&gl=FR&ceid=FR%3Afr`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 group-hover:text-primary transition-colors duration-200 line-clamp-1 leading-relaxed">
                        {item.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <time className="text-xs text-gray-500">
                        {formatDate(item.pubDate)}
                      </time>
                      <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </a>
              </article>
              ))
            })()}
            
            <div className="pt-3 mt-2 border-t border-gray-200">
              <Button 
                asChild
                variant="ghost" 
                size="sm" 
                className="w-full text-xs text-gray-600 hover:text-primary hover:bg-gray-50"
              >
                <a 
                  href="https://news.google.com/search?q=PSG&hl=fr&gl=FR&ceid=FR%3Afr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Toutes les actualités
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};