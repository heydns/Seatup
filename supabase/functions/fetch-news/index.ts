import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching news for query: ${query}`);

    // Fetch news from Google News RSS
    const newsSources = [
      {
        name: 'Google News France',
        url: `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fr&gl=FR&ceid=FR:fr`,
        source: 'Google News'
      },
      {
        name: 'Google News Sports',
        url: `https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtWnlHZ0pHVWlnQVAB?hl=fr&gl=FR&ceid=FR:fr`,
        source: 'Google News Sports'
      },
      {
        name: 'L\'Équipe Football',
        url: `https://dwh.lequipe.fr/api/edito/rss?path=/Football/`,
        source: 'L\'Équipe'
      }
    ];

    const allNews: NewsItem[] = [];

    for (const source of newsSources) {
      try {
        console.log(`Fetching from ${source.name}: ${source.url}`);
        
        const response = await fetch(source.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
          }
        });
        if (!response.ok) {
          console.warn(`Failed to fetch from ${source.name}: ${response.status}`);
          continue;
        }
        
        const xmlText = await response.text();
        
        // Parse RSS XML
        const items = parseRSS(xmlText, source.source, query.toLowerCase());
        allNews.push(...items);
        
        console.log(`Found ${items.length} relevant articles from ${source.name}`);
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
      }
    }

    // Sort by date (most recent first)
    allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // If no news found from RSS, create some mock news as fallback
    if (allNews.length === 0) {
      console.log('No news found from RSS sources, creating fallback content');
      const fallbackNews: NewsItem[] = [
        {
          title: `Actualités ${query} - Informations récentes`,
          link: `https://www.google.com/search?q=${encodeURIComponent(query + ' actualités')}`,
          pubDate: new Date().toISOString(),
          description: `Recherchez les dernières actualités concernant ${query} sur Google.`,
          source: 'Recherche'
        },
        {
          title: `${query} - Site officiel`,
          link: 'https://www.psg.fr/actualites',
          pubDate: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          description: 'Consultez le site officiel pour les dernières informations.',
          source: 'Site officiel'
        }
      ];
      allNews.push(...fallbackNews);
    }

    // Limit to 5 most recent articles
    const limitedNews = allNews.slice(0, 5);

    console.log(`Returning ${limitedNews.length} articles`);

    return new Response(
      JSON.stringify({ news: limitedNews }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching news:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function parseRSS(xmlText: string, source: string, query: string): NewsItem[] {
  const items: NewsItem[] = [];
  
  try {
    // Simple XML parsing for RSS items
    const itemMatches = xmlText.match(/<item[^>]*>([\s\S]*?)<\/item>/gi);
    
    if (!itemMatches) {
      console.log(`No items found in RSS from ${source}`);
      return items;
    }

    for (const itemMatch of itemMatches) {
      try {
        const title = extractXMLContent(itemMatch, 'title');
        const link = extractXMLContent(itemMatch, 'link');
        const pubDate = extractXMLContent(itemMatch, 'pubDate');
        const description = extractXMLContent(itemMatch, 'description');

        // For Google News, be more lenient with filtering since the search is already targeted
        const titleLower = title.toLowerCase();
        const descriptionLower = description.toLowerCase();
        const queryLower = query.toLowerCase();
        
        // Include more results for Google News since they're already filtered by search
        const isGoogleNews = source.includes('Google News');
        const matchesQuery = isGoogleNews || 
          titleLower.includes(queryLower) || 
          descriptionLower.includes(queryLower) ||
          titleLower.includes('psg') || 
          titleLower.includes('paris saint-germain') ||
          titleLower.includes('paris saint germain');
        
        if (matchesQuery) {
          items.push({
            title: cleanText(title),
            link: cleanText(link),
            pubDate: pubDate || new Date().toISOString(),
            description: cleanText(description).substring(0, 200) + '...',
            source
          });
        }
      } catch (error) {
        console.error('Error parsing RSS item:', error);
      }
    }
  } catch (error) {
    console.error(`Error parsing RSS from ${source}:`, error);
  }
  
  return items;
}

function extractXMLContent(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function cleanText(text: string): string {
  // Remove HTML tags and decode HTML entities
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}