const APP_VERSION = "1.4.0";

(function applyAppVersion() {
  const label = `v${APP_VERSION}`;
  document.querySelectorAll("[data-app-version]").forEach((el) => {
    el.textContent = label;
    el.title = `Phiên bản ${APP_VERSION}`;
  });
})();
