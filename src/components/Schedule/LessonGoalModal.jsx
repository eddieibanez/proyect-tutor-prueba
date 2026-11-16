import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DatePickerModal } from './DateTimePicker';
import { IconTarget, IconCalendar, IconCheck, IconClose } from '../common/Icons';
import './LessonGoalModal.css';

const LessonGoalModal = ({ isOpen, onClose, courses = [], students = [] }) => {
  const { assignLessonGoal, lessonGoals = [] } = useApp();

  const [assignmentType, setAssignmentType] = useState('group'); // 'group' o 'individual'
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedLanguage, setSelectedLanguage] = useState('arduino');
  const [targetLevel, setTargetLevel] = useState(5);
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deadlineDate) return;

    const courseObj = courses.find(c => c.id === selectedCourseId);
    const studentObj = students.find(s => s.id === selectedStudentId);

    const newGoal = {
      id: `goal-${Date.now()}`,
      type: assignmentType,
      courseId: assignmentType === 'group' ? selectedCourseId : null,
      courseName: assignmentType === 'group' ? (courseObj?.name || 'Curso General') : null,
      studentId: assignmentType === 'individual' ? selectedStudentId : null,
      studentName: assignmentType === 'individual' ? (studentObj?.name || 'Estudiante') : null,
      language: selectedLanguage,
      targetLevel: parseInt(targetLevel, 10),
      deadline: deadlineDate,
      createdAt: new Date().toISOString()
    };

    if (assignLessonGoal) {
      assignLessonGoal(newGoal);
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="goal-modal-overlay" onClick={onClose}>
      <div className="goal-modal-card" onClick={e => e.stopPropagation()}>
        <div className="goal-modal-header">
          <div className="header-title-box">
            <IconTarget size={24} color="#00BCD4" />
            <div>
              <h3>Asignar Meta de Lecciones</h3>
              <p>Establece un límite de progreso y fecha máxima para los alumnos</p>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <IconClose size={20} />
          </button>
        </div>

        {isSaved ? (
          <div className="goal-success-view">
            <div className="success-icon-box">
              <IconCheck size={40} color="#00E676" />
            </div>
            <h4>¡Meta Asignada Exitosamente!</h4>
            <p>Se ha notificado a los alumnos y registrado el plazo en sus calendarios.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="goal-form">
            {/* Modalidad: Grupal vs Individual */}
            <div className="form-group">
              <label className="form-label">Modalidad de Asignación:</label>
              <div className="assignment-type-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${assignmentType === 'group' ? 'active' : ''}`}
                  onClick={() => setAssignmentType('group')}
                >
                  👥 Asignar por Curso Completo
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${assignmentType === 'individual' ? 'active' : ''}`}
                  onClick={() => setAssignmentType('individual')}
                >
                  👤 Asignar a Estudiante Individual
                </button>
              </div>
            </div>

            {/* Selector de Curso o Estudiante */}
            {assignmentType === 'group' ? (
              <div className="form-group">
                <label className="form-label">Seleccionar Curso:</label>
                <select
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                  className="goal-select"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code || 'CC'})</option>
                  ))}
                  {courses.length === 0 && <option value="">Sin cursos registrados</option>}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Seleccionar Estudiante:</label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="goal-select"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.lastName || ''} ({s.grade || 'N/A'}° Grado)</option>
                  ))}
                  {students.length === 0 && <option value="">Sin estudiantes registrados</option>}
                </select>
              </div>
            )}

            {/* Lenguaje */}
            <div className="form-group">
              <label className="form-label">Ruta de Programación:</label>
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                className="goal-select"
              >
                <option value="arduino">C++ Arduino</option>
                <option value="scratch">Scratch (Bloques)</option>
                <option value="python">Python 3</option>
              </select>
            </div>

            {/* Nivel Meta */}
            <div className="form-group">
              <div className="label-with-badge">
                <label className="form-label">Lección Meta Máxima (1 a 15):</label>
                <span className="goal-level-badge">Nivel {targetLevel}</span>
              </div>
              <select
                className="goal-select-dropdown"
                value={targetLevel}
                onChange={e => setTargetLevel(parseInt(e.target.value, 10))}
              >
                {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>
                    Nivel {num}: {num <= 5 ? 'Fundamentos Iniciales' : num <= 10 ? 'Estructuras y Algoritmos' : 'Retos Avanzados y Proyecto'}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Límite con selector interactivo */}
            <div className="form-group">
              <label className="form-label">Fecha Límite de Entrega / Cumplimiento:</label>
              <div className="date-input-picker-row">
                <button
                  type="button"
                  className="btn-trigger-picker"
                  onClick={() => setShowDatePicker(true)}
                >
                  <IconCalendar size={18} />
                  <span>{deadlineDate || 'Seleccionar fecha...'}</span>
                </button>
                <small className="helper-note">Se registrará en el calendario y se generará reporte de dificultades si no se alcanza.</small>
              </div>
            </div>

            <div className="goal-form-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn-save-goal">
                <IconTarget size={18} />
                <span>Confirmar y Notificar Meta</span>
              </button>
            </div>
          </form>
        )}

        <DatePickerModal
          isOpen={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelectDate={setDeadlineDate}
          initialDate={deadlineDate}
        />
      </div>
    </div>
  );
};

export default LessonGoalModal;
