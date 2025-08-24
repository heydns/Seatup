import { useState, useEffect } from 'react';
import { ExternalLink, Clock, Rss } from 'lucide-react';
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

      const { data, error } = await supabase.functions.invoke('fetch-news', {
        body: { query }
      });

      if (error) throw error;

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
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Il y a quelques minutes';
      if (diffInHours < 24) return `Il y a ${diffInHours}h`;
      if (diffInHours < 48) return 'Hier';
      
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
    } catch {
      return 'Récemment';
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
          <div className="space-y-4">
            {news.map((item, index) => (
              <div 
                key={index} 
                className="group pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.source}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(item.pubDate)}
                  </div>
                </div>
                
                <h4 className="font-medium text-sm leading-tight mb-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                
                {item.description && (
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
                
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Lire la suite
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
            
            <div className="pt-2">
              <Button 
                onClick={fetchNews} 
                variant="sport" 
                size="sm" 
                className="w-full"
              >
                Actualiser
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};