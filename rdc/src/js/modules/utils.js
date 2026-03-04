/**
 * ==========================================================================
 * РДЦ - Радиологический дата-центр
 * ФАЙЛ: modules/utils.js
 * НАЗНАЧЕНИЕ: Вспомогательные утилиты и хелперы
 * ==========================================================================
 * 
 * ЧТО ЭТО ТАКОЕ:
 * Набор полезных функций, которые используются в разных местах сайта.
 * Это "инструментарий" для разработчика.
 * 
 * КАК ИСПОЛЬЗОВАТЬ:
 * Utils.debounce(fn, 300)     - Задержка выполнения функции
 * Utils.isMobile()           - Проверка мобильного устройства
 * Utils.getCurrentYear()     - Получить текущий год
 * Utils.copyToClipboard(text) - Скопировать текст
 * 
 * ==========================================================================
 */

/**
 * Модуль утилит
 * -------------
 * Используется паттерн IIFE (Immediately Invoked Function Expression).
 * Это создает приватное пространство имен и предотвращает
 * загрязнение глобальной области видимости.
 */
const Utils = (function() {
  'use strict';  // Строгий режим JavaScript (помогает избежать ошибок)

  /**
   * ========================================
   * THROTTLE и DEBOUNCE
   * ========================================
   * Функции для оптимизации частых вызовов (скролл, ввод текста).
   */

  /**
   * Debounce (Отложенный вызов)
   * ---------------------------
   * Функция вызовется только после того, как пользователь
   * перестанет выполнять действие на указанное время.
   * 
   * Пример: поиск - запрос отправляется не при каждом нажатии клавиши,
   * а когда пользователь перестал печатать.
   * 
   * @param {Function} func - Функция для выполнения
   * @param {number} wait - Задержка в миллисекундах (по умолчанию 300мс)
   * @returns {Function} - Обернутая функция
   * 
   * Использование:
   * const debouncedSearch = Utils.debounce(search, 500);
   * input.addEventListener('input', debouncedSearch);
   */
  function debounce(func, wait = 300) {
    let timeout;  // Храним ID таймера
    
    return function executedFunction(...args) {
      // Функция, которая выполнится после задержки
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      // Сбрасываем предыдущий таймер и запускаем новый
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle (Ограничение частоты)
   * ------------------------------
   * Функция вызовется не чаще, чем раз в указанный интервал.
   * 
   * Пример: обработка скролла - вместо 100 вызовов в секунду
   * будет только 10 (если limit = 100мс).
   * 
   * @param {Function} func - Функция для выполнения
   * @param {number} limit - Минимальный интервал в мс (по умолчанию 100мс)
   * @returns {Function} - Обернутая функция
   */
  function throttle(func, limit = 100) {
    let inThrottle;  // Флаг: находимся ли мы в периоде ожидания
    
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);  // Выполняем функцию
        inThrottle = true;       // Блокируем повторный вызов
        
        // Снимаем блокировку через указанное время
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * ========================================
   * ФОРМАТИРОВАНИЕ
   * ========================================
   * Функции для форматирования данных.
   */

  /**
   * Форматирование телефонного номера
   * ---------------------------------
   * Превращает "79001234567" в "+7 (900) 123-45-67"
   * 
   * @param {string} phone - Номер телефона (любой формат)
   * @returns {string} - Отформатированный номер
   */
  function formatPhone(phone) {
    // Убираем все нецифровые символы
    const cleaned = phone.replace(/\D/g, '');
    
    // Пытаемся разобрать номер
    const match = cleaned.match(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/);
    
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
    }
    
    return phone;  // Возвращаем как есть, если формат не распознан
  }

  /**
   * Получение текущего года
   * -----------------------
   * Используется в футере для копирайта: © 2022—2024
   * 
   * @returns {number} - Текущий год (например: 2024)
   */
  function getCurrentYear() {
    return new Date().getFullYear();
  }

  /**
   * Форматирование даты
   * -------------------
   * Превращает дату в читаемый формат: "18 января 2024"
   * 
   * @param {Date|string} date - Дата (объект Date или строка)
   * @param {string} locale - Локаль (по умолчанию русская)
   * @returns {string} - Отформатированная дата
   */
  function formatDate(date, locale = 'ru-RU') {
    const d = new Date(date);
    
    return d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * ========================================
   * ОПРЕДЕЛЕНИЕ УСТРОЙСТВА
   * ========================================
   * Функции для определения типа устройства пользователя.
   */

  /**
   * Проверка мобильного устройства
   * ------------------------------
   * Определяет по ширине экрана (менее 768px = мобильный).
   * 
   * @returns {boolean} - true если мобильное устройство
   */
  function isMobile() {
    return window.innerWidth < 768;
  }

  /**
   * Проверка поддержки touch-событий
   * --------------------------------
   * Определяет, есть ли у устройства сенсорный экран.
   * 
   * @returns {boolean} - true если сенсорный экран
   */
  function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Проверка предпочтения уменьшенного движения
   * -------------------------------------------
   * Пользователь может включить в системе режим
   * "Уменьшить движение" (для людей с вестибулярными нарушениями).
   * 
   * @returns {boolean} - true если нужно убрать анимации
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * ========================================
   * РАБОТА С ДАННЫМИ
   * ========================================
   */

  /**
   * Безопасный JSON.parse
   * ---------------------
   * Парсит JSON без выбрасывания ошибки.
   * Если JSON невалидный - возвращает fallback значение.
   * 
   * @param {string} str - JSON строка
   * @param {*} fallback - Значение по умолчанию (если парсинг не удался)
   * @returns {*} - Распарсенный объект или fallback
   */
  function safeJsonParse(str, fallback = null) {
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  }

  /**
   * Получение параметров из URL
   * ---------------------------
   * Извлекает GET-параметры из адресной строки.
   * 
   * Пример: для URL "?page=2&sort=name" вернет { page: "2", sort: "name" }
   * 
   * @returns {Object} - Объект с параметрами
   */
  function getUrlParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  }

  /**
   * ========================================
   * НАВИГАЦИЯ И СКРОЛЛ
   * ========================================
   */

  /**
   * Плавный скролл к элементу
   * -------------------------
   * Прокручивает страницу к указанному элементу.
   * 
   * @param {string|Element} target - CSS селектор или DOM элемент
   * @param {number} offset - Отступ сверху в пикселях (по умолчанию 0)
   * 
   * Использование:
   * Utils.scrollTo('#about');           // К секции "О нас"
   * Utils.scrollTo('#about', 80);       // С отступом 80px (высота хедера)
   * Utils.scrollTo(document.body, 0);   // В начало страницы
   */
  function scrollTo(target, offset = 0) {
    // Если передан селектор - находим элемент
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    
    if (!element) return;  // Элемент не найден

    // Вычисляем позицию для скролла
    const targetPosition = element.getBoundingClientRect().top + window.scrollY - offset;
    
    // Если пользователь предпочитает без анимаций - прокручиваем мгновенно
    if (prefersReducedMotion()) {
      window.scrollTo(0, targetPosition);
    } else {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'  // Плавная прокрутка
      });
    }
  }

  /**
   * ========================================
   * БУФЕР ОБМЕНА
   * ========================================
   */

  /**
   * Копирование текста в буфер обмена
   * ---------------------------------
   * Копирует текст для вставки через Ctrl+V.
   * 
   * @param {string} text - Текст для копирования
   * @returns {Promise<boolean>} - true если успешно
   * 
   * Использование:
   * Utils.copyToClipboard('Текст для копирования').then(success => {
   *   if (success) alert('Скопировано!');
   * });
   */
  async function copyToClipboard(text) {
    try {
      // Современный способ (через Clipboard API)
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback для старых браузеров (через скрытый textarea)
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        return true;
      } catch {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }

  /**
   * ========================================
   * ГЕНЕРАЦИЯ И ЗАГРУЗКА
   * ========================================
   */

  /**
   * Генерация уникального ID
   * ------------------------
   * Создает уникальный идентификатор для элементов.
   * 
   * @param {string} prefix - Префикс (по умолчанию 'id')
   * @returns {string} - Уникальный ID, например: "id_1705580123456_abc123xyz"
   */
  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Загрузка внешнего скрипта
   * -------------------------
   * Динамически загружает JavaScript файл.
   * 
   * @param {string} src - URL скрипта
   * @returns {Promise} - Промис, который выполнится после загрузки
   * 
   * Использование:
   * Utils.loadScript('https://example.com/script.js')
   *   .then(() => console.log('Скрипт загружен'))
   *   .catch(() => console.log('Ошибка загрузки'));
   */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;   // Успешная загрузка
      script.onerror = reject;   // Ошибка загрузки
      document.head.appendChild(script);
    });
  }

  /**
   * Ожидание загрузки DOM
   * ---------------------
   * Выполняет callback когда DOM готов.
   * 
   * @param {Function} callback - Функция для выполнения
   */
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();  // DOM уже загружен
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  /**
   * ========================================
   * ПУБЛИЧНЫЙ API
   * ========================================
   * Только эти функции будут доступны через Utils.имяФункции()
   */
  return {
    debounce,
    throttle,
    formatPhone,
    getCurrentYear,
    isMobile,
    isTouchDevice,
    prefersReducedMotion,
    safeJsonParse,
    scrollTo,
    copyToClipboard,
    generateId,
    loadScript,
    ready,
    getUrlParams,
    formatDate
  };
})();
