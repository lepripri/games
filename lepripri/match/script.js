/* =====================================================
   PRIPRI GAME – COMMANDES & PROGRESSION (FINAL)
   compatible avec TON HTML / CSS
===================================================== */

/* ===============================
   NOMS DES OBJETS
================================ */
const OBJECT_NAMES = {
    CPP1: "pripri simple",
    CPP2: "pripri double",
    CPP3: "pripri triple",
    CPP4: "pripri quadruple",
    CPP5: "pripri RJ45",
    CPP6: "pripri USB+RJ45",
    CPP7: "pripri 7 USB",
    CPP8: "⚡ maman pripri",
    CPP9: "⚡ pripri extraterrestre",
    RDP1: "boîte vide",
    RDP2: "⚡ boîte à un pripri",
    RDP3: "⚡ boîte un peu pleine",
    RDP4: "⚡ boîte bien pleine",
    RDP5: "⚡ boîte pleine",
    RDP6: "⚡ ville de priprix"
};

/* ===============================
   PERSONNAGES DES COMMANDES
================================ */
const COMMAND_PERSONS = [
    { img: "camille.png", levelGain: 0.1, difficulty: 1 },
    { img: "pripri farceur.png", levelGain: 0.1, difficulty: 1 },
    { img: "pripri gourmand.png", levelGain: 0.3, difficulty: 3 },
    { img: "dixo.png", levelGain: 0.2, difficulty: 2 },
    { img: "maman pripri.png", levelGain: 0.15, difficulty: 2 },
    { img: "papa pripri.png", levelGain: 0.15, difficulty: 2 },
    { img: "pripri du bout du monde.png", levelGain: 0.25, difficulty: 3 },
    { img: "plancequot.png", levelGain: 0, difficulty: 3, noReward: true },
    { img: "pripri inteligent.png", levelGain: 0.2, difficulty: 2 },
    { img: "agent d'entretient milliminutes.png", levelGain: 0.1, difficulty: 1 },
    { img: "djixy.png", levelGain: 0.25, difficulty: 3 }
];

/* ===============================
   DONNÉES JOUEUR
================================ */
const gamesStorage = JSON.parse(localStorage.games || "{}");
gamesStorage.match ??= { level: 1 };
localStorage.games = JSON.stringify(gamesStorage);

/* ===============================
   MODÈLE COMMANDE
================================ */
class AwaitCommand {
    constructor(person, targets) {
        this.person = person;
        this.targets = targets;
        this.progress = {};
        targets.forEach(t => this.progress[t.id] = 0);
        this.el = null;
    }
}

/* ===============================
   GÉNÉRATION DES OBJECTIFS
================================ */
function generateTargets(difficulty) {
    const ids = Object.keys(OBJECT_NAMES);
    const amount = difficulty + 1;

    return Array.from({ length: amount }, () => {
        const id = ids[Math.floor(Math.random() * ids.length)];
        return { id, qty: Math.ceil(Math.random() * difficulty) };
    });
}

/* ===============================
   COMMANDES ACTIVES
================================ */
const commandContainer = document.querySelector(".command");
const activeCommands = [];

/* ===============================
   SPAWN COMMANDE
================================ */
function spawnCommand() {
    if (activeCommands.length >= 3) return;

    const person =
        COMMAND_PERSONS[Math.floor(Math.random() * COMMAND_PERSONS.length)];
    const targets = generateTargets(person.difficulty);
    const cmd = new AwaitCommand(person, targets);

    const picture = document.createElement("div");
    picture.className = "command-picture";
    picture.innerHTML = `<img src="${person.img}">`;

    const awaitDiv = document.createElement("div");
    awaitDiv.className = "await-command";
    awaitDiv.innerHTML = `
        <div class="reward">
            ${
                person.noReward
                    ? "<div>⚠️ aucune récompense</div>"
                    : `<div>+${Math.round(person.levelGain * 100)}% niveau</div>`
            }
        </div>
        <div class="cible"></div>
    `;

    cmd.el = awaitDiv;

    commandContainer.appendChild(picture);
    commandContainer.appendChild(awaitDiv);

    activeCommands.push(cmd);
    renderTargets(cmd);
}

/* ===============================
   AFFICHAGE DES CIBLES
================================ */
function renderTargets(cmd) {
    const cible = cmd.el.querySelector(".cible");
    cible.innerHTML = "";

    cmd.targets.forEach(t => {
        const div = document.createElement("div");
        div.textContent =
            `${OBJECT_NAMES[t.id]} ${cmd.progress[t.id]}/${t.qty}`;
        cible.appendChild(div);
    });
}

/* ===============================
   LIVRAISON OBJET
================================ */
function deliverObject(obj) {
    for (const cmd of activeCommands) {
        const target = cmd.targets.find(t => t.id === obj.id);
        if (!target) continue;

        if (cmd.progress[obj.id] < target.qty) {
            cmd.progress[obj.id]++;
            renderTargets(cmd);
            checkCommandDone(cmd);
            return true;
        }
    }
    return false;
}

/* ===============================
   COMMANDE TERMINÉE
================================ */
function checkCommandDone(cmd) {
    const done = cmd.targets.every(
        t => cmd.progress[t.id] >= t.qty
    );
    if (!done) return;

    if (!cmd.person.noReward) {
        gamesStorage.match.level += cmd.person.levelGain;
    }

    const picture = cmd.el.previousElementSibling;
    picture?.remove();
    cmd.el.remove();

    activeCommands.splice(activeCommands.indexOf(cmd), 1);
    spawnCommand();

    localStorage.games = JSON.stringify(gamesStorage);
}

/* ===============================
   DOUBLE CLIC SUR GRILLE
================================ */
document.querySelectorAll("#grid th").forEach(cell => {
    cell.addEventListener("dblclick", () => {
        const obj = cell.matchData;
        if (!obj) return;

        if (deliverObject(obj)) {
            cell.innerHTML = "";
            cell.removeAttribute("completed");
            cell.matchData = null;
        }
    });
});

/* ===============================
   INIT
================================ */
spawnCommand();
spawnCommand();
