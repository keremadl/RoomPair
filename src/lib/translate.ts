/**
 * A translate function: English text is the key, `{name}` placeholders are
 * filled from `vars`. Pure code (matching, the content model) takes one as an
 * optional argument; `english` is the default, so tests and demos stay
 * English, and the app passes its real `t`.
 */
export type Translate = (
  text: string,
  vars?: Record<string, string | number>,
) => string;

export const english: Translate = (text, vars) =>
  vars
    ? text.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (_, k) =>
        String(vars[k] ?? `{${k}}`),
      )
    : text;
