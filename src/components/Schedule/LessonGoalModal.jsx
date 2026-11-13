import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IconTarget, IconCalendar, IconClose, IconCheck, IconBook } from '../common/Icons';
import { DateTimePicker } from './DateTimePicker';
import './LessonGoalModal.css';

const LessonGoalModal = ({ course, isTeacher, onClose }) => {
  const { user, students, lessonGoals, setCourseLessonGoal } = useApp();

  const enrolledStudents = students.filter(s => 
    (s.enrolledCourses || []).includes(course.id) || s.courseId === course.id
  );

  const existingGoal = (lessonGoals || []).find(g => g.courseId === course.id) || null;

  const [targetLevel, setTargetLevel] = useState(existingGoal?.targetLevel || 5);
  const [language, setLanguage] = useState(existingGoal?.language || 'arduino');
  const [targetType, setTargetType] = useState(existingGoal?.targetType || 'all'); // 'all' | 'individual'
  const [selectedStudentId, setSelectedStudentId] = useState(existingGoal?.studentId || enrolledStudents[0]?.id || '');
  const [deadlineDate, setDeadlineDate] = useState(existingGoal?.deadlineDate || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [deadlineTime, setDeadlineTime] = useState(existingGoal?.deadlineTime || '23:59');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveGoal = (e) => {
    e.preventDefault();
    if (!targetLevel || !deadlineDate) {
      alert('Por favor selecciona el nivel meta y la fecha máxima.');
      return;
    }

    setCourseLessonGoal({
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      targetLevel: parseInt(targetLevel, 10),
      language,
      targetType,
      studentId: targetType === 'individual' ? selectedStudentId : null,
      deadlineDate,
      deadlineTime,
      createdAt: new Date().toISOString()
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  // Calcular cumplimiento de los estudiantes para el informe pedagógico
  const reportData = enrolledStudents.map(st => {
    const studentProg = st.progress?.[language]?.currentLevel || 1;
    const completed = studentProg >= targetLevel;
    const missing = Math.max(0, targetLevel - studentProg);
    const deadlinePass = new Date() > new Date(`${deadlineDate}T${deadlineTime}`);

    let difficultyNote = 'Buen ritmo de trabajo.';
    if (!completed && deadlinePass) {
      if (studentProg <= 2) {
        difficultyNote = 'Dificultad crítica: no ha avanzado en los conceptos iniciales de sintaxis.';
      } else {
        difficultyNote = 'Presentó retrasos en la resolución de retos intermedios antes de la fecha límite.';
      }
    } else if (!completed) {
      difficultyNote = 'En progreso hacia la meta.';
    } else {
      difficultyNote = 'Meta alcanzada satisfactoriamente.';
    }

    return {
      student: st,
      currentLevel: studentProg,
      completed,
      missing,
      difficultyNote
    };
  });

  return (
    <div className="goal-modal-overlay" onClick={onClose}>
      <div className="goal-modal-card" onClick={e => e.stopPropagation()}>
        <div className="goal-modal-head">
          <div className="goal-title-col">
            <h3><IconTarget size={20} color="var(--primary)" /> Asignación de Meta de Lecciones</h3>
            <p>Curso: <strong>{course.name}</strong> ({course.code}) • Grado {course.grade}°</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}><IconClose size={18} /></button>
        </div>

        {savedSuccess && (
          <div className="goal-saved-banner">
            <IconCheck size={16} /> ¡Meta de lecciones asignada y notificada a los estudiantes con éxito!
          </div>
        )}

        {isTeacher ? (
          <form onSubmit={handleSaveGoal} className="goal-form">
            <div className="goal-form-row">
              <div className="goal-form-group">
                <label>Lenguaje de Programación:</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value="arduino">Arduino C++</option>
                  <option value="scratch">Scratch Bloques</option>
                  <option value="python">Python</option>
                </select>
              </div>

              <div className="goal-form-group">
                <label>Lección Meta Obligatoria (Hasta cuál nivel):</label>
                <select value={targetLevel} onChange={e => setTargetLevel(e.target.value)}>
                  {[...Array(15)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Nivel {i + 1} (de 15 niveles)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="goal-form-row">
              <div className="goal-form-group">
                <label>Modalidad de Asignación:</label>
                <select value={targetType} onChange={e => setTargetType(e.target.value)}>
                  <option value="all">👥 Todo el grupo ({enrolledStudents.length} alumnos)</option>
                  <option value="individual">👤 Estudiante Específico</option>
                </select>
              </div>

              {targetType === 'individual' && (
                <div className="goal-form-group">
                  <label>Seleccionar Estudiante:</label>
                  <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
                    {enrolledStudents.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.name} {st.lastName || ''} ({st.grade}° Grado)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* SELECTOR INTERACTIVO DE FECHA Y HORA */}
            <div className="goal-form-group">
              <label>Fecha y Hora Máxima de Cumplimiento:</label>
              <DateTimePicker
                initialDate={deadlineDate}
                initialTime={deadlineTime}
                label="Fecha límite de entrega de la meta"
                onChange={({ date, time }) => {
                  setDeadlineDate(date);
                  setDeadlineTime(time);
                }}
              />
            </div>

            <div className="goal-actions">
              <button type="submit" className="btn-confirm-goal">
                <IconCheck size={16} /> Establecer Meta y Notificar
              </button>
            </div>
          </form>
        ) : (
          <div className="student-goal-status-box">
            {existingGoal ? (
              <div className="student-goal-card">
                <h4>🎯 Meta Asignada por tu Docente</h4>
                <p>Debes alcanzar o completar el <strong>Nivel {existingGoal.targetLevel}</strong> en <strong>{existingGoal.language?.toUpperCase()}</strong>.</p>
                <div className="goal-meta-details">
                  <span>📅 Fecha límite: <strong>{existingGoal.deadlineDate}</strong> a las <strong>{existingGoal.deadlineTime}</strong></span>
                  <span className="goal-countdown">
                    {new Date() > new Date(`${existingGoal.deadlineDate}T${existingGoal.deadlineTime}`)
                      ? '⛔ Plazo expirado'
                      : '⏳ Plazo en curso'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="no-goal-info">Tu profesor no ha asignado metas de lecciones específicas para este curso aún.</p>
            )}
          </div>
        )}

        {/* INFORME PEDAGÓGICO DE DIFICULTADES (DOCENTE) */}
        {isTeacher && existingGoal && (
          <div className="pedagogical-report-section">
            <h4>📊 Informe de Avance y Dificultades de Estudiantes</h4>
            <div className="report-table-scroll">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Nivel Actual</th>
                    <th>Meta</th>
                    <th>Estado</th>
                    <th>Diagnóstico Pedagógico</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, idx) => (
                    <tr key={idx}>
                      <td><strong>{row.student.name} {row.student.lastName || ''}</strong></td>
                      <td>Nivel {row.currentLevel}</td>
                      <td>Nivel {targetLevel}</td>
                      <td>
                        <span className={`status-pill ${row.completed ? 'completed' : 'pending'}`}>
                          {row.completed ? 'Cumplido ✓' : `Faltan ${row.missing} niv.`}
                        </span>
                      </td>
                      <td className="diff-cell">{row.difficultyNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonGoalModal;
