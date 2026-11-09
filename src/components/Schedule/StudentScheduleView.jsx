import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { isColombianHoliday, DAY_NAMES } from '../../utils/colombianHolidays';
import './StudentScheduleView.css';

const StudentScheduleView = ({ onClose }) => {
  const { students, courses } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || null);

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const enrolledCourses = courses.filter(c => (selectedStudent?.enrolledCourses || []).includes(c.id) || selectedStudent?.courseId === c.id);

  const weekDays = [
    { id: '1', name: 'Lunes' },
    { id: '2', name: 'Martes' },
    { id: '3', name: 'Miércoles' },
    { id: '4', name: 'Jueves' },
    { id: '5', name: 'Viernes' },
    { id: '6', name: 'Sábado' }
  ];

  return (
    <div className="st-sched-overlay" onClick={onClose}>
      <div className="st-sched-card" onClick={e => e.stopPropagation()}>
        <div className="st-sched-header">
          <div>
            <h3>📅 Horarios de Estudiantes (Solo Docentes)</h3>
            <p>Supervisa la carga horaria y disponibilidad académica semanal de cada alumno</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="st-sched-body">
          {/* SELECTOR DE ESTUDIANTE */}
          <div className="student-picker-row">
            <label>Selecciona un Estudiante:</label>
            <select
              value={selectedStudent?.id || ''}
              onChange={e => setSelectedStudentId(e.target.value)}
            >
              {students.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name} {st.lastName || ''} ({st.grade}° Grado)
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="student-schedule-summary">
              <div className="st-info-banner">
                <span className="st-avatar-badge">{selectedStudent.name.charAt(0)}</span>
                <div>
                  <h4>{selectedStudent.name} {selectedStudent.lastName || ''}</h4>
                  <p>{selectedStudent.grade}° Grado • {enrolledCourses.length} Curso(s) Matriculado(s)</p>
                </div>
              </div>

              {/* MATRIZ DE HORARIO SEMANAL */}
              <div className="weekly-schedule-matrix">
                {weekDays.map(day => {
                  const dayCourses = enrolledCourses.filter(c => (c.scheduleDays || []).includes(day.id));

                  return (
                    <div key={day.id} className="day-schedule-column">
                      <div className="day-column-head">
                        <strong>{day.name}</strong>
                        <span className="day-count">{dayCourses.length} sesión(es)</span>
                      </div>

                      <div className="day-classes-list">
                        {dayCourses.length === 0 ? (
                          <div className="no-class-slot">Libre</div>
                        ) : (
                          dayCourses.map(c => (
                            <div key={c.id} className="matrix-class-card" style={{ borderLeftColor: c.color || 'var(--primary)' }}>
                              <span className="matrix-time">{c.startTime || '08:00'} - {c.endTime || '09:30'}</span>
                              <strong className="matrix-course-name">{c.name}</strong>
                              <small className="matrix-course-code">{c.code}</small>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentScheduleView;
