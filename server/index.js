const express = require('express');
const app = express();

const RSSCombiner = require('rss-combiner');
const xml2js = require('xml2js');

const feedConfig = {
  title: 'Fake News',
  softFail: true,
  size: 2000,
  feeds: [
    "https://weeklyworldnews.com/feed/",
    "https://www.thepoke.co.uk/feed/",
    "https://newsthump.com/feed/",
    "https://waterfordwhispersnews.com/feed/",
    "http://www.thecivilian.co.nz/feed/",
	"https://www.clickhole.com/rss",
	"http://nationalreport.net/feed/",
	"https://newspunch.com/feed/",
	"https://now8news.com/feed/",
	"https://babylonbee.com/feed",
	"https://www.thebeaverton.com/feed/",
	"https://www.theonion.com/rss",
	"https://worldnewsdailyreport.com/feed/",
	"https://worldtruth.tv/feed/"
  ],
  pubDate: new Date(),
};

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Content-Type", "application/rss+xml");
	res.header('Cache-Control', 'public, smax-age=600, max-age=600');
	next();
});

app.get('/rss/json', (req, res, next) => {
  RSSCombiner(feedConfig).then((combinedFeed) => {
	  let xml = combinedFeed.xml();
	  let parser = xml2js.Parser();
	  parser.parseString(xml, (err, result) => {
		  res.send(result);
	});
  });
});

app.get('/rss', (req, res, next) => {
    RSSCombiner(feedConfig).then((combinedFeed) => {
	  let xml = combinedFeed.xml();
	  res.send(xml);
  });
});

app.get('/', (req, res, next) => {
	res.send("AI Helper :D");
});

module.exports = app;
