async function loadStatuses() {
  renderLogos();
  const container = document.getElementById("status");
  container.innerHTML = "";

  let urls;
  try {
    const cfgRes = await fetch("/config/urls.json");
    const cfg = await cfgRes.json();
    urls = cfg.urls;
  } catch (err) {
    console.error("Failed to load config.json:", err);
    container.textContent = "Failed to load config.";
    return;
  }

  const rows = {};
  urls.forEach(({ name, url }) => {
    const row = document.createElement("div");
    row.className = "status-item border-checking";
    const urlEl = document.createElement("div");
    urlEl.className = "url";
    urlEl.innerHTML = `${icons.checking}<a href="${url}" target="_blank">${name}</a>`;
    const badge = document.createElement("div");
    badge.className = "badge checking";
    badge.textContent = "Checking…";
    row.appendChild(urlEl);
    row.appendChild(badge);
    container.appendChild(row);
    rows[url] = { row, urlEl, badge, name };
  });

  urls.forEach(({ url }) => {
    fetch(`/status?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(item => updateRow(rows[url], item))
      .catch(err => {
        console.warn("Check failed:", url, err);
        updateRow(rows[url], { url, status: "offline" });
      });
  });
}