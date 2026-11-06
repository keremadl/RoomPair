/**
 * RoomPair · Card icons. Same names as the lucide icons they replace:
 *   import { Heart, MapPin } from "@/design-system/icons";
 * or, from the design-system root (namespaced, so Text / Circle don't clash
 * with the Typography components):
 *   import { Icons } from "@/design-system";  <Icons.Heart />
 */
import * as all from "./icons";

export * from "./icons";
export {
  Icon,
  createIcon,
  type IconProps,
  type IconComponent,
} from "./Icon";

/** Every icon by name, in alphabetical order (for the showcase and docs). */
export const iconList = Object.entries(all)
  .filter(([, c]) => typeof c === "function")
  .sort(([a], [b]) => a.localeCompare(b));
