/**
 * Serialises structured data for an inline `<script type="application/ld+json">`.
 *
 * `JSON.stringify` on its own can emit `</script>` when a stored field contains
 * it, which ends the script element early and turns the rest of the record into
 * markup. Escaping the characters that terminate or confuse an HTML parser —
 * and the two JavaScript line separators — keeps the payload inert whatever a
 * staff member or a provider wrote into the title, name or body.
 */
export function jsonLdScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
