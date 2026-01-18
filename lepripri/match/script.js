"use strict";

/* ==========================================================
   CONSTANTES
========================================================== */

const GRID_SIZE = 8;
const ICON_PATH = "icons/";
const NON_FUSIONABLE_PREFIX = ["CEN", "CHEST", "COFFRE"]; // FIX ERREUR
const JOKER_ID = "JOKER";

/* ==========================================================
   OUTILS
========================================================== */

function getIconPath(file) {
    if (!file) return ICON_PATH + "Warning.png";
    if (file.startsWith(ICON_PATH)) return file;
    return ICON_PATH + file;
}

function showErrorImage(img, name) {
    img.onerror = () => {
        showMessage("Image manquante : " + name);
        img.src = ICON_PATH + "Warning.png";
    };
}

/* ==========================================================
   ÉTAT DU JEU
========================================================== */

let selectedCell = null;

const grid = [];
const board = document.getElementById("grid");

/* ==========================================================
   INITIALISATION
========================================================== */

function initGrid() {
    board.innerHTML = "";
    grid.length = 0;

    for (let y = 0; y < GRID_SIZE; y++) {
        const row = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.x = x;
            cell.dataset.y = y;

            cell.addEventListener("click", () => onCellClick(cell));

            board.appendChild(cell);
            row.push(null);
        }
        grid.push(row);
    }

    // TEST OBJETS DE DÉPART (pour voir le merge)
    spawnObject(0, 0, createObject("PCS01", 1));
    spawnObject(1, 0, createObject("PCS01", 1));
    spawnObject(2, 0, createObject("JOKER", 0));
}

/* ==========================================================
   OBJETS
========================================================== */

function createObject(id, level) {
    return {
        id,
        level,
        image: id + ".png"
    };
}

function isNonFusionable(obj) {
    return NON_FUSIONABLE_PREFIX.some(p => obj.id.startsWith(p));
}

/* ==========================================================
   AFFICHAGE
========================================================== */

function renderObject(obj) {
    const div = document.createElement("div");
    div.className = "item";
    div.dataset.id = obj.id;
    div.dataset.level = obj.level;

    const img = document.createElement("img");
    img.src = getIconPath(obj.image);
    img.draggable = false;

    showErrorImage(img, obj.image);

    div.appendChild(img);
    return div;
}

/* ==========================================================
   PLATEAU
========================================================== */

function spawnObject(x, y, obj) {
    const index = y * GRID_SIZE + x;
    const cell = board.children[index];
    if (!cell || cell.firstChild) return;

    grid[y][x] = obj;
    cell.appendChild(renderObject(obj));
}

function clearCell(cell) {
    const x = +cell.dataset.x;
    const y = +cell.dataset.y;
    grid[y][x] = null;
    cell.innerHTML = "";
}

/* ==========================================================
   MERGE
========================================================== */

function canMerge(a, b) {
    if (!a || !b) return false;

    // Joker
    if (a.id === JOKER_ID || b.id === JOKER_ID) {
        if (isNonFusionable(a) || isNonFusionable(b)) return false;
        return true;
    }

    if (isNonFusionable(a) || isNonFusionable(b)) return false;

    return a.id === b.id && a.level === b.level;
}

function merge(cellA, cellB) {
    const ax = +cellA.dataset.x;
    const ay = +cellA.dataset.y;
    const bx = +cellB.dataset.x;
    const by = +cellB.dataset.y;

    const a = grid[ay][ax];
    const b = grid[by][bx];

    if (!canMerge(a, b)) return;

    const base = a.id === JOKER_ID ? b : a;
    const newObj = createObject(base.id, base.level + 1);

    clearCell(cellA);
    clearCell(cellB);
    spawnObject(ax, ay, newObj);
}

/* ==========================================================
   INTERACTIONS
========================================================== */

function onCellClick(cell) {
    if (!cell.firstChild) {
        selectedCell = null;
        return;
    }

    if (!selectedCell) {
        selectedCell = cell;
        cell.classList.add("selected");
        return;
    }

    if (selectedCell === cell) {
        selectedCell.classList.remove("selected");
        selectedCell = null;
        return;
    }

    selectedCell.classList.remove("selected");
    merge(selectedCell, cell);
    selectedCell = null;
}

/* ==========================================================
   LANCEMENT
========================================================== */

initGrid();
