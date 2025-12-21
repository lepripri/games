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
                 {filled: false}, {filled: false}, {filled: false}, {filled: true, id: "CPP02", locked: true, boxed: {trued: true, level: 0}, product: {items: [], energyConsomation: true, possibility: false}}, {filled: true, id: "RDP03", locked: true, boxed: {trued: true, level: 2}, product: {items: [], energyConsomation: true, possibility: false}}, {filled: true, id: "RDP02", locked: true, boxed: {trued: true, level: 2}, product: {items: [], energyConsomation: true, possibility: false}}, {filled: true, id: "RDP02", locked: true, boxed: {trued: true, level: 2}, product: {items: [], energyConsomation: true, possibility: false}},
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
    level.value = Number(`0.${breakDecimalNumber(gamesStorage.match.level).decimal}`);
});
//{filled: true, id: "CPP02", locked: true, boxed: {trued: true, level: 0}, product: {items: [], energyConsomation: true, possibility: false}}
gamesStorage.match.grid.at().forEach((a, b) => {
    var Case = grid.querySelectorAll('th').item(b),
    newImg = document.createElement('img');
    if (a.filled) {
        Case.setAttribute('completed', '')
        newImg.src = "icons/" + a.id + ".png"
        if (a.boxed.trued) {
            newImg.hidden = true;
        }
        if (a.locked) {
            Case.setAttribute("disabled", "")
        }
        Case.appendChild(newImg);
    }
});
  var dragged;
  document.addEventListener(
    "dragstart",
    function (event) {
      // Stocke une référence sur l'objet glissable
      dragged = event.target;
      // transparence 100%
      event.target.style.opacity = 0;
    },
    false,
  );
  document.addEventListener(
    "dragend",
    function (event) {
      // reset de la transparence
      event.target.style.opacity = "";
    },
    false,
  );
  grid.querySelectorAll("th").forEach((c) => {c.addEventListener(
    "dragover",
    function (event) {
      // Empêche default d'autoriser le drop
      if (c.getAttribute("completed") == null) {
          event.preventDefault();
      }
      if (c.childNodes.item(0).src == dragged.src) {
          event.preventDefault();
      }
    },
    false,
  );});
  document.addEventListener(
    "dragenter",
    function (event) {
      // Met en surbrillance la cible de drop potentielle lorsque l'élément glissable y entre
      if (event.target.toString() == "[object HTMLTableCellElement]" && event.target.getAttribute("completed") == null) {
        event.target.style.background = "#AAAAAA";
      }
    },
    false,
  );
  document.addEventListener(
    "dragleave",
    function (event) {
      /* reset de l'arrière-plan des potentielles cible du drop lorsque les éléments glissables les quittent */
        event.target.style.background = "";
    },
    false,
  );
  document.addEventListener(
    "drop",
    function (event) {
      // Empêche l'action par défaut (ouvrir comme lien pour certains éléments)
      event.preventDefault();
      // Déplace l'élément traîné vers la cible du drop sélectionnée
      if (event.target.toString() == "[object HTMLTableCellElement]" && event.target.getAttribute("completed") == null) {
        event.target.style.background = "";
        dragged.parentNode.removeAttribute("completed");
        dragged.parentNode.removeChild(dragged);
        event.target.appendChild(dragged);
        event.target.setAttribute("completed", "");
      }
    },
    false,
  );
