/**
 * ==========================================================================
 * РДЦ - Радиологический дата-центр
 * ФАЙЛ: main.js
 * НАЗНАЧЕНИЕ: Главный файл инициализации JavaScript
 * ==========================================================================
 *
 * ЧТО ЭТО ТАКОЕ:
 * Это "точка входа" для всего JavaScript на сайте.
 * Здесь происходит:
 * - Инициализация всех модулей
 * - Настройка глобальных обработчиков
 * - Обратная совместимость со старым кодом
 *
 * ПОРЯДОК ЗАГРУЗКИ:
 * 1. config.js (конфигурация)
 * 2. data/doctors.js (данные врачей)
 * 3. data/services.js (данные услуг)
 * 4. modules/utils.js (утилиты)
 * 5. modules/header.js (хедер)
 * 6. modules/team.js (команда)
 * 7. main.js (этот файл) <-- сейчас здесь
 *
 * ==========================================================================
 */

/**
 * Главное IIFE (Immediately Invoked Function Expression)
 * -------------------------------------------------------
 * Создает приватное пространство имен, чтобы не загрязнять
 * глобальную область видимости.
 */
(function () {
  'use strict';

  /**
   * ========================================
   * ОБЪЕКТ ПРИЛОЖЕНИЯ
   * ========================================
   * Центральный объект для управления приложением.
   */
  const App = {
    /**
     * Флаг инициализации
     * ------------------
     * Предотвращает повторную инициализацию.
     */
    initialized: false,

    /**
     * Инициализация приложения
     * ------------------------
     * Вызывается при загрузке DOM.
     * Запускает все необходимые модули.
     */
    init() {
      // Защита от повторного вызова
      if (this.initialized) {
        console.warn('App: Already initialized');
        return;
      }

      console.log('App: Initializing...');

      // Инициализация иконок Lucide
      this.initIcons();

      // Инициализация футера (текущий год в копирайте)
      this.initFooter();

      // Примечание: модули HeaderModule и TeamModule инициализируются
      // автоматически через свои собственные DOMContentLoaded обработчики

      this.initialized = true;
      console.log('App: Initialization complete');
    },

    /**
     * Инициализация иконок Lucide
     * ---------------------------
     * Lucide Icons работает так:
     * 1. В HTML пишем: <i data-lucide="menu"></i>
     * 2. После загрузки вызываем lucide.createIcons()
     * 3. Lucide заменяет <i> на <svg> с нужной иконкой
     *
     * !!!!! ИКОНКИ - LUCIDE ICONS ИЗ https://lucide.dev/icons !!!!!
     */
    initIcons() {
      if (window.lucide) {
        window.lucide.createIcons();
        console.log('App: Lucide icons initialized');
      } else {
        console.warn('App: Lucide library not found');
      }
    },

    /**
     * Инициализация футера
     * --------------------
     * Подставляет текущий год в копирайт: © 2022—2024
     */
    initFooter() {
      const yearEl = document.getElementById('currentYear');
      if (yearEl) {
        // Используем Utils если доступен, иначе напрямую
        yearEl.textContent = Utils ? Utils.getCurrentYear() : new Date().getFullYear();
      }
    },

    /**
     * Повторная инициализация иконок
     * ------------------------------
     * Вызывайте после динамического добавления контента с иконками.
     *
     * Использование: RDCApp.refreshIcons();
     */
    refreshIcons() {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    },

    /**
     * Получение версии приложения
     * ---------------------------
     * @returns {string} - Номер версии
     */
    getVersion() {
      return '1.0.0';
    },
  };

  /**
   * ========================================
   * ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ
   * ========================================
   * Делаем App доступным глобально как RDCApp.
   *
   * Использование:
   * RDCApp.refreshIcons();
   * RDCApp.getVersion();
   */
  window.RDCApp = App;

  /**
   * ========================================
   * АВТОИНИЦИАЛИЗАЦИЯ
   * ========================================
   */

  /**
   * При загрузке DOM
   * ----------------
   * Событие DOMContentLoaded срабатывает когда HTML документ
   * полностью загружен и разобран (без ожидания картинок, стилей).
   */
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });

  /**
   * При полной загрузке страницы
   * ----------------------------
   * Событие load срабатывает когда загружено всё:
   * HTML, CSS, картинки, шрифты и т.д.
   *
   * Здесь перерисовываем иконки на случай если какие-то
   * элементы загрузились позже.
   */
  window.addEventListener('load', () => {
    App.refreshIcons();
  });
})();

/**
 * ==========================================================================
 * ФУНКЦИИ ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ
 * ==========================================================================
 *
 * Эти функции оставлены для совместимости с существующим кодом.
 * В новом коде рекомендуется использовать модули напрямую:
 * - TeamModule.openModal(doctor)
 * - HeaderModule.closeMobileMenu()
 * - Utils.scrollTo('#section')
 *
 * ==========================================================================
 */

/**
 * Открытие профиля врача
 * ----------------------
 * @param {number} doctorId - ID врача из массива DOCTORS
 *
 * @deprecated Используйте TeamModule.openModal(doctor)
 *
 * Пример:
 * openDoctorProfile(1);  // Откроет профиль первого врача
 */
function openDoctorProfile(doctorId) {
  if (typeof TeamModule !== 'undefined' && typeof DOCTORS !== 'undefined') {
    const doctor = DOCTORS.find((d) => d.id === doctorId);
    if (doctor) {
      TeamModule.openModal(doctor);
    }
  }
}

/**
 * Закрытие модального окна врача
 * ------------------------------
 * @deprecated Используйте TeamModule.closeModal()
 */
function closeDoctorModal() {
  if (typeof TeamModule !== 'undefined') {
    TeamModule.closeModal();
  }
}

/**
 * Плавный скролл к элементу
 * -------------------------
 * @param {string} selector - CSS селектор элемента
 *
 * @deprecated Используйте Utils.scrollTo(selector, offset)
 *
 * Пример:
 * smoothScrollTo('#about');  // Прокрутит к секции "О нас"
 */
function smoothScrollTo(selector) {
  if (typeof Utils !== 'undefined') {
    const header = document.getElementById('siteHeader');
    const offset = header ? header.offsetHeight : 80;
    Utils.scrollTo(selector, offset);
  }
}

/* ======================================================================
 * ServiceModule – Модуль управления модальным окном услуг
 * ----------------------------------------------------------------------
 * При клике на кнопку «Подробнее» в карточке услуги открывается
 * модальное окно с детальной информацией.
 *
 * КАК ЭТО РАБОТАЕТ:
 * 1. В HTML заранее есть контейнер #servicesGrid с карточками услуг
 * 2. Каждая карточка содержит атрибут data-service-id="mri" (или "ct", "xray" и т.д.)
 * 3. При клике ищем услугу по id в глобальном массиве SERVICES (из services.js)
 * 4. Заполняем модальное окно данными: заголовок, описание, картинка, ссылка
 *
 * ТРЕБОВАНИЯ (HTML-элементы):
 * - #servicesGrid       — контейнер с карточками услуг
 * - #serviceModal       — модальное окно
 * - #serviceBackdrop    — затемнённый фон при открытой модалке
 * - #serviceModalCard   — карточка внутри модалки (для анимации)
 * - #serviceCloseBtn    — кнопка закрытия модалки
 * - #serviceTitle       — заголовок услуги в модалке
 * - #serviceDesc        — описание услуги в модалке
 * - #serviceImg         — картинка услуги в модалке
 * - #serviceConfigBtn   — кнопка-ссылка на конфигуратор
 * =====================================================================*/
const ServiceModule = (function () {
  'use strict';

  /* ========================================
   * ПРИВАТНЫЕ ПЕРЕМЕННЫЕ
   * ======================================== */
  let grid,        // Контейнер с карточками услуг (#servicesGrid)
    modal,       // Модальное окно (#serviceModal)
    backdrop,    // Затемнённый фон (#serviceBackdrop)
    modalCard,   // Карточка модалки для анимации (#serviceModalCard)
    closeBtn;    // Кнопка закрытия модалки (#serviceCloseBtn)

  /**
   * Инициализация модуля
   * --------------------
   * Находит DOM-элементы и привязывает обработчики событий.
   */
  function init() {
    // Находим все необходимые DOM-элементы
    grid = document.getElementById('servicesGrid');          // Сетка карточек услуг
    modal = document.getElementById('serviceModal');          // Модальное окно
    backdrop = document.getElementById('serviceBackdrop');    // Подложка-затемнение
    modalCard = document.getElementById('serviceModalCard');  // Контейнер модалки (анимируется)
    closeBtn = document.getElementById('serviceCloseBtn');    // Кнопка «Закрыть»

    console.log('ServiceModule: init, grid=', grid, 'modal=', modal);

    // Слушаем клик по сетке (всплытие от карточек)
    if (grid) grid.addEventListener('click', handleCardClick);

    // Слушаем клик по фону — закрывает модалку
    if (backdrop) backdrop.addEventListener('click', closeModal);

    // Слушаем кнопку закрытия
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Закрытие по клавише Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();  // Закрываем, если модалка открыта и была нажата Escape
      }
    });
  }

  /**
   * Обработчик клика по карточке услуги
   * -----------------------------------
   * Ищет ближайший элемент с data-service-id, находит данные
   * услуги в массиве SERVICES и открывает модалку.
   *
   * @param {Event} e - Событие клика
   */
  function handleCardClick(e) {
    console.log('ServiceModule click target', e.target);

    // Ищем ближайший родительский элемент с атрибутом data-service-id
    const card = e.target.closest('[data-service-id]');
    console.log('ServiceModule found card', card);
    if (!card) return;  // Клик был не по карточке — игнорируем

    // Извлекаем ID услуги из атрибута
    const serviceId = card.getAttribute('data-service-id');
    console.log('ServiceModule serviceId', serviceId);

    // Проверяем, что ID есть и массив SERVICES доступен
    if (!serviceId || typeof SERVICES === 'undefined') return;

    // Ищем данные услуги по ID в массиве
    const service = SERVICES.find((s) => s.id === serviceId);
    console.log('ServiceModule service data', service);
    if (!service) return;  // Услуга не найдена

    openModal(service);  // Открываем модалку с найденными данными
  }

  /**
   * Открытие модального окна с данными услуги
   * ------------------------------------------
   * Заполняет модалку данными (заголовок, описание, картинка)
   * и показывает её с анимацией.
   *
   * @param {Object} service - Объект услуги из массива SERVICES
   */
  function openModal(service) {
    if (!modal) return;  // Если модалки нет в DOM — выходим

    // Находим элементы модалки для заполнения
    const titleEl = document.getElementById('serviceTitle');      // Заголовок
    const descEl = document.getElementById('serviceDesc');        // Описание
    const imgEl = document.getElementById('serviceImg');          // Картинка
    const configBtn = document.getElementById('serviceConfigBtn'); // Кнопка конфигуратора

    // Определяем текущий язык страницы (из атрибута <html lang="...">)
    const lang = document.documentElement.lang || 'ru';

    // --- Заполняем заголовок ---
    if (titleEl) {
      if (service.modalTitle) {
        // Используем локализованный заголовок (если есть перевод для текущего языка)
        titleEl.textContent = service.modalTitle[lang] || service.title || '';
      } else {
        // Или основной заголовок
        titleEl.textContent = service.title || '';
      }
    }

    // --- Заполняем описание ---
    if (descEl) {
      if (service.detailHtml) {
        // Если описание — мультиязычный объект
        if (typeof service.detailHtml === 'object') {
          descEl.innerHTML = service.detailHtml[lang] || service.detailHtml.ru || '';
        } else {
          descEl.innerHTML = service.detailHtml;  // Или простая HTML-строка
        }
      } else if (service.fullDescription) {
        descEl.innerHTML = service.fullDescription;  // Fallback на полное описание
      } else {
        descEl.textContent = service.description || '';  // Или краткое
      }
    }

    // --- Заполняем картинку ---
    if (imgEl && service.image) {
      imgEl.src = 'images/' + service.image;  // Путь к картинке (относительно dist/)
      imgEl.alt =
        (service.modalTitle ? service.modalTitle[lang] || service.title : service.title) || '';
    }

    // --- Показываем/скрываем кнопку конфигуратора ---
    if (configBtn) {
      if (service.configUrl) {
        configBtn.href = service.configUrl;         // Устанавливаем URL
        configBtn.classList.remove('hidden');        // Показываем кнопку
      } else {
        configBtn.classList.add('hidden');           // Скрываем если У услуги нет URL
      }
    }

    // --- Показываем модальное окно ---
    modal.classList.remove('hidden');    // Убираем скрытие
    modal.classList.add('flex');         // Добавляем flex для центрирования

    // Анимация появления (два шага для плавности)
    if (modalCard) {
      modalCard.classList.add('modal-enter');                  // Начальное состояние
      requestAnimationFrame(() => {
        modalCard.classList.add('modal-enter-active');         // Финальное состояние (запускает CSS-переход)
      });
    }

    // Блокируем прокрутку страницы под модалкой
    document.body.style.overflow = 'hidden';
  }

  /**
   * Закрытие модального окна
   * ------------------------
   * Скрывает модалку и разблокирует прокрутку страницы.
   */
  function closeModal() {
    if (!modal) return;  // Модалки нет — выходим

    modal.classList.add('hidden');                                    // Скрываем модалку
    modal.classList.remove('flex');                                   // Убираем flex
    if (modalCard) modalCard.classList.remove('modal-enter', 'modal-enter-active');  // Сбрасываем анимацию
    document.body.style.overflow = '';                                // Разблокируем прокрутку
  }

  /* ========================================
   * ПУБЛИЧНЫЙ API
   * ======================================== */
  return {
    init,        // Инициализация модуля
    openModal,   // Открыть модалку с данными услуги
    closeModal,  // Закрыть модалку
  };
})();

/**
 * Автоматическая инициализация ServiceModule
 * -------------------------------------------
 * Если DOM ещё загружается — ждём DOMContentLoaded.
 * Если уже загружен (скрипт подключён внизу страницы) — инициализируем сразу.
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ServiceModule.init);  // Ждём загрузки DOM
} else {
  ServiceModule.init();  // DOM уже загружен — инициализируем немедленно
}

