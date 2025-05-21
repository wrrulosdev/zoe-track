interface AppSectionProps {
  title: string;
  description: string;
  showSwitch?: boolean;
  enabled?: boolean;
  showPorofessorButton?: boolean;
  onPorofessorClick?: () => void;
}

/**
 * Renders a section of the app with a title, description,
 * and either a status label, toggle switch, or a button.
 *
 * @param {string} title - Title of the section
 * @param {string} description - Description text shown below the title
 * @param {boolean} showSwitch - Whether to show a toggle switch instead of a status label or porofessor button
 * @param {boolean} showPorofessorButton - Whether to show a porofessor button instead of a status label or switch
 * @param {boolean} enabled - Whether the switch is enabled or the status shows "Active"
 */
function AppSection({
  title,
  description,
  showSwitch = false,
  enabled = false,
  showPorofessorButton = false,
  onPorofessorClick,
}: AppSectionProps) {
  return (
    <article className="app-section">
      <div className="text">
        <h2>{title}</h2>
        <p id="status-description">{description}</p>
      </div>

      {showPorofessorButton ? (
        <button
          id="porofessorButton"
          className="porofessor-button"
          onClick={onPorofessorClick}
        >
          Open Porofessor
        </button>
      ) : showSwitch ? (
        <label className="switch">
          <input type="checkbox" id="autoAcceptSwitch" defaultChecked={false} />
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
