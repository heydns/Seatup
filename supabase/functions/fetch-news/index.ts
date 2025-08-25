
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

    // Use Google News RSS feed with the provided query
    const encodedQuery = encodeURIComponent(query);
    const googleNewsUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=fr&gl=FR&ceid=FR:fr`;

    try {
      console.log(`Fetching from Google News: ${googleNewsUrl}`);
      
      const response = await fetch(googleNewsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlText = await response.text();
      console.log(`Received XML length: ${xmlText.length}`);
      
      // Parse RSS XML
      const items = parseRSS(xmlText);
      
      console.log(`Parsed ${items.length} articles from Google News`);

      // Sort by date (most recent first) and limit to 5
      items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      const limitedNews = items.slice(0, 5);

      console.log(`Returning ${limitedNews.length} articles`);

      return new Response(
        JSON.stringify({ news: limitedNews }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      console.error('Error fetching from Google News:', error);
      throw error;
    }

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

function parseRSS(xmlText: string): NewsItem[] {
  const items: NewsItem[] = [];
  
  try {
    // Find all <item> elements in the RSS feed
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;
    
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = match[1];
      
      // Extract title - handle both regular title and encoded content
      let title = extractXMLContent(itemXml, 'title');
      
      // Extract link - try to get original URL from description first
      let link = extractXMLContent(itemXml, 'link');
      
      // Try to extract the original article URL from the description
      const descriptionContent = extractXMLContent(itemXml, 'description');
      if (descriptionContent) {
        // Look for URL patterns in the description that aren't Google News redirects
        const urlMatch = descriptionContent.match(/https?:\/\/[^\s"<>]+/);
        if (urlMatch && !urlMatch[0].includes('news.google.com')) {
          link = urlMatch[0];
        }
      }
      
      // Extract publication date
      let pubDate = extractXMLContent(itemXml, 'pubDate');
      
      // Extract description (use the same content we got earlier)
      let description = descriptionContent;
      if (!description) {
        description = extractXMLContent(itemXml, 'content:encoded');
      }
      
      console.log(`Extracted - Title: "${title}", Link: "${link.substring(0, 50)}..."`);
      
      // Only add items that have both title and link
      if (title && title.trim().length > 0 && link && link.trim().length > 0) {
        const cleanTitle = cleanText(title);
        const cleanDescription = cleanText(description);
        const cleanLink = cleanText(link);
        
        // Ensure we have a valid date
        let validPubDate = pubDate;
        if (!validPubDate || validPubDate.trim().length === 0) {
          validPubDate = new Date().toISOString();
        }
        
        items.push({
          title: cleanTitle,
          link: cleanLink,
          pubDate: validPubDate,
          description: cleanDescription ? cleanDescription.substring(0, 150) + '...' : 'Cliquez pour lire l\'article complet',
          source: 'Google News'
        });
        
        console.log(`Added article: "${cleanTitle.substring(0, 50)}..."`);
      } else {
        console.log(`Skipped article - missing title or link`);
      }
    }
  } catch (error) {
    console.error('Error parsing RSS:', error);
  }
  
  console.log(`Successfully parsed ${items.length} items`);
  return items;
}

function extractXMLContent(xml: string, tag: string): string {
  // Try different patterns to extract content
  const patterns = [
    new RegExp(`<${tag}[^>]*><\\!\\[CDATA\\[(.*?)\\]\\]><\\/${tag}>`, 'is'),
    new RegExp(`<${tag}[^>]*>(.*?)<\\/${tag}>`, 'is'),
    new RegExp(`<${tag}[^>]*><\\!\\[CDATA\\[(.*?)\\]\\]>`, 'is')
  ];
  
  for (const pattern of patterns) {
    const match = xml.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
}

function cleanText(text: string): string {
  if (!text) return '';
  
  // Remove HTML tags and decode HTML entities
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
