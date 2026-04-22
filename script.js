const galleryData = {
  portraits: {
    SET1: [
      "images/portraits/SET1/p1.jpg",
      "images/portraits/SET1/p2.jpg"
    ],
    SET2: [
      "images/portraits/SET2/p3.jpg",
      "images/portraits/SET2/p4.jpg",
      "images/portraits/SET2/p5.jpg",
      "images/portraits/SET2/p6.jpg"
    ],
    SET3: [
      "images/portraits/SET3/p7.jpg",
      "images/portraits/SET3/p8.jpg",
      "images/portraits/SET3/p9.jpg"
    ],
    SET4: [
      "images/portraits/SET4/p10.jpg",
      "images/portraits/SET4/p11.jpg"
    ],
    SET5: [
      "images/portraits/SET5/p12.jpg",
      "images/portraits/SET5/p13.jpg"
    ],
    SET6: [
      "images/portraits/SET6/p14.jpg",
      "images/portraits/SET6/p15.jpg"
    ],
    SET7: [
      "images/portraits/SET7/p16.jpg",
      "images/portraits/SET7/p17.jpg"
    ],
    SET8: [
      "images/portraits/SET8/p18.jpg",
      "images/portraits/SET8/p19.jpg",
      "images/portraits/SET8/p20.jpg"
    ],
    SET9: [
      "images/portraits/SET9/p21.jpg",
      "images/portraits/SET9/p22.jpg"
    ],
    SET10: [
      "images/portraits/SET10/p23.jpg",
      "images/portraits/SET10/p24.jpg"
    ]
  },
  views: {
    SET1: [
      "images/views/SET1/v1.jpg",
      "images/views/SET1/v2.jpg",
      "images/views/SET1/v3.jpg"
    ],
    SET2: [
      "images/views/SET2/v4.jpg",
      "images/views/SET2/v5.jpg",
      "images/views/SET2/v6.jpg"
    ],
    SET3: [
      "images/views/SET3/v7.jpg",
      "images/views/SET3/v8.jpg",
      "images/views/SET3/v9.jpg",
      "images/views/SET3/v10.jpg",
      "images/views/SET3/v11.jpg"
    ],
    SET4: [
      "images/views/SET4/v12.jpg",
      "images/views/SET4/v13.jpg"
    ]
  },
  details: {
    SET1: [
      "images/details/SET1/d1.jpg",
      "images/details/SET1/d2.jpg"
    ],
    SET2: [
      "images/details/SET2/d3.jpg",
      "images/details/SET2/d4.jpg",
      "images/details/SET2/d5.jpg",
      "images/details/SET2/d6.jpg"
    ],
    SET3: [
      "images/details/SET3/d7.jpg",
      "images/details/SET3/d8.jpg"
    ]
  }
};

const CONTACT_SHEET_BREAKPOINTS = [
  { maxWidth: 900, columns: 3 }
];
const CONTACT_SHEET_DEFAULT_COLUMNS = 4;

const gallery = document.getElementById("gallery");
const brand = document.querySelector(".brand");
const infoToggle = document.getElementById("info-toggle");
const workView = document.getElementById("work-view");
const infoView = document.getElementById("info-view");
const categoryItems = document.querySelectorAll(".category-item");
const fullscreenSetViewer = document.getElementById("fullscreen-set-viewer");
const fullscreenSetContent = fullscreenSetViewer.querySelector(".fullscreen-set-content");
const highResImageViewer = document.getElementById("high-res-image-viewer");
const highResImage = highResImageViewer.querySelector("img");

let currentCategory = "portraits";
let wheelLock = false;
let categorySyncFrame = 0;
let resizeFrame = 0;
let sheetLoopLock = false;
let sheetSnapLock = false;
let pendingLoopCategory = "";
let fullscreenSetActive = false;
let fullscreenSetCategory = "portraits";
let fullscreenSetKey = "SET1";
let highResImageActive = false;
let highResImageIndex = 0;

function contactSheetColumns() {
  const breakpoint = CONTACT_SHEET_BREAKPOINTS.find(({ maxWidth }) => window.innerWidth <= maxWidth);

  return breakpoint?.columns || CONTACT_SHEET_DEFAULT_COLUMNS;
}

function fileName(path) {
  return path.split("/").pop().replace(/\.[^.]+$/, "");
}

function toPreviewPath(path) {
  return path
    .replace(/^images\//, "build/previews/grid/")
    .replace(/\.[^.]+$/, "-800.webp");
}

function toSetPreviewPath(path) {
  return path
    .replace(/^images\//, "build/previews/sets/")
    .replace(/\.[^.]+$/, "-800.webp");
}

function layoutClassForSet(images) {
  if (images.length === 2) return "layout-2";
  if (images.length === 3) return "layout-3";
  if (images.length === 5) return "layout-5";
  return "layout-4";
}

function maybePromoteToTriptych(grid, images, imgElements) {
  if (images.length !== 3) return;

  const updateLayout = () => {
    const allReady = imgElements.every((img) => img.complete && img.naturalWidth && img.naturalHeight);
    if (!allReady) return;

    const allPortrait = imgElements.every((img) => img.naturalHeight > img.naturalWidth);
    grid.classList.toggle("layout-3-triptych", allPortrait);
    grid.classList.toggle("layout-3", !allPortrait);
  };

  imgElements.forEach((img) => {
    img.addEventListener("load", updateLayout, { once: true });
  });

  updateLayout();
}

function maybeAdjustTwoImageLayout(grid, images, imgElements) {
  if (images.length !== 2) return;

  const updateLayout = () => {
    const allReady = imgElements.every((img) => img.complete && img.naturalWidth && img.naturalHeight);
    if (!allReady) return;

    const [first, second] = imgElements;
    const firstLandscape = first.naturalWidth > first.naturalHeight;
    const secondLandscape = second.naturalWidth > second.naturalHeight;
    const firstPortrait = first.naturalHeight > first.naturalWidth;
    const secondPortrait = second.naturalHeight > second.naturalWidth;

    grid.classList.remove("layout-2-mixed-landscape-first", "layout-2-mixed-landscape-second");

    if (firstLandscape && secondPortrait) {
      grid.classList.add("layout-2-mixed-landscape-first");
    }

    if (secondLandscape && firstPortrait) {
      grid.classList.add("layout-2-mixed-landscape-second");
    }
  };

  imgElements.forEach((img) => {
    img.addEventListener("load", updateLayout, { once: true });
  });

  updateLayout();
}

function categorySets(category) {
  return Object.entries(galleryData[category]);
}

function syncCategoryState() {
  document.body.dataset.category = currentCategory;
}

function syncCategoryMenu() {
  const isWork = !workView.classList.contains("is-hidden");

  categoryItems.forEach((entry) => {
    const isActive = isWork && entry.dataset.category === currentCategory;
    entry.classList.toggle("is-active", isActive);

    if (isActive) {
      entry.setAttribute("aria-current", "page");
    } else {
      entry.removeAttribute("aria-current");
    }
  });
}

function createContactSheet(category, options = {}) {
  const sheet = document.createElement("section");
  sheet.className = "contact-sheet";
  sheet.dataset.category = category;

  if (options.clone) {
    sheet.dataset.clone = "true";
    sheet.setAttribute("aria-hidden", "true");
  } else {
    sheet.id = `sheet-${category}`;
  }

  const sets = categorySets(category);
  const columns = contactSheetColumns();
  const imageCount = sets.reduce((total, [, images]) => total + images.length, 0);
  sheet.style.setProperty("--sheet-columns", String(columns));
  sheet.style.setProperty("--sheet-rows", String(Math.ceil(imageCount / columns)));

  sets.forEach(([setKey, images], setIndex) => {
    const setGroup = document.createElement("section");
    setGroup.className = "contact-set";
    setGroup.dataset.set = setKey;
    setGroup.setAttribute("aria-label", `${category} ${setKey}`);

    images.forEach((src) => {
      const item = document.createElement("figure");
      item.className = "gallery-item contact-frame";
      item.dataset.setKey = setKey;
      item.dataset.set = String(setIndex + 1).padStart(2, "0");
      item.addEventListener("mouseenter", () => {
        setHoveredSet(sheet, setKey);
      });
      item.addEventListener("click", () => {
        openFullscreenSet(category, setKey);
      });

      const img = document.createElement("img");
      img.src = toPreviewPath(src);
      img.alt = fileName(src);
      img.loading = "lazy";
      img.decoding = "async";

      item.appendChild(img);
      setGroup.appendChild(item);
    });

    sheet.appendChild(setGroup);
  });

  sheet.addEventListener("mouseleave", () => {
    clearHoveredSet(sheet);
  });

  return sheet;
}

function syncContactSheetGrid() {
  const columns = contactSheetColumns();

  gallery.querySelectorAll(".contact-sheet").forEach((sheet) => {
    const imageCount = sheet.querySelectorAll(".contact-frame").length;
    sheet.style.setProperty("--sheet-columns", String(columns));
    sheet.style.setProperty("--sheet-rows", String(Math.ceil(imageCount / columns)));
  });
}

function renderCurrentSet() {
  gallery.innerHTML = "";
  gallery.className = "gallery contact-sheets";

  const categories = orderedCategories();
  gallery.appendChild(createContactSheet(categories[categories.length - 1], { clone: true }));
  categories.forEach((category) => {
    gallery.appendChild(createContactSheet(category));
  });
  gallery.appendChild(createContactSheet(categories[0], { clone: true }));

  syncCategoryState();
  window.requestAnimationFrame(() => {
    syncContactSheetGrid();
    snapToCategory(currentCategory);
  });
}

function setIndexFor(category, setKey) {
  return categorySets(category).findIndex(([key]) => key === setKey);
}

function renderFullscreenSet(category, setKey) {
  const setEntry = galleryData[category]?.[setKey];
  if (!setEntry) return [];

  fullscreenSetContent.innerHTML = "";

  const group = document.createElement("section");
  group.className = "set-group";

  const grid = document.createElement("div");
  grid.className = `set-grid ${layoutClassForSet(setEntry)}`;
  grid.style.setProperty("--set-columns", String(setEntry.length === 4 ? 2 : 1));
  const imgElements = [];

  setEntry.forEach((src, imageIndex) => {
    const item = document.createElement("figure");
    item.className = "gallery-item fullscreen-set-item";

    const img = document.createElement("img");
    img.src = toSetPreviewPath(src);
    img.alt = fileName(src);
    img.loading = "eager";
    img.decoding = "async";
    img.addEventListener("click", (event) => {
      event.stopPropagation();
      openHighResImage(imageIndex);
    });
    imgElements.push(img);

    item.appendChild(img);
    grid.appendChild(item);
  });

  maybePromoteToTriptych(grid, setEntry, imgElements);
  maybeAdjustTwoImageLayout(grid, setEntry, imgElements);

  group.appendChild(grid);
  fullscreenSetContent.appendChild(group);

  return imgElements;
}

function openFullscreenSet(category, setKey) {
  if (!galleryData[category]?.[setKey]) return;

  fullscreenSetActive = true;
  fullscreenSetCategory = category;
  fullscreenSetKey = setKey;
  currentCategory = category;
  renderFullscreenSet(category, setKey);
  fullscreenSetViewer.classList.add("is-active");
  fullscreenSetViewer.setAttribute("aria-hidden", "false");
  document.body.classList.add("fullscreen-set-mode");
}

function closeFullscreenSet() {
  closeHighResImage();
  fullscreenSetActive = false;
  fullscreenSetViewer.classList.remove("is-active");
  fullscreenSetViewer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("fullscreen-set-mode");
  fullscreenSetContent.innerHTML = "";
}

function currentFullscreenSetImages() {
  return galleryData[fullscreenSetCategory]?.[fullscreenSetKey] || [];
}

function renderHighResImage() {
  const images = currentFullscreenSetImages();
  const src = images[highResImageIndex];
  if (!src) return;

  highResImage.src = src;
  highResImage.alt = fileName(src);
}

function openHighResImage(index) {
  const images = currentFullscreenSetImages();
  if (!images.length) return;

  highResImageActive = true;
  highResImageIndex = ((index % images.length) + images.length) % images.length;
  renderHighResImage();
  highResImageViewer.classList.add("is-active");
  highResImageViewer.setAttribute("aria-hidden", "false");
  document.body.classList.add("high-res-image-mode");
}

function closeHighResImage() {
  if (!highResImageActive) return;

  highResImageActive = false;
  highResImageViewer.classList.remove("is-active");
  highResImageViewer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("high-res-image-mode");
  highResImage.removeAttribute("src");
  highResImage.removeAttribute("alt");
}

function stepHighResImage(direction) {
  const images = currentFullscreenSetImages();
  if (!images.length) return;

  highResImageIndex = ((highResImageIndex + direction) % images.length + images.length) % images.length;
  renderHighResImage();
}

function stepFullscreenSet(direction) {
  const sets = categorySets(fullscreenSetCategory);
  if (!sets.length) return;

  const currentIndex = setIndexFor(fullscreenSetCategory, fullscreenSetKey);
  const nextIndex = ((currentIndex + direction) % sets.length + sets.length) % sets.length;
  fullscreenSetKey = sets[nextIndex][0];
  renderFullscreenSet(fullscreenSetCategory, fullscreenSetKey);
}

function setHoveredSet(sheet, setKey) {
  sheet.classList.add("is-hovering-set");
  sheet.querySelectorAll(".contact-frame").forEach((frame) => {
    frame.classList.toggle("is-set-hovered", frame.dataset.setKey === setKey);
  });
}

function clearHoveredSet(sheet) {
  sheet.classList.remove("is-hovering-set");
  sheet.querySelectorAll(".contact-frame.is-set-hovered").forEach((frame) => {
    frame.classList.remove("is-set-hovered");
  });
}

function orderedCategories() {
  return Array.from(categoryItems).map((item) => item.dataset.category);
}

function realSheets() {
  return Array.from(gallery.querySelectorAll(".contact-sheet:not([data-clone='true'])"));
}

function sheetScrollLeft(sheet) {
  if (!gallery || !sheet) return 0;

  const firstSheet = gallery.querySelector(".contact-sheet");
  const galleryOffset = firstSheet ? firstSheet.offsetLeft : gallery.offsetLeft;

  return Math.max(0, sheet.offsetLeft - galleryOffset);
}

function scrollToSheet(sheet, behavior = "smooth") {
  if (!gallery || !sheet) return;

  gallery.scrollTo({
    left: sheetScrollLeft(sheet),
    behavior
  });
}

function snapToCategory(category) {
  const target = document.getElementById(`sheet-${category}`);
  if (!gallery || !target) return;

  sheetSnapLock = true;
  const previousBehavior = gallery.style.scrollBehavior;
  const previousSnapType = gallery.style.scrollSnapType;

  gallery.style.scrollBehavior = "auto";
  gallery.style.scrollSnapType = "none";
  gallery.scrollLeft = sheetScrollLeft(target);

  window.requestAnimationFrame(() => {
    gallery.style.scrollBehavior = previousBehavior;
    gallery.style.scrollSnapType = previousSnapType;

    window.requestAnimationFrame(() => {
      sheetSnapLock = false;
    });
  });
}

function setCategory(category) {
  if (!galleryData[category]) return;

  currentCategory = category;
  pendingLoopCategory = "";
  setMode("work");
  syncCategoryState();

  const target = document.getElementById(`sheet-${category}`);
  scrollToSheet(target);
}

function syncCategoryFromScroll() {
  if (!gallery || workView.classList.contains("is-hidden") || sheetLoopLock || sheetSnapLock) return;

  const sheets = realSheets();
  if (!sheets.length) return;

  const galleryCenter = gallery.scrollLeft + gallery.clientWidth / 2;
  const activeSheet = sheets.reduce((nearest, sheet) => {
    const sheetCenter = sheetScrollLeft(sheet) + sheet.offsetWidth / 2;
    const distance = Math.abs(sheetCenter - galleryCenter);
    return !nearest || distance < nearest.distance ? { sheet, distance } : nearest;
  }, null)?.sheet;

  const category = activeSheet?.dataset.category;
  if (!category || category === currentCategory) return;

  currentCategory = category;
  syncCategoryMenu();
  syncCategoryState();
}

function stepCategory(direction) {
  if (sheetLoopLock || sheetSnapLock) return;

  const categories = orderedCategories();
  const currentIndex = categories.indexOf(currentCategory);
  const firstReal = document.getElementById(`sheet-${categories[0]}`);
  const lastReal = document.getElementById(`sheet-${categories[categories.length - 1]}`);
  const leadingClone = gallery.querySelector(".contact-sheet[data-clone='true']:first-child");
  const trailingClone = gallery.querySelector(".contact-sheet[data-clone='true']:last-child");

  if (direction < 0 && currentIndex === 0 && firstReal && leadingClone) {
    sheetLoopLock = true;
    currentCategory = categories[categories.length - 1];
    pendingLoopCategory = currentCategory;
    syncCategoryMenu();
    syncCategoryState();
    scrollToSheet(leadingClone);
    return;
  }

  if (direction > 0 && currentIndex === categories.length - 1 && lastReal && trailingClone) {
    sheetLoopLock = true;
    currentCategory = categories[0];
    pendingLoopCategory = currentCategory;
    syncCategoryMenu();
    syncCategoryState();
    scrollToSheet(trailingClone);
    return;
  }

  const nextIndex = ((currentIndex + direction) % categories.length + categories.length) % categories.length;
  const target = realSheets()[nextIndex];

  currentCategory = categories[nextIndex];
  pendingLoopCategory = "";
  syncCategoryMenu();
  syncCategoryState();
  scrollToSheet(target);
}

function loopSheetFromEdge(delta) {
  if (!gallery) return false;
  if (sheetLoopLock || sheetSnapLock) return true;

  const categories = orderedCategories();
  const firstReal = document.getElementById(`sheet-${categories[0]}`);
  const lastReal = document.getElementById(`sheet-${categories[categories.length - 1]}`);
  const leadingClone = gallery.querySelector(".contact-sheet[data-clone='true']:first-child");
  const trailingClone = gallery.querySelector(".contact-sheet[data-clone='true']:last-child");
  const atStart = firstReal && gallery.scrollLeft <= sheetScrollLeft(firstReal) + 2;
  const atEnd = lastReal && gallery.scrollLeft >= sheetScrollLeft(lastReal) - 2;

  if (delta < 0 && atStart) {
    sheetLoopLock = true;
    currentCategory = categories[categories.length - 1];
    pendingLoopCategory = currentCategory;
    syncCategoryState();
    syncCategoryMenu();
    scrollToSheet(leadingClone);
  } else if (delta > 0 && atEnd) {
    sheetLoopLock = true;
    currentCategory = categories[0];
    pendingLoopCategory = currentCategory;
    syncCategoryState();
    syncCategoryMenu();
    scrollToSheet(trailingClone);
  } else {
    return false;
  }

  return true;
}

function normalizeCloneScroll() {
  if (!gallery || sheetSnapLock) return;

  const categories = orderedCategories();
  const firstReal = document.getElementById(`sheet-${categories[0]}`);
  const lastReal = document.getElementById(`sheet-${categories[categories.length - 1]}`);
  const leadingClone = gallery.querySelector(".contact-sheet[data-clone='true']:first-child");
  const trailingClone = gallery.querySelector(".contact-sheet[data-clone='true']:last-child");
  if (!firstReal || !lastReal || !leadingClone || !trailingClone) return;

  const snapTolerance = 8;
  const leadingReached = gallery.scrollLeft <= sheetScrollLeft(leadingClone) + snapTolerance;
  const trailingReached = gallery.scrollLeft >= sheetScrollLeft(trailingClone) - snapTolerance;

  if (pendingLoopCategory === lastReal.dataset.category && leadingReached) {
    currentCategory = pendingLoopCategory;
    pendingLoopCategory = "";
    syncCategoryMenu();
    syncCategoryState();
    snapToCategory(currentCategory);
    sheetLoopLock = false;
  }

  if (pendingLoopCategory === firstReal.dataset.category && trailingReached) {
    currentCategory = pendingLoopCategory;
    pendingLoopCategory = "";
    syncCategoryMenu();
    syncCategoryState();
    snapToCategory(currentCategory);
    sheetLoopLock = false;
  }
}

function handleResize() {
  if (!gallery || workView.classList.contains("is-hidden")) return;
  if (resizeFrame) {
    window.cancelAnimationFrame(resizeFrame);
  }

  resizeFrame = window.requestAnimationFrame(() => {
    resizeFrame = 0;
    sheetLoopLock = false;
    pendingLoopCategory = "";
    syncContactSheetGrid();
    snapToCategory(currentCategory);
  });
}

function setMode(mode) {
  const isWork = mode === "work";
  infoToggle.classList.toggle("is-active", !isWork);
  workView.classList.toggle("is-hidden", !isWork);
  infoView.classList.toggle("is-hidden", isWork);
  document.body.classList.toggle("info-mode", !isWork);
  syncCategoryMenu();
}

categoryItems.forEach((item) => {
  item.addEventListener("click", () => {
    setCategory(item.dataset.category);
  });
});

infoToggle.addEventListener("click", () => {
  if (fullscreenSetActive) {
    closeFullscreenSet();
  }

  setMode("info");
});

fullscreenSetViewer.addEventListener("click", (event) => {
  if (!event.target.closest(".fullscreen-set-item img")) {
    closeFullscreenSet();
  }
});

highResImageViewer.addEventListener("click", (event) => {
  if (event.target === highResImageViewer) {
    closeHighResImage();
  }
});

highResImage.addEventListener("click", (event) => {
  event.stopPropagation();
  const rect = highResImage.getBoundingClientRect();
  const direction = event.clientX > rect.left + rect.width / 2 ? 1 : -1;
  stepHighResImage(direction);
});

highResImageViewer.addEventListener(
  "wheel",
  (event) => {
    if (!highResImageActive) return;
    if (Math.abs(event.deltaX) < 4 && Math.abs(event.deltaY) < 4) return;

    event.preventDefault();
    if (wheelLock) return;

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    wheelLock = true;
    stepHighResImage(delta > 0 ? 1 : -1);

    window.setTimeout(() => {
      wheelLock = false;
    }, 260);
  },
  { passive: false }
);

fullscreenSetViewer.addEventListener(
  "wheel",
  (event) => {
    if (!fullscreenSetActive) return;
    if (Math.abs(event.deltaX) < 4 && Math.abs(event.deltaY) < 4) return;

    event.preventDefault();
    if (wheelLock) return;

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    wheelLock = true;
    stepFullscreenSet(delta > 0 ? 1 : -1);

    window.setTimeout(() => {
      wheelLock = false;
    }, 360);
  },
  { passive: false }
);

brand?.addEventListener("click", (event) => {
  event.preventDefault();
  setMode("info");
});

workView.addEventListener(
  "wheel",
  (event) => {
    if (workView.classList.contains("is-hidden")) return;
    if (Math.abs(event.deltaX) < 4 && Math.abs(event.deltaY) < 4) return;

    event.preventDefault();
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (loopSheetFromEdge(delta)) return;

    gallery.scrollBy({ left: delta, behavior: "auto" });
  },
  { passive: false }
);

gallery.addEventListener("scroll", () => {
  if (categorySyncFrame) return;

  categorySyncFrame = window.requestAnimationFrame(() => {
    categorySyncFrame = 0;
    syncCategoryFromScroll();
    normalizeCloneScroll();
  });
});

window.addEventListener("resize", handleResize);

document.addEventListener("keydown", (event) => {
  const handledOverlayKeys = new Set([
    "Escape",
    "ArrowRight",
    "ArrowDown",
    "PageDown",
    "ArrowLeft",
    "ArrowUp",
    "PageUp"
  ]);

  if (highResImageActive) {
    if (handledOverlayKeys.has(event.key)) {
      event.preventDefault();
    }

    if (event.key === "Escape") {
      closeHighResImage();
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "PageDown") {
      stepHighResImage(1);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "PageUp") {
      stepHighResImage(-1);
    }

    return;
  }

  if (fullscreenSetActive) {
    if (handledOverlayKeys.has(event.key)) {
      event.preventDefault();
    }

    if (event.key === "Escape") {
      closeFullscreenSet();
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "PageDown") {
      stepFullscreenSet(1);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "PageUp") {
      stepFullscreenSet(-1);
      return;
    }

    return;
  }

  if (workView.classList.contains("is-hidden")) {
    if (event.key === "Escape") {
      event.preventDefault();
      setMode("work");
    }

    return;
  }

  if (event.key === "ArrowRight") {
    stepCategory(1);
  }

  if (event.key === "ArrowLeft") {
    stepCategory(-1);
  }

  if (event.key === "ArrowDown" || event.key === "PageDown") {
    stepCategory(1);
  }

  if (event.key === "ArrowUp" || event.key === "PageUp") {
    stepCategory(-1);
  }
});

renderCurrentSet();
setMode("work");
