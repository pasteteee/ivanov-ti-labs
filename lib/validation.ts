import { ALPHABET_EN, ALPHABET_RU } from "@/config/alphabets";
import { uiConfig } from "@/config/ui";
import { normalizeToAlphabet } from "./normalize";

export function validateGrilleInput(text: string): { ok: true } | { ok: false; message: string } {
  const normalized = normalizeToAlphabet(text, ALPHABET_EN);
  if (!normalized.length) return { ok: false, message: uiConfig.errors.emptyText };
  return { ok: true };
}

export function validateVigenereInput(
  text: string,
  key: string
): { ok: true } | { ok: false; message: string } {
  const normText = normalizeToAlphabet(text, ALPHABET_RU);
  const normKey = normalizeToAlphabet(key, ALPHABET_RU);
  if (!normText.length) return { ok: false, message: uiConfig.errors.emptyText };
  if (!normKey.length) return { ok: false, message: uiConfig.errors.emptyKey };
  return { ok: true };
}

export function validateByTask(
  taskId: string,
  text: string,
  key: string
): { ok: true } | { ok: false; message: string } {
  if (taskId === "grille") return validateGrilleInput(text);
  if (taskId === "vigenere") return validateVigenereInput(text, key);
  return { ok: false, message: uiConfig.errors.emptyText };
}

export function validateFile(
  file: File
): { ok: true } | { ok: false; message: string } {
  if (!file.name.toLowerCase().endsWith(".txt"))
    return { ok: false, message: uiConfig.errors.fileType };
  if (file.size > uiConfig.maxFileSizeBytes)
    return { ok: false, message: uiConfig.errors.fileTooBig };
  return { ok: true };
}
