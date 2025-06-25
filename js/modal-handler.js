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
const handleKeyPress = (modal, onClose, focus = "trap") => {
  const focusableElements = modal.querySelectorAll(FOCUSABLE);
  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  first.focus(); // Initial focus

  modal.onkeydown = e => {
    if (e.key === "Escape") onClose(modal);

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
    handleKeyPress(modal, onClose);

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

  modal.onclick = e => {
    if (e.target === modal) onClose(modal);
  };
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
