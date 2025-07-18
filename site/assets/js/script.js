"use strict";

// element toggle function
const elementToggleFunc = function (elem) {
  elem.classList.toggle("active");
};

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () {
  elementToggleFunc(sidebar);
});

// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
// const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
};

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {
  testimonialsItem[i].addEventListener("click", function () {
    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector(
      "[data-testimonials-title]",
    ).innerHTML;
    modalText.innerHTML = this.querySelector(
      "[data-testimonials-text]",
    ).innerHTML;

    testimonialsModalFunc();
  });
}

// add click event to modal close button
// modalCloseBtn.addEventListener("click", testimonialsModalFunc);
// overlay.addEventListener("click", testimonialsModalFunc);

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () {
  elementToggleFunc(this);
});

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);
  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {
  for (let i = 0; i < filterItems.length; i++) {
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }
  }
};

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {
  filterBtn[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;
  });
}

// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  });
}

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

const certifications = [
  {
    name: "CKA",
    image: "./assets/images/cka-badge.png",
    description: "Certified Kubernetes Administrator - CNCF",
    alt: "CKA badge",
  },
  {
    name: "CAPA ArgoCD",
    image: "./assets/images/capa-argo-cd.png",
    description: "Certification Argo Administrator - CNCF",
    alt: "CAPA ArgoCD badge",
  },
  {
    name: "Manage Kubernetes - GCP",
    image: "./assets/images/manage-kubernetes-gcp.png",
    description: "Certification Argo Administrator - CNCF",
    alt: "CAPA ArgoCD badge",
  },
];

const certList = document.getElementById("certification-list");

certifications.forEach((cert) => {
  const li = document.createElement("li");
  li.classList.add("service-item");

  li.innerHTML = `
    <div class="service-icon-box">
      <img src="${cert.image}" alt="${cert.alt}" width="40" />
    </div>
    <div class="service-content-box">
      <h4 class="h4 service-item-title">${cert.name}</h4>
      <p class="service-item-text">${cert.description}</p>
    </div>
  `;

  certList.appendChild(li);
});

// Fonction pour attendre que Litlyx soit chargé
function waitForLitlyx(callback, maxAttempts = 50) {
  let attempts = 0;

  const checkLitlyx = () => {
    attempts++;

    if (typeof Lit !== "undefined") {
      console.log("✅ Litlyx chargé après", attempts, "tentatives");
      callback();
    } else if (attempts < maxAttempts) {
      console.log("⏳ Attente de Litlyx... tentative", attempts);
      setTimeout(checkLitlyx, 100); // Réessayer dans 100ms
    } else {
      console.error(
        "❌ Litlyx n'a pas pu être chargé après",
        maxAttempts,
        "tentatives",
      );
    }
  };

  checkLitlyx();
}

// Fonction pour initialiser la navigation une fois Litlyx chargé
function initNavigation() {
  try {
    Lit.event("navigation-init");
  } catch (error) {
    console.error("❌ Erreur test initial:", error);
  }

  // page navigation variables
  const navigationLinks = document.querySelectorAll("[data-nav-link]");
  const pages = document.querySelectorAll("[data-page]");

  // add event to all nav link
  for (let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].addEventListener("click", function () {
      const targetPage = this.innerText.toLowerCase();

      // Toggle pages
      pages.forEach((page) => {
        page.classList.toggle("active", page.dataset.page === targetPage);
      });

      // Toggle nav links
      navigationLinks.forEach((link) => {
        link.classList.remove("active");
      });
      this.classList.add("active");

      // Envoyer événement Litlyx
      try {
        Lit.event(`page-visit-${targetPage}`);

        Lit.event("page-navigation", {
          page: targetPage,
          timestamp: new Date().toISOString(),
          referrer: document.referrer || "direct",
          userAgent: navigator.userAgent.substring(0, 100),
        });
      } catch (error) {
        console.error("❌ Erreur envoi événements:", error);
      }

      window.scrollTo(0, 0);
    });
  }

  // Tracker la page initiale
  const activePage = document.querySelector("[data-page].active");
  if (activePage) {
    const pageName = activePage.dataset.page;
    try {
      Lit.event(`page-visit-${pageName}`);
      Lit.event("page-load", {
        page: pageName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 100),
        url: window.location.href,
      });
    } catch (error) {
      console.error("❌ Erreur événements page initiale:", error);
    }
  }
}

// Initialisation au chargement du DOM
document.addEventListener("DOMContentLoaded", function () {
  console.log("📋 DOM chargé, attente de Litlyx...");
  // Attendre que Litlyx soit chargé avant d'initialiser
  waitForLitlyx(initNavigation);
});

// Fallback: essayer aussi au chargement complet de la page
window.addEventListener("load", function () {
  console.log("🔄 Page complètement chargée");
  // Si Litlyx n'est toujours pas initialisé, réessayer
  if (typeof Lit === "undefined") {
    console.log("⚠️ Litlyx toujours pas chargé, nouvelle tentative...");
    waitForLitlyx(initNavigation);
  }
});
