interface AppSectionProps {
  title: string;
  description: string;
  showSwitch?: boolean;
  enabled?: boolean;
}

/**
 * Renders a section of the app with a title, description,
 * and either a status label or a toggle switch.
 *
 * @param {string} title - Title of the section
 * @param {string} description - Description text shown below the title
 * @param {boolean} showSwitch - Whether to show a toggle switch instead of a status label
 * @param {boolean} enabled - Whether the switch is enabled or the status shows "Active"
 */
function AppSection({
  title,
  description,
  showSwitch = false,
  enabled = false,
}: AppSectionProps) {
  return (
    <article className="app-section">
      <div className="text">
        <h2>{title}</h2>
        <p id="status-description">{description}</p>
      </div>

      {showSwitch ? (
        <label className="switch">
          <input
            type="checkbox"
            id="autoAcceptSwitch"
            defaultChecked={enabled}
          />
          <span className="slider"></span>
        </label>
      ) : (
        <span id="app-status-text" className="app-status">
          {enabled ? "Active" : "Inactive"}
        </span>
      )}
    </article>
  );
}

export default AppSection;
