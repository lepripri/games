var matchObject = class matchObject {
    constructor(filled, id, locked, energyConsomation, product, box) {
        var defaultObject = {
            filled: filled,
            id: id,
            locked: locked,
            boxed: {
                trued: false,
                level: 0
            },
            product: {
                items: [],
                energyConsomation: false,
                possibility: false
            }
        };
        if (product != undefined) {
            defaultObject.product = product;
        }
        if (box != undefined) {
            defaultObject.boxed = product;
        }
        return defaultObject;
    }
}
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
                 {filled: false}, {filled: false}, {filled: false}, {filled: true, id: "CPP2", locked: true, boxed: {trued: true, level: 0}, product: {items: [], energyConsomation: true, possibility: false}}, {filled: true, id: "RDP3", locked: true, boxed: {trued: true, level: 2}, product: {items: [], energyConsomation: true, possibility: false}}, {filled: true, id: "RDP2", locked: true, boxed: {trued: true, level: 2}, product: {items: [], energyConsomation: true, possibility: false}}, {filled: true, id: "RDP2", locked: true, boxed: {trued: true, level: 2}, product: {items: [], energyConsomation: true, possibility: false}},
                 {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false}, {filled: false},
                 {filled: false}, {filled: false}, {filled: false}, {filled: true, id: "RDP1", locked: false, boxed: {trued: false, level: 0}, product: {items: [], energyConsomation: true, possibility: false}}, {filled: true, id: "RDP1", locked: false, boxed: {trued: false, level: 0}, product: {items: [], energyConsomation: true, possibility: false}}, {filled: false}, {filled: false},
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
                    id: "RDP2",
                    locked: false,
                    boxed: {trued: false, level: 0},
                    product: {
                        items: [
                            {
                                filled: true,
                                id: "CPP2",
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
//{filled: true, id: "CPP2", locked: true, boxed: {trued: true, level: 0}, product: {items: [], energyConsomation: true, possibility: false}}
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
      const firstChild = c.childNodes.item(0);
      if (firstChild && firstChild.src && firstChild.src == dragged.src) { // Added checks for firstChild and firstChild.src
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
/* ===============================
   ÉTAT GLOBAL
================================ */
const player = {
  money: 0,
  energy: 0
};

let selectedCell = null;

/* ===============================
   OUTILS
================================ */
function formatTime(ms) {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function getRemaining(cell) {
  if (!cell.cooldownEnd) return 0;
  return Math.max(0, cell.cooldownEnd - Date.now());
}

function getUnlockCost(cell) {
  const remaining = getRemaining(cell);
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / (2 * 60 * 1000)) * 50;
}

/* ===============================
   SÉLECTION DE CASE
================================ */
document.querySelectorAll("#grid th").forEach(th => {
  th.addEventListener("click", () => {
    selectedCell = th;
    updateOptions(th);
  });
});

/* ===============================
   OPTIONS (SELECT)
================================ */
const optionsSelect = document.getElementById("options");

optionsSelect.addEventListener("change", () => {
  const option = optionsSelect.selectedOptions[0];
  if (!option || !selectedCell) return;

  // 🔓 DÉVERROUILLER = payer + skip cooldown + ouverture
  if (option.classList.contains("unlock")) {
    const cost = getUnlockCost(selectedCell);
    if (player.money < cost) return;

    player.money -= cost;
    updateMoneyUI();

    selectedCell.locked = false;
    selectedCell.cooldownEnd = null;

    openOrProduce(selectedCell);
  }

  optionsSelect.selectedIndex = 0;
  updateOptions(selectedCell);
});

/* ===============================
   MISE À JOUR DES OPTIONS
================================ */
function updateOptions(cell) {
  const bubble = document.querySelector(".textBuBule");
  const unlock = optionsSelect.querySelector(".unlock");
  const lock = optionsSelect.querySelector(".lock");

  if (!cell) {
    bubble.setAttribute("no-selection", "");
    return;
  }

  bubble.removeAttribute("no-selection");

  const remaining = getRemaining(cell);

  // 🔒 verrouiller
  lock.disabled = !!cell.locked;
  lock.hidden = false;

  // 🔓 déverrouiller
  if (remaining > 0) {
    const cost = getUnlockCost(cell);
    unlock.hidden = false;
    unlock.disabled = player.money < cost;
    unlock.textContent = `dévérrouiller cet objet [${cost}🪙]`;
  } else {
    unlock.hidden = true;
  }
}

/* ===============================
   PRODUCTION / OUVERTURE
================================ */
function openOrProduce(cell) {
  // producteur principal (⚡)
  if (cell.classList.contains("producer")) {
    produce(cell);
  } else {
    cell.setAttribute("completed", "");
  }
}

function produce(cell) {
  // exemple simple (à adapter à tes images)
  const img = cell.querySelector("img") || document.createElement("img");
  img.src = "icons/RDP1.png";
  img.hidden = false;
  cell.appendChild(img);
  cell.setAttribute("completed", "");
}

/* ===============================
   UI MONEY / ENERGY
================================ */
function updateMoneyUI() {
  document.querySelector(".money").textContent = player.money;
}
