// =====================================
// Total Battle Calculator V4
// Part 3 - Settings & Startup
// =====================================


// ---------- CONSTANTS ----------

const SETTINGS = {

    DEFAULT_S9_MULTIPLIER: 1.008,

    TIER_MULTIPLIER: 1.81,

    OFFSETS: {

        Spearman: 3,

        Archer: 0,

        Rider: 1,

        Flying: -1

    }

};


// ---------- ELEMENTS ----------

const leadershipInput =
    document.getElementById("leadership");

const multiplierInput =
    document.getElementById("s9Multiplier");

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
        (SETTINGS.TIER_MULTIPLIER * s9Multiplier);

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
            SETTINGS.TIER_MULTIPLIER *
            s9Multiplier
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

results.innerHTML = `

<h2>Stack Calculator</h2>

<table>

<tr>

<th>Tier</th>

<th>Leadership</th>

<th>Spearman</th>

<th>Archer</th>

<th>Rider</th>

<th>Flying</th>

</tr>

${Object.entries(stacks).map(([tier,data])=>`

<tr>

<td>${tier}</td>

<td>${data.leadership.toLocaleString()}</td>

<td>${data.spear.toLocaleString()}</td>

<td>${data.archer.toLocaleString()}</td>

<td>${data.rider.toLocaleString()}</td>

<td>${data.flying.toLocaleString()}</td>

</tr>

`).join("")}

</table>

`;
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


// ---------- START ----------

loadSettings();
