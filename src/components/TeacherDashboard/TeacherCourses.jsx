import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './TeacherCourses.css';
import CalendarWidget from '../Schedule/CalendarWidget';
import CourseScheduleModal from '../Schedule/CourseScheduleModal';
import CourseTasksModal from '../Tasks/CourseTasksModal';
import StudentScheduleView from '../Schedule/StudentScheduleView';
import { DAY_NAMES } from '../../utils/colombianHolidays';
import { TimePickerModal, DatePickerModal } from '../Schedule/DateTimePicker';
import { IconClock, IconCalendar } from '../common/Icons';

const TeacherCourses = ({ onOpenGoalModal }) => {
  const {
    user,
    courses,
    students,
    addCourse,
    updateCourse,
    deleteCourse,
    enrollStudentInCourse,
    addStudent,
    deleteStudent,
    updateCourseSchedule,
    toggleCourseDateCancellation,
    lessonGoals,
    tasks
  } = useApp();

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showStudentSchedule, setShowStudentSchedule] = useState(false);

  // Estado para creación de curso
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    grade: '6',
    description: '',
    scheduleDays: ['1', '3'],
    startTime: '08:00',
    endTime: '09:30',
    color: '#00838F',
    startDate: new Date().toISOString().split('T')[0]
  });
  const [createTimePickerField, setCreateTimePickerField] = useState(null);
  const [showCreateDatePicker, setShowCreateDatePicker] = useState(false);

  // Estado para edición de curso
  const [editingCourse, setEditingCourse] = useState(null);
  const [editTimePickerField, setEditTimePickerField] = useState(null);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  // Estado para modal de matricular alumno
  const [studentModalTab, setStudentModalTab] = useState('search'); // 'search' o 'create'
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentGradeFilter, setStudentGradeFilter] = useState('all');
  const [newStudent, setNewStudent] = useState({
    name: '',
    lastName: '',
    age: 12,
    grade: '6'
  });

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const enrolledStudents = students.filter(st => (st.enrolledCourses || []).includes(activeCourse?.id) || st.courseId === activeCourse?.id);

  // Verificación de colisiones y cruce de horarios entre asignaturas
  const checkScheduleConflict = (days, start, end, excludeCourseId = null) => {
    if (!days || days.length === 0 || !start || !end) return null;
    const otherCourses = courses.filter(c => c.id !== excludeCourseId);

    const toMinutes = (timeStr) => {
      const [h, m] = (timeStr || '00:00').split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const sM = toMinutes(start);
    const eM = toMinutes(end);

    for (const c of otherCourses) {
      const cDays = c.scheduleDays || [];
      const sharedDay = days.find(d => cDays.includes(d));
      if (sharedDay) {
        const cStart = toMinutes(c.startTime || '08:00');
        const cEnd = toMinutes(c.endTime || '09:30');
        if (sM < cEnd && eM > cStart) {
          return {
            conflict: true,
            courseName: c.name,
            courseCode: c.code,
            dayName: DAY_NAMES[sharedDay] || `Día ${sharedDay}`,
            timeRange: `${c.startTime || '08:00'} a ${c.endTime || '09:30'}`
          };
        }
      }
    }
    return null;
  };

  const createConflict = checkScheduleConflict(newCourse.scheduleDays, newCourse.startTime, newCourse.endTime);
  const editConflict = editingCourse ? checkScheduleConflict(editingCourse.scheduleDays, editingCourse.startTime, editingCourse.endTime, editingCourse.id) : null;

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.name || !newCourse.code) {
      alert('Por favor completa el nombre y código del curso.');
      return;
    }

    if (createConflict) {
      alert(`⚠️ Cruce de horarios: Este curso colisiona con "${createConflict.courseName}" (${createConflict.courseCode}) los días ${createConflict.dayName} en el horario ${createConflict.timeRange}. Por favor ajusta los días o la hora.`);
      return;
    }

    const scheduleStr = `${newCourse.scheduleDays.map(d => DAY_NAMES[d] || d).join(', ')} • ${newCourse.startTime} a ${newCourse.endTime}`;
    const courseToCreate = {
      ...newCourse,
      schedule: scheduleStr,
      teacherId: user?.id || 'teacher-main',
      teacherName: user?.nombre || user?.name || 'Profesor Titular'
    };
    const created = await Promise.resolve(addCourse(courseToCreate));
    setShowCourseModal(false);
    if (created && created.id) setSelectedCourseId(created.id);
    setNewCourse({
      name: '',
      code: '',
      grade: '6',
      description: '',
      scheduleDays: ['1', '3'],
      startTime: '08:00',
      endTime: '09:30',
      color: '#00838F',
      startDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleStartEditCourse = (course) => {
    setEditingCourse({
      ...course,
      scheduleDays: course.scheduleDays || ['1', '3'],
      startTime: course.startTime || '08:00',
      endTime: course.endTime || '09:30',
      startDate: course.startDate || new Date().toISOString().split('T')[0]
    });
    setShowEditCourseModal(true);
  };

  const handleSaveEditCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse || !editingCourse.name || !editingCourse.code) return;

    if (editConflict) {
      alert(`⚠️ Cruce de horarios: Este horario colisiona con "${editConflict.courseName}" (${editConflict.courseCode}) los días ${editConflict.dayName} en el horario ${editConflict.timeRange}. Modifica la hora o los días para evitar cruces.`);
      return;
    }

    const scheduleStr = `${(editingCourse.scheduleDays || []).map(d => DAY_NAMES[d] || d).join(', ')} • ${editingCourse.startTime} a ${editingCourse.endTime}`;
    const updated = {
      ...editingCourse,
      schedule: scheduleStr
    };

    if (updateCourse) {
      await updateCourse(editingCourse.id, updated);
    }
    setShowEditCourseModal(false);
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

  const handleEnrollExistingStudent = async (studentId) => {
    if (!activeCourse) return;
    if (enrollStudentInCourse) {
      await enrollStudentInCourse(studentId, activeCourse.id);
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
    const confirmDel = window.confirm(`¿Deseas desvincular y dar de baja al alumno "${studentName}" de esta asignatura?`);
    if (confirmDel) {
      deleteStudent(studentId);
    }
  };

  // Filtrado de estudiantes registrados
  const registeredCandidates = (students || []).filter(st => {
    const q = studentSearchTerm.trim().toLowerCase();
    const fullName = `${st.name || st.nombre || ''} ${st.lastName || st.apellido || ''}`.toLowerCase();
    const email = (st.email || '').toLowerCase();
    const matchesQuery = !q || fullName.includes(q) || email.includes(q);
    const matchesGrade = studentGradeFilter === 'all' || String(st.grade || st.grado) === String(studentGradeFilter);
    return matchesQuery && matchesGrade;
  });

  return (
    <div className="teacher-courses-view">
      <div className="courses-header-bar">
        <div>
          <h2>📚 Gestión de Cursos y Alumnos</h2>
          <p className="subtitle">Crea, edita y administra asignaturas sin cruces de horario. Matricula alumnos desde la plataforma.</p>
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
                      <div className="card-action-mini-btns">
                        <button
                          type="button"
                          className="btn-mini-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditCourse(course);
                          }}
                          title="Editar asignatura y horario"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="btn-delete-course"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCourse(course.id, course.name);
                          }}
                          title="Eliminar este curso"
                        >
                          🗑️
                        </button>
                      </div>
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
          {/* CALENDARIO DE CLASES Y HORARIOS DE LOS CURSOS */}
          <div className="courses-calendar-container-card">
            <div className="card-calendar-head">
              <h4>📅 Calendario Académico de Cursos y Horarios</h4>
              <p>Consulta las sesiones programadas, festivos y fechas asignadas para los estudiantes inscritos.</p>
            </div>
            <CalendarWidget
              courses={courses}
              userRole="teacher"
              userId={user?.id}
              lessonGoals={lessonGoals}
              tasks={tasks}
              customTitle="Horario General de Clases Docente"
            />
          </div>

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
                <div className="banner-stats-actions">
                  <div className="stat-pill">
                    <strong>{enrolledStudents.length}</strong>
                    <span>Matriculados</span>
                  </div>
                  <button
                    type="button"
                    className="btn-banner-edit-course"
                    onClick={() => handleStartEditCourse(activeCourse)}
                    title="Editar detalles y horario de esta asignatura"
                  >
                    ✏️ Editar Asignatura
                  </button>
                </div>
              </div>

              {/* LISTA Y GESTIÓN DE ALUMNOS MATRICULADOS */}
              <div className="enrolled-students-section">
                <div className="enrolled-header">
                  <h4>👨‍🎓 Estudiantes Matriculados ({enrolledStudents.length})</h4>
                  <button 
                    type="button" 
                    className="btn-add-student-course"
                    onClick={() => {
                      setStudentModalTab('search');
                      setShowStudentModal(true);
                    }}
                  >
                    + Matricular Alumno
                  </button>
                </div>

                {enrolledStudents.length === 0 ? (
                  <div className="empty-enrolled">
                    <p>No hay estudiantes matriculados en este curso todavía. Presiona "+ Matricular Alumno" para buscar en la plataforma.</p>
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
        <div className="course-modal-overlay" onClick={() => setShowCourseModal(false)}>
          <div className="course-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Crear Nueva Asignatura</h3>
              <button type="button" className="btn-close-modal" onClick={() => setShowCourseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCourse} className="course-edit-form">
              {createConflict && (
                <div className="conflict-warning-box">
                  ⚠️ <strong>Cruce de Horario:</strong> Se traslapa con "{createConflict.courseName}" ({createConflict.courseCode}) los días {createConflict.dayName} ({createConflict.timeRange}). Modifica el horario para evitar conflictos.
                </div>
              )}

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
                <label>Días de Clase Semanal:</label>
                <div className="days-picker-row">
                  {[
                    { id: '1', name: 'Lun' },
                    { id: '2', name: 'Mar' },
                    { id: '3', name: 'Mié' },
                    { id: '4', name: 'Jue' },
                    { id: '5', name: 'Vie' },
                    { id: '6', name: 'Sáb' }
                  ].map(day => {
                    const isSelected = newCourse.scheduleDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        className={`day-toggle-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          const exists = newCourse.scheduleDays.includes(day.id);
                          const next = exists
                            ? newCourse.scheduleDays.filter(d => d !== day.id)
                            : [...newCourse.scheduleDays, day.id];
                          setNewCourse({ ...newCourse, scheduleDays: next });
                        }}
                      >
                        {day.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label>Hora de Inicio:</label>
                  <button
                    type="button"
                    className="time-picker-trigger-btn"
                    onClick={() => setCreateTimePickerField('start')}
                  >
                    <IconClock size={16} />
                    <span>{newCourse.startTime}</span>
                  </button>
                </div>
                <div className="form-field">
                  <label>Hora de Fin:</label>
                  <button
                    type="button"
                    className="time-picker-trigger-btn"
                    onClick={() => setCreateTimePickerField('end')}
                  >
                    <IconClock size={16} />
                    <span>{newCourse.endTime}</span>
                  </button>
                </div>
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

              <div className="modal-footer-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowCourseModal(false)}>Cancelar</button>
                <button type="submit" className="btn-modal-submit" disabled={!!createConflict}>
                  {createConflict ? 'Horario con Cruce' : 'Guardar Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR CURSO Y AJUSTAR HORARIO */}
      {showEditCourseModal && editingCourse && (
        <div className="course-modal-overlay" onClick={() => setShowEditCourseModal(false)}>
          <div className="course-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>✏️ Editar Asignatura y Ajustar Horario</h3>
              <button type="button" className="btn-close-modal" onClick={() => setShowEditCourseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveEditCourse} className="course-edit-form">
              {editConflict && (
                <div className="conflict-warning-box">
                  ⚠️ <strong>Cruce de Horario:</strong> Se traslapa con "{editConflict.courseName}" ({editConflict.courseCode}) los días {editConflict.dayName} ({editConflict.timeRange}). Por favor ajusta la hora o los días.
                </div>
              )}

              <div className="form-field">
                <label>Nombre de la Asignatura:</label>
                <input
                  type="text"
                  value={editingCourse.name}
                  onChange={e => setEditingCourse({ ...editingCourse, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label>Código del Curso:</label>
                  <input
                    type="text"
                    value={editingCourse.code}
                    onChange={e => setEditingCourse({ ...editingCourse, code: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Grado Escolar:</label>
                  <select
                    value={editingCourse.grade}
                    onChange={e => setEditingCourse({ ...editingCourse, grade: e.target.value })}
                  >
                    {['6', '7', '8', '9', '10', '11'].map(g => (
                      <option key={g} value={g}>{g}° Grado</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Días de Clase Semanal:</label>
                <div className="days-picker-row">
                  {[
                    { id: '1', name: 'Lun' },
                    { id: '2', name: 'Mar' },
                    { id: '3', name: 'Mié' },
                    { id: '4', name: 'Jue' },
                    { id: '5', name: 'Vie' },
                    { id: '6', name: 'Sáb' }
                  ].map(day => {
                    const isSelected = (editingCourse.scheduleDays || []).includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        className={`day-toggle-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          const current = editingCourse.scheduleDays || [];
                          const exists = current.includes(day.id);
                          const next = exists ? current.filter(d => d !== day.id) : [...current, day.id];
                          setEditingCourse({ ...editingCourse, scheduleDays: next });
                        }}
                      >
                        {day.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label>Hora de Inicio:</label>
                  <button
                    type="button"
                    className="time-picker-trigger-btn"
                    onClick={() => setEditTimePickerField('start')}
                  >
                    <IconClock size={16} />
                    <span>{editingCourse.startTime}</span>
                  </button>
                </div>
                <div className="form-field">
                  <label>Hora de Fin:</label>
                  <button
                    type="button"
                    className="time-picker-trigger-btn"
                    onClick={() => setEditTimePickerField('end')}
                  >
                    <IconClock size={16} />
                    <span>{editingCourse.endTime}</span>
                  </button>
                </div>
              </div>

              <div className="form-field">
                <label>Descripción del Curso:</label>
                <textarea
                  rows="3"
                  value={editingCourse.description || ''}
                  onChange={e => setEditingCourse({ ...editingCourse, description: e.target.value })}
                />
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowEditCourseModal(false)}>Cancelar</button>
                <button type="submit" className="btn-modal-submit" disabled={!!editConflict}>
                  {editConflict ? 'Conflicto de Horario' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SELECTOR DE HORA MATERIAL PARA CREACIÓN */}
      {createTimePickerField && (
        <TimePickerModal
          isOpen={!!createTimePickerField}
          onClose={() => setCreateTimePickerField(null)}
          initialTime={createTimePickerField === 'start' ? newCourse.startTime : newCourse.endTime}
          onSelectTime={(newTime) => {
            if (createTimePickerField === 'start') {
              setNewCourse(prev => ({ ...prev, startTime: newTime }));
            } else {
              setNewCourse(prev => ({ ...prev, endTime: newTime }));
            }
            setCreateTimePickerField(null);
          }}
        />
      )}

      {/* SELECTOR DE HORA MATERIAL PARA EDICIÓN */}
      {editTimePickerField && (
        <TimePickerModal
          isOpen={!!editTimePickerField}
          onClose={() => setEditTimePickerField(null)}
          initialTime={editTimePickerField === 'start' ? editingCourse.startTime : editingCourse.endTime}
          onSelectTime={(newTime) => {
            if (editTimePickerField === 'start') {
              setEditingCourse(prev => ({ ...prev, startTime: newTime }));
            } else {
              setEditingCourse(prev => ({ ...prev, endTime: newTime }));
            }
            setEditTimePickerField(null);
          }}
        />
      )}

      {/* MODAL MATRICULAR ESTUDIANTE (CON BUSCADOR Y REGISTRO NUEVO) */}
      {showStudentModal && activeCourse && (
        <div className="course-modal-overlay" onClick={() => setShowStudentModal(false)}>
          <div className="course-modal-content student-enrollment-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Matricular Alumnos en [{activeCourse.name} - {activeCourse.code}]</h3>
              <button type="button" className="btn-close-modal" onClick={() => setShowStudentModal(false)}>✕</button>
            </div>

            <div className="student-modal-tab-bar">
              <button
                type="button"
                className={`tab-btn ${studentModalTab === 'search' ? 'active' : ''}`}
                onClick={() => setStudentModalTab('search')}
              >
                🔍 Buscar en Estudiantes Registrados ({students.length})
              </button>
              <button
                type="button"
                className={`tab-btn ${studentModalTab === 'create' ? 'active' : ''}`}
                onClick={() => setStudentModalTab('create')}
              >
                ➕ Registrar y Matricular Alumno Nuevo
              </button>
            </div>

            {studentModalTab === 'search' ? (
              <div className="student-search-view">
                <div className="search-filters-row">
                  <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      className="student-search-input"
                      placeholder="Buscar por nombre, apellido o correo..."
                      value={studentSearchTerm}
                      onChange={e => setStudentSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="grade-filter-select"
                    value={studentGradeFilter}
                    onChange={e => setStudentGradeFilter(e.target.value)}
                  >
                    <option value="all">Todos los Grados</option>
                    {['6', '7', '8', '9', '10', '11'].map(g => (
                      <option key={g} value={g}>{g}° Grado</option>
                    ))}
                  </select>
                </div>

                <div className="students-candidates-list">
                  {registeredCandidates.length === 0 ? (
                    <div className="empty-candidates">
                      <p>No se encontraron estudiantes con los criterios de búsqueda.</p>
                    </div>
                  ) : (
                    registeredCandidates.map(st => {
                      const isEnrolled = (st.enrolledCourses || []).includes(activeCourse.id) || st.courseId === activeCourse.id;
                      return (
                        <div key={st.id} className="student-candidate-card">
                          <div className="candidate-info">
                            <div className="candidate-avatar">
                              {(st.name || st.nombre || 'E')[0].toUpperCase()}
                            </div>
                            <div>
                              <strong>{st.name || st.nombre} {st.lastName || st.apellido || ''}</strong>
                              <span className="candidate-sub">
                                {st.email || 'Sin correo'} • Grado: {st.grade || st.grado || '6'}° • {st.age || 12} años
                              </span>
                            </div>
                          </div>
                          <div>
                            {isEnrolled ? (
                              <span className="badge-already-enrolled">✓ Ya Matriculado</span>
                            ) : (
                              <button
                                type="button"
                                className="btn-enroll-action"
                                onClick={() => handleEnrollExistingStudent(st.id)}
                              >
                                + Matricular
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="modal-footer-actions">
                  <button type="button" className="btn-modal-cancel" onClick={() => setShowStudentModal(false)}>Cerrar</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddStudentSubmit} className="course-edit-form">
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

                <div className="form-row-2">
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
                  <div className="form-field">
                    <label>Grado Asignado:</label>
                    <select
                      value={newStudent.grade}
                      onChange={e => setNewStudent({ ...newStudent, grade: e.target.value })}
                    >
                      {['6', '7', '8', '9', '10', '11'].map(g => (
                        <option key={g} value={g}>{g}° Grado</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer-actions">
                  <button type="button" className="btn-modal-cancel" onClick={() => setShowStudentModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-modal-submit">Registrar y Matricular</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCourses;
