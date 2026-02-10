import { vigenereEncrypt, vigenereDecrypt } from "./cryptoUtils";

function expandKeyProgressive(
  key: string,
  length: number,
  alphabet: string
): string {
  const n = alphabet.length;
  const keyChars = key.toUpperCase().split("").filter((c) => alphabet.includes(c));
  if (keyChars.length === 0) return "";
  let stream = "";
  let shift = 0;
  while (stream.length < length) {
    for (let i = 0; i < keyChars.length && stream.length < length; i++) {
      const idx = alphabet.indexOf(keyChars[i]);
      const newIdx = (idx + shift) % n;
      stream += alphabet[newIdx];
    }
    shift++;
  }
  return stream.slice(0, length);
}

export interface VigenereLetterStep {
  plainChar: string;
  keyChar: string;
  cipherChar: string;
  plainIndex: number;
  keyIndex: number;
  cipherIndex: number;
}

export interface VigenereEncryptStepsResult {
  plaintext: string;
  keyStream: string;
  ciphertext: string;
  steps: VigenereLetterStep[];
}

export function getVigenereEncryptSteps(
  plaintext: string,
  key: string,
  alphabet: string
): VigenereEncryptStepsResult {
  const keyStream = expandKeyProgressive(key, plaintext.length, alphabet);
  const ciphertext = vigenereEncrypt(plaintext, key, alphabet);

  const steps: VigenereLetterStep[] = [];
  const n = alphabet.length;
  for (let i = 0; i < plaintext.length; i++) {
    const p = alphabet.indexOf(plaintext[i].toUpperCase());
    const k = alphabet.indexOf(keyStream[i]);
    const c = (p + k) % n;
    steps.push({
      plainChar: plaintext[i],
      keyChar: keyStream[i],
      cipherChar: alphabet[c],
      plainIndex: p,
      keyIndex: k,
      cipherIndex: c,
    });
  }
  return { plaintext, keyStream, ciphertext, steps };
}

export interface VigenereDecryptStepsResult {
  ciphertext: string;
  keyStream: string;
  plaintext: string;
  steps: VigenereLetterStep[];
}

export function getVigenereDecryptSteps(
  ciphertext: string,
  key: string,
  alphabet: string
): VigenereDecryptStepsResult {
  const keyStream = expandKeyProgressive(key, ciphertext.length, alphabet);
  const plaintext = vigenereDecrypt(ciphertext, key, alphabet);

  const steps: VigenereLetterStep[] = [];
  const n = alphabet.length;
  for (let i = 0; i < ciphertext.length; i++) {
    const c = alphabet.indexOf(ciphertext[i].toUpperCase());
    const k = alphabet.indexOf(keyStream[i]);
    const p = (c - k + n) % n;
    steps.push({
      plainChar: alphabet[p],
      keyChar: keyStream[i],
      cipherChar: ciphertext[i],
      plainIndex: p,
      keyIndex: k,
      cipherIndex: c,
    });
  }
  return { ciphertext, keyStream, plaintext, steps };
}
