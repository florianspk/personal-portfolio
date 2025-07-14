const RSS_API_URL = "https://florianspk.fr/rss";

function createPostHTML(post) {
  return `
    <li class="blog-post-item">
      <a href="${post.link}" target="_blank" rel="noopener noreferrer">
        <figure class="blog-banner-box">
          <img src="${post.image}" alt="${post.title}" loading="lazy"
               onerror="this.src='./assets/images/blog-default.jpg'" />
        </figure>
        <div class="blog-content">
        <div class="blog-meta">
          <p class="blog-category">
            ${post.tags
              .slice(0, 3)
              .map((tag) => `${tag}`)
              .join("/")}
          </p>
              <span class="dot"></span>
              <time datetime="${post.date}"
                  >${new Date(post.date).toLocaleDateString("fr-FR", { month: "short", day: "numeric", year: "numeric" })}</time
              >
        </div>
          <h3 class="h3 blog-item-title">${post.title}</h3>
          <p class="blog-text">
            ${post.description}
          </p>
        </div>
      </a>
    </li>`;
}

async function loadBlogPosts() {
  const blogSection = document.querySelector(".blog-posts");
  if (!blogSection) return;

  let blogList = blogSection.querySelector(".blog-posts-list");
  if (!blogList) {
    blogList = document.createElement("ul");
    blogList.className = "blog-posts-list";
    blogSection.appendChild(blogList);
  }

  blogList.innerHTML = `<li style="text-align: center; padding: 40px; color: #666;">Chargement des posts...</li>`;

  try {
    const response = await fetch(RSS_API_URL);
    if (!response.ok) throw new Error("Erreur HTTP " + response.status);
    const posts = await response.json();

    const html = posts.map(createPostHTML).join("");
    blogList.innerHTML = html || "<li>Aucun post trouvé.</li>";
  } catch (err) {
    console.error(err);
    blogList.innerHTML = `
      <li style="text-align: center; padding: 40px; color: #d32f2f;">
        <p><strong>Erreur:</strong> ${err.message}</p>
      </li>`;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadBlogPosts);
} else {
  loadBlogPosts();
}
