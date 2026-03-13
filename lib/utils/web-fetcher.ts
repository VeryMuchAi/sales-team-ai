import * as cheerio from 'cheerio';

export interface WebContent {
  title: string;
  description: string;
  content: string;
  error?: string;
}

export async function fetchWebsiteContent(url: string): Promise<WebContent> {
  try {
    // Ensure URL has protocol
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SalesTeamAI/1.0)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script and style tags
    $('script, style, nav, footer, iframe').remove();

    // Extract metadata
    const title = $('title').text().trim() || 
                  $('meta[property="og:title"]').attr('content') || 
                  $('h1').first().text().trim() || 
                  'No title found';

    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       $('p').first().text().trim().substring(0, 200) || 
                       '';

    // Extract main content
    let content = '';
    
    // Try to find main content containers
    const mainSelectors = [
      'main',
      'article',
      '[role="main"]',
      '.main-content',
      '#main-content',
      '.content',
      'body',
    ];

    for (const selector of mainSelectors) {
      const element = $(selector).first();
      if (element.length) {
        content = element.text();
        break;
      }
    }

    // Clean up content
    content = content
      .replace(/\s+/g, ' ') // Replace multiple spaces
      .replace(/\n+/g, '\n') // Replace multiple newlines
      .trim()
      .substring(0, 8000); // Limit to ~8k chars to keep context manageable

    return {
      title,
      description,
      content: content || 'Unable to extract meaningful content from website.',
    };
  } catch (error: any) {
    console.error('Web fetch error:', error);
    
    let errorMessage = 'Failed to fetch website content.';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Website request timed out.';
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Unable to reach website. It may be down or blocking automated requests.';
    }

    return {
      title: 'Error',
      description: '',
      content: '',
      error: errorMessage,
    };
  }
}
