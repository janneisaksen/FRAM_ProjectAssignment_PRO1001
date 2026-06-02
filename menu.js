(() => {
  const body = document.body;
  const menu = document.querySelector("[data-site-menu]");
  const openButtons = document.querySelectorAll("[data-menu-open]");

  if (!menu || openButtons.length === 0) {
    return;
  }

  const closeButtons = menu.querySelectorAll("[data-menu-close]");
  const menuLinks = menu.querySelectorAll("a");

  const setExpanded = (isOpen) => {
    openButtons.forEach((button) => {
      button.setAttribute("aria-expanded", String(isOpen));
    });
    menu.setAttribute("aria-hidden", String(!isOpen));
  };

  const openMenu = () => {
    body.classList.add("menu-open");
    setExpanded(true);
  };

  const closeMenu = () => {
    body.classList.remove("menu-open");
    setExpanded(false);
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", openMenu);
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeMenu);
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("menu-open")) {
      closeMenu();
    }
  });

  setExpanded(false);
})();
