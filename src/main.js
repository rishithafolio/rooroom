const room = document.querySelector("#room");
const modeButtons = [...document.querySelectorAll("[data-select-mode]")];
const assetImages = [...document.querySelectorAll(".asset")];
const climateLights = {
  ac: document.querySelector(".cool-breeze"),
  heater: document.querySelector(".warm-heat"),
};
const scriptUrl = document.currentScript && document.currentScript.src;

async function prepareAssets() {
  if (!scriptUrl) throw new Error("Unable to resolve the room illustration directory.");

  for (const element of assetImages) {
    const source = new URL(`../media/processed/${element.dataset.asset}`, scriptUrl);
    element.src = source.href;
  }
}

function setMode(mode) {
  if (!["ac", "heater", "on", "off"].includes(mode)) {
    throw new Error(`Unknown room mode: ${mode}`);
  }

  if (mode === "on" && room.dataset.mode !== "off") return;

  if ((mode === "ac" || mode === "heater") && room.dataset.mode !== mode) {
    const light = climateLights[mode];
    light.classList.remove("is-animating");
    void light.offsetWidth;
    light.classList.add("is-animating");
  }

  room.dataset.mode = mode;
  const focusedButton = document.activeElement;
  for (const button of modeButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.selectMode === mode));
    button.hidden = mode === "off"
      ? button.dataset.selectMode !== "on"
      : button.dataset.selectMode === "on";
  }
  if (modeButtons.includes(focusedButton) && focusedButton.hidden) {
    modeButtons.find((button) => !button.hidden).focus();
  }
}

for (const [mode, light] of Object.entries(climateLights)) {
  light.addEventListener("transitionend", (event) => {
    if (event.target === light && event.propertyName === "opacity" && room.dataset.mode !== mode) {
      light.classList.remove("is-animating");
    }
  });
}

for (const button of modeButtons) {
  button.addEventListener("click", () => setMode(button.dataset.selectMode));
}

prepareAssets().catch((error) => {
  console.error(error);
  const message = room.querySelector(".asset-error");
  message.textContent = "A room illustration could not be loaded.";
  message.hidden = false;
});
