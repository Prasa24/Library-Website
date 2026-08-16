document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  const grid = document.getElementById("catalogueGrid");
  if (grid) {
    loadCatalogue();
  }
});

/**
 * Loads books.csv (exported from your library's Excel sheet) and renders
 * each row as a book card. Expected columns:
 * call_no, title, author, category, category_label, status, status_label
 *
 * category   : machine key used for filtering, e.g. fiction / nonfiction / children / periodical / heritage
 * status     : "avail" or "out" (controls the green/red dot) — any other value shows as neutral text
 */
function loadCatalogue() {
  const statusEl = document.getElementById("catalogueStatus");

  Papa.parse("books.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const rows = results.data.filter((r) => r.title);
      if (!rows.length) {
        statusEl.textContent = "No books found in books.csv.";
        return;
      }
      renderBooks(rows);
      statusEl.textContent = `${rows.length} items · updated from books.csv`;
      wireFilters();
    },
    error: (err) => {
      console.error("Could not load books.csv", err);
      statusEl.textContent =
        "Couldn't load books.csv. If you're opening this file directly (file://), run a local server instead — see the README.";
    },
  });
}

function renderBooks(rows) {
  const grid = document.getElementById("catalogueGrid");
  grid.innerHTML = rows
    .map((row) => {
      const statusClass = row.status === "avail" || row.status === "out" ? row.status : "avail";
      return `
        <div class="book-card" data-category="${escapeHtml(row.category || "")}">
          <div class="call-no">${escapeHtml(row.call_no || "")}</div>
          <h4>${escapeHtml(row.title || "")}</h4>
          <span class="author">${escapeHtml(row.author || "")}</span>
          <span class="tag">${escapeHtml(row.category_label || row.category || "")}</span>
          <span class="status ${statusClass}">● ${escapeHtml(row.status_label || "")}</span>
        </div>`;
    })
    .join("");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function wireFilters() {
  const chips = document.querySelectorAll(".chip");
  const searchInput = document.querySelector(".search-bar input");

  function applyFilters() {
    const activeChip = document.querySelector(".chip.active");
    const filter = activeChip ? activeChip.dataset.filter : "all";
    const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    document.querySelectorAll(".book-card").forEach((card) => {
      const matchesCategory = filter === "all" || card.dataset.category === filter;
      const matchesSearch = !q || card.textContent.toLowerCase().includes(q);
      card.style.display = matchesCategory && matchesSearch ? "" : "none";
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }
}
