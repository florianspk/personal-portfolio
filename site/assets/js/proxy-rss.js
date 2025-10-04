const RSS_API_URL = "/rss";

// Fonction pour nettoyer les séquences d'échappement HTML dans les chaînes
function cleanHtmlEntities(str) {
  if (typeof str !== "string") return str;

  const htmlEntities = {
    "\\u0026rsquo;": "'",
    "\\u0026lsquo;": "'",
    "\\u0026quot;": '"',
    "\\u0026ldquo;": '"',
    "\\u0026rdquo;": '"',
    "\\u0026amp;": "&",
    "\\u0026lt;": "<",
    "\\u0026gt;": ">",
    "\\u0026nbsp;": " ",
  };

  let cleaned = str;
  for (const [entity, replacement] of Object.entries(htmlEntities)) {
    cleaned = cleaned.replace(new RegExp(entity, "g"), replacement);
  }

  return cleaned;
}

// Fonction pour nettoyer récursivement un objet JSON
function cleanJsonObject(obj) {
  if (typeof obj === "string") {
    return cleanHtmlEntities(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(cleanJsonObject);
  } else if (obj && typeof obj === "object") {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = cleanJsonObject(value);
    }
    return cleaned;
  }
  return obj;
}

function createPostHTML(post) {
  // Proxy les images pour éviter les erreurs CORS
  const imageUrl = post.image.startsWith("https://blog.wheezy.fr/")
    ? "/image-proxy?url=" + encodeURIComponent(post.image)
    : post.image;

  return `
    <li class="blog-post-item">
      <a href="${post.link}" target="_blank" rel="noopener noreferrer">
        <figure class="blog-banner-box">
          <img src="${imageUrl}" alt="${post.title}" loading="lazy" />
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
    const rawPosts = await response.json();

    // Nettoyage des séquences d'échappement HTML
    const posts = cleanJsonObject(rawPosts);

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
