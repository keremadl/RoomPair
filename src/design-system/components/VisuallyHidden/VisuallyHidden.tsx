import type { ElementType, ReactNode } from "react";
import s from "./VisuallyHidden.module.css";

/**
 * Text for screen readers only, e.g. a page's h1 when the page shows no
 * visible title.
 */
export function VisuallyHidden({
  as: Tag = "span",
  children,
  id,
}: {
  as?: ElementType;
  children: ReactNode;
  id?: string;
}) {
  return (
    <Tag className={s.hidden} id={id}>
      {children}
    </Tag>
  );
}
