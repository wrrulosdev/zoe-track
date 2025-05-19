import { AppState } from "../constants/states";

/**
 * Updates the app's status display based on the given state.
 *
 * @param state - Object containing the status text and colors.
 */
export function changeStatus(state: AppState): void {
  const statusText = document.getElementById("status-description");
  const appStatusText = document.getElementById("app-status-text");

  if (statusText && appStatusText) {
    appStatusText.textContent = state.span;
    appStatusText.style.color = state.bgColor;
    appStatusText.style.backgroundColor = state.textColor;
    statusText.textContent = state.description;
  } else {
    console.warn("Status elements not found in the DOM.");
  }
}

/**
 * Changes the color of the power button based on the status.
 *
 * @param status - `true` for green (active), `false` for red (inactive).
 */
export function changePowerButtonColor(status: boolean): void {
  const powerButton = document.getElementById("powerButton");

  if (powerButton instanceof SVGElement) {
    const powerButtonColor = status ? "green" : "#ff4d4d";
    powerButton.style.fill = powerButtonColor;
  } else {
    console.warn("Power button not found or is not an SVGElement.");
  }
}
