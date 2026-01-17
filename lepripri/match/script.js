/* =====================================================
   LE PRIPRI – MATCH GAME (JS FINAL AVANT PLAY STORE)
   Version web (GitHub Pages) -> offline-ready
   Auteur : Camille
===================================================== */

/* ===============================
   MESSAGE ERREUR (FOURNI)
================================ */
function showMessage(data, OPTIONALendScript) {
    var closer = () => {
        setTimeout(() => {
            dialog.close();
            dialog.remove();
            if (OPTIONALendScript) OPTIONALendScript();
        }, 350);
    }, dialog = document.createElement("dialog");

    dialog.innerHTML = '<img src="https://lepripri.github.io/lepripri/icons/Warning.png">' + data;
    dialog.className = "message";

    var Opener = () => {
        if (document.querySelector('dialog.message')) return null;
        document.body.appendChild(dialog);
        dialog.showModal();
        dialog.addEventListener("click", closer);
        dialog.addEventListener("keydown", closer);
        document.addEventListener("keydown", closer);
        setTimeout(closer, 2000);
        return dialog;
    };
    return Opener();
}

/* ===============================
   NOM DES OBJETS
================================ */
const OBJECT_NAMES = {
    CPP1: "pripri simple",
    CPP2: "pripri double",
    CPP3: "pripri triple",
    CPP4: "pripri quadruple",
    CPP5: "pripri triple RJ45",
    CPP6: "pripri triple USB + RJ45",
    CPP7: "pripri 7 USB",
    CPP8: "⚡ maman pripri",
    CPP9: "⚡ pripri extraterrestre magique",

    RDP1: "boîte vide",
    RDP2: "⚡ boîte à un pripri",
    RDP3: "⚡ boîte un peu pleine",
    RDP4: "⚡ boîte bien pleine",
    RDP5: "⚡ boîte pleine",
    RDP6: "⚡ ville de priprix"
};

/* ===============================
   IMAGE STRICTE (OFFLINE)
================================ */
let IMAGE_ERROR_SHOWN = false;

function loadImageStrict(id) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = `icons/${id}.png`;
        img.onload = () => resolve(img);
        img.onerror = () => {
            if (!IMAGE_ERROR_SHOWN) {
                IMAGE_ERROR_SHOWN = true;
                showMessage(`
                    <b>Erreur critique</b><br><br>
                    Image manquante : <code>${id}.png</code><br>
                    L'application fonctionne hors ligne.<br><br>
                    Vérifie les assets avant Play Store.
                `);
            }
            reject(id);
        };
    });
}

/* ===============================
   STRUCTURE OBJET
================================ */
class MatchObject {
    constructor(data) {
        this.filled = data.filled;
        this.id = data.id;
        this.locked = data.locked || false;
        this.cooldownEnd = data.cooldownEnd || 0;
        this.boxed = data.boxed || { trued: false, level: 0 };
        this.product = data.product || { items: [], energyConsomation: false };
    }
}

/* ===============================
   DONNÉES INITIALES
================================ */
const GAME_DATA = {
    energy: { value: 100, max: 100 },
    money: 0,
    level: 1,
    grid: [
        { filled: true, id: "RDP3", locked: true, cooldownEnd: Date.now() + 300000 },
        { filled: true, id: "CPP2", locked: true, cooldownEnd: Date.now() + 90000 }
    ]
};

/* ===============================
   RENDU GRILLE
================================ */
async function renderGrid() {
    const cells = document.querySelectorAll("#grid th");
    GAME_DATA.grid.forEach(async (data, i) => {
        if (!data.filled || !cells[i]) return;
        const obj = new MatchObject(data);
        try {
            const img = await loadImageStrict(obj.id);
            img.draggable = false;
            img.title = OBJECT_NAMES[obj.id] || obj.id;
            cells[i].innerHTML = "";
            cells[i].appendChild(img);
            cells[i].matchData = obj;
            cells[i].setAttribute("completed", "");
            if (obj.locked) cells[i].setAttribute("disabled", "");
        } catch (e) {}
    });
}

/* ===============================
   BUBBLE / OPTIONS
================================ */
const bubble = document.querySelector(".textBuBule");
const options = document.getElementById("options");
let selectedCell = null;

function updateBubble() {
    if (!selectedCell) {
        bubble.setAttribute("no-selection", "");
        return;
    }
    bubble.removeAttribute("no-selection");
}

/* ===============================
   SÉLECTION CELLULE
================================ */
document.querySelectorAll("#grid th").forEach(cell => {
    cell.addEventListener("click", () => {
        selectedCell = cell.matchData || null;
        updateBubble();
    });
});

/* ===============================
   LANCEMENT
================================ */
window.addEventListener("load", () => {
    renderGrid();
});

/* =====================================================
   FIN – prêt pour GitHub Pages
   (offline strict avant Play Store)
===================================================== */
