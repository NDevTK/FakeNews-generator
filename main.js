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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandom(max) {
    return Math.floor((Math.random() * 10) % max)
}

async function THENEWS() {
    bg = new Audio("https://news.ndev.tk/bg.mp3");
    voices = window.speechSynthesis.getVoices().filter(voice => {
	return voice.lang.startsWith("en-");
    });
    voice = voices[getRandom(voices.length)];
    bg.loop = true;
    bg.play();
    await sleep(5000);
    bg.volume = 0.3;
    reader();
}

async function reader() {
    await generate();
    let text = new SpeechSynthesisUtterance(userInput.value);
    text.voice = voice;
    speechSynthesis.speak(text);
    text.onend = () => reader();
}

function generate_once() {
    userInput.value = cleanString(markov.generateRandom(max));
}

async function generate(minsize = 350, trys = 500) {
    generate_once();
    for (var i = 0; i <= trys; i++) {
        if (userInput.textLength >= 350) {
            let count = await checkGrammar();
            if (count === 0) return;
        }
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
	let description = removeHTML(item.description[0]);
	let title = removeHTML(item.title[0]);
        markov.addStates(description);
	markov.addStates(title);
    }
    markov.train(train);
}
