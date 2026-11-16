import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IconChat, IconUsers } from '../common/Icons';
import './TeacherMessages.css';

const TeacherMessages = () => {
  const { user, courses, students, teachers = [], messages, sendMessage, markMessagesAsRead } = useApp();
  const [contactTab, setContactTab] = useState('students'); // 'students' o 'colleagues'
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Cursos y alumnos pertenecientes exclusivamente a este docente
  const myCourses = courses.filter(c => c.teacherId === user?.id || (!c.teacherId && (user?.id === 'teacher-main' || !user?.id)));
  const myCourseIds = myCourses.map(c => c.id);
  
  const myStudents = students.filter(s => {
    const sCourses = s.enrolledCourses || (s.courseId ? [s.courseId] : []);
    return sCourses.some(id => myCourseIds.includes(id));
  }).map(s => {
    const sCourses = s.enrolledCourses || (s.courseId ? [s.courseId] : []);
    const matchingCourse = myCourses.find(c => sCourses.includes(c.id) || s.courseId === c.id);
    return {
      ...s,
      displayName: `${s.name || s.nombre || 'Estudiante'} ${s.lastName || s.apellido || ''}`.trim(),
      courseLabel: matchingCourse ? `${matchingCourse.name} • ${s.grade || '6'}° Grado` : `${s.grade || '6'}° Grado`
    };
  });

  // 2. Colegas docentes registrados en la plataforma para comunicación inter-docente
  const colleagueTeachers = teachers.filter(t => t.id !== user?.id).map(t => {
    const tCourses = courses.filter(c => c.teacherId === t.id);
    const cTitle = tCourses.length > 0 ? tCourses.map(c => c.name).join(', ') : 'Docente Colega';
    return {
      id: t.id,
      name: t.name || t.nombre || 'Profesor',
      lastName: t.lastName || t.apellido || '',
      displayName: `${t.name || t.nombre || 'Profesor'} ${t.lastName || t.apellido || ''}`.trim(),
      role: 'profesor',
      courseLabel: `${cTitle} • Plataforma`
    };
  });

  const baseContactList = contactTab === 'students' ? myStudents : colleagueTeachers;

  const filteredContacts = baseContactList.filter(c => {
    const full = (c.displayName || '').toLowerCase();
    const course = (c.courseLabel || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return full.includes(q) || course.includes(q);
  });

  const activeContact = filteredContacts.find(c => c.id === selectedContactId) || filteredContacts[0];

  // 3. Conversación estrictamente 1 a 1 entre el docente activo y el contacto seleccionado
  const conversation = messages.filter(m => {
    if (!activeContact) return false;
    const isDirect = (m.senderId === user?.id && m.receiverId === activeContact.id) ||
                     (m.senderId === activeContact.id && m.receiverId === user?.id);
    const isLegacyStudent = contactTab === 'students' && (
      (m.studentId === activeContact.id || m.student_id === activeContact.id) &&
      (m.senderId === user?.id || m.receiverId === user?.id || !m.receiverId)
    );
    return isDirect || isLegacyStudent;
  });

  const handleSelectContact = (cId) => {
    setSelectedContactId(cId);
    if (markMessagesAsRead) markMessagesAsRead(cId);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact) return;

    sendMessage({
      senderId: user?.id,
      senderName: `${user?.name || user?.nombre || 'Docente'} ${user?.lastName || user?.apellido || ''}`.trim(),
      senderRole: 'profesor',
      receiverId: activeContact.id,
      receiverName: activeContact.displayName,
      receiverRole: contactTab === 'colleagues' ? 'profesor' : 'estudiante',
      courseId: activeContact.courseId || null,
      studentId: contactTab === 'students' ? activeContact.id : null,
      studentName: contactTab === 'students' ? activeContact.displayName : null,
      sender: 'teacher',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setInputText('');
  };

  return (
    <div className="teacher-messages-view">
      <div className="messages-header-bar">
        <div className="header-titles-group">
          <h2>💬 Mensajería Docente</h2>
          <p className="subtitle">
            Comunícate de manera aislada con los alumnos de tus asignaturas o coordina con tus colegas profesores.
          </p>
        </div>
      </div>

      <div className="messages-layout-card">
        {/* PANEL LATERAL DE CONTACTOS */}
        <aside className="messages-students-list">
          {/* PESTAÑAS: ALUMNOS VS COLEGAS DOCENTES */}
          <div className="teacher-msg-tabs-row">
            <button
              type="button"
              className={`t-msg-tab-btn ${contactTab === 'students' ? 'active' : ''}`}
              onClick={() => { setContactTab('students'); setSelectedContactId(null); }}
            >
              👨‍🎓 Mis Alumnos ({myStudents.length})
            </button>
            <button
              type="button"
              className={`t-msg-tab-btn ${contactTab === 'colleagues' ? 'active' : ''}`}
              onClick={() => { setContactTab('colleagues'); setSelectedContactId(null); }}
            >
              👥 Colegas ({colleagueTeachers.length})
            </button>
          </div>

          <div className="students-list-head">
            <div className="search-student-box">
              <input
                type="text"
                placeholder={contactTab === 'students' ? "Buscar alumno o curso..." : "Buscar colega profesor..."}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="students-scroll-area">
            {filteredContacts.length === 0 ? (
              <div className="no-students-found">
                <p>
                  {contactTab === 'students'
                    ? 'No hay alumnos en tus asignaturas actualmente.'
                    : 'No hay otros profesores registrados.'}
                </p>
              </div>
            ) : (
              filteredContacts.map(c => {
                const isSelected = c.id === activeContact?.id;
                const contactMsgs = messages.filter(m => (m.senderId === c.id && m.receiverId === user?.id));
                const unread = contactMsgs.filter(m => !m.read).length;
                const lastMsg = conversation[conversation.length - 1];

                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`student-item-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectContact(c.id)}
                  >
                    <div className="student-avatar-circle">
                      {(c.displayName || 'U')[0].toUpperCase()}
                    </div>
                    <div className="student-meta-info">
                      <div className="st-name-row">
                        <span className="st-name">{c.displayName}</span>
                        {unread > 0 && <span className="st-unread-pill">{unread}</span>}
                      </div>
                      <span className="st-course-label">{c.courseLabel}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ÁREA DE CONVERSACIÓN PRINCIPAL */}
        <section className="chat-conversation-area">
          {activeContact ? (
            <>
              <div className="chat-partner-bar">
                <div className="partner-avatar">
                  {(activeContact.displayName || 'U')[0].toUpperCase()}
                </div>
                <div className="partner-details">
                  <h3>{activeContact.displayName}</h3>
                  <span>{activeContact.courseLabel}</span>
                </div>
              </div>

              <div className="chat-messages-history">
                {conversation.length === 0 ? (
                  <div className="no-messages-alert">
                    <p>No hay mensajes previos en esta conversación privada. ¡Escribe un mensaje abajo para comenzar!</p>
                  </div>
                ) : (
                  conversation.map((msg, index) => {
                    const isMe = msg.senderId === user?.id || (msg.sender === 'teacher' && msg.receiverId !== user?.id && contactTab === 'students');
                    const time = msg.time || (msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

                    return (
                      <div key={msg.id || index} className={`chat-bubble-row ${isMe ? 'sent' : 'received'}`}>
                        <div className="chat-bubble">
                          <span className="sender-tag">{isMe ? 'Tú' : (msg.senderName || activeContact.displayName)}</span>
                          <p className="bubble-text">{msg.text}</p>
                          <span className="bubble-time">{time}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder={`Escribe un mensaje para ${activeContact.displayName}...`}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                />
                <button type="submit" className="btn-send-msg" disabled={!inputText.trim()}>
                  Enviar Mensaje 🚀
                </button>
              </form>
            </>
          ) : (
            <div className="no-student-selected">
              <IconChat size={48} color="var(--primary)" />
              <p>Selecciona un contacto de la lista para iniciar la conversación.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TeacherMessages;
