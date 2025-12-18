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
if (localStorage.games == undefined) {
    localStorage.setItem('games', '{"favoriteGames": ""}')
}
var gamesStorage = JSON.parse(localStorage.games);
var lastGamesStorage = gamesStorage;
setInterval(() => {
    if (lastGamesStorage != gamesStorage) {
        localStorage.setItem('games', JSON.stringify(gamesStorage));
        var gamesStorage = JSON.parse(localStorage.games);
        var lastGamesStorage = gamesStorage;
    }
}, 100);
createObject(4, 4, "RDP01");
createObject(4, 5, "RDP01");
