import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StudentMonitor from './StudentMonitor';
import ContentEditor from './ContentEditor';
import TeacherCourses from './TeacherCourses';
import TeacherMessages from './TeacherMessages';
import TeacherSettings from './TeacherSettings';
import CalendarWidget from '../Schedule/CalendarWidget';
import LessonGoalModal from '../Schedule/LessonGoalModal';
import { IconCalendar, IconChat, IconCode, IconSettings, IconBook, IconUsers, IconTarget, IconClose, IconBell } from '../common/Icons';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, messages, enablePreview, courses, students, logout } = useApp();
  const [activeTab, setActiveTab] = useState('monitor');
  const [isCalendarDrawerOpen, setIsCalendarDrawerOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const unreadCount = (messages || []).filter(m => m.sender === 'student' && !m.read).length;

  const navItems = [
    { id: 'monitor', label: 'Monitoreo y Analisis', sub: 'Rendimiento, alertas y reportes', icon: <IconUsers size={20} /> },
    { id: 'editor', label: 'Personalizar Lecciones', sub: 'Teoria, ejemplos y retos', icon: <IconCode size={20} /> },
    { id: 'courses', label: 'Cursos y Horarios', sub: 'Gestionar cursos y calendario', icon: <IconBook size={20} /> },
    { id: 'messages', label: 'Mensajeria', sub: 'Comunicacion con estudiantes', icon: <IconChat size={20} /> },
    { id: 'settings', label: 'Configuracion', sub: 'Perfil y ajustes', icon: <IconSettings size={20} /> },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'monitor': return <StudentMonitor />;
      case 'editor': return <ContentEditor />;
      case 'courses': return <TeacherCourses onOpenGoalModal={() => setIsGoalModalOpen(true)} />;
      case 'messages': return <TeacherMessages />;
      case 'settings': return <TeacherSettings />;
      default: return <StudentMonitor />;
    }
  };

  return (
    <div className="teacher-panel-layout">
      <aside className="teacher-sidebar-ribbon">
        <div className="ribbon-brand">
          <div className="brand-icon-box"><IconBook size={24} color="#00BCD4" /></div>
          <div className="brand-text"><h3>Panel Docente</h3><p>CodeCraft Academy</p></div>
        </div>
        <nav className="ribbon-nav">
          {navItems.map(item => (
            <button key={item.id} type="button" className={'ribbon-item' + (activeTab === item.id ? ' active' : '')} onClick={() => setActiveTab(item.id)}>
              <span className="ribbon-icon">{item.icon}</span>
              <div className="ribbon-label"><strong>{item.label}</strong><small>{item.sub}</small></div>
              {item.id === 'messages' && unreadCount > 0 && <span className="ribbon-badge">{unreadCount}</span>}
            </button>
          ))}
        </nav>
        <div className="ribbon-footer">
          <button className="ribbon-action-btn" onClick={() => setIsCalendarDrawerOpen(true)} title="Ver Calendario">
            <IconCalendar size={20} /><span>Calendario</span>
          </button>
          <button className="ribbon-action-btn" onClick={() => setIsGoalModalOpen(true)} title="Asignar Meta">
            <IconTarget size={20} /><span>Meta Lecciones</span>
          </button>
          <button className="ribbon-action-btn preview-btn" onClick={() => { enablePreview && enablePreview(); navigate('/student'); }} title="Vista Previa Estudiante">
            <span>Vista Previa</span>
          </button>
          <button className="ribbon-action-btn logout-btn" onClick={() => { logout && logout(); navigate('/'); }} title="Cerrar sesion">
            <span>Cerrar Sesion</span>
          </button>
        </div>
      </aside>

      <main className="teacher-main-area">
        <header className="teacher-top-header">
          <div className="teacher-welcome">
            <h2>Bienvenido, {user?.name || user?.email || 'Docente'}</h2>
            <p>{courses?.length || 0} cursos | {students?.length || 0} estudiantes</p>
          </div>
          <div className="header-actions">
            <button className="icon-action-btn" onClick={() => setIsCalendarDrawerOpen(!isCalendarDrawerOpen)} title="Calendario">
              <IconCalendar size={22} />
            </button>
            <button className="icon-action-btn" title="Notificaciones">
              <IconBell size={22} />
            </button>
          </div>
        </header>
        <div className="teacher-content-area">
          {renderContent()}
        </div>
      </main>

      {isCalendarDrawerOpen && (
        <div className="calendar-drawer-overlay" onClick={() => setIsCalendarDrawerOpen(false)}>
          <div className="calendar-drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Calendario de Clases</h3>
              <button className="drawer-close-btn" onClick={() => setIsCalendarDrawerOpen(false)}><IconClose size={18} /></button>
            </div>
            <CalendarWidget userRole="teacher" courses={courses || []} userId={user?.id} />
          </div>
        </div>
      )}

      {isGoalModalOpen && (
        <LessonGoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          courses={courses || []}
          students={students || []}
        />
      )}
    </div>
  );
};
export default TeacherDashboard;