import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IconChat, IconClose, IconSend, IconEdit, IconCheck } from '../common/Icons';
import './UnifiedMessenger.css';

const UnifiedMessenger = ({ onClose, isEmbedded = false }) => {
  const { user, students, courses, messages, sendMessage, editMessage } = useApp();
  const [activeTab, setActiveTab] = useState('teachers'); // 'teachers' o 'students'
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState('');
  const [searchContactTerm, setSearchContactTerm] = useState('');

  const isTeacher = user?.role === 'profesor';
  const userEnrolled = user?.enrolledCourses || (user?.courseId ? [user?.courseId] : []);
  const relevantCourses = courses.filter(c => userEnrolled.includes(c.id));
  const coursesToUse = relevantCourses.length > 0 ? relevantCourses : courses;

  // 1. Docentes disponibles con su nombre real y la asignatura que imparten
  const teacherContacts = [];
  const seenTeacherKeys = new Set();

  coursesToUse.forEach(c => {
    const tId = c.teacherId || 'teacher-main';
    const tName = (c.teacherName && c.teacherName !== 'Profesor Titular') 
      ? c.teacherName 
      : (isTeacher ? (user.nombre || user.name || 'Docente') : 'Prof. Eddie Ibáñez');
    
    const key = `${tId}-${c.id}`;
    if (!seenTeacherKeys.has(key)) {
      seenTeacherKeys.add(key);
      teacherContacts.push({
        id: tId,
        name: tName,
        role: 'profesor',
        courseName: c.name,
        courseCode: c.code,
        sub: `${c.name} (${c.code})`
      });
    }
  });

  if (teacherContacts.length === 0) {
    teacherContacts.push({
      id: 'teacher-main',
      name: 'Prof. Eddie Ibáñez',
      role: 'profesor',
      courseName: 'Informática y Robótica',
      courseCode: 'DOC-TIT',
      sub: 'Docente Titular de Programación'
    });
  }

  // 2. Estudiantes con su curso respectivo visible en el subtítulo
  const studentContacts = (students || []).filter(s => {
    if (s.id === user?.id) return false;
    if (isTeacher) return true;
    if (userEnrolled.length > 0) {
      const studentCourses = s.enrolledCourses || (s.courseId ? [s.courseId] : []);
      const shareCourse = studentCourses.some(cId => userEnrolled.includes(cId));
      if (shareCourse) return true;
    }
    return String(s.grade || s.grado) === String(user?.grade || user?.grado || '6');
  }).map(s => {
    const studentCourses = s.enrolledCourses || (s.courseId ? [s.courseId] : []);
    const matchingCourse = courses.find(c => studentCourses.includes(c.id)) || courses.find(c => c.id === s.courseId);
    const courseSub = matchingCourse 
      ? `${matchingCourse.name} • ${s.grade || matchingCourse.grade || '6'}° Grado`
      : `${s.grade || '6'}° Grado`;
    return {
      ...s,
      courseName: matchingCourse?.name || 'Asignatura General',
      courseCode: matchingCourse?.code || '',
      sub: courseSub
    };
  });

  const baseContactList = isTeacher
    ? studentContacts
    : (activeTab === 'teachers' ? teacherContacts : studentContacts);

  // Filtrado por buscador
  const contactList = baseContactList.filter(c => {
    const q = searchContactTerm.trim().toLowerCase();
    if (!q) return true;
    const nameMatch = `${c.name || ''} ${c.lastName || ''}`.toLowerCase().includes(q);
    const subMatch = (c.sub || '').toLowerCase().includes(q);
    return nameMatch || subMatch;
  });

  const activeContact = contactList.find(c => c.id === selectedContactId) || contactList[0];

  // Filtrado bidireccional de conversación
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

    const isLegacy = m.student_id === (isTeacher ? activeContact.id : user?.id) ||
                     m.studentId === (isTeacher ? activeContact.id : user?.id);

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
      receiverName: activeContact.name,
      studentId: isTeacher ? activeContact.id : user.id,
      studentName: isTeacher ? activeContact.name : `${user.name || user.nombre}`,
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
    <div className="messenger-modal-overlay" onClick={onClose}>
      <div className="messenger-modal-card" onClick={e => e.stopPropagation()}>
        {/* ENCABEZADO */}
        <div className="messenger-header">
          <div className="header-info">
            <div className="header-title-row">
              <IconChat size={22} color="#00BCD4" />
              <h3>Mensajería</h3>
            </div>
            <p>Comunícate con docentes y compañeros de tus cursos en tiempo real</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} title="Cerrar mensajería">
            <IconClose size={20} />
          </button>
        </div>

        {/* PESTAÑAS PARA ESTUDIANTES */}
        {!isTeacher && (
          <div className="messenger-tabs-row">
            <button
              type="button"
              className={`msg-tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
              onClick={() => { setActiveTab('teachers'); setSelectedContactId(null); }}
            >
              👨‍🏫 Mis Docentes ({teacherContacts.length})
            </button>
            <button
              type="button"
              className={`msg-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => { setActiveTab('students'); setSelectedContactId(null); }}
            >
              👥 Compañeros de Curso ({studentContacts.length})
            </button>
          </div>
        )}

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
                  <p>No se encontraron contactos.</p>
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
                        {(c.name || 'U')[0].toUpperCase()}
                      </div>
                      <div className="contact-meta">
                        <span className="contact-name">{c.name} {c.lastName || ''}</span>
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
                    {(activeContact.name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <strong>{activeContact.name} {activeContact.lastName || ''}</strong>
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
                      <h4>Conversación con {activeContact.name}</h4>
                      <p>Inicia el diálogo escribiendo tus dudas o comentarios sobre las asignaturas y lecciones.</p>
                    </div>
                  ) : (
                    conversation.map((msg, index) => {
                      const isMine = msg.senderId === user.id ||
                        (isTeacher && msg.sender === 'teacher') ||
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
                                  {isMine ? 'Tú' : (msg.senderName || activeContact.name)}
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
                    placeholder={`Escribe un mensaje para ${activeContact.name}...`}
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
