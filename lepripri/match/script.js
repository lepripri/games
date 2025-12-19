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
let lastGamesStorage = JSON.stringify(gamesStorage);

setInterval(() => {
    const currentGames = JSON.stringify(gamesStorage);

    if (currentGames !== lastGamesStorage) {
        localStorage.setItem('games', currentGames);
        lastGamesStorage = currentGames;
    }
}, 100);
createObject(4, 4, "RDP01");
createObject(4, 5, "RDP01");

var preInitiation =  {
        energy: {
            level: 100,
            charging: {
                limit: 100,
                time: 120000,
                current: 0
            }
        },
        level: 1,
        receveObjects: [],
        curentSelection: [],
        grid: [
            [
                 {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false},
                 {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false},
                 {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false},
                 {filled: false}, {filled: false}, {filled: false}, {filled: true, id: "RDP01", locked: false, boxed: {trued: false, level: 0}, product: {items: [], energyConsomation: true, possibility: false}}, {filled: true, id: "RDP01", locked: false, boxed: {trued: false, level: 0}, product: {items: [], energyConsomation: true, possibility: false}}, {filled: false}, {filled: false},
                 {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, 
                 {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, 
                 {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, 
                 {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}
            ]
        ],
        inventory: {
            content: [
                {
                    filled: true,
                    id: "RDP02",
                    locked: false,
                    boxed: {trued: false, level: 0},
                    product: {
                        items: [
                            {
                                filled: true,
                                id: "CPP02",
                                locked: false,
                                boxed: {trued: false, level: 0},
                                product: {
                                    items: [],
                                    energyConsomation: true,
                                    possibility: false
                                },
                                probality: 100
                            }
                        ],
                        energyConsomation: true,
                        possibility: true
                    }
                }
            ],
            maxleight: 10
        }
    };
