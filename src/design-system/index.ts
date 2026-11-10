/**
 * RoomPair design system — import everything UI from here:
 *   import { Button, Card, Heading } from "@/design-system";
 */
export { cx } from "./cx";
export {
  Button,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from "./components/Button/Button";
export {
  IconButton,
  type IconButtonProps,
} from "./components/IconButton/IconButton";
export {
  Badge,
  type BadgeProps,
  type BadgeTone,
} from "./components/Badge/Badge";
export { Chip, type ChipProps } from "./components/Chip/Chip";
export {
  Avatar,
  AvatarGroup,
  type AvatarProps,
} from "./components/Avatar/Avatar";
export { Card, type CardProps } from "./components/Card/Card";
export {
  Input,
  Textarea,
  Select,
  type InputProps,
  type TextareaProps,
  type SelectProps,
} from "./components/Field/Field";
export {
  SegmentedControl,
  type SegmentedControlProps,
  type SegmentedOption,
} from "./components/SegmentedControl/SegmentedControl";
export {
  Heading,
  Text,
  Eyebrow,
  TextLink,
  type HeadingProps,
  type TextProps,
} from "./components/Typography/Typography";
export { Stack, type StackProps } from "./components/Stack/Stack";

/* Profile detail building blocks (shared by every design language) */
export { Tabs, type TabsProps, type TabItem } from "./components/Tabs/Tabs";
export {
  SectionHeader,
  type SectionHeaderProps,
} from "./components/SectionHeader/SectionHeader";
export {
  FactGrid,
  type FactGridProps,
  type Fact,
} from "./components/FactGrid/FactGrid";
export {
  CompareTable,
  type CompareTableProps,
  type CompareRow,
} from "./components/CompareTable/CompareTable";
export {
  ScoreBars,
  ReasonList,
  type ScoreItem,
} from "./components/ScoreBars/ScoreBars";
export {
  ProfileDetails,
  type ProfileDetailsProps,
  type DetailsLayout,
  type DetailsClasses,
  type GroupId,
} from "./components/ProfileDetails/ProfileDetails";
export { SwipeHero, type Decision } from "./components/SwipeCard/SwipeCard";

/* Motion: page push/pop and tab fades, list stagger, block reveal */
export {
  PageTransition,
  Stagger,
  Reveal,
  motionTokens,
  type PageMotion,
  type PageTransitionProps,
  type StaggerProps,
} from "./components/Motion/Motion";

/* App building blocks */
export { Dialog, type DialogProps } from "./components/Dialog/Dialog";
export { Switch, type SwitchProps } from "./components/Switch/Switch";
export { Slider, type SliderProps } from "./components/Slider/Slider";
export {
  EmptyState,
  type EmptyStateProps,
} from "./components/EmptyState/EmptyState";
export { VisuallyHidden } from "./components/VisuallyHidden/VisuallyHidden";
export { ListRow, ListGroup } from "./components/ListRow/ListRow";
export { TopBar } from "./components/TopBar/TopBar";
export { Progress } from "./components/Progress/Progress";
export {
  ChoiceCards,
  type ChoiceCardOption,
} from "./components/ChoiceCards/ChoiceCards";
export { Toast } from "./components/Toast/Toast";
export { TextProvider, useText, type Translate } from "./text/TextProvider";

/* Icons (Card set). Namespaced so Icons.Text / Icons.Circle don't clash with
 * Typography; for lucide-style named imports use "@/design-system/icons". */
export * as Icons from "./icons";
export type { IconProps, IconComponent } from "./icons";
