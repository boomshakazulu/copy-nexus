const BLOCKED_TAGS = new Set([
  "script",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "base",
]);

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

const isSafeUrl = (value, { allowDataImage = false } = {}) => {
  if (!value) return false;
  if (value.startsWith("#") || value.startsWith("/")) return true;
  if (allowDataImage && /^data:image\//i.test(value)) return true;
  try {
    const url = new URL(value, "https://example.com");
    return ALLOWED_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
};

const unwrap = (node) => {
  const parent = node.parentNode;
  if (!parent) return;
  while (node.firstChild) {
    parent.insertBefore(node.firstChild, node);
  }
  parent.removeChild(node);
};

const sanitizeElement = (el) => {
  const tag = el.tagName.toLowerCase();
  if (BLOCKED_TAGS.has(tag)) {
    el.parentNode?.removeChild(el);
    return;
  }

  [...el.attributes].forEach((attr) => {
    const name = attr.name.toLowerCase();
    if (name.startsWith("on")) {
      el.removeAttribute(attr.name);
      return;
    }

    if (tag === "a" && name === "href") {
      if (!isSafeUrl(attr.value)) {
        el.removeAttribute("href");
      }
      return;
    }

    if ((tag === "img" || tag === "source") && name === "src") {
      if (!isSafeUrl(attr.value, { allowDataImage: true })) {
        el.removeAttribute("src");
      }
      return;
    }

    if (tag === "img" && name === "srcset") {
      // leave as-is; browsers will ignore invalid entries
      return;
    }

    if (tag === "a" && (name === "target" || name === "rel")) {
      return;
    }
  });

  if (tag === "a") {
    const target = el.getAttribute("target");
    if (target) {
      el.setAttribute("rel", "noopener noreferrer");
    }
  }
};

const walkAndSanitize = (root) => {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    null
  );
  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }
  nodes.forEach((node) => sanitizeElement(node));
};

export const sanitizeHtml = (input = "") => {
  if (!input || typeof input !== "string") return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${input}</div>`, "text/html");
  const container = doc.body;
  walkAndSanitize(container);
  return container.innerHTML;
};
