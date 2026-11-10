import { cx } from "../../cx";
import styles from "./FactGrid.module.css";

export type Fact = { label: string; value: string; note?: string };

export type FactGridProps = {
  facts: Fact[];
  /** Two tiles per row (default) or one label/value row each. */
  variant?: "tiles" | "rows";
  className?: string;
};

/** Key facts as label/value pairs: rent, move-in, studies… */
export function FactGrid({
  facts,
  variant = "tiles",
  className,
}: FactGridProps) {
  return (
    <dl className={cx(styles.grid, styles[variant], className)}>
      {facts.map((f) => (
        <div key={f.label} className={styles.fact}>
          <dt>{f.label}</dt>
          <dd>
            {f.value}
            {f.note && <small>{f.note}</small>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
