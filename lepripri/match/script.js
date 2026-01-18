/* ===============================
   TEST UNIQUE DES ICÔNES
================================ */

const ICONS_TO_CHECK = [
    // Pripri
    "CPP1.png","CPP2.png","CPP3.png","CPP4.png","CPP5.png",
    "CPP6.png","CPP7.png","CPP8.png","CPP9.png",

    // Producteurs / boîtes
    "RDP1.png","RDP2.png","RDP3.png","RDP4.png","RDP5.png","RDP6.png",

    // Énergie
    "ENR1.png","ENR2.png","ENR3.png","ENR4.png","ENR5.png",

    // Pièces
    "PCS1.png","PCS2.png","PCS3.png","PCS4.png","PCS5.png",

    // Coffres énergie
    "CEN1.png",

    // Outils
    "TBC1.png","TBC2.png",

    // UI
    "Warning.png"
];

let ICON_CHECK_DONE = false;

function checkIconsOnce() {
    if (ICON_CHECK_DONE) return;
    ICON_CHECK_DONE = true;

    let missing = [];
    let checked = 0;

    ICONS_TO_CHECK.forEach(name => {
        const img = new Image();
        img.onload = () => checked++;
        img.onerror = () => {
            missing.push(name);
            checked++;
        };
        img.src = "icons/" + name;
    });

    const wait = setInterval(() => {
        if (checked >= ICONS_TO_CHECK.length) {
            clearInterval(wait);

            if (missing.length > 0) {
                showMessage(
                    "⚠️ Icônes manquantes :<br>" +
                    missing.join("<br>")
                );
            }
        }
    }, 50);
}

// 🔥 appel UNIQUE
checkIconsOnce();

/* ===============================
   MESSAGE SYSTÈME (ANTI-SPAM)
================================ */

let MESSAGE_LOCK = false;

function showMessage(data, OPTIONALendScript) {
    if (MESSAGE_LOCK) return null;
    MESSAGE_LOCK = true;

    const dialog = document.createElement("dialog");
    dialog.className = "message";
    dialog.innerHTML = '<img src="icons/Warning.png">' + data;

    const closeMessage = () => {
        if (!dialog.open) return;
        dialog.close();
        dialog.remove();
        MESSAGE_LOCK = false;
        if (OPTIONALendScript) OPTIONALendScript();
    };

    document.body.appendChild(dialog);
    dialog.showModal();

    dialog.addEventListener("click", closeMessage);
    dialog.addEventListener("keydown", closeMessage);

    setTimeout(closeMessage, 2000);

    return dialog;
}
/* ===============================
   CONSTANTES GLOBALES
================================ */

// objets NON fusionnables par préfixe
const NON_FUSIONABLE_PREFIX = ["CFR", "CEN", "TBC"];

// valeurs énergie
const ENERGY_VALUES = [2, 5, 15, 40, 100];

// limites commandes
const COMMAND_MIN = 3;
const COMMAND_MAX = 6;

// énergie globale
const ENERGY_MAX = 100;
const ENERGY_REGEN_TIME = 2 * 60 * 1000; // 1 énergie / 2 min

/* ===============================
   OUTILS IMAGES
================================ */

// corrige PCS01 → PCS1
function getIconPath(id) {
    const clean = id.replace(/0+(\d)/, "$1");
    return `icons/${clean}.png`;
}

function createImg(id) {
    const img = document.createElement("img");
    img.src = getIconPath(id);
    img.draggable = false;
    img.onerror = () => {
        showMessage("❌ Image manquante : " + img.src);
        img.src = "icons/Warning.png";
    };
    return img;
}

/* ===============================
   OBJET JEU
================================ */

class GameObject {
    constructor({ id, level = 1, locked = false, producer = false, energyCost = 0, maxUse = null }) {
        this.id = id;
        this.level = level;
        this.locked = locked;
        this.producer = producer;
        this.energyCost = energyCost;
        this.usesLeft = maxUse;
        this.cooldownEnd = 0;
    }
}

/* ===============================
   MERGE
================================ */

function canMerge(a, b) {
    if (!a || !b) return false;

    // joker
    if (a.id === "JOKER" || b.id === "JOKER") {
        return !isChest(a) && !isChest(b);
    }

    if (a.id !== b.id) return false;
    if (a.level !== b.level) return false;

    return true;
}

function isChest(obj) {
    return NON_FUSIONABLE_PREFIX.some(p => obj.id.startsWith(p));
}

function mergeObjects(a, b) {
    return new GameObject({
        id: a.id,
        level: a.level + 1,
        producer: a.producer,
        energyCost: a.energyCost
    });
}

/* ===============================
   ÉNERGIE
================================ */

let energy = 50;
let lastEnergyTick = Date.now();

function regenEnergy() {
    const now = Date.now();
    const gain = Math.floor((now - lastEnergyTick) / ENERGY_REGEN_TIME);
    if (gain > 0) {
        energy = Math.min(ENERGY_MAX, energy + gain);
        lastEnergyTick += gain * ENERGY_REGEN_TIME;
        updateEnergyUI();
    }
}

/* ===============================
   PRODUCTEURS
================================ */

function useProducer(cell, boost = 1) {
    const obj = cell.obj;
    if (!obj.producer) return;

    const cost = obj.energyCost * boost;
    if (obj.energyCost > 0 && energy < cost) return;

    energy -= cost;
    updateEnergyUI();

    const levelBonus = boost === 2 ? 1 : boost === 4 ? 2 : 0;

    const produced = new GameObject({
        id: obj.id,
        level: obj.level + levelBonus
    });

    placeInGrid(produced);

    if (obj.usesLeft !== null) {
        obj.usesLeft--;
        if (obj.usesLeft <= 0) removeObject(cell);
    }
}

/* ===============================
   COFFRE ÉNERGIE (CEN1)
================================ */

function openEnergyChest(cell) {
    const chest = cell.obj;
    for (let i = 0; i < 10; i++) {
        const lvl = Math.floor(Math.random() * 3) + 1;
        const val = ENERGY_VALUES[lvl - 1];
        placeInGrid(new GameObject({ id: "ENERGY", level: lvl, value: val }));
    }
    removeObject(cell);
}

/* ===============================
   COMMANDES
================================ */

const PEOPLE = [
    "camille.png",
    "pripri farceur.png",
    "pripri gourmand.png",
    "dixo.png",
    "maman pripri.png",
    "papa pripri.png",
    "pripri du bout du monde.png",
    "plancequot.png",
    "pripri inteligent.png",
    "djixy.png"
];

function generateCommands(playerLevel) {
    const count = Math.floor(Math.random() * (COMMAND_MAX - COMMAND_MIN + 1)) + COMMAND_MIN;
    const container = document.querySelector(".await-command");
    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const div = document.createElement("div");
        div.className = "command";

        const pic = document.createElement("div");
        pic.className = "command-picture";
        const img = document.createElement("img");
        img.src = `icons/${PEOPLE[Math.floor(Math.random() * PEOPLE.length)]}`;
        pic.appendChild(img);

        const reward = document.createElement("div");
        reward.className = "reward";
        reward.innerHTML = `<div>+${30 + playerLevel * 5}🪙</div>`;

        div.appendChild(pic);
        div.appendChild(reward);
        container.appendChild(div);
    }
}

/* ===============================
   GRILLE
================================ */

const grid = document.querySelectorAll("#grid th");

function placeInGrid(obj) {
    for (const cell of grid) {
        if (!cell.obj) {
            cell.obj = obj;
            cell.innerHTML = "";
            cell.appendChild(createImg(obj.id));
            return true;
        }
    }
    return false;
}

function removeObject(cell) {
    cell.obj = null;
    cell.innerHTML = "";
}

/* ===============================
   UI
================================ */

function updateEnergyUI() {
    const e = document.querySelector(".energy");
    if (e) e.textContent = energy;
}

/* ===============================
   EVENTS
================================ */

let selected = null;

grid.forEach(cell => {
    cell.addEventListener("click", () => {
        selected = cell;
    });

    cell.addEventListener("dblclick", () => {
        if (!cell.obj) return;

        if (cell.obj.id === "CEN1") {
            openEnergyChest(cell);
        } else if (cell.obj.producer && !cell.obj.locked) {
            useProducer(cell, getBoostValue());
        }
    });
});

/* ===============================
   BOOST
================================ */

function getBoostValue() {
    const sel = document.getElementById("powerEnergy");
    if (!sel) return 1;
    if (sel.value === "2x") return 2;
    if (sel.value === "4x") return 4;
    return 1;
}

/* ===============================
   LOOP
================================ */

setInterval(() => {
    regenEnergy();
}, 1000);
/* ===============================
   INITIALISATION DU PLATEAU
================================ */

function initGrid() {
    // Producteur de base (ex: RDP2 ⚡)
    placeInGrid(new GameObject({
        id: "RDP2",
        level: 1,
        producer: true,
        energyCost: 1
    }));

    // Objet de départ
    placeInGrid(new GameObject({
        id: "CPP1",
        level: 1
    }));

    // Coffre énergie de départ (cliquable)
    placeInGrid(new GameObject({
        id: "CEN1",
        level: 1,
        producer: true,
        energyCost: 0,
        maxUse: 10
    }));

    generateCommands(1);
}

// 🔥 LANCEMENT
initGrid();
updateEnergyUI();
