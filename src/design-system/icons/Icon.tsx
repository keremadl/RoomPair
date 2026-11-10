import type { ReactNode, SVGProps } from "react";
import { cx } from "../cx";
import s from "./Icon.module.css";

/**
 * Props of every RoomPair icon. Same surface as lucide-react, so a swap is
 * a find-and-replace on the import:
 *   size         width and height (default 24); CSS rules on `svg` win
 *   strokeWidth  overrides the theme's --icon-stroke for this icon
 *   color        sets currentColor (a plain SVG attribute)
 */
export type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  size?: number | string;
  strokeWidth?: number | string;
  /** Accepted for lucide compatibility; strokes always scale with the icon. */
  absoluteStrokeWidth?: boolean;
};

export type IconComponent = ((props: IconProps) => ReactNode) & {
  displayName: string;
};

/**
 * Base SVG: 24×24 grid, stroke = currentColor, round caps and joins.
 * Stroke width comes from --icon-stroke (tokens.css, tuned per language), so
 * the whole set gets heavier or lighter from one token.
 * Decorative by default (aria-hidden); give it aria-label to make it an image.
 */
export function Icon({
  size = 24,
  strokeWidth,
  absoluteStrokeWidth: _absolute,
  className,
  style,
  children,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
  ...rest
}: IconProps & { children: ReactNode }) {
  const labelled = ariaLabel !== undefined && ariaLabel !== "";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      role={labelled ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden ?? (labelled ? undefined : true)}
      className={cx(s.icon, className)}
      // An explicit strokeWidth beats the token (inline style beats the class).
      style={strokeWidth !== undefined ? { strokeWidth, ...style } : style}
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Defines one icon from its drawing. Used only by icons.tsx. */
export function createIcon(name: string, drawing: ReactNode): IconComponent {
  const Component = (props: IconProps) => (
    <Icon data-icon={name} {...props}>
      {drawing}
    </Icon>
  );
  Component.displayName = name;
  return Component;
}
