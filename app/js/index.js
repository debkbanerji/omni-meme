const interactionSelectors = [...document.getElementsByTagName('input')]
  .concat([...document.getElementsByTagName('textarea')])
  .concat([...document.getElementsByTagName('button')])

function disableInteraction() {
  interactionSelectors.forEach(item => (item.disabled = true));
}

function enableInteraction() {
  interactionSelectors.forEach(item => (item.disabled = false));
}

function generateCaptions() {
  disableInteraction();

  // TODO: implement
}

document.getElementById("generate-memes")
  .addEventListener("click", generateCaptions);
