# Тихий шум — ДЗ 8

Простой сайт вымышленной музыкальной группы на React и TypeScript.

## Что есть

- Регистрация с повтором пароля.
- Вход и выход через API преподавателя.
- Просмотр и редактирование профиля: имя, инструмент, описание, гонорар.
- Восстановление сессии после обновления страницы.
- Плашка загрузки, сообщения об ошибках и успешном сохранении.
- Адаптивные стили на обычном CSS.
- Деплой на GitHub Pages через GitHub Actions.

## Запуск

Нужен Node.js 22.12 или новее.

```bash
npm ci
npm run dev
```

Проверка TypeScript и сборка:

```bash
npm run build
```

## Структура

- `src/App.tsx` — страницы, формы и состояние приложения.
- `src/api.ts` — запросы к API и обработка ошибок.
- `src/types.ts` — типы данных пользователя и профиля.
- `src/style.css` — все стили.
- `.github/workflows/deploy.yml` — сборка и публикация.

## API

[Swagger преподавателя](https://inai-col2.fishrungames.com/api/docs/)

Базовый адрес: `https://inai-col2.fishrungames.com/api`.

Используются `POST /register/`, `POST /login/`, `POST /logout/`,
`GET /profile/`, `PATCH /profile/`, `GET /specializations/`.

Сессия хранится в cookie сервера, запросы используют `credentials: 'include'`.
Пароль не сохраняется в localStorage. После регистрации нужно войти.
Если браузер блокирует сторонние cookie, он может не сохранить сессию API.
В таком случае для работы личного кабинета потребуется разрешить cookie
сервера `inai-col2.fishrungames.com` в настройках браузера.

## GitHub Pages

Workflow запускается при push в `main` и вручную из вкладки Actions.
В настройках репозитория: **Settings → Pages → Source → GitHub Actions**.
Относительный `base` в Vite позволяет загружать ресурсы в подпапке репозитория.
Переключение страниц сделано через React state, поэтому серверный роутинг не нужен.
