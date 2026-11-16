import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import TeacherOverview from './TeacherOverview';
import StudentMonitor from './StudentMonitor';
import ContentEditor from './ContentEditor';
import TeacherCourses from './TeacherCourses';
import TeacherMessages from './TeacherMessages';
import TeacherSettings from './TeacherSettings';
import CalendarWidget from '../Schedule/CalendarWidget';
import LessonGoalModal from '../Schedule/LessonGoalModal';
import {
  IconLayers,
  IconUsers,
  IconCode,
  IconBook,
  IconChat,
  IconSettings,
  IconCalendar,
  IconTarget,
  IconEye,
  IconClose,
  IconBell
} from '../common/Icons';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, messages, enablePreview, courses, students } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTabState] = useState(initialTab);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTabState(tabParam);
    }
  }, [searchParams]);
  const [isCalendarDrawerOpen, setIsCalendarDrawerOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Conteo de mensajes no leídos
  const unreadCount = messages.filter(m => m.sender === 'student' && !m.read).length;

  return (
    <div className="teacher-panel-layout">
      {/* CINTA / BARRA LATERAL IZQUIERDA CON APARTADOS */}
      <aside className="teacher-sidebar-ribbon">
        <div className="ribbon-brand">
          <div className="brand-icon-box">
            <IconBook size={22} color="#00BCD4" />
          </div>
          <div className="brand-text">
            <h3>Panel Docente</h3>
            <p>CodeCraft Academy</p>
          </div>
        </div>

                <nav className="ribbon-nav">
          <button
            type="button"
            className={`ribbon-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="ribbon-icon">
              <IconLayers size={20} />
            </span>
            <div className="ribbon-label">
              <strong>Dashboard General</strong>
              <small>Resumen global e indicadores</small>
            </div>
          </button>
          <button
            type="button"
            className={`ribbon-item ${activeTab === 'monitor' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitor')}
          >
            <span className="ribbon-icon">
              <IconUsers size={20} />
            </span>
            <div className="ribbon-label">
              <strong>Monitoreo y Análisis</strong>
              <small>Rendimiento, alertas y reportes</small>
            </div>
          </button>

          <button
            type="button"
            className={`ribbon-item ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <span className="ribbon-icon">
              <IconCode size={20} />
            </span>
            <div className="ribbon-label">
              <strong>Personalizar Lecciones</strong>
              <small>Teoría, ejemplos y retos</small>
            </div>
          </button>

          <button
            type="button"
            className={`ribbon-item ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <span className="ribbon-icon">
              <IconBook size={20} />
            </span>
            <div className="ribbon-label">
              <strong>Cursos y Horarios</strong>
              <small>Días, semanas y cancelaciones</small>
            </div>
          </button>

          <button
            type="button"
            className={`ribbon-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <span className="ribbon-icon">
              <IconChat size={20} />
            </span>
            <div className="ribbon-label">
              <strong>Mensajería y Tutoría</strong>
              <small>Comunicación con alumnos</small>
            </div>
            {unreadCount > 0 && <span className="ribbon-badge">{unreadCount}</span>}
          </button>

          <button
            type="button"
            className={`ribbon-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="ribbon-icon">
              <IconSettings size={20} />
            </span>
            <div className="ribbon-label">
              <strong>Ajustes y Parámetros</strong>
              <small>Evaluación y umbrales</small>
            </div>
          </button>
        </nav>

        {/* ACCIONES RÃPIDAS EN EL PIE DE LA CINTA LATERAL */}
        <div className="ribbon-footer-actions">
          {/* BOTÓN CALENDARIO DESPLEGABLE */}
          <button
            type="button"
            className="btn-ribbon-action"
            onClick={() => setIsCalendarDrawerOpen(true)}
            title="Abrir Calendario lateral de cursos del docente"
          >
            <IconCalendar size={18} />
            <span>Calendario de Clases</span>
          </button>

          {/* BOTÓN ASIGNAR META DE LECCIONES */}
          <button
            type="button"
            className="btn-ribbon-action goal"
            onClick={() => setIsGoalModalOpen(true)}
            title="Establecer meta y fecha máxima para alumnos"
          >
            <IconTarget size={18} />
            <span>Asignar Meta de Lección</span>
          </button>

          {/* VISTA PREVIA DE ESTUDIANTE */}
          <button
            type="button"
            className="btn-ribbon-preview"
            onClick={() => {
              if (enablePreview) enablePreview('8');
              navigate('/student');
            }}
          >
            <IconEye size={18} />
            <span>Vista Alumno</span>
          </button>
        </div>
      </aside>

      {/* ÃREA DE CONTENIDO PRINCIPAL */}
      <main className="teacher-main-viewport">
        {activeTab === 'dashboard' && (
          <TeacherOverview
            onNavigateTab={setActiveTab}
            onOpenGoalModal={() => setIsGoalModalOpen(true)}
          />
        )}
        {activeTab === 'monitor' && <StudentMonitor />}
        {activeTab === 'editor' && <ContentEditor />}
        {activeTab === 'courses' && <TeacherCourses onOpenGoalModal={() => setIsGoalModalOpen(true)} />}
        {activeTab === 'messages' && <TeacherMessages />}
        {activeTab === 'settings' && <TeacherSettings />}
      </main>

      {/* DRAWER / PANEL LATERAL DESPLEGABLE DEL CALENDARIO DOCENTE */}
      {isCalendarDrawerOpen && (
        <div className="calendar-drawer-overlay" onClick={() => setIsCalendarDrawerOpen(false)}>
          <div className="calendar-drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title">
                <IconCalendar size={20} color="#00BCD4" />
                <h4>Mi Calendario Docente</h4>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setIsCalendarDrawerOpen(false)}
                title="Cerrar panel"
              >
                <IconClose size={20} />
              </button>
            </div>

            <div className="drawer-body">
              <CalendarWidget
                courses={courses}
                userRole="teacher"
                userId={user?.id}
                lessonGoals={lessonGoals}
                tasks={tasks}
                customTitle="Clases de mis cursos a cargo"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA ASIGNAR META DE LECCIONES */}
      <LessonGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        courses={courses}
        students={students}
      />
    </div>
  );
};

export default TeacherDashboard;



