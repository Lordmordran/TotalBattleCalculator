// =====================================
// Total Battle Calculator V4
// Part 3 - Settings & Startup
// =====================================


// ---------- CONSTANTS ----------

const SETTINGS = {

    // S9 stacks = G9 x this
    S9_MULTIPLIER: 1.0055,

    TIER_MULTIPLIER: 1.81,

    // Leadership used by one unit
    LEADERSHIP_COST: {

        Spearman:1,

        Archer:1,

        Rider:2,

        Flying:20,

        Tank:10

    },

    TANKS: {

        // E9 = S8 Flying (lions) x this
        E9_MULTIPLIER:1.2,

        // E8 = E9 x this
        E8_MULTIPLIER:1.8

    },

    OFFSETS: {

        Spearman:3,

        Archer:0,

        Rider:1,

        Flying:-1

    },

    MONSTERS:{

        M8_DIVISOR:6.3,

        M9_DIVISOR:1.85,

        M7_MULTIPLIER:2.21

    }

};


// ---------- ELEMENTS ----------

const leadershipInput =
    document.getElementById("leadership");

const trainingMultiplierInput =
    document.getElementById("trainingMultiplier");

const calculateButton =
    document.getElementById("calculateButton");

const results =
    document.getElementById("results");


// =====================================
// Part 4 - Tier Calculator
// =====================================


// ---------- TIER SIZES ----------

function getTierMultipliers(s9Multiplier){

    return {

        G9: 1,

        S9: s9Multiplier,

        G8: SETTINGS.TIER_MULTIPLIER,

        S8: SETTINGS.TIER_MULTIPLIER

    };

}


// ---------- G9 RANGED DIVISOR ----------

// Leadership used per G9 Ranged unit across the
// whole army (about 25.54 with a 1.0055 multiplier)

function getG9RangedDivisor(s9Multiplier){

    const cost =
        SETTINGS.LEADERSHIP_COST;

    // Leadership per ranged unit within one tier:
    // melee + ranged + mounted (ranged / 2) + flying (ranged / 20)
    const perTier =
        cost.Spearman +
        cost.Archer +
        (cost.Rider / 2) +
        (cost.Flying / 20);

    const tiers =
        getTierMultipliers(s9Multiplier);

    const tierTotal =
        tiers.G9 +
        tiers.S9 +
        tiers.G8 +
        tiers.S8;

    // Tanks follow S8 Flying (S8 ranged / 20)
    const tankTotal =
        cost.Tank *
        (tiers.S8 / 20) *
        (
            SETTINGS.TANKS.E9_MULTIPLIER +
            SETTINGS.TANKS.E9_MULTIPLIER *
            SETTINGS.TANKS.E8_MULTIPLIER
        );

    return (perTier * tierTotal) + tankTotal;

}


// =====================================
// Part 5 - Split Tier
// =====================================

// Death order: melee, ranged, mounted, flying

function splitTier(ranged){

    let archer =
        ranged + SETTINGS.OFFSETS.Archer;

    let spear =
        ranged + SETTINGS.OFFSETS.Spearman;

    let rider =
        Math.floor(
            ranged / 2
        ) + SETTINGS.OFFSETS.Rider;

    let flying =
        Math.max(
            0,
            Math.floor(
                rider / 10
            ) + SETTINGS.OFFSETS.Flying
        );

    return {

        spear,

        archer,

        rider,

        flying

    };

}


// =====================================
// Part 6 - Build Army
// =====================================

function buildArmy(g9Ranged, s9Multiplier){

    const tiers =
        getTierMultipliers(s9Multiplier);

    const stacks = {};

    for(const tier in tiers){

        stacks[tier] =
            splitTier(
                Math.floor(
                    g9Ranged *
                    tiers[tier]
                )
            );

    }

    const tanks = {};

    tanks.E9 =
        Math.floor(
            stacks.S8.flying *
            SETTINGS.TANKS.E9_MULTIPLIER
        );

    tanks.E8 =
        Math.floor(
            tanks.E9 *
            SETTINGS.TANKS.E8_MULTIPLIER
        );

    return {

        stacks,

        tanks

    };

}


// ---------- LEADERSHIP USED ----------

function getLeadershipUsed(army){

    const cost =
        SETTINGS.LEADERSHIP_COST;

    let used = 0;

    for(const tier in army.stacks){

        const stack =
            army.stacks[tier];

        used +=
            stack.spear * cost.Spearman +
            stack.archer * cost.Archer +
            stack.rider * cost.Rider +
            stack.flying * cost.Flying;

    }

    used +=
        (army.tanks.E9 + army.tanks.E8) *
        cost.Tank;

    return used;

}


// ---------- BEST FIT ARMY ----------

// Start from the divisor, then step G9 Ranged so the
// army uses as much leadership as possible without going over

function calculateArmy(totalLeadership, s9Multiplier){

    let g9Ranged =
        Math.floor(
            totalLeadership /
            getG9RangedDivisor(s9Multiplier)
        );

    while(
        g9Ranged > 0 &&
        getLeadershipUsed(
            buildArmy(g9Ranged, s9Multiplier)
        ) > totalLeadership
    ){

        g9Ranged--;

    }

    while(
        getLeadershipUsed(
            buildArmy(g9Ranged + 1, s9Multiplier)
        ) <= totalLeadership
    ){

        g9Ranged++;

    }

    return buildArmy(
        g9Ranged,
        s9Multiplier
    );

}

// ---------- MAIN CALCULATE ----------

function calculate(){

    const totalLeadership =
        Number(
            leadershipInput.value
        );

    const s9Multiplier =
        SETTINGS.S9_MULTIPLIER;

    const trainingMultiplier =
        Number(
            trainingMultiplierInput.value
        );

    if(
        trainingMultiplierInput.value.trim() === "" ||
        !Number.isInteger(trainingMultiplier) ||
        trainingMultiplier < 1
    ){

        alert("Training multiplier must be a positive whole number (1, 2, 3...).");

        trainingMultiplierInput.focus();

        return;

    }

    if(totalLeadership <= 0){

        alert("Enter a leadership value.");

        return;

    }

    const army =
        calculateArmy(
            totalLeadership,
            s9Multiplier
        );

    const stacks =
        army.stacks;

    const tanks =
        army.tanks;
		
const monsters = {

    M8: {
        ranged: Math.floor(
            stacks.G9.flying /
            SETTINGS.MONSTERS.M8_DIVISOR
        )
    },

    M9: {},

    M7: {}

};


// M8
monsters.M8.mounted =
    monsters.M8.ranged - 2;

monsters.M8.flying =
    monsters.M8.mounted - 2;

monsters.M8.melee =
    monsters.M8.flying - 2;


// M9
monsters.M9.ranged =
    Math.floor(
        monsters.M8.melee /
        SETTINGS.MONSTERS.M9_DIVISOR
    );

monsters.M9.mounted =
    monsters.M9.ranged - 2;

monsters.M9.flying =
    monsters.M9.mounted - 2;

monsters.M9.melee =
    monsters.M9.flying - 2;


// M7
monsters.M7.ranged =
    Math.floor(
        monsters.M8.melee *
        SETTINGS.MONSTERS.M7_MULTIPLIER
    );

monsters.M7.mounted =
    monsters.M7.ranged - 2;

monsters.M7.flying =
    monsters.M7.mounted - 2;

monsters.M7.melee =
    monsters.M7.flying - 2;




const trainingTroops = [
    ["G9 Flying", stacks.G9.flying],
    ["G9 Mounted", stacks.G9.rider],
    ["G9 Ranged", stacks.G9.archer],
    ["G9 Melee", stacks.G9.spear],

    ["G8 Flying", stacks.G8.flying],
    ["G8 Mounted", stacks.G8.rider],
    ["G8 Ranged", stacks.G8.archer],
    ["G8 Melee", stacks.G8.spear],

    ["S9 Flying", stacks.S9.flying],
    ["S9 Mounted", stacks.S9.rider],
    ["S9 Ranged", stacks.S9.archer],
    ["S9 Melee", stacks.S9.spear],

    ["S8 Flying", stacks.S8.flying],
    ["S8 Mounted", stacks.S8.rider],
    ["S8 Ranged", stacks.S8.archer],
    ["S8 Melee", stacks.S8.spear],

    ["E9 Tank", tanks.E9],
    ["E8 Tank", tanks.E8]
];

const trainingRows = trainingTroops.map(([label, count]) => {
    const required = count * trainingMultiplier;

    return `
        <div class="result-row">
            <span>${label}</span>
            <strong>${required.toLocaleString()}</strong>
            <button class="copy-button" data-copy="${required}">
                Copy
            </button>
        </div>
    `;
}).join("");


results.innerHTML = `

<h2>Monster Stacks</h2>

<div class="monster-results">

    <div class="monster-tier">

        <h3>M9</h3>

        <div class="result-row">
            <span>Melee</span>
            <strong>${monsters.M9.melee.toLocaleString()}</strong>
            <button class="copy-button"
                    data-copy="${monsters.M9.melee}">
                Copy
            </button>
        </div>

        <div class="result-row">
            <span>Flying</span>
            <strong>${monsters.M9.flying.toLocaleString()}</strong>
            <button class="copy-button"
                    data-copy="${monsters.M9.flying}">
                Copy
            </button>
        </div>

        <div class="result-row">
            <span>Mounted</span>
            <strong>${monsters.M9.mounted.toLocaleString()}</strong>
            <button class="copy-button"
                    data-copy="${monsters.M9.mounted}">
                Copy
            </button>
        </div>

        <div class="result-row">
            <span>Ranged</span>
            <strong>${monsters.M9.ranged.toLocaleString()}</strong>
            <button class="copy-button"
                    data-copy="${monsters.M9.ranged}">
                Copy
            </button>
        </div>

    </div>


    <div class="monster-tier">

        <h3>M8</h3>

        <div class="result-row">
            <span>Melee</span>
            <strong>${monsters.M8.melee.toLocaleString()}</strong>
            <button class="copy-button"
                    data-copy="${monsters.M8.melee}">
                Copy
            </button>
        </div>

        <div class="result-row">
            <span>Flying</span>
            <strong>${monsters.M8.flying.toLocaleString()}</strong>
            <button class="copy-button"
                    data-copy="${monsters.M8.flying}">
                Copy
            </button>
        </div>

        <div class="result-row">
            <span>Mounted</span>
            <strong>${monsters.M8.mounted.toLocaleString()}</strong>
            <button class="copy-button"
                    data-copy="${monsters.M8.mounted}">
                Copy
            </button>
        </div>

        <div class="result-row">
            <span>Ranged</span>
            <strong>${monsters.M8.ranged.toLocaleString()}</strong>
            <button class="copy-button"
                    data-copy="${monsters.M8.ranged}">
                Copy
            </button>
        </div>

    </div>


    <div class="monster-tier">

        <h3>M7</h3>

        <div class="result-row">
            <span>Melee</span>
            <strong>${monsters.M7.melee.toLocaleString()}</strong>
            <button class="copy-button"
                    data-copy="${monsters.M7.melee}">
                Copy
            </button>
        </div>

        <div class="result-row">
            <span>Flying</span>
            <strong>${monsters.M7.flying.toLocaleString()}</strong>
            <button class="copy-button"
                    data-copy="${monsters.M7.flying}">
                Copy
            </button>
        </div>

        <div class="result-row">
            <span>Mounted</span>
            <strong>${monsters.M7.mounted.toLocaleString()}</strong>
            <button class="copy-button"
                    data-copy="${monsters.M7.mounted}">
                Copy
            </button>
        </div>

        <div class="result-row">
            <span>Ranged</span>
            <strong>${monsters.M7.ranged.toLocaleString()}</strong>
            <button class="copy-button"
                    data-copy="${monsters.M7.ranged}">
                Copy
            </button>
        </div>

    </div>

</div>


<h2>Troop Stacks</h2>

<div class="troop-results">

    <div class="result-row">
        <span>G9 Flying</span>
        <strong>${stacks.G9.flying.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.G9.flying}">
            Copy
        </button>
    </div>

    <div class="result-row">
        <span>S9 Flying</span>
        <strong>${stacks.S9.flying.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.S9.flying}">
            Copy
        </button>
    </div>

    <div class="result-row">
        <span>G8 Flying</span>
        <strong>${stacks.G8.flying.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.G8.flying}">
            Copy
        </button>
    </div>

    <div class="result-row">
        <span>S8 Flying</span>
        <strong>${stacks.S8.flying.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.S8.flying}">
            Copy
        </button>
    </div>

    <div class="result-row">
        <span>E9 Tank</span>
        <strong>${tanks.E9.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${tanks.E9}">
            Copy
        </button>
    </div>

    <div class="result-row">
        <span>E8 Tank</span>
        <strong>${tanks.E8.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${tanks.E8}">
            Copy
        </button>
    </div>


    <div class="result-row">
        <span>G9 Mounted</span>
        <strong>${stacks.G9.rider.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.G9.rider}">
            Copy
        </button>
    </div>

    <div class="result-row">
        <span>S9 Mounted</span>
        <strong>${stacks.S9.rider.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.S9.rider}">
            Copy
        </button>
    </div>

    <div class="result-row">
        <span>G8 Mounted</span>
        <strong>${stacks.G8.rider.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.G8.rider}">
            Copy
        </button>
    </div>

    <div class="result-row">
        <span>S8 Mounted</span>
        <strong>${stacks.S8.rider.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.S8.rider}">
            Copy
        </button>
    </div>


    <div class="result-row">
        <span>G9 Ranged</span>
        <strong>${stacks.G9.archer.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.G9.archer}">
            Copy
        </button>
    </div>

    <div class="result-row">
        <span>G9 Melee</span>
        <strong>${stacks.G9.spear.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.G9.spear}">
            Copy
        </button>
    </div>

    <div class="result-row">
        <span>S9 Ranged</span>
        <strong>${stacks.S9.archer.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.S9.archer}">
            Copy
        </button>
    </div>

    <div class="result-row">
        <span>S9 Melee</span>
        <strong>${stacks.S9.spear.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.S9.spear}">
            Copy
        </button>
    </div>

    <div class="result-row">
        <span>G8 Ranged</span>
        <strong>${stacks.G8.archer.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.G8.archer}">
            Copy
        </button>
    </div>

    <div class="result-row">
        <span>G8 Melee</span>
        <strong>${stacks.G8.spear.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.G8.spear}">
            Copy
        </button>
    </div>

    <div class="result-row">
        <span>S8 Ranged</span>
        <strong>${stacks.S8.archer.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.S8.archer}">
            Copy
        </button>
    </div>

    <div class="result-row">
        <span>S8 Melee</span>
        <strong>${stacks.S8.spear.toLocaleString()}</strong>
        <button class="copy-button"
                data-copy="${stacks.S8.spear}">
            Copy
        </button>
    </div>

</div>

<section class="training-section">
    <h2>Training Requirements</h2>
    <p>
        Total troops to train for each stack:
        ${trainingMultiplier}× the calculated stack size.
    </p>

    <div class="troop-results">
        ${trainingRows}
    </div>
</section>

`;

    // Old buttons were replaced by the render above
    lastCopiedButton = null;

}


// ---------- COPY BUTTONS ----------

let lastCopiedButton = null;

async function handleCopyClick(event){

    const button =
        event.target.closest(".copy-button");

    if(!button){

        return;

    }

    try {

        await navigator.clipboard.writeText(
            button.dataset.copy
        );

        if(lastCopiedButton && lastCopiedButton !== button){

            lastCopiedButton.textContent = "Copy";

        }

        button.textContent = "Copied!";

        lastCopiedButton = button;

    } catch (error) {

        alert("Unable to copy number.");

    }

}


// ---------- EVENTS ----------

calculateButton.addEventListener(

    "click",

    calculate

);

results.addEventListener(

    "click",

    handleCopyClick

);

