/**
 * PowerIcon component.
 *
 * @param {string} [className] - Custom id to apply
 * @param {string} [className] - Additional CSS classes to apply
 */
interface PowerIconProps {
  id?: string;
  className?: string;
}

function PowerIcon({ className = "", id = "" }: PowerIconProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      id={`${id}`}
      className={`icon ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M228.576 26.213v207.32h54.848V26.214h-54.848zm-28.518 45.744C108.44 96.58 41 180.215 41 279.605c0 118.74 96.258 215 215 215 118.74 0 215-96.26 215-215 0-99.39-67.44-183.025-159.057-207.647v50.47c64.6 22.994 110.85 84.684 110.85 157.177 0 92.117-74.676 166.794-166.793 166.794-92.118 0-166.794-74.678-166.794-166.795 0-72.494 46.25-134.183 110.852-157.178v-50.47z"></path>
      </g>
    </svg>
  );
}

export default PowerIcon;
