const inspiration = "https://aihelper.ndev.tk/rss";
const max = 2000;
var markov = new Markov();

async function checkGrammar(str = userInput.value) {
    let API = 'https://service.afterthedeadline.com/checkGrammar?key=ndevtk&data=' + encodeURIComponent(str);
    let r = await fetch('https://cors.usercontent.ndev.tk/?url=' + encodeURIComponent(API));
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
    if(window.hasOwnProperty("bg") && !bg.paused) {
    clearInterval(TTSKeepAlive);
    bg.pause();
    delete TheNewsIntro;
    speechSynthesis.cancel();
    bg.currentTime = 0;
    thenews.innerText = "THE NEWS!";
    return
    }
    TTSKeepAlive = setInterval(_ => {
    speechSynthesis.pause();
    speechSynthesis.resume();
    }, 5000);
    if (!window.hasOwnProperty("bg")) bg = new Audio("https://news.ndev.tk/bg.mp3");
    voices = window.speechSynthesis.getVoices().filter(voice => {
	return voice.lang.startsWith("en-");
    });
    voice = voices[getRandom(voices.length)];
    bg.loop = true;
    bg.volume = 1;
    bg.play();
    thenews.innerText = "Stop Audio";
    TheNewsIntro = sleep(6000);
    await TheNewsIntro
    bg.volume = 0.3;
    reader();
}

async function reader() {
    if(bg.paused) return
    await generate();
    text = new SpeechSynthesisUtterance(userInput.value);
    text.voice = voice;
    text.onerror = () => reader();
    text.onend = () => reader();
    speechSynthesis.speak(text);
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

tryTrainMarkov(markov).then(state => {
    if(!state) {
    userInput.value = "API ERROR! please reload page";
    return
    }
    thenews.disabled = false;
    random.disabled = false;
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

async function tryTrainMarkov(markov, trys = 10) {
    for (var i = 0; i <= trys; i++) {
        let state = await TrainMarkov(markov);
        if(state) return true;
	await sleep(1000);
    }
    return false;
}

async function TrainMarkov(markov) {
    let r = await fetch(inspiration);
    if (r.status >= 400 && r.status < 600) {
        return false;
    }
    json = await r.json();
    var data = [];
    for (let feed of json) {
        for (let item of feed.items) {
	        data.push(removeHTML(item.content));
        }
    }
    markov.addStates(data);
    markov.train();
    return true
}
