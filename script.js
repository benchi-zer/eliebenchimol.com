const portfolioData = {
  galleryData: window.galleryData,
  contactLayouts: window.contactLayouts,
  freeContactLayouts: window.freeContactLayouts,
  defaultLayoutEdits: window.defaultLayoutEdits
};

if (!portfolioData.galleryData || !portfolioData.contactLayouts || !portfolioData.freeContactLayouts) {
  throw new Error("Missing portfolio data");
}

const {
  galleryData,
  contactLayouts,
  freeContactLayouts,
  defaultLayoutEdits
} = portfolioData;

const gallery = document.getElementById("gallery");
const entryView = document.getElementById("entry-view");
const entryItems = document.querySelectorAll(".entry-nav-item");
const brand = document.querySelector(".brand");
const workView = document.getElementById("work-view");
const categoryItems = document.querySelectorAll(".category-item");
const highResImageViewer = document.getElementById("high-res-image-viewer");
const highResImage = highResImageViewer.querySelector("img");
const highResClose = document.getElementById("high-res-close");
const mobileProgressFill = document.querySelector(".mobile-progress-fill");
const mobilePrevSetButton = document.getElementById("mobile-prev-set");
const mobileNextSetButton = document.getElementById("mobile-next-set");
const mobileSetIndicator = document.getElementById("mobile-set-indicator");

let currentCategory = "portraits";
let currentMobileSetKey = "SET1";
let wheelLock = false;
let categorySyncFrame = 0;
let resizeFrame = 0;
let sheetLoopLock = false;
let sheetSnapLock = false;
let pendingLoopCategory = "";
let highResSetCategory = "portraits";
let highResSetKey = "SET1";
let highResImageActive = false;
let highResImageIndex = 0;
let contactSheetObserver = null;
let mobileSwipeStart = null;
const MOBILE_LAYOUT_QUERY = window.matchMedia("(max-width: 760px)");
const COARSE_POINTER_QUERY = window.matchMedia("(pointer: coarse)");
let mobileLayoutActive = false;
const PREVIEW_CACHE_BUST = "20260423-2";
const HIGH_RES_PREVIEW_WIDTH = 2000;
const PREVIEW_WIDTHS = [480, 960];
const DEFAULT_PREVIEW_WIDTH = 960;
const GRID_IMAGE_SIZES = "(max-width: 760px) 64vw, (max-width: 1200px) 38vw, 24vw";
const SET_IMAGE_SIZES = "(max-width: 760px) 90vw, (max-width: 1200px) 70vw, 52vw";
const GRID_LAYOUT_SCALE_RANGE = { min: 0.25, max: 12 };
const SETVIEW_LAYOUT_SCALE_RANGE = { min: 0.25, max: 1.35 };
const LAYOUT_STORAGE_VERSION = "2026-04-23-layout-v2";
const hasSetVariantManifest = Array.isArray(window.__SET_VARIANT_PATHS);
const setVariantPathSet = hasSetVariantManifest ? new Set(window.__SET_VARIANT_PATHS) : null;
function fileName(path) {
  return path.split("/").pop().replace(/\.[^.]+$/, "");
}

function toPreviewPath(path, width = DEFAULT_PREVIEW_WIDTH) {
  return path
    .replace(/^images\//, "build/previews/grid/")
    .replace(/\.[^.]+$/, `-${width}.webp`) + `?v=${PREVIEW_CACHE_BUST}`;
}

function toSetPreviewPath(path, width = DEFAULT_PREVIEW_WIDTH) {
  if (hasSetVariantManifest && !setVariantPathSet.has(path)) {
    return toPreviewPath(path, width);
  }

  return path
    .replace(/^images\//, "build/previews/sets/")
    .replace(/\.[^.]+$/, `-${width}.webp`) + `?v=${PREVIEW_CACHE_BUST}`;
}

function toHighResPreviewPath(path) {
  return path
    .replace(/^images\//, "build/previews/highres/")
    .replace(/\.[^.]+$/, `-${HIGH_RES_PREVIEW_WIDTH}.webp`) + `?v=${PREVIEW_CACHE_BUST}`;
}

function applyResponsivePreview(img, path, options = {}) {
  const mode = options.mode === "set" ? "set" : "grid";
  const sizes = options.sizes || (mode === "set" ? SET_IMAGE_SIZES : GRID_IMAGE_SIZES);
  const resolver = mode === "set" ? toSetPreviewPath : toPreviewPath;
  const fallbackWidth = PREVIEW_WIDTHS.includes(DEFAULT_PREVIEW_WIDTH)
    ? DEFAULT_PREVIEW_WIDTH
    : PREVIEW_WIDTHS[Math.floor(PREVIEW_WIDTHS.length / 2)];

  img.src = resolver(path, fallbackWidth);
  img.srcset = PREVIEW_WIDTHS.map((width) => `${resolver(path, width)} ${width}w`).join(", ");
  img.sizes = sizes;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function setCssPositionVars(node, xVar, yVar, x, y, unit = "px") {
  node.style.setProperty(xVar, `${x}${unit}`);
  node.style.setProperty(yVar, `${y}${unit}`);
}

function setPixelPositionVars(node, xVar, yVar, x, y) {
  setCssPositionVars(node, xVar, yVar, Math.round(x), Math.round(y));
}

function setPercentPositionVars(node, xVar, yVar, x, y) {
  const nextX = Math.max(2, Math.min(98, Number(x)));
  const nextY = Math.max(2, Math.min(98, Number(y)));
  setCssPositionVars(node, xVar, yVar, nextX, nextY, "%");
  return { x: nextX, y: nextY };
}

function layoutClassForSet(images) {
  if (images.length === 2) return "layout-2";
  if (images.length === 3) return "layout-3";
  if (images.length === 5) return "layout-5";
  return "layout-4";
}

function isMobileLayout() {
  return mobileLayoutActive;
}

function detectMobileLayout() {
  const viewportWidth = window.visualViewport?.width || window.innerWidth;
  const layoutViewportWidth = window.innerWidth;
  const coarsePointer = COARSE_POINTER_QUERY.matches || navigator.maxTouchPoints > 0;
  return viewportWidth <= 760 || layoutViewportWidth <= 760 || (coarsePointer && viewportWidth <= 900);
}

function syncResponsiveLayoutMode() {
  const next = detectMobileLayout();
  const changed = next !== mobileLayoutActive;
  mobileLayoutActive = next;
  document.body.classList.toggle("mobile-layout", mobileLayoutActive);
  return changed;
}

function sheetScrollPosition(sheet) {
  return isMobileLayout() ? sheet.offsetTop : sheet.offsetLeft;
}

function galleryScrollPosition() {
  return isMobileLayout() ? gallery.scrollTop : gallery.scrollLeft;
}

function scrollGalleryTo(position, behavior = "smooth") {
  if (!gallery) return;

  gallery.scrollTo(
    isMobileLayout()
      ? { top: position, behavior }
      : { left: position, behavior }
  );
}

function galleryViewSize() {
  return isMobileLayout() ? gallery.clientHeight : gallery.clientWidth;
}

function sheetViewSize(sheet) {
  return isMobileLayout() ? sheet.offsetHeight : sheet.offsetWidth;
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
    const bothLandscape = firstLandscape && secondLandscape;

    grid.classList.remove("layout-2-mixed-landscape-first", "layout-2-mixed-landscape-second");
    grid.classList.toggle("layout-2-landscape", bothLandscape);

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

  syncMobileProgress();
}

function syncMobileProgress() {
  if (!mobileProgressFill) return;

  if (!isMobileLayout() || workView.classList.contains("is-hidden")) {
    mobileProgressFill.style.transform = "scaleX(0)";
    syncMobileDock();
    return;
  }

  const setKeys = orderedSetKeys(currentCategory);
  if (!setKeys.length) {
    mobileProgressFill.style.transform = "scaleX(0)";
    syncMobileDock();
    return;
  }

  const currentIndex = Math.max(0, setKeys.indexOf(currentMobileSetKey));
  const progress = (currentIndex + 1) / setKeys.length;
  mobileProgressFill.style.transform = `scaleX(${Math.max(0.02, progress)})`;
  mobileProgressFill.dataset.label = `${currentIndex + 1}/${setKeys.length}`;
  syncMobileDock();
}

function categoryLabelFor(category) {
  const match = Array.from(categoryItems).find((item) => item.dataset.category === category);
  return match?.textContent?.trim() || category;
}

function syncMobileDock() {
  if (!mobileSetIndicator || !mobilePrevSetButton || !mobileNextSetButton) return;

  const active = isMobileLayout() && !workView.classList.contains("is-hidden");
  if (!active) {
    mobileSetIndicator.textContent = "";
    mobilePrevSetButton.disabled = true;
    mobileNextSetButton.disabled = true;
    return;
  }

  const setKeys = orderedSetKeys(currentCategory);
  if (!setKeys.length) {
    mobileSetIndicator.textContent = "";
    mobilePrevSetButton.disabled = true;
    mobileNextSetButton.disabled = true;
    return;
  }

  const currentIndex = Math.max(0, setKeys.indexOf(currentMobileSetKey));
  const total = setKeys.length;
  const navDisabled = total <= 1;

  mobileSetIndicator.textContent = `${categoryLabelFor(currentCategory)} ${currentIndex + 1}/${total}`;
  mobilePrevSetButton.disabled = navDisabled;
  mobileNextSetButton.disabled = navDisabled;
  mobilePrevSetButton.setAttribute("aria-label", `Previous ${categoryLabelFor(currentCategory)} set`);
  mobileNextSetButton.setAttribute("aria-label", `Next ${categoryLabelFor(currentCategory)} set`);
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

  prepareContactSheetShell(sheet, category);

  if (options.hydrate !== false) {
    hydrateContactSheet(sheet);
  }

  return sheet;
}

function prepareContactSheetShell(sheet, category) {
  if (isFreeContactCategory(category)) {
    sheet.classList.add("free-contact-sheet");
    sheet.style.setProperty("--sheet-rows", "1");
    sheet.addEventListener("mouseleave", () => {
      clearHoveredSet(sheet);
    });
    return;
  }

  const layoutRows = contactLayoutRows(category);
  sheet.style.setProperty("--sheet-rows", String(layoutRows.length));
  sheet.addEventListener("mouseleave", () => {
    clearHoveredSet(sheet);
  });
}

function hydrateContactSheet(sheet) {
  if (!sheet || sheet.dataset.hydrated === "true") return sheet;

  const category = sheet.dataset.category;
  if (!category) return sheet;

  sheet.dataset.hydrated = "true";

  if (isFreeContactCategory(category)) {
    createFreeContactSheet(sheet, category);
    return sheet;
  }

  const layoutRows = contactLayoutRows(category);

  layoutRows.forEach((rowConfig, rowIndex) => {
    const row = document.createElement("div");
    row.className = "contact-row";
    row.dataset.row = String(rowIndex + 1);
    row.dataset.align = rowConfig.align || "center";

    rowConfig.sets.forEach((setConfig) => {
      const setKey = typeof setConfig === "string" ? setConfig : setConfig.key;
      const images = galleryData[category]?.[setKey] || [];
      const setIndex = setIndexFor(category, setKey);
      const chunks = splitSetImagesByConfig(images, setConfig);

      chunks.forEach((chunk, chunkIndex) => {
        row.appendChild(createContactSet({
          category,
          setKey,
          images,
          chunk,
          chunkIndex,
          rowIndex,
          setIndex,
          sheet
        }));
      });
    });

    sheet.appendChild(row);
  });

  return sheet;
}

function createFreeContactSheet(sheet, category) {
  sheet.style.setProperty("--sheet-rows", "1");
  let imageNumber = 0;

  categorySets(category).forEach(([setKey, images]) => {
    const setIndex = setIndexFor(category, setKey);

    images.forEach((src, imageIndex) => {
      imageNumber += 1;
      sheet.appendChild(createFreeContactFrame({
        category,
        setKey,
        src,
        imageIndex,
        setIndex,
        setCount: images.length,
        imageNumber,
        sheet
      }));
    });
  });
}

function createFreeContactFrame({ category, setKey, src, imageIndex, setIndex, setCount, imageNumber, sheet }) {
  const item = document.createElement("figure");
  item.className = "gallery-item contact-frame free-contact-frame";
  item.dataset.category = category;
  item.dataset.setKey = setKey;
  item.dataset.set = String(setIndex + 1).padStart(2, "0");
  item.dataset.count = String(setCount);
  item.dataset.index = String(imageIndex + 1);
  item.dataset.freeIndex = String(imageNumber);
  item.dataset.layoutKey = layoutKey(category, setKey, 1, imageIndex + 1);
  item.style.setProperty("--free-x", `${freeImageX(imageNumber)}%`);
  item.style.setProperty("--free-y", `${freeImageY(imageNumber)}%`);

  item.addEventListener("mouseenter", () => {
    setHoveredSet(sheet, setKey);
  });

  const img = document.createElement("img");
  applyResponsivePreview(img, src, { mode: "grid" });
  img.alt = fileName(src);
  img.loading = "lazy";
  img.decoding = "async";
  img.addEventListener("load", () => {
    scheduleFreeContactRegulation();
  });

  item.appendChild(img);
  return item;
}

function freeImageX(index) {
  const columns = 6;
  const column = (index - 1) % columns;
  return 10 + column * 16;
}

function freeImageY(index) {
  const columns = 6;
  const row = Math.floor((index - 1) / columns);
  return 14 + row * 19;
}

function isPercentLikeEdit(edit = {}) {
  const x = Number(edit.x);
  const y = Number(edit.y);

  return Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 100 && y >= 0 && y <= 100;
}

function resolveFreeContactPosition(frame, edit, freeIndex) {
  const sheet = frame.closest(".contact-sheet");
  const fallbackX = freeImageX(freeIndex);
  const fallbackY = freeImageY(freeIndex);

  if (!edit) {
    return { x: fallbackX, y: fallbackY };
  }

  if (isPercentLikeEdit(edit)) {
    return {
      x: Number(edit.x),
      y: Number(edit.y)
    };
  }

  const width = Math.max(1, sheet?.clientWidth || window.innerWidth || 1);
  const height = Math.max(1, sheet?.clientHeight || window.innerHeight || 1);

  return {
    x: Math.max(2, Math.min(98, 50 + (Number(edit.x || 0) / width) * 100)),
    y: Math.max(2, Math.min(98, 50 + (Number(edit.y || 0) / height) * 100))
  };
}

function contactLayoutRows(category) {
  return contactLayouts[category] || categorySets(category).map(([setKey]) => ({
    align: "center",
    sets: [setKey]
  }));
}

function splitSetImagesByConfig(images, setConfig) {
  const entries = images.map((src, imageIndex) => ({ src, imageIndex }));
  const chunks = typeof setConfig === "object" ? setConfig.chunks : null;

  if (!chunks?.length) {
    return [entries];
  }

  let cursor = 0;

  return chunks.map((size) => {
    const chunk = entries.slice(cursor, cursor + size);
    cursor += size;
    return chunk;
  }).filter(Boolean);
}

function createContactSet({ category, setKey, images, chunk, chunkIndex, rowIndex, setIndex, sheet }) {
  const setGroup = document.createElement("section");
  setGroup.className = "contact-set";
  setGroup.dataset.set = setKey;
  setGroup.dataset.category = category;
  setGroup.dataset.count = String(images.length);
  setGroup.dataset.index = String(setIndex + 1);
  setGroup.dataset.chunk = String(chunkIndex + 1);
  setGroup.dataset.row = String(rowIndex + 1);
  setGroup.dataset.layoutKey = layoutKey(category, setKey, chunkIndex + 1);
  setGroup.style.setProperty("--set-count", String(chunk.length));
  setGroup.setAttribute("aria-label", `${category} ${setKey}`);
  setGroup.addEventListener("mouseenter", () => {
    setHoveredSet(sheet, setKey);
  });

  chunk.forEach(({ src, imageIndex }) => {
    const item = document.createElement("figure");
    item.className = "gallery-item contact-frame";
    item.dataset.setKey = setKey;
    item.dataset.set = String(setIndex + 1).padStart(2, "0");
    item.dataset.count = String(images.length);
    item.dataset.index = String(imageIndex + 1);
    item.dataset.layoutKey = layoutKey(category, setKey, chunkIndex + 1, imageIndex + 1);

    if (imageIndex === 0) {
      item.classList.add("is-set-start");
    }

    if (imageIndex === images.length - 1) {
      item.classList.add("is-set-end");
    }

    item.addEventListener("mouseenter", () => {
      setHoveredSet(sheet, setKey);
    });

    const img = document.createElement("img");
    applyResponsivePreview(img, src, { mode: "grid" });
    img.alt = fileName(src);
    img.loading = "lazy";
    img.decoding = "async";

    item.appendChild(img);
    setGroup.appendChild(item);
  });

  return setGroup;
}

function syncContactSheetGrid() {
  gallery.querySelectorAll(".contact-sheet").forEach((sheet) => {
    const category = sheet.dataset.category;
    if (isFreeContactCategory(category)) {
      sheet.style.setProperty("--sheet-rows", "1");
      return;
    }

    sheet.style.setProperty("--sheet-rows", String(contactLayoutRows(category).length));
  });

  applyLayoutEdits();
}

function observeContactSheets() {
  if (contactSheetObserver) {
    contactSheetObserver.disconnect();
    contactSheetObserver = null;
  }

  if (!("IntersectionObserver" in window)) {
    gallery.querySelectorAll(".contact-sheet").forEach((sheet) => {
      hydrateContactSheet(sheet);
    });
    syncContactSheetGrid();
    applyLayoutEdits();
    return;
  }

  contactSheetObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const sheet = entry.target;
      hydrateContactSheet(sheet);
      contactSheetObserver?.unobserve(sheet);
      syncContactSheetGrid();
      applyLayoutEdits();
    });
  }, {
    root: gallery,
    rootMargin: isMobileLayout() ? "120% 0px 120% 0px" : "0px 120% 0px 120%",
    threshold: 0.01
  });

  gallery.querySelectorAll(".contact-sheet:not([data-hydrated='true'])").forEach((sheet) => {
    contactSheetObserver.observe(sheet);
  });
}

function renderCurrentSet() {
  gallery.innerHTML = "";
  gallery.className = isMobileLayout()
    ? "gallery mobile-feed mobile-layout"
    : "gallery portfolio-grid";

  if (isMobileLayout()) {
    const categories = orderedCategories();
    const category = categories.includes(currentCategory) ? currentCategory : categories[0];
    const setKeys = orderedSetKeys(category);

    if (!setKeys.includes(currentMobileSetKey)) {
      currentMobileSetKey = setKeys[0] || "";
    }

    if (!category || !setKeys.length) return;

    syncCategoryMenu();
    setKeys.forEach((setKey) => {
      gallery.appendChild(createMobileSetCard(category, setKey));
    });
    syncCategoryState();

    window.requestAnimationFrame(() => {
      scrollMobileSetIntoView(currentMobileSetKey, "auto");
      syncMobileSetFromScroll();
    });
    return;
  }

  orderedSetKeys(currentCategory).forEach((setKey) => {
    gallery.appendChild(createPortfolioSetCard(currentCategory, setKey));
  });
  gallery.scrollTop = 0;
  syncCategoryState();
  window.requestAnimationFrame(() => {
    syncCategoryState();
  });
}

function setIndexFor(category, setKey) {
  return categorySets(category).findIndex(([key]) => key === setKey);
}

function currentHighResSetImages() {
  return galleryData[highResSetCategory]?.[highResSetKey] || [];
}

function renderHighResImage() {
  const images = currentHighResSetImages();
  const src = images[highResImageIndex];
  if (!src) return;

  highResImage.src = toHighResPreviewPath(src);
  highResImage.alt = fileName(src);
}

function openHighResImage(index) {
  const images = currentHighResSetImages();
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
  const images = currentHighResSetImages();
  if (!images.length) return;

  highResImageIndex = ((highResImageIndex + direction) % images.length + images.length) % images.length;
  renderHighResImage();
}

function setHoveredSet(sheet, setKey) {
  sheet.classList.add("is-hovering-set");
  sheet.querySelectorAll(".contact-set").forEach((set) => {
    set.classList.toggle("is-set-hovered", set.dataset.set === setKey);
  });
  sheet.querySelectorAll(".contact-frame").forEach((frame) => {
    frame.classList.toggle("is-set-hovered", frame.dataset.setKey === setKey);
  });
}

function clearHoveredSet(sheet) {
  sheet.classList.remove("is-hovering-set");
  sheet.querySelectorAll(".contact-set.is-set-hovered").forEach((set) => {
    set.classList.remove("is-set-hovered");
  });
  sheet.querySelectorAll(".contact-frame.is-set-hovered").forEach((frame) => {
    frame.classList.remove("is-set-hovered");
  });
}

function orderedCategories() {
  const categories = Array.from(categoryItems).map((item) => item.dataset.category);
  return categories;
}

function orderedSetKeys(category = currentCategory) {
  return categorySets(category).map(([setKey]) => setKey);
}

function mobileSlideId(category, setKey) {
  return `mobile-slide-${category}-${setKey}`;
}

function createMobileSlide(category, setKey) {
  const slide = document.createElement("section");
  slide.className = "mobile-slide";
  slide.dataset.category = category;
  slide.dataset.setKey = setKey;
  slide.id = mobileSlideId(category, setKey);

  const images = galleryData[category]?.[setKey] || [];
  slide.style.setProperty("--mobile-slide-count", String(Math.max(1, images.length)));

  const stack = document.createElement("div");
  stack.className = "mobile-slide-stack";

  images.forEach((src, imageIndex) => {
    const frame = document.createElement("figure");
    frame.className = "mobile-slide-frame";
    frame.dataset.index = String(imageIndex + 1);
    const openFrame = () => {
      highResSetCategory = category;
      highResSetKey = setKey;
      currentCategory = category;
      currentMobileSetKey = setKey;
      openHighResImage(imageIndex);
    };

    frame.addEventListener("touchend", (event) => {
      if (!mobileSwipeStart) return;
      const touch = event.changedTouches[0];
      if (!touch) return;

      const dx = Math.abs(touch.clientX - mobileSwipeStart.x);
      const dy = Math.abs(touch.clientY - mobileSwipeStart.y);
      if (Math.max(dx, dy) < 20) {
        event.preventDefault();
        event.stopPropagation();
        openFrame();
      }
    }, { passive: false });

    frame.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openFrame();
    });

    const img = document.createElement("img");
    applyResponsivePreview(img, src, { mode: "set" });
    img.alt = fileName(src);
    img.loading = imageIndex === 0 ? "eager" : "lazy";
    img.decoding = "async";
    img.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    frame.appendChild(img);
    stack.appendChild(frame);
  });

  slide.appendChild(stack);
  return slide;
}

function createMobileSetCard(category, setKey) {
  return createPortfolioSetCard(category, setKey, { mobile: true });
}

function createPortfolioSetCard(category, setKey, options = {}) {
  const card = document.createElement("article");
  card.className = options.mobile ? "portfolio-set-card mobile-set-card" : "portfolio-set-card";
  card.dataset.category = category;
  card.dataset.setKey = setKey;
  card.id = mobileSlideId(category, setKey);

  const images = galleryData[category]?.[setKey] || [];
  const header = document.createElement("button");
  header.className = options.mobile ? "portfolio-set-header mobile-set-header" : "portfolio-set-header";
  header.type = "button";
  header.tabIndex = -1;
  header.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.textContent = categoryLabelFor(category);

  const count = document.createElement("span");
  count.textContent = "";
  count.setAttribute("aria-hidden", "true");

  header.append(label, count);

  const grid = document.createElement("div");
  grid.className = options.mobile ? "portfolio-set-grid mobile-set-grid" : "portfolio-set-grid";
  grid.dataset.count = String(images.length);
  grid.style.setProperty("--set-card-count", String(Math.max(1, images.length)));
  grid.style.setProperty("--mobile-set-count", String(Math.max(1, images.length)));

  images.forEach((src, imageIndex) => {
    const frame = document.createElement("figure");
    frame.className = options.mobile ? "portfolio-set-frame mobile-set-frame" : "portfolio-set-frame";
    frame.dataset.index = String(imageIndex + 1);

    frame.addEventListener("click", (event) => {
      event.preventDefault();
      highResSetCategory = category;
      highResSetKey = setKey;
      currentCategory = category;
      currentMobileSetKey = setKey;
      openHighResImage(imageIndex);
      syncCategoryMenu();
      syncCategoryState();
    });

    const img = document.createElement("img");
    applyResponsivePreview(img, src, { mode: "set" });
    img.alt = fileName(src);
    img.loading = imageIndex === 0 ? "eager" : "lazy";
    img.decoding = "async";
    frame.appendChild(img);
    grid.appendChild(frame);
  });

  card.append(header, grid);
  return card;
}

function mobileSetCards() {
  return Array.from(gallery.querySelectorAll(".mobile-set-card"));
}

function scrollMobileSetIntoView(setKey, behavior = "smooth") {
  const card = gallery.querySelector(`.mobile-set-card[data-set-key="${setKey}"]`);
  if (!card) return;

  gallery.scrollTo({ top: card.offsetTop, left: 0, behavior });
}

function portfolioSetCards() {
  return Array.from(gallery.querySelectorAll(".portfolio-set-card"));
}

function activePortfolioSetKey() {
  const cards = portfolioSetCards();
  if (!cards.length) return currentMobileSetKey;

  const viewportAnchor = gallery.scrollTop + Math.max(1, gallery.clientHeight) * 0.42;
  const activeCard = cards.reduce((nearest, card) => {
    const cardAnchor = card.offsetTop + card.offsetHeight * 0.5;
    const distance = Math.abs(cardAnchor - viewportAnchor);
    return !nearest || distance < nearest.distance ? { card, distance } : nearest;
  }, null)?.card;

  return activeCard?.dataset.setKey || currentMobileSetKey;
}

function stepSetInCurrentCategory(direction) {
  const setKeys = orderedSetKeys(currentCategory);
  if (!setKeys.length) return;

  const activeSetKey = activePortfolioSetKey();
  const currentIndex = Math.max(0, setKeys.indexOf(activeSetKey));
  const nextIndex = clamp(currentIndex + direction, 0, setKeys.length - 1);
  const nextSetKey = setKeys[nextIndex];
  if (!nextSetKey) return;

  currentMobileSetKey = nextSetKey;
  const card = gallery.querySelector(`.portfolio-set-card[data-set-key="${nextSetKey}"]`);
  if (card) {
    gallery.scrollTo({ top: card.offsetTop, left: 0, behavior: "smooth" });
  }
  syncMobileProgress();
}

function realSheets() {
  return Array.from(gallery.querySelectorAll(".contact-sheet:not([data-clone='true'])"));
}

function sheetScrollLeft(sheet) {
  if (!gallery || !sheet) return 0;

  const firstSheet = gallery.querySelector(".contact-sheet");
  const galleryOffset = firstSheet ? sheetScrollPosition(firstSheet) : 0;

  return Math.max(0, sheetScrollPosition(sheet) - galleryOffset);
}

function scrollToSheet(sheet, behavior = "smooth") {
  if (!gallery || !sheet) return;

  scrollGalleryTo(sheetScrollLeft(sheet), behavior);
}

function snapToCategory(category) {
  const target = document.getElementById(`sheet-${category}`);
  if (!gallery || !target) return;

  sheetSnapLock = true;
  const previousBehavior = gallery.style.scrollBehavior;
  const previousSnapType = gallery.style.scrollSnapType;

  gallery.style.scrollBehavior = "auto";
  gallery.style.scrollSnapType = "none";
  if (isMobileLayout()) {
    gallery.scrollTop = sheetScrollLeft(target);
  } else {
    gallery.scrollLeft = sheetScrollLeft(target);
  }

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
  currentMobileSetKey = orderedSetKeys(category)[0] || currentMobileSetKey;
  pendingLoopCategory = "";
  setMode("work");
  syncCategoryState();

  if (isMobileLayout()) {
    renderCurrentSet();
    return;
  }

  renderCurrentSet();
}

function enterPortfolio(category = currentCategory) {
  if (galleryData[category]) {
    currentCategory = category;
    currentMobileSetKey = orderedSetKeys(category)[0] || currentMobileSetKey;
  }

  setMode("work");
  renderCurrentSet();
  document.body.classList.remove("entry-mode");
  entryView?.setAttribute("aria-hidden", "true");
}

function showEntry() {
  closeHighResImage();
  setMode("work");
  document.body.classList.add("entry-mode");
  entryView?.setAttribute("aria-hidden", "false");
}

function syncCategoryFromScroll() {
  if (!gallery || workView.classList.contains("is-hidden") || sheetLoopLock || sheetSnapLock) return;

  if (isMobileLayout()) {
    syncMobileSetFromScroll();
    return;
  }

  const sheets = realSheets();
  if (!sheets.length) return;

  const galleryCenter = galleryScrollPosition() + galleryViewSize() / 2;
  const activeSheet = sheets.reduce((nearest, sheet) => {
    const sheetCenter = sheetScrollLeft(sheet) + sheetViewSize(sheet) / 2;
    const distance = Math.abs(sheetCenter - galleryCenter);
    return !nearest || distance < nearest.distance ? { sheet, distance } : nearest;
  }, null)?.sheet;

  const category = activeSheet?.dataset.category;
  if (isMobileLayout()) {
    const setKey = activeSheet?.dataset.setKey;
    const hasSetKey = Boolean(setKey && setKey !== currentMobileSetKey);
    if (hasSetKey) {
      currentMobileSetKey = setKey;
    }

    if (!category || category === currentCategory) {
      if (!hasSetKey) return;
    }
  } else if (!category || category === currentCategory) {
    return;
  }

  if (category && category !== currentCategory) {
    currentCategory = category;
    syncCategoryMenu();
    syncCategoryState();
  }

  hydrateContactSheet(activeSheet);
  syncContactSheetGrid();
  applyLayoutEdits();
}

function stepCategory(direction) {
  if (sheetLoopLock || sheetSnapLock) return;

  if (isMobileLayout()) {
    const category = currentCategory;
    const setKeys = orderedSetKeys(category);
    if (!setKeys.length) return;

    const currentIndex = setKeys.indexOf(currentMobileSetKey);
    const nextIndex = ((currentIndex + direction) % setKeys.length + setKeys.length) % setKeys.length;
    currentMobileSetKey = setKeys[nextIndex];
    currentCategory = category;
    pendingLoopCategory = "";
    syncCategoryMenu();
    syncCategoryState();
    scrollMobileSetIntoView(currentMobileSetKey);
    return;
  }

  const categories = orderedCategories();
  const currentIndex = categories.indexOf(currentCategory);
  const nextIndex = ((currentIndex + direction) % categories.length + categories.length) % categories.length;
  currentCategory = categories[nextIndex];
  currentMobileSetKey = orderedSetKeys(currentCategory)[0] || "";
  pendingLoopCategory = "";
  syncCategoryMenu();
  syncCategoryState();
  renderCurrentSet();
}

function syncMobileSetFromScroll() {
  if (!isMobileLayout()) return;

  const cards = mobileSetCards();
  if (!cards.length) {
    syncMobileProgress();
    return;
  }

  const galleryTop = gallery.scrollTop;
  const viewportAnchor = galleryTop + Math.max(1, gallery.clientHeight) * 0.38;
  const activeCard = cards.reduce((nearest, card) => {
    const cardAnchor = card.offsetTop + Math.min(card.offsetHeight * 0.5, 220);
    const distance = Math.abs(cardAnchor - viewportAnchor);
    return !nearest || distance < nearest.distance ? { card, distance } : nearest;
  }, null)?.card;

  const setKey = activeCard?.dataset.setKey;
  if (setKey && setKey !== currentMobileSetKey) {
    currentMobileSetKey = setKey;
  }

  syncCategoryMenu();
  syncCategoryState();
}

function stepMobileUniverse(direction) {
  if (!isMobileLayout() || sheetLoopLock || sheetSnapLock) return;

  const categories = orderedCategories();
  const currentIndex = categories.indexOf(currentCategory);
  const nextIndex = ((currentIndex + direction) % categories.length + categories.length) % categories.length;
  currentCategory = categories[nextIndex];
  currentMobileSetKey = orderedSetKeys(currentCategory)[0] || "";
  pendingLoopCategory = "";
  syncCategoryMenu();
  syncCategoryState();
  renderCurrentSet();
}

function loopSheetFromEdge(delta) {
  if (!gallery) return false;
  if (isMobileLayout()) return false;
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
  if (!gallery || sheetSnapLock || isMobileLayout()) return;

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
    const layoutChanged = syncResponsiveLayoutMode();
    if (layoutChanged) {
      renderCurrentSet();
      return;
    }
    sheetLoopLock = false;
    pendingLoopCategory = "";
    if (isMobileLayout()) {
      renderCurrentSet();
    } else {
      syncContactSheetGrid();
      snapToCategory(currentCategory);
    }
  });
}

function setMode(mode) {
  const isWork = mode === "work";
  brand.textContent = "Elie Benchimol";
  workView.classList.toggle("is-hidden", !isWork);
  syncCategoryMenu();
}

function layoutKey(category, setKey, chunkIndex, imageIndex = "") {
  return [category, setKey, chunkIndex, imageIndex].filter(Boolean).join(".");
}

function normalizeLayoutEdits(value) {
  if (!value || value.version !== LAYOUT_STORAGE_VERSION) {
    return { version: LAYOUT_STORAGE_VERSION, sets: {}, images: {} };
  }

  return {
    version: LAYOUT_STORAGE_VERSION,
    sets: value.sets || value || {},
    images: value.images || {}
  };
}

function readStoredLayoutEdits() {
  try {
    const value = JSON.parse(localStorage.getItem("elie-layout-edits") || "{}");
    return normalizeLayoutEdits(value);
  } catch {
    return { version: LAYOUT_STORAGE_VERSION, sets: {}, images: {} };
  }
}

function readLayoutEdits() {
  const stored = readStoredLayoutEdits();

  return {
    version: LAYOUT_STORAGE_VERSION,
    sets: { ...defaultLayoutEdits.sets, ...stored.sets },
    images: { ...defaultLayoutEdits.images, ...stored.images }
  };
}

function writeLayoutEdits(edits) {
  localStorage.setItem("elie-layout-edits", JSON.stringify({
    version: LAYOUT_STORAGE_VERSION,
    sets: edits.sets || {},
    images: edits.images || {}
  }));
}

function layoutSafetyScale() {
  return 1;
}

function scaledOffset(value) {
  return Math.round((value || 0) * layoutSafetyScale());
}

function scaledImageEdit(edit = {}) {
  const baseScale = Number(edit.scale || 1);

  return {
    x: Math.round(edit.x || 0),
    y: Math.round(edit.y || 0),
    scale: Math.min(12, Math.max(0.25, baseScale))
  };
}

function setContactSetOffset(set, x, y, options = {}) {
  const nextX = options.raw ? Math.round(x) : scaledOffset(x);
  const nextY = options.raw ? Math.round(y) : scaledOffset(y);
  set.dataset.editX = String(Math.round(x));
  set.dataset.editY = String(Math.round(y));
  setPixelPositionVars(set, "--edit-x", "--edit-y", nextX, nextY);
}

function setFreeContactSetPosition(set, x, y) {
  const position = setPercentPositionVars(set, "--free-x", "--free-y", x, y);
  set.dataset.freeX = String(position.x);
  set.dataset.freeY = String(position.y);
}

function setFreeContactFramePosition(frame, x, y) {
  const position = setPercentPositionVars(frame, "--free-x", "--free-y", x, y);
  frame.dataset.freeX = String(position.x);
  frame.dataset.freeY = String(position.y);
}

function setContactFrameEdit(frame, edit = {}, options = {}) {
  const rawX = Math.round(edit.x || 0);
  const rawY = Math.round(edit.y || 0);
  const rawScale = Number(edit.scale || 1);
  const applied = options.raw ? { x: rawX, y: rawY, scale: rawScale } : scaledImageEdit(edit);

  frame.dataset.editX = String(rawX);
  frame.dataset.editY = String(rawY);
  frame.dataset.scale = String(rawScale);
  setPixelPositionVars(frame, "--image-edit-x", "--image-edit-y", applied.x, applied.y);
  frame.style.setProperty("--image-scale", String(applied.scale));
}

function regulateFreeContactSheets() {
  return;
}

function scheduleFreeContactRegulation() {
  return;
}

function applyLayoutEdits() {
  const edits = readLayoutEdits();

  gallery.querySelectorAll(".contact-set").forEach((set) => {
    const edit = edits.sets[set.dataset.layoutKey];

    if (set.closest(".free-contact-sheet")) {
      const base = freeContactLayouts[set.dataset.category]?.[set.dataset.set];
      setFreeContactSetPosition(set, edit?.x ?? base?.x ?? 50, edit?.y ?? base?.y ?? 50);
      setContactSetOffset(set, 0, 0);
    } else {
      setContactSetOffset(set, edit?.x || 0, edit?.y || 0);
    }
  });

  gallery.querySelectorAll(".contact-frame").forEach((frame) => {
    const edit = edits.images[frame.dataset.layoutKey];

    if (frame.closest(".free-contact-sheet")) {
      const freeIndex = Number(frame.dataset.freeIndex || 1);
      const position = resolveFreeContactPosition(frame, edit, freeIndex);
      setFreeContactFramePosition(
        frame,
        position.x,
        position.y
      );
      setContactFrameEdit(frame, {
        x: 0,
        y: 0,
        scale: edit?.scale || 1
      });
    } else {
      setContactFrameEdit(frame, edit);
    }
  });
}

categoryItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (document.body.classList.contains("entry-mode")) {
      enterPortfolio(item.dataset.category);
      return;
    }

    setCategory(item.dataset.category);
  });
});

entryItems.forEach((item) => {
  item.addEventListener("click", () => {
    enterPortfolio(item.dataset.category);
  });
});

mobilePrevSetButton?.addEventListener("click", (event) => {
  event.preventDefault();
  if (!isMobileLayout()) return;
  stepCategory(-1);
});

mobileNextSetButton?.addEventListener("click", (event) => {
  event.preventDefault();
  if (!isMobileLayout()) return;
  stepCategory(1);
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

highResClose?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  closeHighResImage();
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

brand?.addEventListener("click", (event) => {
  event.preventDefault();
  if (!document.body.classList.contains("entry-mode")) {
    showEntry();
  }
});

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

  if (document.body.classList.contains("entry-mode")) {
    if (handledOverlayKeys.has(event.key) || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      enterPortfolio(currentCategory);
    }

    return;
  }

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

  if (workView.classList.contains("is-hidden")) {
    if (event.key === "Escape") {
      event.preventDefault();
      setMode("work");
    }

    return;
  }

  if (isMobileLayout()) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepMobileUniverse(1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepMobileUniverse(-1);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      stepSetInCurrentCategory(1);
      return;
    }

    if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      stepSetInCurrentCategory(-1);
      return;
    }

    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    stepCategory(1);
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    stepCategory(-1);
  }

  if (event.key === "ArrowDown" || event.key === "PageDown") {
    event.preventDefault();
    stepSetInCurrentCategory(1);
  }

  if (event.key === "ArrowUp" || event.key === "PageUp") {
    event.preventDefault();
    stepSetInCurrentCategory(-1);
  }
});

workView.addEventListener(
  "wheel",
  (event) => {
    if (workView.classList.contains("is-hidden")) return;
    if (Math.abs(event.deltaX) < 4 && Math.abs(event.deltaY) < 4) return;

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

    if (isMobileLayout()) {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.4) {
        event.preventDefault();
        stepMobileUniverse(delta > 0 ? 1 : -1);
      }
      return;
    }

    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.4) {
      event.preventDefault();
      stepCategory(delta > 0 ? 1 : -1);
    }
  },
  { passive: false }
);

workView.addEventListener(
  "touchstart",
  (event) => {
    if (!isMobileLayout() || workView.classList.contains("is-hidden")) return;
    const touch = event.touches[0];
    if (!touch) return;

    mobileSwipeStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  },
  { passive: true }
);

workView.addEventListener(
  "touchend",
  (event) => {
    if (!isMobileLayout() || workView.classList.contains("is-hidden") || !mobileSwipeStart) return;
    const touch = event.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - mobileSwipeStart.x;
    const dy = touch.clientY - mobileSwipeStart.y;
    const elapsed = Date.now() - mobileSwipeStart.time;
    mobileSwipeStart = null;

    if (elapsed > 800) return;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 28;

    if (Math.max(absX, absY) < threshold) return;

    if (absX >= absY * 1.25) {
      stepCategory(dx > 0 ? -1 : 1);
    }
  },
  { passive: true }
);

workView.addEventListener(
  "touchcancel",
  () => {
    mobileSwipeStart = null;
  },
  { passive: true }
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
window.addEventListener("orientationchange", handleResize);
window.visualViewport?.addEventListener("resize", handleResize);

syncResponsiveLayoutMode();
renderCurrentSet();
setMode("work");
