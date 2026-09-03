function externalAttrs(url) {
  return url.startsWith("http") ? 'target="_blank" rel="noopener"' : "";
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function logoMark(item) {
  if (item.logoSrc) {
    return `
      <span class="logo-frame">
        <img src="${item.logoSrc}" alt="${item.logo} logo" loading="lazy">
      </span>
    `;
  }

  return `<span class="logo-frame logo-fallback" aria-hidden="true">${item.logo}</span>`;
}

function formatLogoHeading(value, targetId) {
  if (targetId !== "education-list") return value;

  return value.replace(/\s+(\([^)]*\))$/, "<br>$1");
}

function renderLogoRows(items, targetId, nameKey, detailKey) {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.innerHTML = items
    .map(
      (item) => `
        <article class="logo-card">
          ${logoMark(item)}
          <div>
            <h3>${formatLogoHeading(item[nameKey], targetId)}</h3>
            <p>${item[detailKey]}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function getSlideImages(project) {
  if (project.slideImages) return project.slideImages;
  if (!project.slideFolder || !project.slideCount) return [];

  return Array.from(
    { length: project.slideCount },
    (_, index) => `${project.slideFolder}/slide-${index + 1}.png`
  );
}

function renderProjectSlides(project) {
  const slideImages = getSlideImages(project);

  if (slideImages.length === 0) {
    return `<div class="slide-empty">No slide preview yet</div>`;
  }

  return `
    <div class="slideshow" data-current="0" aria-label="${project.name} slideshow">
      <div class="slide-stage">
        <img src="${slideImages[0]}" alt="${project.name} slide 1" loading="lazy">
      </div>
      <div class="slide-controls">
        <button type="button" class="slide-prev" aria-label="Previous slide">Prev</button>
        <span>1 / ${slideImages.length}</span>
        <button type="button" class="slide-next" aria-label="Next slide">Next</button>
      </div>
    </div>
  `;
}

function renderProjects() {
  const target = document.getElementById("project-grid");
  if (!target) return;

  target.innerHTML = PROJECTS
    .map(
      (project, index) => {
        const slideImages = getSlideImages(project);
        const thumbnail = project.thumbnail || slideImages[0];
        const href =
          slideImages.length > 0
            ? `slideshow.html?project=${encodeURIComponent(project.slug || index)}`
            : project.github;

        return `
        <a class="project-card" href="${href}" ${externalAttrs(href)}>
          <div class="project-body">
            <h3>${project.name}</h3>
            <ul class="tag-list">
              ${project.tags.map((tag) => `<li>${tag}</li>`).join("")}
            </ul>
          </div>
          ${
            thumbnail
              ? `<img class="project-thumbnail" src="${thumbnail}" alt="${project.name} slide 1" loading="lazy">`
              : ""
          }
        </a>
      `;
      }
    )
    .join("");
}

function bindSlideshows(scope, project) {
  const slideImages = getSlideImages(project);

  scope.querySelectorAll(".slideshow").forEach((slideshow) => {
    const img = slideshow.querySelector("img");
    const count = slideshow.querySelector("span");
    const prev = slideshow.querySelector(".slide-prev");
    const next = slideshow.querySelector(".slide-next");
    let current = 0;

    function showSlide(index) {
      current = (index + slideImages.length) % slideImages.length;
      img.src = slideImages[current];
      img.alt = `${project.name} slide ${current + 1}`;
      count.textContent = `${current + 1} / ${slideImages.length}`;
      slideshow.dataset.current = current;
    }

    prev.addEventListener("click", () => showSlide(current - 1));
    next.addEventListener("click", () => showSlide(current + 1));
  });
}

function renderStandaloneSlideshow() {
  const target = document.getElementById("project-slideshow");
  if (!target) return;

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("project");
  const project = PROJECTS.find((item) => item.slug === projectId);

  if (!project || getSlideImages(project).length === 0) {
    target.innerHTML = `
      <h2>Slides not found</h2>
      <p class="muted-text">This project does not have a slide preview yet.</p>
    `;
    return;
  }

  target.innerHTML = `
    <article>
      <div class="project-title-row">
        <h2>${project.name}</h2>
        ${
          project.github
            ? `<p class="detail-actions"><a class="logo-action" href="${project.github}" ${externalAttrs(project.github)} aria-label="Open ${project.name} on GitHub"><img src="asset/logo/github.png" alt="" loading="lazy"></a></p>`
            : ""
        }
      </div>
      <ul class="tag-list">
        ${project.tags.map((tag) => `<li>${tag}</li>`).join("")}
      </ul>
      ${renderProjectSlides(project)}
    </article>
  `;

  bindSlideshows(target, project);
}

function renderContact() {
  const target = document.getElementById("contact-links");
  if (!target) return;

  const links = [
    ...(PROFILE.contactLinks || [
      { label: "LinkedIn", url: PROFILE.linkedin },
      { label: "GitHub", url: PROFILE.github },
    ]),
  ];

  target.innerHTML = links
    .map(
      ({ label, url, logoSrc }) => `
        <a class="contact-logo-link" href="${url}" ${externalAttrs(url)} aria-label="${label}">
          ${logoSrc ? `<img src="${logoSrc}" alt="" loading="lazy">` : `<span>${label}</span>`}
        </a>
      `
    )
    .join("");
}

setText("profile-title", PROFILE.title);
setText("profile-name", PROFILE.name);
setText("profile-intro", PROFILE.intro);

renderLogoRows(EXPERIENCE, "experience-list", "title", "company");
renderLogoRows(EDUCATION, "education-list", "degree", "school");
renderProjects();
renderStandaloneSlideshow();
renderContact();
