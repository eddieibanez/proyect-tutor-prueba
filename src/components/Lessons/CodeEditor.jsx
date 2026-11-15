import React, { useState, useEffect, useRef } from 'react';
import './CodeEditor.css';
import { IconPlay, IconTerminal, IconCheck } from '../common/Icons';

const GEMINI_API_KEY = import.meta.env.VITE_CHATBOT_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';

const CodeEditor = ({ language = 'arduino', initialCode = '', expectedOutput = '', lessonData = {} }) => {
  const [code, setCode] = useState(initialCode || '');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [aiGuidance, setAiGuidance] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Estados específicos de simulación visual de Arduino
  const [arduinoState, setArduinoState] = useState({
    ledOn: false,
    pwmValue: 0,
    serialLog: [],
    pinsMode: {},
    pinValues: {}
  });

  const textareaRef = useRef(null);

  useEffect(() => {
    if (initialCode !== undefined) {
      setCode(initialCode);
    }
  }, [initialCode]);

  // AUTO-TAB e INDENTACIÓN INTELIGENTE (tras ':' en Python o '{' en C++)
  const getAutoIndent = (value, selectionStart) => {
    const lines = value.substring(0, selectionStart).split('\n');
    const lastLine = lines[lines.length - 1] || '';
    const indentMatch = lastLine.match(/^(\s*)/);
    let indent = indentMatch ? indentMatch[1] : '';
    const trimmed = lastLine.trimEnd();
    if (trimmed.endsWith(':') || trimmed.endsWith('{')) {
      indent += '    '; // 4 espacios
    }
    return indent;
  };

  // MANEJO DE TECLAS: Tabulación, Auto-cierre de comillas y llaves
  const handleKeyDown = (e) => {
    const ta = e.target;
    const { selectionStart, selectionEnd, value } = ta;

    if (e.key === 'Tab') {
      e.preventDefault();
      const updated = value.substring(0, selectionStart) + '    ' + value.substring(selectionEnd);
      setCode(updated);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = selectionStart + 4;
      }, 0);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const indent = getAutoIndent(value, selectionStart);
      const updated = value.substring(0, selectionStart) + '\n' + indent + value.substring(selectionEnd);
      setCode(updated);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = selectionStart + 1 + indent.length;
      }, 0);
      return;
    }

    // Auto-cierre de pares: (), [], {}, "", ''
    const openClosePairs = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'"
    };

    if (openClosePairs[e.key]) {
      // Si el carácter siguiente ya es la comilla o cierre y se pulsa de nuevo, avanzar cursor
      if (value[selectionStart] === e.key && (e.key === '"' || e.key === "'")) {
        e.preventDefault();
        ta.selectionStart = ta.selectionEnd = selectionStart + 1;
        return;
      }

      e.preventDefault();
      const closing = openClosePairs[e.key];
      const selected = value.substring(selectionStart, selectionEnd);
      const updated = value.substring(0, selectionStart) + e.key + selected + closing + value.substring(selectionEnd);
      setCode(updated);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = selectionStart + 1;
      }, 0);
      return;
    }
  };

  // SIMULADOR DE ARDUINO SEGÚN ARDUINO API REFERENCE
  const simulateArduino = (src) => {
    const lines = [];
    let isLedOn = false;
    let pwm = 0;
    const currentPins = {};
    const pinModes = {};

    // 1. Verificación básica de estructura (setup y loop)
    if (!src.includes('void setup') || !src.includes('void loop')) {
      return {
        output: '[ERROR DE COMPILACIÓN] Arduino C++ requiere obligatoriamente las funciones void setup() y void loop().',
        success: false,
        state: { ledOn: false, pwmValue: 0 }
      };
    }

    // 2. pinMode(...)
    const pinMatches = src.match(/pinMode\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/g) || [];
    pinMatches.forEach(m => {
      const parts = m.match(/pinMode\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/);
      if (parts) {
        pinModes[parts[1]] = parts[2];
        lines.push(`[GPIO] pinMode(${parts[1]}, ${parts[2]}) configurado.`);
      }
    });

    // 3. Serial.begin(...)
    if (src.includes('Serial.begin')) {
      lines.push('[Serial] Comunicación UART inicializada.');
    }

    // 4. Serial.print / Serial.println
    const serialPrints = src.match(/Serial\.print(ln)?\s*\(\s*([^)]*)\s*\)/g) || [];
    serialPrints.forEach(sp => {
      const p = sp.match(/Serial\.print(ln)?\s*\(\s*([^)]*)\s*\)/);
      if (p && p[2]) {
        let clean = p[2].trim();
        if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
          clean = clean.slice(1, -1);
        }
        lines.push(`[Serial Monitor] ${clean}`);
      }
    });

    // 5. digitalWrite(...)
    const dWrites = src.match(/digitalWrite\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/g) || [];
    dWrites.forEach(dw => {
      const parts = dw.match(/digitalWrite\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/);
      if (parts) {
        const pin = parts[1];
        const val = parts[2].toUpperCase();
        currentPins[pin] = val;
        if (pin === '13' || pin === 'LED_BUILTIN') {
          isLedOn = val === 'HIGH' || val === '1';
        }
        lines.push(`[Digital Output] Pin ${pin} -> ${val}`);
      }
    });

    // 6. analogWrite(...)
    const aWrites = src.match(/analogWrite\s*\(\s*(\w+)\s*,\s*([0-9]+)\s*\)/g) || [];
    aWrites.forEach(aw => {
      const parts = aw.match(/analogWrite\s*\(\s*(\w+)\s*,\s*([0-9]+)\s*\)/);
      if (parts) {
        pwm = parseInt(parts[2], 10);
        lines.push(`[PWM Output] Pin ${parts[1]} ciclo de trabajo: ${pwm}/255 (${Math.round((pwm/255)*100)}%)`);
      }
    });

    // 7. delay(...)
    const delays = src.match(/delay\s*\(\s*([0-9]+)\s*\)/g) || [];
    if (delays.length > 0) {
      lines.push(`[Timer] delay ejecutado correctamente.`);
    }

    lines.push('[OK] Simulación y compilación Arduino C++ completada.');

    return {
      output: lines.join('\n'),
      success: true,
      state: { ledOn: isLedOn, pwmValue: pwm, pinsMode: pinModes, pinValues: currentPins }
    };
  };

  // SIMULADOR DE PYTHON
  const simulatePython = (src) => {
    const lines = [];

    // Validar sangría básica si hay dos puntos
    const codeLines = src.split('\n');
    for (let i = 0; i < codeLines.length - 1; i++) {
      if (codeLines[i].trim().endsWith(':')) {
        const next = codeLines[i + 1];
        if (next && next.trim() !== '' && !next.startsWith(' ') && !next.startsWith('\t')) {
          return {
            output: `[IndentationError] Línea ${i + 2}: Se esperaba un bloque indentado después de la instrucción de la línea ${i + 1}.`,
            success: false
          };
        }
      }
    }

    // print(...)
    const prints = src.match(/print\s*\(([^)]*)\)/g) || [];
    prints.forEach(p => {
      const inner = p.replace(/^print\s*\(/, '').replace(/\)$/, '').trim();
      let clean = inner;
      if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
        clean = clean.slice(1, -1);
      }
      lines.push(clean);
    });

    if (lines.length === 0 && src.trim() !== '') {
      lines.push('[Python 3.11 Execution Completed] Proceso finalizado sin salida en stdout.');
    } else if (src.trim() === '') {
      return { output: '[Error] Editor vacío. Escribe tu algoritmo antes de ejecutar.', success: false };
    }

    return {
      output: lines.join('\n'),
      success: true
    };
  };

  // ASISTENCIA SOCRÁTICA DE IA EN CONSOLA (Llama a Gemini API para guiar en caso de error o duda)
  const callGeminiForGuidance = async (execOutput) => {
    if (!GEMINI_API_KEY) return;
    setIsAiLoading(true);
    try {
      const prompt = 'Eres un tutor pedagogico de programacion.\n' +
        'El estudiante ejecuto este codigo en ' + language.toUpperCase() + ':\n' +
        code + '\n\n' +
        'Salida obtenida en consola:\n' + execOutput + '\n\n' +
        'Instrucciones de la leccion:\n' + (lessonData?.practice?.instructions || 'Realizar el ejercicio.') + '\n\n' +
        'REGLAS: 1) NUNCA des la solucion completa. 2) Explica en maximo 2 frases claras. 3) Haz una pregunta guia.';

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 200 }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        setAiGuidance(text || '');
      }
    } catch (e) {
      console.warn('Error en tutor IA de consola:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput(`Compilando y ejecutando en entorno ${language.toUpperCase()}...`);
    setAiGuidance('');

    setTimeout(() => {
      let result;
      if (language === 'arduino') {
        result = simulateArduino(code);
        setArduinoState(prev => ({ ...prev, ...result.state }));
      } else {
        result = simulatePython(code);
      }

      setOutput(result.output);
      setIsSuccess(result.success);
      setIsRunning(false);

      // Si falla o no coincide con la salida esperada, solicitar orientación socrática de la IA
      if (!result.success || (expectedOutput && !result.output.includes(expectedOutput.trim()))) {
        callGeminiForGuidance(result.output);
      }
    }, 500);
  };

  const handleReset = () => {
    setCode(initialCode || '');
    setOutput('');
    setIsSuccess(false);
    setAiGuidance('');
    setArduinoState({ ledOn: false, pwmValue: 0, serialLog: [], pinsMode: {}, pinValues: {} });
  };

  const linesList = (code || '').split('\n');
  const lineCount = linesList.length;

  return (
    <div className="vscode-editor-wrapper">
      {/* 1. BARRA DE PESTAÑAS ESTILO VS CODE */}
      <div className="vscode-titlebar">
        <div className="vscode-tabs-bar">
          <div className="vscode-tab active">
            <span className="file-icon-badge">
              {language === 'python' ? '🐍' : '⚡'}
            </span>
            <span className="tab-filename">
              {language === 'python' ? 'main.py' : 'sketch.ino'}
            </span>
          </div>
        </div>

        <div className="vscode-toolbar-actions">
          <button type="button" className="vsc-btn secondary" onClick={handleReset} title="Restablecer código inicial">
            Restablecer
          </button>
          <button
            type="button"
            className={`vsc-btn run ${isRunning ? 'running' : ''}`}
            onClick={handleRun}
            disabled={isRunning}
            title="Compilar y Simular Código"
          >
            <IconPlay size={14} />
            <span>{isRunning ? 'Compilando...' : 'Ejecutar'}</span>
          </button>
        </div>
      </div>

      {/* 2. ÁREA DE CODIFICACIÓN (LÍNEAS + TEXTAREA) */}
      <div className="vscode-editor-body">
        <div className="vscode-line-numbers">
          {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
            <div key={i} className="line-num">{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="vscode-textarea"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={
            language === 'python'
              ? '# Código Python\ndef main():\n    print("Hola Mundo")\n\nmain()'
              : '// Código C++ Arduino\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n}'
          }
        />

        {/* SIMULADOR EN TIEMPO REAL PARA ARDUINO */}
        {language === 'arduino' && (
          <div className="arduino-live-sim-panel">
            <div className="sim-panel-title">Microcontrolador y Hardware</div>
            <div className="board-representation">
              <div className="mcu-chip">ATmega328P</div>
              <div className="led-indicator-box">
                <div className={`led-bulb ${arduinoState.ledOn ? 'on' : 'off'}`} />
                <span>Pin 13 (LED): {arduinoState.ledOn ? 'ENCENDIDO' : 'APAGADO'}</span>
              </div>
              {arduinoState.pwmValue > 0 && (
                <div className="pwm-indicator-box">
                  <span>PWM: {arduinoState.pwmValue} / 255</span>
                  <div className="pwm-bar-bg">
                    <div className="pwm-bar-fill" style={{ width: `${(arduinoState.pwmValue/255)*100}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. BARRA DE ESTADO */}
      <div className="vscode-statusbar">
        <div className="status-left">
          <span>Ln {lineCount}, Col 1</span>
          <span>Espacios: 4</span>
          <span>UTF-8</span>
          <span>{language === 'python' ? 'Python 3.11' : 'Arduino AVR (C++)'}</span>
        </div>
        <div className="status-right">
          <span className={`status-pill ${isSuccess ? 'ok' : ''}`}>
            {isSuccess ? '✓ Sintaxis Verificada' : 'Listo'}
          </span>
        </div>
      </div>

      {/* 4. CONSOLA INTEGRADA MEJORADA CON ASISTENTE DE IA */}
      <div className="vscode-terminal-panel">
        <div className="terminal-header">
          <div className="terminal-title">
            <IconTerminal size={14} />
            <span>TERMINAL & CONSOLA DE SALIDA</span>
          </div>
          {isSuccess && <span className="terminal-success-tag">Ejecución exitosa</span>}
        </div>

        <div className="terminal-output-area">
          {output ? (
            <pre className={`terminal-text ${output.includes('[ERROR') ? 'error-text' : isSuccess ? 'success-text' : ''}`}>
              {output}
            </pre>
          ) : (
            <span className="terminal-placeholder">
              Presiona "▶ Ejecutar" para compilar el código y observar la respuesta del sistema...
            </span>
          )}

          {/* GUÍA DE IA SOCRÁTICA EN LA CONSOLA */}
          {(isAiLoading || aiGuidance) && (
            <div className="console-ai-box">
              <div className="ai-box-title">
                <strong>🤖 Tutor Pedagógico IA (Consejo de Consola):</strong>
              </div>
              {isAiLoading ? (
                <span className="ai-analysing">Analizando el código y la salida de tu consola...</span>
              ) : (
                <p className="ai-guidance-content">{aiGuidance}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
