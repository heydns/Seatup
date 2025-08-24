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
        <div className="pb-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Rss className="h-5 w-5 text-primary" />
            Actualités
          </h3>
        </div>
        <div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="pb-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Rss className="h-5 w-5 text-primary" />
            Actualités
          </h3>
        </div>
        <div>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchNews} variant="sport" size="sm">
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="pb-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Rss className="h-5 w-5 text-primary" />
          Actualités
        </h3>
      </div>
      <div>
        {news.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Aucune actualité trouvée</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(() => {
              console.log('Rendering', news.length, 'news items');
              return news.slice(0, 5).map((item, index) => (
              <article 
                key={index} 
                className="group pb-2 border-b border-gray-100 last:border-b-0 last:pb-0"
              >
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group-hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-medium text-sm leading-snug text-gray-900 group-hover:text-primary transition-colors line-clamp-2 flex-1">
                      {item.title}
                    </h4>
                    <time className="text-xs text-muted-foreground font-medium flex-shrink-0">
                      {formatDate(item.pubDate)}
                    </time>
                  </div>
                </a>
              </article>
              ))
            })()}
          </div>
        )}
      </div>
    </div>
  );
};