/**
 * ui.js
 * Renders UI and binds events to the DOM.
 */
import { SERVICES_CONFIG } from './config.js';
import { state } from './state.js';
import { createLeadAndPayment } from './api.js';

export function initUI() {
    bindServiceSelection();
    bindTimeSelection();
    bindAISelection();
    bindConciliumSelection();
    bindFormInputs();
    bindSubmit();

    applySavedFormData();
    initInputmask();

    // Initial render
    state.subscribe(render);
}

function bindServiceSelection() {
    const serviceInputs = document.querySelectorAll('input[name="serviceId"]');
    serviceInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            state.update({ serviceId: e.target.value });
        });
    });
}

function bindTimeSelection() {
    const timeInputs = document.querySelectorAll('input[name="time"]');
    timeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (!state.concilium) {
                state.update({ time: e.target.value });
            }
        });
    });
}

function bindAISelection() {
    const aiCheckbox = document.getElementById('aiEnabled');
    if (aiCheckbox) {
        aiCheckbox.addEventListener('change', (e) => {
            state.update({ aiEnabled: e.target.checked });
        });
    }

    const aiSubtypes = document.getElementById('aiSubtypes');
    if (aiSubtypes) {
        aiSubtypes.addEventListener('change', (e) => {
            state.update({ aiSubtypeId: e.target.value });
        });
    }
}

function bindConciliumSelection() {
    const conciliumCheckbox = document.getElementById('concilium');
    if (conciliumCheckbox) {
        conciliumCheckbox.addEventListener('change', (e) => {
            state.update({ concilium: e.target.checked });
        });
    }
}

function bindFormInputs() {
    const formFields = [
        'fullName', 'phone', 'email', 'city', 'age',
        'gender', 'studyArea', 'oncology', 'surgery',
        'cloudLink', 'complaints'
    ];

    formFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) {
            el.addEventListener('input', (e) => {
                state.updateForm(field, e.target.value);
            });
        }
    });
}

function render(s) {
    // Render Time Radio buttons (disable 3h if concilium is selected)
    const time3h = document.getElementById('time3h');
    const time24h = document.getElementById('time24h');
    if (time3h && time24h) {
        time3h.disabled = s.concilium;
        if (s.concilium) {
            time24h.checked = true;
            time3h.parentElement.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            time3h.parentElement.classList.remove('opacity-50', 'cursor-not-allowed');
            if (s.time === '3h') {
                time3h.checked = true;
            } else {
                time24h.checked = true;
            }
        }
    }

    // Render AI Block Visibility & Subtypes
    const aiBlock = document.getElementById('aiBlock');
    const aiSubtypesBlock = document.getElementById('aiSubtypesBlock');
    const aiSubtypesSelect = document.getElementById('aiSubtypes');
    const aiCheckbox = document.getElementById('aiEnabled');

    if (s.serviceId) {
        const svc = SERVICES_CONFIG[s.serviceId];
        if (svc && svc.ai_available) {
            aiBlock.classList.remove('hidden');
            aiCheckbox.checked = s.aiEnabled;

            if (s.aiEnabled && svc.ai_subtypes.length > 0) {
                aiSubtypesBlock.classList.remove('hidden');
                aiSubtypesSelect.innerHTML = svc.ai_subtypes.map(st =>
                    `<option value="${st.id}" ${s.aiSubtypeId === st.id ? 'selected' : ''}>${st.title}</option>`
                ).join('');
            } else {
                aiSubtypesBlock.classList.add('hidden');
            }
        } else {
            aiBlock.classList.add('hidden');
            aiCheckbox.checked = false;
        }
    } else {
        aiBlock.classList.add('hidden');
    }

    // Render Summary
    updateSummary(s);
}

function updateSummary(s) {
    const summaryService = document.getElementById('summaryService');
    const summaryTime = document.getElementById('summaryTime');
    const summaryAI = document.getElementById('summaryAI');
    const summaryConcilium = document.getElementById('summaryConcilium');
    const summaryTotal = document.getElementById('summaryTotal');
    const submitBtn = document.getElementById('submitBtn');

    if (!s.serviceId) {
        summaryService.textContent = 'Не выбрано';
        summaryTime.textContent = '-';
        summaryAI.textContent = '-';
        summaryConcilium.textContent = '-';
        summaryTotal.textContent = '0 ₽';
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        return;
    }

    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    const svc = SERVICES_CONFIG[s.serviceId];
    summaryService.textContent = svc.title;
    summaryTime.textContent = s.time === '24h' ? '24 часа' : '3 часа';

    if (s.aiEnabled && svc.ai_available) {
        let aiText = 'Да';
        if (svc.ai_subtypes && svc.ai_subtypes.length > 0) {
            const st = svc.ai_subtypes.find(x => x.id === s.aiSubtypeId);
            if (st) aiText += ` (${st.title})`;
        }
        summaryAI.textContent = aiText;
    } else {
        summaryAI.textContent = 'Нет';
    }

    summaryConcilium.textContent = s.concilium ? 'Да' : 'Нет';
    summaryTotal.textContent = `${state.calculateTotal()} ₽`;
}

function bindSubmit() {
    const form = document.getElementById('configuratorForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorBox = document.getElementById('errorBox');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Basic Validation
            if (!state.serviceId) {
                showError(getI18n('err_select_service') || 'Пожалуйста, выберите услугу.');
                return;
            }

            if (!state.form.fullName || !state.form.phone || !state.form.email || !state.form.cloudLink || !state.form.age) {
                showError(getI18n('err_fill_required') || 'Пожалуйста, заполните все обязательные поля (ФИО, Телефон, Email, Возраст, Ссылка на исследование).');
                return;
            }

            // Phone validation
            if (state.form.phone.includes('_')) {
                showError(getI18n('err_invalid_phone') || 'Введите корректный номер телефона.');
                return;
            }

            // Age validation
            const ageVal = parseInt(state.form.age, 10);
            if (isNaN(ageVal) || ageVal < 0 || ageVal > 120) {
                showError(getI18n('err_invalid_age') || 'Укажите корректный возраст (от 0 до 120 лет).');
                return;
            }

            // Email validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(state.form.email)) {
                showError(getI18n('err_invalid_email') || 'Введите корректный E-mail.');
                return;
            }

            errorBox.classList.add('hidden');

            const btnText = document.getElementById('submitBtnText');
            const btnSpinner = document.getElementById('submitBtnSpinner');

            submitBtn.disabled = true;
            if (btnText) btnText.textContent = getI18n('btn_creating_lead') || 'Создание заявки...';
            if (btnSpinner) btnSpinner.classList.remove('hidden');

            try {
                const paymentUrl = await createLeadAndPayment(state, state.calculateTotal());
                if (paymentUrl) {
                    window.location.href = paymentUrl;
                } else {
                    showError(getI18n('err_server') || 'Не удалось создать платеж. Попробуйте еще раз.');
                }
            } catch (err) {
                if (err.type === 'SERVER_ERROR') {
                    showError(getI18n('err_server') || 'Ошибка сервера.');
                } else {
                    showError(getI18n('err_network') || 'Проблема с сетью.');
                }
            } finally {
                submitBtn.disabled = false;
                if (btnText) btnText.textContent = getI18n('btn_pay_default') || 'Оплатить';
                if (btnSpinner) btnSpinner.classList.add('hidden');
            }
        });
    }
}

function showError(msg) {
    const errorBox = document.getElementById('errorBox');
    if (errorBox) {
        errorBox.textContent = msg;
        errorBox.classList.remove('hidden');
    } else {
        alert(msg);
    }
}

function applySavedFormData() {
    for (const key in state.form) {
        const el = document.getElementById(key);
        if (el) {
            el.value = state.form[key] || '';
        }
    }
}

function initInputmask() {
    const phoneEl = document.getElementById('phone');
    if (phoneEl && window.Inputmask) {
        Inputmask("+7 (999) 999-99-99").mask(phoneEl);
    }
}

function getI18n(id) {
    const el = document.getElementById(id);
    return el ? el.textContent : '';
}
