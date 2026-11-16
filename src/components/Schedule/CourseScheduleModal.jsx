import React, { useState } from 'react';
import { isColombianHoliday, DAY_NAMES } from '../../utils/colombianHolidays';
import { TimePickerModal } from './DateTimePicker';
import { IconClock, IconCalendar, IconCheck, IconClose, IconAlertTriangle } from '../common/Icons';
import './CourseScheduleModal.css';

const CourseScheduleModal = ({ course, isTeacher, onClose, onSaveSchedule, onToggleCancellation, allCourses = [] }) => {
  const [selectedDays, setSelectedDays] = useState(course.scheduleDays || ['1', '3']);
  const [startTime, setStartTime] = useState(course.startTime || '08:00');
  const [endTime, setEndTime] = useState(course.endTime || '09:30');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [conflicts, setConflicts] = useState([]);

  // Estados para TimePicker interactivo estilo Material
  const [pickingTimeField, setPickingTimeField] = useState(null); // 'start' o 'end'

  const availableWeekDays = [
    { id: '1', name: 'Lunes' },
    { id: '2', name: 'Martes' },
    { id: '3', name: 'Miércoles' },
    { id: '4', name: 'Jueves' },
    { id: '5', name: 'Viernes' },
    { id: '6', name: 'Sábado' }
  ];

  const handleDayToggle = (dayId) => {
    let next;
    if (selectedDays.includes(dayId)) {
      next = selectedDays.filter(d => d !== dayId);
    } else {
      next = [...selectedDays, dayId];
    }
    setSelectedDays(next);
    validateConflicts(next, startTime, endTime);
  };

  const validateConflicts = (days, start, end) => {
    const found = [];
    const otherCourses = allCourses.filter(c => c.id !== course.id);

    days.forEach(d => {
      otherCourses.forEach(oc => {
        if ((oc.scheduleDays || []).includes(d)) {
          const ocStart = oc.startTime || '08:00';
          const ocEnd = oc.endTime || '09:30';
          if (start < ocEnd && end > ocStart) {
            found.push({
              day: DAY_NAMES[d] || d,
              otherCourse: oc.name,
              otherTime: `${ocStart} - ${ocEnd}`
            });
          }
        }
      });
    });

    setConflicts(found);
  };

  const handleSave = () => {
    onSaveSchedule(course.id, {
      scheduleDays: selectedDays,
      startTime,
      endTime
    });
    onClose();
  };

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y, m) => new Date(y, m, 1).getDay();

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDay(currentYear, currentMonth);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  return (
    <div className="schedule-modal-overlay" onClick={onClose}>
      <div className="schedule-modal-card" onClick={e => e.stopPropagation()}>
        <div className="schedule-modal-header">
          <div>
            <h3>Horario de Clases: {course.name}</h3>
            <p className="subtext">Código: {course.code} • Ajusta días, horas y gestiona cancelaciones</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}><IconClose size={20} /></button>
        </div>

        <div className="schedule-modal-body">
          {/* SECCIÓN 1: DÍAS Y HORARIOS (SOLO DOCENTE) */}
          {isTeacher ? (
            <div className="schedule-config-section">
              <h4>1. Configuración de Días y Horas</h4>
              <div className="days-selector-row">
                {availableWeekDays.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    className={`day-pill ${selectedDays.includes(d.id) ? 'active' : ''}`}
                    onClick={() => handleDayToggle(d.id)}
                  >
                    {d.name}
                  </button>
                ))}
              </div>

              {/* Selector interactivo de Hora de Inicio y Fin con Reloj Material */}
              <div className="time-pickers-row">
                <div className="time-field">
                  <label>Hora Inicio:</label>
                  <button
                    type="button"
                    className="time-picker-trigger-btn"
                    onClick={() => setPickingTimeField('start')}
                  >
                    <IconClock size={16} />
                    <span>{startTime}</span>
                  </button>
                </div>
                <div className="time-field">
                  <label>Hora Fin:</label>
                  <button
                    type="button"
                    className="time-picker-trigger-btn"
                    onClick={() => setPickingTimeField('end')}
                  >
                    <IconClock size={16} />
                    <span>{endTime}</span>
                  </button>
                </div>
              </div>

              {/* ALERTA DE CRUCE DE HORARIOS */}
              {conflicts.length > 0 && (
                <div className="conflict-alert-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <IconAlertTriangle size={18} color="#FF9800" />
                    <strong>¡Atención! Cruce de horarios detectado:</strong>
                  </div>
                  <ul>
                    {conflicts.map((c, i) => (
                      <li key={i}>El {c.day} colisiona con <strong>{c.otherCourse}</strong> ({c.otherTime})</li>
                    ))}
                  </ul>
                  <small>Te recomendamos cambiar la hora o los días para evitar cruces con otros cursos.</small>
                </div>
              )}
            </div>
          ) : (
            <div className="student-schedule-summary">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconCalendar size={18} color="var(--primary)" />
                Horario de Clase Establecido
              </h4>
              <p>
                <strong>Días:</strong> {selectedDays.map(d => DAY_NAMES[d] || d).join(', ') || 'Por definir'}
              </p>
              <p>
                <strong>Horario:</strong> {startTime} a {endTime}
              </p>
            </div>
          )}

          {/* SECCIÓN 2: CALENDARIO DE CLASES Y CANCELACIONES */}
          <div className="schedule-calendar-section">
            <div className="calendar-header-nav">
              <h4>2. Calendario Mensual y Excepciones</h4>
              <div className="month-nav-controls">
                <button
                  type="button"
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
                <span>{monthNames[currentMonth]} {currentYear}</span>
                <button
                  type="button"
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

            <p className="calendar-instruction">
              {isTeacher
                ? 'Los días festivos en Colombia omiten automáticamente la clase. Haz clic sobre un día con clase programada para cancelarlo individualmente si surge un imprevisto.'
                : 'Consulta los días de clase del mes. Los días en rojo representan festivos nacionales donde no habrá sesión.'}
            </p>

            <div className="schedule-weekdays-strip">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((w, i) => (
                <span key={i}>{w}</span>
              ))}
            </div>

            <div className="schedule-days-grid">
              {cells.map((d, i) => {
                if (!d) return <div key={`empty-${i}`} className="sched-cell empty"></div>;

                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const dObj = new Date(currentYear, currentMonth, d);
                const dow = String(dObj.getDay());
                const isSelectedDay = selectedDays.includes(dow);
                const holiday = isColombianHoliday(dateStr);
                const isCancelled = (course.cancelledDates || []).includes(dateStr);

                let cellClass = 'sched-cell';
                let tooltip = '';

                if (holiday.isHoliday) {
                  cellClass += ' holiday';
                  tooltip = `Festivo en Colombia: ${holiday.name} (Clase omitida automáticamente)`;
                } else if (isCancelled) {
                  cellClass += ' cancelled';
                  tooltip = 'Clase cancelada por el docente';
                } else if (isSelectedDay) {
                  cellClass += ' class-active';
                  tooltip = `Clase programada: ${startTime} a ${endTime}`;
                }

                return (
                  <button
                    key={`day-${d}`}
                    type="button"
                    className={cellClass}
                    title={tooltip}
                    onClick={() => {
                      if (isTeacher && isSelectedDay && !holiday.isHoliday && onToggleCancellation) {
                        onToggleCancellation(course.id, dateStr);
                      }
                    }}
                  >
                    <span className="cell-day-num">{d}</span>
                    {holiday.isHoliday && <span className="cell-tag-dot holiday-dot"></span>}
                    {isCancelled && <span className="cell-tag-dot cancelled-dot"></span>}
                    {isSelectedDay && !holiday.isHoliday && !isCancelled && <span className="cell-tag-dot active-dot"></span>}
                  </button>
                );
              })}
            </div>

            <div className="calendar-legend-row">
              <span className="legend-item"><span className="legend-dot active-dot"></span> Clase Normal</span>
              <span className="legend-item"><span className="legend-dot holiday-dot"></span> Festivo Colombia (Omitida)</span>
              <span className="legend-item"><span className="legend-dot cancelled-dot"></span> Cancelada por Docente</span>
            </div>
          </div>
        </div>

        <div className="schedule-modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cerrar</button>
          {isTeacher && (
            <button type="button" className="btn-primary" onClick={handleSave}>
              Guardar Cambios de Horario
            </button>
          )}
        </div>

        {/* TIME PICKER MODAL INTERACTIVO */}
        {pickingTimeField && (
          <TimePickerModal
            isOpen={!!pickingTimeField}
            onClose={() => setPickingTimeField(null)}
            initialTime={pickingTimeField === 'start' ? startTime : endTime}
            onSelectTime={(newTime) => {
              if (pickingTimeField === 'start') {
                setStartTime(newTime);
                validateConflicts(selectedDays, newTime, endTime);
              } else {
                setEndTime(newTime);
                validateConflicts(selectedDays, startTime, newTime);
              }
              setPickingTimeField(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CourseScheduleModal;
