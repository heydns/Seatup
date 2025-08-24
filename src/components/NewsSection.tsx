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
      <Card className="h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Rss className="h-5 w-5 text-primary" />
            Actualités
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Rss className="h-5 w-5 text-primary" />
            Actualités
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchNews} variant="sport" size="sm">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Rss className="h-5 w-5 text-primary" />
          Actualités
        </CardTitle>
      </CardHeader>
      <CardContent>
        {news.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Aucune actualité trouvée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(() => {
              console.log('Rendering', news.length, 'news items');
              return news.slice(0, 5).map((item, index) => (
              <article 
                key={index} 
                className="group pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {item.source}
                  </Badge>
                  <time className="text-xs text-muted-foreground font-medium">
                    {formatDate(item.pubDate)}
                  </time>
                </div>
                
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group-hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
                >
                  <h4 className="font-medium text-sm leading-snug text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {item.title}
                  </h4>
                  
                  {item.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {item.description.replace('...', '')}
                    </p>
                  )}
                </a>
              </article>
              ))
            })()}
            
            <div className="pt-2 mt-3 border-t border-gray-100">
              <Button 
                onClick={fetchNews} 
                variant="sport" 
                size="sm" 
                className="w-full h-8 text-xs"
              >
                Actualiser les news
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};