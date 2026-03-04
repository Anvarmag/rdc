# Инструкция по размещению сайта на хостинге

## Быстрый старт

```bash
# 1. Собрать проект
python3 build.py

# 2. Залить содержимое dist/ на хостинг
```

> [!IMPORTANT]
> На хостинг заливается **только содержимое папки `dist/`**, а не `src/`, `docs/` или весь репозиторий.

---

## Что заливать

После запуска `python3 build.py` в папке `dist/` появятся готовые файлы:

```
dist/
├── index.html            ← Главная страница (RU)
├── index-en.html         ← Главная (EN)
├── index-tt.html         ← Главная (TT)
├── accessible.html       ← Версия для слабовидящих (RU)
├── accessible-en.html    ← (EN)
├── accessible-tt.html    ← (TT)
├── 404.html              ← Страница ошибки (RU)
├── 404-en.html           ← (EN)
├── 404-tt.html           ← (TT)
├── css/                  ← Стили
├── js/                   ← Скрипты
├── fonts/                ← Шрифты Inter
├── images/               ← Изображения
├── documents/            ← PDF-документы
├── robots.txt            ← Инструкции для поисковиков
└── sitemap.xml           ← Карта сайта
```

**Всё содержимое `dist/` → в корень сайта (`public_html/` или `www/`).**

---

## Способы заливки

### Вариант 1: FTP / SFTP (классический хостинг)

Через терминал:
```bash
scp -r dist/* user@server:/path/to/public_html/
```

Или через FTP-клиент (FileZilla, Cyberduck):
1. Подключиться к серверу
2. Перейти в `public_html/` (или `www/`, `htdocs/`)
3. Загрузить всё содержимое `dist/`

### Вариант 2: Панель управления хостинга

1. Открыть файловый менеджер в панели управления
2. Перейти в корневую папку сайта
3. Загрузить все файлы и папки из `dist/`

### Вариант 3: GitHub Pages

1. Создать репозиторий на GitHub
2. В настройках → Pages → Source: выбрать ветку и папку `/dist`
3. Или использовать GitHub Actions для автосборки

### Вариант 4: Netlify / Vercel

1. Подключить Git-репозиторий
2. Build command: `python3 build.py`
3. Publish directory: `dist`

---

## Настройка сервера

### Кастомная страница 404

**Apache** (файл `.htaccess` в корне сайта):
```apache
ErrorDocument 404 /404.html
```

**Nginx** (в конфиге сервера):
```nginx
server {
    ...
    error_page 404 /404.html;
}
```

### Сжатие (gzip)

**Apache** (`.htaccess`):
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

**Nginx:**
```nginx
gzip on;
gzip_types text/html text/css application/javascript;
```

### Кеширование статических файлов

**Apache** (`.htaccess`):
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>
```

---

## Процесс обновления

При любых изменениях в исходниках (`src/`):

```bash
# 1. Внести изменения в файлы src/
# 2. Пересобрать проект
python3 build.py

# 3. Залить обновлённый dist/ на хостинг
```

---

## Чего НЕ заливать на хостинг

| Файл/папка | Причина |
|---|---|
| `src/` | Исходники, не для продакшена |
| `docs/` | Документация для разработчиков |
| `build.py` | Скрипт сборки |
| `.git/` | Система контроля версий |
| `.gitignore` | Конфигурация Git |
| `__pycache__/` | Кеш Python |
| `README.md` | Документация репозитория |
| `LICENSE` | Файл лицензии |

---

## Проверка после деплоя

1. ✅ Открыть главную страницу — `https://ваш-домен.ru/`
2. ✅ Переключить язык на EN и TT
3. ✅ Проверить ссылки на документы в футере
4. ✅ Открыть несуществующую страницу — должна появиться 404
5. ✅ Проверить версию для слабовидящих
6. ✅ Проверить мобильную версию
