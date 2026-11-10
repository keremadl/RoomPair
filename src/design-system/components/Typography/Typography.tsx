import type { ComponentProps, ElementType, HTMLAttributes } from "react";
import { cx } from "../../cx";
import styles from "./Typography.module.css";

type HeadingLevel = 1 | 2 | 3 | 4;
type HeadingSize = "4xl" | "3xl" | "2xl" | "xl" | "lg";

const defaultSize: Record<HeadingLevel, HeadingSize> = {
  1: "3xl",
  2: "2xl",
  3: "xl",
  4: "lg",
};

export type HeadingProps = ComponentProps<"h2"> & {
  /** Semantic level (h1–h4). Visual size is independent — set `size`. */
  level?: HeadingLevel;
  size?: HeadingSize;
};

export function Heading({ level = 2, size, className, ...rest }: HeadingProps) {
  const Tag = `h${level}` as ElementType;
  return (
    <Tag
      className={cx(
        styles.heading,
        styles[`h-${size ?? defaultSize[level]}`],
        className,
      )}
      {...rest}
    />
  );
}

export type TextProps = HTMLAttributes<HTMLElement> & {
  as?: "p" | "span" | "div" | "label";
  size?: "xs" | "sm" | "md" | "lg";
  tone?:
    | "default"
    | "muted"
    | "subtle"
    | "primary"
    | "accent"
    | "danger"
    | "inverse";
  weight?: "regular" | "medium" | "semibold";
};

export function Text({
  as = "p",
  size = "md",
  tone = "default",
  weight = "regular",
  className,
  ...rest
}: TextProps) {
  // All allowed tags accept generic HTML attributes; narrow for JSX typing.
  const Tag = as as "p";
  return (
    <Tag
      className={cx(
        styles.text,
        styles[`t-${size}`],
        styles[`tone-${tone}`],
        styles[`w-${weight}`],
        className,
      )}
      {...rest}
    />
  );
}

/** A link inside running text. Inherits the size of the text around it. */
export function TextLink({ className, ...rest }: ComponentProps<"a">) {
  return <a className={cx(styles.link, className)} {...rest} />;
}

/** Small uppercase label above a heading. */
export function Eyebrow({ className, ...rest }: ComponentProps<"p">) {
  return <p className={cx(styles.eyebrow, className)} {...rest} />;
}
