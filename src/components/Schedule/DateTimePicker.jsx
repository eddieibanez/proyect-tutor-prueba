import React, { useState } from 'react';
import { IconClock, IconCalendar } from '../common/Icons';
import './DateTimePicker.css';

export const DatePickerModal = ({ isOpen, onClose, onSelectDate, initialDate }) => {
  const init = initialDate ? new Date(initialDate + 'T00:00:00') : new Date();
  const [viewMonth, setViewMonth] = useState(init.getMonth());
  const [viewYear, setViewYear] = useState(init.getFullYear());
  const [selectedDay, setSelectedDay] = useState(init.getDate());

  if (!isOpen) return null;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const totalDays = getDaysInMonth(viewYear, viewMonth);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleConfirm = () => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    onSelectDate(formatted);
    onClose();
  };

  return (
    <div className="picker-dialog-overlay" onClick={onClose}>
      <div className="picker-card date-card" onClick={e => e.stopPropagation()}>
        <div className="picker-header-nav">
          <span className="picker-title-label">
            📅 Selector de Fecha
          </span>
          <div className="picker-nav-arrows">
            <button type="button" className="arrow-btn" onClick={handlePrevMonth} title="Mes anterior">▲</button>
            <button type="button" className="arrow-btn" onClick={handleNextMonth} title="Mes siguiente">▼</button>
          </div>
        </div>

        <div className="picker-selected-preview">
          <span className="preview-label">Fecha seleccionada</span>
          <span className="preview-date-value">
            {selectedDay} de {monthNames[viewMonth]} de {viewYear}
          </span>
        </div>

        <div className="picker-dropdowns-row">
          <div className="picker-dropdown-group">
            <label className="picker-dropdown-label">Día:</label>
            <select
              className="picker-select-inline"
              value={selectedDay}
              onChange={e => setSelectedDay(parseInt(e.target.value, 10))}
            >
              {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>Día {d}</option>
              ))}
            </select>
          </div>
          <div className="picker-dropdown-group">
            <label className="picker-dropdown-label">Mes:</label>
            <select
              className="picker-select-inline"
              value={viewMonth}
              onChange={e => {
                const newM = parseInt(e.target.value, 10);
                setViewMonth(newM);
                const maxD = getDaysInMonth(viewYear, newM);
                if (selectedDay > maxD) setSelectedDay(maxD);
              }}
            >
              {monthNames.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
          </div>
          <div className="picker-dropdown-group">
            <label className="picker-dropdown-label">Año:</label>
            <select
              className="picker-select-inline"
              value={viewYear}
              onChange={e => setViewYear(parseInt(e.target.value, 10))}
            >
              {Array.from({ length: 10 }, (_, i) => 2024 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="picker-dialog-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn-ok" onClick={handleConfirm}>Aceptar</button>
        </div>
      </div>
    </div>
  );
};

export const TimePickerModal = ({ isOpen, onClose, onSelectTime, initialTime = '08:00' }) => {
  const parts = (initialTime || '08:00').split(':');
  let rawH = parseInt(parts[0], 10) || 8;
  const rawM = parseInt(parts[1], 10) || 0;

  const [period, setPeriod] = useState(rawH >= 12 ? 'PM' : 'AM');
  const [hour, setHour] = useState(rawH % 12 === 0 ? 12 : rawH % 12);
  const [minute, setMinute] = useState(rawM);
  const [mode, setMode] = useState('hour'); // 'hour' o 'minute'
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  if (!isOpen) return null;

  const hoursDial = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const handleDialClick = (val) => {
    if (mode === 'hour') {
      setHour(val);
      setMode('minute');
    } else {
      setMinute(val * 5 % 60);
    }
  };

  const handleConfirm = () => {
    let finalH = hour % 12;
    if (period === 'PM') finalH += 12;
    const formatted = `${String(finalH).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onSelectTime(formatted);
    onClose();
  };

  // Ángulo de la aguja del reloj
  const hourAngle = (hour % 12) * 30;
  const minuteAngle = minute * 6;
  const currentAngle = mode === 'hour' ? hourAngle : minuteAngle;

  return (
    <div className="picker-dialog-overlay" onClick={onClose}>
      <div className="picker-card time-card" onClick={e => e.stopPropagation()}>
        <div className="time-picker-title">
          <span>{isKeyboardMode ? 'Ingresar hora' : 'Seleccionar hora'}</span>
        </div>

        {/* Cajas de Horas / Minutos y Botón AM/PM */}
        <div className="time-display-row">
          <div className="digits-group">
            <button
              type="button"
              className={`digit-box ${mode === 'hour' ? 'active-unit' : ''}`}
              onClick={() => setMode('hour')}
            >
              {String(hour).padStart(2, '0')}
            </button>
            <span className="time-colon">:</span>
            <button
              type="button"
              className={`digit-box ${mode === 'minute' ? 'active-unit' : ''}`}
              onClick={() => setMode('minute')}
            >
              {String(minute).padStart(2, '0')}
            </button>
          </div>

          <div className="ampm-toggle-col">
            <button
              type="button"
              className={`ampm-btn ${period === 'AM' ? 'active-ampm' : ''}`}
              onClick={() => setPeriod('AM')}
            >
              AM
            </button>
            <button
              type="button"
              className={`ampm-btn ${period === 'PM' ? 'active-ampm' : ''}`}
              onClick={() => setPeriod('PM')}
            >
              PM
            </button>
          </div>
        </div>

        {/* Vista Dial Circular o Teclado */}
        {!isKeyboardMode ? (
          <div className="analog-clock-container">
            <div className="clock-dial-face">
              <div
                className="clock-hand"
                style={{ transform: `rotate(${currentAngle}deg)` }}
              >
                <div className="clock-hand-endpoint">
                  <span className="hand-value-text">{mode === 'hour' ? hour : String(minute).padStart(2, '0')}</span>
                </div>
              </div>
              <div className="clock-center-dot"></div>

              {hoursDial.map((h, i) => {
                const angle = i * 30;
                const rad = (angle - 90) * (Math.PI / 180);
                const r = 88; // radio en px
                const x = Math.round(110 + r * Math.cos(rad));
                const y = Math.round(110 + r * Math.sin(rad));
                const isSelected = mode === 'hour' ? hour === h : minute === (h * 5 % 60);

                return (
                  <button
                    key={h}
                    type="button"
                    className={`dial-number-btn ${isSelected ? 'active-number' : ''}`}
                    style={{ left: `${x}px`, top: `${y}px` }}
                    onClick={() => handleDialClick(h)}
                  >
                    {mode === 'hour' ? h : String(h * 5 % 60).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="keyboard-time-inputs">
            <div className="field-block">
              <input
                type="number"
                min="1"
                max="12"
                value={hour}
                onChange={e => setHour(Math.min(12, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                className="kbd-input"
              />
              <small>Hora</small>
            </div>
            <span className="kbd-sep">:</span>
            <div className="field-block">
              <input
                type="number"
                min="0"
                max="59"
                value={minute}
                onChange={e => setMinute(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                className="kbd-input"
              />
              <small>Minuto</small>
            </div>
          </div>
        )}

        <div className="picker-footer-bar">
          <button
            type="button"
            className="btn-toggle-input-mode"
            onClick={() => setIsKeyboardMode(!isKeyboardMode)}
            title={isKeyboardMode ? 'Usar reloj interactivo' : 'Ingresar con teclado'}
          >
            {isKeyboardMode ? <IconClock size={20} /> : <span style={{ fontSize: '1.2rem' }}>⌨️</span>}
          </button>
          <div className="footer-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="button" className="btn-ok" onClick={handleConfirm}>Aceptar</button>
          </div>
        </div>
      </div>
    </div>
  );
};
