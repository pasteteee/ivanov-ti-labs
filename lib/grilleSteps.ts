import { grilleEncrypt, grilleDecrypt, buildGrilleWriteOrder } from "./cryptoUtils";
import { grilleConfig } from "@/config/grille";

const BLOCK = 16;
const WRITE_ORDER_4 = buildGrilleWriteOrder(grilleConfig.matrixInitial);

export interface GrilleStep {
  stepIndex: number;
  rotation: number;
  grid: string[][];
  holeCells: [number, number][];
  rotationHoles: [number, number][];
  filledCells: [number, number][];
  label: string;
}

export interface GrilleEncryptStepsResult {
  steps: GrilleStep[];
  ciphertext: string;
  plaintext: string;
}

export function getGrilleEncryptSteps(plaintext: string): GrilleEncryptStepsResult {
  const normalized = plaintext.replace(/\s/g, "").toUpperCase();
  const padded =
    normalized.length % BLOCK
      ? normalized + "X".repeat(BLOCK - (normalized.length % BLOCK))
      : normalized;
  const ciphertext = grilleEncrypt(padded, grilleConfig.matrixInitial);

  const steps: GrilleStep[] = [];
  for (let blockStart = 0; blockStart < padded.length; blockStart += BLOCK) {
    const block = padded.slice(blockStart, blockStart + BLOCK);
    const grid: string[][] = Array.from({ length: 4 }, () => Array(4).fill(""));

    for (let k = 0; k < BLOCK; k++) {
      const [r, c] = WRITE_ORDER_4[k];
      grid[r][c] = block[k];
      const holeCells = [WRITE_ORDER_4[k]];
      const rotation = Math.floor(k / 4);
      const rotationHoles = WRITE_ORDER_4.slice(rotation * 4, rotation * 4 + 4);
      const filledCells: [number, number][] = [];
      for (let i = 0; i <= k; i++) {
        filledCells.push(WRITE_ORDER_4[i]);
      }
      steps.push({
        stepIndex: blockStart + k,
        rotation,
        grid: grid.map((row) => [...row]),
        holeCells,
        rotationHoles,
        filledCells,
        label: `Запись буквы «${block[k]}» (поворот ${rotation}, 90°×${rotation})`,
      });
    }
  }

  return { steps, ciphertext, plaintext: padded };
}

export interface GrilleDecryptStep {
  stepIndex: number;
  rotation: number;
  grid: string[][];
  holeCells: [number, number][];
  rotationHoles: [number, number][];
  readChars: string;
  label: string;
}

export interface GrilleDecryptStepsResult {
  steps: GrilleDecryptStep[];
  plaintext: string;
  ciphertext: string;
}

export function getGrilleDecryptSteps(ciphertext: string): GrilleDecryptStepsResult {
  const normalized = ciphertext.replace(/\s/g, "").toUpperCase();
  const plaintext = grilleDecrypt(normalized, grilleConfig.matrixInitial);

  const steps: GrilleDecryptStep[] = [];
  for (let blockStart = 0; blockStart < normalized.length; blockStart += BLOCK) {
    const block = normalized.slice(blockStart, blockStart + BLOCK);
    const grid: string[][] = Array.from({ length: 4 }, () => Array(4).fill(""));
    let idx = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        grid[r][c] = block[idx++];
      }
    }

    for (let k = 0; k < BLOCK; k++) {
      const [r, c] = WRITE_ORDER_4[k];
      const ch = grid[r][c];
      const rotation = Math.floor(k / 4);
      const rotationHoles = WRITE_ORDER_4.slice(rotation * 4, rotation * 4 + 4);
      const readSoFar = plaintext.slice(
        blockStart,
        blockStart + k + 1
      );
      steps.push({
        stepIndex: blockStart + k,
        rotation,
        grid: grid.map((row) => [...row]),
        holeCells: [[r, c]],
        rotationHoles,
        readChars: readSoFar,
        label: `Чтение «${ch}» (поворот ${rotation}, 90°×${rotation})`,
      });
    }
  }

  return { steps, plaintext, ciphertext: normalized };
}
