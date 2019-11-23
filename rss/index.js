const uuidv4 = require('uuid/v4');
var RSS = require('rss');
const Markov = require('js-markov');
const xml2js = require('xml2js');
const inspiration = "https://aihelper.ndev.tk/rss/json";
const max = 2000;
const train = 5;

var markov = new Markov();
var markov2 = new Markov();

var feed = new RSS({
    title: 'Fake News',
    description: 'Using AI with multiple RSS feeds for inspiration to create fake news :D',
    feed_url: 'https://fakenews-rss.herokuapp.com/rss',
    site_url: 'https://news.ndev.tk',
    language: 'en',
    ttl: '10'
});

async function makeContent(items = 10) {
    let result = await TrainMarkov(markov, markov2);
	if(!result) return
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

async function Send(content, type = "application/rss+xml", errorCode = 404) {
    let statusCode = (content.length === 0) ? errorCode : 200;
    if (statusCode === 404) {
        content = "RSS 404";
        type = "text/plain";
    }
    let Res = new Response(content, {
        status: statusCode
    });
    Res.headers.set('Access-Control-Allow-Origin', '*');
    Res.headers.set('Cache-Control', 'public, smax-age=540, max-age=600');
    Res.headers.set('Content-Type', type + ';charset=UTF-8');
    return Res;
}

async function URLSwitch(request) {
	var xml;
	var requestURL = new URL(request.url);
    switch (requestURL.pathname) {
        case "/rss":
            xml = await makeContent();
	    if(!xml) return Send("", "text/plain", 502);
            return Send(xml);
        case "/rss/json":
            xml = await makeContent();
	    if(!xml) return Send("", "text/plain", 502);
	    let parser = xml2js.Parser();
            parser.parseString(xml, (err, result) => {
                return Send(result, "application/json");
            });
            break
        case "/":
            return Send("FakeNews RSS", "text/plain");
            break
    }
	return Send("");
}

async function handleRequest(event) {
    let cache = caches.default
	let request = event.request;
    let response = await cache.match(request)
        
    if (!response) {
      response = await URLSwitch(request);
      event.waitUntil(cache.put(request, response))
    }
    
    return  response
}

addEventListener('fetch', async event => {
    event.respondWith(handleRequest(event))
})
