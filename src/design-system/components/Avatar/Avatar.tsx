import { cx } from "../../cx";
import styles from "./Avatar.module.css";

export type AvatarProps = {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className={cx(styles.avatar, styles[size], className)}>
      {src ? (
        <img src={src} alt={name} />
      ) : (
        <span aria-label={name}>{initials}</span>
      )}
    </span>
  );
}

export function AvatarGroup({ children }: { children: React.ReactNode }) {
  return <span className={styles.group}>{children}</span>;
}
