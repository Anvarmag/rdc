/**
 * config.js
 * Contains the service pricing, rules, and AI availability for the service configurator.
 */

export const SERVICES_CONFIG = {
  mri: {
    id: 'mri',
    title: 'Описание МРТ исследования (1 область)',
    price_24h: 1600,
    price_3h: 3200,
    price_concilium: 3700,
    ai_available: false,
    ai_price: 0,
    ai_subtypes: []
  },
  ct: {
    id: 'ct',
    title: 'Описание РКТ исследования (1 область)',
    price_24h: 1600,
    price_3h: 3200,
    price_concilium: 3700,
    ai_available: true,
    ai_price: 150,
    ai_subtypes: [
      { id: 'ct_chest', title: 'РКТ органов грудной полости и легких' },
      { id: 'ct_brain', title: 'РКТ головного мозга' }
    ]
  },
  xray: {
    id: 'xray',
    title: 'Описание рентгеновского исследования (1 область)',
    price_24h: 800,
    price_3h: 1600,
    price_concilium: 1850,
    ai_available: true,
    ai_price: 80,
    ai_subtypes: [
      { id: 'xray_lungs', title: 'Рентген легких' }
    ]
  },
  mammography: {
    id: 'mammography',
    title: 'Описание маммографии (1 исследование)',
    price_24h: 1300,
    price_3h: 2600,
    price_concilium: 3000,
    ai_available: true,
    ai_price: 100,
    ai_subtypes: [
      { id: 'mammo_std', title: 'Маммография' }
    ]
  },
  fluorography: {
    id: 'fluorography',
    title: 'Описание флюорографии (1 исследование)',
    price_24h: 400,
    price_3h: 800,
    price_concilium: 800,
    ai_available: true,
    ai_price: 40,
    ai_subtypes: [
      { id: 'fluoro_std', title: 'Флюорография' }
    ]
  }
};
