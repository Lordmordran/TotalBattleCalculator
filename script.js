// =====================================
// Total Battle Calculator V4
// Part 3 - Settings & Startup
// =====================================


// ---------- CONSTANTS ----------

const SETTINGS = {

    DEFAULT_S9_MULTIPLIER: 1.0055,

    TIER_MULTIPLIER: 1.81,

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

const multiplierInput =
    document.getElementById("s9Multiplier");

const trainingMultiplierInput =
    document.getElementById("trainingMultiplier");

const calculateButton =
    document.getElementById("calculateButton");

const saveButton =
    document.getElementById("saveButton");

const resetButton =
    document.getElementById("resetButton");

const results =
    document.getElementById("results");


// ---------- LOAD SETTINGS ----------

function loadSettings(){

    const saved =
        localStorage.getItem("s9Multiplier");

    if(saved){

        multiplierInput.value = saved;

    }else{

        multiplierInput.value =
            SETTINGS.DEFAULT_S9_MULTIPLIER;

    }

}


// ---------- SAVE SETTINGS ----------

function saveSettings(){

    localStorage.setItem(

        "s9Multiplier",

        multiplierInput.value

    );

    alert("Default multiplier saved!");

}


// ---------- RESET SETTINGS ----------

function resetSettings(){

    multiplierInput.value =
        SETTINGS.DEFAULT_S9_MULTIPLIER;

    localStorage.removeItem(
        "s9Multiplier"
    );

    alert("Multiplier reset.");

}


// =====================================
// Part 4 - Tier Calculator
// =====================================


// ---------- CALCULATE BASE ----------

function getBaseLeadership(totalLeadership, s9Multiplier){

    const totalWeight =
        1 +
        s9Multiplier +
        SETTINGS.TIER_MULTIPLIER +
        SETTINGS.TIER_MULTIPLIER;

    return totalLeadership / totalWeight;

}


// ---------- CALCULATE TIERS ----------

function calculateTierLeadership(base, s9Multiplier){

    return {

        G9: Math.floor(base),

        S9: Math.floor(
            base *
            s9Multiplier
        ),

        G8: Math.floor(
            base *
            SETTINGS.TIER_MULTIPLIER
        ),

        S8: Math.floor(
            base *
            SETTINGS.TIER_MULTIPLIER
        )

    };

}

// =====================================
// Part 5 - Split Tier
// =====================================

function splitTier(leadership){

    // Divide leadership evenly

    const perType =
        Math.floor(
            leadership / 4
        );

    let spear =
        perType + SETTINGS.OFFSETS.Spearman;

    let archer =
        perType + SETTINGS.OFFSETS.Archer;

    let rider =
        Math.floor(
            perType / 2
        ) + SETTINGS.OFFSETS.Rider;

    let flying =
        Math.floor(
            perType / 20
        ) + SETTINGS.OFFSETS.Flying;

    return {

        leadership,

        spear,

        archer,

        rider,

        flying

    };

}

// ---------- MAIN CALCULATE ----------

function calculate(){

    const totalLeadership =
        Number(
            leadershipInput.value
        );

    const s9Multiplier =
        Number(
            multiplierInput.value
        );

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

    const base =
        getBaseLeadership(
            totalLeadership,
            s9Multiplier
        );

    const tiers =
        calculateTierLeadership(
            base,
            s9Multiplier
        );
        
    const stacks = {

		G9: splitTier(tiers.G9),

		S9: splitTier(tiers.S9),

		G8: splitTier(tiers.G8),

		S8: splitTier(tiers.S8)

		};
		
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
    ["S9 Flying", stacks.S9.flying],
    ["G8 Flying", stacks.G8.flying],
    ["S8 Flying", stacks.S8.flying],

    ["G9 Mounted", stacks.G9.rider],
    ["S9 Mounted", stacks.S9.rider],
    ["G8 Mounted", stacks.G8.rider],
    ["S8 Mounted", stacks.S8.rider],

    ["G9 Ranged", stacks.G9.archer],
    ["G9 Melee", stacks.G9.spear],
    ["S9 Ranged", stacks.S9.archer],
    ["S9 Melee", stacks.S9.spear],

    ["G8 Ranged", stacks.G8.archer],
    ["G8 Melee", stacks.G8.spear],
    ["S8 Ranged", stacks.S8.archer],
    ["S8 Melee", stacks.S8.spear]
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

saveButton.addEventListener(

    "click",

    saveSettings

);

resetButton.addEventListener(

    "click",

    resetSettings

);

results.addEventListener(

    "click",

    handleCopyClick

);


// ---------- START ----------

loadSettings();
