const express = require('express');
const app = express();
const uuidv4 = require('uuid/v4');
var RSS = require('rss');
const Markov = require('js-markov');
const fetch = require('node-fetch');
const PORT = process.env.PORT || 5000;
const xml2js = require('xml2js');

const inspiration = "https://aihelper.ndev.tk/rss/json";
const max = 2000;
const train = 5;

var markov = new Markov();
var markov2 = new Markov();

async function checkGrammar(str = userInput.value) {
    let API = 'https://service.afterthedeadline.com/checkGrammar?key=***REMOVED***rss&data=' + encodeURIComponent(str);
    let r = await fetch('https://cors.ndev.tk/?url=' + encodeURIComponent(API));
    let result = await r.text();
    let count = result.split("<error>").length - 1;
    return count;
}

function generate_once(m) {
    return cleanString(m.generateRandom(max));
}

async function generate(m, minsize = 350, trys = 500) {
	var str;
    for (var i = 0; i <= trys; i++) {
		str = generate_once(m);
        if (str.length >= 350) {
            let count = await checkGrammar(str);
            if (count === 0) break;
        }  
    }
	return str;
}

async function makeContent() {
	var feed = new RSS({
		title: 'Fake News',
		description: 'Using AI with multiple RSS feeds for inspiration to create fake news :D',
		feed_url: 'https://fakenews-rss.ndev.tk',
		site_url: 'https://news.ndev.tk',
		language: 'en'
	});
	await TrainMarkov(markov, markov2);
	for (var i = 0; i <= 20; i++) {
		title = await generate(markov, 5);
		description = await generate(markov2);
		feed.item({
			title: title,
			description: description,
			guid: uuidv4(),
			url: "https://news.ndev.tk/"
		});
    }
	return feed.xml();
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
	.replace("‘.","")
	.replace("/^\s*‘/gm", "")
	.replace("”,", ",")
	.replace("“,", ",")
	.replace(/^\s+|\s+$/gm, '')
	.replace("Babylon Bee", "Fake News")
	.replace("News Punch.", "Fake News")
	.replace("Huzlers", "Fake News");
}

async function TrainMarkov(markov) {
    let result = await fetch(inspiration)
    json = await result.json();
    for (let item of json.rss.channel[0].item) {
	let description = removeHTML(item.description[0]);
	let title = removeHTML(item.title[0]);
        markov.addStates(description);
		markov2.addStates(title);
    }
    markov.train(train);
	markov2.train(train);
}

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Expose-Headers", "X-Final-URL");
    res.header('Cache-Control', 'public, smax-age=600, max-age=600');
    next();
});

app.get('/rss/json', (req, res, next) => {
	let parser = xml2js.Parser();
	makeContent().then(xml => {
		parser.parseString(xml, (err, result) => {
		  res.send(result);
		});
	});
});

app.get('/rss', (req, res, next) => {
	makeContent().then(xml => {
		res.send(xml);
	});
});

app.get('/', (req, res, next) => {
	res.send("Fake News RSS :D");
});

app.listen(PORT);
