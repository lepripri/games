options.onchange = () => {
    options.value = "options";
};
function createObject (ln, col, objectID) {
    grid.querySelector(`.c${col}-${ln}`).setAttribute('completed', '')
    var newElement = grid.querySelector(`.c${col}-${ln}`).appendChild(document.createElement('img'))
    newElement.src = "icons/" + objectID + ".png"
    newElement.draggable = false;
    return newElement;
}
