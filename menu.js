(() => {
  const body = document.body;
  const menu = document.querySelector("[data-site-menu]");
  const menuPanel = menu?.querySelector("[data-menu-panel]");
  const openButtons = document.querySelectorAll("[data-menu-open]");
  let lastTrigger = null;

  if (!menu || !menuPanel || openButtons.length === 0) {
    return;
  }

  const closeButtons = menu.querySelectorAll("[data-menu-close]");
  const menuLinks = menu.querySelectorAll("a");
  const getFocusable = () =>
    Array.from(
      menuPanel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );

  const setExpanded = (isOpen) => {
    openButtons.forEach((button) => {
      button.setAttribute("aria-expanded", String(isOpen));
    });
    menu.setAttribute("aria-hidden", String(!isOpen));

    if (isOpen) {
      menu.removeAttribute("inert");
    } else {
      menu.setAttribute("inert", "");
    }
  };

  const openMenu = (trigger = null) => {
    lastTrigger = trigger;
    body.classList.add("menu-open");
    setExpanded(true);

    const focusable = getFocusable();
    const firstFocusable = focusable[0];

    if (firstFocusable) {
      firstFocusable.focus();
    }
  };

  const closeMenu = () => {
    body.classList.remove("menu-open");
    setExpanded(false);

    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus();
    }
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => openMenu(button));
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeMenu);
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (!body.classList.contains("menu-open")) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key === "Tab") {
      const focusable = getFocusable();

      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  setExpanded(false);
})();
