import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IconChat, IconClose, IconSend, IconEdit, IconCheck } from '../common/Icons';
import './UnifiedMessenger.css';

const UnifiedMessenger = ({ onClose, isEmbedded = false }) => {
  const { user, students, courses, teachers = [], messages, sendMessage, editMessage } = useApp();
  const [activeTab, setActiveTab] = useState('teachers'); // Para alumnos: 'teachers' | 'students'. Para docentes: 'students' | 'colleagues'
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState('');
  const [searchContactTerm, setSearchContactTerm] = useState('');

  const isTeacher = user?.role === 'profesor';

  // Si es estudiante: docentes de sus cursos matriculados
  const userEnrolled = user?.enrolledCourses || (user?.courseId ? [user?.courseId] : []);
  const studentCourses = courses.filter(c => userEnrolled.includes(c.id));
  const coursesForStudent = studentCourses.length > 0 ? studentCourses : courses;

  const studentTeacherContacts = [];
  const seenStudentTeacherKeys = new Set();

  coursesForStudent.forEach(c => {
    const tId = c.teacherId || 'teacher-main';
    const tObj = (teachers || []).find(t => t.id === tId);
    const tName = (c.teacherName && c.teacherName !== 'Profesor Titular') 
      ? c.teacherName 
      : (tObj ? `${tObj.name} ${tObj.lastName || ''}`.trim() : 'Prof. Eddie Ibáñez');
    
    const key = `${tId}-${c.id}`;
    if (!seenStudentTeacherKeys.has(key)) {
      seenStudentTeacherKeys.add(key);
      studentTeacherContacts.push({
        id: tId,
        name: tName,
        role: 'profesor',
        courseName: c.name,
        courseCode: c.code,
        sub: `${c.name} (${c.code})`
      });
    }
  });

  if (studentTeacherContacts.length === 0) {
    studentTeacherContacts.push({
      id: 'teacher-main',
      name: 'Prof. Eddie Ibáñez',
      role: 'profesor',
      courseName: 'Informática y Robótica',
      courseCode: 'DOC-TIT',
      sub: 'Docente Titular de Programación'
    });
  }

  // Si es docente: alumnos de sus asignaturas a cargo
  const myCourses = courses.filter(c => c.teacherId === user?.id || (!c.teacherId && (user?.id === 'teacher-main' || !user?.id)));
  const myCourseIds = myCourses.map(c => c.id);

  const teacherStudentContacts = (students || []).filter(s => {
    const sCourses = s.enrolledCourses || (s.courseId ? [s.courseId] : []);
    return sCourses.some(id => myCourseIds.includes(id));
  }).map(s => {
    const matchingCourse = myCourses.find(c => (s.enrolledCourses || []).includes(c.id) || s.courseId === c.id);
    return {
      ...s,
      displayName: `${s.name || s.nombre} ${s.lastName || s.apellido || ''}`.trim(),
      sub: matchingCourse ? `${matchingCourse.name} • ${s.grade || '6'}° Grado` : `${s.grade || '6'}° Grado`
    };
  });

  // Colegas docentes
  const colleagueTeachers = (teachers || []).filter(t => t.id !== user?.id).map(t => {
    const tCourses = courses.filter(c => c.teacherId === t.id);
    const cTitle = tCourses.length > 0 ? tCourses.map(c => c.name).join(', ') : 'Docente Colega';
    return {
      id: t.id,
      name: t.name || t.nombre || 'Profesor',
      lastName: t.lastName || t.apellido || '',
      displayName: `${t.name || t.nombre || 'Profesor'} ${t.lastName || t.apellido || ''}`.trim(),
      role: 'profesor',
      sub: `${cTitle} • Plataforma`
    };
  });

  // Compañeros de curso para estudiantes
  const classmates = (students || []).filter(s => {
    if (s.id === user?.id) return false;
    if (userEnrolled.length > 0) {
      const sCourses = s.enrolledCourses || (s.courseId ? [s.courseId] : []);
      return sCourses.some(cId => userEnrolled.includes(cId));
    }
    return String(s.grade || s.grado) === String(user?.grade || user?.grado || '6');
  }).map(s => {
    const matchingCourse = courses.find(c => (s.enrolledCourses || []).includes(c.id) || s.courseId === c.id);
    return {
      ...s,
      displayName: `${s.name || s.nombre} ${s.lastName || s.apellido || ''}`.trim(),
      sub: matchingCourse ? `${matchingCourse.name} • ${s.grade || '6'}° Grado` : `${s.grade || '6'}° Grado`
    };
  });

  // Determinar lista según rol y pestaña activa
  let baseContactList = [];
  if (isTeacher) {
    baseContactList = activeTab === 'colleagues' ? colleagueTeachers : teacherStudentContacts;
  } else {
    baseContactList = activeTab === 'teachers' ? studentTeacherContacts : classmates;
  }

  // Filtrado por buscador
  const contactList = baseContactList.filter(c => {
    const q = searchContactTerm.trim().toLowerCase();
    if (!q) return true;
    const nameMatch = `${c.name || ''} ${c.lastName || ''} ${c.displayName || ''}`.toLowerCase().includes(q);
    const subMatch = (c.sub || '').toLowerCase().includes(q);
    return nameMatch || subMatch;
  });

  const activeContact = contactList.find(c => c.id === selectedContactId) || contactList[0];

  // Conversación estrictamente 1 a 1
  const conversation = (messages || []).filter(m => {
    if (!activeContact) return false;

    let env = null;
    if (m.student_name && typeof m.student_name === 'string' && m.student_name.startsWith('{')) {
      try { env = JSON.parse(m.student_name); } catch {}
    }

    const sId = env?.senderId || m.senderId;
    const rId = env?.receiverId || m.receiverId;

    const isDirect = (sId === user?.id && rId === activeContact.id) ||
                     (sId === activeContact.id && rId === user?.id);

    const isLegacy = (!isTeacher && m.student_id === user?.id && m.sender === 'teacher') ||
                     (isTeacher && activeTab !== 'colleagues' && m.student_id === activeContact.id && (m.senderId === user?.id || m.receiverId === user?.id));

    return isDirect || isLegacy;
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean || !activeContact) return;

    sendMessage({
      senderId: user.id,
      senderName: `${user.name || user.nombre || 'Usuario'} ${user.lastName || user.apellido || ''}`.trim(),
      senderRole: user.role,
      receiverId: activeContact.id,
      receiverName: activeContact.displayName || activeContact.name,
      receiverRole: activeContact.role || 'estudiante',
      studentId: isTeacher && activeTab !== 'colleagues' ? activeContact.id : user.id,
      studentName: isTeacher && activeTab !== 'colleagues' ? activeContact.name : `${user.name || user.nombre}`,
      sender: user.role === 'profesor' ? 'teacher' : 'student',
      text: clean,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setInputText('');
  };

  const handleStartEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditText(msg.text);
  };

  const handleSaveEdit = (msgId) => {
    if (!editText.trim()) return;
    if (editMessage) editMessage(msgId, editText.trim());
    setEditingMsgId(null);
    setEditText('');
  };

  const getDayDividerLabel = (dateStr) => {
    if (!dateStr) return 'Hoy';
    const msgDate = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return msgDate.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
    }
  };

  return (
    <div className={`messenger-container ${isEmbedded ? 'messenger-embedded-view' : 'messenger-modal-overlay'}`} onClick={!isEmbedded ? onClose : undefined}>
      <div className={`messenger-modal-card ${isEmbedded ? 'embedded-card' : ''}`} onClick={e => e.stopPropagation()}>
        {/* ENCABEZADO */}
        <div className="messenger-header">
          <div className="header-info">
            <div className="header-title-row">
              <IconChat size={22} color="#00BCD4" />
              <h3>Mensajería</h3>
            </div>
            <p>
              {isTeacher
                ? 'Canales privados con tus estudiantes asignados y comunicación con colegas docentes'
                : 'Comunícate con docentes y compañeros de tus cursos en tiempo real'}
            </p>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (onClose) onClose();
            }}
            title={isEmbedded ? "Volver a Mis Cursos" : "Cerrar mensajería"}
            aria-label="Cerrar mensajería"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* PESTAÑAS */}
        <div className="messenger-tabs-row">
          {isTeacher ? (
            <>
              <button
                type="button"
                className={`msg-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => { setActiveTab('students'); setSelectedContactId(null); }}
              >
                👨‍🎓 Mis Alumnos ({teacherStudentContacts.length})
              </button>
              <button
                type="button"
                className={`msg-tab-btn ${activeTab === 'colleagues' ? 'active' : ''}`}
                onClick={() => { setActiveTab('colleagues'); setSelectedContactId(null); }}
              >
                👥 Colegas Docentes ({colleagueTeachers.length})
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`msg-tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
                onClick={() => { setActiveTab('teachers'); setSelectedContactId(null); }}
              >
                👨‍🏫 Mis Docentes ({studentTeacherContacts.length})
              </button>
              <button
                type="button"
                className={`msg-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => { setActiveTab('students'); setSelectedContactId(null); }}
              >
                👥 Compañeros de Curso ({classmates.length})
              </button>
            </>
          )}
        </div>

        <div className="messenger-body-split">
          {/* LISTA LATERAL DE CONTACTOS */}
          <div className="messenger-contacts-list">
            <div className="contacts-search-box">
              <input
                type="text"
                placeholder="🔍 Buscar contacto o curso..."
                value={searchContactTerm}
                onChange={e => setSearchContactTerm(e.target.value)}
                className="contacts-search-input"
              />
            </div>
            <div className="contacts-scroll">
              {contactList.length === 0 ? (
                <div className="empty-contacts-hint">
                  <p>No se encontraron contactos en esta sección.</p>
                </div>
              ) : (
                contactList.map(c => {
                  const isSelected = activeContact?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`contact-item ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedContactId(c.id)}
                    >
                      <div className="contact-avatar">
                        {(c.displayName || c.name || 'U')[0].toUpperCase()}
                      </div>
                      <div className="contact-meta">
                        <span className="contact-name">{c.displayName || c.name}</span>
                        <small className="contact-sub">{c.sub}</small>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CHAT ACTIVO */}
          <div className="messenger-chat-pane">
            {activeContact ? (
              <>
                <div className="chat-pane-contact-bar">
                  <div className="contact-avatar-small">
                    {(activeContact.displayName || activeContact.name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <strong>{activeContact.displayName || activeContact.name}</strong>
                    <div className="chat-sub-line">
                      <span className="contact-badge-course">{activeContact.sub}</span>
                      <span className="online-pill">● En línea</span>
                    </div>
                  </div>
                </div>

                <div className="chat-messages-container">
                  {conversation.length === 0 ? (
                    <div className="empty-chat-hint">
                      <div className="empty-chat-icon">💬</div>
                      <h4>Conversación con {activeContact.displayName || activeContact.name}</h4>
                      <p>Inicia el diálogo escribiendo tus dudas o notas de coordinación pedagógica.</p>
                    </div>
                  ) : (
                    conversation.map((msg, index) => {
                      const isMine = msg.senderId === user.id ||
                        (isTeacher && msg.sender === 'teacher' && msg.receiverId !== user.id) ||
                        (!isTeacher && msg.sender === 'student' && msg.senderId !== activeContact.id);

                      const timeStr = msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : msg.time || 'Ahora';

                      const showDayDivider = index === 0 || (
                        new Date(msg.created_at || Date.now()).toDateString() !==
                        new Date(conversation[index - 1].created_at || Date.now()).toDateString()
                      );

                      return (
                        <React.Fragment key={msg.id}>
                          {showDayDivider && (
                            <div className="day-separator-row">
                              <span className="day-separator-pill">
                                {getDayDividerLabel(msg.created_at)}
                              </span>
                            </div>
                          )}

                          <div className={`chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
                            <div className="bubble-content">
                              <div className="bubble-header-row">
                                <span className="bubble-author">
                                  {isMine ? 'Tú' : (msg.senderName || activeContact.displayName || activeContact.name)}
                                </span>
                                {msg.edited && <span className="edited-indicator">(editado)</span>}
                              </div>

                              {editingMsgId === msg.id ? (
                                <div className="inline-edit-box">
                                  <input
                                    type="text"
                                    value={editText}
                                    onChange={e => setEditText(e.target.value)}
                                    autoFocus
                                    className="edit-message-input"
                                  />
                                  <div className="inline-edit-actions">
                                    <button
                                      type="button"
                                      className="btn-save-edit"
                                      onClick={() => handleSaveEdit(msg.id)}
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-cancel-edit"
                                      onClick={() => setEditingMsgId(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="bubble-message-text">{msg.text}</p>
                              )}

                              <div className="bubble-footer-row">
                                <span className="bubble-timestamp">{timeStr}</span>
                                {isMine && editingMsgId !== msg.id && (
                                  <button
                                    type="button"
                                    className="btn-edit-trigger"
                                    onClick={() => handleStartEdit(msg)}
                                    title="Editar mensaje"
                                  >
                                    <IconEdit size={13} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                </div>

                <form className="chat-input-row" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder={`Escribe un mensaje para ${activeContact.displayName || activeContact.name}...`}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                  />
                  <button type="submit" className="btn-send-message" disabled={!inputText.trim()}>
                    <IconSend size={16} color="#ffffff" />
                    <span>Enviar</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="no-contact-selected">
                <p>Selecciona un contacto para iniciar la conversación.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedMessenger;
