const BLOCK = 16;
const GRILLE_SIZE = 4;

export function buildGrilleWriteOrder(grille: boolean[][]): [number, number][] {
  const order: [number, number][] = [];
  let current = grille.map((row) => [...row]);
  for (let rot = 0; rot < 4; rot++) {
    const holes: [number, number][] = [];
    for (let r = 0; r < GRILLE_SIZE; r++) {
      for (let c = 0; c < GRILLE_SIZE; c++) {
        if (current[r][c]) holes.push([r, c]);
      }
    }
    holes.sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]));
    for (const p of holes) order.push(p);
    const next = Array.from({ length: GRILLE_SIZE }, () =>
      Array(GRILLE_SIZE).fill(false)
    );
    for (let r = 0; r < GRILLE_SIZE; r++) {
      for (let c = 0; c < GRILLE_SIZE; c++) {
        next[c][GRILLE_SIZE - 1 - r] = current[r][c];
      }
    }
    current = next;
  }
  return order;
}

export function grilleEncrypt(plaintext: string, grille: boolean[][]): string {
  const writeOrder = buildGrilleWriteOrder(grille);
  let out = "";
  for (let i = 0; i < plaintext.length; i += BLOCK) {
    const block = plaintext.slice(i, i + BLOCK);
    const padded =
      block.length < BLOCK
        ? block + "X".repeat(BLOCK - block.length)
        : block;
    const grid: string[][] = Array.from({ length: GRILLE_SIZE }, () =>
      Array(GRILLE_SIZE).fill("")
    );
    for (let k = 0; k < BLOCK; k++) {
      const [r, c] = writeOrder[k];
      grid[r][c] = padded[k];
    }
    for (let r = 0; r < GRILLE_SIZE; r++) {
      for (let c = 0; c < GRILLE_SIZE; c++) {
        out += grid[r][c];
      }
    }
  }
  return out;
}

export function grilleDecrypt(ciphertext: string, grille: boolean[][]): string {
  const writeOrder = buildGrilleWriteOrder(grille);
  let out = "";
  for (let i = 0; i < ciphertext.length; i += BLOCK) {
    const block = ciphertext.slice(i, i + BLOCK);
    const grid: string[][] = Array.from({ length: GRILLE_SIZE }, () =>
      Array(GRILLE_SIZE).fill("")
    );
    let idx = 0;
    for (let r = 0; r < GRILLE_SIZE; r++) {
      for (let c = 0; c < GRILLE_SIZE; c++) {
        grid[r][c] = block[idx++];
      }
    }
    for (let k = 0; k < BLOCK; k++) {
      const [r, c] = writeOrder[k];
      out += grid[r][c];
    }
  }
  return out;
}

function expandKeyProgressive(key: string, length: number, alphabet: string): string {
  const n = alphabet.length;
  const keyChars = [...key];
  let stream = "";
  let shift = 0;
  while (stream.length < length) {
    for (let i = 0; i < keyChars.length && stream.length < length; i++) {
      const idx = alphabet.indexOf(keyChars[i].toUpperCase());
      if (idx === -1) continue;
      const newIdx = (idx + shift) % n;
      stream += alphabet[newIdx];
    }
    shift++;
  }
  return stream.slice(0, length);
}

export function vigenereEncrypt(
  plaintext: string,
  key: string,
  alphabet: string
): string {
  const keyStream = expandKeyProgressive(key, plaintext.length, alphabet);
  const n = alphabet.length;
  let out = "";
  for (let i = 0; i < plaintext.length; i++) {
    const p = alphabet.indexOf(plaintext[i].toUpperCase());
    const k = alphabet.indexOf(keyStream[i]);
    if (p === -1 || k === -1) continue;
    out += alphabet[(p + k) % n];
  }
  return out;
}

export function vigenereDecrypt(
  ciphertext: string,
  key: string,
  alphabet: string
): string {
  const keyStream = expandKeyProgressive(key, ciphertext.length, alphabet);
  const n = alphabet.length;
  let out = "";
  for (let i = 0; i < ciphertext.length; i++) {
    const c = alphabet.indexOf(ciphertext[i].toUpperCase());
    const k = alphabet.indexOf(keyStream[i]);
    if (c === -1 || k === -1) continue;
    out += alphabet[(c - k + n) % n];
  }
  return out;
}
