import React, { useState, useEffect, useRef } from 'react';
import { IconCalendar, IconClock, IconCheck, IconClose } from '../common/Icons';
import './DateTimePicker.css';

/**
 * Componente Selector de Fecha y Hora interactivo
 * Inspirado en Material Design con selector de calendario mensual y reloj analógico / digital
 */
export const DateTimePicker = ({
  initialDate = '',
  initialTime = '08:00',
  onChange,
  label = 'Seleccionar Fecha y Hora'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('date'); // 'date' | 'time'
  
  // Estado fecha
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [viewYear, setViewYear] = useState(() => {
    return selectedDate ? parseInt(selectedDate.split('-')[0], 10) : new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    return selectedDate ? parseInt(selectedDate.split('-')[1], 10) - 1 : new Date().getMonth();
  });

  // Estado hora
  const [selectedHour, setSelectedHour] = useState(() => {
    const parts = (initialTime || '08:00').split(':');
    let h = parseInt(parts[0], 10) || 8;
    return h > 12 ? h - 12 : (h === 0 ? 12 : h);
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    const parts = (initialTime || '08:00').split(':');
    return parseInt(parts[1], 10) || 0;
  });
  const [period, setPeriod] = useState(() => {
    const h = parseInt((initialTime || '08:00').split(':')[0], 10) || 8;
    return h >= 12 ? 'PM' : 'AM';
  });

  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Formato 24h para retorno
  const get24HourTime = () => {
    let h = selectedHour;
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
  };

  const handleConfirm = () => {
    const finalTime = get24HourTime();
    if (onChange) {
      onChange({ date: selectedDate, time: finalTime });
    }
    setIsOpen(false);
  };

  // Generador días del mes
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <div className="dt-picker-wrapper" ref={pickerRef}>
      <div className="dt-trigger-box" onClick={() => setIsOpen(!isOpen)}>
        <div className="dt-display-content">
          <span className="dt-label">{label}</span>
          <div className="dt-values">
            <span className="dt-val"><IconCalendar size={14} /> {selectedDate || 'AAAA-MM-DD'}</span>
            <span className="dt-divider">•</span>
            <span className="dt-val"><IconClock size={14} /> {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')} {period}</span>
          </div>
        </div>
        <button type="button" className="dt-open-btn">
          <IconCalendar size={16} />
        </button>
      </div>

      {isOpen && (
        <div className="dt-dropdown-modal">
          {/* TABS DE SELECCIÓN */}
          <div className="dt-modal-tabs">
            <button
              type="button"
              className={`dt-tab-btn ${activeTab === 'date' ? 'active' : ''}`}
              onClick={() => setActiveTab('date')}
            >
              <IconCalendar size={15} /> Fecha
            </button>
            <button
              type="button"
              className={`dt-tab-btn ${activeTab === 'time' ? 'active' : ''}`}
              onClick={() => setActiveTab('time')}
            >
              <IconClock size={15} /> Hora
            </button>
          </div>

          <div className="dt-tab-content">
            {/* TAB FECHA: CALENDARIO ELEGANTE */}
            {activeTab === 'date' && (
              <div className="dt-calendar-view">
                <div className="dt-cal-nav">
                  <span className="dt-cal-title">{monthNames[viewMonth]} {viewYear}</span>
                  <div className="dt-cal-arrows">
                    <button
                      type="button"
                      onClick={() => {
                        if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
                        else setViewMonth(viewMonth - 1);
                      }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
                        else setViewMonth(viewMonth + 1);
                      }}
                    >
                      ▼
                    </button>
                  </div>
                </div>

                <div className="dt-weekdays-row">
                  {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map((w, idx) => (
                    <span key={idx}>{w}</span>
                  ))}
                </div>

                <div className="dt-days-grid">
                  {calendarDays.map((d, idx) => {
                    if (!d) return <div key={`empty-${idx}`} className="dt-day-cell empty"></div>;
                    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        type="button"
                        key={`day-${d}`}
                        className={`dt-day-cell ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedDate(dateStr)}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB HORA: RELOJ ANALÓGICO / DIGITAL CON AM/PM */}
            {activeTab === 'time' && (
              <div className="dt-time-view">
                <div className="dt-time-display-row">
                  <div className="dt-digits-box">
                    <span className="dt-big-digit">{String(selectedHour).padStart(2, '0')}</span>
                    <span className="dt-colon">:</span>
                    <span className="dt-big-digit">{String(selectedMinute).padStart(2, '0')}</span>
                  </div>
                  <div className="dt-ampm-selector">
                    <button
                      type="button"
                      className={`btn-ampm ${period === 'AM' ? 'active' : ''}`}
                      onClick={() => setPeriod('AM')}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      className={`btn-ampm ${period === 'PM' ? 'active' : ''}`}
                      onClick={() => setPeriod('PM')}
                    >
                      PM
                    </button>
                  </div>
                </div>

                {/* SELECTOR RELOJ DE MANECILLAS */}
                <div className="dt-clock-face">
                  <div className="dt-clock-center-dot"></div>
                  {/* Manecilla visual */}
                  <div
                    className="dt-clock-hand"
                    style={{
                      transform: `rotate(${((selectedHour % 12) * 30) - 90}deg)`
                    }}
                  ></div>
                  {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => {
                    const angle = ((h % 12) * 30 - 90) * (Math.PI / 180);
                    const radius = 68; // radio en px
                    const x = Math.round(85 + radius * Math.cos(angle));
                    const y = Math.round(85 + radius * Math.sin(angle));
                    const isHourSelected = selectedHour === h;

                    return (
                      <button
                        type="button"
                        key={`h-${h}`}
                        className={`dt-clock-number ${isHourSelected ? 'selected' : ''}`}
                        style={{ left: `${x}px`, top: `${y}px` }}
                        onClick={() => setSelectedHour(h)}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>

                {/* SELECCIÓN RÁPIDA DE MINUTOS */}
                <div className="dt-minutes-quick-row">
                  {[0, 15, 30, 45].map(m => (
                    <button
                      type="button"
                      key={m}
                      className={`dt-min-chip ${selectedMinute === m ? 'selected' : ''}`}
                      onClick={() => setSelectedMinute(m)}
                    >
                      :{String(m).padStart(2, '0')} min
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="dt-modal-footer">
            <button type="button" className="dt-btn-cancel" onClick={() => setIsOpen(false)}>
              Cancelar
            </button>
            <button type="button" className="dt-btn-ok" onClick={handleConfirm}>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
