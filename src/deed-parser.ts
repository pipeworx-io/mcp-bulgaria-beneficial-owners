/**
 * Parses the ONE field this pack reads out of a live Registry Agency (Agency
 * po vpisvaniyata) company-deed record -- the natural-person "actual owners"
 * group (Bulgarian AML terminology: "действителни собственици"). Fleet #3332
 * research (2026-10-19) against a real, public record confirmed the shape:
 * one `<div class='record-container...'><p class='field-text'>...</p></div>`
 * block per owner, separated by `<hr class='hr--report' />`, each holding
 * (in order): the owner's name and country, an optional country-of-residence
 * pair, and a free-text "role/nature of control" description that ALWAYS
 * appears as the block's last line after "Данни за притежавани права:".
 *
 * Not a general HTML parser -- matches this one field's shape, the same
 * scoped-regex approach shared/src/statute-html.ts uses for statute pages.
 */

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export interface BgActualOwner {
  name: string;
  country: string | null;
  residence_country: string | null;
  manner_of_control: string | null;
}

/** `htmlData` of the CR_GL_ACTUAL_PERSON_OWNERS_L group's one field -- the
 *  natural-person owners for this deed, or [] when the group/field is absent
 *  (a real, common case: an entity whose UBO chain resolves only through
 *  legal persons, or one with no filed owners at all). */
export function parseActualPersonOwners(htmlData: string): BgActualOwner[] {
  if (!htmlData) return [];
  const blocks = htmlData.split(/<hr\b[^>]*\/?>/i);
  const owners: BgActualOwner[] = [];
  for (const block of blocks) {
    const text = decodeEntities(block.replace(/<[^>]+>/g, '\n')).split('\n').map((l) => l.trim()).filter(Boolean);
    if (!text.length) continue;

    // First non-empty line: "NAME, Държава: COUNTRY"
    const head = text[0]!;
    const headMatch = head.match(/^(.+?),\s*Държава:\s*(\S.*)$/u);
    const name = headMatch ? headMatch[1]!.trim() : head.trim();
    const country = headMatch ? headMatch[2]!.trim() : null;
    if (!name) continue;

    // "Държава на пребиваване" is followed, on its own line, by the residence country.
    let residence: string | null = null;
    const residenceIdx = text.findIndex((l) => /^Държава на пребиваване$/u.test(l));
    if (residenceIdx !== -1 && text[residenceIdx + 1]) residence = text[residenceIdx + 1]!.trim();

    // The role/manner-of-control summary is always the field's last
    // "Данни за притежавани права: ..." line (present on every owner block
    // observed, short-form and long-form alike).
    const mannerLine = text.find((l) => l.startsWith('Данни за притежавани права:'));
    const manner = mannerLine ? mannerLine.replace(/^Данни за притежавани права:\s*/u, '').trim() : null;

    owners.push({ name, country, residence_country: residence, manner_of_control: manner });
  }
  return owners;
}
