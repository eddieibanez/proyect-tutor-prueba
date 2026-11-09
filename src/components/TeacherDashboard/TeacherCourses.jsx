import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './TeacherCourses.css';

const TeacherCourses = () => {
  const { courses, students, addCourse, deleteCourse, addStudent, deleteStudent } = useApp();
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || null);

  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    grade: '6',
    description: '',
    schedule: 'Lunes y Miércoles 08:00 - 09:30',
    color: '#00838F'
  });

  const [newStudent, setNewStudent] = useState({
    name: '',
    lastName: '',
    age: 12,
    grade: '6'
  });

  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourse.name || !newCourse.code) {
      alert('Por favor completa el nombre y código del curso.');
      return;
    }
    const created = addCourse(newCourse);
    setShowCourseModal(false);
    setSelectedCourseId(created.id);
    setNewCourse({
      name: '',
      code: '',
      grade: '6',
      description: '',
      schedule: 'Lunes y Miércoles 08:00 - 09:30',
      color: '#00838F'
    });
  };

  const handleDeleteCourse = (courseId, courseName) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el curso "${courseName}"? Esta acción desvinculará a los alumnos de esta materia.`);
    if (confirmDelete) {
      deleteCourse(courseId);
      if (selectedCourseId === courseId) {
        const remaining = courses.filter(c => c.id !== courseId);
        setSelectedCourseId(remaining[0]?.id || null);
      }
    }
  };

  const handleAddStudentSubmit = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.lastName) {
      alert('Por favor ingresa nombre y apellido del estudiante.');
      return;
    }
    addStudent({
      ...newStudent,
      courseId: activeCourse.id,
      grade: activeCourse.grade
    });
    setShowStudentModal(false);
    setNewStudent({ name: '', lastName: '', age: 12, grade: activeCourse.grade });
  };

  const handleDeleteStudent = (studentId, studentName) => {
    const confirmDel = window.confirm(`¿Deseas desvincular y eliminar al alumno "${studentName}" de la plataforma?`);
    if (confirmDel) {
      deleteStudent(studentId);
    }
  };

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const enrolledStudents = students.filter(st => (st.enrolledCourses || []).includes(activeCourse?.id) || st.courseId === activeCourse?.id);

  return (
    <div className="teacher-courses-view">
      <div className="courses-header-bar">
        <div>
          <h2>📚 Gestión de Cursos y Alumnos</h2>
          <p className="subtitle">Crea, administra y elimina asignaturas activas. Matricula y da de baja alumnos en cada materia.</p>
        </div>
        <button type="button" className="btn-add-course" onClick={() => setShowCourseModal(true)}>
          + Crear Nuevo Curso
        </button>
      </div>

      <div className="courses-grid-layout">
        {/* LISTA DE CURSOS A LA IZQUIERDA */}
        <div className="courses-list-col">
          <div className="col-head-row">
            <h3>Asignaturas Activas ({courses.length})</h3>
          </div>

          <div className="courses-cards-stack">
            {courses.length === 0 ? (
              <p className="empty-notice">No tienes cursos creados. Presiona "+ Crear Nuevo Curso" arriba.</p>
            ) : (
              courses.map(course => {
                const count = students.filter(s => (s.enrolledCourses || []).includes(course.id) || s.courseId === course.id).length;
                const isSelected = activeCourse?.id === course.id;

                return (
                  <div
                    key={course.id}
                    className={`course-summary-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCourseId(course.id)}
                    style={{ borderLeftColor: course.color || '#00BCD4' }}
                  >
                    <div className="card-top-actions">
                      <span className="course-code-tag" style={{ color: course.color }}>
                        {course.code}
                      </span>
                      {/* BOTÓN ELIMINAR CURSO */}
                      <button
                        type="button"
                        className="btn-delete-course"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id, course.name);
                        }}
                        title="Eliminar este curso permanentemente"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>

                    <h4 className="course-title">{course.name}</h4>
                    <p className="course-info-sub">{course.grade}° Grado • {count} estudiante(s) matriculado(s)</p>
                    <span className="course-schedule">{course.schedule}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* DETALLE DEL CURSO Y ESTUDIANTES MATRICULADOS */}
        <div className="course-detail-col">
          {activeCourse ? (
            <div className="course-detail-card">
              <div className="detail-top-banner">
                <div>
                  <div className="banner-pills-row">
                    <span className="badge-grade">{activeCourse.grade}° Grado</span>
                    <span className="badge-code">Código: {activeCourse.code}</span>
                  </div>
                  <h3>{activeCourse.name}</h3>
                  <p>{activeCourse.description || 'Sin descripción adicional.'}</p>
                </div>
                <div className="banner-stats">
                  <div className="stat-pill">
                    <strong>{enrolledStudents.length}</strong>
                    <span>Matriculados</span>
                  </div>
                </div>
              </div>

              {/* LISTA Y GESTIÓN DE ALUMNOS MATRICULADOS */}
              <div className="enrolled-students-section">
                <div className="enrolled-header">
                  <h4>👨‍🎓 Estudiantes Matriculados ({enrolledStudents.length})</h4>
                  <button 
                    type="button" 
                    className="btn-add-student-course"
                    onClick={() => setShowStudentModal(true)}
                  >
                    + Matricular Nuevo Alumno
                  </button>
                </div>

                {enrolledStudents.length === 0 ? (
                  <div className="empty-enrolled">
                    <p>No hay estudiantes matriculados en este curso todavía.</p>
                  </div>
                ) : (
                  <div className="enrolled-table-container">
                    <table className="enrolled-table">
                      <thead>
                        <tr>
                          <th>Estudiante</th>
                          <th>Edad</th>
                          <th>C++ Arduino</th>
                          <th>Scratch</th>
                          <th>Python</th>
                          <th>Desempeño</th>
                          <th>Gestión</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledStudents.map(st => (
                          <tr key={st.id}>
                            <td><strong>{st.name} {st.lastName || ''}</strong></td>
                            <td>{st.age || 12} años</td>
                            <td><span className="score ard">{st.arduino || 0}%</span></td>
                            <td><span className="score scr">{st.scratch || 0}%</span></td>
                            <td><span className="score pyt">{st.python || 0}%</span></td>
                            <td>
                              <span className={`pill-status ${(st.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                {st.status || 'Bueno'}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn-remove-student-row"
                                onClick={() => handleDeleteStudent(st.id, `${st.name} ${st.lastName || ''}`)}
                                title="Dar de baja a este estudiante"
                              >
                                ✕ Dar de baja
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-course-chosen">
              <p>Selecciona o crea un curso para ver sus detalles y estudiantes.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CREAR CURSO */}
      {showCourseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Crear Nueva Asignatura</h3>
              <button type="button" className="close-btn" onClick={() => setShowCourseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCourse}>
              <div className="form-field">
                <label>Nombre de la Asignatura / Curso:</label>
                <input
                  type="text"
                  placeholder="Ej: Robótica y Domótica Aplicada"
                  value={newCourse.name}
                  onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label>Código del Curso:</label>
                  <input
                    type="text"
                    placeholder="Ej: ROB-8A"
                    value={newCourse.code}
                    onChange={e => setNewCourse({ ...newCourse, code: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Grado Escolar:</label>
                  <select value={newCourse.grade} onChange={e => setNewCourse({ ...newCourse, grade: e.target.value })}>
                    {['6', '7', '8', '9', '10', '11'].map(g => (
                      <option key={g} value={g}>{g}° Grado</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Horario Semanal:</label>
                <input
                  type="text"
                  value={newCourse.schedule}
                  onChange={e => setNewCourse({ ...newCourse, schedule: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Descripción y Metodología:</label>
                <textarea
                  rows="3"
                  placeholder="Objetivos pedagógicos del curso..."
                  value={newCourse.description}
                  onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCourseModal(false)}>Cancelar</button>
                <button type="submit" className="btn-submit">Guardar Curso</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MATRICULAR ESTUDIANTE */}
      {showStudentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Matricular Nuevo Alumno en [{activeCourse?.code}]</h3>
              <button type="button" className="close-btn" onClick={() => setShowStudentModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddStudentSubmit}>
              <div className="form-row-2">
                <div className="form-field">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    placeholder="Ej: Daniel"
                    value={newStudent.name}
                    onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Apellido:</label>
                  <input
                    type="text"
                    placeholder="Ej: Valencia"
                    value={newStudent.lastName}
                    onChange={e => setNewStudent({ ...newStudent, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Edad:</label>
                <input
                  type="number"
                  min="10"
                  max="19"
                  value={newStudent.age}
                  onChange={e => setNewStudent({ ...newStudent, age: parseInt(e.target.value, 10) })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowStudentModal(false)}>Cancelar</button>
                <button type="submit" className="btn-submit">Matricular Alumno</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCourses;
