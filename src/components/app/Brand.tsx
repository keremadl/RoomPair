import s from "./AppShell.module.css";

/** RoomPair wordmark: two arches (two rooms, side by side) and the name. */
export function Brand() {
  return (
    <span className={s.brand}>
      <svg viewBox="0 0 44 44" aria-hidden="true" className={s.brandMark}>
        <path
          d="M4 34V17a11 11 0 0 1 22 0v17h-8V17a3 3 0 0 0-6 0v17Z"
          fill="currentColor"
        />
        <path
          d="M20 34V17a11 11 0 0 1 22 0v17h-8V17a3 3 0 0 0-6 0v17Z"
          className={s.brandArch}
        />
      </svg>
      <span className={s.brandName}>roompair</span>
    </span>
  );
}
