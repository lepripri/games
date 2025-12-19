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
                 {filled: false}, {filled: false}, {filled: false}, {filled: true, id: "PPC02", locked: true, boxed: {trued: true, level: 0}}, {filled: true, id: "RDP03", locked: true, boxed: {trued: true, level: 2}}, {filled: true, id: "RDP02", locked: true, boxed: {trued: true, level: 2}}, {filled: true, id: "RDP02", locked: true, boxed: {trued: true, level: 2}},
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
function breakDecimalNumber(num) {
    if (isFinite(num)) {
        var StringNum = num.toString() + ".0";
    }else{
        var StringNum = num.toString();
    }
    return {
        unity: parseInt(StringNum.substring(0, StringNum.indexOf("."))),
        decimal: parseInt(StringNum.substring(StringNum.indexOf(".") + 1, StringNum.leight))
    };
}
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
if (gamesStorage.match == undefined) {
    gamesStorage.match = preInitiation;
}
setInterval(() => {
    const currentGames = JSON.stringify(gamesStorage);

    if (currentGames !== lastGamesStorage) {
        localStorage.setItem('games', currentGames);
        lastGamesStorage = currentGames;
    }
}, 100);
setInterval(() => {
    document.querySelector(".energy").textContent = gamesStorage.match.energy.level;
    document.querySelector("level").textContent = breakDecimalNumber(gamesStorage.match.level).unity;
    level.textContent = parseInt(`0.${breakDecimalNumber(gamesStorage.match.level).decimal}`);
});
