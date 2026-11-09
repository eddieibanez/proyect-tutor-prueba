/**
 * Calendario y Feriados de Colombia para el Sistema Académico
 * Incluye cálculo de festivos por la Ley Emiliani y fechas fijas.
 */

// Festivos fijos en Colombia
const FIXED_HOLIDAYS = [
  { month: 0, day: 1, name: 'Año Nuevo' },
  { month: 4, day: 1, name: 'Día del Trabajo' },
  { month: 6, day: 20, name: 'Día de la Independencia' },
  { month: 7, day: 7, name: 'Batalla de Boyacá' },
  { month: 11, day: 8, name: 'Inmaculada Concepción' },
  { month: 11, day: 25, name: 'Navidad' }
];

// Cálculo del domingo de Pascua (algoritmo de Butcher / Gauss)
function getEasterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

// Mueve una fecha al siguiente lunes según Ley Emiliani
function moveToNextMonday(date) {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  if (dayOfWeek === 1) return d;
  const addDays = (8 - dayOfWeek) % 7;
  d.setDate(d.getDate() + (addDays === 0 ? 7 : addDays));
  return d;
}

/**
 * Obtiene la lista completa de festivos en Colombia para un año dado
 */
export function getColombianHolidays(year = new Date().getFullYear()) {
  const holidays = [];

  // 1. Fijos
  FIXED_HOLIDAYS.forEach(h => {
    holidays.push({
      dateStr: `${year}-${String(h.month + 1).padStart(2, '0')}-${String(h.day).padStart(2, '0')}`,
      name: h.name,
      isColombianHoliday: true
    });
  });

  // 2. Feriados sujetos a Ley Emiliani
  const emilianiHolidays = [
    { month: 0, day: 6, name: 'Reyes Magos' },
    { month: 2, day: 19, name: 'Día de San José' },
    { month: 5, day: 29, name: 'San Pedro y San Pablo' },
    { month: 7, day: 15, name: 'Asunción de la Virgen' },
    { month: 9, day: 12, name: 'Día de la Raza' },
    { month: 10, day: 1, name: 'Todos los Santos' },
    { month: 10, day: 11, name: 'Independencia de Cartagena' }
  ];

  emilianiHolidays.forEach(h => {
    const rawDate = new Date(year, h.month, h.day);
    const moved = moveToNextMonday(rawDate);
    holidays.push({
      dateStr: `${year}-${String(moved.getMonth() + 1).padStart(2, '0')}-${String(moved.getDate()).padStart(2, '0')}`,
      name: h.name,
      isColombianHoliday: true
    });
  });

  // 3. Feriados relativos a Pascua
  const easter = getEasterSunday(year);

  const holyThursday = new Date(easter);
  holyThursday.setDate(easter.getDate() - 3);
  holidays.push({
    dateStr: `${year}-${String(holyThursday.getMonth() + 1).padStart(2, '0')}-${String(holyThursday.getDate()).padStart(2, '0')}`,
    name: 'Jueves Santo',
    isColombianHoliday: true
  });

  const holyFriday = new Date(easter);
  holyFriday.setDate(easter.getDate() - 2);
  holidays.push({
    dateStr: `${year}-${String(holyFriday.getMonth() + 1).padStart(2, '0')}-${String(holyFriday.getDate()).padStart(2, '0')}`,
    name: 'Viernes Santo',
    isColombianHoliday: true
  });

  const ascension = new Date(easter);
  ascension.setDate(easter.getDate() + 43);
  holidays.push({
    dateStr: `${year}-${String(ascension.getMonth() + 1).padStart(2, '0')}-${String(ascension.getDate()).padStart(2, '0')}`,
    name: 'Ascensión del Señor',
    isColombianHoliday: true
  });

  const corpus = new Date(easter);
  corpus.setDate(easter.getDate() + 64);
  holidays.push({
    dateStr: `${year}-${String(corpus.getMonth() + 1).padStart(2, '0')}-${String(corpus.getDate()).padStart(2, '0')}`,
    name: 'Corpus Christi',
    isColombianHoliday: true
  });

  const sacredHeart = new Date(easter);
  sacredHeart.setDate(easter.getDate() + 71);
  holidays.push({
    dateStr: `${year}-${String(sacredHeart.getMonth() + 1).padStart(2, '0')}-${String(sacredHeart.getDate()).padStart(2, '0')}`,
    name: 'Sagrado Corazón de Jesús',
    isColombianHoliday: true
  });

  return holidays;
}

/**
 * Verifica si una fecha específica (YYYY-MM-DD) es festivo en Colombia
 */
export function isColombianHoliday(dateStr, customCancellations = []) {
  if (customCancellations && customCancellations.includes(dateStr)) {
    return { isHoliday: true, name: 'Clase cancelada por el docente' };
  }
  const year = parseInt(dateStr.split('-')[0], 10);
  const holidays = getColombianHolidays(year);
  const found = holidays.find(h => h.dateStr === dateStr);
  if (found) {
    return { isHoliday: true, name: found.name };
  }
  return { isHoliday: false, name: null };
}

export const DAY_NAMES = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export const SCHEDULE_DAYS = [
  { id: '1', name: 'Lunes' },
  { id: '2', name: 'Martes' },
  { id: '3', name: 'Miércoles' },
  { id: '4', name: 'Jueves' },
  { id: '5', name: 'Viernes' },
  { id: '6', name: 'Sábado' }
];
