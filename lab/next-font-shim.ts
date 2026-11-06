/**
 * Stand-in for next/font/google in the lab build (no Next.js there).
 * The lab page loads the same faces from Google Fonts and this class
 * points the CSS variable at them.
 */
type Font = { variable: string; className: string };
const font = (variable: string): Font => ({ variable, className: variable });
export const Rubik = (): Font => font("lab-font-rubik");
