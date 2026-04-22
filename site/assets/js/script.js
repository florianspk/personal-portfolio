// ── Scroll animations ──────────────────────────────
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(
                    () => entry.target.classList.add("visible"),
                    i * 60,
                );
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.08 },
);
document
    .querySelectorAll(".fade-up")
    .forEach((el) => observer.observe(el));

// ── GitHub API ─────────────────────────────────────
const GITHUB_USERNAME = "florianspk"; // ← ton vrai username GitHub ici

const LANG_COLORS = {
    Go: "#00add8",
    Python: "#3572a5",
    JavaScript: "#f1e05a",
    TypeScript: "#2b7489",
    Shell: "#89e051",
    Dockerfile: "#384d54",
    YAML: "#cb171e",
    HCL: "#844fba",
    Rust: "#dea584",
};

function renderRepos(repos) {
    const grid = document.getElementById("github-grid");

    if (!repos.length) {
        grid.innerHTML =
            '<div class="gh-error">Aucun repository public trouvé.</div>';
        return;
    }

    grid.innerHTML = repos
        .map((repo) => {
            const langColor =
                LANG_COLORS[repo.language] || "#8b949e";
            const desc = repo.description
                ? repo.description.length > 90
                    ? repo.description.slice(0, 87) + "…"
                    : repo.description
                : '<span style="color:var(--text-muted);font-style:italic">Pas de description</span>';

            return `
          <a class="gh-card" href="${repo.html_url}" target="_blank" rel="noopener">
            <div class="gh-card-header">
              <span class="gh-repo-icon">⎔</span>
              <span class="gh-repo-name">${repo.name}</span>
              ${repo.fork ? '<span style="font-family:var(--mono);font-size:.6rem;color:var(--text-muted);border:1px solid var(--border);padding:.1rem .4rem;border-radius:4px;">fork</span>' : ""}
            </div>
            <div class="gh-repo-desc">${desc}</div>
            <div class="gh-card-footer">
              ${
                  repo.language
                      ? `
                <span class="gh-lang">
                  <span class="gh-lang-dot" style="background:${langColor}"></span>
                  ${repo.language}
                </span>`
                      : ""
              }
              ${
                  repo.stargazers_count > 0
                      ? `
                <span class="gh-stars">★ ${repo.stargazers_count}</span>`
                      : ""
              }
              ${
                  repo.forks_count > 0
                      ? `
                <span class="gh-stars" style="color:var(--text-muted)">⑂ ${repo.forks_count}</span>`
                      : ""
              }
            </div>
          </a>
        `;
        })
        .join("");

    // Animate cards in
    grid.querySelectorAll(".gh-card").forEach((card, i) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(16px)";
        setTimeout(() => {
            card.style.transition =
                "opacity .4s ease, transform .4s ease, border-color .15s, transform .15s";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, i * 60);
    });
}

async function fetchGitHubRepos() {
    const grid = document.getElementById("github-grid");
    try {
        // Fetch jusqu'à 30 repos publics, triés par dernière mise à jour
        const res = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30&type=public`,
            {
                headers: {
                    Accept: "application/vnd.github.v3+json",
                },
            },
        );

        if (!res.ok) {
            // Rate limit ou user inconnu
            if (res.status === 403) throw new Error("rate_limit");
            if (res.status === 404) throw new Error("not_found");
            throw new Error("api_error");
        }

        const repos = await res.json();

        // Filtre : on exclut les forks sans stars et les repos vides
        const filtered = repos
            .filter((r) => !r.private)
            .filter((r) => !(r.fork && r.stargazers_count === 0))
            .slice(0, 12); // max 12 cards

        renderRepos(filtered);
    } catch (err) {
        let msg = "Impossible de charger les repositories GitHub.";
        if (err.message === "rate_limit")
            msg =
                "Limite de l'API GitHub atteinte. Réessaie dans quelques minutes.";
        if (err.message === "not_found")
            msg = `Utilisateur GitHub "${GITHUB_USERNAME}" introuvable. Vérifie le username dans le code.`;

        grid.innerHTML = `
          <div class="gh-error">
            <div style="margin-bottom:.8rem;">⚠ ${msg}</div>
            <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" class="btn btn-outline" style="display:inline-flex;">
              Voir le profil GitHub →
            </a>
          </div>`;
    }
}

fetchGitHubRepos();
