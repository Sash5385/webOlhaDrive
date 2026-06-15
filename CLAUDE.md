# CLAUDE.md — webOlhaDrive (Admin)

## Workflow

Зміни спочатку в `webid4` / `webid4client`, потім портуються сюди.
GitHub акаунт: `sash5385`

## Стек

- React + Vite + JSX (не TypeScript, не Next.js)
- Firebase Realtime Database
- Firebase Hosting (проєкт: `olhadrive-booking`)
- Теми: dark / light(coffee) — `ThemeContext` в `src/theme.js`

## Хости

| Репо | Firebase URL | Домен |
|------|-------------|-------|
| webOlhaDrive | olhadrive-admin.web.app | admin.olhadrive.kiev.ua |
| webOlhaDriveClient | olhadrive-app.web.app | — |

## Деплой

SA ключ: `/home/user/olhadrive-sa.json` (завантажується з Firebase Console на початку сесії)

```bash
# webOlhaDrive
cd /home/user/webOlhaDrive
GOOGLE_APPLICATION_CREDENTIALS=/home/user/olhadrive-sa.json npm run build
GOOGLE_APPLICATION_CREDENTIALS=/home/user/olhadrive-sa.json firebase deploy --only hosting

# webOlhaDriveClient
cd /home/user/webOlhaDriveClient
GOOGLE_APPLICATION_CREDENTIALS=/home/user/olhadrive-sa.json npm run build
GOOGLE_APPLICATION_CREDENTIALS=/home/user/olhadrive-sa.json firebase deploy --only hosting
```

## Правила

- Мінімальні зміни — не переписувати робочий код без причини
- Не змінювати UI без прямого запиту (кольори, відступи, структура)
- Не виконувати без підтвердження: `rm -rf`, `git reset --hard`, `git push --force`
- Перед змінами Firebase структури — показати що зміниться

## Стиль відповідей

- Мінімум тексту: що зроблено + файл/рядок, без пояснень якщо не питали
- Після кожного повідомлення виводити **Повідомлення #N**
- Після 30 повідомлень — запропонувати новий чат з підсумками
