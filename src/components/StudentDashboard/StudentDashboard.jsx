import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import styles from './StudentDashboard.module.css';
import CalendarWidget from '../Schedule/CalendarWidget';
import CourseScheduleModal from '../Schedule/CourseScheduleModal';
import CourseTasksModal from '../Tasks/CourseTasksModal';
import AllTasksModal from '../Tasks/AllTasksModal';
import UnifiedMessenger from '../Messaging/UnifiedMessenger';
import {
  IconCalendar,
  IconClock,
  IconCheck,
  IconAward,
  IconCpu,
  IconLayers,
  IconTerminal,
  IconChat
} from '../common/Icons';

const languageInfo = [
  {
    id: 'arduino',
    name: 'C++ Arduino',
    description: 'Aprende a programar hardware, microcontroladores y sensores con rigor sintÃ¡ctico.',
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
    description: 'Domina lÃ³gica pura, estructuras de datos, scripts y algoritmos modernos.',
    icon: <IconTerminal size={32} color="#4CAF50" />,
    colorClass: 'cardPython'
  }
];

const StudentDashboard = () => {
  const { user, courses, lessonGoals = [], tasks = [] } = useContext(AppContext);
  const navigate = useNavigate();

  // Estados para modales de horario, tareas por curso, centro de tareas y mensajería
  const [selectedCourseForSchedule, setSelectedCourseForSchedule] = useState(null);
  const [selectedCourseForTasks, setSelectedCourseForTasks] = useState(null);
  const [showAllTasksModal, setShowAllTasksModal] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [activeSectionTab, setActiveSectionTab] = useState('overview'); // 'overview' o 'messages'

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
          <h1>Â¡Hola, {user ? (user.nombre || user.name) : 'Estudiante'}!</h1>
          <p>Explora tus cursos matriculados, consulta tu calendario de clases y continÃºa tu ruta de aprendizaje.</p>
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
                    <button
            type="button"
            className={`${styles.btnQuickHeaderAction} ${activeSectionTab === 'messages' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveSectionTab(activeSectionTab === 'messages' ? 'overview' : 'messages')}
            title="Ir al apartado de Mensajería"
          >
            <IconChat size={16} />
            <span>{activeSectionTab === 'messages' ? 'Ver Mis Cursos' : 'Apartado de Mensajería'}</span>
          </button>
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
                  Tu docente estableciÃ³ la meta de llegar hasta la <strong>LecciÃ³n Nivel {g.targetLevel}</strong> antes de la fecha lÃ­mite.
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* DISPOSICIÃ“N EN REJILLA: CURSOS A LA IZQUIERDA Y CALENDARIO FIJO ABIERTO A LA DERECHA */}
      {activeSectionTab === 'messages' ? (
        <section className={styles.embeddedMessengerApartado}>
          <div className={styles.apartadoHeaderRow}>
            <div className={styles.apartadoHeaderInfo}>
              <h2>💬 Apartado de Mensajería y Canales de Comunicación</h2>
              <p>Comunícate en tiempo real con tus compañeros matriculados en tus cursos y consulta a tus docentes.</p>
            </div>
            <button
              type="button"
              className={styles.btnCloseApartado}
              onClick={() => setActiveSectionTab('overview')}
            >
              ← Volver a Mis Cursos
            </button>
          </div>
          <div className={styles.embeddedMessengerWrapper}>
            <UnifiedMessenger isEmbedded={true} />
          </div>
        </section>
      ) : (
        <div className={styles.mainLayoutSplit}>
        <div className={styles.leftContentCol}>
          {/* SECCIÃ“N 1: CURSOS Y CLASES MATRICULADAS */}
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
                      <span className={styles.courseGradeText}>{course.grade}Â° Grado</span>
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

          {/* SECCIÃ“N 2: RUTAS DE APRENDIZAJE POR LENGUAJE */}
          <section className={styles.languagesSection}>
            <div className={styles.sectionHeader}>
              <h2>Rutas de ProgramaciÃ³n Interactivas</h2>
              <span className={styles.sectionSub}>Completa tus niveles y rinde el examen final de certificaciÃ³n</span>
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
                      Continuar Ruta â†’
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* LADO DERECHO: CINTA LATERAL CON MENSAJERÍA Y CALENDARIO FIJO */}
        <aside className={styles.rightCalendarSidebar}>
          {/* CINTA LATERAL: MENSAJERÍA DIRECTA CON COMPAÑEROS DEL CURSO */}
          <div className={styles.sidebarMessengerCard}>
            <div className={styles.messengerCardHeader}>
              <div className={styles.messengerHeaderTitle}>
                <IconChat size={18} color="var(--primary)" />
                <h4>Mensajería del Curso</h4>
              </div>
              <span className={styles.chatActiveBadge}>En vivo</span>
            </div>
            <p className={styles.messengerCardDesc}>
              Conéctate y chatea con los estudiantes matriculados en tus mismos cursos y con tu docente.
            </p>
            <button
              type="button"
              className={styles.btnOpenCourseMessenger}
              onClick={() => setActiveSectionTab('messages')}
            >
              {activeSectionTab === 'messages' ? '✓ Estás en Mensajería' : 'Abrir Apartado de Mensajes →'}
            </button>
          </div>

          <div className={styles.stickyCalendarBox}>
            <CalendarWidget
              courses={courses}
              userRole="student"
              userId={user?.id}
              enrolledCourseIds={user?.enrolledCourses || []}
              lessonGoals={lessonGoals}
              tasks={tasks}
              customTitle="Calendario de Clases Matriculadas"
            />
          </div>
        </aside>
      </div>
      )}

      {/* MODAL DE HORARIO DEL CURSO */}
      {selectedCourseForSchedule && (
        <CourseScheduleModal
          course={selectedCourseForSchedule}
          isTeacher={false}
          allCourses={courses}
          onClose={() => setSelectedCourseForSchedule(null)}
        />
      )}

      {/* MODAL GENERAL DE TODAS LAS TAREAS CON FILTROS */}
      {showAllTasksModal && (
        <AllTasksModal
          onClose={() => setShowAllTasksModal(false)}
        />
      )}

      {/* MODAL DE MENSAJERÍA DEL CURSO */}
      {isMessengerOpen && (
        <UnifiedMessenger
          onClose={() => setIsMessengerOpen(false)}
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



