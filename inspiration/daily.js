let Parser = require('rss-parser');
let parser = new Parser();

const feeds = [
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
    "https://worldtruth.tv/feed/",
    "https://www.thedailymash.co.uk/news/feed",
    "http://www.duffelblog.com/feed/",
    "https://gomerblog.com/feed/",
    "http://chaser.com.au/feed/",
    "https://www.huzlers.com/feed/",
    "https://www.therisingwasabi.com/feed",
    "https://empirenews.net/feed/",
    "https://www.thespoof.com/rss/feeds/frontpage/rss.xml",
    "http://glossynews.com/feed/",
    "http://www.rockcitytimes.com/feed/",
    "https://www.bentspud.com/articles/news/feed/",
    "https://www.wahsarkar.com/feed/",
    "https://thelapine.ca/feed/",
    "https://www.newsfoxsatire.com/feed/",
    "https://www.nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/section/world/rss.xml",
    "https://www.buzzfeed.com/world.xml",
    "https://www.theguardian.com/world/rss",
    "http://www.mirror.co.uk/news/world-news/rss.xml",
    "http://canadify.com/feed/",
    "http://humorfeed.com/rss.php",
    "http://bigamericannews.com/feed/",
    "https://www.dailysquib.co.uk/feed",
    "https://www.theshovel.com.au/feed/",
    "https://nationalreport.net/feed/",
    "https://dailybonnet.com/feed/"
];

const feedConfig = {
    title: 'Fake News',
    softFail: false,
    size: 100000,
    feeds: feeds,
    pubDate: new Date()
};

createFile();
async function createFile() {
    var output = [];
    await PromiseForeach(feeds, async url => {
        let feed = await parser.parseURL(url);
        output.push(feed);
    });
    fs.writeFileSync('inspiration/index.html', output);
}

async function PromiseForeach(item, callback) {
    var jobs = [];
    item.forEach(x => jobs.push(callback(x)));
    await Promise.all(jobs);
}
