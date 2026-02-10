"use client";

import { useState } from "react";
import {
  getVigenereEncryptSteps,
  getVigenereDecryptSteps,
  type VigenereLetterStep,
} from "@/lib/vigenereSteps";
import { normalizeToAlphabet } from "@/lib/normalize";
import { ALPHABET_RU } from "@/config/alphabets";

type Mode = "encrypt" | "decrypt";

interface VigenereDemoProps {
  plaintext?: string;
  ciphertext?: string;
  cryptoKey?: string;
  mode: Mode;
  alphabet?: string;
}

export function VigenereDemo({
  plaintext = "",
  ciphertext = "",
  cryptoKey = "",
  mode,
  alphabet = ALPHABET_RU,
}: VigenereDemoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [encryptData, setEncryptData] = useState<ReturnType<
    typeof getVigenereEncryptSteps
  > | null>(null);
  const [decryptData, setDecryptData] = useState<ReturnType<
    typeof getVigenereDecryptSteps
  > | null>(null);

  const runEncrypt = () => {
    if (!plaintext.trim() || !cryptoKey.trim()) return;
    const normPlain = normalizeToAlphabet(plaintext, alphabet);
    const normKey = normalizeToAlphabet(cryptoKey, alphabet);
    if (!normPlain.length || !normKey.length) return;
    const data = getVigenereEncryptSteps(normPlain, normKey, alphabet);
    setEncryptData(data);
    setDecryptData(null);
    setCurrentIndex(0);
  };

  const runDecrypt = () => {
    if (!ciphertext.trim() || !cryptoKey.trim()) return;
    const normCipher = normalizeToAlphabet(ciphertext, alphabet);
    const normKey = normalizeToAlphabet(cryptoKey, alphabet);
    if (!normCipher.length || !normKey.length) return;
    const data = getVigenereDecryptSteps(normCipher, normKey, alphabet);
    setDecryptData(data);
    setEncryptData(null);
    setCurrentIndex(0);
  };

  const steps: VigenereLetterStep[] =
    mode === "encrypt"
      ? encryptData?.steps ?? []
      : decryptData?.steps ?? [];
  const step = steps[currentIndex];
  const keyStream =
    mode === "encrypt" ? encryptData?.keyStream : decryptData?.keyStream;

  return (
    <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-medium text-neutral-700">
        Пошаговая демонстрация (Виженер, прогрессивный ключ)
      </h3>

      {mode === "encrypt" && plaintext && cryptoKey && (
        <button
          type="button"
          onClick={runEncrypt}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          Показать шаги шифрования
        </button>
      )}
      {mode === "decrypt" && ciphertext && cryptoKey && (
        <button
          type="button"
          onClick={runDecrypt}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          Показать шаги дешифрования
        </button>
      )}

      {keyStream && (
        <p className="text-sm text-neutral-600">
          Ключевая последовательность (прогрессивный ключ):{" "}
          <span className="font-mono font-medium">{keyStream}</span>
        </p>
      )}

      {encryptData && mode === "encrypt" && (
        <p className="text-sm text-neutral-600">
          Шифротекст:{" "}
          <span className="font-mono font-medium">{encryptData.ciphertext}</span>
        </p>
      )}
      {decryptData && mode === "decrypt" && (
        <p className="text-sm text-neutral-600">
          Открытый текст:{" "}
          <span className="font-mono font-medium">{decryptData.plaintext}</span>
        </p>
      )}

      {step && (
        <>
          <p className="text-sm text-neutral-600">
            Буква: открытый «{step.plainChar}» + ключ «{step.keyChar}» →
            шифротекст «{step.cipherChar}»
          </p>
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border border-neutral-300 bg-neutral-50 p-1">
                    —
                  </th>
                  {alphabet.split("").map((c, i) => (
                    <th
                      key={i}
                      className={`border border-neutral-300 p-0.5 font-mono ${
                        i === step.plainIndex ? "bg-amber-100 ring-1 ring-amber-400" : ""
                      }`}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alphabet.split("").map((rowChar, rowIdx) => (
                  <tr key={rowIdx}>
                    <td
                      className={`border border-neutral-300 p-0.5 font-mono ${
                        rowIdx === step.keyIndex
                          ? "bg-amber-100 ring-1 ring-amber-400"
                          : ""
                      }`}
                    >
                      {rowChar}
                    </td>
                    {alphabet.split("").map((colChar, colIdx) => {
                      const row = alphabet.indexOf(rowChar);
                      const col = alphabet.indexOf(colChar);
                      const cellChar =
                        alphabet[(row + col) % alphabet.length];
                      const isIntersection =
                        rowIdx === step.keyIndex && colIdx === step.plainIndex;
                      return (
                        <td
                          key={colIdx}
                          className={`border border-neutral-200 p-0.5 font-mono ${
                            isIntersection
                              ? "bg-amber-200 ring-2 ring-amber-500"
                              : ""
                          }`}
                        >
                          {cellChar}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentIndex <= 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              className="rounded border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Назад
            </button>
            <span className="py-1 text-sm text-neutral-500">
              Буква {currentIndex + 1} из {steps.length}
            </span>
            <button
              type="button"
              disabled={currentIndex >= steps.length - 1}
              onClick={() =>
                setCurrentIndex((i) => Math.min(steps.length - 1, i + 1))
              }
              className="rounded border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Вперёд
            </button>
          </div>
        </>
      )}
    </div>
  );
}
