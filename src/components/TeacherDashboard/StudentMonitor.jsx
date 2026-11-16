import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportStudentPDF, exportGroupPDF } from '../../utils/pdfReportGenerator';
import {
  IconUsers,
  IconSearch,
  IconFileText,
  IconChevronDown,
  IconChevronUp,
  IconCheck,
  IconAlertCircle,
  IconTrendingUp,
  IconAward,
  IconDownload,
  IconLightbulb,
  IconEdit,
  IconGlobe
} from '../common/Icons';
import './StudentMonitor.css';

const StudentMonitor = () => {
  const { user, students, courses, updateStudentNote } = useApp();

  // Monitoreo institucional: Asignaturas propias y de otros docentes
  const myCourses = courses.filter(c => c.teacherId === user?.id || (!c.teacherId && (user?.id === 'teacher-main' || !user?.id)));
  const myCourseIds = myCourses.map(c => c.id);
  const otherCourses = courses.filter(c => !myCourseIds.includes(c.id));

  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [studentNotes, setStudentNotes] = useState({});
  const [saveToast, setSaveToast] = useState('');

  // Filtrado de estudiantes: permite monitoreo de todos los alumnos registrados en la plataforma
  const filteredStudents = students.filter(st => {
    const stCourses = st.enrolledCourses || (st.courseId ? [st.courseId] : []);
    const matchCourse = selectedCourseId === 'all' || stCourses.includes(selectedCourseId) || st.courseId === selectedCourseId;
    const matchGrade = filterGrade === 'all' || String(st.grade) === filterGrade;
    const matchStatus = filterStatus === 'all' || st.status === filterStatus;
    const matchSearch = !search || `${st.name} ${st.lastName || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchCourse && matchGrade && matchStatus && matchSearch;
  });

  const currentCourse = courses.find(c => c.id === selectedCourseId);
  const courseName = currentCourse ? currentCourse.name : 'Todos los Alumnos';

  const handleSaveNote = (studentId) => {
    const note = studentNotes[studentId];
    if (note !== undefined) {
      updateStudentNote(studentId, note);
      setSaveToast('Nota pedagógica guardada con éxito');
      setTimeout(() => setSaveToast(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Excelente':
        return { label: 'Excelente', cls: 'status-excellent', icon: '★' };
      case 'Bueno':
        return { label: 'Bueno', cls: 'status-good', icon: '●' };
      case 'Regular':
        return { label: 'Regular', cls: 'status-regular', icon: '▲' };
      case 'Necesita Apoyo':
        return { label: 'Necesita Apoyo', cls: 'status-support', icon: '!' };
      default:
        return { label: status || 'Bueno', cls: 'status-good', icon: '●' };
    }
  };

  const getScoreColorClass = (val) => {
    if (val >= 90) return 'score-excellent';
    if (val >= 70) return 'score-good';
    if (val >= 50) return 'score-regular';
    return 'score-low';
  };

  // Métricas agregadas
  const totalCount = filteredStudents.length;
  const excellentCount = filteredStudents.filter(s => s.status === 'Excelente').length;
  const supportCount = filteredStudents.filter(s => s.status === 'Necesita Apoyo').length;
  const avgProgress = totalCount > 0
    ? Math.round(filteredStudents.reduce((acc, s) => acc + (((s.arduino || 0) + (s.scratch || 0) + (s.python || 0)) / 3), 0) / totalCount)
    : 0;

  return (
    <div className="monitor-container">
      {/* NOTIFICACIÓN TOAST ELEGANTE */}
      {saveToast && (
        <div className="monitor-toast-alert">
          <IconCheck size={16} color="#00E676" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* CABECERA PRINCIPAL PROFESIONAL */}
      <header className="monitor-header-card">
        <div className="header-info-group">
          <div className="header-badge-row">
            <span className="section-pill-tag">Centro de Evaluación</span>
            <span className="live-status-dot">
              <span className="dot-pulse"></span>
              En vivo
            </span>
          </div>
          <h2 className="monitor-main-title">Monitoreo y Análisis de Rendimiento</h2>
          <p className="monitor-main-subtitle">
            Supervisa en tiempo real el progreso de cada alumno, detecta dificultades de aprendizaje y genera informes pedagógicos oficiales en PDF.
          </p>
        </div>

        <div className="header-action-group">
          <button
            type="button"
            className="btn-export-group-pdf"
            onClick={() => exportGroupPDF(filteredStudents, courseName, filterGrade)}
            title="Descargar informe consolidado del grupo en formato PDF"
          >
            <IconDownload size={16} />
            <span>Descargar Informe Grupal (PDF)</span>
          </button>
        </div>
      </header>

      {/* TARJETAS DE MÉTRICAS GLOBALES CON TIPOGRAFÍA PROPORCIONAL */}
      <section className="monitor-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap neutral">
            <IconUsers size={20} />
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Alumnos Filtrados</span>
            <span className="kpi-number">{totalCount}</span>
            <span className="kpi-trend">Matriculados en lista</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap green">
            <IconAward size={20} />
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Desempeño Excelente</span>
            <span className="kpi-number text-green">{excellentCount}</span>
            <span className="kpi-trend">Rendimiento 90% - 100%</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap red">
            <IconAlertCircle size={20} />
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Casos de Alerta</span>
            <span className="kpi-number text-red">{supportCount}</span>
            <span className="kpi-trend">Requieren refuerzo práctico</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap cyan">
            <IconTrendingUp size={20} />
          </div>
          <div className="kpi-data">
            <span className="kpi-title">Promedio General</span>
            <span className="kpi-number text-cyan">{avgProgress}%</span>
            <span className="kpi-trend">Entre los tres lenguajes</span>
          </div>
        </div>
      </section>

      {/* PANEL DE FILTROS Y BÚSQUEDA */}
      <section className="monitor-filters-card">
        <div className="filters-grid">
          <div className="filter-item">
            <label className="filter-label">Curso o Asignatura:</label>
            <select
              className="filter-select"
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
            >
              <option value="all">Todos los Alumnos de la Plataforma ({students.length})</option>
              {myCourses.length > 0 && (
                <optgroup label="Mis Asignaturas Asignadas">
                  {myCourses.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.name} ({c.grade}° Grado) - Mi Asignatura
                    </option>
                  ))}
                </optgroup>
              )}
              {otherCourses.length > 0 && (
                <optgroup label="Asignaturas de Otros Docentes">
                  {otherCourses.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.name} ({c.grade}° Grado) - {c.teacherName || 'Colega'}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Grado Académico:</label>
            <select
              className="filter-select"
              value={filterGrade}
              onChange={e => setFilterGrade(e.target.value)}
            >
              <option value="all">Todos los Grados</option>
              {['6', '7', '8', '9', '10', '11'].map(g => (
                <option key={g} value={g}>{g}° Grado</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Estado de Rendimiento:</label>
            <select
              className="filter-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los Estados</option>
              <option value="Excelente">Excelente (90% - 100%)</option>
              <option value="Bueno">Bueno (70% - 89%)</option>
              <option value="Regular">Regular (50% - 69%)</option>
              <option value="Necesita Apoyo">Necesita Apoyo (&lt; 50%)</option>
            </select>
          </div>

          <div className="filter-item search-item">
            <label className="filter-label">Buscar Estudiante:</label>
            <div className="search-input-box">
              <IconSearch size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por nombre o apellido..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearch('')}
                  title="Borrar filtro de búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TABLA PRINCIPAL DE SEGUIMIENTO */}
      <section className="students-table-card">
        <div className="table-responsive-container">
          <table className="students-modern-table">
            <thead>
              <tr>
                <th className="th-student">Estudiante</th>
                <th className="th-course">Curso</th>
                <th className="th-grade">Grado</th>
                <th className="th-lang">C++ Arduino</th>
                <th className="th-lang">Scratch</th>
                <th className="th-lang">Python 3</th>
                <th className="th-status">Estado</th>
                <th className="th-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-empty-message">
                    <div className="empty-content">
                      <IconSearch size={28} />
                      <h4>No se encontraron alumnos con los criterios seleccionados</h4>
                      <p>Intenta ajustar los filtros de curso, grado o término de búsqueda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const ard = student.arduino ?? 0;
                  const scr = student.scratch ?? 0;
                  const pyt = student.python ?? 0;
                  const isExpanded = expandedStudentId === student.id;
                  const assignedCourse = courses.find(c => c.id === student.courseId);
                  const statusInfo = getStatusBadge(student.status);

                  return (
                    <React.Fragment key={student.id}>
                      <tr className={`student-table-row ${isExpanded ? 'row-active-expanded' : ''}`}>
                        <td className="cell-student-info">
                          <div className="student-profile-flex">
                            <div className="student-avatar-badge">
                              {student.name.charAt(0)}
                            </div>
                            <div className="student-text-group">
                              <span className="student-full-name">{student.name} {student.lastName || ''}</span>
                              <span className="student-meta-sub">Última act: {student.lastActive || 'Reciente'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="cell-course">
                          <span className="course-code-badge">
                            {assignedCourse ? assignedCourse.code : 'Sin Asignar'}
                          </span>
                        </td>

                        <td className="cell-grade">
                          <span className="grade-badge">{student.grade}°</span>
                        </td>

                        <td className="cell-score">
                          <div className="progress-badge-wrapper">
                            <span className={`progress-number ${getScoreColorClass(ard)}`}>{ard}%</span>
                            <div className="score-progress-bar">
                              <div className={`score-bar-fill fill-arduino`} style={{ width: `${ard}%` }} />
                            </div>
                          </div>
                        </td>

                        <td className="cell-score">
                          <div className="progress-badge-wrapper">
                            <span className={`progress-number ${getScoreColorClass(scr)}`}>{scr}%</span>
                            <div className="score-progress-bar">
                              <div className={`score-bar-fill fill-scratch`} style={{ width: `${scr}%` }} />
                            </div>
                          </div>
                        </td>

                        <td className="cell-score">
                          <div className="progress-badge-wrapper">
                            <span className={`progress-number ${getScoreColorClass(pyt)}`}>{pyt}%</span>
                            <div className="score-progress-bar">
                              <div className={`score-bar-fill fill-python`} style={{ width: `${pyt}%` }} />
                            </div>
                          </div>
                        </td>

                        <td className="cell-status">
                          <span className={`status-badge-chip ${statusInfo.cls}`}>
                            <span className="status-symbol">{statusInfo.icon}</span>
                            <span>{statusInfo.label}</span>
                          </span>
                        </td>

                        <td className="cell-actions">
                          <div className="table-actions-row">
                            <button
                              type="button"
                              className={`btn-table-action inspect ${isExpanded ? 'active' : ''}`}
                              onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                              title="Ver diagnóstico pedagógico detallado y dificultades"
                            >
                              <span>{isExpanded ? 'Ocultar' : 'Análisis'}</span>
                              {isExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                            </button>
                            <button
                              type="button"
                              className="btn-table-action pdf"
                              onClick={() => exportStudentPDF(student, assignedCourse?.name)}
                              title="Descargar informe pedagógico individual en PDF"
                            >
                              <IconFileText size={14} />
                              <span>PDF</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* VISTA DESPLEGABLE CON DIAGNÓSTICO Y NOTAS PEDAGÓGICAS */}
                      {isExpanded && (
                        <tr className="student-details-drawer-row">
                          <td colSpan="8">
                            <div className="student-analysis-card">
                              <div className="analysis-grid-split">
                                {/* COLUMNA 1: DIFICULTADES Y RECOMENDACIÓN */}
                                <div className="analysis-col">
                                  <div className="analysis-card-header">
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <IconSearch size={18} color="var(--primary)" />
                                      Diagnóstico Pedagógico y Puntos de Refuerzo
                                    </h4>
                                  </div>

                                  <div className="weaknesses-box">
                                    <span className="col-subheading">Dificultades detectadas según análisis:</span>
                                    <ul className="analysis-items-list">
                                      {ard < 60 && (
                                        <li className="weakness-item">
                                          <span className="weakness-tag arduino">C++ Arduino</span>
                                          <span className="weakness-desc">Dificultad con asignación de pines con pinMode(), bucle void loop() y retardos delay().</span>
                                        </li>
                                      )}
                                      {scr < 60 && (
                                        <li className="weakness-item">
                                          <span className="weakness-tag scratch">Scratch</span>
                                          <span className="weakness-desc">Requiere afianzar la lógica de bucles condicionales y sincronización de mensajes entre personajes.</span>
                                        </li>
                                      )}
                                      {pyt < 60 && (
                                        <li className="weakness-item">
                                          <span className="weakness-tag python">Python 3</span>
                                          <span className="weakness-desc">Errores recurrentes de indentación (sangría), control de flujo con if/elif y alcance de variables.</span>
                                        </li>
                                      )}
                                      {ard >= 60 && scr >= 60 && pyt >= 60 && (
                                        <li className="weakness-item success-item">
                                          <span className="success-tag">Sobresaliente</span>
                                          <span className="weakness-desc">El estudiante supera ampliamente los estándares en todos los lenguajes sin incidencias críticas.</span>
                                        </li>
                                      )}
                                    </ul>
                                  </div>

                                  <div className="recommendation-box">
                                    <span className="col-subheading" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <IconLightbulb size={16} color="var(--primary)" />
                                      Pauta de Actuación en Aula:
                                    </span>
                                    <p className="recommendation-text">
                                      {student.status === 'Necesita Apoyo'
                                        ? 'Programar sesiones prácticas supervisadas de 15 minutos en el editor con simulación paso a paso y retos de menor complejidad.'
                                        : 'Incentivar la resolución autónoma de proyectos avanzados y proponerle asesorar a pares que presenten dificultades.'}
                                    </p>
                                  </div>
                                </div>

                                {/* COLUMNA 2: NOTAS DEL PROFESOR Y DESCARGA */}
                                <div className="analysis-col notes-col">
                                  <div className="analysis-card-header">
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <IconEdit size={18} color="var(--primary)" />
                                      Bitácora de Observaciones Docentes
                                    </h4>
                                  </div>

                                  <div className="teacher-notes-editor">
                                    <label className="notes-label">Anotaciones personales para el seguimiento:</label>
                                    <textarea
                                      className="notes-textarea"
                                      rows="4"
                                      placeholder="Escribe aquí observaciones sobre la evolución del alumno, compromisos adquiridos o acuerdos con padres..."
                                      defaultValue={student.notes || ''}
                                      onChange={e => setStudentNotes({ ...studentNotes, [student.id]: e.target.value })}
                                    />
                                    <div className="notes-actions-bar">
                                      <button
                                        type="button"
                                        className="btn-save-note-action"
                                        onClick={() => handleSaveNote(student.id)}
                                      >
                                        <IconCheck size={14} />
                                        <span>Guardar Nota</span>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn-download-single-pdf"
                                        onClick={() => exportStudentPDF(student, assignedCourse?.name)}
                                      >
                                        <IconDownload size={14} />
                                        <span>Descargar Reporte Individual</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default StudentMonitor;
