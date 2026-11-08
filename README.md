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

[Swagger преподавателя](https://inai-col3.fishrungames.com/api/docs/)

Базовый адрес: `https://inai-col3.fishrungames.com/api`.

Используются `POST /register/`, `POST /login/`, `POST /logout/`, `POST /token/refresh/`, `GET /profile/`, `PATCH /profile/`, `GET /specializations/`.

Access-токен хранится только в памяти приложения и передаётся в заголовке `Authorization: Bearer`. Refresh-токен сервер выставляет в HttpOnly cookie; JavaScript не читает и не сохраняет его. Запросы отправляются с `credentials: 'include'`. При ответе 401 приложение один раз запрашивает новый access-токен через `POST /token/refresh/` и повторяет запрос. После обновления страницы access-токен восстанавливается через refresh cookie. Пароль и токены не сохраняются в localStorage.

## GitHub Pages

Workflow запускается при push в `main` и вручную из вкладки Actions.
В настройках репозитория: **Settings → Pages → Source → GitHub Actions**.
Относительный `base` в Vite позволяет загружать ресурсы в подпапке репозитория.
Переключение страниц сделано через React state, поэтому серверный роутинг не нужен.


