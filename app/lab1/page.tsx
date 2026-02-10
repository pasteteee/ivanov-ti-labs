"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { lab1Config } from "@/config/lab1";
import { uiConfig } from "@/config/ui";
import { ALPHABET_EN, ALPHABET_RU } from "@/config/alphabets";
import { grilleConfig } from "@/config/grille";
import { normalizeToAlphabet } from "@/lib/normalize";
import { validateByTask, validateFile } from "@/lib/validation";
import { grilleEncrypt, grilleDecrypt, vigenereEncrypt, vigenereDecrypt } from "@/lib/cryptoUtils";
import { GrilleDemo } from "@/components/demo/GrilleDemo";
import { VigenereDemo } from "@/components/demo/VigenereDemo";

type TaskId = "grille" | "vigenere";
type Action = "encrypt" | "decrypt";

export default function Lab1Page() {
  const [openTaskId, setOpenTaskId] = useState<TaskId | null>("grille");
  const [text, setText] = useState("");
  const [key, setKey] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [action, setAction] = useState<Action | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, taskId: TaskId) => {
      setError("");
      const file = e.target.files?.[0];
      if (!file) return;
      const validation = validateFile(file);
      if (!validation.ok) {
        setError(validation.message);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const content = String(reader.result ?? "");
        setText(content);
      };
      reader.readAsText(file, "UTF-8");
      e.target.value = "";
    },
    []
  );

  const runCrypto = useCallback(
    (taskId: TaskId, actionType: Action) => {
      setError("");
      setAction(actionType);
      const validation = validateByTask(taskId, text, key);
      if (!validation.ok) {
        setError(validation.message);
        setResult("");
        return;
      }

      if (taskId === "grille") {
        const alphabet = ALPHABET_EN;
        const normalized = normalizeToAlphabet(text, alphabet);
        if (actionType === "encrypt") {
          const out = grilleEncrypt(normalized, grilleConfig.matrixInitial);
          setResult(out);
        } else {
          const out = grilleDecrypt(normalized, grilleConfig.matrixInitial);
          setResult(out);
        }
      } else {
        const alphabet = ALPHABET_RU;
        const normalizedText = normalizeToAlphabet(text, alphabet);
        const normalizedKey = normalizeToAlphabet(key, alphabet);
        if (actionType === "encrypt") {
          const out = vigenereEncrypt(normalizedText, normalizedKey, alphabet);
          setResult(out);
        } else {
          const out = vigenereDecrypt(normalizedText, normalizedKey, alphabet);
          setResult(out);
        }
      }
    },
    [text, key]
  );

  const downloadResult = useCallback(() => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "result.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Link
          href="/"
          className="text-neutral-600 hover:text-neutral-800"
        >
          ← На главную
        </Link>
        <h1 className="text-xl font-medium text-neutral-800">
          Лабораторная 1
        </h1>
      </header>

      <div className="space-y-2">
        {lab1Config.tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-lg border border-neutral-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => {
                const nextId = openTaskId === task.id ? null : (task.id as TaskId);
                if (nextId !== openTaskId) {
                  setText("");
                  setKey("");
                  setResult("");
                  setError("");
                  setAction(null);
                }
                setOpenTaskId(nextId);
              }}
              className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-neutral-800 hover:bg-neutral-50"
            >
              {task.title}
              <span className="text-neutral-400">
                {openTaskId === task.id ? "▼" : "▶"}
              </span>
            </button>
            {openTaskId === task.id && (
              <div className="border-t border-neutral-200 px-4 py-4">
                <p className="mb-3 text-sm text-neutral-600">
                  {task.formulation}
                </p>
                <p className="mb-4 text-xs text-neutral-500">
                  {task.inputHint}
                </p>

                {task.id === "grille" && (
                  <div className="mb-4">
                    <p className="mb-1 text-sm text-neutral-600">
                      Решётка 4×4 (методичка): X — отверстие
                    </p>
                    <div className="inline-block border border-neutral-300 font-mono text-sm">
                      {grilleConfig.matrixInitial.map((row, r) => (
                        <div key={r} className="flex">
                          {row.map((hole, c) => (
                            <span
                              key={c}
                              className="flex h-8 w-8 items-center justify-center border border-neutral-200"
                            >
                              {hole ? "X" : "—"}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
                  >
                    Загрузить из файла
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    onChange={(e) => handleFileChange(e, task.id as TaskId)}
                    className="hidden"
                    aria-hidden
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-1 block text-sm text-neutral-600">
                    Текст
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setError("");
                    }}
                    rows={4}
                    className="w-full rounded border border-neutral-300 px-3 py-2 font-mono text-sm"
                    placeholder={
                      task.language === "en"
                        ? "Только латиница A–Z"
                        : "Только кириллица А–Я"
                    }
                  />
                </div>

                {task.id === "vigenere" && (
                  <div className="mb-4">
                    <label className="mb-1 block text-sm text-neutral-600">
                      Ключ
                    </label>
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        setKey(e.target.value);
                        setError("");
                      }}
                      className="w-full rounded border border-neutral-300 px-3 py-2 font-mono text-sm"
                      placeholder="Только русские буквы"
                    />
                  </div>
                )}

                {error && (
                  <p className="mb-3 text-sm text-red-600">{error}</p>
                )}

                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => runCrypto(task.id as TaskId, "encrypt")}
                    className="rounded border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm hover:bg-neutral-100"
                  >
                    {uiConfig.buttons.encrypt}
                  </button>
                  <button
                    type="button"
                    onClick={() => runCrypto(task.id as TaskId, "decrypt")}
                    className="rounded border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm hover:bg-neutral-100"
                  >
                    {uiConfig.buttons.decrypt}
                  </button>
                  {result && (
                    <button
                      type="button"
                      onClick={downloadResult}
                      className="rounded border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm hover:bg-neutral-100"
                    >
                      {uiConfig.buttons.download}
                    </button>
                  )}
                </div>

                {result && (
                  <div className="mb-4">
                    <label className="mb-1 block text-sm text-neutral-600">
                      Результат
                    </label>
                    <textarea
                      readOnly
                      value={result}
                      rows={4}
                      className="w-full rounded border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm"
                    />
                  </div>
                )}

                {task.id === "grille" && (
                  <GrilleDemo
                    plaintext={action === "encrypt" ? text : undefined}
                    ciphertext={action === "decrypt" ? text : undefined}
                    mode={action === "decrypt" ? "decrypt" : "encrypt"}
                  />
                )}
                {task.id === "vigenere" && (
                  <VigenereDemo
                    plaintext={action === "encrypt" ? text : undefined}
                    ciphertext={action === "decrypt" ? text : undefined}
                    cryptoKey={key}
                    mode={action === "decrypt" ? "decrypt" : "encrypt"}
                    alphabet={ALPHABET_RU}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
