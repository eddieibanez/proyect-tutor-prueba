import React, { useState, useEffect, useRef } from 'react';
import './CodeEditor.css';
import { IconPlay, IconTerminal } from '../common/Icons';

const GEMINI_API_KEY = import.meta.env.VITE_CHATBOT_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';

const CodeEditor = ({ language = 'arduino', initialCode = '', expectedOutput = '', lessonData = {} }) => {
  const [code, setCode] = useState(initialCode || '');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [aiGuidance, setAiGuidance] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Estados de simulación de Arduino con cableado y retardos delay(ms)
  const [arduinoState, setArduinoState] = useState({
    ledOn: false,
    activePin: 13,
    pwmValue: 0,
    pinsMode: {},
    pinValues: {},
    isSimulatingDelay: false
  });

  const textareaRef = useRef(null);

  useEffect(() => {
    if (initialCode !== undefined) {
      setCode(initialCode);
    }
  }, [initialCode]);

  // AUTO-TAB E INDENTACIÓN INTELIGENTE
  const getAutoIndent = (value, selectionStart) => {
    const lines = value.substring(0, selectionStart).split('\n');
    const lastLine = lines[lines.length - 1] || '';
    const indentMatch = lastLine.match(/^(\s*)/);
    let indent = indentMatch ? indentMatch[1] : '';
    const trimmed = lastLine.trimEnd();
    if (trimmed.endsWith(':') || trimmed.endsWith('{')) {
      indent += '    ';
    }
    return indent;
  };

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

    const openClosePairs = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'"
    };

    if (openClosePairs[e.key]) {
      const closingChar = openClosePairs[e.key];
      if (selectionStart === selectionEnd) {
        e.preventDefault();
        const updated = value.substring(0, selectionStart) + e.key + closingChar + value.substring(selectionEnd);
        setCode(updated);
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = selectionStart + 1;
        }, 0);
      }
    }
  };

  // VALIDACIÓN ESTRICTA DE SINTAXIS ARDUINO C++ (Case-sensitive y detección de línea)
  const validateArduinoStrict = (src) => {
    const lines = src.split('\n');
    const errors = [];

    // Errores tipográficos comunes en Arduino API Reference
    const casingChecks = [
      { bad: /\bpinmode\b/i, correct: 'pinMode', rxCorrect: /\bpinMode\b/ },
      { bad: /\bdigitalwrite\b/i, correct: 'digitalWrite', rxCorrect: /\bdigitalWrite\b/ },
      { bad: /\bdigitalread\b/i, correct: 'digitalRead', rxCorrect: /\bdigitalRead\b/ },
      { bad: /\banalogwrite\b/i, correct: 'analogWrite', rxCorrect: /\banalogWrite\b/ },
      { bad: /\banalogread\b/i, correct: 'analogRead', rxCorrect: /\banalogRead\b/ },
      { bad: /\bserial\.print/i, correct: 'Serial.print', rxCorrect: /\bSerial\.print/ },
      { bad: /\bserial\.println/i, correct: 'Serial.println', rxCorrect: /\bSerial\.println/ },
      { bad: /\bserial\.begin/i, correct: 'Serial.begin', rxCorrect: /\bSerial\.begin/ },
      { bad: /\bhigh\b/i, correct: 'HIGH', rxCorrect: /\bHIGH\b/ },
      { bad: /\blow\b/i, correct: 'LOW', rxCorrect: /\bLOW\b/ },
      { bad: /\boutput\b/i, correct: 'OUTPUT', rxCorrect: /\bOUTPUT\b/ },
      { bad: /\binput\b/i, correct: 'INPUT', rxCorrect: /\bINPUT\b/ }
    ];

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      casingChecks.forEach(chk => {
        if (chk.bad.test(trimmed) && !chk.rxCorrect.test(trimmed)) {
          errors.push(`sketch.ino:${lineNum}:error: identificador no declarado en este ámbito; ¿quisiste decir '${chk.correct}'?`);
        }
      });

      // Verificación de punto y coma en instrucciones C++
      if (
        (trimmed.startsWith('pinMode') || trimmed.startsWith('digitalWrite') || trimmed.startsWith('analogWrite') || trimmed.startsWith('delay') || trimmed.startsWith('Serial.')) &&
        !trimmed.endsWith(';') && !trimmed.endsWith('{')
      ) {
        errors.push(`sketch.ino:${lineNum}:error: falta ';' al final de la instrucción.`);
      }
    });

    if (!src.includes('void setup') || !src.includes('void loop')) {
      errors.unshift("sketch.ino:1:error: Arduino requiere obligatoriamente las funciones 'void setup()' y 'void loop()'.");
    }

    return errors;
  };

  // SIMULADOR ARDUINO CON EJECUCIÓN TEMPORIZADA DE DELAY(MS)
  const simulateArduinoWithDelay = async (src) => {
    const errors = validateArduinoStrict(src);
    if (errors.length > 0) {
      return {
        success: false,
        output: errors.join('\n')
      };
    }

    const logs = [];
    logs.push('[Compilador AVR-GCC] Compilado sin errores.');
    logs.push('[Arduino Hardware] Cargando binario a memoria flash...');

    // Detectar pin configurado
    let activePin = 13;
    const pmMatch = src.match(/pinMode\s*\(\s*(\w+)\s*,\s*OUTPUT\s*\)/);
    if (pmMatch && !isNaN(pmMatch[1])) {
      activePin = parseInt(pmMatch[1], 10);
      logs.push(`[GPIO] Pin ${activePin} configurado como OUTPUT.`);
    }

    // Parsear delays
    const delayMatches = src.match(/delay\s*\(\s*([0-9]+)\s*\)/g) || [];
    let delayMs = 1000;
    if (delayMatches.length > 0) {
      const dVal = delayMatches[0].match(/delay\s*\(\s*([0-9]+)\s*\)/);
      if (dVal && dVal[1]) delayMs = parseInt(dVal[1], 10);
    }

    // Simular secuencia de parpadeo con retardo real
    setArduinoState(prev => ({ ...prev, activePin, ledOn: true, isSimulatingDelay: true }));
    logs.push(`[Circuito] Pin ${activePin} -> HIGH (LED Encendido)`);
    logs.push(`[Temporizador] delay(${delayMs}ms) en ejecución...`);
    setOutput(logs.join('\n'));

    // Espera real proporcional al delay (acotada entre 500ms y 2500ms para UX fluida)
    const waitTime = Math.min(2500, Math.max(500, delayMs));
    await new Promise(res => setTimeout(res, waitTime));

    setArduinoState(prev => ({ ...prev, ledOn: false, isSimulatingDelay: false }));
    logs.push(`[Circuito] Pin ${activePin} -> LOW (LED Apagado)`);
    logs.push(`[OK] Ciclo de simulación Arduino completado con éxito.`);

    return {
      success: true,
      output: logs.join('\n')
    };
  };

  // RESALTADO DE SINTAXIS AUTOMÁTICO ESTILO VS CODE PARA PYTHON Y ARDUINO C++
  const preHighlightRef = useRef(null);

  const handleScrollSync = (e) => {
    if (preHighlightRef.current) {
      preHighlightRef.current.scrollTop = e.target.scrollTop;
      preHighlightRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const renderSyntaxHighlightedCode = (rawCode) => {
    if (!rawCode) return '\n';

    // Regex tokens para VS Code Dark+:
    // Comentarios, strings, keywords de control, funciones, números, operadores
    const lines = rawCode.split('\n');

    return lines.map((line, lIdx) => {
      // Si la línea es comentario
      const trimmed = line.trimStart();
      if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
        return (
          <div key={lIdx} className="hl-line">
            <span className="hl-comment">{line}</span>
          </div>
        );
      }

      // Tokenizador regex
      const tokenRegex = /(".*?"|'.*?'|\b(?:def|class|if|elif|else|while|for|in|return|import|from|as|try|except|with|and|or|not|True|False|None|void|int|float|char|bool|setup|loop|pinMode|digitalWrite|digitalRead|analogRead|analogWrite|Serial|delay|HIGH|LOW|OUTPUT|INPUT|INPUT_PULLUP)\b|\b\d+(?:\.\d+)?\b|[a-zA-Z_]\w*(?=\s*\()|[-+*/%<>=!&|^~]+|[^\s\w"'\-+*/%<>=!&|^~]+|\s+)/g;

      const tokens = [];
      let match;
      let lastIndex = 0;

      while ((match = tokenRegex.exec(line)) !== null) {
        const text = match[0];

        if (text.startsWith('"') || text.startsWith("'")) {
          tokens.push(<span key={tokens.length} className="hl-string">{text}</span>);
        } else if (/^(?:def|class|if|elif|else|while|for|in|return|import|from|as|try|except|with|void|int|float|char|bool|setup|loop)$/.test(text)) {
          tokens.push(<span key={tokens.length} className="hl-keyword">{text}</span>);
        } else if (/^(?:and|or|not|True|False|None|HIGH|LOW|OUTPUT|INPUT|INPUT_PULLUP)$/.test(text)) {
          tokens.push(<span key={tokens.length} className="hl-constant">{text}</span>);
        } else if (/^(?:print|pinMode|digitalWrite|digitalRead|analogRead|analogWrite|delay)$/.test(text) || text === 'Serial' || (match.index + text.length < line.length && line[match.index + text.length] === '(')) {
          tokens.push(<span key={tokens.length} className="hl-function">{text}</span>);
        } else if (/^\d+(?:\.\d+)?$/.test(text)) {
          tokens.push(<span key={tokens.length} className="hl-number">{text}</span>);
        } else if (/^[+\-*/%<>=!&|^~]+$/.test(text)) {
          tokens.push(<span key={tokens.length} className="hl-operator">{text}</span>);
        } else {
          tokens.push(<span key={tokens.length}>{text}</span>);
        }
        lastIndex = tokenRegex.lastIndex;
      }

      if (tokens.length === 0) {
        return <div key={lIdx} className="hl-line">&#8203;</div>;
      }

      return (
        <div key={lIdx} className="hl-line">
          {tokens}
        </div>
      );
    });
  };
  // SIMULADOR E INTÉRPRETE DE PYTHON CON EVALUACIÓN REAL DE VARIABLES Y CONDICIONALES
  const simulatePython = (src) => {
    if (!src || src.trim() === '') {
      return { output: '[Error] Editor vacío. Escribe tu algoritmo antes de ejecutar.', success: false };
    }

    const lines = src.split('\n');
    const outputs = [];
    const scope = {};

    for (let i = 0; i < lines.length - 1; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.endsWith(':')) {
        const next = lines[i + 1];
        if (next && next.trim() !== '' && !next.startsWith(' ') && !next.startsWith('\t')) {
          return {
            output: `[IndentationError] Línea ${i + 2}: Se esperaba un bloque indentado después de la instrucción de la línea ${i + 1}.`,
            success: false
          };
        }
      }
    }

    const evalPythonExpr = (expr, context) => {
      let trimmed = expr.trim();
      if (!trimmed) return null;

      if (trimmed === 'True') return true;
      if (trimmed === 'False') return false;
      if (trimmed === 'None') return null;

      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return trimmed.slice(1, -1);
      }

      let jsExpr = trimmed
        .replace(/\band\b/g, '&&')
        .replace(/\bor\b/g, '||')
        .replace(/\bnot\s+/g, '!')
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false');

      try {
        const scopeKeys = Object.keys(context);
        const scopeVals = Object.values(context);
        const fn = new Function(...scopeKeys, `return (${jsExpr});`);
        return fn(...scopeVals);
      } catch (err) {
        return trimmed;
      }
    };

    let idx = 0;
    let conditionalState = {
      inIfChain: false,
      chainSatisfied: false,
      skippingIndentedBlock: false
    };

    while (idx < lines.length) {
      const rawLine = lines[idx];
      const trimmed = rawLine.trim();
      const indentMatch = rawLine.match(/^(\s*)/);
      const indentLen = indentMatch ? indentMatch[1].length : 0;

      idx++;

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      if (indentLen === 0) {
        conditionalState.skippingIndentedBlock = false;

        if (trimmed.startsWith('if ') && trimmed.endsWith(':')) {
          conditionalState.inIfChain = true;
          const conditionStr = trimmed.slice(3, -1);
          const isTrue = Boolean(evalPythonExpr(conditionStr, scope));
          conditionalState.chainSatisfied = isTrue;
          conditionalState.skippingIndentedBlock = !isTrue;
          continue;
        } else if (trimmed.startsWith('elif ') && trimmed.endsWith(':')) {
          if (!conditionalState.inIfChain) {
            return { output: `[SyntaxError] 'elif' fuera de un bloque condicional 'if'.`, success: false };
          }
          if (conditionalState.chainSatisfied) {
            conditionalState.skippingIndentedBlock = true;
          } else {
            const conditionStr = trimmed.slice(5, -1);
            const isTrue = Boolean(evalPythonExpr(conditionStr, scope));
            if (isTrue) {
              conditionalState.chainSatisfied = true;
              conditionalState.skippingIndentedBlock = false;
            } else {
              conditionalState.skippingIndentedBlock = true;
            }
          }
          continue;
        } else if (trimmed === 'else:') {
          if (!conditionalState.inIfChain) {
            return { output: `[SyntaxError] 'else' sin un 'if' previo correspondiente.`, success: false };
          }
          if (conditionalState.chainSatisfied) {
            conditionalState.skippingIndentedBlock = true;
          } else {
            conditionalState.chainSatisfied = true;
            conditionalState.skippingIndentedBlock = false;
          }
          continue;
        } else {
          conditionalState.inIfChain = false;
          conditionalState.chainSatisfied = false;
        }
      } else {
        if (conditionalState.skippingIndentedBlock) {
          continue;
        }
      }

      const assignMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      if (assignMatch && !trimmed.startsWith('def ') && !trimmed.startsWith('print(')) {
        const varName = assignMatch[1];
        const exprValue = assignMatch[2];
        scope[varName] = evalPythonExpr(exprValue, scope);
        continue;
      }

      if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
        const inner = trimmed.slice(6, -1);
        const args = inner.split(',').map(arg => {
          const res = evalPythonExpr(arg.trim(), scope);
          return res !== null && res !== undefined ? String(res) : '';
        });
        outputs.push(args.join(' '));
        continue;
      }

      const innerPrint = trimmed.match(/print\s*\((.*)\)/);
      if (innerPrint) {
        const val = evalPythonExpr(innerPrint[1], scope);
        outputs.push(String(val));
      }
    }

    if (outputs.length === 0) {
      outputs.push('[Python 3.11 Execution Completed] Proceso finalizado sin salida en stdout.');
    }

    return {
      output: outputs.join('\n'),
      success: true
    };
  };
  // ASISTENCIA SOCRÁTICA CON GEMINI API
  const callGeminiForGuidance = async (execOutput) => {
    if (!GEMINI_API_KEY) return;
    setIsAiLoading(true);
    try {
      const prompt = `Eres un tutor pedagógico de programación.
El estudiante ejecutó este código en ${language.toUpperCase()}:
${code}

Salida/Error en consola:
${execOutput}

REGLAS:
1) NUNCA des el código resuelto completo.
2) Explica el error exacto en 2 oraciones sencillas en español.
3) Haz una pregunta guía socrática para que el estudiante lo corrija.`;

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
      console.warn('Tutor IA:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(`[Compilador] Iniciando verificación de código...`);
    setAiGuidance('');

    if (language === 'arduino') {
      const result = await simulateArduinoWithDelay(code);
      setOutput(result.output);
      setIsSuccess(result.success);
      setIsRunning(false);
      if (!result.success) {
        callGeminiForGuidance(result.output);
      }
    } else {
      setTimeout(() => {
        const result = simulatePython(code);
        setOutput(result.output);
        setIsSuccess(result.success);
        setIsRunning(false);
        if (!result.success || (expectedOutput && !result.output.includes(expectedOutput.trim()))) {
          callGeminiForGuidance(result.output);
        }
      }, 400);
    }
  };

  const handleReset = () => {
    setCode(initialCode || '');
    setOutput('');
    setIsSuccess(false);
    setAiGuidance('');
    setArduinoState({ ledOn: false, activePin: 13, pwmValue: 0, pinsMode: {}, pinValues: {}, isSimulatingDelay: false });
  };

  const linesList = (code || '').split('\n');
  const lineCount = linesList.length;

  return (
    <div className="vscode-editor-wrapper">
      {/* 1. BARRA DE PESTAÑAS */}
      <div className="vscode-titlebar">
        <div className="vscode-tabs-bar">
          <div className="vscode-tab active">
            <span className="file-icon-badge">{language === 'python' ? '🐍' : '⚡'}</span>
            <span className="tab-filename">{language === 'python' ? 'main.py' : 'sketch.ino'}</span>
          </div>
        </div>

        <div className="vscode-toolbar-actions">
          <button type="button" className="vsc-btn secondary" onClick={handleReset} title="Restablecer">
            Restablecer
          </button>
          <button
            type="button"
            className={`vsc-btn run ${isRunning ? 'running' : ''}`}
            onClick={handleRun}
            disabled={isRunning}
            title="Compilar y Simular"
          >
            <IconPlay size={14} />
            <span>{isRunning ? 'Ejecutando...' : 'Ejecutar'}</span>
          </button>
        </div>
      </div>

      {/* 2. ÁREA DE CODIFICACIÓN + CIRCUITO REALISTA */}
      <div className="vscode-editor-body">
        <div className="vscode-line-numbers">
          {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
            <div key={i} className="line-num">{i + 1}</div>
          ))}
        </div>
        <div className="vscode-editor-stage">
          <pre ref={preHighlightRef} className="vscode-syntax-overlay" aria-hidden="true">
            <code>
              {renderSyntaxHighlightedCode(code)}
            </code>
          </pre>
          <textarea
            ref={textareaRef}
            className="vscode-textarea transparent-overlay"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScrollSync}
            spellCheck="false"
            placeholder={
              language === 'python'
                ? '# Codigo Python\ndef main():\n    print("Hola Mundo")\n\nmain()'
                : '// Codigo Arduino C++\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}'
            }
          />
        </div>

        {/* SIMULADOR DE CIRCUITO REALISTA CON CABLEADO Y BREADBOARD */}
        {language === 'arduino' && (
          <div className="arduino-live-sim-panel">
            <div className="sim-panel-title">Circuito y Conexiones Físicas</div>

            {/* DIAGRAMA SVG DE CABLEADO EXACTO */}
            <div className="circuit-svg-container">
              <svg width="100%" height="100%" viewBox="0 0 300 130">
                {/* Placa Arduino Uno */}
                <rect x="10" y="20" width="100" height="90" rx="4" fill="#00878F" stroke="#005A60" strokeWidth="2" />
                <text x="25" y="40" fill="#fff" fontSize="10" fontWeight="bold">ARDUINO UNO</text>
                <rect x="20" y="55" width="25" height="40" fill="#222" />
                <text x="24" y="80" fill="#aaa" fontSize="7">ATmega</text>

                {/* Pin Digital */}
                <circle cx="100" cy="35" r="4" fill="#FFD700" />
                <text x="80" y="32" fill="#fff" fontSize="8">Pin {arduinoState.activePin}</text>

                {/* Pin GND */}
                <circle cx="100" cy="55" r="4" fill="#333" stroke="#fff" strokeWidth="1" />
                <text x="75" y="68" fill="#fff" fontSize="8">GND</text>

                {/* Cable Positivo (Rojo) del Pin seleccionado al LED */}
                <path
                  d={`M 100 35 C 150 20, 180 30, 210 45`}
                  fill="none"
                  stroke="#FF3333"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Cable Negativo (Negro) de GND a Resistencia */}
                <path
                  d={`M 100 55 C 140 75, 170 85, 210 85`}
                  fill="none"
                  stroke="#111111"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Protoboard / Módulo LED */}
                <rect x="200" y="25" width="85" height="80" rx="6" fill="#f0f0f0" stroke="#ccc" strokeWidth="1" />
                <text x="212" y="38" fill="#555" fontSize="8" fontWeight="bold">Protoboard</text>

                {/* Resistencia 220 Ohm */}
                <rect x="215" y="78" width="24" height="8" rx="2" fill="#D2B48C" stroke="#8B4513" strokeWidth="1" />
                <line x1="220" y1="78" x2="220" y2="86" stroke="#f00" strokeWidth="1.5" />
                <line x1="225" y1="78" x2="225" y2="86" stroke="#8B4513" strokeWidth="1.5" />
                <line x1="230" y1="78" x2="230" y2="86" stroke="#000" strokeWidth="1.5" />
                <text x="242" y="85" fill="#333" fontSize="7">220Ω</text>

                {/* LED con emisión de luz cuando arduinoState.ledOn es true */}
                <circle
                  cx="245"
                  cy="50"
                  r="9"
                  fill={arduinoState.ledOn ? '#FF0033' : '#777'}
                  stroke="#333"
                  strokeWidth="1.5"
                />
                {arduinoState.ledOn && (
                  <circle cx="245" cy="50" r="15" fill="none" stroke="#FF5555" strokeWidth="2" opacity="0.7" />
                )}
                <text x="258" y="53" fill="#222" fontSize="8" fontWeight="bold">LED</text>
              </svg>
            </div>

            <div className="led-indicator-box">
              <div className={`led-bulb ${arduinoState.ledOn ? 'on' : 'off'}`} />
              <span>
                Pin {arduinoState.activePin}: {arduinoState.ledOn ? 'ENCENDIDO (HIGH)' : 'APAGADO (LOW)'}
              </span>
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
          <span>{language === 'python' ? 'Python 3.11' : 'Arduino AVR C++'}</span>
        </div>
        <div className="status-right">
          <span>{isSuccess ? '✓ Sintaxis Verificada' : 'Listo'}</span>
        </div>
      </div>

      {/* 4. CONSOLA INTEGRADA */}
      <div className="vscode-terminal-panel">
        <div className="terminal-header">
          <div className="terminal-title">
            <IconTerminal size={14} />
            <span>TERMINAL & CONSOLA</span>
          </div>
        </div>

        <div className="terminal-output-area">
          {output ? (
            <pre className={`terminal-text ${output.includes('error:') || output.includes('Error') ? 'error-text' : isSuccess ? 'success-text' : ''}`}>
              {output}
            </pre>
          ) : (
            <span style={{ color: '#666', fontStyle: 'italic' }}>
              Haz clic en "Ejecutar" para compilar el sketch...
            </span>
          )}

          {/* GUÍA DE IA SOCRÁTICA EN CONSOLA */}
          {(isAiLoading || aiGuidance) && (
            <div className="console-ai-box">
              <div className="ai-box-title">
                <strong>🤖 Tutor Pedagógico IA (Guía):</strong>
              </div>
              {isAiLoading ? (
                <span>Analizando tu código...</span>
              ) : (
                <p style={{ margin: 0 }}>{aiGuidance}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;

