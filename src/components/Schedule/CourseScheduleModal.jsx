import React, { useState } from 'react';
import { isColombianHoliday, DAY_NAMES } from '../../utils/colombianHolidays';
import './CourseScheduleModal.css';

const CourseScheduleModal = ({ course, isTeacher, onClose, onSaveSchedule, onToggleCancellation, allCourses = [] }) => {
  const [selectedDays, setSelectedDays] = useState(course.scheduleDays || ['1', '3']);
  const [startTime, setStartTime] = useState(course.startTime || '08:00');
  const [endTime, setEndTime] = useState(course.endTime || '09:30');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [conflicts, setConflicts] = useState([]);

  const availableWeekDays = [
    { id: '1', name: 'Lunes' },
    { id: '2', name: 'Martes' },
    { id: '3', name: 'Miércoles' },
    { id: '4', name: 'Jueves' },
    { id: '5', name: 'Viernes' },
    { id: '6', name: 'Sábado' }
  ];

  const handleDayToggle = (dayId) => {
    if (!isTeacher) return;
    const updated = selectedDays.includes(dayId)
      ? selectedDays.filter(d => d !== dayId)
      : [...selectedDays, dayId];
    setSelectedDays(updated);
    checkOverlap(updated, startTime, endTime);
  };

  const checkOverlap = (days, start, end) => {
    if (!days.length) {
      setConflicts([]);
      return;
    }
    const detected = [];
    allCourses.forEach(c => {
      if (c.id === course.id) return;
      const cDays = c.scheduleDays || [];
      const commonDays = days.filter(d => cDays.includes(d));
      if (commonDays.length > 0) {
        const cStart = c.startTime || '08:00';
        const cEnd = c.endTime || '09:30';
        if ((start < cEnd && end > cStart)) {
          const dayLabels = commonDays.map(d => availableWeekDays.find(w => w.id === d)?.name).join(', ');
          detected.push(`Cruce detectado con el curso "${c.name}" (${c.code}) los días ${dayLabels} de ${cStart} a ${cEnd}.`);
        }
      }
    });
    setConflicts(detected);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedDays.length) {
      alert('Selecciona al menos un día de clase por semana.');
      return;
    }
    const dayNamesStr = selectedDays
      .map(d => availableWeekDays.find(w => w.id === d)?.name)
      .join(' y ');
    const scheduleStr = `${dayNamesStr} ${startTime} - ${endTime}`;

    onSaveSchedule({
      courseId: course.id,
      schedule: scheduleStr,
      scheduleDays: selectedDays,
      startTime,
      endTime
    });
    onClose();
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push(d);
  }

  return (
    <div className="schedule-modal-overlay" onClick={onClose}>
      <div className="schedule-modal-content" onClick={e => e.stopPropagation()}>
        <div className="schedule-modal-header">
          <div className="modal-title-col">
            <h3>📅 Horario y Calendario de Clases</h3>
            <p className="modal-subtitle">
              Curso: <strong>{course.name}</strong> ({course.code}) • Grado {course.grade}°
            </p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        {conflicts.length > 0 && (
          <div className="schedule-conflict-banner">
            <span className="conflict-icon">⚠️</span>
            <div>
              <strong>¡Advertencia de Conflicto de Horario!</strong>
              <ul>
                {conflicts.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>
        )}

        {isTeacher && (
          <form className="schedule-config-box" onSubmit={handleSave}>
            <h4>Configurar Sesiones Semanales</h4>
            <div className="schedule-config-grid">
              <div className="days-picker-group">
                <label>Días de Sesión:</label>
                <div className="days-chip-row">
                  {availableWeekDays.map(d => (
                    <button
                      type="button"
                      key={d.id}
                      className={`day-chip ${selectedDays.includes(d.id) ? 'selected' : ''}`}
                      onClick={() => handleDayToggle(d.id)}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="time-picker-group">
                <div className="time-field">
                  <label>Hora Inicio:</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => {
                      setStartTime(e.target.value);
                      checkOverlap(selectedDays, e.target.value, endTime);
                    }}
                    required
                  />
                </div>
                <div className="time-field">
                  <label>Hora Fin:</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => {
                      setEndTime(e.target.value);
                      checkOverlap(selectedDays, startTime, e.target.value);
                    }}
                    required
                  />
                </div>
                <button type="submit" className="btn-save-schedule">
                  💾 Guardar Horario
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="monthly-calendar-section">
          <div className="cal-header-controls">
            <button
              type="button"
              className="cal-nav-btn"
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear(currentYear - 1);
                } else {
                  setCurrentMonth(currentMonth - 1);
                }
              }}
            >
              ◀ Mes Anterior
            </button>
            <h4 className="cal-month-title">
              {monthNames[currentMonth]} {currentYear}
            </h4>
            <button
              type="button"
              className="cal-nav-btn"
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0);
                  setCurrentYear(currentYear + 1);
                } else {
                  setCurrentMonth(currentMonth + 1);
                }
              }}
            >
              Mes Siguiente ▶
            </button>
          </div>

          <div className="calendar-weekdays-row">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((wd, i) => (
              <span key={i} className="cal-weekday-label">{wd}</span>
            ))}
          </div>

          <div className="calendar-days-grid">
            {calendarCells.map((dayNum, idx) => {
              if (!dayNum) {
                return <div key={`empty-${idx}`} className="cal-cell empty"></div>;
              }

              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dObj = new Date(currentYear, currentMonth, dayNum);
              const dayOfWeek = String(dObj.getDay());
              const isClassDay = (course.scheduleDays || selectedDays).includes(dayOfWeek);
              const holidayInfo = isColombianHoliday(dateStr, course.cancelledDates || []);
              const isCancelled = (course.cancelledDates || []).includes(dateStr);

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`cal-cell ${isClassDay ? 'has-class' : ''} ${holidayInfo.isHoliday ? 'holiday' : ''} ${isCancelled ? 'cancelled' : ''}`}
                >
                  <span className="cell-day-num">{dayNum}</span>

                  {isClassDay && !holidayInfo.isHoliday && (
                    <div className="class-badge">
                      <span>Clase</span>
                      <small>{course.startTime || startTime}</small>
                    </div>
                  )}

                  {holidayInfo.isHoliday && (
                    <div className="holiday-badge" title={holidayInfo.name}>
                      <span>🇨🇴 Festivo</span>
                      <small className="holiday-name-text">{holidayInfo.name}</small>
                    </div>
                  )}

                  {isTeacher && isClassDay && !holidayInfo.isColombianHoliday && (
                    <button
                      type="button"
                      className="btn-toggle-cancel"
                      onClick={() => onToggleCancellation(course.id, dateStr)}
                    >
                      {isCancelled ? '↩️ Reactivar' : '🚫 Cancelar'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="calendar-legend">
            <span className="legend-item"><span className="legend-dot class"></span> Día de Clase</span>
            <span className="legend-item"><span className="legend-dot holiday"></span> Festivo Colombia (Omitida)</span>
            <span className="legend-item"><span className="legend-dot cancelled"></span> Cancelada por Docente</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseScheduleModal;
