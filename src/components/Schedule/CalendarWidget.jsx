import React, { useState } from 'react';
import { isColombianHoliday } from '../../utils/colombianHolidays';
import './CalendarWidget.css';

const CalendarWidget = ({ courses = [], onSelectDate, customTitle = 'Calendario Académico y Festivos Colombia' }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push(d);
  }

  // Clases y festivos para el día seleccionado
  const selectedDObj = new Date(selectedDate);
  const selectedDayOfWeek = String(selectedDObj.getDay());
  const selectedHoliday = isColombianHoliday(selectedDate);
  const coursesOnSelectedDate = courses.filter(c => {
    const isClassDay = (c.scheduleDays || []).includes(selectedDayOfWeek);
    const isCancelled = (c.cancelledDates || []).includes(selectedDate);
    return isClassDay && !isCancelled && !selectedHoliday.isHoliday;
  });

  return (
    <div className="calendar-widget-card">
      <div className="widget-head">
        <h4>📅 {customTitle}</h4>
        <div className="widget-month-nav">
          <button
            type="button"
            className="btn-widget-month"
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
          >
            ◀
          </button>
          <span className="widget-month-label">{monthNames[currentMonth]} {currentYear}</span>
          <button
            type="button"
            className="btn-widget-month"
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
          >
            ▶
          </button>
        </div>
      </div>

      <div className="widget-weekdays-grid">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((w, idx) => (
          <span key={idx} className="widget-weekday">{w}</span>
        ))}
      </div>

      <div className="widget-days-grid">
        {cells.map((dayNum, i) => {
          if (!dayNum) return <div key={`empty-${i}`} className="widget-cell empty"></div>;

          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const dObj = new Date(currentYear, currentMonth, dayNum);
          const dow = String(dObj.getDay());
          const holiday = isColombianHoliday(dateStr);
          const hasClasses = courses.some(c => (c.scheduleDays || []).includes(dow) && !(c.cancelledDates || []).includes(dateStr) && !holiday.isHoliday);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              type="button"
              key={`day-${dayNum}`}
              className={`widget-cell-btn ${isSelected ? 'selected' : ''} ${holiday.isHoliday ? 'holiday' : ''} ${hasClasses ? 'class-day' : ''}`}
              onClick={() => {
                setSelectedDate(dateStr);
                if (onSelectDate) onSelectDate(dateStr);
              }}
              title={holiday.isHoliday ? `${holiday.name}` : hasClasses ? 'Día con sesiones de clase' : 'Sin clases'}
            >
              <span className="day-number">{dayNum}</span>
              {holiday.isHoliday && <span className="cell-mini-dot holiday"></span>}
              {hasClasses && !holiday.isHoliday && <span className="cell-mini-dot class"></span>}
            </button>
          );
        })}
      </div>

      {/* DETALLES DEL DÍA SELECCIONADO */}
      <div className="widget-selected-info">
        <span className="selected-date-title">Detalle del {selectedDate}:</span>
        {selectedHoliday.isHoliday ? (
          <div className="holiday-info-pill">
            🇨🇴 <strong>Festivo Nacional:</strong> {selectedHoliday.name} (Clase omitida)
          </div>
        ) : coursesOnSelectedDate.length > 0 ? (
          <div className="courses-mini-list">
            {coursesOnSelectedDate.map(c => (
              <div key={c.id} className="course-mini-item" style={{ borderLeftColor: c.color || 'var(--primary)' }}>
                <strong>{c.name}</strong> ({c.code}) • {c.startTime || '08:00'} a {c.endTime || '09:30'}
              </div>
            ))}
          </div>
        ) : (
          <span className="no-classes-info">No hay clases programadas para esta fecha.</span>
        )}
      </div>
    </div>
  );
};

export default CalendarWidget;
