type ErrorPayload = {
  statusCode?: number;
  message?: string;
  data?: {
    statusCode?: number;
    statusMessage?: string;
  };
};

const MESSAGE_MAP: Record<string, string> = {
  Unauthorized: "Сначала войдите в систему.",
  Forbidden: "Нет доступа к выбранному проекту.",
  "Invalid credentials": "Неверный email или пароль.",
  "Email already exists": "Этот email уже зарегистрирован.",
  "Missing required fields": "Заполните все поля.",
  "Invalid email": "Некорректный email.",
  "Password must be at least 8 characters":
    "Пароль должен быть не короче 8 символов.",
  "Missing projectId": "Не указан проект.",
  "Missing id": "Не хватает данных для запроса.",
  "Task not found": "Задача не найдена.",
  "Project not found": "Проект не найден.",
  "User not found": "Пользователь не найден.",
  "Method Not Allowed": "Недопустимый метод запроса.",
};

const hasCyrillic = (value: string) => /[А-Яа-яЁё]/.test(value);

export const humanizeError = (err: unknown, fallback: string) => {
  if (typeof err === "string") {
    if (hasCyrillic(err)) return err;
    return MESSAGE_MAP[err] || fallback;
  }

  const typed = err as ErrorPayload;
  const message =
    typed?.data?.statusMessage || typed?.message || typed?.data?.statusCode;

  const status = typed?.data?.statusCode ?? typed?.statusCode;
  if (status === 401) return MESSAGE_MAP.Unauthorized;
  if (status === 403) return "Нет доступа к выбранному проекту.";

  const messageText = typeof message === "string" ? message : "";
  if (messageText) {
    if (hasCyrillic(messageText)) return messageText;
    if (MESSAGE_MAP[messageText]) return MESSAGE_MAP[messageText];
  }

  return fallback;
};
