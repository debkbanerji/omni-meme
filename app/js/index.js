const BLACKOUT_CHAR = String.fromCharCode(parseInt('2588', 16));
const UNDERSCORE_CHAR = '_';
const URL_REGEX = new RegExp(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*$)/gi);


const interactionSelectors = [...document.getElementsByTagName('input')]
  .concat([...document.getElementsByTagName('textarea')])
  .concat([...document.getElementsByTagName('button')])

function disableInteraction() {
  interactionSelectors.forEach(item => (item.disabled = true));
}

function enableInteraction() {
  interactionSelectors.forEach(item => (item.disabled = false));
}


let currentCaption = '';

function generateCaptions() {
  disableInteraction();


  const loadingComponent = document.getElementById(
    "loading-progress"
  );
  loadingComponent.hidden = false;

  const inputLines = document.getElementById('input-words-and-links').value
    .split('\n').map(
      line => line.trim()
    ).filter(
      line => line.length > 0
    );

  // const inputWords = inputLines.filter(line => !line.match(URL_REGEX));
  // const inputWordTxtUrls = inputLines.filter(line => line.match(URL_REGEX));
  inputWords = inputLines;
  inputWordTxtUrls=['../assets/txt/nounlist.txt']


  const originalCaption = document.getElementById('caption-input').value;

  const webWorkerInput = {
    blackoutChar: UNDERSCORE_CHAR,
    inputWords,
    inputWordTxtUrls,
    originalCaption,
  };

  const worker = new Worker("js/algo-web-worker.js" +
    '?' + Math.random()
  );
  worker.postMessage(webWorkerInput);
  worker.addEventListener("message", e => {
    const {
      data
    } = e;
    console.log(data)
    loadingComponent.hidden = true;
    enableInteraction();
  });
}

document.getElementById("generate-memes")
  .addEventListener("click", generateCaptions);
