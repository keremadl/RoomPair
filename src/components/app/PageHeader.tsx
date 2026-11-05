import type { ReactNode } from "react";
import { Eyebrow, Heading, Text } from "@/design-system";
import v from "./views/views.module.css";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className={v.pageHeader}>
      <div className={v.pageHeaderText}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Heading level={1} size="3xl">
          {title}
        </Heading>
        {description && (
          <Text tone="muted" size="lg">
            {description}
          </Text>
        )}
      </div>
      {actions && <div className={v.pageHeaderActions}>{actions}</div>}
    </header>
  );
}
