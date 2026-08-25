import Link from "next/link";
import type { ReactNode } from "react";

import en from "../../messages/en.json";

type Messages = typeof en;
type Values = Record<string, string | number>;

const messages: Messages = en;

type Dict = Record<string, unknown>;

function interpolate(template: string, values?: Values): string {
  const plural = template.match(/^\{(\w+), plural, ([\s\S]*)\}$/);
  if (plural) {
    const [, name, choices] = plural;
    const n = Number(values?.[name]);
    const one = choices.match(/\bone \{([^}]*)\}/)?.[1] ?? "";
    const other = choices.match(/\bother \{([^}]*)\}/)?.[1] ?? "";
    return interpolate(n === 1 ? one : other, values);
  }
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in (values ?? {}) ? String(values![key]) : match,
  );
}

function resolvePath(dict: Dict, key: string): string {
  const value = key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Dict)[part];
    return undefined;
  }, dict);
  return typeof value === "string" ? value : "";
}

function parseRich(template: string): Array<string | [string, string]> {
  const parts: Array<string | [string, string]> = [];
  const re = /<([a-zA-Z]+)>([^<]*)<\/\1>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) !== null) {
    if (m.index > last) parts.push(template.slice(last, m.index));
    parts.push([m[1], m[2]]);
    last = m.index + m[0].length;
  }
  if (last < template.length) parts.push(template.slice(last));
  return parts;
}

type RichElements = Record<
  string,
  ((chunks: ReactNode) => ReactNode) | string | number
>;

function makeT(dict: Dict) {
  const t = (key: string, values?: Values) =>
    interpolate(resolvePath(dict, key), values);

  t.rich = (key: string, elements: RichElements): ReactNode => {
    const values: Values = {};
    const tags: Record<string, (chunks: ReactNode) => ReactNode> = {};
    for (const [k, v] of Object.entries(elements)) {
      if (typeof v === "function") {
        tags[k] = v as (chunks: ReactNode) => ReactNode;
      } else {
        values[k] = v as string | number;
      }
    }
    const interpolated = interpolate(resolvePath(dict, key), values);
    return parseRich(interpolated).map((part) => {
      if (Array.isArray(part)) {
        const [tag, chunks] = part;
        return tags[tag] ? tags[tag](chunks) : chunks;
      }
      return part;
    });
  };

  return t;
}

export function useTranslations<T extends keyof Messages = keyof Messages>(
  namespace: T,
) {
  return makeT(messages[namespace] as Dict);
}

export async function getTranslations(
  arg?: string | { locale: string; namespace?: string },
) {
  const namespace = typeof arg === "string" ? arg : arg?.namespace;
  return namespace
    ? makeT(messages[namespace as keyof Messages] as Dict)
    : makeT(messages as Dict);
}

export const useLocale = () => "en";

export const hasLocale = (locales: string[], locale: string) =>
  locales.includes(locale);

export const setRequestLocale = () => {};

export const getMessages = (): Messages => messages;

export const NextIntlClientProvider = ({
  children,
}: {
  children: ReactNode;
}) => children;

export const getPathname = ({ href }: { href: string; locale: string }) =>
  href;

export { Link };