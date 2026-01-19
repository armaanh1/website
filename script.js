const copyButtons = document.querySelectorAll("[data-copy]");
const detailsBlocks = document.querySelectorAll(".posts details");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeIcons = document.querySelectorAll("[data-icon-light][data-icon-dark]");
const copyIconButtons = document.querySelectorAll(".copy-btn");

const THEME_STORAGE_KEY = "theme";
const applyTheme = (theme) => {
  document.body.classList.toggle("theme-dark", theme === "dark");
  if (themeToggle) {
    themeToggle.textContent = theme === "dark" ? "Lights On" : "Lights Out";
  }
  themeIcons.forEach((icon) => {
    const nextSrc =
      theme === "dark"
        ? icon.getAttribute("data-icon-dark")
        : icon.getAttribute("data-icon-light");
    if (nextSrc) {
      icon.setAttribute("src", nextSrc);
    }
  });
  copyIconButtons.forEach((button) => {
    const img = button.querySelector("img");
    if (!img) {
      return;
    }
    const state = button.dataset.copyState || "copy";
    const nextSrc =
      theme === "dark"
        ? state === "check"
          ? img.getAttribute("data-check-dark")
          : img.getAttribute("data-copy-dark")
        : state === "check"
          ? img.getAttribute("data-check-light")
          : img.getAttribute("data-copy-light");
    if (nextSrc) {
      img.setAttribute("src", nextSrc);
    }
  });
};

const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
if (storedTheme === "dark" || storedTheme === "light") {
  applyTheme(storedTheme);
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  applyTheme("dark");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("theme-dark")
      ? "light"
      : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  });
}

const animateOpen = (details) => {
  detailsBlocks.forEach((other) => {
    if (other !== details && other.open) {
      animateClose(other);
    }
  });

  if (prefersReducedMotion) {
    details.open = true;
    details.classList.add("is-open");
    return;
  }

  details.open = true;
  requestAnimationFrame(() => {
    details.classList.add("is-open");
  });
};

const animateClose = (details) => {
  const body = details.querySelector(".post-body");
  details.classList.remove("is-open");

  if (!body || prefersReducedMotion) {
    details.open = false;
    return;
  }

  const onEnd = (event) => {
    if (event.propertyName !== "max-height") {
      return;
    }
    details.open = false;
    body.removeEventListener("transitionend", onEnd);
  };

  body.addEventListener("transitionend", onEnd);
};

const openAnchorDetails = () => {
  const targetId = window.location.hash.replace("#", "");
  if (!targetId) {
    return;
  }

  const target = document.getElementById(targetId);
  if (target && target.tagName.toLowerCase() === "details") {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      animateOpen(target);
    }, 200);
  }
};

window.addEventListener("hashchange", openAnchorDetails);
window.addEventListener("DOMContentLoaded", openAnchorDetails);

detailsBlocks.forEach((details) => {
  const summary = details.querySelector("summary");
  if (!summary) {
    return;
  }

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    if (details.open) {
      animateClose(details);
    } else {
      animateOpen(details);
    }
  });
});

copyButtons.forEach((button) => {
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const targetId = button.getAttribute("data-copy");
    if (!targetId) {
      return;
    }

    const baseUrl = window.location.href.split("#")[0];
    const directUrl = `${baseUrl}#${targetId}`;

    try {
      await navigator.clipboard.writeText(directUrl);
      button.dataset.copyState = "check";
      applyTheme(document.body.classList.contains("theme-dark") ? "dark" : "light");
      button.classList.add("copied");
      setTimeout(() => {
        button.classList.remove("copied");
        button.dataset.copyState = "copy";
        applyTheme(document.body.classList.contains("theme-dark") ? "dark" : "light");
      }, 1200);
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = directUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      button.dataset.copyState = "check";
      applyTheme(document.body.classList.contains("theme-dark") ? "dark" : "light");
      button.classList.add("copied");
      setTimeout(() => {
        button.classList.remove("copied");
        button.dataset.copyState = "copy";
        applyTheme(document.body.classList.contains("theme-dark") ? "dark" : "light");
      }, 1200);
    }
  });
});
