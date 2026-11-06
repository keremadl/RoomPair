import { Check } from "../../icons";
import { cx } from "../../cx";
import styles from "./ScoreBars.module.css";

export type ScoreItem = { label: string; score: number; detail?: string };

/** One bar per scored factor, 0–100. */
export function ScoreBars({
  items,
  className,
}: {
  items: ScoreItem[];
  className?: string;
}) {
  return (
    <table className={cx(styles.table, className)}>
      <tbody>
        {items.map((b) => (
          <tr key={b.label}>
            <th scope="row">
              {b.label}
              {b.detail && <small>{b.detail}</small>}
            </th>
            <td>
              <span
                className={styles.bar}
                role="img"
                aria-label={`${b.score} out of 100`}
              >
                <span style={{ width: `${b.score}%` }} />
              </span>
            </td>
            <td>{b.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** What lines up (checked) and what to talk about (highlighted). */
export function ReasonList({
  reasons,
  discuss = [],
  className,
}: {
  reasons: string[];
  discuss?: string[];
  className?: string;
}) {
  return (
    <div className={cx(styles.reasons, className)}>
      <ul>
        {reasons.map((r) => (
          <li key={r}>
            <Check aria-hidden="true" /> {r}
          </li>
        ))}
      </ul>
      {discuss.length > 0 && (
        <div className={styles.discuss}>
          <strong>Worth talking about</strong>
          <ul>
            {discuss.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
