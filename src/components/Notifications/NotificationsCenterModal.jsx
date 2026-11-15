import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { IconBell, IconCheck, IconClose } from '../common/Icons';
import './NotificationsCenterModal.css';

const NotificationsCenterModal = ({ onClose, onNavigateLesson, isDropdown = false }) => {
  const { user, courses, tasks, customContent } = useApp();
  const [readNotifs, setReadNotifs] = useState(() => {
    return JSON.parse(localStorage.getItem('codecraft_read_notifs') || '[]');
  });

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

    let alertType = 'media';
    let message = '';

    if (diffDays < 0) {
      alertType = 'alta';
      message = `El plazo para la tarea "${t.title}" finalizó hace ${Math.abs(diffDays)} día(s).`;
    } else if (diffDays === 0) {
      alertType = 'alta';
      message = `¡Atención! La tarea "${t.title}" vence HOY a las ${t.dueTime || '23:59'}.`;
    } else if (diffDays <= 3) {
      alertType = 'alta';
      message = `Quedan solo ${diffDays} día(s) de plazo para la entrega de "${t.title}".`;
    } else {
      alertType = 'baja';
      message = `La tarea "${t.title}" está abierta. Plazo restante: ${diffDays} días.`;
    }

    return {
      id: `task-alert-${t.id}`,
      priority: alertType,
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
      const prog = user.progress[lang.id] || { lessonsCompleted: 0 };
      const pendingCount = 15 - prog.lessonsCompleted;
      if (pendingCount > 0) {
        lessonAlerts.push({
          id: `lesson-alert-${lang.id}`,
          priority: 'media',
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
        priority: 'media',
        title: `Contenido Actualizado por el Docente`,
        message: `El docente actualizó el tema o reto del Nivel ${level} en ${lang.toUpperCase()}. Revisa el nuevo material para estar al día.`,
        langId: lang,
        levelId: level
      });
    });
  }

  const allAlerts = [...taskAlerts, ...lessonAlerts, ...contentChangeAlerts];
  const unreadCount = allAlerts.filter(a => !readNotifs.includes(a.id)).length;

  const handleMarkAllAsRead = () => {
    const allIds = allAlerts.map(a => a.id);
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

  const content = (
    <div className={isDropdown ? "notifications-dropdown-card" : "notifications-modal-card"} onClick={e => e.stopPropagation()}>
      <div className="notifications-modal-header">
        <div className="header-left-title">
          <IconBell size={18} color="var(--primary)" />
          <h2>Notificaciones</h2>
          {unreadCount > 0 && (
            <span className="unread-count-pill">{unreadCount}</span>
          )}
        </div>
        <button type="button" className="close-btn" onClick={onClose} title="Cerrar">
          <IconClose size={16} />
        </button>
      </div>

      <div className="notifications-action-bar">
        {unreadCount > 0 ? (
          <button type="button" className="btn-mark-all-read" onClick={handleMarkAllAsRead}>
            ✓ Marcar todas como leídas
          </button>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Todo al día</span>
        )}
      </div>

      <div className="notifications-scroll-area">
        {allAlerts.length === 0 ? (
          <div className="no-notifications-box">
            <span style={{ fontSize: '2rem' }}>📭</span>
            <h3>No tienes notificaciones pendientes</h3>
            <p>Aquí verás recordatorios de tareas, metas de cursos y avisos de docentes.</p>
          </div>
        ) : (
          allAlerts.map(a => {
            const isRead = readNotifs.includes(a.id);
            return (
              <div 
                key={a.id} 
                className={`notification-row-item ${isRead ? 'read' : 'unread'} priority-${a.priority || 'baja'}`}
              >
                <div className="notif-icon-box">
                  {a.id.startsWith('task') ? '⏰' : a.id.startsWith('lesson') ? '💡' : '✏️'}
                </div>
                <div className="notif-body-content">
                  <div className="notif-title-row">
                    <h4>{a.title}</h4>
                    {a.dueDate && (
                      <span className="notif-time-badge">{a.dueDate}</span>
                    )}
                  </div>
                  <p className="notif-message-text">{a.message}</p>
                  <div className="notif-meta-footer">
                    {a.langId && onNavigateLesson && (
                      <button
                        type="button"
                        className="btn-mark-item-read"
                        style={{ color: 'var(--primary)', fontWeight: 700 }}
                        onClick={() => {
                          handleToggleRead(a.id);
                          onNavigateLesson(a.langId, a.currentLevel || 1);
                          onClose();
                        }}
                      >
                        Ir a Lección →
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-mark-item-read"
                      onClick={() => handleToggleRead(a.id)}
                    >
                      {isRead ? 'Marcar no leída' : 'Marcar leída ✓'}
                    </button>
                  </div>
                </div>
                <div className="read-status-indicator" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  if (isDropdown) {
    return (
      <div className="notifications-dropdown-wrapper">
        {content}
      </div>
    );
  }

  return (
    <div className="notifications-modal-overlay" onClick={onClose}>
      {content}
    </div>
  );
};

export default NotificationsCenterModal;
