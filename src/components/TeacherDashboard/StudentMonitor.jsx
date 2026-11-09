import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportStudentPDF, exportGroupPDF } from '../../utils/pdfReportGenerator';
import './StudentMonitor.css';

const StudentMonitor = () => {
  const { students, courses, updateStudentNote } = useApp();
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [studentNotes, setStudentNotes] = useState({});

  // Filtrado de estudiantes
  const filteredStudents = students.filter(st => {
    const matchCourse = selectedCourseId === 'all' || st.courseId === selectedCourseId;
    const matchGrade = filterGrade === 'all' || String(st.grade) === filterGrade;
    const matchStatus = filterStatus === 'all' || st.status === filterStatus;
    const matchSearch = !search || `${st.name} ${st.lastName || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchCourse && matchGrade && matchStatus && matchSearch;
  });

  const currentCourse = courses.find(c => c.id === selectedCourseId);
  const courseName = currentCourse ? currentCourse.name : 'Todos los Cursos';

  const handleSaveNote = (studentId) => {
    const note = studentNotes[studentId];
    if (note !== undefined) {
      updateStudentNote(studentId, note);
      alert('Nota guardada correctamente.');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Excelente': return 'status-excellent';
      case 'Bueno': return 'status-good';
      case 'Regular': return 'status-regular';
      case 'Necesita Apoyo': return 'status-support';
      default: return 'status-good';
    }
  };

  return (
    <div className="monitor-container">
      {/* HEADER CON BOTONES DE EXPORTACIÓN PDF */}
      <div className="monitor-header-bar">
        <div>
          <h2>📊 Monitoreo y Análisis de Rendimiento</h2>
          <p className="monitor-subtitle">
            Diagnóstico detallado de estudiantes matriculados, dificultades identificadas y generación de informes oficiales en PDF.
          </p>
        </div>
        <div className="export-actions-group">
          <button 
            type="button" 
            className="btn-export-group"
            onClick={() => exportGroupPDF(filteredStudents, courseName, filterGrade)}
          >
            📄 Descargar Informe Grupal (PDF)
          </button>
        </div>
      </div>

      {/* FILTROS POR CURSO, GRADO Y BÚSQUEDA */}
      <div className="monitor-filters-card">
        <div className="filter-group">
          <label>Curso / Asignatura:</label>
          <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
            <option value="all">Todos los Cursos</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                [{c.code}] {c.name} ({c.grade}° Grado)
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Filtrar por Grado:</label>
          <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}>
            <option value="all">Todos los Grados</option>
            {['6', '7', '8', '9', '10', '11'].map(g => (
              <option key={g} value={g}>{g}° Grado</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Estado de Desempeño:</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Todos los Estados</option>
            <option value="Excelente">Excelente (90-100%)</option>
            <option value="Bueno">Bueno (70-89%)</option>
            <option value="Regular">Regular (50-69%)</option>
            <option value="Necesita Apoyo">Necesita Apoyo (&lt;50%)</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <label>Buscar Alumno:</label>
          <input
            type="text"
            placeholder="Escribe el nombre del estudiante..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* RESUMEN PRELIMINAR */}
      <div className="monitor-metrics-row">
        <div className="metric-box">
          <span className="metric-label">Alumnos Mostrados</span>
          <span className="metric-val">{filteredStudents.length}</span>
        </div>
        <div className="metric-box green">
          <span className="metric-label">Destacados (Excelente)</span>
          <span className="metric-val">{filteredStudents.filter(s => s.status === 'Excelente').length}</span>
        </div>
        <div className="metric-box red">
          <span className="metric-label">Alertas (Necesita Apoyo)</span>
          <span className="metric-val">{filteredStudents.filter(s => s.status === 'Necesita Apoyo').length}</span>
        </div>
      </div>

      {/* TABLA DE ESTUDIANTES */}
      <div className="students-table-wrapper">
        <table className="students-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Curso Asignado</th>
              <th>Grado</th>
              <th>C++ Arduino</th>
              <th>Scratch</th>
              <th>Python</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-row">No se encontraron estudiantes para los filtros seleccionados.</td>
              </tr>
            ) : (
              filteredStudents.map(student => {
                const ard = student.arduino ?? 0;
                const scr = student.scratch ?? 0;
                const pyt = student.python ?? 0;
                const isExpanded = expandedStudentId === student.id;
                const assignedCourse = courses.find(c => c.id === student.courseId);

                return (
                  <React.Fragment key={student.id}>
                    <tr className={`student-row ${isExpanded ? 'row-expanded' : ''}`}>
                      <td className="student-name-cell">
                        <strong>{student.name} {student.lastName || ''}</strong>
                        <span className="student-sub">Última act: {student.lastActive || 'Reciente'}</span>
                      </td>
                      <td>
                        <span className="course-tag">{assignedCourse ? assignedCourse.code : 'Sin Curso'}</span>
                      </td>
                      <td>{student.grade}°</td>
                      <td>
                        <div className="score-badge arduino">{ard}%</div>
                      </td>
                      <td>
                        <div className="score-badge scratch">{scr}%</div>
                      </td>
                      <td>
                        <div className="score-badge python">{pyt}%</div>
                      </td>
                      <td>
                        <span className={`status-pill ${getStatusClass(student.status)}`}>
                          {student.status || 'Bueno'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="btn-inspect"
                          onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                          title="Ver análisis pedagógico y aspectos a mejorar"
                        >
                          {isExpanded ? '▲ Ocultar' : '▼ Análisis'}
                        </button>
                        <button
                          type="button"
                          className="btn-pdf-single"
                          onClick={() => exportStudentPDF(student, assignedCourse?.name)}
                          title="Descargar informe pedagógico individual en PDF"
                        >
                          📄 PDF
                        </button>
                      </td>
                    </tr>

                    {/* VISTA DESPLEGABLE CON DIAGNÓSTICO DETALLADO */}
                    {isExpanded && (
                      <tr className="student-details-row">
                        <td colSpan="8">
                          <div className="student-details-card">
                            <div className="details-col">
                              <h4>🔍 Aspectos que se deben mejorar (Según Análisis):</h4>
                              <ul className="weaknesses-list">
                                {ard < 60 && (
                                  <li>⚠️ <strong>C++ (Arduino):</strong> Dificultad con la declaración de pines, bucle void loop() y temporizadores con delay.</li>
                                )}
                                {scr < 60 && (
                                  <li>⚠️ <strong>Scratch:</strong> Falta afianzar la lógica de repetición y coordinación de mensajes entre objetos.</li>
                                )}
                                {pyt < 60 && (
                                  <li>⚠️ <strong>Python:</strong> Errores frecuentes de indentación, uso de bucles for e interpretación de variables locales.</li>
                                )}
                                {ard >= 60 && scr >= 60 && pyt >= 60 && (
                                  <li className="no-issues">✨ El alumno no presenta dificultades graves. Se sugiere continuar con proyectos avanzados.</li>
                                )}
                              </ul>

                              <h4 style={{ marginTop: '1rem' }}>💡 Recomendaciones de Actuación en el Aula:</h4>
                              <div className="classroom-recommendation">
                                {student.status === 'Necesita Apoyo'
                                  ? 'Implementar sesiones de refuerzo práctico guiadas de 15 minutos en el editor de consola interactivo y asignar ejercicios paso a paso.'
                                  : 'Fomentar la resolución autónoma de retos y permitirle asesorar a compañeros que presentan dudas en la sintaxis.'}
                              </div>
                            </div>

                            <div className="details-col notes-col">
                              <h4>📝 Notas de Seguimiento del Profesor:</h4>
                              <textarea
                                rows="3"
                                placeholder="Escribe observaciones pedagógicas para este alumno..."
                                defaultValue={student.notes || ''}
                                onChange={e => setStudentNotes({ ...studentNotes, [student.id]: e.target.value })}
                              />
                              <div className="notes-actions">
                                <button
                                  type="button"
                                  className="btn-save-note"
                                  onClick={() => handleSaveNote(student.id)}
                                >
                                  💾 Guardar Nota
                                </button>
                                <button
                                  type="button"
                                  className="btn-download-pdf-inside"
                                  onClick={() => exportStudentPDF(student, assignedCourse?.name)}
                                >
                                  📥 Descargar Informe Individual (PDF)
                                </button>
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
    </div>
  );
};

export default StudentMonitor;
