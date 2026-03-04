/**
 * state.js
 * Manages the configurator's internal state and listeners.
 */
import { SERVICES_CONFIG } from './config.js';

const STORAGE_KEY = 'rdc_configurator_form';

const defaultForm = {
    fullName: '',
    phone: '',
    email: '',
    city: '',
    age: '',
    gender: '', // 'М' or 'Ж'
    studyArea: '',
    oncology: '',
    surgery: '',
    cloudLink: '',
    complaints: ''
};

function loadSavedForm() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.warn('Error loading form from localStorage', e);
    }
    return {};
}

export const state = {
    serviceId: null,      // 'mri', 'ct', etc.
    time: '24h',          // '24h' or '3h'
    aiEnabled: false,
    aiSubtypeId: null,    // If CT, 'ct_chest' or 'ct_brain', etc.
    concilium: false,

    form: { ...defaultForm, ...loadSavedForm() },

    listeners: [],

    // Subscribe to changes
    subscribe(listener) {
        this.listeners.push(listener);
    },

    // Notify listeners
    notify() {
        this.listeners.forEach(listener => listener(this));
    },

    update(newState) {
        let changed = false;
        for (const key in newState) {
            if (this[key] !== newState[key]) {
                this[key] = newState[key];
                changed = true;
            }
        }

        // Automatic rules application
        if (changed) {
            // 1. If service changed, reset AI settings to default for that service
            if ('serviceId' in newState) {
                const svc = SERVICES_CONFIG[this.serviceId];
                this.aiEnabled = false;

                if (svc && svc.ai_subtypes.length > 0) {
                    this.aiSubtypeId = svc.ai_subtypes[0].id;
                } else {
                    this.aiSubtypeId = null;
                }
            }

            // 2. Concilium rule: If concilium is ON, force time to 24h
            if (this.concilium) {
                this.time = '24h';
            }

            this.notify();
        }
    },

    updateForm(field, value) {
        this.form[field] = value;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.form));
        } catch (e) { /* ignore storage errors */ }
    },

    calculateTotal() {
        if (!this.serviceId) return 0;

        const svc = SERVICES_CONFIG[this.serviceId];
        if (!svc) return 0;

        let total = 0;

        // Base price
        if (this.concilium) {
            total += svc.price_concilium;
        } else {
            total += this.time === '3h' ? svc.price_3h : svc.price_24h;
        }

        // AI price
        if (this.aiEnabled && svc.ai_available) {
            total += svc.ai_price;
        }

        return total;
    }
};
