/**
 * ==========================================================================
 * РДЦ - Радиологический дата-центр
 * ФАЙЛ: modules/team.js
 * НАЗНАЧЕНИЕ: Модуль команды специалистов (карточки врачей + модальное окно)
 * ==========================================================================
 * 
 * ЧТО ЭТО ТАКОЕ:
 * Модуль, который управляет отображением врачей на сайте:
 * - Генерирует HTML карточек врачей из массива DOCTORS
 * - Открывает модальное окно с детальной информацией при клике
 * - Заполняет модальное окно данными выбранного врача
 * 
 * КАК ЭТО РАБОТАЕТ:
 * 1. При загрузке страницы берет данные из массива DOCTORS (data/doctors.js)
 * 2. Генерирует HTML для каждого врача и вставляет в контейнер #teamGrid
 * 3. При клике на карточку врача открывает модальное окно
 * 4. Заполняет модальное окно данными (фото, ФИО, образование, сертификаты)
 * 
 * ТРЕБОВАНИЯ:
 * В HTML должны быть элементы:
 * - #teamGrid - контейнер для карточек врачей
 * - #doctorModal - модальное окно
 * - #doctorBackdrop - затемненный фон модалки
 * - #doctorCloseBtn - кнопка закрытия
 * - #doctorPhoto, #doctorName, #doctorCategory, etc. - поля для данных
 * 
 * ==========================================================================
 */

const TeamModule = (function () {
  'use strict';

  /* ========================================
   * ПРИВАТНЫЕ ПЕРЕМЕННЫЕ
   * ======================================== */

  let teamGrid = null;        // Контейнер для карточек врачей

  /* ========================================
   * ИНИЦИАЛИЗАЦИЯ
   * ======================================== */

  /**
   * Инициализация модуля
   * --------------------
   * Находит элементы, рендерит карточки, привязывает события.
   */
  function init() {
    // Находим контейнер для карточек
    teamGrid = document.getElementById('teamGrid');

    // Если контейнер не найден - выходим
    if (!teamGrid) {
      console.warn('TeamModule: Team grid element not found');
      return;
    }

    // Рендерим карточки врачей
    renderDoctorCards();

    // Привязываем клик по карточкам — переход на doctors.html
    bindCardEvents();

    console.log('TeamModule: Initialized');
  }


  /* ========================================
   * РЕНДЕРИНГ КАРТОЧЕК
   * ======================================== */

  /**
   * Рендеринг карточек врачей
   * -------------------------
   * Берет данные из массива DOCTORS и генерирует HTML для каждого врача.
   */
  function renderDoctorCards() {
    // Проверяем, что массив DOCTORS существует
    if (typeof DOCTORS === 'undefined' || !Array.isArray(DOCTORS)) {
      console.error('TeamModule: DOCTORS data not found');
      return;
    }

    // Генерируем HTML для всех врачей
    const html = DOCTORS.map(doctor => createDoctorCard(doctor)).join('');

    // Вставляем в контейнер
    teamGrid.innerHTML = html;

    // Перерисовываем иконки Lucide (они добавляются через data-lucide)
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Создание HTML карточки врача
   * ----------------------------
   * Генерирует HTML разметку для одного врача.
   * 
   * @param {Object} doctor - Объект с данными врача из массива DOCTORS
   * @returns {string} - HTML строка
   * 
   * !!!!! ШАБЛОН_КАРТОЧКИ_ВРАЧА - ЗДЕСЬ МОЖНО ИЗМЕНИТЬ ВНЕШНИЙ ВИД КАРТОЧКИ !!!!!
   */
  function formatName(name) {
    if (!name) return { line1: '', line2: '' };
    const parts = name.trim().split(/\s+/);
    if (parts.length < 3) {
      return { line1: name.trim(), line2: '' };
    }
    const line1 = parts.slice(0, 2).join(' ');
    const line2 = parts.slice(2).join(' ');
    return { line1, line2 };
  }

  function createDoctorCard(doctor) {
    const { line1, line2 } = formatName(doctor.name);
    return `
      <!-- Карточка врача: ${doctor.name} -->
      <div class="group cursor-pointer" data-doctor-id="${doctor.id}">
        
        <!-- Фото врача с эффектом при наведении -->
        <div class="relative mb-6 overflow-hidden rounded-[2.5rem] aspect-square bg-slate-200 shadow-lg shadow-slate-200">
          
          <!-- !!!!! ФОТО_ВРАЧА - URL ФОТОГРАФИИ !!!!! -->
          <img 
            src="${doctor.photo}" 
            alt="${doctor.name}" 
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy" 
            decoding="async"
          />
          
          <!-- Оверлей при наведении (появляется кнопка "Профиль") -->
          <div class="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
            <div class="bg-white text-blue-600 px-4 py-2 rounded-full font-bold text-sm flex items-center shadow-lg">
              Профиль 
              <i data-lucide="external-link" class="ml-2 w-[14px] h-[14px]"></i>
            </div>
          </div>
        </div>
        
        <!-- Информация под фото -->
        <div class="text-center">
          <!-- !!!!! ИМЯ_ВРАЧА !!!!! -->
          <h3 class="text-lg font-bold text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
            ${line1}${line2 ? '<br>' + line2 : ''}
          </h3>
          
          <!-- Тег специализации (МРТ эксперт / КТ эксперт) -->
          <p class="text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
            ${doctor.tag}
          </p>
          
          <!-- !!!!! ДОЛЖНОСТЬ_ВРАЧА !!!!! -->
          <p class="text-slate-500 text-xs px-4">
            ${doctor.position}
          </p>
        </div>
      </div>
    `;
  }

  /* ========================================
   * НАВИГАЦИЯ К СТРАНИЦЕ ВРАЧЕЙ
   * ======================================== */

  /**
   * Привязка событий клика по карточкам
   * -----------------------------------
   * При клике на карточку врача переходим на страницу doctors.html
   */
  function bindCardEvents() {
    teamGrid.addEventListener('click', handleCardClick);
  }

  /**
   * Обработка клика по карточке
   * ---------------------------
   * Переходит на страницу doctors.html при клике на карточку врача.
   * 
   * @param {Event} e - Событие клика
   */
  function handleCardClick(e) {
    // Ищем родительский элемент с data-doctor-id
    const card = e.target.closest('[data-doctor-id]');
    if (!card) return;  // Клик был не по карточке

    // Получаем ID врача и переходим на страницу с якорем к нему
    const doctorId = card.getAttribute('data-doctor-id');
    window.location.href = 'doctors.html#doctor-' + doctorId;
  }

  /* ========================================
   * ПУБЛИЧНЫЙ API
   * ======================================== */
  return {
    init,               // Инициализация модуля
    renderDoctorCards   // Перерисовать карточки
  };
})();

/**
 * Автоматическая инициализация при загрузке DOM
 */
document.addEventListener('DOMContentLoaded', TeamModule.init);

