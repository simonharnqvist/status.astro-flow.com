document.addEventListener("DOMContentLoaded", () => {
  loadUrls();
});

// Hardcoded services
const urls = [
    { name: "Scorpio", url: "https://portal.scorpio.astro-flow.com/api/health" },
    { name: "Aquarius", url: "https://portal.aquarius.astro-flow.com/api/health" },
    { name: "Sagittarius", url: "https://portal.sagittarius.astro-flow.com/api/health" },
    { name: "Capricorn", url: "https://portal.capricorn.astro-flow.com/api/health" },
    { name: "UAT", url: "https://portal.aquarius-uat.astro-flow.com/api/health"}
];

function loadUrls() {
  const list = document.getElementById("statusList");

  for (const entry of urls) {
    const card = document.createElement("div");
    card.className = "status-item border-checking";
    card.id = `card-${entry.name}`;

    card.innerHTML = `
      <div class="url">
        <svg class="icon spin" id="icon-${entry.name}" fill="none" stroke="#95a5a6" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke-width="3" opacity="0.3"></circle>
          <path d="M12 2 a10 10 0 0 1 10 10" stroke-width="3"></path>
        </svg>
        <a href="${entry.url}" target="_blank" rel="noopener noreferrer">
          ${entry.name}
        </a>
      </div>
      <div class="badge checking" id="badge-${entry.name}">Checking…</div>
    `;

    list.appendChild(card);
    checkStatus(entry);
  }
}

async function checkStatus(entry) {
  const badge = document.getElementById(`badge-${entry.name}`);
  const card = document.getElementById(`card-${entry.name}`);
  const icon = document.getElementById(`icon-${entry.name}`);

  try {
    const response = await fetch(entry.url);

    icon.classList.remove("spin");

    if (response.ok) {
      badge.textContent = "Online";
      badge.className = "badge online";
      card.className = "status-item border-online";

      icon.outerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#2ecc71">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    } else {
      setOffline(badge, card, icon);
    }
  } catch (err) {
    console.error(`Health check failed for ${entry.name}:`, err);
    setOffline(badge, card, icon);
  }
}

function setOffline(badge, card, icon) {
  badge.textContent = "Offline";
  badge.className = "badge offline";
  card.className = "status-item border-offline";

  icon.classList.remove("spin");
  icon.outerHTML = `
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#e74c3c">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
}