"use client";

import { useState } from "react";
import {
  getGrilleEncryptSteps,
  getGrilleDecryptSteps,
  type GrilleStep,
  type GrilleDecryptStep,
} from "@/lib/grilleSteps";
import { normalizeToAlphabet } from "@/lib/normalize";
import { ALPHABET_EN } from "@/config/alphabets";

type Mode = "encrypt" | "decrypt";

interface GrilleDemoProps {
  plaintext?: string;
  ciphertext?: string;
  mode: Mode;
}

export function GrilleDemo({
  plaintext = "",
  ciphertext = "",
  mode,
}: GrilleDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [encryptData, setEncryptData] = useState<ReturnType<
    typeof getGrilleEncryptSteps
  > | null>(null);
  const [decryptData, setDecryptData] = useState<ReturnType<
    typeof getGrilleDecryptSteps
  > | null>(null);

  const runEncrypt = () => {
    const normalized = normalizeToAlphabet(plaintext, ALPHABET_EN);
    if (normalized.length === 0) return;
    const data = getGrilleEncryptSteps(normalized);
    setEncryptData(data);
    setDecryptData(null);
    setCurrentStep(0);
  };

  const runDecrypt = () => {
    const normalized = normalizeToAlphabet(ciphertext, ALPHABET_EN);
    if (normalized.length === 0) return;
    const data = getGrilleDecryptSteps(normalized);
    setDecryptData(data);
    setEncryptData(null);
    setCurrentStep(0);
  };

  const encryptSteps = encryptData?.steps ?? [];
  const decryptSteps = decryptData?.steps ?? [];
  const steps = mode === "encrypt" ? encryptSteps : decryptSteps;
  const step = steps[currentStep] as GrilleStep | GrilleDecryptStep | undefined;

  return (
    <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-medium text-neutral-700">
        Пошаговая демонстрация (решётка 4×4)
      </h3>

      {mode === "encrypt" && plaintext && (
        <button
          type="button"
          onClick={runEncrypt}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          Показать шаги шифрования
        </button>
      )}
      {mode === "decrypt" && ciphertext && (
        <button
          type="button"
          onClick={runDecrypt}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          Показать шаги дешифрования
        </button>
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

      {step && "grid" in step && "rotationHoles" in step && (
        <>
          <p className="text-sm text-neutral-600">{step.label}</p>
          <p className="text-xs text-neutral-500 mb-1">
            Решётка (4 отверстия) повёрнута на 90°×{(step as GrilleStep).rotation}
          </p>
          <div className="inline-block border-2 border-neutral-400 rounded">
            {(step as GrilleStep).grid.map((row, r) => (
              <div key={r} className="flex">
                {row.map((cell, c) => {
                  const isInGrille = (step as GrilleStep).rotationHoles.some(
                    ([hr, hc]) => hr === r && hc === c
                  );
                  const isCurrentHole = (step as GrilleStep).holeCells.some(
                    ([hr, hc]) => hr === r && hc === c
                  );
                  return (
                    <div
                      key={c}
                      className={`flex h-10 w-10 items-center justify-center border font-mono text-sm
                        ${isInGrille ? "border-2 border-amber-500 bg-amber-50" : "border border-neutral-200 bg-white"}
                        ${isCurrentHole ? "ring-2 ring-amber-500 ring-offset-1 bg-amber-100" : ""}`}
                      title={isInGrille ? "Отверстие решётки" : ""}
                    >
                      {cell || ""}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentStep <= 0}
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              className="rounded border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Назад
            </button>
            <span className="py-1 text-sm text-neutral-500">
              Шаг {currentStep + 1} из {steps.length}
            </span>
            <button
              type="button"
              disabled={currentStep >= steps.length - 1}
              onClick={() =>
                setCurrentStep((s) => Math.min(steps.length - 1, s + 1))
              }
              className="rounded border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Вперёд
            </button>
          </div>
        </>
      )}

      {step && "readChars" in step && (step as GrilleDecryptStep).grid && "rotationHoles" in step && (
        <>
          <p className="text-sm text-neutral-600">{step.label}</p>
          <p className="text-xs text-neutral-500 mb-1">
            Решётка (4 отверстия) повёрнута на 90°×{(step as GrilleDecryptStep).rotation}
          </p>
          <div className="inline-block border-2 border-neutral-400 rounded">
            {(step as GrilleDecryptStep).grid.map((row, r) => (
              <div key={r} className="flex">
                {row.map((cell, c) => {
                  const isInGrille = (step as GrilleDecryptStep).rotationHoles.some(
                    ([hr, hc]) => hr === r && hc === c
                  );
                  const isCurrentHole = (step as GrilleDecryptStep).holeCells.some(
                    ([hr, hc]) => hr === r && hc === c
                  );
                  return (
                    <div
                      key={c}
                      className={`flex h-10 w-10 items-center justify-center border font-mono text-sm
                        ${isInGrille ? "border-2 border-amber-500 bg-amber-50" : "border border-neutral-200 bg-white"}
                        ${isCurrentHole ? "ring-2 ring-amber-500 ring-offset-1 bg-amber-100" : ""}`}
                      title={isInGrille ? "Отверстие решётки" : ""}
                    >
                      {cell || ""}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="text-sm">
            Прочитано:{" "}
            <span className="font-mono font-medium">
              {(step as GrilleDecryptStep).readChars}
            </span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentStep <= 0}
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              className="rounded border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Назад
            </button>
            <span className="py-1 text-sm text-neutral-500">
              Шаг {currentStep + 1} из {steps.length}
            </span>
            <button
              type="button"
              disabled={currentStep >= steps.length - 1}
              onClick={() =>
                setCurrentStep((s) => Math.min(steps.length - 1, s + 1))
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
