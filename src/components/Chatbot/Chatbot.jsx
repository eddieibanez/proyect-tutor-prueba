import React, { useState, useEffect, useRef } from 'react';
import { IconChat, IconClose, IconSend } from '../common/Icons';
import './Chatbot.css';

const GEMINI_API_KEY = import.meta.env.VITE_CHATBOT_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';

const Chatbot = ({ languageId = 'general', levelId = 1, lessonData = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: `¡Hola! Soy tu tutor pedagógico de IA para ${String(languageId).toUpperCase()} (Nivel ${levelId}). No te daré el código resuelto, pero sí te guiaré paso a paso para que aprendas a razonarlo. ¿En qué parte tienes dudas?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [languageId, levelId]);

  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const callGeminiAPI = async (userPrompt, chatHistory) => {
    if (!GEMINI_API_KEY) {
      return `He analizado tu duda en ${languageId}. Recuerda revisar la estructura de tus instrucciones, la indentación y los tipos de datos que estás manipulando.`;
    }

    try {
      const lessonTitle = lessonData?.title || `Nivel ${levelId}`;
      const lessonInstructions = lessonData?.practice?.instructions || '';
      const lessonChallenge = lessonData?.challenge?.description || '';

      const systemInstruction = `Eres un tutor de programación experto y pedagógico para estudiantes de primaria y secundaria en CodeCraft Academy.
El estudiante está actualmente en la lección: "${lessonTitle}", Nivel: ${levelId} de ${languageId.toUpperCase()}.
Instrucciones de la lección: "${lessonInstructions}".
Desafío: "${lessonChallenge}".

REGLAS CRÍTICAS PEDAGÓGICAS:
1. NUNCA des el código resuelto ni la respuesta final completa.
2. Utiliza el método socrático: haz preguntas guía, proporciona recordatorios conceptuales y divide el problema en partes más simples.
3. Sé motivador, claro, breve y conciso (máximo 2 párrafos cortos).
4. Responde en español amigable.
5. Si preguntan sobre sintaxis, explica la estructura general con un ejemplo DIFERENTE al del ejercicio de la lección.`;

      const contents = [
        ...chatHistory.slice(-4).map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ];

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 350
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return botReply || 'Pensemos juntos: ¿qué crees que debe ocurrir en el primer paso de tu algoritmo?';
    } catch (err) {
      console.warn('Error al consultar Gemini Chatbot API:', err);
      return `¡Buena pregunta! Para resolver este nivel en ${languageId.toUpperCase()}, recuerda descomponer tu problema en pasos pequeños: 1) ¿Qué datos o pines necesitas configurar al inicio? 2) ¿Cuál es la condición que debe evaluarse? ¡Intenta escribir esa primera parte!`;
    }
  };

  const handleSendPrompt = async (textToSend) => {
    const clean = (textToSend || inputValue).trim();
    if (!clean || isTyping) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: clean,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const replyText = await callGeminiAPI(clean, messages);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: 'Hubo una breve interrupción en la conexión. ¿Qué parte de tu código o algoritmo quieres revisar?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendPrompt(inputValue);
  };

  const quickChips = [
    '💡 Dame una pista',
    '🔍 ¿Por qué falla mi lógica?',
    languageId === 'arduino' ? '⚡ ¿Cómo uso el pin y delay?' : '🐍 ¿Cómo estructuro el ciclo?'
  ];

  return (
    <div className="tutor-ai-wrapper">
      {!isOpen ? (
        <button
          type="button"
          className="tutor-ai-toggle-btn"
          onClick={toggleChat}
          title="Abrir Tutor IA Pedagógico"
        >
          <div className="tutor-toggle-icon">🤖</div>
          <span className="tutor-toggle-label">Tutor IA</span>
        </button>
      ) : (
        <div className="tutor-ai-window">
          {/* Cabecera Proporcional */}
          <div className="tutor-ai-header">
            <div className="tutor-header-title">
              <div className="tutor-avatar-icon">🤖</div>
              <div>
                <h4>Tutor Pedagógico IA</h4>
                <span className="tutor-level-badge">{languageId.toUpperCase()} • Nivel {levelId}</span>
              </div>
            </div>
            <button type="button" className="tutor-close-btn" onClick={toggleChat} title="Cerrar ventana">
              <IconClose size={16} />
            </button>
          </div>

          {/* Área de Mensajes */}
          <div className="tutor-messages-body">
            {messages.map(m => (
              <div key={m.id} className={`tutor-bubble-row ${m.sender === 'user' ? 'mine' : 'bot'}`}>
                <div className="tutor-bubble-content">
                  <p>{m.text}</p>
                  <span className="tutor-timestamp">{m.timestamp}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="tutor-bubble-row bot">
                <div className="tutor-bubble-content typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chips de Preguntas Frecuentes Rápidas */}
          <div className="tutor-chips-row">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className="tutor-chip-btn"
                onClick={() => handleSendPrompt(chip)}
                disabled={isTyping}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Formulario de Entrada */}
          <form className="tutor-input-form" onSubmit={handleFormSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Pregúntale al tutor..."
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="tutor-send-btn"
              title="Enviar consulta"
            >
              <IconSend size={15} color="#ffffff" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
