const express = require('express');
const app = express();
const uuidv4 = require('uuid/v4');
const fetch = require('node-fetch');
var RSS = require('rss');
const Markov = require('js-markov');
var schedule = require('node-schedule');
const xml2js = require('xml2js');
const inspiration = "https://aihelper.ndev.tk/rss/json";
const max = 2000;
const train = 5;

var markov = new Markov();
var markov2 = new Markov();

seen = true;
ContentUpdater();

async function ContentUpdater() {
	xml = await makeContent();
	var content = schedule.scheduleJob('10 * * * *', async () => {
		xml = await makeContent();
	});
	var contentOutdated = schedule.scheduleJob('50 * * * *', async () => {
		seen = true;
	});
}


async function makeContent(items = 10) {
	if(!seen) return xml;
    let result = await TrainMarkov(markov, markov2);
	var feed = new RSS({
		title: 'Fake News',
		description: 'Using AI with multiple RSS feeds for inspiration to create fake news :D',
		feed_url: 'https://rss.ndev.tk',
		site_url: 'https://news.ndev.tk',
		language: 'en',
		ttl: '10'
	});
    if (!result) return
    for (var i = 0; i <= items; i++) {
        title = await generate(markov2, 5, 70);
        description = await generate(markov);
        feed.item({
            title: title,
            description: description,
            guid: uuidv4(),
            url: "https://news.ndev.tk/"
        });
    }
	seen = false;
    return feed.xml();
}

async function checkGrammar(str = userInput.value) {
    let API = 'https://service.afterthedeadline.com/checkGrammar?key=***REMOVED***rss&data=' + encodeURIComponent(str);
    let r = await fetch('https://cors.ndev.tk/?url=' + encodeURIComponent(API));
    if (r.status >= 400 && r.status < 600) {
        return 0;
    }
    let result = await r.text();
    let count = result.split("<error>").length - 1;
    return count;
}

function generate_once(m) {
    return cleanString(m.generateRandom(max));
}

async function generate(m, minsize = 350, maxsize = 50000, trys = 500) {
    var str;
    for (var i = 0; i <= trys; i++) {
        str = generate_once(m);
        if (str.length >= 350 && str.length < maxsize) {
            let count = await checkGrammar(str);
            if (count === 0) break;
        }
    }
    return str;
}

function removeHTML(str) { // Input to AI
    return str.replace(/<style[^>]*>.*<\/style>/gm, '')
        .replace(/<[^>]+>/gm, '')
        .replace(/([\r\n]+ +)+/gm, '')
        .replace('[...]', '')
        .replace('[…]', '')
        .replace('&amp;', '&')
        .replace('&quot;', '"')
        .replace('&apos;', "'")
        .replace('&lt;', '<')
        .replace('&gt;', '>')
        .replace('&nbsp;', ' ')
}

function cleanString(str) { // Input to user
    return str.replace(')', '')
        .replace('(', '')
        .replace('”', '')
        .replace('“', '')
        .replace(".’", ".")
        .replace("’.", ".")
        .replace('“', '')
        .replace(",’", "")
        .replace("’,", ",")
        .replace(/^,/gm, "")
        .replace(/^‘/gm, "")
        .replace("’.", "")
        .replace('."', '. "')
        .replace("‘.", "")
        .replace("/^\s*‘/gm", "")
        .replace("”,", ",")
        .replace("“,", ",")
        .replace(/^\s+|\s+$/gm, '')
        .replace("Babylon Bee", "Fake News")
        .replace("News Punch.", "Fake News")
        .replace("Huzlers", "Fake News");
}

async function TrainMarkov(markov, markov2) {
    let r = await fetch(inspiration);
    if (r.status >= 400 && r.status < 600) {
        return false;
    }
    json = await r.json();
    for (let item of json.rss.channel[0].item) {
        let description = removeHTML(item.description[0]);
        let title = removeHTML(item.title[0]);
        markov.addStates(description);
        markov2.addStates(title);
    }
    markov.train(train);
    markov2.train();
    return true;
}

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Content-Type", "application/rss+xml");
	next();
});

app.get('/json', async(req, res, next) => {
	seen = true;
	if (!xml) return res.status(504).send("REMOTE ERROR");
	let parser = xml2js.Parser();
	parser.parseString(xml, (err, result) => {
		res.send(result);
	});
});

app.get('/', async(req, res, next) => {
	seen = true;
        if (!xml) return res.status(504).send("REMOTE ERROR");
	res.send(xml);
});

app.listen(15208);
