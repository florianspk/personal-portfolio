// ── Theme toggle ───────────────────────────────────
const html         = document.documentElement;
const themeToggle  = document.getElementById("theme-toggle");

// Load saved preference — dark by default
const savedTheme = localStorage.getItem("theme") || "dark";
html.dataset.theme = savedTheme;
updateToggleLabel(savedTheme);

themeToggle.addEventListener("click", () => {
  const next = html.dataset.theme === "dark" ? "light" : "dark";
  html.dataset.theme = next;
  localStorage.setItem("theme", next);
  updateToggleLabel(next);
});

function updateToggleLabel(theme) {
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"
  );
}

// ── Scroll animations ──────────────────────────────
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("visible"), i * 60);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.06 },
);
document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

// ── Hamburger menu ─────────────────────────────────
const hamburger  = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");

hamburger.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  hamburger.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  });
});

document.addEventListener("click", (e) => {
  if (
    mobileMenu.classList.contains("open") &&
    !mobileMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    mobileMenu.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
});

// ── GitHub API ─────────────────────────────────────
const GITHUB_USERNAME = "florianspk";

const LANG_COLORS = {
  Go: "#00add8", Python: "#3572a5", JavaScript: "#f1e05a",
  TypeScript: "#2b7489", Shell: "#89e051", Dockerfile: "#384d54",
  YAML: "#cb171e", HCL: "#844fba", Rust: "#dea584", Ruby: "#701516",
};

function renderRepos(repos) {
  const grid = document.getElementById("github-grid");
  if (!repos.length) {
    grid.innerHTML = '<div class="gh-error">Aucun repository public trouvé.</div>';
    return;
  }
  grid.innerHTML = repos
    .map((repo) => {
      const langColor = LANG_COLORS[repo.language] || "#8b949e";
      const desc = repo.description
        ? repo.description.length > 90
          ? repo.description.slice(0, 87) + "…"
          : repo.description
        : '<span style="font-style:italic;opacity:.6">Pas de description</span>';
      return `
        <a class="gh-card" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
          <div class="gh-card-header">
            <span class="gh-repo-icon">⎔</span>
            <span class="gh-repo-name">${repo.name}</span>
            ${repo.fork ? '<span style="font-family:var(--mono);font-size:.62rem;color:var(--text-muted);border:1px solid var(--border);padding:.1rem .4rem;border-radius:4px;">fork</span>' : ""}
          </div>
          <div class="gh-repo-desc">${desc}</div>
          <div class="gh-card-footer">
            ${repo.language ? `<span class="gh-lang"><span class="gh-lang-dot" style="background:${langColor}"></span>${repo.language}</span>` : ""}
            ${repo.stargazers_count > 0 ? `<span class="gh-stars">★ ${repo.stargazers_count}</span>` : ""}
            ${repo.forks_count > 0 ? `<span class="gh-stars" style="opacity:.7">⑂ ${repo.forks_count}</span>` : ""}
          </div>
        </a>`;
    })
    .join("");

  grid.querySelectorAll(".gh-card").forEach((card, i) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(14px)";
    setTimeout(() => {
      card.style.transition = "opacity .4s ease, transform .4s ease, border-color .15s, box-shadow .15s";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, i * 55);
  });
}

async function fetchGitHubRepos() {
  const grid = document.getElementById("github-grid");
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30&type=public`,
      { headers: { Accept: "application/vnd.github.v3+json" } },
    );
    if (!res.ok) {
      if (res.status === 403) throw new Error("rate_limit");
      if (res.status === 404) throw new Error("not_found");
      throw new Error("api_error");
    }
    const repos = await res.json();
    renderRepos(
      repos
        .filter((r) => !r.private)
        .filter((r) => !(r.fork && r.stargazers_count === 0))
        .slice(0, 12),
    );
  } catch (err) {
    let msg = "Impossible de charger les repositories GitHub.";
    if (err.message === "rate_limit")
      msg = "Limite de l'API GitHub atteinte — réessaie dans quelques minutes.";
    if (err.message === "not_found")
      msg = `Utilisateur GitHub "${GITHUB_USERNAME}" introuvable.`;
    grid.innerHTML = `
      <div class="gh-error">
        <div style="margin-bottom:.8rem">⚠ ${msg}</div>
        <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" class="btn btn-outline" style="display:inline-flex">
          Voir le profil GitHub →
        </a>
      </div>`;
  }
}

fetchGitHubRepos();
