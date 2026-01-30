/* =====================================================
   PRIPRI MATCH — SCRIPT FINAL STABLE
   énergie par défaut : 100
===================================================== */

/* ===============================
   CONFIG GLOBALE
================================ */
const GRID_COLS = 7;
const GRID_ROWS = 8;
const MAX_ENERGY = 100;
const ENERGY_REGEN_TIME = 120000; // 1 énergie / 2 min
const NON_FUSIONABLE_PREFIX = ["CFR", "CEN"];
const JOKER_ID = "JOKER";
var closeEnergyAssistant = () => {}, 
nextOnEnergyAssistant = () => {},
previewOnEnergyAssistant = () => {};
function openEnergyAssistant() {
    var energyAssistant = document.body.appendChild(document.createElement('dialog'));
    energyAssistant.innerHTML = `<div class="windowTitle">Assistant d'énergie</div><div class="content"><section><article><h1>vous n'avez plus d'énergie</h1><h3>obtenez plus d'énergies pour continuer à produire des objets</h3><h6>Dans cette assistant, vous aurais des OFFRES pour OBTENIR de l'ÉNERGIE GRATUITEMENT. Si vous n'avais pas de pièce de jeux le pripri, vous pouvez GAGNIER des PIÈCES et de l'ÉNERGIE en jouant à d'AUTRES JEUX le pripri.</h6></article></section></div><div class="buttons"><button onclick="nextOnEnergyAssistant()">suivant</button><button onclick="previewOnEnergyAssistant()" disabled="">précedant</button><button onclick="closeEnergyAssistant()">quitter l'assistant</button></div>`;
    energyAssistant.onclose = () => {
        energyAssistant.remove();
    };
    closeEnergyAssistant = () => {
        energyAssistant.close();
        energyAssistant.remove();
    };
}

function getEnergyBoost() {
    const select = document.getElementById("powerEnergy");
    if (!select) return 1;

    const val = select.value;
    if (val === "2x") return 2;
    if (val === "3x") return 3;
    return 1;
}

/* ===============================
   DONNÉES JOUEUR
================================ */
const player = {
    money: 0,
    energy: MAX_ENERGY,
    level: 1.0,
    lastEnergyTick: Date.now()
};

/* ===============================
   OBJETS (NOMS)
================================ */
const OBJECT_NAMES = {
    allIsArray: ["CPP1","CPP2","CPP3","CPP4","CPP5","CPP6","CPP7","CPP8","CPP9","RDP1","RDP2","RDP3","RDP4","RDP5","RDP6","PCS1","PCS2","PCS3","PCS4","PCS5","ENR1","ENR2","ENR3","ENR4","ENR5","DFU1","DFU2","DFU3","DFU4","DFU5","CFR1","CFR2","CFR3","CFR4","CFR5","CFR6","CFR7","BBP1","BBP2","BEP1","BEP2","BEP3", "BEP4", "BEP5"],
    CPP1: "pripri simple",
    CPP2: "pripri double",
    CPP3: "pripri triple",
    CPP4: "pripri quadruple",
    CPP5: "pripri RJ45",
    CPP6: "pripri USB",
    CPP7: "pripri 7 USB",
    CPP8: "⚡ maman pripri",
    CPP9: "⚡ pripri extraterrestre",

    RDP1: "boîte vide",
    RDP2: "⚡ boîte à pripri",
    RDP3: "⚡ boîte un peu pleine",
    RDP4: "⚡ boîte bien pleine",
    RDP5: "⚡ boîte pleine",
    RDP6: "⚡ ville de priprix",

    PCS1: "1 pièce",
    PCS2: "3 pièces",
    PCS3: "7 pièces",
    PCS4: "15 pièces",
    PCS5: "32 pièces",

    ENR1: "2 énergies",
    ENR2: "5 énergies",
    ENR3: "15 énergies",
    ENR4: "40 énergies",
    ENR5: "100 énergies",

    DFU1: "1 fonctionnalité payantes",
    DFU2: "3 fonctionnalités payantes",
    DFU3: "7 fonctionnalités payantes",
    DFU4: "15 fonctionnalités payantes",
    DFU5: "32 fonctionnalités payantes",

    CFR1: "sachet bleu",
    CFR2: "sachet violet",
    CFR3: "boite transparente",
    CFR4: "petit coffret",
    CFR5: "grand coffret",
    CFR6: "grand coffre",
    CFR7: "coffre XXL",

    BBP1: "bébé pripri",
    BBP2: "pripri ados",

    BEP1: "bébé pripri extraterrestre",
    BEP2: "pripri extraterrestre ados",
    BEP3: "jeune pripri extraterrestre",
    BEP4: "pripri extraterrestre adulte",
    BEP5: "vieux pripri extraterrestre",
};

/* ===============================
   PERSONNAGES & RÈGLES
================================ */

const CHARACTERS = [
  { id: "camille", img: "camille.png", reward: { money: 30, energy: 10 } },
  { id: "farceur", img: "pripri farceur.png", reward: { money: 20, energy: 5 } },
  { id: "gourmand", img: "pripri gourmand.png", levelBonus: 0.3, hard: true },
  { id: "dixo", img: "dixo.png", levelBonus: 0.2, hard: true, rich: true },
  { id: "maman", img: "maman pripri.png" },
  { id: "papa", img: "papa pripri.png" },
  { id: "boutdumonde", img: "pripri du bout du monde.png" },
  { id: "plancequot", img: "plancequot.png", noReward: true },
  { id: "intelligent", img: "pripri inteligent.png" },
  { id: "milliminutes", img: "agent d'entretient milliminutes.png" },
  { id: "djixy", img: "djixy.png" }
];

/* ===============================
   COMMANDES
================================ */

let activeCommands = [];
let normalCommands = [];
let specialCommands = [];

function generateCommandsForProducer(producerId) {
  activeCommands = [];

  const availableChars = CHARACTERS.filter(c => c.id !== "plancequot");
  const count = Math.floor(Math.random() * 4) + 3; // 3 à 6

  shuffleArray(availableChars);
  function getNormalCommandLimit(playerLevel) {
    if (playerLevel === 1) return 1;
    if (playerLevel === 2) return 2;
    return 6;
  }
  // Étape 1 → niveau 4 → CEN1
  activeCommands.push(createCommand(
    availableChars[0],
    producerId,
    4,
    { type: "CEN1" }
  ));

  // Étape 2 → niveau 5 → DFU2
  activeCommands.push(createCommand(
    availableChars[1],
    producerId,
    5,
    { type: "DFU2" }
  ));

  // Étape 3 → niveau 6 → TBC1
  activeCommands.push(createCommand(
    availableChars[2],
    producerId,
    6,
    { type: "TBC1" }
  ));

  // Étape 4 → niveau 7 → TBC2
  activeCommands.push(createCommand(
    availableChars[3],
    producerId,
    7,
    { type: "TBC2" }
  ));

  renderCommands();
}

function createCommand(character, producerId, level, reward) {
  return {
    character,
    producerId,
    requiredLevel: level,
    reward,
    completed: false
  };
}

function renderCommands() {
  const container = document.querySelector("#commands");
  container.innerHTML = "";

  activeCommands.forEach((cmd, index) => {
    const div = document.createElement("div");
    div.className = "await-command";
    div.dataset.index = index;

    div.innerHTML = `
      <div class="command-picture">
        <img src="${cmd.character.img}">
      </div>
      <div class="command">
        <div class="reward">
          ${renderReward(cmd.reward)}
        </div>
        <div class="cible">
          ${cmd.producerId} niv. ${cmd.requiredLevel}
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

function renderReward(reward) {
  if (!reward) return `<div>🤲 aucune récompense</div>`;
  if (reward.type) return `<div><img src="icons/${reward.type}.png"></div>`;

  let html = "";
  if (reward.money) html += `<div>+${reward.money}🪙</div>`;
  if (reward.energy) html += `<div>⚡+${reward.energy}</div>`;
  return html;
}

function tryCompleteCommand(obj) {
  const cmd = activeCommands.find(c =>
    !c.completed &&
    obj.id.startsWith(c.producerId.substring(0,3)) &&
    obj.level >= c.requiredLevel
  );

  if (!cmd) return false;

  cmd.completed = true;

  // récompense
  if (cmd.reward?.money) player.money += cmd.reward.money;
  if (cmd.reward?.energy) player.energy += cmd.reward.energy;

  if (cmd.reward?.type) {
    const empty = gridCells.find(c => !c.matchObject);
    if (empty) placeObject(empty, new MatchObject(cmd.reward.type, 1));
  }

  renderCommands();
  return true;
}

function addPlancequotCommand() {
  activeCommands.push({
    character: CHARACTERS.find(c => c.id === "plancequot"),
    producerId: "ANY",
    requiredLevel: 999,
    reward: null,
    completed: false
  });
}

function generateNormalCommands() {
  const limit = getNormalCommandLimit(Math.floor(player.level));
  if (normalCommands.length >= limit) return;

  const candidates = CHARACTERS.filter(c => true);
  shuffleArray(candidates);

  while (normalCommands.length < limit) {
    const char = candidates.pop();
    if (!char) break;

    normalCommands.push({
      character: char,
      required: generateLevelTarget(),
      reward: generateStandardReward(char),
      completed: false
    });
  }
}

function generateSpecialProducerCommands(producerId) {
  if (specialCommands.length >= 4) return;

  const chars = CHARACTERS.filter(c => c.id !== "plancequot");
  shuffleArray(chars);

  const steps = [
    { level: 4, reward: { type: "CEN1" } },
    { level: 5, reward: { type: "DFU2" } },
    { level: 6, reward: { type: "TBC1" } },
    { level: 7, reward: { type: "TBC2" } }
  ];

  steps.forEach((step, i) => {
    if (specialCommands.length >= 9) return;

    specialCommands.push({
      character: chars[i],
      producerId,
      requiredLevel: step.level,
      reward: step.reward,
      completed: false,
      special: true
    });
  });
}

function renderAllCommands() {
  const container = document.querySelector("#commands");
  container.innerHTML = "";

  [...normalCommands, ...specialCommands].forEach(cmd => {
    const div = document.createElement("div");
    div.className = "await-command";
    if (cmd.special) div.setAttribute("special", "");

    div.innerHTML = `
      <div class="command-picture">
        <img src="${cmd.character.img}">
      </div>
      <div class="command">
        <div class="reward">${renderReward(cmd.reward)}</div>
        <div class="cible">
          ${cmd.producerId ? `${cmd.producerId} niv. ${cmd.requiredLevel}` : ""}
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

function tryCompleteCommand(obj) {
  const all = [...normalCommands, ...specialCommands];

  const cmd = all.find(c =>
    !c.completed &&
    (!c.producerId || obj.id.startsWith(c.producerId.substring(0,3))) &&
    obj.level >= c.requiredLevel
  );

  if (!cmd) return false;

  cmd.completed = true;
  applyReward(cmd.reward);

  // retirer commande
  normalCommands = normalCommands.filter(c => c !== cmd);
  specialCommands = specialCommands.filter(c => c !== cmd);

  renderAllCommands();
  return true;
}

/* ===============================
   MATCH OBJECT
================================ */
class MatchObject {
    constructor(id, level = 1) {
        this.id = id;
        this.level = level;
        this.locked = false;
        this.cooldownEnd = 0;
    }
}

MatchObject.prototype.productionCount = 0;
MatchObject.prototype.cooldownUntil = 0;

/* ===============================
   GRILLE
================================ */
const gridCells = Array.from(document.querySelectorAll("#grid th"));

function clearGrid() {
    gridCells.forEach(c => {
        c.innerHTML = "";
        c.removeAttribute("completed");
        c.matchObject = null;
    });
}

function placeObject(cell, obj, isMerge, locked, boxed) {
    cell.innerHTML = "";
    const img = document.createElement("img");
    img.src = `icons/${obj.id}.png`;
    img.draggable = true;
    img.dataset.id = obj.id;
    img.dataset.level = obj.level;

    if (isMerge) {
       grid.querySelectorAll("img").forEach((secCurElement) => {
           secCurElement.removeAttribute("selected");
       });
       img.setAttribute("selected", "");
    }
    cell.appendChild(img);
    cell.setAttribute("completed", "");
    if (boxed != undefined && boxed != null) { // si boxed vaut 0, il seras mis quand même (pas de problèmes)
       cell.setAttribute("boxed", boxed)
       
    }
    if (locked) {
       cell.setAttribute("locked", "")
    } 
    cell.matchObject = obj;
}

/* ===============================
   INITIALISATION PLATEAU
================================ */
clearGrid();

// objets de départ (exemple jouable)
placeObject(gridCells[17], new MatchObject("CPP1", 1), false, true);
placeObject(gridCells[23], new MatchObject("RDP1", 1));
placeObject(gridCells[24], new MatchObject("RDP1", 1));

/* ===============================
   FUSION
================================ */
function canMerge(a, b) {
    if (!a || !b) return false;
    if (a.dataset.id !== b.dataset.id) return false;

    for (const p of NON_FUSIONABLE_PREFIX) {
        if (a.dataset.id.startsWith(p)) return false;
    }

    return Number(a.dataset.level) === Number(b.dataset.level);
}

function mergeCells(fromCell, toCell) {
    const a = fromCell.querySelector("img");
    const b = toCell.querySelector("img");
    if (!canMerge(a, b)) return;

    const newLevel = Number(a.dataset.level) + 1;
    const id = a.dataset.id.substring(0, 3) + newLevel;

    fromCell.innerHTML = "";
    fromCell.removeAttribute("completed");
    fromCell.matchObject = null;

    placeObject(toCell, new MatchObject(id, `${newLevel}`, true));
}

/* ===============================
   DRAG & DROP
================================ */
let draggedCell = null;

gridCells.forEach(cell => {
    cell.addEventListener("dragstart", e => {
        if (!cell.matchObject) return;
        if (cell.hasAttribute("locked")) return;
        draggedCell = cell;
        e.target.style.opacity = 0.3;
    });

    cell.addEventListener("dragend", e => {
        e.target.style.opacity = "";
    });

    cell.addEventListener("dragover", e => {
        e.preventDefault();
    });

    cell.addEventListener("drop", e => {
        e.preventDefault();
        if (!draggedCell || draggedCell === cell) return;
        if (cell.matchObject) {
            mergeCells(draggedCell, cell);
        } else {
            cell.appendChild(draggedCell.firstChild);
            cell.matchObject = draggedCell.matchObject;
            draggedCell.matchObject = null;
            draggedCell.innerHTML = "";
            draggedCell.removeAttribute("completed");
            cell.setAttribute("completed", "");
        }
    });
});

/* ===============================
   DOUBLE CLIC = RÉCUPÉRER
================================ */
gridCells.forEach(cell => {
    cell.addEventListener("dblclick", () => {
        if (!cell.matchObject) return;

        const id = cell.matchObject.id;

        // pièces
        if (id.startsWith("PCS")) {
            const values = [1, 3, 7, 15, 32];
            player.money += values[cell.matchObject.level - 1] || 1;
        }

        // énergie
        if (id.startsWith("ENR")) {
            const values = [2, 5, 15, 40, 100];
            player.energy = Math.min(
                MAX_ENERGY,
                player.energy + (values[cell.matchObject.level - 1] || 1)
            );
        }
        if (id.startsWith("PCS") || id.startsWith("ENR")) {
            cell.innerHTML = "";
            cell.matchObject = null;
            cell.removeAttribute("completed");
        }
    });
});

/* ===============================
   PRODUCTION AVANCÉE
================================ */
gridCells.forEach(cell => {
    cell.addEventListener("click", () => {
        if (!cell.matchObject) return;
        const obj = cell.matchObject;
        const id = obj.id;

        if (!OBJECT_NAMES[id]?.includes("⚡")) return;

        // cooldown
        if (obj.cooldownUntil && Date.now() < obj.cooldownUntil) {
            showMessage("chargement...<br>veillez patienter ou<br>dépencer de l'argent");
            return;
        }

        if (player.energy <= 0) {
            openEnergyAssistant();
            return;
        }

        const emptyCell = gridCells.find(c => !c.matchObject);
        if (!emptyCell) {
            showMessage("Plateau plein !");
            return;
        }

        // énergie consommée
const boost = getEnergyBoost();

    // vérification énergie
    if (player.energy < boost) {
        showMessage("⚠️ Pas assez d'énergie pour ce boost", openEnergyAssistant);
        return;
    }

    player.energy -= boost;
    document.querySelector(".energy").textContent = player.energy;

        obj.productionCount++;

        let producedId = null;
        let producedLevel = 1;

        /* ===== RÈGLES ===== */

        // PRODUCTEUR PRINCIPAL
        if (id.startsWith("RDP")) {
            producedId = "CPP1";
            producedLevel = Math.min(7, 1 + (boost - 1));

            if (obj.productionCount >= 50) {
                obj.cooldownUntil = Date.now() + 300000; // 5 min
                obj.productionCount = 0;
            }
        }

        // MAMAN PRIPRI
        if (id === "CPP8") {
            producedId = "BBP1";
            producedLevel = Math.min(2, (Math.random() < 0.5 ? 1 : 2) + (boost - 1));

            if (obj.productionCount >= 25) {
                cell.innerHTML = "";
                cell.matchObject = null;
                cell.removeAttribute("completed");
                showMessage("💥 La maman pripri s'est désintégrée");
                return;
            }
        }

        // PRIPRI EXTRATERRESTRE
        if (id === "CPP9") {
            if (Math.random() < 0.6) {
                producedId = "BBP1";
                producedLevel = Math.random() < 0.5 ? 1 : 2;
            } else {
                producedId = "BEP1";
                producedLevel = Math.min(5, (Math.floor(Math.random() * 5) + 1) + (boost - 1));
            }

            if (obj.productionCount >= 25) {
                cell.innerHTML = "";
                cell.matchObject = null;
                cell.removeAttribute("completed");
                showMessage("👽 Le pripri extraterrestre s'est dissous");
                return;
            }
        }

        if (!producedId) return;

        placeObject(
            emptyCell,
            new MatchObject(producedId, producedLevel)
        );
    });
});
/* ===============================
   ÉNERGIE AUTO
================================ */
setInterval(() => {
    if (player.energy >= MAX_ENERGY) return;

    if (Date.now() - player.lastEnergyTick >= ENERGY_REGEN_TIME) {
        player.energy++;
        player.lastEnergyTick = Date.now();
    }

    document.querySelector(".energy").textContent = player.energy;
}, 1000);

/* ===============================
   UI
================================ */
document.querySelector(".money").textContent = player.money;
document.querySelector(".energy").textContent = player.energy;

/* ===============================
   SELECTION
================================ */
setInterval(() => {
    grid.querySelectorAll("img").forEach((curElement) => {
        curElement.onclick = () => {
            grid.querySelectorAll("img").forEach((secCurElement) => {
                secCurElement.removeAttribute("selected");
            });
            curElement.setAttribute("selected", "");
        };
    });
    if (grid.querySelector('img[selected]')) {
       var selection = grid.querySelector('img[selected]').dataset,
       texteOfBubule = '<strong>' + OBJECT_NAMES[selection.id] + '</strong>' + ' niv. ' + selection.level;
       if (texteOfBubule.includes('⚡')) {
           texteOfBubule = '<strong>' + OBJECT_NAMES[selection.id] + '</strong> niv. ' + selection.level + ". PRDUCTEUR consommant de l'ÉNERGIE.";
       }
       document.querySelector('.textBuBule text').innerHTML = texteOfBubule;
       document.querySelector('.textBuBule').removeAttribute('no-selection');
    }else{
       document.querySelector('.textBuBule text').innerHTML = 'aucun objet selectionné';
       document.querySelector('.textBuBule').setAttribute('no-selection', '');
    }
}, 10);
/* ==============================
   informations
=============================== */
var infoDialog = {remove: () => console.error("Uncaught Error: no window is open for info"), open: () => {}, onclose: null, innerHTML: "<dialog></dialog>", querySelector: () => {return {value: ""}}};
function showInfo(getObjectID, getObjectLevel) {
    infoDialog = document.createElement('dialog');
    var curentCollectionHTML = "",
    curentCollectionArray = OBJECT_NAMES.allIsArray.filter(item => item.startsWith(getObjectID.substring(0, 3)));
    curentCollectionArray.forEach((curentCollectionItem) => {
       if (curentCollectionItem == getObjectID) {
          curentCollectionHTML += '<img src="icons/' + getObjectID + '.png" selected>'
       }else{
          curentCollectionHTML += '<img src="icons/' + curentCollectionItem + '.png" selected>'
       }
    });
    infoDialog.innerHTML = `<div class="windowTitle">information sur ${OBJECT_NAMES[getObjectID]}</div><div class="content"><h1>"${OBJECT_NAMES[grid.querySelector('img[selected]').dataset.id]}" est au niveau ${OBJECT_NAMES[getObjectLevel]} :</h1><img src="icons/${grid.querySelector('img[selected]').dataset.id}.png"></div><div class="objectColection">${curentCollectionHTML}</div><div class="buttons"><button onclick="infoDialog.close();">fermer</button><select id="getPosition"><option disabled="">trouver</option><option>producteur</option><option>cet objet</option></select><button disabled="">voir la boutique</button></div>`;
    infoDialog.className = "infoPannel";
    infoDialog.querySelector("#getPosition").value = "trouver";
    document.body.appendChild(infoDialog);
    infoDialog.show();
    infoDialog.onclose = () => {
       infoDialog.remove();
    }
}
/* ==============================
   select d'options
=============================== */
options.value = 'options';
options.onchange = () => {
    switch (options.value) {
        case "informations et propriétées": 
            showInfo(grid.querySelector('img[selected]').dataset.id, grid.querySelector('img[selected]').dataset.level);
          break;
    }
    options.value = 'options';
}
/* ===============================
   FIN SCRIPT
================================ */
