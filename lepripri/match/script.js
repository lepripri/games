/* ===============================
   OBJET MATCH
================================ */
class matchObject {
    constructor(data = {}) {
        return {
            filled: data.filled ?? false,
            id: data.id ?? null,
            locked: data.locked ?? false,
            cooldownEnd: data.cooldownEnd ?? 0,
            boxed: data.boxed ?? { trued: false, level: 0 },
            product: data.product ?? {
                items: [],
                energyConsomation: false,
                possibility: false
            }
        };
    }
}

/* ===============================
   DONNÉES INITIALES
================================ */
const preInitiation = {
    energy: { level: 100 },
    level: 1,
    grid: [
        [
            { filled: true, id: "RDP3", locked: true, cooldownEnd: Date.now() + 5 * 60 * 1000, boxed: { trued: true, level: 2 }, product: { items: [], energyConsomation: true, possibility: false } },
            { filled: true, id: "CPP2", locked: true, cooldownEnd: Date.now() + 90 * 1000, boxed: { trued: true, level: 0 }, product: { items: [], energyConsomation: true, possibility: false } }
        ]
    ]
};

/* ===============================
   LOCAL STORAGE
================================ */
if (!localStorage.games) {
    localStorage.games = JSON.stringify({ match: preInitiation });
}
const gamesStorage = JSON.parse(localStorage.games);

/* ===============================
   OUTILS
================================ */
function getRemaining(cell) {
    return Math.max(0, (cell.cooldownEnd || 0) - Date.now());
}

function getUnlockCost(cell) {
    const remaining = getRemaining(cell);
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / (2 * 60 * 1000)) * 50;
}

function formatTime(ms) {
    const s = Math.ceil(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* ===============================
   RENDU GRILLE
================================ */
const gridCells = document.querySelectorAll("#grid th");

gamesStorage.match.grid.flat().forEach((obj, i) => {
    const cell = gridCells[i];
    const data = new matchObject(obj);
    cell.matchData = data;

    if (data.filled) {
        cell.setAttribute("completed", "");
        const img = document.createElement("img");
        img.src = `icons/${data.id}.png`;
        img.draggable = false;
        if (data.boxed.trued) img.hidden = true;
        if (data.locked) cell.setAttribute("disabled", "");
        cell.appendChild(img);
    }
});

/* ===============================
   SÉLECTION
================================ */
let selectedCell = null;
const bubble = document.querySelector(".textBuBule");
const options = document.getElementById("options");
const unlockOption = options.querySelector(".unlock");

gridCells.forEach(th => {
    th.addEventListener("click", () => {
        if (!th.matchData) return;
        selectedCell = th.matchData;
        updateBubble();
    });
});

/* ===============================
   BUBBLE / OPTIONS
================================ */
function updateBubble() {
    if (!selectedCell) {
        bubble.setAttribute("no-selection", "");
        return;
    }

    bubble.removeAttribute("no-selection");

    if (!selectedCell.locked) {
        unlockOption.hidden = true;
        return;
    }

    const remaining = getRemaining(selectedCell);
    const cost = getUnlockCost(selectedCell);

    unlockOption.hidden = false;
    unlockOption.textContent =
        cost > 0
            ? `dévérrouiller cet objet [${cost}🪙]`
            : "dévérrouiller cet objet";

    bubble.style.borderColor =
        remaining > 2 * 60 * 1000 ? "red" : "blue";
}

/* ===============================
   ACTION SELECT
================================ */
options.addEventListener("change", () => {
    const opt = options.selectedOptions[0];
    if (!opt || !selectedCell) return;

    if (opt.classList.contains("unlock")) {
        const cost = getUnlockCost(selectedCell);
        const moneyUI = document.querySelector(".money");
        let money = Number(moneyUI.textContent);

        if (money < cost) {
            options.value = "options";
            return;
        }

        money -= cost;
        moneyUI.textContent = money;

        selectedCell.locked = false;
        selectedCell.cooldownEnd = 0;

        updateBubble();
    }

    options.value = "options";
});

/* ===============================
   RAFRAÎCHISSEMENT TEMPS RÉEL
================================ */
setInterval(() => {
    if (selectedCell) updateBubble();
    localStorage.games = JSON.stringify(gamesStorage);
}, 1000);
