const inspiration = "https://aihelper.ndev.tk/rss/json";
const max = 2000;
const train = 5;
var markov = new Markov();

async function checkGrammar(str = userInput.value) {
    let API = 'https://service.afterthedeadline.com/checkGrammar?key=***REMOVED***&data=' + encodeURIComponent(str);
    let r = await fetch('https://cors.ndev.tk/?url=' + encodeURIComponent(API));
    let result = await r.text();
    let count = result.split("<error>").length - 1;
    return count;
}

function generate_once() {
    userInput.value = cleanString(markov.generateRandom(max));
}

async function generate(minsize = 350, trys = 1000) {
    generate_once();
    for (var i = 0; i <= trys; i++) {
	if(userInput.textLength < 350) continue
        let count = await checkGrammar();
        if (count === 0) return;
        generate_once();
    }
}

TrainMarkov(markov).then(_ => {
    generate();
});

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
	let input = removeHTML(item.description[0]);
        markov.addStates(removeHTML(item.description[0]));
    }
    markov.train(train);
}
