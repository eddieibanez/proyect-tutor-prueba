import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './NotificationsCenterModal.css';

const NotificationsCenterModal = ({ onClose, onNavigateLesson }) => {
  const { user, courses, tasks, customContent } = useApp();
  const [readNotifs, setReadNotifs] = useState(() => {
    return JSON.parse(localStorage.getItem('codecraft_read_notifs') || '[]');
  });

  const isTeacher = user?.role === 'profesor';
  const now = new Date();

  // Marcar todas como leídas
  const handleMarkAllAsRead = () => {
    const allIds = [
      ...taskAlerts.map(t => t.id),
      ...lessonAlerts.map(l => l.id),
      ...contentChangeAlerts.map(c => c.id)
    ];
    setReadNotifs(allIds);
    localStorage.setItem('codecraft_read_notifs', JSON.stringify(allIds));
  };

  const handleToggleRead = (id) => {
    let updated;
    if (readNotifs.includes(id)) {
      updated = readNotifs.filter(x => x !== id);
    } else {
      updated = [...readNotifs, id];
    }
    setReadNotifs(updated);
    localStorage.setItem('codecraft_read_notifs', JSON.stringify(updated));
  };

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

  // 3. Modificaciones recientes de contenido
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

  const allAlerts = [...taskAlerts, ...lessonAlerts, ...contentChangeAlerts];
  const unreadCount = allAlerts.filter(a => !readNotifs.includes(a.id)).length;

  return (
    <div className="notif-modal-overlay" onClick={onClose}>
      <div className="notif-modal-card" onClick={e => e.stopPropagation()}>
        <div className="notif-modal-header">
          <div className="head-text">
            <h3>🔔 Centro de Notificaciones & Plazos Académicos</h3>
            <p>
              {unreadCount > 0 
                ? `Tienes ${unreadCount} notificación(es) nueva(s) sin leer` 
                : '✅ Ya estás al día. No hay notificaciones pendientes por leer.'}
            </p>
          </div>
          <div className="head-actions">
            {unreadCount > 0 && (
              <button type="button" className="btn-mark-all-read" onClick={handleMarkAllAsRead}>
                ✓ Marcar todas leídas
              </button>
            )}
            <button type="button" className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="notif-modal-body">
          {allAlerts.length === 0 ? (
            <div className="empty-notif-state">
              <span className="empty-icon">📭</span>
              <h4>No hay notificaciones ni avisos pendientes en este momento</h4>
              <p>Cuando un docente asigne una tarea, modifique contenido o se acerque un plazo de entrega, aparecerá aquí.</p>
            </div>
          ) : (
            <>
              {/* SECCIÓN 1: VENCIMIENTO DE TAREAS */}
              {taskAlerts.length > 0 && (
                <div className="notif-section">
                  <h4>⏰ Plazos de Tareas y Proyectos ({taskAlerts.length})</h4>
                  <div className="notif-items-list">
                    {taskAlerts.map(a => {
                      const isRead = readNotifs.includes(a.id);
                      return (
                        <div key={a.id} className={`notif-card ${a.type} ${isRead ? 'read' : 'unread'}`}>
                          <div className="notif-icon">
                            {a.type === 'danger' ? '⛔' : a.type === 'urgent' ? '🚨' : a.type === 'warning' ? '⚠️' : '📅'}
                          </div>
                          <div className="notif-content">
                            <div className="notif-title-row">
                              <strong>{a.title}</strong>
                              <span className="course-code-tag">{a.courseCode}</span>
                              {a.isSubmitted && <span className="already-submitted-tag">✓ Ya entregada</span>}
                              <span className={`read-tag ${isRead ? 'read' : 'unread'}`}>
                                {isRead ? '👁️ Leída' : '● Nueva'}
                              </span>
                            </div>
                            <p>{a.message}</p>
                            <div className="notif-footer-actions">
                              <small className="notif-meta">Límite: {a.dueDate}</small>
                              <button
                                type="button"
                                className="btn-toggle-read"
                                onClick={() => handleToggleRead(a.id)}
                              >
                                {isRead ? 'Marcar no leída' : 'Marcar leída ✓'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECCIÓN 2: LECCIONES PENDIENTES */}
              {!isTeacher && lessonAlerts.length > 0 && (
                <div className="notif-section">
                  <h4>📖 Lecciones y Rutas Pendientes</h4>
                  <div className="notif-items-list">
                    {lessonAlerts.map(l => {
                      const isRead = readNotifs.includes(l.id);
                      return (
                        <div key={l.id} className={`notif-card lesson ${isRead ? 'read' : 'unread'}`}>
                          <div className="notif-icon">💡</div>
                          <div className="notif-content">
                            <div className="notif-title-row">
                              <strong>{l.title}</strong>
                              <span className={`read-tag ${isRead ? 'read' : 'unread'}`}>
                                {isRead ? '👁️ Leída' : '● Nueva'}
                              </span>
                            </div>
                            <p>{l.message}</p>
                            <div className="notif-footer-actions">
                              {onNavigateLesson && (
                                <button
                                  type="button"
                                  className="btn-continue-lesson-notif"
                                  onClick={() => {
                                    handleToggleRead(l.id);
                                    onNavigateLesson(l.langId, l.currentLevel);
                                    onClose();
                                  }}
                                >
                                  Continuar Nivel {l.currentLevel} →
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn-toggle-read"
                                onClick={() => handleToggleRead(l.id)}
                              >
                                {isRead ? 'Marcar no leída' : 'Marcar leída ✓'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECCIÓN 3: CAMBIOS DE CONTENIDO POR EL DOCENTE */}
              {contentChangeAlerts.length > 0 && (
                <div className="notif-section">
                  <h4>📝 Actualizaciones de Contenido por el Docente</h4>
                  <div className="notif-items-list">
                    {contentChangeAlerts.map(c => {
                      const isRead = readNotifs.includes(c.id);
                      return (
                        <div key={c.id} className={`notif-card content ${isRead ? 'read' : 'unread'}`}>
                          <div className="notif-icon">✏️</div>
                          <div className="notif-content">
                            <div className="notif-title-row">
                              <strong>{c.title}</strong>
                              <span className={`read-tag ${isRead ? 'read' : 'unread'}`}>
                                {isRead ? '👁️ Leída' : '● Nueva'}
                              </span>
                            </div>
                            <p>{c.message}</p>
                            <div className="notif-footer-actions">
                              <button
                                type="button"
                                className="btn-toggle-read"
                                onClick={() => handleToggleRead(c.id)}
                              >
                                {isRead ? 'Marcar no leída' : 'Marcar leída ✓'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenterModal;
