const DEFAULT_IMAGE = "/assets/images/default-project.png";

const customImages = {
  "argocd-apps-homelab": "/assets/images/argocd-apps-homelab.png",
  "go-ebpf": "/assets/images/go-ebpf.png",
  "home-lab-talos": "/assets/images/homelab-talos.png",
  "personal-portfolio": "/assets/images/personal-portfolio.png",
  "wheezy-blog": "/assets/images/wheezy-blog.png",
};

const customCategories = {
  "argocd-apps-homelab": "Kubernetes",
  "go-ebpf": "eBPF",
  "home-lab-talos": "Homelab",
};

const REPOS_PER_PAGE = 12;
let currentPage = 1;
let sortedRepos = [];

async function fetchRepos() {
  const response = await fetch(
    "https://api.github.com/users/florianspk/repos?per_page=100&sort=updated",
  );
  const repos = await response.json();
  const filteredRepos = repos.filter((repo) => !repo.fork);

  sortedRepos = filteredRepos.sort((a, b) => {
    if (b.stargazers_count !== a.stargazers_count) {
      return b.stargazers_count - a.stargazers_count;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  await renderRepos();
}

async function generateImageWithTextOnBackground(
  text,
  backgroundUrl,
  width = 400,
  height = 200,
) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const background = new Image();
    background.crossOrigin = "anonymous";
    background.onload = () => {
      ctx.drawImage(background, 0, 0, width, height);
      ctx.font = "bold 24px sans-serif";
      ctx.fillStyle = "#FFD369";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, width / 2, height / 2);
      resolve(canvas.toDataURL());
    };
    background.src = backgroundUrl;
  });
}

async function getImageForRepo(repoName) {
  if (customImages[repoName]) {
    return customImages[repoName];
  }
  return await generateImageWithTextOnBackground(repoName, DEFAULT_IMAGE);
}

async function renderRepos() {
  const container = document.getElementById("github-projects");
  container.innerHTML = "";

  const start = 0;
  const end = currentPage * REPOS_PER_PAGE;
  const reposToShow = sortedRepos.slice(start, end);

  for (const repo of reposToShow) {
    const imageSrc = await getImageForRepo(repo.name);
    const category = (
      customCategories[repo.name] || "github project"
    ).toLowerCase();

    const li = document.createElement("li");
    li.className = "project-item active";
    li.setAttribute("data-filter-item", "");
    li.setAttribute("data-category", category);
    li.innerHTML = `
            <a href="${repo.html_url}" target="_blank">
                <figure class="project-img">
                    <div class="project-item-icon-box">
                        <ion-icon name="eye-outline"></ion-icon>
                    </div>
                    <img src="${imageSrc}" alt="${repo.name}" loading="lazy" />
                </figure>
                <h3 class="project-title">${repo.name}</h3>
                <p class="project-category">${repo.description || "No description"}</p>
            </a>
        `;
    container.appendChild(li);
  }

  const showMoreBtn = document.getElementById("show-more-btn");
  if (end >= sortedRepos.length) {
    showMoreBtn.style.display = "none";
  } else {
    showMoreBtn.style.display = "block";
  }

  // Remet tout visible à chaque affichage
  filterFunc("all");
}

document.getElementById("show-more-btn").addEventListener("click", async () => {
  currentPage++;
  await renderRepos();
});

fetchRepos();
