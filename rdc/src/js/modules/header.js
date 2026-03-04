/**
 * ==========================================================================
 * РДЦ - Радиологический дата-центр
 * ФАЙЛ: modules/header.js
 * НАЗНАЧЕНИЕ: Модуль управления шапкой сайта (хедером)
 * ==========================================================================
 * 
 * ЧТО ЭТО ТАКОЕ:
 * Модуль, который управляет поведением шапки сайта:
 * - Изменяет стиль хедера при скролле (появляется фон и тень)
 * - Открывает/закрывает мобильное меню (бургер)
 * - Обеспечивает плавную навигацию по якорным ссылкам (#about, #services)
 * 
 * КАК ЭТО РАБОТАЕТ:
 * 1. При загрузке страницы модуль находит элементы хедера в DOM
 * 2. Вешает обработчики событий (скролл, клик)
 * 3. При скролле проверяет позицию и меняет классы хедера
 * 4. При клике на бургер показывает/скрывает мобильное меню
 * 
 * ТРЕБОВАНИЯ:
 * В HTML должны быть элементы с ID:
 * - #siteHeader - сам хедер
 * - #mobileMenuBtn - кнопка бургер-меню
 * - #mobileMenu - контейнер мобильного меню
 * 
 * ==========================================================================
 */

/**
 * Модуль хедера
 * -------------
 * Паттерн "Модуль" - создает приватное пространство имен.
 */
const HeaderModule = (function () {
  'use strict';

  /* ========================================
   * ПРИВАТНЫЕ ПЕРЕМЕННЫЕ
   * ========================================
   * Эти переменные доступны только внутри модуля.
   */

  let header = null;           // DOM элемент хедера
  let mobileMenuBtn = null;    // Кнопка бургер-меню
  let mobileMenu = null;       // Контейнер мобильного меню
  let isMenuOpen = false;      // Флаг: открыто ли меню
  let rafPending = false;      // Флаг для requestAnimationFrame (оптимизация)

  /**
   * Порог скролла для изменения стиля хедера
   * После скролла на это количество пикселей хедер меняет стиль.
   * 
   * !!!!! НАСТРОЙКА_СКРОЛЛА - КОГДА ХЕДЕР МЕНЯЕТ СТИЛЬ !!!!!
   */
  const SCROLL_THRESHOLD = typeof CONFIG !== 'undefined' ? CONFIG.ui.headerScrollThreshold : 20;

  /* ========================================
   * ОСНОВНЫЕ ФУНКЦИИ
   * ======================================== */

  /**
   * Инициализация модуля
   * --------------------
   * Вызывается один раз при загрузке страницы.
   * Находит элементы в DOM и привязывает обработчики событий.
   */
  function init() {
    // Находим элементы хедера в DOM
    header = document.getElementById('siteHeader');
    mobileMenuBtn = document.getElementById('mobileMenuBtn');
    mobileMenu = document.getElementById('mobileMenu');

    // Если хедер не найден - выходим (страница без хедера)
    if (!header) {
      console.warn('HeaderModule: Header element not found');
      return;
    }

    // Привязываем обработчики событий
    bindEvents();

    // Устанавливаем начальное состояние (на случай если страница уже прокручена)
    updateHeaderState();

    console.log('HeaderModule: Initialized');
  }

  /**
   * Привязка обработчиков событий
   * -----------------------------
   * Вешаем слушатели на нужные события.
   */
  function bindEvents() {
    // Слушаем скролл для изменения стиля хедера
    // { passive: true } - оптимизация, говорим браузеру что не будем вызывать preventDefault()
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Если есть мобильное меню - настраиваем его
    if (mobileMenuBtn && mobileMenu) {
      // Клик по кнопке бургер-меню
      mobileMenuBtn.addEventListener('click', toggleMobileMenu);

      // Клик по ссылке в меню - закрываем меню
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
      });
    }

    // Плавный скролл для всех якорных ссылок (href="#...")
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });
  }

  /**
   * Обработчик скролла (с оптимизацией)
   * -----------------------------------
   * Использует requestAnimationFrame для плавности.
   * 
   * Почему это важно:
   * Событие scroll вызывается очень часто (до 100 раз в секунду).
   * Если каждый раз менять DOM - страница будет тормозить.
   * requestAnimationFrame группирует изменения и применяет их
   * синхронно с перерисовкой экрана (обычно 60 раз в секунду).
   */
  function handleScroll() {
    // Если уже ждем следующий кадр - пропускаем
    if (rafPending) return;

    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      updateHeaderState();  // Обновляем состояние хедера
    });
  }

  /**
   * Обновление состояния хедера
   * ---------------------------
   * Проверяет позицию скролла и добавляет/убирает классы.
   * 
   * Логика:
   * - Если прокрутили больше SCROLL_THRESHOLD пикселей:
   *   добавляем белый фон, размытие, тень
   * - Если меньше: убираем эти стили
   */
  function updateHeaderState() {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;

    // Переключаем классы в зависимости от скролла
    // classList.toggle(className, force) - добавляет класс если force=true, убирает если false

    // Стили при скролле (прокрутили вниз)
    header.classList.toggle('bg-white/90', scrolled);       // Белый полупрозрачный фон
    header.classList.toggle('backdrop-blur-md', scrolled);  // Размытие фона
    header.classList.toggle('shadow-sm', scrolled);         // Небольшая тень
    header.classList.toggle('py-2', scrolled);              // Меньшие отступы

    // Стили без скролла (наверху страницы)
    header.classList.toggle('bg-transparent', !scrolled);   // Прозрачный фон
    header.classList.toggle('py-4', !scrolled);             // Большие отступы
  }

  /* ========================================
   * МОБИЛЬНОЕ МЕНЮ
   * ======================================== */

  /**
   * Переключение мобильного меню
   * ----------------------------
   * Открывает меню если закрыто, закрывает если открыто.
   */
  function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;  // Переключаем флаг

    // Показываем/скрываем меню (класс hidden)
    mobileMenu.classList.toggle('hidden', !isMenuOpen);

    // Обновляем aria-атрибут для доступности
    mobileMenuBtn.setAttribute('aria-expanded', isMenuOpen ? 'true' : 'false');

    // Меняем иконку (меню <-> крестик)
    updateMenuIcon();

    // Блокируем скролл страницы при открытом меню
    // Это предотвращает прокрутку фона когда меню открыто
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
  }

  /**
   * Закрытие мобильного меню
   * ------------------------
   * Явно закрывает меню (используется при клике на ссылку).
   */
  function closeMobileMenu() {
    if (!isMenuOpen) return;  // Уже закрыто

    isMenuOpen = false;
    mobileMenu.classList.add('hidden');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    updateMenuIcon();
    document.body.style.overflow = '';
  }

  /**
   * Обновление иконки меню
   * ----------------------
   * Меняет иконку бургера на крестик и обратно.
   */
  function updateMenuIcon() {
    // Выбираем иконку в зависимости от состояния
    const iconName = isMenuOpen ? 'x' : 'menu';

    // Обновляем HTML кнопки
    mobileMenuBtn.innerHTML = `<i data-lucide="${iconName}" class="w-6 h-6"></i>`;

    // Перерисовываем иконки Lucide (они работают через data-lucide атрибут)
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /* ========================================
   * НАВИГАЦИЯ ПО ЯКОРЯМ
   * ======================================== */

  /**
   * Обработка клика по якорной ссылке
   * ---------------------------------
   * При клике на ссылку вида href="#about" плавно прокручивает
   * страницу к соответствующей секции.
   * 
   * @param {Event} e - Событие клика
   */
  function handleAnchorClick(e) {
    const href = e.currentTarget.getAttribute('href');

    // Если ссылка просто "#" - ничего не делаем
    if (href === '#') return;

    // Ищем целевой элемент
    const target = document.querySelector(href);

    if (target) {
      e.preventDefault();  // Отменяем стандартное поведение ссылки

      // Вычисляем позицию с учетом высоты хедера
      const headerHeight = header.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      // Плавно прокручиваем
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Закрываем мобильное меню если открыто
      closeMobileMenu();
    }
  }

  /* ========================================
   * ПУБЛИЧНЫЙ API
   * ========================================
   * Функции, доступные извне модуля.
   */
  return {
    init,              // Инициализация
    closeMobileMenu,   // Закрыть мобильное меню
    isMenuOpen: () => isMenuOpen  // Проверка состояния меню
  };
})();

/**
 * Автоматическая инициализация
 * ----------------------------
 * Модуль инициализируется когда DOM полностью загружен.
 */
document.addEventListener('DOMContentLoaded', HeaderModule.init);
