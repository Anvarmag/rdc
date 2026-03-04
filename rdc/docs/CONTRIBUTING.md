# Руководство для разработчиков

Добро пожаловать! Это руководство поможет вам начать работу над проектом РДЦ.

## 🏗️ Структура проекта

```text
rdc-website/
├── src/                    # Исходники
│   ├── index.html          # Главная страница
│   ├── css/                # Стили
│   ├── js/                 # JavaScript (modules, i18n, data)
│   ├── images/             # Изображения
│   └── fonts/              # Шрифты
├── dist/                   # Сгенерированный сайт (результат build.py)
├── docs/                   # Документация проекта
├── build.py                # Генератор сайта
├── README.md               # Главная документация
└── .cursorrules            # Правила ИИ
```

## 🚀 Начало работы

### Требования

- Современный веб-браузер (Chrome, Firefox, Safari, Edge)
- Веб-сервер для локальной разработки (Live Server, Python, Node.js)
- Редактор кода (VS Code рекомендуется)

### Запуск проекта

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-org/rdc-website.git
cd rdc-website
```

2. Запустите локальный сервер.
Так как сайт теперь генерируется статически в папку `dist/`, вам нужно:

**Python (рекомендуется):**
```bash
python3 build.py  # Сначала генерируем файлы
cd dist           # Переходим в сгенерированную папку
python3 -m http.server 8000
```
*Примечание: Если вы изменили тексты в `src/js/i18n/translations.js` или `src/index.html`, запустите `python3 build.py` снова (из корневой папки), чтобы обновить `dist/`!*

**VS Code с Live Server:**
- Установите расширение "Live Server"
- Откройте `dist/index.html`
- Нажмите "Go Live" в статус-баре

3. Откройте в браузере: `http://localhost:8000`

## 📝 Соглашения по коду

### HTML

- Используйте семантические теги (`<header>`, `<main>`, `<section>`, `<article>`)
- Добавляйте атрибуты `alt` для всех изображений
- Используйте `aria-label` для доступности
- Отступы: 2 пробела

### CSS

- Следуйте методологии BEM для пользовательских классов
- Используйте CSS-переменные из `variables.css`
- Группируйте свойства по категориям (позиционирование, размеры, отступы, цвета)
- Tailwind CSS используется как основной инструмент

### JavaScript

- Используйте `'use strict'` в начале модулей
- Модульная архитектура (IIFE паттерн)
- Комментируйте публичный API
- Используйте JSDoc для документации функций

```javascript
/**
 * Описание функции
 * @param {string} param - Описание параметра
 * @returns {Object} Описание возвращаемого значения
 */
function exampleFunction(param) {
  // ...
}
```

## 🎨 Дизайн-система

### Цвета

Основные цвета определены в `css/variables.css`:

- **Primary (Blue):** `--color-primary-600` (#2563eb)
- **Secondary (Cyan):** `--color-secondary-500` (#06b6d4)
- **Success (Emerald):** `--color-success-500` (#10b981)
- **Neutral (Slate):** от `--color-neutral-50` до `--color-neutral-900`

### Типографика

- **Шрифт:** Inter (Google Fonts)
- **Размеры:** от `--font-size-xs` (12px) до `--font-size-6xl` (60px)

### Компоненты

Переиспользуемые компоненты в `css/components.css`:
- `.btn`, `.btn-primary`, `.btn-secondary`
- `.card`, `.card-body`, `.card-hover`
- `.badge`, `.badge-primary`
- `.section`, `.section-header`, `.section-title`

## 🔄 Процесс разработки

1. Создайте ветку от `main`:
```bash
git checkout -b feature/название-функции
```

2. Внесите изменения и закоммитьте:
```bash
git add .
git commit -m "feat: добавлена новая функция"
```

3. Создайте Pull Request

### Именование коммитов

Используйте формат Conventional Commits:
- `feat:` новая функциональность
- `fix:` исправление бага
- `docs:` изменения в документации
- `style:` форматирование кода
- `refactor:` рефакторинг без изменения поведения
- `test:` добавление тестов
- `chore:` служебные изменения

## 📞 Контакты

По вопросам разработки обращайтесь:
- Email: dev@rdc-rt.ru
- Telegram: @rdc_dev

---

Спасибо за вклад в развитие проекта! 🙏
