document.addEventListener("DOMContentLoaded", () => {
  loadUrls();
});

async function loadUrls() {
  const list = document.getElementById("statusList");
  let config;
  try {
    const res = await fetch("/config/urls.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    config = await res.json();
  } catch (err) {
    console.error("Failed to load config:", err);
    list.innerHTML = `<p class="error">Failed to load URLs config: ${err.message}</p>`;
    return;
  }

  if (!Array.isArray(config.urls)) {
    console.error("config.urls is not an array:", config);
    return;
  }

  for (const entry of config.urls) {
    const card = document.createElement("div");
    card.className = "status-item border-checking";
    card.id = `card-${entry.name}`;

    card.innerHTML = `
      <div class="url">
        <svg class="icon spin" id="icon-${entry.name}" fill="none" stroke="#95a5a6" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke-width="3" opacity="0.3"></circle>
          <path d="M12 2 a10 10 0 0 1 10 10" stroke-width="3"></path>
        </svg>
        <a href="${entry.url}" target="_blank">${entry.name}</a>
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
    const response = await fetch(`/status?url=${encodeURIComponent(entry.url)}`);
    const text = await response.text();

    let parsed = null;
    try { parsed = JSON.parse(text); } catch {}

    const isOffline = parsed && parsed.status === "offline";
    const isOk = response.ok && !isOffline;

    icon.classList.remove("spin");

    if (isOk) {
      badge.textContent = "Online";
      badge.className = "badge online";
      card.className = "status-item border-online";

      icon.outerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#2ecc71">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    } else {
      badge.textContent = "Offline";
      badge.className = "badge offline";
      card.className = "status-item border-offline";

      icon.outerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#e74c3c">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    }

  } catch (err) {
    badge.textContent = "Error";
    badge.className = "badge error";
    card.className = "status-item border-error";

    icon.classList.remove("spin");
    icon.outerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#f39c12">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <circle cx="12" cy="16" r="1"></circle>
      </svg>
    `;
  }
}
