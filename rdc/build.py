"""
==========================================================================
build.py — Статический генератор мультиязычного сайта РДЦ
==========================================================================

Этот скрипт превращает исходные HTML-файлы (src/index.html, src/accessible.html)
в готовые к деплою статические страницы для каждого языка (RU, EN, TT).

Процесс работы:
  1. Читает словари переводов из src/js/i18n/translations.js
  2. Для каждого HTML-файла создаёт 3 версии (RU, EN, TT)
  3. Заменяет текст в тегах с атрибутом data-i18n="ключ" на переведённый
  4. Генерирует языковой переключатель с правильными ссылками
  5. Копирует все ассеты (CSS, JS, шрифты, картинки) в папку dist/

Запуск: python3 build.py
Результат: готовые файлы в папке dist/
==========================================================================
"""

# --- Импорт стандартных библиотек Python ---
import json       # Импорт модуля для работы с JSON (не используется напрямую, оставлен для совместимости)
import os         # Импорт модуля для работы с файловой системой (пути, проверка существования файлов)
import re         # Импорт модуля для работы с регулярными выражениями (парсинг HTML и переводов)
import shutil     # Импорт модуля для копирования файлов и директорий


# ==========================================================================
# КОНФИГУРАЦИЯ ПУТЕЙ
# ==========================================================================

SOURCE_DIR = "src"                                                    # Папка с исходными файлами (HTML, CSS, JS, картинки)
DIST_DIR = "dist"                                                     # Папка для готовых к деплою файлов (генерируется скриптом)
TRANSLATIONS_FILE = os.path.join(SOURCE_DIR, "js/i18n/translations.js")  # Путь к файлу с переводами на все языки


# ==========================================================================
# ФУНКЦИЯ: Загрузка переводов из translations.js
# ==========================================================================

def load_translations():
    """
    Парсит файл translations.js и извлекает словари переводов для каждого языка.

    Файл translations.js содержит объект TRANSLATIONS с тремя вложенными словарями:
    ru: { ключ: "текст на русском", ... },
    en: { ключ: "english text", ... },
    tt: { ключ: "татарча текст", ... }

    Возвращает:
        dict: Словарь вида {"en": {...}, "tt": {...}, "ru": {...}}
              Каждый вложенный словарь содержит пары ключ-значение переводов.
    """
    # Инициализируем пустые словари для каждого языка
    translations = {"en": {}, "tt": {}, "ru": {}}

    # Проверяем, существует ли файл переводов
    if not os.path.exists(TRANSLATIONS_FILE):
        print(f"Warning: {TRANSLATIONS_FILE} not found!")  # Предупреждение, если файл не найден
        return translations  # Возвращаем пустые словари

    try:
        # Открываем и читаем файл переводов целиком в строку
        with open(TRANSLATIONS_FILE, "r", encoding="utf-8") as f:
            content = f.read()  # Весь контент файла как строка

        # --- Парсер на основе regex (вместо полноценного JS-парсера) ---
        # Проходим по каждому языку и ищем его блок в файле
        for lang in ["en", "tt", "ru"]:
            # Ищем начало блока языка, например: en: { или "en": {
            match = re.search(r'[\'\"]?' + lang + r'[\'\"]?\s*:\s*\{', content)
            if match:
                start_idx = match.start()  # Позиция начала блока языка

                # --- Поиск закрывающей фигурной скобки } для этого блока ---
                brace_count = 0            # Счётчик вложенности фигурных скобок
                idx = match.end() - 1      # Указатель на открывающую скобку '{'
                in_string = False           # Флаг: находимся ли мы внутри строки (чтобы игнорировать скобки в строках)
                string_char = ''            # Символ, которым открыта текущая строка (' или ")

                # Посимвольно проходим контент, отслеживая глубину вложенности
                while idx < len(content):
                    c = content[idx]  # Текущий символ

                    # Обработка начала и конца строковых литералов
                    if c in ["'", '"']:
                        if not in_string:
                            in_string = True        # Входим в строку
                            string_char = c         # Запоминаем символ кавычки
                        elif string_char == c and content[idx-1] != '\\':
                            in_string = False       # Выходим из строки (если кавычка не экранирована)
                    elif not in_string:
                        # Считаем только скобки вне строк
                        if c == '{':
                            brace_count += 1        # Открывающая скобка — увеличиваем счётчик
                        elif c == '}':
                            brace_count -= 1        # Закрывающая скобка — уменьшаем счётчик
                            if brace_count == 0:
                                break               # Нашли парную закрывающую скобку — конец блока
                    idx += 1  # Переходим к следующему символу

                # Вырезаем весь блок языка (от "en: {" до "}")
                block = content[start_idx:idx+1]

                # Извлекаем все пары ключ-значение из блока языка
                # Паттерн ищет: ключ: "значение" или ключ: 'значение'
                pairs = re.findall(r'[\'\"]?([a-zA-Z0-9_]+)[\'\"]?\s*:\s*([\'\"])(.*?)\2', block)

                # Сохраняем каждую пару в словарь переводов
                for p in pairs:
                    translations[lang][p[0]] = p[2]  # p[0] = ключ, p[2] = значение перевода

    except Exception as e:
        print(f"Error parsing translations: {e}")  # Ловим любые ошибки парсинга

    return translations  # Возвращаем заполненные словари


# ==========================================================================
# ФУНКЦИЯ: Замена переключателя языков на статические ссылки
# ==========================================================================

def replace_lang_switcher(html_content, target_lang, base_name):
    """
    Заменяет языковой переключатель (десктоп + мобильный) в HTML-коде
    на статические <a> ссылки с правильными href и подсветкой активного языка.

    Параметры:
        html_content (str): Исходный HTML-код страницы
        target_lang (str): Целевой язык ('ru', 'en', 'tt') — будет подсвечен как активный
        base_name (str): Базовое имя файла без расширения ('index' или 'accessible')

    Возвращает:
        str: HTML-код с обновлённым переключателем языков
    """

    # --- Вспомогательная функция: генерация URL для языковой версии ---
    def get_href(lang, base):
        """Генерирует имя файла для указанного языка."""
        if lang == 'ru':
            # Русская версия — основной файл (index.html или accessible.html)
            return f"{base}.html" if base != 'index' else 'index.html'
        else:
            # Другие языки — суффикс в имени файла (index-en.html, index-tt.html)
            return f"{base}-{lang}.html"

    # --- Генератор кнопки-ссылки для ДЕСКТОПНОГО переключателя ---
    def create_pill(lang_code, label, is_active, base):
        """
        Создаёт HTML-ссылку для одного языка в десктопном переключателе.

        Параметры:
            lang_code (str): Код языка ('ru', 'en', 'tt')
            label (str): Отображаемое название ('Русский', 'Татарча', 'English')
            is_active (bool): Является ли этот язык текущим (подсвечивается синим)
            base (str): Базовое имя файла
        """
        href = get_href(lang_code, base)  # URL для ссылки
        base_classes = "px-2 py-1 rounded text-sm font-bold transition-all"  # Общие Tailwind-классы
        # Активный язык — синий фон, остальные — серый
        colors = "bg-blue-600 text-white" if is_active else "bg-slate-100 hover:bg-slate-200 text-slate-700"
        # Для РУ показываем короткую метку "RU", для остальных — полное название
        ru_label = "RU" if lang_code == 'ru' else label
        # Собираем итоговый HTML-тег ссылки
        return f'<a href="{href}" class="{base_classes} {colors}" title="{label}">{ru_label}</a>'

    # --- Замена ДЕСКТОПНОГО переключателя ---
    # Regex ищет div с тремя ссылками RU/TT/EN внутри контейнера с классом "flex items-center gap-2"
    desktop_pattern = r'(<div class="flex items-center gap-2">\s*)<a.*?RU</a>\s*<a.*?TT</a>\s*<a.*?EN</a>(\s*</div>)'

    # Генерируем три новые кнопки-ссылки с правильной подсветкой
    desktop_ru = create_pill('ru', 'Русский', target_lang == 'ru', base_name)   # Кнопка RU
    desktop_tt = create_pill('tt', 'Татарча', target_lang == 'tt', base_name)   # Кнопка TT
    desktop_en = create_pill('en', 'English', target_lang == 'en', base_name)   # Кнопка EN

    # Формируем строку замены (\\1 и \\2 — захваченные группы: div-обёртка)
    desktop_replacement = f'\\1{desktop_ru}\n            {desktop_tt}\n            {desktop_en}\\2'
    # Выполняем замену в HTML (DOTALL — точка совпадает с переносом строки)
    html_content = re.sub(desktop_pattern, desktop_replacement, html_content, flags=re.DOTALL)

    # --- Генератор кнопки-ссылки для МОБИЛЬНОГО переключателя ---
    def create_mobile_pill(lang_code, label, is_active, base):
        """Аналогично create_pill, но с мобильными Tailwind-классами (крупнее, с rounded-xl)."""
        href = get_href(lang_code, base)  # URL для ссылки
        base_classes = "px-4 py-2 rounded-xl text-sm font-bold transition-all"  # Мобильные Tailwind-классы
        colors = "bg-blue-600 text-white" if is_active else "bg-slate-100 hover:bg-slate-200 text-slate-700"
        ru_label = "RU" if lang_code == 'ru' else label  # Короткие метки для мобильного
        return f'<a href="{href}" class="{base_classes} {colors}">{ru_label}</a>'

    # --- Замена МОБИЛЬНОГО переключателя ---
    # Regex ищет div с классом "flex justify-center gap-3 pt-2" (мобильное меню)
    mobile_pattern = r'(<div class="flex justify-center gap-3 pt-2">\s*)<a.*?RU</a>\s*<a.*?TT</a>\s*<a.*?EN</a>(\s*</div>)'

    # Генерируем мобильные кнопки (короткие метки RU/TT/EN)
    mob_ru = create_mobile_pill('ru', 'RU', target_lang == 'ru', base_name)  # Мобильная кнопка RU
    mob_tt = create_mobile_pill('tt', 'TT', target_lang == 'tt', base_name)  # Мобильная кнопка TT
    mob_en = create_mobile_pill('en', 'EN', target_lang == 'en', base_name)  # Мобильная кнопка EN

    # Формируем замену и выполняем
    mobile_replacement = f'\\1{mob_ru}\n        {mob_tt}\n        {mob_en}\\2'
    html_content = re.sub(mobile_pattern, mobile_replacement, html_content, flags=re.DOTALL)

    # --- Замена переключателя на СТРАНИЦАХ ДЛЯ СЛАБОВИДЯЩИХ и 404 ---
    # На этих страницах переключатель был реализован через <button data-lang-switch>, а не <a>
    button_pattern = r'<button data-lang-switch([^>]*)>.*?</button>'

    def replacement_button(match):
        """Заменяет <button data-lang-switch> на набор статических <a> ссылок."""
        attrs = match.group(1)  # Атрибуты оригинальной кнопки
        is_404 = "inline-flex" in attrs  # Определяем тип страницы по классам
        wrapper_class = "flex gap-2"  # CSS-класс обёртки

        # Разные стили кнопок для 404 и accessible страниц
        btn_class = "px-4 py-3 rounded-xl font-semibold transition-all inline-flex items-center justify-center" if is_404 else "btn btn-light px-3"

        def create_btn_pill(lang_code, label, is_active):
            """Генерирует одну кнопку-ссылку для accessible/404 страниц."""
            href = get_href(lang_code, base_name)  # URL целевой страницы
            # Цвета: активный — синий, неактивный — серый или без дополнительных классов
            colors = "bg-blue-600 text-white" if is_active else ("bg-slate-100 text-slate-700 hover:bg-slate-200" if is_404 else "")
            ru_label = "RU" if lang_code == 'ru' else label  # Текст кнопки

            # Объединяем базовые классы и цвета
            final_class = f"{btn_class} {colors}"
            return f'<a href="{href}" class="{final_class}">{ru_label}</a>'

        # Генерируем три кнопки
        btn_ru = create_btn_pill('ru', 'RU', target_lang == 'ru')  # Кнопка RU
        btn_tt = create_btn_pill('tt', 'TT', target_lang == 'tt')  # Кнопка TT
        btn_en = create_btn_pill('en', 'EN', target_lang == 'en')  # Кнопка EN

        # Возвращаем div с тремя ссылками вместо одной кнопки
        return f'<div class="{wrapper_class}">\n  {btn_ru}\n  {btn_tt}\n  {btn_en}\n</div>'

    # Заменяем все кнопки data-lang-switch на ссылки
    html_content = re.sub(button_pattern, replacement_button, html_content, flags=re.DOTALL)

    return html_content  # Возвращаем HTML с обновлённым переключателем


# ==========================================================================
# ФУНКЦИЯ: Генерация HTML для конкретного языка
# ==========================================================================

def generate_html(lang, translations, source_html_path, base_name):
    """
    Читает исходный HTML-файл, подставляет переводы для указанного языка
    и возвращает готовый HTML-код.

    Процесс (порядок шагов критически важен!):
      Step 1: Замена переключателя языков (ДО замены data-i18n, чтобы regex совпал)
      Step 2: Замена текстового содержимого тегов с data-i18n="ключ"
      Step 3: Замена placeholder в input/textarea с data-i18n-placeholder="ключ"
      Step 4: Замена title и aria-label с data-i18n-title="ключ"

    Параметры:
        lang (str): Целевой язык ('ru', 'en', 'tt')
        translations (dict): Словари переводов всех языков
        source_html_path (str): Путь к исходному HTML-файлу
        base_name (str): Базовое имя файла ('index', 'accessible')

    Возвращает:
        str: Готовый HTML-код с подставленными переводами
    """
    # Читаем исходный HTML-файл целиком
    with open(source_html_path, "r", encoding="utf-8") as f:
        html = f.read()

    # ── Step 1: Замена языкового переключателя ──
    # ВАЖНО: Выполняется ПЕРВЫМ, потому что regex ищет текст "RU</a>",
    # который будет перезаписан в Step 2, если выполнить его раньше
    html = replace_lang_switcher(html, lang, base_name)

    # ── Step 2: Замена текстового содержимого тегов с data-i18n ──
    def replace_tag_content(match):
        """
        Callback для regex: заменяет содержимое тега на перевод.

        Пример: <h1 data-i18n="hero_title">Русский текст</h1>
        Для EN станет: <h1>Radiological Data Center</h1>
        """
        start_tag = match.group(1)    # Открывающий тег до data-i18n (например: '<h1 class="..."')
        key = match.group(2)          # Ключ перевода из data-i18n (например: 'hero_title')
        end_tag_start = match.group(3)  # Остаток открывающего тега после data-i18n (например: '>')
        old_content = match.group(4)  # Текущее содержимое тега (русский текст по умолчанию)
        close_tag = match.group(5)    # Закрывающий тег (например: '</h1>')

        # Ищем перевод для данного ключа в словаре целевого языка
        translation = translations[lang].get(key)
        # Очищаем перевод от лишних пробелов
        if hasattr(translation, 'strip'):
            translation = translation.strip()

        # Если перевода нет — используем русский текст как fallback
        if not translation:
             translation = translations['ru'].get(key, old_content)

        # Для не-русских версий удаляем атрибут data-i18n (он не нужен в статике)
        if lang != 'ru':
             start_tag = re.sub(r'\s*data-i18n="[^"]+"', '', start_tag)

        # Собираем тег обратно с новым содержимым
        return f"{start_tag}{end_tag_start}{translation}{close_tag}"

    # Regex-паттерн для поиска тегов с data-i18n
    # Группы: (1)начало тега, (2)ключ, (3)конец открывающего тега, (4)содержимое, (5)закрывающий тег
    pattern = r'(<[a-zA-Z0-9_-]+[^>]*?)\bdata-i18n="([^"]+)"([^>]*>)(.*?)(</[a-zA-Z0-9_-]+>)'
    html = re.sub(pattern, replace_tag_content, html, flags=re.DOTALL)

    # ── Step 3: Замена placeholder в input и textarea ──
    def replace_placeholder(match):
        """
        Callback для regex: заменяет placeholder в полях ввода на переведённый.

        Пример: <input data-i18n-placeholder="form_name" placeholder="Ваше имя">
        Для EN станет: <input placeholder="Your name">
        """
        tag_content = match.group(0)  # Полный текст тега <input ... > или <textarea ... >

        # Ищем атрибут data-i18n-placeholder="ключ"
        key_match = re.search(r'data-i18n-placeholder="([^"]+)"', tag_content)
        if key_match:
            key = key_match.group(1)  # Ключ перевода
            # Получаем перевод или fallback на русский
            translation = translations[lang].get(key)
            if not translation:
                 translation = translations['ru'].get(key, "")

            if translation:
                # Обновляем или добавляем атрибут placeholder
                if 'placeholder="' in tag_content:
                    # Заменяем существующий placeholder
                    tag_content = re.sub(r'placeholder="[^"]*"', f'placeholder="{translation}"', tag_content)
                else:
                    # Добавляем placeholder к самозакрывающемуся тегу (<input />)
                    tag_content = tag_content.replace('/>', f' placeholder="{translation}"/>')
                    # Или к обычному тегу (<textarea>)
                    if '/>' not in tag_content:
                        tag_content = tag_content.replace('>', f' placeholder="{translation}">')

                # Удаляем data-i18n-placeholder для не-русских версий (для чистоты кода)
                if lang != 'ru':
                    tag_content = re.sub(r'\s*data-i18n-placeholder="[^"]+"', '', tag_content)

        return tag_content

    # Ищем все теги <input> и <textarea> в HTML
    html = re.sub(r'<input[^>]+>|<textarea[^>]+>', replace_placeholder, html)

    # ── Step 4: Замена title и aria-label ──
    def replace_title_attr(match):
        """
        Callback для regex: заменяет атрибут title на переведённый.

        Пример: <button data-i18n-title="close_btn" title="Закрыть">
        Для EN станет: <button title="Close">
        """
        tag_content = match.group(0)  # Полный текст открывающего тега

        # Ищем атрибут data-i18n-title="ключ"
        key_match = re.search(r'data-i18n-title="([^"]+)"', tag_content)
        if key_match:
            key = key_match.group(1)  # Ключ перевода
            translation = translations[lang].get(key)
            if not translation:
                 translation = translations['ru'].get(key, "")

            if translation:
                 # Обновляем или добавляем атрибут title
                 if 'title="' in tag_content:
                     tag_content = re.sub(r'title="[^"]*"', f'title="{translation}"', tag_content)
                 else:
                     tag_content = tag_content.replace('>', f' title="{translation}">')

                 # Удаляем data-i18n-title для не-русских версий
                 if lang != 'ru':
                     tag_content = re.sub(r'\s*data-i18n-title="[^"]+"', '', tag_content)
        return tag_content

    # Ищем теги <button>, <a>, <span> (они чаще всего имеют title)
    html = re.sub(r'<button[^>]+>|<a[^>]+>|<span[^>]+>', replace_title_attr, html)

    # ── Step 5: Замена <title> и <meta> тегов для SEO ──
    # Заменяем <title> на переведённый текст из ключа page_title
    page_title = translations[lang].get('page_title')
    if page_title:
        html = re.sub(r'<title>[^<]+</title>', lambda m: f'<title>{page_title}</title>', html)

    # Заменяем meta description
    meta_desc = translations[lang].get('meta_description')
    if meta_desc:
        html = re.sub(
            r'(<meta\s+name="description"\s+content=")[^"]*(")',
            lambda m: m.group(1) + meta_desc + m.group(2),
            html
        )

    # Заменяем og:title
    if page_title:
        html = re.sub(
            r'(<meta\s+property="og:title"\s+content=")[^"]*(")',
            lambda m: m.group(1) + page_title + m.group(2),
            html
        )

    # Заменяем og:description
    if meta_desc:
        html = re.sub(
            r'(<meta\s+property="og:description"\s+content=")[^"]*(")',
            lambda m: m.group(1) + meta_desc + m.group(2),
            html
        )

    # Заменяем og:site_name
    if page_title:
        html = re.sub(
            r'(<meta\s+property="og:site_name"\s+content=")[^"]*(")',
            lambda m: m.group(1) + page_title + m.group(2),
            html
        )

    # Заменяем twitter:title
    if page_title:
        html = re.sub(
            r'(<meta\s+name="twitter:title"\s+content=")[^"]*(")',
            lambda m: m.group(1) + page_title + m.group(2),
            html
        )

    # Заменяем twitter:description
    if meta_desc:
        html = re.sub(
            r'(<meta\s+name="twitter:description"\s+content=")[^"]*(")',
            lambda m: m.group(1) + meta_desc + m.group(2),
            html
        )

    # Также обновляем aria-label атрибуты для кнопки «Версия для слабовидящих»
    accessible_label = translations[lang].get('accessible_version', 'Версия для слабовидящих')
    html = html.replace('aria-label="Версия для слабовидящих"', f'aria-label="{accessible_label}"')

    # Заменяем og:locale на правильный для языка
    locale_map = {'ru': 'ru_RU', 'en': 'en_US', 'tt': 'tt_RU'}
    target_locale = locale_map.get(lang, 'ru_RU')
    html = re.sub(
        r'(<meta\s+property="og:locale"\s+content=")[^"]*(">)',
        lambda m: m.group(1) + target_locale + m.group(2),
        html
    )

    # Обновляем hreflang ссылки для правильных URL (зависят от base_name)
    # Заменяем index.html/index-en.html на правильные имена для accessible/404
    if base_name != 'index':
        html = html.replace(
            'href="https://rdc-rt.ru/index.html"',
            f'href="https://rdc-rt.ru/{base_name}.html"'
        )
        html = html.replace(
            'href="https://rdc-rt.ru/index-en.html"',
            f'href="https://rdc-rt.ru/{base_name}-en.html"'
        )
        html = html.replace(
            'href="https://rdc-rt.ru/index-tt.html"',
            f'href="https://rdc-rt.ru/{base_name}-tt.html"'
        )

    return html  # Возвращаем финальный HTML с подставленными переводами


# ==========================================================================
# ФУНКЦИЯ: Основной процесс сборки проекта
# ==========================================================================

def build_project():
    """
    Главная функция — запускает полный цикл генерации статического сайта:
      1. Загружает переводы из translations.js
      2. Очищает папку dist/
      3. Копирует все ассеты (CSS, JS, шрифты, картинки) из src/ в dist/
      4. Для каждого HTML-файла генерирует 3 языковые версии (RU, EN, TT)
    """
    print("Starting static generation...")

    # Шаг 1: Загрузка переводов из translations.js
    translations = load_translations()

    # Шаг 2: Очистка папки dist/ (удаление старых файлов)
    if os.path.exists(DIST_DIR):
        print(f"Cleaning {DIST_DIR}/ directory...")
        shutil.rmtree(DIST_DIR)  # Рекурсивно удаляем всю папку dist/
    os.makedirs(DIST_DIR)  # Создаём свежую пустую папку dist/

    # Шаг 3: Копирование статических ассетов из src/ в dist/
    print(f"Copying static assets to {DIST_DIR}/...")

    # Список ассетов для копирования (папки и файлы)
    assets = ["css", "js", "fonts", "images", "documents", "robots.txt", "sitemap.xml"]
    for asset in assets:
        src_path = os.path.join(SOURCE_DIR, asset)  # Путь к ассету в src/
        dst_path = os.path.join(DIST_DIR, asset)    # Путь назначения в dist/
        if os.path.exists(src_path):
            if os.path.isdir(src_path):
                shutil.copytree(src_path, dst_path)  # Копируем папку рекурсивно
            else:
                shutil.copy2(src_path, dst_path)     # Копируем файл (с сохранением метаданных)
        else:
            print(f"Warning: Asset {asset} not found in {SOURCE_DIR}/")  # Предупреждение о пропущенном ассете

    # Шаг 4: Обработка HTML-файлов — генерация языковых версий
    html_files = ["index.html", "accessible.html", "404.html", "doctors.html", "services.html", "service-configurator.html"]  # Исходные мастер-файлы (только на русском)

    for filename in html_files:
        print(f"\nProcessing {filename}...")
        source_path = os.path.join(SOURCE_DIR, filename)  # Полный путь к исходнику

        # Проверяем существование файла
        if not os.path.exists(source_path):
            print(f"Error: {source_path} not found.")
            continue  # Пропускаем, если файл не найден

        # Определяем базовое имя (без .html) для формирования имён языковых версий
        base_name = filename.replace(".html", "")  # "index" или "accessible"

        # --- Генерация РУССКОЙ версии (основной файл, без суффикса) ---
        print("  ru ->", f"{DIST_DIR}/{filename}")
        html_ru = generate_html("ru", translations, source_path, base_name)  # Генерируем HTML
        with open(os.path.join(DIST_DIR, filename), "w", encoding="utf-8") as f:
            f.write(html_ru)  # Записываем в dist/index.html или dist/accessible.html

        # --- Генерация АНГЛИЙСКОЙ и ТАТАРСКОЙ версий (с суффиксами -en, -tt) ---
        for lang in ["en", "tt"]:
            out_name = f"{base_name}-{lang}.html"  # Формируем имя файла (index-en.html)
            print(f"  {lang} ->", f"{DIST_DIR}/{out_name}")
            html_lang = generate_html(lang, translations, source_path, base_name)  # Генерируем HTML
            with open(os.path.join(DIST_DIR, out_name), "w", encoding="utf-8") as f:
                f.write(html_lang)  # Записываем готовый файл

    print("\nStatic build complete! Output is in the 'dist' directory.")


# ==========================================================================
# ТОЧКА ВХОДА: запускается при прямом вызове скрипта (python3 build.py)
# ==========================================================================

if __name__ == "__main__":
    build_project()  # Запускаем основной процесс сборки
