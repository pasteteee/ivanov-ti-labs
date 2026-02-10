export function normalizeToAlphabet(text: string, alphabet: string): string {
  const set = new Set(alphabet.toUpperCase() + alphabet.toLowerCase());
  return [...text]
    .filter((ch) => set.has(ch))
    .map((ch) => {
      const up = ch.toUpperCase();
      return alphabet.includes(up) ? up : ch;
    })
    .join("");
}
