const uuidv4 = require('uuid/v4');
const fetch = require('node-fetch');
const fs = require('fs');
var RSS = require('rss');
const deepai = require('deepai');
deepai.setApiKey(process.env.DEEPAI);

makeContent();

async function makeContent() {
    var feed = new RSS({
	    title: 'Fake News',
	    description: 'Using AI with multiple RSS feeds for inspiration to create fake news :D',
	    feed_url: 'https://news.ndev.tk/rss',
	    site_url: 'https://news.ndev.tk',
	    language: 'en',
	    ttl: '60'
    });
    var input = await fetch("https://aihelper.ndev.tk/rss").json();
    var output = await fakeNews(input);
    output.length = 15;
    for (var item of output) {
	  feed.item({
            title: item.split("\n")[0],
            description: item.substr(item.indexOf('\n')+1),
            guid: uuidv4(),
            url: "https://news.ndev.tk/"
	  });
    }
    fs.writeFileSync('rss/index.html', feed.xml());
}

async function fakeNews(input) {
    const spliter = "*****";
    var output = "";
    for (feed of input) {
        for (var item of feed.items) {
            output += item.title + "\n" + item.content + spliter;
        }
    }
    output = removeHTML(output);
    output = await GPT2(output);
    output = output.replace("<|endoftext|>", "");
    return output.split(spliter);
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
	.replace('')
}

async function GPT2(text) {
    var result = await deepai.callStandardApi("text-generator", {
        text: text
    });
    return result;
}
