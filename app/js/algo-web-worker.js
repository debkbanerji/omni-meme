// assume sanitizedWord1 and sanitizedWord2 are arrays of lowercase characters
// without spaces and special character
function lcs(sanitizedWord1, sanitizedWord2) {
  const n1 = sanitizedWord1.length;
  const n2 = sanitizedWord2.length;
  const T = Array.from(Array(n1 + 1), () => new Array(n2 + 1));
  for (let i = 0; i <= n1; i++) {
    for (let j = 0; j <= n2; j++) {
      let entry = null;
      if (i === 0 || j === 0) {
        entry = 0;
      } else if (sanitizedWord1[i - 1] === sanitizedWord2[j - 1]) {
        entry = T[i - 1][j - 1] + 1;
      } else {
        entry = Math.max(T[i - 1][j], T[i][j - 1]);
      }
      T[i][j] = entry;
    }
  }

  // backtrack time
  const lcsLength = T[n1][n2];
  const word1lcsIndices = [] // index within word 1
  let i = n1;
  let j = n2;
  while (i > 0 && j > 0) {
    if (sanitizedWord1[i - 1] == sanitizedWord2[j - 1]) {
      word1lcsIndices.unshift(i - 1);
      i--;
      j--; // reduce values of i and j
    } else if (T[i - 1][j] > T[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return {
    lcsLength,
    word1lcsIndices
  };
}

function sanitizeText(str) {
  return str.replace(/[^a-zA-Z]/g, "").toLowerCase();
}

// returns true if the character would not be removed during anitization
function wasCharacterPreserved(c) {
  return c.match(/[a-z]/i);
}


function canCreateMeme(candidateWord, lcsResult) {
  return lcsResult.lcsLength > 0 && lcsResult.lcsLength === candidateWord.length;
}

// returns the blankable character indices in the toBeReplaced text to create
// the candidate word
// returns null if this cannot be done
function getBlankableCharacterIndices(toBeReplaced, candidateWord) {
  const sanitizedCandidateWord = sanitizeText(candidateWord);
  const lcsResult = lcs(Array.from(sanitizeText(toBeReplaced)), Array.from(sanitizedCandidateWord));

  if (!canCreateMeme(sanitizedCandidateWord, lcsResult)) {
    return null;
  }

  const {
    word1lcsIndices
  } = lcsResult;

  const toBeReplacedArr = Array.from(toBeReplaced);
  const blankableCharacterIndices = [];
  // go through and return which character indices should be blanked out
  let j = 0; // accounts for offset due to spaces, etc.
  for (let i = 0; i < toBeReplacedArr.length; i++) {
    if (!wasCharacterPreserved(toBeReplacedArr[i])) {
      blankableCharacterIndices.push(i);
    } else {
      // j is the index in the sanitized word
      if (!word1lcsIndices.includes(j)) {
        blankableCharacterIndices.push(i);
      }

      // increment j since the letter exists in the sanitized word
      j++;
    }
  }

  return blankableCharacterIndices;
}

function tryGetSourceTextWithBlanks(toBeReplaced, candidateWord, blackoutChar) {
  // if it's possible to create candidateWord by applying blanks to
  // toBeReplaced, print toBeReplaced with blanks applied
  const blankableCharacterIndices = getBlankableCharacterIndices(toBeReplaced, candidateWord);
  if (blankableCharacterIndices != null) {
    return Array.from(toBeReplaced).map((c, i) => blankableCharacterIndices.includes(i) ? blackoutChar : c).join('');
  }
}

async function getTextFromStream(readableStream) {
  let reader = readableStream.getReader();
  let utf8Decoder = new TextDecoder();
  let nextChunk;

  let resultStr = '';

  while (!(nextChunk = await reader.read()).done) {
    let partialData = nextChunk.value;
    resultStr += utf8Decoder.decode(partialData);
  }

  return resultStr;
}

self.addEventListener(
  "message",
  async function(e) {
    const {
      blackoutChar,
      inputWords,
      inputWordTxtUrls,
      originalCaption,
    } = e.data;

    Promise.all(inputWordTxtUrls.map(async url => {
      try {
        const response = await fetch(url);
        const responseText = await getTextFromStream(response.body);
        return responseText
          .split('\n');
      } catch (e) {
        return null;
      }
    })).then((lists) => {
      const urlWords = lists.filter(list => list != null).flat();
      const allInputWords = inputWords.concat(urlWords);

      const results = allInputWords.map((word) => {
        // for now, ignore the word if it isn't the same before and after sanitization
        if (word === sanitizeText(word)) {
          const blackedOutText = tryGetSourceTextWithBlanks(originalCaption, word, blackoutChar);
          if (blackedOutText != null) {
            return {
              word,
              blackedOutText
            }
          } else {
            return null;
          }
        } else {
          return null;
        }
      }).filter(result => result != null);

      // // sort in ascending order of length// results.sort((r1, r2) => r1.word.length - r2.word.length);

      self.postMessage({
        results
      });
    });

  });
