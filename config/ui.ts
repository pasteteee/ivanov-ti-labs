export const uiConfig = {
  buttons: {
    encrypt: "Зашифровать",
    decrypt: "Расшифровать",
    download: "Скачать результат",
    selectFile: "Выбрать файл",
    pasteOrFile: "Текст или файл",
  },
  errors: {
    emptyText: "Введите текст или загрузите файл",
    emptyKey: "Введите ключ",
    invalidLanguageGrille: "Для решётки допускаются только латинские буквы (A–Z)",
    invalidLanguageVigenere: "Для Виженера допускаются только русские буквы (А–Я)",
    invalidKeyVigenere: "Ключ должен содержать только русские буквы",
    fileTooBig: "Файл слишком большой",
    fileType: "Разрешены только файлы .txt",
  },
  maxFileSizeBytes: 2 * 1024 * 1024,
} as const;
