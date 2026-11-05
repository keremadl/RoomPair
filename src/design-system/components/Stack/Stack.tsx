import type { CSSProperties, ComponentProps } from "react";
import { cx } from "../../cx";
import styles from "./Stack.module.css";

type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

export type StackProps = ComponentProps<"div"> & {
  direction?: "row" | "column";
  gap?: Space;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: boolean;
};

/** Flex layout with gaps from the spacing scale. Replaces one-off margin hacks. */
export function Stack({
  direction = "column",
  gap = 4,
  align,
  justify,
  wrap = false,
  className,
  style,
  ...rest
}: StackProps) {
  return (
    <div
      className={cx(styles.stack, className)}
      style={{
        flexDirection: direction,
        gap: `var(--space-${gap})`,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : undefined,
        ...style,
      }}
      {...rest}
    />
  );
}
