/**
 * Shared helpers for the i18n scripts: paths, catalogs, placeholders and the
 * static analysis that finds every string reaching `t()`.
 *
 * Uses the TypeScript compiler API (already a devDependency) to read the
 * source, so JSX text, regexes and comments never confuse it.
 */
import {
  existsSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const SRC = join(ROOT, "src");
export const EN_PATH = join(ROOT, "src/lib/locales/en.json");
export const TR_PATH = join(ROOT, "src/lib/locales/tr.json");

const ts = createRequire(join(ROOT, "package.json"))("typescript");

/* ── Catalogs ── */

export const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

/** 2-space JSON with a trailing newline, written atomically. */
export function writeJson(path, value) {
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(tmp, path);
}

/** Same rule as `placeholders()` in src/lib/i18n.tsx. */
export function placeholders(value) {
  return [...value.matchAll(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g)]
    .map((m) => m[1])
    .sort()
    .join("|");
}

/* ── Source files ── */

const rel = (abs) => relative(ROOT, abs).split("\\").join("/");

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory())
      return entry.name === "node_modules" ? [] : walk(path);
    return /\.(ts|tsx|mts|js|jsx|mjs)$/.test(entry.name) &&
      !/\.(test|spec)\.[cm]?[jt]sx?$/.test(entry.name) &&
      !entry.name.endsWith(".d.ts")
      ? [path]
      : [];
  });
}

const fileCache = new Map();
function sourceFile(abs) {
  let sf = fileCache.get(abs);
  if (!sf) {
    const text = readFileSync(abs, "utf8");
    const kind = abs.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    sf = ts.createSourceFile(abs, text, ts.ScriptTarget.Latest, true, kind);
    fileCache.set(abs, sf);
  }
  return sf;
}

/** Resolves "@/x", "./x" and "../x" imports to a file under src/. */
function resolveModule(fromAbs, spec) {
  let base;
  if (spec.startsWith("@/")) base = join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(fromAbs), spec);
  else return null;
  for (const candidate of [
    base,
    ...[".ts", ".tsx", ".js", ".mjs"].map((ext) => base + ext),
    ...["index.ts", "index.tsx"].map((name) => join(base, name)),
  ])
    if (
      existsSync(candidate) &&
      !candidate.endsWith("/") &&
      /\.[cm]?[jt]sx?$/.test(candidate)
    )
      return candidate;
  return null;
}

/* ── Value resolution ── */

const ANY = "[]"; // any array element or any object property
const SAME_ELEMENTS = new Set([
  "filter",
  "slice",
  "sort",
  "toSorted",
  "reverse",
  "toReversed",
  "concat",
]);
const ONE_ELEMENT = new Set(["find", "findLast", "at"]);
const CALLBACK_METHODS = new Set([
  "map",
  "filter",
  "forEach",
  "find",
  "findLast",
  "some",
  "every",
  "flatMap",
  "findIndex",
]);

const isFunctionLike = (n) =>
  ts.isArrowFunction(n) ||
  ts.isFunctionExpression(n) ||
  ts.isFunctionDeclaration(n) ||
  ts.isMethodDeclaration(n);
const unwrap = (n) => {
  while (
    n &&
    (ts.isParenthesizedExpression(n) ||
      ts.isAsExpression(n) ||
      ts.isNonNullExpression(n) ||
      ts.isTypeAssertionExpression?.(n) ||
      (ts.isSatisfiesExpression && ts.isSatisfiesExpression(n)))
  )
    n = n.expression;
  return n;
};

/** Return expressions of a function, without descending into nested functions. */
function returnsOf(fn) {
  if (!fn.body) return [];
  if (!ts.isBlock(fn.body)) return [fn.body];
  const out = [];
  const visit = (n) => {
    if (isFunctionLike(n)) return;
    if (ts.isReturnStatement(n) && n.expression) out.push(n.expression);
    ts.forEachChild(n, visit);
  };
  ts.forEachChild(fn.body, visit);
  return out;
}

/** Finds the declaration that `name` refers to at `node`. */
function findBinding(name, node) {
  for (let scope = node.parent; scope; scope = scope.parent) {
    if (isFunctionLike(scope)) {
      for (const [index, param] of scope.parameters.entries()) {
        const hit = bindingIn(param.name, name, []);
        if (hit) return { kind: "param", fn: scope, index, path: hit.path };
      }
      if (ts.isFunctionExpression(scope) && scope.name?.text === name)
        return { kind: "function", node: scope };
    }
    const statements =
      ts.isSourceFile(scope) || ts.isBlock(scope) || ts.isModuleBlock(scope)
        ? scope.statements
        : ts.isCaseClause(scope) || ts.isDefaultClause(scope)
          ? scope.statements
          : null;
    if (!statements) {
      if (
        (ts.isForOfStatement(scope) || ts.isForInStatement(scope)) &&
        ts.isVariableDeclarationList(scope.initializer)
      ) {
        for (const decl of scope.initializer.declarations) {
          const hit = bindingIn(decl.name, name, []);
          if (hit) return { kind: "forOf", node: scope, path: hit.path };
        }
      }
      continue;
    }
    for (const st of statements) {
      if (ts.isVariableStatement(st)) {
        for (const decl of st.declarationList.declarations) {
          const hit = bindingIn(decl.name, name, []);
          if (hit) return { kind: "var", decl, path: hit.path, scope };
        }
      } else if (ts.isFunctionDeclaration(st) && st.name?.text === name) {
        return { kind: "function", node: st };
      } else if (
        ts.isImportDeclaration(st) &&
        st.importClause &&
        !st.importClause.isTypeOnly
      ) {
        const named = st.importClause.namedBindings;
        if (named && ts.isNamedImports(named))
          for (const el of named.elements)
            if (el.name.text === name)
              return {
                kind: "import",
                spec: st.moduleSpecifier.text,
                imported: (el.propertyName ?? el.name).text,
              };
      }
    }
  }
  return null;
}

/** Locates `name` inside a binding pattern; `path` is how to reach it from the bound value. */
function bindingIn(pattern, name, path) {
  if (ts.isIdentifier(pattern)) return pattern.text === name ? { path } : null;
  if (ts.isObjectBindingPattern(pattern)) {
    for (const el of pattern.elements) {
      const key = el.propertyName
        ? el.propertyName.getText()
        : el.name.getText();
      const hit = bindingIn(el.name, name, [
        ...path,
        key.replace(/^["']|["']$/g, ""),
      ]);
      if (hit) return hit;
    }
  }
  if (ts.isArrayBindingPattern(pattern)) {
    for (const [i, el] of pattern.elements.entries()) {
      if (ts.isOmittedExpression(el)) continue;
      const hit = bindingIn(el.name, name, [...path, `#${i}`]);
      if (hit) return hit;
    }
  }
  return null;
}

/** Finds the exported declaration `name` in a module, following re-exports. */
function findExport(abs, name, seen = new Set()) {
  if (!abs || seen.has(`${abs}#${name}`)) return null;
  seen.add(`${abs}#${name}`);
  const sf = sourceFile(abs);
  for (const st of sf.statements) {
    if (ts.isVariableStatement(st))
      for (const decl of st.declarationList.declarations)
        if (ts.isIdentifier(decl.name) && decl.name.text === name)
          return { kind: "var", decl, path: [], scope: sf };
    if (ts.isFunctionDeclaration(st) && st.name?.text === name)
      return { kind: "function", node: st };
    if (ts.isExportDeclaration(st) && st.moduleSpecifier) {
      const target = resolveModule(abs, st.moduleSpecifier.text);
      if (!st.exportClause) {
        const hit = findExport(target, name, seen);
        if (hit) return hit;
      } else if (ts.isNamedExports(st.exportClause)) {
        for (const el of st.exportClause.elements)
          if (el.name.text === name)
            return findExport(target, (el.propertyName ?? el.name).text, seen);
      }
    }
  }
  return null;
}

/**
 * Collects the strings an expression can evaluate to, following `path`
 * (property names, or ANY for an element / any property) into the value.
 */
class Resolver {
  constructor({ contentFiles = [] } = {}) {
    this.contentFiles = new Set(contentFiles.map((f) => join(ROOT, f)));
    this.depth = 0;
    this.active = new Set();
  }

  resolve(node, path = []) {
    const out = { values: new Set(), unresolved: [] };
    this.into(node, path, out);
    return out;
  }

  fail(node, out, why) {
    out.unresolved.push({
      text: node.getText().replace(/\s+/g, " ").slice(0, 80),
      why,
    });
  }

  into(raw, path, out) {
    const node = unwrap(raw);
    if (!node) return;
    const sf = node.getSourceFile();
    if (this.contentFiles.has(sf.fileName))
      return this.fail(node, out, "demo content");
    // A call and its callee can share a start, so the key needs end and kind too.
    const key = `${sf.fileName}:${node.pos}:${node.end}:${node.kind}:${path.join("/")}`;
    if (this.active.has(key) || this.depth > 40) return;
    this.active.add(key);
    this.depth++;
    try {
      this.step(node, path, out);
    } finally {
      this.depth--;
      this.active.delete(key);
    }
  }

  step(node, path, out) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (!path.length && node.text.trim()) out.values.add(node.text);
      return;
    }
    if (ts.isTemplateExpression(node)) return this.template(node, path, out);
    if (
      ts.isNumericLiteral(node) ||
      node.kind === ts.SyntaxKind.TrueKeyword ||
      node.kind === ts.SyntaxKind.FalseKeyword ||
      node.kind === ts.SyntaxKind.NullKeyword ||
      node.kind === ts.SyntaxKind.UndefinedKeyword
    )
      return;
    if (ts.isConditionalExpression(node)) {
      this.into(node.whenTrue, path, out);
      this.into(node.whenFalse, path, out);
      return;
    }
    if (ts.isBinaryExpression(node)) {
      const op = node.operatorToken.kind;
      if (
        op === ts.SyntaxKind.QuestionQuestionToken ||
        op === ts.SyntaxKind.BarBarToken
      ) {
        this.into(node.left, path, out);
        this.into(node.right, path, out);
        return;
      }
      if (op === ts.SyntaxKind.AmpersandAmpersandToken)
        return this.into(node.right, path, out);
      if (op === ts.SyntaxKind.PlusToken) return this.concat(node, path, out);
      return this.fail(node, out, "expression");
    }
    if (ts.isArrayLiteralExpression(node)) {
      const [head, ...rest] = path;
      if (head !== ANY && !/^#\d+$/.test(head ?? ""))
        return path.length ? undefined : this.fail(node, out, "array");
      node.elements.forEach((el, i) => {
        if (ts.isSpreadElement(el)) this.into(el.expression, path, out);
        else if (head === ANY || head === `#${i}`) this.into(el, rest, out);
      });
      return;
    }
    if (ts.isObjectLiteralExpression(node)) {
      const [head, ...rest] = path;
      if (!head) return this.fail(node, out, "object");
      for (const prop of node.properties) {
        if (ts.isSpreadAssignment(prop)) {
          this.into(prop.expression, path, out);
          continue;
        }
        const name =
          prop.name &&
          (ts.isIdentifier(prop.name) ||
            ts.isStringLiteral(prop.name) ||
            ts.isNumericLiteral(prop.name))
            ? prop.name.text
            : null;
        if (head !== ANY && name !== head) continue;
        if (ts.isPropertyAssignment(prop))
          this.into(prop.initializer, rest, out);
        else if (ts.isShorthandPropertyAssignment(prop))
          this.into(prop.name, rest, out);
      }
      return;
    }
    if (ts.isPropertyAccessExpression(node)) {
      if (node.name.text === "length") return;
      return this.into(node.expression, [node.name.text, ...path], out);
    }
    if (ts.isElementAccessExpression(node)) {
      const arg = unwrap(node.argumentExpression);
      // obj["key"] reads one property; any other index may be any element.
      const head = ts.isStringLiteral(arg) ? arg.text : ANY;
      return this.into(node.expression, [head, ...path], out);
    }
    if (ts.isCallExpression(node)) return this.call(node, path, out);
    if (ts.isIdentifier(node)) return this.identifier(node, path, out);
    if (isFunctionLike(node)) return;
    this.fail(node, out, ts.SyntaxKind[node.kind]);
  }

  template(node, path, out) {
    if (path.length) return;
    let variants = [node.head.text];
    for (const span of node.templateSpans) {
      const part = this.resolve(span.expression);
      const numbers = this.constNumber(span.expression);
      const options = numbers !== null ? [String(numbers)] : [...part.values];
      if (
        (part.unresolved.length && numbers === null) ||
        !options.length ||
        variants.length * options.length > 50
      )
        return this.fail(node, out, "template");
      variants = variants.flatMap((v) =>
        options.map((o) => v + o + span.literal.text),
      );
    }
    variants.forEach((v) => v.trim() && out.values.add(v));
  }

  concat(node, path, out) {
    const left = this.resolve(node.left, path);
    const right = this.resolve(node.right, path);
    if (left.unresolved.length || right.unresolved.length)
      return this.fail(node, out, "concatenation");
    for (const a of left.values)
      for (const b of right.values) out.values.add(a + b);
  }

  /** Numeric value of a `const X = 3` style identifier, or null. */
  constNumber(expr) {
    const node = unwrap(expr);
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (!ts.isIdentifier(node)) return null;
    const b = this.binding(node);
    const init =
      b?.kind === "var" && !b.path.length ? unwrap(b.decl.initializer) : null;
    return init && ts.isNumericLiteral(init) ? Number(init.text) : null;
  }

  binding(id) {
    const b = findBinding(id.text, id);
    if (b?.kind !== "import") return b;
    return findExport(
      resolveModule(id.getSourceFile().fileName, b.spec),
      b.imported,
    );
  }

  identifier(node, path, out) {
    const b = this.binding(node);
    if (!b) return this.fail(node, out, "unknown identifier");
    if (b.kind === "function") return; // a function value is not a string
    if (b.kind === "var") {
      const { decl } = b;
      // const [value, setValue] = useState(initial)
      const init = decl.initializer && unwrap(decl.initializer);
      if (
        b.path[0] === "#0" &&
        init &&
        ts.isCallExpression(init) &&
        /(^|\.)use(State|Reducer)$/.test(init.expression.getText())
      )
        return this.stateValue(decl, init, path, out);
      if (!init) return this.fail(node, out, "no initializer");
      this.into(init, [...b.path, ...path], out);
      // steps.push(...) in the same scope adds elements
      if (!b.path.length && path[0] === ANY)
        this.pushes(node.text, b.scope, path.slice(1), out);
      return;
    }
    if (b.kind === "param") return this.param(node, b, path, out);
    if (b.kind === "forOf")
      return this.into(b.node.expression, [ANY, ...b.path, ...path], out);
    this.fail(node, out, "binding");
  }

  pushes(name, scope, rest, out) {
    const visit = (n) => {
      if (
        ts.isCallExpression(n) &&
        ts.isPropertyAccessExpression(n.expression) &&
        ["push", "unshift"].includes(n.expression.name.text) &&
        ts.isIdentifier(n.expression.expression) &&
        n.expression.expression.text === name
      )
        n.arguments.forEach((arg) => this.into(arg, rest, out));
      ts.forEachChild(n, visit);
    };
    ts.forEachChild(scope, visit);
  }

  /** Values of a string-literal union type such as `"a" | "b"` or an alias of one; null if not one. */
  typeValues(typeNode, seen = new Set()) {
    if (!typeNode || seen.has(typeNode)) return null;
    seen.add(typeNode);
    if (ts.isParenthesizedTypeNode(typeNode))
      return this.typeValues(typeNode.type, seen);
    if (ts.isLiteralTypeNode(typeNode))
      return ts.isStringLiteral(typeNode.literal)
        ? [typeNode.literal.text]
        : null;
    if (ts.isUnionTypeNode(typeNode)) {
      const all = typeNode.types.map((t) => this.typeValues(t, seen));
      return all.every(Boolean) ? all.flat() : null;
    }
    if (
      ts.isTypeReferenceNode(typeNode) &&
      ts.isIdentifier(typeNode.typeName) &&
      !typeNode.typeArguments
    ) {
      const name = typeNode.typeName.text;
      const alias = this.typeAlias(name, typeNode.getSourceFile());
      return alias ? this.typeValues(alias.type, seen) : null;
    }
    return null;
  }

  typeAlias(name, sf, seen = new Set()) {
    if (seen.has(sf.fileName)) return null;
    seen.add(sf.fileName);
    for (const st of sf.statements) {
      if (ts.isTypeAliasDeclaration(st) && st.name.text === name) return st;
      if (
        ts.isImportDeclaration(st) &&
        st.importClause?.namedBindings &&
        ts.isNamedImports(st.importClause.namedBindings)
      )
        for (const el of st.importClause.namedBindings.elements)
          if (el.name.text === name) {
            const target = resolveModule(sf.fileName, st.moduleSpecifier.text);
            if (target)
              return this.typeAlias(
                (el.propertyName ?? el.name).text,
                sourceFile(target),
                seen,
              );
          }
    }
    return null;
  }

  stateValue(decl, init, path, out) {
    // useState<"a" | "b">(...) or useState<Alias>(...): the type lists every value.
    const typed = !path.length && this.typeValues(init.typeArguments?.[0]);
    if (typed) return typed.forEach((v) => out.values.add(v));
    if (init.arguments[0]) this.into(init.arguments[0], path, out);
    const pattern = decl.name;
    const setter =
      pattern.elements[1] && !ts.isOmittedExpression(pattern.elements[1])
        ? pattern.elements[1].name.getText()
        : null;
    if (!setter) return;
    let scope = decl.parent;
    while (scope && !isFunctionLike(scope) && !ts.isSourceFile(scope))
      scope = scope.parent;
    const visit = (n) => {
      if (
        ts.isCallExpression(n) &&
        ts.isIdentifier(n.expression) &&
        n.expression.text === setter &&
        n.arguments[0]
      ) {
        const arg = unwrap(n.arguments[0]);
        if (isFunctionLike(arg))
          returnsOf(arg).forEach((r) => this.into(r, path, out));
        else this.into(arg, path, out);
      }
      ts.forEachChild(n, visit);
    };
    if (scope) ts.forEachChild(scope, visit);
  }

  /** A callback parameter: `list.map((item) => t(item.label))`. */
  param(node, b, path, out) {
    const call = b.fn.parent;
    if (
      b.index === 0 &&
      ts.isCallExpression(call) &&
      call.arguments[0] === b.fn &&
      ts.isPropertyAccessExpression(call.expression) &&
      CALLBACK_METHODS.has(call.expression.name.text)
    )
      return this.into(
        call.expression.expression,
        [ANY, ...b.path, ...path],
        out,
      );
    this.fail(node, out, "parameter");
  }

  call(node, path, out) {
    const callee = unwrap(node.expression);
    if (ts.isPropertyAccessExpression(callee)) {
      const method = callee.name.text;
      if (SAME_ELEMENTS.has(method)) {
        this.into(callee.expression, path, out);
        if (method === "concat")
          node.arguments.forEach((a) => this.into(a, path, out));
        return;
      }
      if (ONE_ELEMENT.has(method))
        return this.into(callee.expression, [ANY, ...path], out);
      if (
        method === "map" &&
        path[0] === ANY &&
        node.arguments[0] &&
        isFunctionLike(unwrap(node.arguments[0]))
      )
        return returnsOf(unwrap(node.arguments[0])).forEach((r) =>
          this.into(r, path.slice(1), out),
        );
      if (["trim", "toString"].includes(method))
        return this.into(callee.expression, path, out);
      return this.fail(node, out, `.${method}()`);
    }
    if (ts.isIdentifier(callee)) {
      const b = this.binding(callee);
      let fn = b?.kind === "function" ? b.node : null;
      if (
        b?.kind === "var" &&
        !b.path.length &&
        b.decl.initializer &&
        isFunctionLike(unwrap(b.decl.initializer))
      )
        fn = unwrap(b.decl.initializer);
      if (fn) return returnsOf(fn).forEach((r) => this.into(r, path, out));
    }
    this.fail(node, out, "call");
  }

  /** Strings held by an export ref "file#name[.prop...]". */
  exportRef(ref) {
    const [file, spec] = ref.split("#");
    const [name, ...props] = spec.split(".");
    const abs = join(ROOT, file);
    const b = existsSync(abs) ? findExport(abs, name) : null;
    if (!b) throw new Error(`i18n sources: cannot find export ${ref}`);
    const out = { values: new Set(), unresolved: [] };
    const path = [ANY, ...props];
    if (b.kind === "function")
      returnsOf(b.node).forEach((r) => this.into(r, path, out));
    else {
      const init = unwrap(b.decl.initializer);
      if (isFunctionLike(init))
        returnsOf(init).forEach((r) => this.into(r, path, out));
      else {
        this.into(init, path, out);
        this.pushes(name, b.scope, props, out);
      }
    }
    return out;
  }
}

/* ── Extraction ── */

/** Names a file uses for the translate function. */
function translateNames(sf) {
  const names = new Set();
  const visit = (n) => {
    if (ts.isVariableDeclaration(n) && n.initializer) {
      const init = unwrap(n.initializer);
      if (ts.isCallExpression(init) && ts.isIdentifier(init.expression)) {
        const hook = init.expression.text;
        if (hook === "useText" && ts.isIdentifier(n.name))
          names.add(n.name.text);
        if (hook === "useI18n" && ts.isObjectBindingPattern(n.name))
          for (const el of n.name.elements)
            if ((el.propertyName ?? el.name).getText() === "t")
              names.add(el.name.getText());
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return names;
}

/**
 * Scans src/ and returns every string that reaches `t()`.
 * `strings`: Map<string, {file, line}[]>; `unresolved`: calls it could not follow.
 */
export function scan({
  alwaysInclude = [],
  hints = {},
  contentFiles = [],
} = {}) {
  const resolver = new Resolver({ contentFiles });
  const strings = new Map();
  const unresolved = [];
  const hinted = [];
  const literalsAnywhere = new Set();
  const add = (value, where) => {
    if (!strings.has(value)) strings.set(value, []);
    strings.get(value).push(where);
  };
  const usedHints = new Set();
  const files = walk(SRC);

  for (const abs of files) {
    const sf = sourceFile(abs);
    const file = rel(abs);
    const collectLiterals = (n) => {
      if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n))
        literalsAnywhere.add(n.text);
      ts.forEachChild(n, collectLiterals);
    };
    collectLiterals(sf);
    const names = translateNames(sf);
    if (!names.size) continue;
    const visit = (n) => {
      if (
        ts.isCallExpression(n) &&
        ts.isIdentifier(n.expression) &&
        names.has(n.expression.text) &&
        n.arguments[0]
      ) {
        const arg = n.arguments[0];
        const line = sf.getLineAndCharacterOfPosition(arg.getStart()).line + 1;
        const where = { file, line };
        const text = arg.getText().replace(/\s+/g, " ");
        const hint = hints[file]?.[text];
        if (hint) {
          usedHints.add(`${file}::${text}`);
          hinted.push({ ...where, expr: text, from: hint });
          for (const ref of hint)
            for (const v of resolver.exportRef(ref).values) add(v, where);
        } else {
          const res = resolver.resolve(arg);
          for (const v of res.values) add(v, where);
          if (res.unresolved.length)
            unresolved.push({
              ...where,
              expr: text,
              reasons: res.unresolved.map((u) => `${u.text} (${u.why})`),
            });
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }

  for (const ref of alwaysInclude) {
    const res = resolver.exportRef(ref);
    for (const v of res.values)
      add(v, { file: ref.split("#")[0], line: 0, ref });
  }

  const staleHints = Object.entries(hints).flatMap(([file, map]) =>
    Object.keys(map)
      .filter((expr) => !usedHints.has(`${file}::${expr}`))
      .map((expr) => ({ file, expr })),
  );
  return {
    strings,
    unresolved,
    hinted,
    staleHints,
    literalsAnywhere,
    files: files.length,
  };
}

/** Full report: missing, unused and placeholder mismatches against tr.json. */
export async function extract() {
  const config = await import("./sources.mjs");
  const en = readJson(EN_PATH);
  const tr = readJson(TR_PATH);
  const { strings, unresolved, hinted, staleHints, literalsAnywhere, files } =
    scan(config);
  const has = (obj, key) => Object.hasOwn(obj, key);
  const looksLikeId = (key) => /^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+$/.test(key);

  const required = new Map(); // key -> English source text
  for (const key of Object.keys(en)) required.set(key, en[key]);
  const unknownIds = [];
  for (const [key, where] of strings) {
    if (has(en, key)) continue;
    if (looksLikeId(key)) unknownIds.push({ key, where: where.slice(0, 3) });
    else required.set(key, key);
  }

  const missing = [];
  for (const [key, source] of required)
    if (!has(tr, key) || typeof tr[key] !== "string" || !tr[key].trim())
      missing.push({
        key,
        source,
        where: (
          strings.get(key) ?? [{ file: "src/lib/locales/en.json", line: 0 }]
        ).slice(0, 3),
      });

  const placeholderMismatch = [];
  for (const [key, value] of Object.entries(tr)) {
    const source = has(en, key) ? en[key] : key;
    if (typeof value !== "string") continue;
    if (placeholders(value) !== placeholders(source))
      placeholderMismatch.push({
        key,
        source,
        tr: value,
        expected: placeholders(source),
        found: placeholders(value),
      });
  }

  const unused = Object.keys(tr)
    .filter((key) => !required.has(key))
    .map((key) => ({ key, literalElsewhere: literalsAnywhere.has(key) }));

  return {
    summary: {
      filesScanned: files,
      uiStrings: required.size,
      translated: Object.keys(tr).length,
      missing: missing.length,
      unused: unused.length,
      placeholderMismatch: placeholderMismatch.length,
      unresolved: unresolved.length,
      unknownIds: unknownIds.length,
    },
    missing,
    unused,
    placeholderMismatch,
    unresolved,
    unknownIds,
    staleHints,
    hinted,
  };
}
