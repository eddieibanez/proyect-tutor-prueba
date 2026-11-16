import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  IconUsers,
  IconBook,
  IconCheck,
  IconTarget,
  IconCalendar,
  IconClock,
  IconAward,
  IconCpu,
  IconLayers,
  IconTerminal
} from '../common/Icons';
import './TeacherOverview.css';

const TeacherOverview = ({ onNavigateTab, onOpenGoalModal }) => {
  const { user, courses = [], students = [], tasks = [], lessonGoals = [] } = useApp();

  // Entorno aislado para el docente activo
  const myCourses = useMemo(() => {
    return courses.filter(c => c.teacherId === user?.id || (!c.teacherId && (user?.id === 'teacher-main' || !user?.id)));
  }, [courses, user?.id]);

  const myCourseIds = useMemo(() => myCourses.map(c => c.id), [myCourses]);

  const myStudents = useMemo(() => {
    return students.filter(st => {
      const stCourses = st.enrolledCourses || (st.courseId ? [st.courseId] : []);
      return stCourses.some(id => myCourseIds.includes(id));
    });
  }, [students, myCourseIds]);

  const myTasks = useMemo(() => {
    return tasks.filter(t => myCourseIds.includes(t.courseId) || t.createdBy === user?.id);
  }, [tasks, myCourseIds, user?.id]);

  const myGoals = useMemo(() => {
    return lessonGoals.filter(g => myCourseIds.includes(g.courseId) || g.teacherId === user?.id);
  }, [lessonGoals, myCourseIds, user?.id]);

  // Estadísticas del docente
  const stats = useMemo(() => {
    const totalStudents = myStudents.length;
    const totalCourses = myCourses.length;

    let totalLessonsCompleted = 0;
    let studentsAtRisk = 0;
    let studentsExcellent = 0;

    myStudents.forEach(st => {
      const ard = st.progress?.arduino?.lessonsCompleted || 0;
      const scr = st.progress?.scratch?.lessonsCompleted || 0;
      const pyt = st.progress?.python?.lessonsCompleted || 0;
      totalLessonsCompleted += (ard + scr + pyt);

      const avg = Math.round((ard + scr + pyt) / 45 * 100);
      if (avg < 30 || st.status === 'Necesita Apoyo') {
        studentsAtRisk++;
      } else if (avg >= 75 || st.status === 'Excelente') {
        studentsExcellent++;
      }
    });

    const pendingTasks = myTasks.filter(t => {
      const due = new Date(`${t.dueDate}T${t.dueTime || '23:59'}`);
      return due >= new Date();
    }).length;

    return {
      totalStudents,
      totalCourses,
      totalLessonsCompleted,
      studentsAtRisk,
      studentsExcellent,
      pendingTasks,
      activeGoals: myGoals.length
    };
  }, [myStudents, myCourses, myTasks, myGoals]);

  return (
    <div className="teacher-overview-container">
      {/* BANNER DE BIENVENIDA */}
      <section className="overview-hero-card">
        <div className="hero-content-col">
          <div className="hero-badge">
            <IconAward size={16} />
            <span>Panel de Gestión y Docencia 2026</span>
          </div>
          <h2>¡Bienvenido, {user?.name || user?.nombre || 'Docente'}!</h2>
          <p>
            Supervisa el rendimiento académico de tus estudiantes, personaliza lecciones de programación,
            organiza horarios de clase y define metas formativas en C++ Arduino, Scratch y Python.
          </p>
          <div className="hero-action-buttons">
            <button
              type="button"
              className="btn-hero-primary"
              onClick={() => onNavigateTab('monitor')}
            >
              <IconUsers size={18} />
              <span>Ver Monitoreo Detallado</span>
            </button>
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={onOpenGoalModal}
            >
              <IconTarget size={18} />
              <span>Asignar Nueva Meta</span>
            </button>
          </div>
        </div>
      </section>

      {/* METRICAS Y KPIS CLAVE */}
      <section className="overview-stats-grid">
        <div className="kpi-card purple">
          <div className="kpi-icon-box">
            <IconUsers size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{stats.totalStudents}</span>
            <span className="kpi-title">Alumnos Matriculados</span>
          </div>
          <div className="kpi-footer-badge">
            <span>{stats.studentsExcellent} destacados</span>
          </div>
        </div>

        <div className="kpi-card cyan">
          <div className="kpi-icon-box">
            <IconBook size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{stats.totalCourses}</span>
            <span className="kpi-title">Cursos Activos</span>
          </div>
          <div className="kpi-footer-badge">
            <span>Programación & Robótica</span>
          </div>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon-box">
            <IconCheck size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{stats.totalLessonsCompleted}</span>
            <span className="kpi-title">Lecciones Superadas</span>
          </div>
          <div className="kpi-footer-badge">
            <span>Rutas C++, Scratch, Python</span>
          </div>
        </div>

        <div className="kpi-card orange">
          <div className="kpi-icon-box">
            <IconTarget size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{stats.activeGoals}</span>
            <span className="kpi-title">Metas y Plazos Fijos</span>
          </div>
          <div className="kpi-footer-badge warning">
            <span>{stats.studentsAtRisk} en seguimiento</span>
          </div>
        </div>
      </section>

      {/* SECCIÓN DIVIDIDA: ACCESOS A CURSOS Y METAS VIGENTES */}
      <div className="overview-split-row">
        {/* COLUMNA 1: MIS CURSOS LIDERADOS */}
        <div className="overview-col-card">
          <div className="col-card-head">
            <div className="head-left">
              <IconBook size={20} color="var(--primary)" />
              <h3>Mis Cursos y Horarios</h3>
            </div>
            <button
              type="button"
              className="btn-view-all"
              onClick={() => onNavigateTab('courses')}
            >
              Gestionar Cursos →
            </button>
          </div>

          <div className="courses-mini-list">
            {myCourses.length === 0 ? (
              <p className="empty-subtext">No hay cursos registrados en el sistema todavía.</p>
            ) : (
              myCourses.slice(0, 4).map(c => (
                <div key={c.id} className="course-mini-row" style={{ borderLeftColor: c.color || 'var(--primary)' }}>
                  <div className="course-mini-main">
                    <div className="course-tag-line">
                      <span className="course-code-pill">{c.code}</span>
                      <span className="course-grade-pill">{c.grade}° Grado</span>
                      <span className="course-leader-badge">Líder: {user?.nombre || user?.name || 'Docente'}</span>
                    </div>
                    <h4>{c.name}</h4>
                    <p className="course-time-desc">
                      <IconClock size={14} />
                      <span>{c.startTime || '08:00'} - {c.endTime || '09:30'} • {(c.scheduleDays || []).length} días por semana</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA 2: METAS Y SEGUIMIENTO ACADÉMICO */}
        <div className="overview-col-card">
          <div className="col-card-head">
            <div className="head-left">
              <IconTarget size={20} color="#FF9800" />
              <h3>Metas de Lecciones Asignadas</h3>
            </div>
            <button
              type="button"
              className="btn-view-all"
              onClick={onOpenGoalModal}
            >
              + Nueva Meta
            </button>
          </div>

          <div className="goals-mini-list">
            {myGoals.length === 0 ? (
              <div className="empty-goals-prompt">
                <span className="empty-prompt-icon">🎯</span>
                <p>No tienes metas de lección activas actualmente.</p>
                <button
                  type="button"
                  className="btn-setup-goal"
                  onClick={onOpenGoalModal}
                >
                  Establecer Fecha Límite de Lecciones
                </button>
              </div>
            ) : (
              myGoals.slice(0, 4).map(g => (
                <div key={g.id} className="goal-mini-row">
                  <div className="goal-badge-box">
                    <span className="goal-level-num">Nivel {g.targetLevel}</span>
                    <span className="goal-lang-name">{g.language?.toUpperCase()}</span>
                  </div>
                  <div className="goal-info-content">
                    <h5>{g.title || `Meta: Completar hasta Nivel ${g.targetLevel}`}</h5>
                    <div className="goal-meta-chips">
                      <span className="deadline-chip">
                        <IconCalendar size={13} />
                        Límite: {g.deadline}
                      </span>
                      <span className="target-chip">
                        {g.type === 'group' ? '👥 Asignación Grupal' : '👤 Estudiante Individual'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherOverview;
