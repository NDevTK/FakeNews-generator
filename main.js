const inspiration = "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fg2reader.com%2Ffeed%2Ffolder%2F5bbcbaecd6498ccd2a047ea63d279b9b%2F%3Ff%3D112549&api_key=po05jsia424nkhv5qmih4dpl13v9g3xsddzjithc&count=100";
const max = 1000;
const train = 5;
var markov = new Markov();
function generate() {
    userInput.value = markov.generateRandom(max);
    if(userInput.textLength < 50) generate()
}
TrainMarkov(markov).then(_ => {
    generate();
});
function cleanString(str) {
    return str.replace(/<style[^>]*>.*<\/style>/gm, '')
        .replace(/<[^>]+>/gm, '')
        .replace(/([\r\n]+ +)+/gm, '')
	.replace('[...]', '')
	.replace('[…]', '')
	.replace(')', '')
	.replace('&amp;', '&')
	.replace('&quot;', '"')
	.replace('&apos;', "'")
	.replace('&lt;', '<')
	.replace('&gt;', '>')
	.replace('&nbsp;', ' ')
	.replace('(', '')
	.replace('”', '')
	.replace('“', '')
	.replace('“', '')
	.replace(/^\s+|\s+$/g, '')
	.replace("The Babylon Bee", "The Fake News")
	.replace("on News Punch.", "on Fake News");
}

async function TrainMarkov(markov) {
    let result = await fetch(inspiration)
    json = await result.json();
    for (const item of json.items) {
        markov.addStates(cleanString(item.description));
    }
    markov.train(train);
}
