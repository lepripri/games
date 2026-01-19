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

    PCS1: "🪙 1 pièce",
    PCS2: "🪙 3 pièces",
    PCS3: "🪙 7 pièces",
    PCS4: "🪙 15 pièces",
    PCS5: "🪙 32 pièces",

    ENR1: "⚡ 2 énergies",
    ENR2: "⚡ 5 énergies",
    ENR3: "⚡ 15 énergies",
    ENR4: "⚡ 40 énergies",
    ENR5: "⚡ 100 énergies",

    DFU1: "💎 1 fonctionnalité payantes",
    DFU2: "💎 3 fonctionnalités payantes",
    DFU3: "💎 7 fonctionnalités payantes",
    DFU4: "💎 15 fonctionnalités payantes",
    DFU5: "💎 32 fonctionnalités payantes",

    CFR1: "sachet bleu",
    CFR2: "sachet violet",
    CFR3: "boite transparente",
    CFR4: "petit coffret",
    CFR5: "grand coffret",
    CFR6: "grand coffre",
    CFR7: "coffre XXL"
};

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

function placeObject(cell, obj, isMerge) {
    cell.innerHTML = "";
    const img = document.createElement("img");
    img.src = `icons/${obj.id}.png`;
    img.draggable = true;
    img.dataset.id = obj.id;
    img.dataset.level = obj.level;
    cell.appendChild(img);
    cell.setAttribute("completed", "");
    cell.matchObject = obj;
    if (isMerge) {
       img.setAttribute("selected", "")
    }
}

/* ===============================
   INITIALISATION PLATEAU
================================ */
clearGrid();

// objets de départ (exemple jouable)
placeObject(gridCells[17], new MatchObject("CPP1", 1));
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
/* ===============================
   FIN SCRIPT
================================ */
