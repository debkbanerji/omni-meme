const request = require('request');
// problem we're solving - can we blank out a bunch of letters in TO_BE_REPLACED
// such that we can generate a valid word in the lcsLength

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

function tryGetSourceTextWithBlanks(toBeReplaced, candidateWord) {
  // if it's possible to create candidateWord by applying blanks to
  // toBeReplaced, print toBeReplaced with blanks applied
  const blankableCharacterIndices = getBlankableCharacterIndices(toBeReplaced, candidateWord);
  if (blankableCharacterIndices != null) {
    return Array.from(toBeReplaced).map((c, i) => blankableCharacterIndices.includes(i) ? '_' : c).join('');
  }
}

const SETUP_TEXT = 'Look '
const TO_BE_REPLACED = 'what they need to mimic a fraction of our power'

// queries for a file with many english words and runs
// tryPrintSourceTextWithBlanks for each one
function printWordResults() {
  request.get('https://github.com/dwyl/english-words/raw/master/words.txt', function(error, response, body) {
    if (!error && response.statusCode == 200) {
      const words = body.split('\n');
      console.log(TO_BE_REPLACED);
      body.split('\n').forEach((word) => {
        // for now, ignore the word if it isn't the same before and after sanitization
        if (word === sanitizeText(word)) {
          const textWithBlanks = tryGetSourceTextWithBlanks(TO_BE_REPLACED, word);
          if (textWithBlanks != null) {
            console.log(word)
            console.log(textWithBlanks);
          }
        }
      });
    }
  });
}

printWordResults();
