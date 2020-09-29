const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const URL = 'https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof';

async function scrapeListings(page) {
  await page.goto(URL);

  const html = await page.content();
  const $ = cheerio.load(html);

  const listings = $('.result-info')
    .map((index, element) => {
      const titleElement = $(element).find('.result-title');
      const dateTimeElement = $(element).find('.result-date');
      const jobLocationElement = $(element).find('.result-hood');

      const title = $(titleElement).text();
      const url = $(titleElement).attr('href');
      const datePosted = $(dateTimeElement).attr('datetime');
      const jobLocation =
        $(jobLocationElement).text().trim().replace('(', '').replace(')', '') || 'NA';

      return { title, url, datePosted, jobLocation };
    })
    .get();

  return listings;
}

async function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function scrapeJobDescriptions(listings, page) {
  // forEach doesn't work with puppeteer

  for (let index = 0; index < listings.length; index++) {
    await page.goto(listings[index].url);
    const html = await page.content();
    const $ = cheerio.load(html);
    const jobDescription = $('#postingbody').text().trim();
    const compensation = $('p.attrgroup > span:nth-child(1) > b').text().trim();
    const employmentType = $('p.attrgroup > span:nth-child(3) > b').text();

    listings[index].jobDescription = jobDescription;
    listings[index].compensation = compensation;
    listings[index].employmentType = employmentType;

    console.log(listings[index]);

    await sleep(500); // 1 sec sleep
  }
  return listings;
}

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const listings = await scrapeListings(page);
  const listingsWithJobDescription = await scrapeJobDescriptions(listings, page);
  console.log(listingsWithJobDescription);

  browser.close();
}
main();
