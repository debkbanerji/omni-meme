const SETUP_TEXT = 'Look '
const TO_BE_REPLACED = 'what they need to mimic a fraction of our power'

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
      T[i][j] = entry
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
  }
}

// console.log(lcs('aladdin', 'tangled'))
