"use client";
import {
  Children,
  cloneElement,
  isValidElement,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../../cx";
import s from "./Motion.module.css";

/**
 * How a page arrives:
 * - push: a sub-page opens (slides in from the right);
 * - pop: back to the page underneath (slides in from the left);
 * - fade: a tab change or a tab panel (a short fade).
 */
export type PageMotion = "push" | "pop" | "fade";

const read = (el: Element, name: string) =>
  getComputedStyle(el).getPropertyValue(name).trim();
const toMs = (value: string) => {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  return value.endsWith("ms") ? n : value.endsWith("s") ? n * 1000 : n;
};

export type PageTransitionProps = HTMLAttributes<HTMLDivElement> & {
  /** Change it to play the transition (e.g. the view or sub-page name). */
  transitionKey: string;
  motion?: PageMotion;
};

/**
 * Plays an enter transition whenever `transitionKey` changes, without remounting the
 * children, so their state survives. Not on first render. Durations and
 * easing come from tokens (--duration-page, --ease-page, --duration-base,
 * --motion-distance-page); under reduced motion they are 0 and nothing
 * moves. It moves with a relative offset rather than a transform, so fixed
 * children (a chat composer) and sticky ones keep their place, and
 * `overflow-x: clip` on the app keeps the page from widening.
 * Pass role/id/aria-* to use it as a tab panel.
 */
export function PageTransition({
  transitionKey,
  motion = "fade",
  className,
  children,
  ...rest
}: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const kind = useRef(motion);
  useLayoutEffect(() => {
    kind.current = motion;
  });
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = ref.current;
    if (!el || typeof el.animate !== "function") return;
    const fade = kind.current === "fade";
    const duration = toMs(
      read(el, fade ? "--duration-base" : "--duration-page"),
    );
    if (!duration) return;
    const easing =
      read(el, fade ? "--ease-standard" : "--ease-page") || "ease-out";
    const distance = read(el, "--motion-distance-page") || "1.5rem";
    const from =
      kind.current === "push"
        ? distance
        : kind.current === "pop"
          ? `calc(${distance} * -1)`
          : "0px";
    const animation = el.animate(
      [
        { opacity: 0, left: from },
        { opacity: 1, left: "0px" },
      ],
      { duration, easing, fill: "backwards" },
    );
    return () => animation.cancel();
  }, [transitionKey]);
  return (
    <div ref={ref} className={cx(s.page, className)} {...rest}>
      {children}
    </div>
  );
}

type StaggerTag = "ul" | "ol" | "div";

export type StaggerProps = HTMLAttributes<HTMLElement> & {
  as?: StaggerTag;
  children: ReactNode;
};

/**
 * A list whose items rise in one after another when they mount
 * (--stagger-step apart, capped at --stagger-max). Use it for grids of
 * tiles and lists of rows; give each child a stable key so re-renders
 * don't replay it.
 */
export function Stagger({
  as: Tag = "ul",
  className,
  children,
  ...rest
}: StaggerProps) {
  let index = 0;
  return (
    <Tag className={cx(s.stagger, className)} {...rest}>
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        const el = child as ReactElement<{ style?: CSSProperties }>;
        return cloneElement(el, {
          style: {
            ...el.props.style,
            "--stagger-index": index++,
          } as CSSProperties,
        });
      })}
    </Tag>
  );
}

/** Rises a block in whenever `id` changes (e.g. a new profile's details). */
export function Reveal({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id: string;
}) {
  return (
    <div key={id} className={cx(s.rise, className)}>
      {children}
    </div>
  );
}

const bezier = (
  value: string,
): [number, number, number, number] | undefined => {
  const m = /cubic-bezier\(([^)]+)\)/.exec(value);
  const n = m?.[1].split(",").map(Number);
  return n && n.length === 4 && n.every(Number.isFinite)
    ? (n as [number, number, number, number])
    : undefined;
};

/**
 * Motion tokens as numbers for motion/react (Dialog, Toast): durations in
 * seconds and easing curves, read from the active language's element so a
 * theme's --ease-page applies. 0 under reduced motion, like the CSS side.
 */
export function motionTokens() {
  const el =
    typeof document === "undefined"
      ? null
      : (document.querySelector("[data-direction]") ??
        document.documentElement);
  const get = (name: string) => (el ? read(el, name) : "");
  return {
    base: toMs(get("--duration-base") || "200ms") / 1000,
    page: toMs(get("--duration-page") || "260ms") / 1000,
    ease: bezier(get("--ease-standard")) ?? [0.2, 0, 0, 1],
    easePage: bezier(get("--ease-page")) ?? [0.2, 0, 0, 1],
    easeExit: bezier(get("--ease-exit")) ?? [0.3, 0, 1, 1],
    rise: get("--motion-distance-rise") || "0.5rem",
  };
}
