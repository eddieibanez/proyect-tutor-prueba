import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import styles from './StudentDashboard.module.css';
import CalendarWidget from '../Schedule/CalendarWidget';
import CourseScheduleModal from '../Schedule/CourseScheduleModal';
import CourseTasksModal from '../Tasks/CourseTasksModal';
import {
  IconCalendar,
  IconClock,
  IconCheck,
  IconAward,
  IconCpu,
  IconLayers,
  IconTerminal
} from '../common/Icons';

const languageInfo = [
  {
    id: 'arduino',
    name: 'C++ Arduino',
    description: 'Aprende a programar hardware, microcontroladores y sensores con rigor sintáctico.',
    icon: <IconCpu size={32} color="#00BCD4" />,
    colorClass: 'cardArduino'
  },
  {
    id: 'scratch',
    name: 'Scratch',
    description: 'Crea videojuegos y animaciones arrastrando bloques interactivos y escenarios.',
    icon: <IconLayers size={32} color="#FFAB19" />,
    colorClass: 'cardScratch'
  },
  {
    id: 'python',
    name: 'Python 3',
    description: 'Domina lógica pura, estructuras de datos, scripts y algoritmos modernos.',
    icon: <IconTerminal size={32} color="#4CAF50" />,
    colorClass: 'cardPython'
  }
];

const StudentDashboard = () => {
  const { user, courses, lessonGoals = [] } = useContext(AppContext);
  const navigate = useNavigate();

  // Estados para modales de horario y tareas por curso
  const [selectedCourseForSchedule, setSelectedCourseForSchedule] = useState(null);
  const [selectedCourseForTasks, setSelectedCourseForTasks] = useState(null);

  const getProgress = (langId) => {
    if (!user || !user.progress || !user.progress[langId]) {
      return { lessonsCompleted: 0, currentLevel: 1 };
    }
    return user.progress[langId];
  };

  const calculateTotalProgress = () => {
    let total = 0;
    languageInfo.forEach((lang) => {
      const prog = getProgress(lang.id);
      total += prog.lessonsCompleted;
    });
    return Math.round((total / 45) * 100);
  };

  // Metas asignadas al estudiante
  const activeGoals = lessonGoals.filter(g => {
    if (g.type === 'individual') return g.studentId === user?.id;
    return true; // Metas grupales aplicables
  });

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <div className={styles.welcomeText}>
          <h1>¡Hola, {user ? (user.nombre || user.name) : 'Estudiante'}!</h1>
          <p>Explora tus cursos matriculados, consulta tu calendario de clases y continúa tu ruta de aprendizaje.</p>
        </div>

        <div className={styles.statsSummary}>
          <div className={styles.statBox}>
            <span className={styles.statNumber}>{calculateTotalProgress()}%</span>
            <span className={styles.statLabel}>Progreso Global</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNumber}>
              {languageInfo.reduce((acc, curr) => acc + getProgress(curr.id).lessonsCompleted, 0)}/45
            </span>
            <span className={styles.statLabel}>Lecciones Superadas</span>
          </div>
        </div>
      </header>

      {/* AVISO DE METAS ASIGNADAS POR EL DOCENTE */}
      {activeGoals.length > 0 && (
        <section className={styles.goalsBannerSection}>
          <div className={styles.goalCardRow}>
            {activeGoals.map(g => (
              <div key={g.id} className={styles.goalCardItem}>
                <div className={styles.goalCardHeader}>
                  <span className={styles.goalLangBadge}>{g.language?.toUpperCase()}</span>
                  <span className={styles.goalDeadlineText}>Plazo: {g.deadline}</span>
                </div>
                <p className={styles.goalCardDesc}>
                  Tu docente estableció la meta de llegar hasta la <strong>Lección Nivel {g.targetLevel}</strong> antes de la fecha límite.
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* DISPOSICIÓN EN REJILLA: CURSOS A LA IZQUIERDA Y CALENDARIO FIJO ABIERTO A LA DERECHA */}
      <div className={styles.mainLayoutSplit}>
        <div className={styles.leftContentCol}>
          {/* SECCIÓN 1: CURSOS Y CLASES MATRICULADAS */}
          <section className={styles.coursesSection}>
            <div className={styles.sectionHeader}>
              <h2>Mis Cursos Matriculados</h2>
              <span className={styles.sectionSub}>Sesiones semanales, tareas y horarios oficiales</span>
            </div>

            <div className={styles.coursesGrid}>
              {courses.map((course) => (
                <div key={course.id} className={styles.courseCard} style={{ borderTopColor: course.color || 'var(--primary)' }}>
                  <div className={styles.courseCardTop}>
                    <div className={styles.courseMeta}>
                      <span className={styles.courseCodeBadge}>{course.code}</span>
                      <span className={styles.courseGradeText}>{course.grade}° Grado</span>
                    </div>
                    <h3 className={styles.courseName}>{course.name}</h3>
                    <p className={styles.courseDesc}>{course.description}</p>
                  </div>

                  <div className={styles.courseScheduleSummary}>
                    <div className={styles.summaryRow}>
                      <IconCalendar size={16} />
                      <span>{course.scheduleDays?.length || 2} sesiones / semana</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <IconClock size={16} />
                      <span>{course.startTime || '08:00'} - {course.endTime || '09:30'}</span>
                    </div>
                  </div>

                  <div className={styles.courseActionsRow}>
                    <button
                      type="button"
                      className={styles.btnCourseAction}
                      onClick={() => setSelectedCourseForSchedule(course)}
                    >
                      Ver Horario
                    </button>
                    <button
                      type="button"
                      className={styles.btnCourseAction + ' ' + styles.primaryAction}
                      onClick={() => setSelectedCourseForTasks(course)}
                    >
                      Tareas del Curso
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECCIÓN 2: RUTAS DE APRENDIZAJE POR LENGUAJE */}
          <section className={styles.languagesSection}>
            <div className={styles.sectionHeader}>
              <h2>Rutas de Programación Interactivas</h2>
              <span className={styles.sectionSub}>Completa tus niveles y rinde el examen final de certificación</span>
            </div>

            <div className={styles.cardsGrid}>
              {languageInfo.map((lang) => {
                const prog = getProgress(lang.id);
                const pct = Math.round((prog.lessonsCompleted / 15) * 100);

                return (
                  <div
                    key={lang.id}
                    className={styles.languageCard + ' ' + styles[lang.colorClass]}
                    onClick={() => navigate('/student/language/' + lang.id)}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardIconBox}>{lang.icon}</div>
                      <span className={styles.levelBadge}>Nivel {prog.currentLevel} de 15</span>
                    </div>

                    <h3 className={styles.cardTitle}>{lang.name}</h3>
                    <p className={styles.cardDescription}>{lang.description}</p>

                    <div className={styles.progressContainer}>
                      <div className={styles.progressHeader}>
                        <span>{prog.lessonsCompleted} de 15 lecciones</span>
                        <span className={styles.percentageText}>{pct}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: pct + '%' }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.btnContinue}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/student/language/' + lang.id);
                      }}
                    >
                      Continuar Ruta →
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* LADO DERECHO: CALENDARIO FIJO Y ABIERTO */}
        <aside className={styles.rightCalendarSidebar}>
          <div className={styles.stickyCalendarBox}>
            <CalendarWidget
              courses={courses}
              userRole="student"
              userId={user?.id}
              customTitle="Calendario de Clases y Festivos"
            />
          </div>
        </aside>
      </div>

      {/* MODAL DE HORARIO DEL CURSO */}
      {selectedCourseForSchedule && (
        <CourseScheduleModal
          course={selectedCourseForSchedule}
          isTeacher={false}
          allCourses={courses}
          onClose={() => setSelectedCourseForSchedule(null)}
        />
      )}

      {/* MODAL DE TAREAS DEL CURSO */}
      {selectedCourseForTasks && (
        <CourseTasksModal
          course={selectedCourseForTasks}
          isTeacher={false}
          onClose={() => setSelectedCourseForTasks(null)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
