/* ============================================================
   CONSTANTES
============================================================ */

// Énergie
const ENERGY_LEVELS = { 1:2, 2:5, 3:15, 4:40, 5:100 };
const ENERGY_MAX_LEVEL = 5;

// Coffres / non fusionnables
const CHEST_IDS = ["CFR1","CFR2","CFR3","CFR4","CFR5","CFR6","CFR7","CEN1"];

// Joker
const JOKER_ID = "JOKER";

// Player
const player = {
    energy: 0,
    energyMax: 100,
    money: 0,
    level: 1
};

/* ============================================================
   OUTILS
============================================================ */

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function now() {
    return Date.now();
}

function isChest(obj) {
    return CHEST_IDS.includes(obj.id);
}

/* ============================================================
   OBJET DE JEU
============================================================ */

class GameObject {
    constructor(data = {}) {
        this.id = data.id;
        this.level = data.level ?? 1;
        this.filled = true;
        this.locked = data.locked ?? false;

        // production
        this.cooldown = data.cooldown ?? 0;
        this.cooldownEnd = 0;

        // énergie / consommation
        this.useEnergy = data.useEnergy ?? false;
        this.energyCost = data.energyCost ?? 0;

        // consommation d’objet
        this.usesLeft = data.usesLeft ?? null;
        this.maxUses = data.maxUses ?? null;

        // production
        this.product = data.product ?? null;
    }
}

/* ============================================================
   SPAWN / REMOVE
============================================================ */
const gridCells = document.querySelectorAll("#grid th");

function getEmptyCell() {
    return [...gridCells].find(c => !c.hasAttribute("completed"));
}

function spawnObject(id, level = 1) {
    const cell = getEmptyCell();
    if (!cell) {
        showMessage("Plus de place sur le plateau");
        return;
    }

    const img = document.createElement("img");
    img.src = `icons/${id}.png`;
    img.draggable = true;

    img.onerror = () => {
        showMessage(`Image manquante : ${id}.png`);
    };

    img.dataset.id = id;
    img.dataset.level = level;

    cell.appendChild(img);
    cell.setAttribute("completed", "");
}

function removeObject(obj) {
    console.log("REMOVE:", obj.id, obj.level);
}

/* ============================================================
   FUSION
============================================================ */

function tryMerge(a, b) {

    // ❌ coffres jamais fusionnables
    if (isChest(a) || isChest(b)) return false;

    // 🃏 JOKER
    if (a.id === JOKER_ID || b.id === JOKER_ID) {
        const target = a.id === JOKER_ID ? b : a;
        if (target.level >= getMaxLevel(target.id)) return false;

        removeObject(a);
        removeObject(b);
        spawnObject(target.id, target.level + 1);
        return true;
    }

    // ⚡ énergie
    if (a.id === "ENERGY" && b.id === "ENERGY") {
        if (a.level !== b.level || a.level >= ENERGY_MAX_LEVEL) return false;
        removeObject(a);
        removeObject(b);
        spawnObject("ENERGY", a.level + 1);
        return true;
    }

    // 🔁 fusion classique
    if (a.id !== b.id || a.level !== b.level) return false;
    if (a.level >= getMaxLevel(a.id)) return false;

    removeObject(a);
    removeObject(b);
    spawnObject(a.id, a.level + 1);
    return true;
}

function getMaxLevel(id) {
    if (id === "ENERGY") return ENERGY_MAX_LEVEL;
    return 5; // valeur par défaut (modifiable)
}

/* ============================================================
   PRODUCTION
============================================================ */

function canProduce(obj) {
    if (obj.locked) return false;
    if (obj.cooldownEnd > now()) return false;
    if (obj.useEnergy && player.energy < obj.energyCost) return false;
    if (obj.usesLeft !== null && obj.usesLeft <= 0) return false;
    return true;
}

function produce(obj) {
    if (!canProduce(obj)) return;

    // énergie
    if (obj.useEnergy) {
        player.energy -= obj.energyCost;
    }

    // usage
    if (obj.usesLeft !== null) {
        obj.usesLeft--;
    }

    // production énergie (CEN1)
    if (obj.id === "CEN1") {
        const lvl = rand(1, 3);
        spawnObject("ENERGY", lvl);
    }

    // autres producteurs
    if (obj.product) {
        spawnObject(obj.product.id, obj.product.level ?? 1);
    }

    // cooldown
    if (obj.cooldown > 0) {
        obj.cooldownEnd = now() + obj.cooldown;
    }

    // destruction
    if (obj.usesLeft === 0) {
        removeObject(obj);
    }
}

/* ============================================================
   RÉCUPÉRATION ÉNERGIE
============================================================ */

function collectEnergy(obj) {
    if (obj.id !== "ENERGY") return;
    const value = ENERGY_LEVELS[obj.level] ?? 0;
    player.energy = Math.min(player.energy + value, player.energyMax);
    removeObject(obj);
}

/* ============================================================
   COMMANDES (STRUCTURE)
============================================================ */

class Command {
    constructor(data) {
        this.person = data.person;
        this.need = data.need; // {id, level}
        this.reward = data.reward; // {money, energy, objects}
        this.progress = 0;
    }
}

const activeCommands = [];

function completeCommand(cmd) {
    player.money += cmd.reward.money ?? 0;
    player.energy = Math.min(player.energy + (cmd.reward.energy ?? 0), player.energyMax);

    if (cmd.reward.objects) {
        cmd.reward.objects.forEach(o => spawnObject(o.id, o.level));
    }

    player.level += cmd.reward.levelGain ?? 0;
}

/* ============================================================
   MESSAGE ERREUR IMAGE OFFLINE
============================================================ */

function showMessage(data, OPTIONALendScript) {
    var closer = () => {
        setTimeout(() => {
            dialog.close();
            dialog.remove();
            if (OPTIONALendScript) OPTIONALendScript();
        }, 350);
    };

    var dialog = document.createElement("dialog");
    dialog.innerHTML = '<img src="icons/Warning.png">' + data;
    dialog.className = "message";

    var Opener = () => {
        if (document.querySelector("dialog.message")) return;
        document.body.appendChild(dialog);
        dialog.showModal();
        dialog.addEventListener("click", closer);
        setTimeout(closer, 2000);
    };
    Opener();
}

window.addEventListener("load", () => {

    // Producteur de départ
    spawnObject("RDP1", 1);

    // Objets de départ
    spawnObject("CPP1", 1);
    spawnObject("CPP1", 1);

    // Énergie initiale
    spawnObject("ENERGY", 1);
    spawnObject("ENERGY", 1);

});
