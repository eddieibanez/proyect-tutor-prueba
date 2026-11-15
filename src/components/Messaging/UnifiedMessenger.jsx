import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './UnifiedMessenger.css';

const UnifiedMessenger = ({ onClose }) => {
  const { user, students, courses, messages, sendMessage, editMessage } = useApp();
  const [activeTab, setActiveTab] = useState('teachers'); // 'teachers' o 'students'
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState('');

  const isTeacher = user?.role === 'profesor';

  // Lista de contactos según rol y tab
  // 1. Docentes
  const teacherContacts = [
    { id: 'teacher-main', name: 'Profesor Titular', role: 'profesor', sub: 'Docente de Informática & Robótica' }
  ];

  // 2. Estudiantes del mismo curso / todos si es profesor
  const studentContacts = students.filter(s => s.id !== user?.id);

  const contactList = isTeacher
    ? studentContacts
    : (activeTab === 'teachers' ? teacherContacts : studentContacts);

  const activeContact = contactList.find(c => c.id === selectedContactId) || contactList[0];

  // Filtrar mensajes bidireccionales entre el usuario y el contacto seleccionado
  const conversation = messages.filter(m => {
    if (!activeContact) return false;
    const isDirect = (m.senderId === user?.id && m.receiverId === activeContact.id) ||
                     (m.senderId === activeContact.id && m.receiverId === user?.id);
    // Compatibilidad con mensajes legados
    const isLegacy = m.studentId === (isTeacher ? activeContact.id : user?.id);
    return isDirect || isLegacy;
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact) return;

    sendMessage({
      senderId: user.id,
      senderName: `${user.name || user.nombre} ${user.lastName || user.apellido || ''}`.trim(),
      senderRole: user.role,
      receiverId: activeContact.id,
      receiverName: activeContact.name,
      studentId: isTeacher ? activeContact.id : user.id,
      studentName: isTeacher ? activeContact.name : `${user.name || user.nombre}`,
      sender: user.role === 'profesor' ? 'teacher' : 'student',
      text: inputText.trim()
    });

    setInputText('');
  };

  const handleStartEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditText(msg.text);
  };

  const handleSaveEdit = (msgId) => {
    if (!editText.trim()) return;
    editMessage(msgId, editText.trim());
    setEditingMsgId(null);
    setEditText('');
  };

  return (
    <div className="messenger-modal-overlay" onClick={onClose}>
      <div className="messenger-modal-card" onClick={e => e.stopPropagation()}>
        {/* ENCABEZADO */}
        <div className="messenger-header">
          <div className="header-info">
            <h3>💬 Mensajería y Tutoría en Tiempo Real</h3>
            <p>Comunícate con docentes y compañeros de clase</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* PESTAÑAS PARA ESTUDIANTES */}
        {!isTeacher && (
          <div className="messenger-tabs-row">
            <button
              type="button"
              className={`msg-tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
              onClick={() => { setActiveTab('teachers'); setSelectedContactId(null); }}
            >
              👨‍🏫 Mis Docentes
            </button>
            <button
              type="button"
              className={`msg-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => { setActiveTab('students'); setSelectedContactId(null); }}
            >
              👥 Compañeros de Clase ({studentContacts.length})
            </button>
          </div>
        )}

        <div className="messenger-body-split">
          {/* LISTA LATERAL DE CONTACTOS */}
          <div className="messenger-contacts-list">
            <div className="contacts-head">
              <span>{isTeacher ? 'Alumnos' : activeTab === 'teachers' ? 'Docentes' : 'Compañeros'}</span>
            </div>
            <div className="contacts-scroll">
              {contactList.map(c => {
                const isSelected = activeContact?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={`contact-item ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedContactId(c.id)}
                  >
                    <div className="contact-avatar">
                      {c.name ? c.name.charAt(0) : 'U'}
                    </div>
                    <div className="contact-meta">
                      <span className="contact-name">{c.name} {c.lastName || ''}</span>
                      <small className="contact-sub">{c.grade ? `${c.grade}° Grado` : c.sub || 'Usuario'}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CHAT ACTIVO */}
          <div className="messenger-chat-pane">
            {activeContact ? (
              <>
                <div className="chat-pane-contact-bar">
                  <div className="contact-avatar-small">
                    {activeContact.name.charAt(0)}
                  </div>
                  <div>
                    <strong>{activeContact.name} {activeContact.lastName || ''}</strong>
                    <span className="online-pill">● En línea</span>
                  </div>
                </div>

                <div className="chat-messages-container">
                  {conversation.length === 0 ? (
                    <div className="empty-chat-hint">
                      <p>No hay mensajes aún en esta conversación. ¡Escribe un mensaje para comenzar!</p>
                    </div>
                  ) : (
                    conversation.map(msg => {
                      const isMine = msg.senderId === user.id || (isTeacher && msg.sender === 'teacher') || (!isTeacher && msg.sender === 'student' && msg.senderId !== activeContact.id);
                      const timeStr = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora';

                      return (
                        <div key={msg.id} className={`chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
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
                                />
                                <div className="inline-edit-actions">
                                  <button type="button" className="btn-save-edit" onClick={() => handleSaveEdit(msg.id)}>
                                    Guardar
                                  </button>
                                  <button type="button" className="btn-cancel-edit" onClick={() => setEditingMsgId(null)}>
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
                                  ✏️
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
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
                  <button type="submit" className="btn-send-message">
                    Enviar 🚀
                  </button>
                </form>
              </>
            ) : (
              <div className="no-contact-selected">
                <p>Selecciona un contacto para abrir el chat.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedMessenger;
