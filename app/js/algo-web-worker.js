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

      console.log(allInputWords);

      // TODO: Process
      const results = [];
      self.postMessage({
        results
      });
    });

  });
