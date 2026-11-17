import type { Profile } from "./profile";

export function safeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !!url.hostname &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

const escapeVcard = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

// RFC 2425 line folding counts UTF-8 bytes, not JavaScript characters.
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  let output = "",
    bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) {
      output += "\r\n ";
      bytes = 1;
    }
    output += character;
    bytes += size;
  }
  return output;
}

export function makeVcard(p: Profile): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVcard(p.name)}`,
    `N:;${escapeVcard(p.name)};;;`,
  ];
  if (p.phone) lines.push(`TEL;TYPE=CELL:${escapeVcard(p.phone)}`);
  if (p.email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVcard(p.email)}`);
  if (p.profession) lines.push(`TITLE:${escapeVcard(p.profession)}`);
  if (p.canonicalUrl && safeUrl(p.canonicalUrl))
    lines.push(`URL:${escapeVcard(p.canonicalUrl)}`);
  p.social
    .filter((s) => safeUrl(s.url))
    .forEach((s) => lines.push(`URL:${escapeVcard(s.url)}`));
  lines.push("END:VCARD");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function downloadContact(p: Profile): void {
  const url = URL.createObjectURL(
    new Blob([makeVcard(p)], { type: "text/vcard;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${p.name.replace(/[\\/\r\n]/g, "_")}.vcf`;
  document.body.append(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
