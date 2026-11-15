import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { IconCheck, IconClose, IconCalendar, IconClock, IconBook } from '../common/Icons';
import './CourseTasksModal.css';

const AllTasksModal = ({ onClose, initialCourseId = 'all' }) => {
  const { user, courses = [], tasks = [], submitTask } = useApp();
  const [selectedCourseFilter, setSelectedCourseFilter] = useState(initialCourseId);
  const [sortByDeadline, setSortByDeadline] = useState('near'); // 'near' (más cercana primero), 'far' (más lejana)
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'submitted'

  const userEnrolledIds = user?.enrolledCourses || [];

  // Filtrado de tareas asignadas al estudiante
  const filteredTasks = useMemo(() => {
    let list = (tasks || []).filter(t => {
      // Si el estudiante no es profesor, mostrar solo tareas de sus cursos matriculados
      const isCourseMatch = selectedCourseFilter === 'all' 
        ? (user?.role === 'profesor' || userEnrolledIds.includes(t.courseId))
        : t.courseId === selectedCourseFilter;
      
      if (!isCourseMatch) return false;

      // Filtro de estado
      const isSubmitted = (t.submissions || []).some(s => s.studentId === user?.id);
      if (statusFilter === 'pending' && isSubmitted) return false;
      if (statusFilter === 'submitted' && !isSubmitted) return false;

      return true;
    });

    // Ordenamiento por fecha límite
    list.sort((a, b) => {
      const dateA = new Date(`${a.dueDate}T${a.dueTime || '23:59'}`);
      const dateB = new Date(`${b.dueDate}T${b.dueTime || '23:59'}`);
      return sortByDeadline === 'near' ? dateA - dateB : dateB - dateA;
    });

    return list;
  }, [tasks, selectedCourseFilter, sortByDeadline, statusFilter, user, userEnrolledIds]);

  const [submittingTaskId, setSubmittingTaskId] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');

  const handleDeliverTask = (taskId) => {
    if (!submissionContent.trim()) {
      alert('Por favor ingresa la respuesta, enlace o código de tu entrega.');
      return;
    }
    submitTask(taskId, {
      studentId: user?.id,
      studentName: `${user?.name || user?.nombre || 'Estudiante'}`,
      content: submissionContent.trim(),
      deliveredAt: new Date().toISOString()
    });
    alert('¡Tarea entregada exitosamente!');
    setSubmittingTaskId(null);
    setSubmissionContent('');
  };

  return (
    <div className="tasks-modal-overlay" onClick={onClose}>
      <div className="tasks-modal-card wide-all-tasks" onClick={e => e.stopPropagation()}>
        <div className="tasks-modal-header">
          <div>
            <h3>📋 Centro de Tareas Asignadas</h3>
            <p>Monitorea y entrega tus compromisos académicos con filtros por fecha y asignatura.</p>
          </div>
          <button type="button" className="btn-close-tasks" onClick={onClose}>✕</button>
        </div>

        {/* BARRA DE FILTROS AVANZADOS */}
        <div className="tasks-filter-toolbar">
          <div className="filter-pill-box">
            <label>Filtrar por Curso:</label>
            <select
              value={selectedCourseFilter}
              onChange={e => setSelectedCourseFilter(e.target.value)}
              className="tasks-filter-select"
            >
              <option value="all">Todos mis cursos matriculados</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>[{c.code}] {c.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-pill-box">
            <label>Ordenar por Plazo:</label>
            <select
              value={sortByDeadline}
              onChange={e => setSortByDeadline(e.target.value)}
              className="tasks-filter-select"
            >
              <option value="near">⏳ Fecha Límite Más Cercana</option>
              <option value="far">📅 Fecha Límite Más Lejana</option>
            </select>
          </div>

          <div className="filter-pill-box">
            <label>Estado:</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="tasks-filter-select"
            >
              <option value="all">Todas las tareas</option>
              <option value="pending">⏳ Pendientes por entregar</option>
              <option value="submitted">✓ Ya entregadas</option>
            </select>
          </div>
        </div>

        {/* LISTA DE TAREAS */}
        <div className="tasks-list-container">
          {filteredTasks.length === 0 ? (
            <div className="empty-tasks-alert">
              <span className="empty-icon">📂</span>
              <h4>No se encontraron tareas con los filtros seleccionados</h4>
              <p>Cambia el curso o los filtros para visualizar otras actividades.</p>
            </div>
          ) : (
            filteredTasks.map(t => {
              const dueDateTime = new Date(`${t.dueDate}T${t.dueTime || '23:59'}`);
              const now = new Date();
              const isPastDue = now > dueDateTime;
              const diffHours = Math.round((dueDateTime - now) / (1000 * 60 * 60));
              const mySubmission = (t.submissions || []).find(s => s.studentId === user?.id);
              const isSubmitted = !!mySubmission;
              const courseObj = courses.find(c => c.id === t.courseId);

              return (
                <div key={t.id} className={`task-item-card ${isPastDue && !isSubmitted ? 'past-due' : ''} ${isSubmitted ? 'is-done' : ''}`}>
                  <div className="task-card-main">
                    <div className="task-header-row">
                      <div className="task-badges">
                        <span className="course-code-badge">{courseObj ? courseObj.code : t.courseCode || 'Curso'}</span>
                        <span className="task-type-badge">{t.type === 'project' ? 'Proyecto' : 'Lección / Ejercicio'}</span>
                        {isSubmitted ? (
                          <span className="task-status-pill done">✓ Entregada</span>
                        ) : isPastDue ? (
                          <span className="task-status-pill late">⚠️ Vencida</span>
                        ) : diffHours <= 24 ? (
                          <span className="task-status-pill urgent">🔥 Vence pronto ({diffHours}h)</span>
                        ) : (
                          <span className="task-status-pill open">● En Plazo</span>
                        )}
                      </div>
                      <div className="task-due-box">
                        <IconCalendar size={14} />
                        <strong>Fecha límite: {t.dueDate} a las {t.dueTime || '23:59'}</strong>
                      </div>
                    </div>

                    <h4 className="task-title">{t.title}</h4>
                    <p className="task-desc">{t.description}</p>

                    {/* ZONA DE ENTREGA DE LA TAREA */}
                    {submittingTaskId === t.id ? (
                      <div className="task-submit-box">
                        <textarea
                          rows="3"
                          placeholder="Escribe la respuesta a la tarea, el enlace a tu repositorio o tu código..."
                          value={submissionContent}
                          onChange={e => setSubmissionContent(e.target.value)}
                        />
                        <div className="submit-box-actions">
                          <button
                            type="button"
                            className="btn-cancel-submit"
                            onClick={() => { setSubmittingTaskId(null); setSubmissionContent(''); }}
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            className="btn-confirm-submit"
                            onClick={() => handleDeliverTask(t.id)}
                          >
                            Confirmar Entrega
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="task-footer-bar">
                        {isSubmitted ? (
                          <div className="submitted-meta">
                            <span>✓ Entregada el {new Date(mySubmission.deliveredAt).toLocaleDateString()}</span>
                            {mySubmission.grade !== undefined && (
                              <span className="grade-badge">Calificación: {mySubmission.grade}/100</span>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn-deliver-task"
                            onClick={() => { setSubmittingTaskId(t.id); setSubmissionContent(''); }}
                          >
                            📤 Realizar Entrega
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AllTasksModal;
