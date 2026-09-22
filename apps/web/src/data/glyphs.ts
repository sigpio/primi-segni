/**
 * Path SVG "a centerline" per i caratteri da ricalcare, su una griglia 1000x1000.
 * Sono le linee-guida ("il binario") da seguire col dito: stampatello MAIUSCOLO
 * e cifre, tratti semplici adatti alla prima elementare.
 * NB: multi-subpath (M ...) per lettere composte da più tratti.
 */
export const GLYPH_SIZE = 1000;

export const GLYPHS: Record<string, string> = {
  A: 'M 300 850 L 500 150 L 700 850 M 385 600 L 615 600',
  E: 'M 360 150 L 360 850 M 360 150 L 690 150 M 360 500 L 630 500 M 360 850 L 690 850',
  I: 'M 380 150 L 620 150 M 500 150 L 500 850 M 380 850 L 620 850',
  O: 'M 500 160 C 375 160 285 310 285 500 C 285 690 375 840 500 840 C 625 840 715 690 715 500 C 715 310 625 160 500 160 Z',
  M: 'M 300 850 L 300 150 L 500 600 L 700 150 L 700 850',
  '1': 'M 370 300 L 520 180 L 520 850 M 370 850 L 670 850',
  '2': 'M 320 340 C 340 200 660 180 670 360 C 678 470 470 620 330 850 L 700 850',
  '3': 'M 330 320 C 360 190 660 190 660 360 C 660 470 500 500 480 500 C 500 500 670 520 670 650 C 670 830 360 840 320 690',
};

export function glyphFor(value: string): string | null {
  return GLYPHS[value] ?? null;
}
