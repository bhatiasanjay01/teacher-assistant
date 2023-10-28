import * as cheerio from 'cheerio';
import * as phantom from 'phantom';

export const handler = async (event) => {
  console.log('----- event:', event);

  // eslint-disable-next-line @typescript-eslint/quotes
  const { urls } = JSON.parse(event.body.replaceAll("'", '"'));
  const scrapedData = await scrapeAllUrls(urls);
  return scrapedData;
};

async function scrapeAllUrls(urls) {
  const scrapePromises = urls.map((url) => scrapeUrl(url));
  const scrapedData = await Promise.all(scrapePromises);
  return scrapedData.filter((result) => result !== null);
}

// Function to scrape text and title from a single URL
async function scrapeUrl(url) {
  try {
    const instance = await phantom.create(['--ignore-ssl-errors=true', '--ssl-protocol=any']);
    const page = await instance.createPage();

    page.property('customHeaders', {
      'Content-Language': 'en-US',
      'User-Agent': 'PostmanRuntime/7.33.0',
    });
    await page.on('onResourceRequested', function (requestData) {
      console.info('Requesting', requestData.url);
    });

    const status = await page.open(url);
    const content = await page.property('content');

    console.log('---status:', status);
    console.log(content);

    await instance.exit();

    const html = content;

    const $ = cheerio.load(html);
    $('script, style').remove();
    const paragraphs = $('p')
      .map(function () {
        return $(this).text().length > 30 ? $(this).text() : null;
      })
      .get();
    const text = paragraphs.join('');
    const title = $('title').text();
    return { url, text, title };
  } catch (error) {
    console.log('----- error:', error);
    return null;
  }
}
