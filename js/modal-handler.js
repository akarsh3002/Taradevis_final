const DEFAULT_APPEAR_DELAY = 4; // Default delay in seconds

const FOCUSABLE = `
  button:not([disabled]):not([aria-hidden="true"]),
  [href]:not([disabled]):not([aria-hidden="true"]),
  input:not([disabled]):not([aria-hidden="true"]),
  select:not([disabled]):not([aria-hidden="true"]),
  textarea:not([disabled]):not([aria-hidden="true"]),
  [tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-hidden="true"])
`;

// Internal helper
const handleKeyPress = (modal, focus = "trap") => {
  const focusableElements = modal.querySelectorAll(FOCUSABLE);
  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  first.focus(); // Initial focus

  modal.onkeydown = e => {
    if (focus === "trap" && e.key === "Tab") {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
};

function modalHandler(modal, onOpen, onClose) {
  if (!modal || typeof onOpen !== "function" || typeof onClose !== "function") {
    console.error("modalHandler requires a modal element and two callbacks");
    return;
  }

  // One-time session check
  if (sessionStorage.getItem("first_visit") !== null) return;

  const dataAppearDelay =
    modal.getAttribute("data-appear-delay") || DEFAULT_APPEAR_DELAY;
  const appearDelay = isNaN(Number(dataAppearDelay))
    ? DEFAULT_APPEAR_DELAY
    : dataAppearDelay;

  const showModal = () => {
    onOpen(modal);
    handleKeyPress(modal);

    // Mark as shown
    sessionStorage.setItem("first_visit", "done");
  };

  // OPEN
  if (appearDelay <= 0) showModal();
  else setTimeout(showModal, appearDelay * 1000);

  // Setup close events
  const closeBtn = modal.querySelector(".modal-close");
  if (closeBtn) {
    closeBtn.onclick = () => onClose(modal);
  }
}

onload = () => {
  const modal = document.getElementById("welcome-modal");
  if (!modal) return;

  modalHandler(
    modal,
    el => {
      el.classList.add("visible");
      el.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden"; // Prevent body scroll
    },
    el => {
      el.classList.remove("visible");
      document.activeElement?.blur();
      el.setAttribute("aria-hidden", "true");
      document.body.style.overflow = ""; // Reset body scroll
    }
  );
};

/************** Dropdown Menu **************/

const openDropdown = (trigger, itemList, focusFirstOnOpen = true) => {
  if (!trigger || !itemList.length) return;

  trigger.setAttribute("aria-expanded", "true");

  itemList.forEach(item => item.setAttribute("tabindex", "0"));

  if (focusFirstOnOpen) itemList[0].focus();
};

const closeDropdown = (trigger, itemList, focusTriggerOnClose = false) => {
  if (!trigger) return;

  if (trigger.getAttribute("aria-expanded") === "false") return;

  trigger.setAttribute("aria-expanded", "false");

  itemList.forEach(item => item.setAttribute("tabindex", "-1"));

  if (focusTriggerOnClose) trigger.focus();
};

const dropdowns = document.querySelectorAll(".dropdown");
dropdowns.forEach(dn => {
  const trigger = dn.querySelector('[data-dropdown-item="trigger"]');
  const content = dn.querySelector('[data-dropdown-item="content"]');
  const items = content.querySelectorAll("li");

  if (!trigger || !content || !items.length) return;

  let isHovered = false;
  let hoverTimeout;

  const handleEnter = () => {
    clearTimeout(hoverTimeout);
    isHovered = true;
    openDropdown(trigger, items, false);
  };

  const handleLeave = () => {
    isHovered = false;
    hoverTimeout = setTimeout(() => {
      if (!isHovered) {
        closeDropdown(trigger, items, false);
      }
    }, 100); // slight delay to prevent flickering
  };

  // Handle hover events
  trigger.addEventListener("mouseenter", handleEnter);
  trigger.addEventListener("mouseleave", handleLeave);

  content.addEventListener("mouseenter", () => {
    clearTimeout(hoverTimeout);
    isHovered = true;
  });
  content.addEventListener("mouseleave", handleLeave);

  // Optional: Keyboard nav inside dropdown content
  content.onkeydown = e => {
    const focusedIndex = [...items].findIndex(
      item => item === document.activeElement
    );

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (focusedIndex + 1) % items.length;
      items[next].focus();
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (focusedIndex - 1 + items.length) % items.length;
      items[prev].focus();
    }

    if (e.key === "Escape") {
      closeDropdown(trigger, items);
    }

    if (e.key === "Tab") {
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
});

// ESC closes all dropdowns globally
document.onkeydown = e => {
  if (e.key === "Escape") {
    dropdowns.forEach(dn => {
      const trigger = dn.querySelector('[data-dropdown-item="trigger"]');
      const items = dn.querySelectorAll('[data-dropdown-item="content"] li');
      closeDropdown(trigger, items);
    });
  }
};
