const BLACKOUT_CHAR = String.fromCharCode(parseInt('2588', 16));
const UNDERSCORE_CHAR = '_';
const URL_REGEX = new RegExp(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*$)/gi);
const IMAGE_FONT_RATIO = 0.10
const WORD_ON_IMAGE_FONT_SCALE = 1.4;

const interactionSelectors = [...document.getElementsByTagName('input')]
  .concat([...document.getElementsByTagName('textarea')])
  .concat([...document.getElementsByTagName('button')])

function disableInteraction() {
  interactionSelectors.forEach(item => (item.disabled = true));
}

function enableInteraction() {
  interactionSelectors.forEach(item => (item.disabled = false));
}

let imageURL = '/assets/png/omni-man-meme-template.png';

const templateImageSelectorHidden = document.getElementById(
  "template-image-selector-hidden"
);
templateImageSelectorHidden.addEventListener("change", e => {
  const reader = new FileReader();
  reader.onload = function(event) {
    imageURL = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
}, false);

document
  .getElementById("template-image-selector")
  .addEventListener("click", () => {
    templateImageSelectorHidden.click();
  });

let selectedCaptionResult = {};

function submitCaptionGeneration() {
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

  inputWords = inputLines;
  inputWordTxtUrls = ['../assets/txt/nounlist.txt']

  const originalCaption = document.getElementById('caption-input').value;

  const webWorkerInput = {
    blackoutChar: UNDERSCORE_CHAR,
    inputWords,
    inputWordTxtUrls,
    originalCaption,
  };

  const prefix = document.getElementById('caption-input-prefix').value;
  const postfix = document.getElementById('caption-input-postfix').value;

  const worker = new Worker("js/algo-web-worker.js" +
    '?' + Math.random()
  );
  worker.postMessage(webWorkerInput);
  worker.addEventListener("message", e => {
    const {
      data
    } = e;
    const results = data.results.map(result => {
      const {
        word,
        blackedOutText
      } = result;

      return {
        word,
        caption: `${prefix}${blackedOutText.replaceAll(UNDERSCORE_CHAR, BLACKOUT_CHAR)}${postfix}`
      };
    });
    loadingComponent.hidden = true;
    enableInteraction();

    // TODO: deal with the case when no captions are generated
    selectedCaptionResult = results[Math.floor(Math.random() * results.length)];
    drawMemeWithCaption(selectedCaptionResult.caption, selectedCaptionResult.word);
  });
}

document.getElementById("generate-memes")
  .addEventListener("click", submitCaptionGeneration);

setTimeout(submitCaptionGeneration, 500); // run this after the page loads

function drawMemeWithCaption(caption, originalWord) {
  const canvas = document.getElementById("main-meme-canvas");
  const context = canvas.getContext("2d");
  const img = new Image();
  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);

    const textPaddingHorizontal = canvas.width * 0.03;
    const textPaddingVertical = textPaddingHorizontal;
    const lineHeight = canvas.height * IMAGE_FONT_RATIO;
    context.fillStyle = document.getElementById("font-color").value;

    const wordXSelector = document.getElementById('word-position-x-slider');
    const wordYSelector = document.getElementById('word-position-y-slider');
    if (document.getElementById('word-on-image').checked) {
      context.font = `${lineHeight*WORD_ON_IMAGE_FONT_SCALE}px Arial`;
      context.fillText(
        originalWord,
        wordXSelector.value / wordXSelector.max * img.width,
        wordYSelector.value / wordYSelector.max * img.height
      );
    }

    context.font = `${lineHeight}px Arial`;
    const lines = [];
    let nextLine = '';
    caption.split('').forEach((c, i) => {
      const lineWidth = context.measureText(nextLine + c).width;
      if (lineWidth + 2 * textPaddingHorizontal > canvas.width) {
        lines.push(nextLine);
        nextLine = '';
      } else {
        nextLine = nextLine + c;
      }
    });
    lines.push(nextLine);

    lines.forEach((line, i) => {
      context.fillText(lines[i], textPaddingHorizontal,
        canvas.height - ((lines.length - i) * lineHeight));
    });
  };
  img.src = imageURL;
}

[
  'font-color',
  'word-on-image',
  'word-position-x-slider',
  'word-position-y-slider'
].forEach(id => {
  document.getElementById(id)
    .addEventListener("change", () =>
      drawMemeWithCaption(selectedCaptionResult.caption, selectedCaptionResult.word)
    );
});

document.getElementById('word-on-image')
  .addEventListener("change", () => {
    [
      'word-position-x-slider',
      'word-position-y-slider'
    ].forEach(id => {
      document.getElementById(id).hidden = !document.getElementById('word-on-image').checked;
    });
  });
