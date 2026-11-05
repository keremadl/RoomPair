import { Check, Minus } from "lucide-react";
import { cx } from "../../cx";
import styles from "./CompareTable.module.css";

export type CompareRow = {
  label: string;
  them: string;
  you: string;
  same: boolean;
};

export type CompareTableProps = {
  rows: CompareRow[];
  /** Column title for the other person. */
  name: string;
  className?: string;
};

/** Everyday habits side by side: theirs, yours, and whether they work together. */
export function CompareTable({ rows, name, className }: CompareTableProps) {
  return (
    <table className={cx(styles.table, className)}>
      <thead>
        <tr>
          <th scope="col">Habit</th>
          <th scope="col">{name}</th>
          <th scope="col">You</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <th scope="row">{r.label}</th>
            <td>{r.them}</td>
            <td>
              <span className={styles.mark} data-ok={r.same}>
                {r.same ? (
                  <Check aria-label="works with you" />
                ) : (
                  <Minus aria-label="differs" />
                )}
              </span>
              {r.you}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
