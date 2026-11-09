import React from 'react';
import { useApp } from '../../context/AppContext';
import './NotificationsCenterModal.css';

const NotificationsCenterModal = ({ onClose, onNavigateLesson }) => {
  const { user, courses, tasks, customContent } = useApp();

  const isTeacher = user?.role === 'profesor';
  const now = new Date();

  // 1. Tareas próximas a vencer o vencidas
  const userEnrolledCourseIds = user?.enrolledCourses || [];
  const relevantTasks = (tasks || []).filter(t => isTeacher || userEnrolledCourseIds.includes(t.courseId));

  const taskAlerts = relevantTasks.map(t => {
    const dueDateTime = new Date(`${t.dueDate}T${t.dueTime || '23:59'}`);
    const diffMs = dueDateTime - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isSubmitted = (t.submissions || []).some(s => s.studentId === user?.id);

    let alertType = 'info';
    let message = '';

    if (diffDays < 0) {
      alertType = 'danger';
      message = `El plazo para la tarea "${t.title}" finalizó hace ${Math.abs(diffDays)} día(s).`;
    } else if (diffDays === 0) {
      alertType = 'urgent';
      message = `¡Atención! La tarea "${t.title}" vence HOY a las ${t.dueTime || '23:59'}.`;
    } else if (diffDays <= 3) {
      alertType = 'warning';
      message = `Quedan solo ${diffDays} día(s) de plazo para la entrega de "${t.title}".`;
    } else {
      alertType = 'normal';
      message = `La tarea "${t.title}" está abierta. Plazo restante: ${diffDays} días.`;
    }

    return {
      id: `task-alert-${t.id}`,
      type: alertType,
      title: `Tarea: ${t.title}`,
      message,
      courseCode: t.courseCode || 'Curso',
      isSubmitted,
      dueDate: `${t.dueDate} ${t.dueTime || '23:59'}`
    };
  });

  // 2. Lecciones pendientes por lenguaje
  const lessonAlerts = [];
  if (!isTeacher && user?.progress) {
    const languages = [
      { id: 'arduino', name: 'Arduino C++' },
      { id: 'scratch', name: 'Scratch Bloques' },
      { id: 'python', name: 'Python' }
    ];

    languages.forEach(lang => {
      const prog = user.progress[lang.id] || { lessonsCompleted: 0, currentLevel: 1 };
      const pendingCount = 15 - (prog.lessonsCompleted || 0);
      if (pendingCount > 0) {
        lessonAlerts.push({
          id: `lesson-alert-${lang.id}`,
          type: 'lesson',
          title: `Ruta de ${lang.name}`,
          message: `Tienes ${pendingCount} lección(es) pendiente(s) para completar la ruta formativa de 15 niveles. Actualmente estás en el Nivel ${prog.currentLevel || 1}.`,
          langId: lang.id,
          currentLevel: prog.currentLevel || 1
        });
      }
    });
  }

  // 3. Modificaciones recientes de contenido en el curso
  const contentChangeAlerts = [];
  if (customContent && Object.keys(customContent).length > 0) {
    Object.entries(customContent).forEach(([key, val]) => {
      const parts = key.split('-');
      const lang = parts[0];
      const level = parts[1];
      contentChangeAlerts.push({
        id: `content-mod-${key}`,
        type: 'content',
        title: `Contenido Actualizado por el Docente`,
        message: `El docente actualizó el tema o reto del Nivel ${level} en ${lang.toUpperCase()}. Revisa el nuevo material para estar al día.`,
        langId: lang,
        levelId: level
      });
    });
  }

  return (
    <div className="notif-modal-overlay" onClick={onClose}>
      <div className="notif-modal-card" onClick={e => e.stopPropagation()}>
        <div className="notif-modal-header">
          <div>
            <h3>🔔 Centro de Notificaciones & Plazos Académicos</h3>
            <p>Alertas de vencimiento de tareas, lecciones pendientes y cambios de curso</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="notif-modal-body">
          {/* SECCIÓN 1: VENCIMIENTO DE TAREAS */}
          <div className="notif-section">
            <h4>⏰ Plazos de Tareas y Proyectos ({taskAlerts.length})</h4>
            {taskAlerts.length === 0 ? (
              <p className="empty-notif-text">No tienes tareas asignadas con plazos pendientes en este momento.</p>
            ) : (
              <div className="notif-items-list">
                {taskAlerts.map(a => (
                  <div key={a.id} className={`notif-card ${a.type}`}>
                    <div className="notif-icon">
                      {a.type === 'danger' ? '⛔' : a.type === 'urgent' ? '🚨' : a.type === 'warning' ? '⚠️' : '📅'}
                    </div>
                    <div className="notif-content">
                      <div className="notif-title-row">
                        <strong>{a.title}</strong>
                        <span className="course-code-tag">{a.courseCode}</span>
                        {a.isSubmitted && <span className="already-submitted-tag">✓ Ya entregada</span>}
                      </div>
                      <p>{a.message}</p>
                      <small className="notif-meta">Límite oficial: {a.dueDate}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECCIÓN 2: LECCIONES PENDIENTES */}
          {!isTeacher && (
            <div className="notif-section">
              <h4>📖 Lecciones y Rutas Pendientes</h4>
              <div className="notif-items-list">
                {lessonAlerts.map(l => (
                  <div key={l.id} className="notif-card lesson">
                    <div className="notif-icon">💡</div>
                    <div className="notif-content">
                      <div className="notif-title-row">
                        <strong>{l.title}</strong>
                      </div>
                      <p>{l.message}</p>
                      {onNavigateLesson && (
                        <button
                          type="button"
                          className="btn-continue-lesson-notif"
                          onClick={() => {
                            onNavigateLesson(l.langId, l.currentLevel);
                            onClose();
                          }}
                        >
                          Continuar Nivel {l.currentLevel} →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓN 3: CAMBIOS DE CONTENIDO POR EL DOCENTE */}
          {contentChangeAlerts.length > 0 && (
            <div className="notif-section">
              <h4>📝 Actualizaciones de Contenido por el Docente</h4>
              <div className="notif-items-list">
                {contentChangeAlerts.map(c => (
                  <div key={c.id} className="notif-card content">
                    <div className="notif-icon">✏️</div>
                    <div className="notif-content">
                      <strong>{c.title}</strong>
                      <p>{c.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenterModal;
