import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IconTarget, IconCalendar, IconClock, IconClose, IconCheck, IconBook } from '../common/Icons';
import { DateTimePicker } from '../Schedule/DateTimePicker';
import './CourseTasksModal.css';

const CourseTasksModal = ({ course, isTeacher, onClose }) => {
  const { user, students, tasks, addTask, submitTask } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    type: 'project',
    targetType: 'all',
    assignedStudentIds: [],
    dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    dueTime: '23:59',
    allowLateSubmission: true
  });

  const courseTasks = (tasks || []).filter(t => t.courseId === course.id);
  const enrolledStudents = students.filter(s => (s.enrolledCourses || []).includes(course.id) || s.courseId === course.id);

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.dueDate) {
      alert('Por favor indica el título y la fecha límite de la tarea.');
      return;
    }

    addTask({
      ...taskForm,
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      createdBy: user.id
    });

    setShowCreateModal(false);
    setTaskForm({
      title: '',
      description: '',
      type: 'project',
      targetType: 'all',
      assignedStudentIds: [],
      dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      dueTime: '23:59',
      allowLateSubmission: true
    });
  };

  const handleStudentSubmit = (taskId, comment) => {
    submitTask(taskId, {
      studentId: user.id,
      studentName: `${user.name || user.nombre} ${user.lastName || user.apellido || ''}`.trim(),
      comment: comment || 'Entrega realizada por el estudiante.'
    });
  };

  return (
    <div className="tasks-modal-overlay" onClick={onClose}>
      <div className="tasks-modal-card" onClick={e => e.stopPropagation()}>
        <div className="tasks-modal-header">
          <div>
            <h3><IconBook size={20} color="var(--primary)" /> Tareas, Proyectos y Lecciones Asignadas</h3>
            <p>Curso: <strong>{course.name}</strong> ({course.code}) • Grado {course.grade}°</p>
          </div>
          <div className="header-actions-row">
            {isTeacher && (
              <button
                type="button"
                className="btn-add-task-trigger"
                onClick={() => setShowCreateModal(true)}
              >
                + Asignar Nueva Tarea
              </button>
            )}
            <button type="button" className="close-btn" onClick={onClose}>
              <IconClose size={18} />
            </button>
          </div>
        </div>

        {/* LISTA DE TAREAS */}
        <div className="tasks-list-container">
          {courseTasks.length === 0 ? (
            <div className="empty-tasks-alert">
              <span className="empty-icon"><IconBook size={48} color="var(--text-muted)" /></span>
              <h4>No hay tareas asignadas en este curso todavía</h4>
              <p>{isTeacher ? 'Crea la primera tarea para tus estudiantes usando el botón "+ Asignar Nueva Tarea".' : 'Tu profesor aún no ha publicado tareas para este curso.'}</p>
            </div>
          ) : (
            courseTasks.map(t => {
              const dueDateTime = new Date(`${t.dueDate}T${t.dueTime || '23:59'}`);
              const isPastDue = new Date() > dueDateTime;
              const mySubmission = (t.submissions || []).find(s => s.studentId === user.id);
              const isSubmitted = !!mySubmission;
              const isLate = mySubmission?.isLate;
              const canSubmit = !isSubmitted && (!isPastDue || t.allowLateSubmission);

              return (
                <div key={t.id} className={`task-item-card ${isPastDue ? 'past-due' : ''}`}>
                  <div className="task-card-main">
                    <div className="task-badge-row">
                      <span className={`task-type-badge ${t.type}`}>
                        {t.type === 'project' ? 'Proyecto' : t.type === 'lesson' ? 'Completar Lección' : 'Ejercicio'}
                      </span>
                      <span className="task-target-badge">
                        {t.targetType === 'all' ? 'Para todo el curso' : t.targetType === 'group' ? 'Grupal' : 'Individual'}
                      </span>
                      {t.allowLateSubmission ? (
                        <span className="policy-badge allowed">✓ Permite entrega tardía</span>
                      ) : (
                        <span className="policy-badge strict">✕ Cierre estricto</span>
                      )}
                    </div>

                    <h4 className="task-title">{t.title}</h4>
                    <p className="task-desc">{t.description}</p>

                    <div className="task-meta-footer">
                      <span className="due-date-text">
                        <IconClock size={14} /> Fecha límite: <strong>{t.dueDate}</strong> a las <strong>{t.dueTime || '23:59'}</strong>
                      </span>

                      {!isTeacher && (
                        <div className="submission-status-box">
                          {isSubmitted ? (
                            <span className={`status-pill submitted ${isLate ? 'late' : ''}`}>
                              {isLate ? 'Entrega tardía' : 'Entregada a tiempo ✓'}
                              <small> ({new Date(mySubmission.submittedAt).toLocaleDateString()})</small>
                            </span>
                          ) : isPastDue && !t.allowLateSubmission ? (
                            <span className="status-pill closed">Plazo cerrado (No se admiten entregas)</span>
                          ) : (
                            <span className="status-pill pending">Pendiente de entrega</span>
                          )}
                        </div>
                      )}

                      {isTeacher && (
                        <span className="teacher-submissions-counter">
                          {(t.submissions || []).length} de {enrolledStudents.length} entregas recibidas
                        </span>
                      )}
                    </div>
                  </div>

                  {!isTeacher && (
                    <div className="task-action-col">
                      {isSubmitted ? (
                        <button type="button" className="btn-task-submitted" disabled>
                          Entregado ✓
                        </button>
                      ) : canSubmit ? (
                        <button
                          type="button"
                          className={`btn-task-submit ${isPastDue ? 'late-submit' : ''}`}
                          onClick={() => {
                            const note = window.prompt('Escribe una nota o enlace de tu entrega para el docente:');
                            if (note !== null) handleStudentSubmit(t.id, note);
                          }}
                        >
                          {isPastDue ? 'Entregar (Tardía)' : 'Enviar Entrega'}
                        </button>
                      ) : (
                        <button type="button" className="btn-task-closed" disabled>
                          Cerrada
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* SUBMODAL CON SELECTOR DE FECHA Y HORA INTERACTIVO */}
        {showCreateModal && (
          <div className="create-task-submodal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="create-task-submodal" onClick={e => e.stopPropagation()}>
              <div className="submodal-head">
                <h4>Asignar Nueva Tarea o Proyecto</h4>
                <button type="button" className="close-btn" onClick={() => setShowCreateModal(false)}>
                  <IconClose size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="task-form">
                <div className="form-group">
                  <label>Título de la tarea o proyecto:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Reto de Semáforo en Arduino o Juego en Scratch"
                    value={taskForm.title}
                    onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Instrucciones y objetivos:</label>
                  <textarea
                    rows={3}
                    placeholder="Describe los requerimientos y rúbrica para completar la tarea..."
                    value={taskForm.description}
                    onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de Tarea:</label>
                    <select
                      value={taskForm.type}
                      onChange={e => setTaskForm({ ...taskForm, type: e.target.value })}
                    >
                      <option value="project">Proyecto Práctico</option>
                      <option value="lesson">Completar Lección</option>
                      <option value="exercise">Ejercicio / Cuestionario</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Asignar a:</label>
                    <select
                      value={taskForm.targetType}
                      onChange={e => setTaskForm({ ...taskForm, targetType: e.target.value })}
                    >
                      <option value="all">Todo el curso</option>
                      <option value="group">Grupal</option>
                      <option value="individual">Individual</option>
                    </select>
                  </div>
                </div>

                {/* SELECTOR INTERACTIVO DE FECHA Y HORA */}
                <div className="form-group">
                  <label>Fecha y Hora Límite de Entrega:</label>
                  <DateTimePicker
                    initialDate={taskForm.dueDate}
                    initialTime={taskForm.dueTime}
                    label="Selecciona plazo límite"
                    onChange={({ date, time }) => {
                      setTaskForm(prev => ({ ...prev, dueDate: date, dueTime: time }));
                    }}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={taskForm.allowLateSubmission}
                      onChange={e => setTaskForm({ ...taskForm, allowLateSubmission: e.target.checked })}
                    />
                    <span>Permitir entregas después de la fecha límite (marcadas como entrega tardía)</span>
                  </label>
                  <small className="help-text">
                    Si se desmarca, el sistema denegará envíos automáticamente tras la fecha y hora fijada.
                  </small>
                </div>

                <div className="submodal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-confirm-task">
                    Publicar Tarea
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseTasksModal;
