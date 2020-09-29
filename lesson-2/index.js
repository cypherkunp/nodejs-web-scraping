const request = require('request-promise');
const cheerio = require('cheerio');

const URL = 'https://reactnativetutorial.net/css-selectors/lesson2.html';

async function main() {
  const html = await request.get(URL);
  const $ = await cheerio.load(html);
  $('h2').each((index, element) => {
    console.log($(element).text());
  });
}

main();
