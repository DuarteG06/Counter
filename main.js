async function fetchCounters() {
    const res = await fetch("http://localhost:3000/api/counters");
    const data = await res.json();

    document.getElementById("count_peter").textContent = data.peter;
    document.getElementById("count_torta").textContent = data.torta;

    updateLeaderboard(data.peter, data.torta);
}

async function updateCounter(name, delta) {
    await fetch("http://localhost:3000/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, delta })
    });

    fetchCounters();
}

function increaseCounter_peter() {
    updateCounter("peter", 1);
}

function decreaseCounter_peter() {
    updateCounter("peter", -1);
}

function increaseCounter_torta() {
    updateCounter("torta", 1);
}

function decreaseCounter_torta() {
    updateCounter("torta", -1);
}

function updateLeaderboard(peter, torta) {
    const peterBar = document.getElementById("bar_peter");
    const tortaBar = document.getElementById("bar_torta");

    const total = peter + torta || 1;
    const peterPercent = (peter / total) * 100;
    const tortaPercent = (torta / total) * 100;

    peterBar.style.width = peterPercent + "%";
    tortaBar.style.width = tortaPercent + "%";

    peterBar.textContent = peter;
    tortaBar.textContent = torta;
}

// Load once on page load
fetchCounters();

// Keep refreshing the leaderboard every 1.5 seconds
setInterval(fetchCounters, 1500);
