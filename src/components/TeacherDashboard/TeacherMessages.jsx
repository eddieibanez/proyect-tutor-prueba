import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IconChat, IconUsers } from '../common/Icons';
import './TeacherMessages.css';

const TeacherMessages = () => {
  const { user, courses, students, messages, sendMessage, markMessagesAsRead } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const activeStudent = students.find(s => s.id === selectedStudentId);
  const assignedCourse = courses.find(c => c.id === activeStudent?.courseId);

  // Filtrado de alumnos por nombre o curso
  const filteredStudents = students.filter(s => {
    const full = `${s.name} ${s.lastName || ''}`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  // Mensajes de la conversación con el alumno seleccionado
  const conversation = messages.filter(m => {
    if (!activeStudent) return false;
    const isDirect = (m.studentId === activeStudent.id || m.student_id === activeStudent.id);
    const byRole = (m.receiverId === activeStudent.id && (m.senderId === user?.id || m.sender === 'teacher')) ||
                   (m.senderId === activeStudent.id && (m.receiverId === user?.id || m.sender === 'student'));
    return isDirect || byRole;
  });

  const handleSelectStudent = (stId) => {
    setSelectedStudentId(stId);
    markMessagesAsRead(stId);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeStudent) return;

    sendMessage({
      senderId: user?.id,
      senderName: `${user?.name || 'Profesor'} ${user?.lastName || ''}`.trim(),
      senderRole: 'profesor',
      receiverId: activeStudent.id,
      receiverName: `${activeStudent.name} ${activeStudent.lastName || ''}`.trim(),
      courseId: activeStudent.courseId,
      studentId: activeStudent.id,
      studentName: `${activeStudent.name} ${activeStudent.lastName || ''}`.trim(),
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
          <h2>💬 Mensajería Docente con Estudiantes</h2>
          <p className="subtitle">Comunícate en tiempo real con tus alumnos, resuelve dudas y realiza seguimiento pedagógico.</p>
        </div>
      </div>

      <div className="messages-layout-card">
        {/* PANEL LATERAL DE CONVERSACIONES DE ALUMNOS */}
        <aside className="messages-students-list">
          <div className="students-list-head">
            <div className="head-badge">
              <IconUsers size={16} />
              <span>Estudiantes ({students.length})</span>
            </div>
            <div className="search-student-box">
              <input
                type="text"
                placeholder="Buscar alumno..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="students-scroll-area">
            {filteredStudents.length === 0 ? (
              <div className="no-students-found">No se encontraron estudiantes</div>
            ) : (
              filteredStudents.map(st => {
                const stMsgs = messages.filter(m => (m.studentId === st.id || m.student_id === st.id));
                const unread = stMsgs.filter(m => (m.sender === 'student' || m.senderRole === 'estudiante') && !m.read).length;
                const lastMsg = stMsgs[stMsgs.length - 1];
                const isSelected = st.id === selectedStudentId;

                return (
                  <button
                    key={st.id}
                    type="button"
                    className={`student-item-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectStudent(st.id)}
                  >
                    <div className="student-avatar-circle">
                      {st.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="student-meta-info">
                      <div className="st-name-row">
                        <span className="st-name">{st.name} {st.lastName || ''}</span>
                        {unread > 0 && <span className="st-unread-pill">{unread}</span>}
                      </div>
                      <span className="st-course-label">
                        {courses.find(c => c.id === st.courseId)?.title || 'Curso General'}
                      </span>
                      {lastMsg && (
                        <p className="st-last-msg-preview">{lastMsg.text}</p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ÁREA DE CONVERSACIÓN PRINCIPAL */}
        <section className="chat-conversation-area">
          {activeStudent ? (
            <>
              <div className="chat-partner-bar">
                <div className="partner-avatar">
                  {activeStudent.name.charAt(0).toUpperCase()}
                </div>
                <div className="partner-details">
                  <h3>{activeStudent.name} {activeStudent.lastName || ''}</h3>
                  <span>{assignedCourse?.title || 'Curso Asignado'} • Grado: {activeStudent.grade || activeStudent.grado || '8°'}</span>
                </div>
              </div>

              <div className="chat-messages-history">
                {conversation.length === 0 ? (
                  <div className="no-messages-alert">
                    <p>No hay mensajes previos con este estudiante. Escribe un mensaje abajo para iniciar la conversación.</p>
                  </div>
                ) : (
                  conversation.map((msg, index) => {
                    const isMe = msg.sender === 'teacher' || msg.senderRole === 'profesor';
                    const time = msg.time || (msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

                    return (
                      <div key={msg.id || index} className={`chat-bubble-row ${isMe ? 'sent' : 'received'}`}>
                        <div className="chat-bubble">
                          <span className="sender-tag">{isMe ? 'Tú (Docente)' : activeStudent.name}</span>
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
                  placeholder={`Escribe un mensaje de orientación para ${activeStudent.name}...`}
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
              <p>Selecciona un estudiante de la lista lateral para abrir la conversación.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TeacherMessages;
