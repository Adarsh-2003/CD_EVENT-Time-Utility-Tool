const TIME_ZONE = "America/New_York";
const previewEl = document.getElementById("preview");
const copyBtn = document.getElementById("copyBtn");
const toastEl = document.getElementById("toast");

function getNYParts(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const map = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }

  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour,
    minute: map.minute,
    dayPeriod: map.dayPeriod, // AM/PM
  };
}

function buildMessage(now = new Date()) {
  const p = getNYParts(now);
  const ts = `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute} ${p.dayPeriod}`;
  return `There is no lag, data is synced up,\nCD_EVENT was synced at: "${ts}"`;
}

function render() {
  previewEl.textContent = buildMessage();
}

let toastTimer = null;
function showToast(text) {
  toastEl.textContent = text;
  toastEl.dataset.show = "true";
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.dataset.show = "false";
  }, 900);
}

async function copyText(text) {
  // Preferred: Clipboard API (requires secure context; localhost/file works in most modern browsers)
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback: hidden textarea
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  ta.style.top = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

copyBtn.addEventListener("click", async () => {
  const text = buildMessage();
  try {
    await copyText(text);
    showToast("Copied");
  } catch {
    showToast("Copy failed");
  }
});

render();
// Update often enough to feel "realtime" while only showing minute precision.
setInterval(render, 1000);


