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
    if (boxed != undefined || boxed != null) { // si boxed vaut 0, il seras mis quand même (pas de problèmes)
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
        if (e.target.getAttribute("locked")) return;
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
   select d'options
=============================== */
options.value = 'options';
options.onchange = () => {
    switch (options.value) {
        case "informations et propriétées": /* no action */ break;
    }
    options.value = 'options';
}
/* ===============================
   FIN SCRIPT
================================ */
