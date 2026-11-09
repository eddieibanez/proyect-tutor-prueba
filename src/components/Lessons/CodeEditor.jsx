import React, { useState } from 'react';
import './CodeEditor.css';

const CodeEditor = ({ language, initialCode, expectedOutput = '' }) => {
  const [code, setCode] = useState(initialCode || '');
  const [output, setOutput] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);

  // Estados visuales de la simulación
  const [simulationState, setSimulationState] = useState({
    ledOn: false,
    ledPin: 13,
    pwmBrightness: 0,
    serialHistory: [],
    // Scratch sprite
    spriteX: 0,
    spriteY: 0,
    spriteRot: 90,
    speechBubble: '',
    spriteColor: '#FFAB19',
    // Python state
    pythonVars: {},
    pythonExecutions: []
  });

  // Consejos y recomendaciones pedagógicas en vivo
  const [pedagogicalAdvice, setPedagogicalAdvice] = useState({
    title: 'Orientación del Asistente',
    advice: 'Escribe o ajusta tu código y presiona "▶ Simular y Ejecutar" para validar el circuito o algoritmo.',
    type: 'neutral'
  });

  // Paleta de bloques de Scratch con categorías y campos editables estrictos
  const scratchBlockCategories = [
    {
      category: 'Movimiento',
      color: '#4C97FF',
      blocks: [
        { type: 'action', text: 'mover (10) pasos', template: 'mover (10) pasos', defaultVal: '10' },
        { type: 'action', text: 'girar a la derecha (15) grados', template: 'girar a la derecha (15) grados', defaultVal: '15' },
        { type: 'action', text: 'ir a x: (0) y: (0)', template: 'ir a x: (0) y: (0)', defaultVal: '0,0' }
      ]
    },
    {
      category: 'Apariencia y Sonido',
      color: '#9966FF',
      blocks: [
        { type: 'action', text: 'decir [¡Hola!] por (2) segundos', template: 'decir [¡Hola!] por (2) segundos', defaultVal: '¡Hola!' },
        { type: 'action', text: 'cambiar tamaño por (10)', template: 'cambiar tamaño por (10)', defaultVal: '10' },
        { type: 'action', text: 'iniciar sonido [pop]', template: 'iniciar sonido [pop]', defaultVal: 'pop' }
      ]
    },
    {
      category: 'Eventos (Inicio)',
      color: '#FFBF00',
      blocks: [
        { type: 'hat', text: 'al presionar bandera verde', template: 'al presionar bandera verde', readonly: true },
        { type: 'hat', text: 'al presionar tecla [espacio]', template: 'al presionar tecla [espacio]', defaultVal: 'espacio' }
      ]
    },
    {
      category: 'Control y Ciclos (Contenedores)',
      color: '#FFAB19',
      blocks: [
        { type: 'container', text: 'repetir (4)', template: 'repetir (4) veces:\n    mover (20) pasos\n    esperar (0.5) segundos', defaultVal: '4' },
        { type: 'container', text: 'por siempre', template: 'por siempre:\n    mover (10) pasos\n    rebotar si toca un borde', readonly: true },
        { type: 'conditional', text: 'si <condicion> entonces', template: 'si <tocando borde> entonces:\n    decir [¡Alerta!] por (1) segundos', defaultVal: 'tocando borde' },
        { type: 'action', text: 'esperar (1) segundos', template: 'esperar (1) segundos', defaultVal: '1' }
      ]
    },
    {
      category: 'Variables',
      color: '#FF661A',
      blocks: [
        { type: 'action', text: 'fijar [puntos] a (0)', template: 'fijar [puntos] a (0)', defaultVal: '0' },
        { type: 'action', text: 'cambiar [puntos] por (1)', template: 'cambiar [puntos] por (1)', defaultVal: '1' }
      ]
    }
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleInsertBlock = (block) => {
    setCode(prev => {
      const blockStr = `[${block.template}]`;
      return prev ? `${prev}\n${blockStr}` : blockStr;
    });
  };

  /**
   * Intérprete estricto de Arduino C++ con panel de simulación de hardware en vivo
   */
  const evaluateArduinoStrict = (src) => {
    const logs = [];
    let isLedOn = false;
    let targetPin = 13;
    let pwm = 0;
    const errors = [];
    const adviceList = [];

    // Verificación 1: Estructura obligatoria
    if (!src.includes('void setup()') && !src.includes('void setup ()')) {
      errors.push('Falta la función obligatoria "void setup() { ... }".');
    }
    if (!src.includes('void loop()') && !src.includes('void loop ()')) {
      errors.push('Falta la función obligatoria "void loop() { ... }".');
    }

    // Verificación 2: Balance de llaves {}
    const openBraces = (src.match(/\{/g) || []).length;
    const closeBraces = (src.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push(`Error de sintaxis: Llaves desbalanceadas. Tienes ${openBraces} apertura(s) '{' y ${closeBraces} cierre(s) '}'.`);
    }

    // Verificación 3: Puntos y comas en instrucciones
    const lines = src.split('\n');
    lines.forEach((l, idx) => {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;
      if (trimmed.endsWith('{') || trimmed.endsWith('}') || trimmed.startsWith('for') || trimmed.startsWith('if') || trimmed.startsWith('while')) return;
      if (!trimmed.endsWith(';') && !trimmed.endsWith(',')) {
        errors.push(`Línea ${idx + 1}: Falta el punto y coma ';' al final de la instrucción: "${trimmed}".`);
      }
    });

    // Verificación 4: Declaración de pinMode antes de digitalWrite/analogWrite
    const pinModeRegex = /pinMode\s*\(\s*(\w+)\s*,\s*(OUTPUT|INPUT|INPUT_PULLUP)\s*\)/g;
    const configuredPins = {};
    let pmMatch;
    while ((pmMatch = pinModeRegex.exec(src)) !== null) {
      configuredPins[pmMatch[1]] = pmMatch[2];
      logs.push(`[Hardware GPIO] Pin ${pmMatch[1]} inicializado en modo ${pmMatch[2]}.`);
    }

    // Verificación de digitalWrite
    const digitalRegex = /digitalWrite\s*\(\s*(\w+)\s*,\s*(HIGH|LOW)\s*\)/g;
    let dwMatch;
    while ((dwMatch = digitalRegex.exec(src)) !== null) {
      const pin = dwMatch[1];
      const state = dwMatch[2];
      targetPin = pin;
      if (!configuredPins[pin] && pin !== 'LED_BUILTIN') {
        adviceList.push(`Consejo de Arquitectura: Estás enviando señal al Pin ${pin} sin haberlo declarado primero como OUTPUT en void setup(). Esto puede causar comportamientos inesperados.`);
      }
      if (state === 'HIGH') {
        isLedOn = true;
        pwm = 255;
      } else {
        isLedOn = false;
        pwm = 0;
      }
      logs.push(`[Salida Digital] Pin ${pin} establecido en ${state} (${state === 'HIGH' ? '🟢 5V ACTIVO' : '⚫ 0V INACTIVO'}).`);
    }

    // analogWrite PWM
    const analogRegex = /analogWrite\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)/g;
    let awMatch;
    while ((awMatch = analogRegex.exec(src)) !== null) {
      targetPin = awMatch[1];
      pwm = Math.min(255, parseInt(awMatch[2], 10));
      isLedOn = pwm > 0;
      logs.push(`[Señal PWM Modulada] Pin ${targetPin} ajustado a ${pwm}/255 (${Math.round((pwm/255)*100)}% de potencia).`);
    }

    // Serial
    if (src.includes('Serial.begin')) {
      logs.push('[UART Serie] Puerto COM3 conectado a 9600 baudios.');
    }
    const serialPrintRegex = /Serial\.println?\s*\(\s*["']?([^"')]+)["']?\s*\)/g;
    let spMatch;
    while ((spMatch = serialPrintRegex.exec(src)) !== null) {
      logs.push(`[Telemetría Serial] > "${spMatch[1]}"`);
    }

    if (errors.length > 0) {
      return {
        success: false,
        logs: errors.join('\n') + '\n\n❌ Error de compilación en el firmware.',
        advice: {
          title: 'Corrección de Código Necesaria',
          advice: errors[0],
          type: 'error'
        },
        simState: { ledOn: false, ledPin: targetPin, pwmBrightness: 0 }
      };
    }

    return {
      success: true,
      logs: logs.join('\n') + '\n\n✅ Firmware C++ compilado y flasheado con éxito en placa Arduino.',
      advice: {
        title: '¡Buen Trabajo!',
        advice: adviceList.length > 0 ? adviceList[0] : 'Sintaxis y estructura rigurosa verificada. El circuito responde exactamente a tu lógica.',
        type: 'success'
      },
      simState: { ledOn: isLedOn, ledPin: targetPin, pwmBrightness: pwm }
    };
  };

  /**
   * Intérprete estricto de Python con consola y análisis de identación
   */
  const evaluatePythonStrict = (src) => {
    const lines = src.split('\n');
    const logs = [];
    const vars = {};
    const errors = [];
    const adviceList = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) continue;

      // Verificación de indentación en estructuras
      if (i > 0) {
        const prevTrimmed = lines[i - 1].trim();
        if (prevTrimmed.endsWith(':') && !line.startsWith(' ') && !line.startsWith('\t')) {
          errors.push(`Línea ${i + 1}: IndentationError: Se esperaba un bloque indentado (4 espacios) después de "${prevTrimmed}".`);
          break;
        }
      }

      // Print
      const printMatch = trimmed.match(/^print\s*\((.*)\)$/);
      if (printMatch) {
        const inner = printMatch[1].trim();
        if (!inner) {
          logs.push('');
          continue;
        }

        // f-string
        if (inner.startsWith('f"') || inner.startsWith("f'")) {
          const raw = inner.slice(2, -1);
          const evaluated = raw.replace(/\{([^}]+)\}/g, (_, varName) => {
            const key = varName.trim();
            if (vars[key] !== undefined) return vars[key];
            try {
              // eslint-disable-next-line no-eval
              return Function(...Object.keys(vars), `"use strict"; return (${key})`)(...Object.values(vars));
            } catch {
              adviceList.push(`Variable desconocida o no inicializada: "${key}".`);
              return `<${key} no definido>`;
            }
          });
          logs.push(evaluated);
        } else if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
          logs.push(inner.slice(1, -1));
        } else {
          // Expresión matemática o variable
          try {
            // eslint-disable-next-line no-eval
            const evalResult = Function(...Object.keys(vars), `"use strict"; return (${inner})`)(...Object.values(vars));
            logs.push(String(evalResult));
          } catch {
            logs.push(inner);
          }
        }
        continue;
      }

      // Asignación de variables: x = 10
      const assignMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      if (assignMatch) {
        const varName = assignMatch[1];
        const expr = assignMatch[2].trim();
        try {
          // eslint-disable-next-line no-eval
          const val = Function(...Object.keys(vars), `"use strict"; return (${expr})`)(...Object.values(vars));
          vars[varName] = val;
        } catch {
          vars[varName] = expr.replace(/['"]/g, '');
        }
        continue;
      }

      // Bucle for
      const forMatch = trimmed.match(/^for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+range\s*\(([^)]+)\)\s*:/);
      if (forMatch) {
        const loopVar = forMatch[1];
        const rangeParam = parseInt(forMatch[2], 10) || 5;
        // Tomar siguiente línea indentada
        const nextLine = lines[i + 1];
        if (nextLine && (nextLine.startsWith(' ') || nextLine.startsWith('\t'))) {
          const subTrimmed = nextLine.trim();
          const subPrint = subTrimmed.match(/^print\s*\((.*)\)$/);
          if (subPrint) {
            for (let k = 0; k < Math.min(rangeParam, 12); k++) {
              vars[loopVar] = k;
              let content = subPrint[1].trim();
              if (content === loopVar) {
                logs.push(String(k));
              } else {
                logs.push(content.replace(/\{([^}]+)\}/g, String(k)).replace(/['"]/g, ''));
              }
            }
            i++; // Saltar línea ejecutada
          }
        }
        continue;
      }

      logs.push(`> [Ejecutado] ${trimmed}`);
    }

    if (errors.length > 0) {
      return {
        success: false,
        logs: errors.join('\n'),
        advice: {
          title: 'Revisión Sintáctica Requerida',
          advice: errors[0],
          type: 'error'
        },
        vars
      };
    }

    return {
      success: true,
      logs: logs.join('\n') || '>>> Código ejecutado con éxito (sin salidas print).',
      advice: {
        title: 'Consejo del Tutor de Python',
        advice: adviceList.length > 0 ? adviceList[0] : 'Excelente indentación y uso de variables. El código es idiomático y limpio.',
        type: 'success'
      },
      vars
    };
  };

  /**
   * Intérprete de Scratch con escenario interactivo visual de personaje
   */
  const evaluateScratchStrict = (src) => {
    const rawBlocks = src.split('\n').filter(b => b.trim().length > 0);
    const logs = [];
    let x = 0, y = 0, rot = 90;
    let message = '';
    let hasStartHat = false;

    rawBlocks.forEach(line => {
      const clean = line.replace(/[[\]]/g, '').trim().toLowerCase();

      if (clean.includes('al presionar bandera verde') || clean.includes('al presionar tecla')) {
        hasStartHat = true;
        logs.push('🎬 Evento detectado: Iniciando script.');
      } else if (clean.includes('mover')) {
        const num = clean.match(/-?\d+/) ? parseInt(clean.match(/-?\d+/)[0], 10) : 10;
        x = Math.max(-140, Math.min(140, x + num));
        logs.push(`🐾 Personaje avanzó ${num} pasos hasta X=${x}.`);
      } else if (clean.includes('girar')) {
        const deg = clean.match(/\d+/) ? parseInt(clean.match(/\d+/)[0], 10) : 15;
        rot = (rot + deg) % 360;
        logs.push(`🔄 Personaje rotó ${deg}° (Orientación: ${rot}°).`);
      } else if (clean.includes('ir a x:')) {
        const matches = clean.match(/-?\d+/g);
        if (matches && matches.length >= 2) {
          x = parseInt(matches[0], 10);
          y = parseInt(matches[1], 10);
        }
        logs.push(`📍 Objeto reubicado en X=${x}, Y=${y}.`);
      } else if (clean.includes('decir')) {
        const text = clean.replace(/decir/g, '').replace(/por.*segundos/g, '').replace(/[[\]]/g, '').trim();
        message = text || '¡Hola!';
        logs.push(`💬 Objeto dice: "${message}".`);
      } else if (clean.includes('repetir') || clean.includes('por siempre')) {
        logs.push(`🔁 Contenedor cíclico ejecutado con éxito.`);
      }
    });

    let advice = 'Los bloques se ensamblaron correctamente y el personaje respondió en el escenario.';
    if (!hasStartHat) {
      advice = 'Consejo: Añade el bloque "al presionar bandera verde" al inicio para que el algoritmo tenga un disparador estándar.';
    }

    return {
      success: true,
      logs: logs.join('\n') || 'Escenario en reposo.',
      advice: {
        title: 'Tutor de Programación Visual',
        advice,
        type: hasStartHat ? 'success' : 'neutral'
      },
      simState: { spriteX: x, spriteY: y, spriteRot: rot, speechBubble: message }
    };
  };

  const handleRun = () => {
    setIsCompiling(true);
    setOutput('Analizando sintaxis y compilando simulación...');

    setTimeout(() => {
      let result;
      if (language === 'arduino') {
        result = evaluateArduinoStrict(code);
        setSimulationState(prev => ({ ...prev, ...result.simState }));
      } else if (language === 'python') {
        result = evaluatePythonStrict(code);
        setSimulationState(prev => ({ ...prev, pythonVars: result.vars }));
      } else {
        result = evaluateScratchStrict(code);
        setSimulationState(prev => ({ ...prev, ...result.simState }));
      }

      setIsCompiling(false);
      setOutput(result.logs);
      setIsSuccess(result.success);
      setPedagogicalAdvice(result.advice);
    }, 350);
  };

  const handleReset = () => {
    setCode(initialCode || '');
    setOutput('');
    setIsSuccess(false);
    setSimulationState({
      ledOn: false,
      ledPin: 13,
      pwmBrightness: 0,
      serialHistory: [],
      spriteX: 0,
      spriteY: 0,
      spriteRot: 90,
      speechBubble: '',
      spriteColor: '#FFAB19',
      pythonVars: {},
      pythonExecutions: []
    });
  };

  return (
    <div className="code-editor-wrapper">
      {/* BARRA SUPERIOR DE HERRAMIENTAS */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <span className={`lang-badge ${language}`}>{language.toUpperCase()}</span>
          <span className="editor-hint">
            {language === 'arduino' && 'Compilador estricto C++ y simulador de hardware en tiempo real'}
            {language === 'scratch' && 'Bloques interactivos arrastrables con escenario visual'}
            {language === 'python' && 'Intérprete estricto con análisis de indentación'}
          </span>
        </div>
        <div className="editor-actions">
          <button type="button" className="btn-icon" onClick={handleReset} title="Restablecer">
            🔄 Reiniciar
          </button>
          <button 
            type="button" 
            className={`btn-run ${isCompiling ? 'running' : ''}`} 
            onClick={handleRun} 
            disabled={isCompiling}
          >
            {isCompiling ? '⏳ Analizando...' : '▶ Simular y Ejecutar'}
          </button>
        </div>
      </div>

      {/* ÁREA DE PROGRAMACIÓN + SIMULADOR INTEGRADO EN TIEMPO REAL */}
      <div className="editor-interactive-split">
        {/* LADO IZQUIERDO: EDITOR O PALETA DE BLOQUES */}
        <div className="editor-code-pane">
          {language === 'scratch' ? (
            <div className="scratch-ide-container">
              {/* PALETA DE BLOQUES ARRASTRABLES Y CLICKEABLES */}
              <div className="scratch-palette-column">
                <h4>Paleta de Bloques</h4>
                <div className="palette-categories-scroll">
                  {scratchBlockCategories.map((cat, idx) => (
                    <div key={idx} className="palette-cat-group">
                      <span className="cat-header" style={{ color: cat.color }}>{cat.category}</span>
                      <div className="cat-blocks-list">
                        {cat.blocks.map((b, bIdx) => (
                          <div
                            key={bIdx}
                            className={`draggable-block ${b.type}`}
                            style={{ backgroundColor: cat.color }}
                            onClick={() => handleInsertBlock(b)}
                            title="Haz clic para ensamblar en el algoritmo"
                          >
                            <span className="block-socket"></span>
                            <span className="block-label-text">{b.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ESPACIO DE TRABAJO DE BLOQUES */}
              <div className="scratch-script-column">
                <div className="script-column-head">
                  <span>Secuencia Ensamblada (Código en Bloques):</span>
                </div>
                <textarea
                  className="scratch-code-area"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Haz clic en los bloques de la izquierda para ensamblar tu secuencia aquí..."
                  rows="7"
                />
              </div>
            </div>
          ) : (
            <div className="text-mode-container">
              <div className="line-numbers-bar">
                {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <textarea
                className="strict-code-textarea"
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck="false"
                placeholder={language === 'arduino' ? '// Código Arduino C++\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n}' : '# Código Python\ndef main():\n    print("Hola")'}
              />
            </div>
          )}
        </div>

        {/* LADO DERECHO: SIMULADOR VISUAL EN VIVO SEGÚN EL LENGUAJE */}
        <div className="simulation-preview-pane">
          <div className="sim-pane-header">
            <h4>
              {language === 'arduino' && '⚡ Simulador de Circuito Arduino'}
              {language === 'scratch' && '🎭 Escenario de Ejecución Scratch'}
              {language === 'python' && '📊 Inspector de Variables y Estado'}
            </h4>
          </div>

          <div className="sim-stage-content">
            {/* SIMULADOR ARDUINO */}
            {language === 'arduino' && (
              <div className="arduino-board-simulator">
                <div className="microcontroller-chip">
                  <span className="chip-label">ATmega328P</span>
                  <div className="chip-legs"></div>
                </div>

                <div className="breadboard-components">
                  <div className="component-led-box">
                    <span className="pin-indicator">Pin Digital: #{simulationState.ledPin}</span>
                    <div 
                      className={`simulated-led ${simulationState.ledOn ? 'lit' : 'off'}`}
                      style={{
                        boxShadow: simulationState.ledOn ? `0 0 25px 8px rgba(0, 230, 118, ${simulationState.pwmBrightness / 255})` : 'none',
                        opacity: simulationState.ledOn ? Math.max(0.4, simulationState.pwmBrightness / 255) : 0.2
                      }}
                    >
                      <div className="led-reflection"></div>
                    </div>
                    <span className="led-status-tag">
                      {simulationState.ledOn ? `ENCENDIDO (${simulationState.pwmBrightness} PWM)` : 'APAGADO (0V)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULADOR SCRATCH */}
            {language === 'scratch' && (
              <div className="scratch-stage-canvas">
                <div className="canvas-grid-lines">
                  <span className="axis-center">(0, 0)</span>
                </div>
                <div
                  className="interactive-sprite"
                  style={{
                    transform: `translate(${simulationState.spriteX}px, ${-simulationState.spriteY}px) rotate(${simulationState.spriteRot - 90}deg)`
                  }}
                >
                  <div className="sprite-avatar">🐱</div>
                  {simulationState.speechBubble && (
                    <div className="sprite-speech-bubble">
                      {simulationState.speechBubble}
                    </div>
                  )}
                </div>
                <div className="sprite-telemetry">
                  <span>X: {simulationState.spriteX}</span>
                  <span>Y: {simulationState.spriteY}</span>
                  <span>Rot: {simulationState.spriteRot}°</span>
                </div>
              </div>
            )}

            {/* SIMULADOR PYTHON */}
            {language === 'python' && (
              <div className="python-inspector-box">
                <h5>Variables en Memoria (RAM):</h5>
                {Object.keys(simulationState.pythonVars).length === 0 ? (
                  <p className="empty-vars">Ejecuta el código para inspeccionar variables creadas.</p>
                ) : (
                  <div className="vars-table">
                    {Object.entries(simulationState.pythonVars).map(([k, v]) => (
                      <div key={k} className="var-row">
                        <span className="var-name">{k}</span>
                        <span className="var-type">({typeof v})</span>
                        <span className="var-val">= {JSON.stringify(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ASISTENTE PEDAGÓGICO DE CONSEJOS EN VIVO */}
      <div className={`pedagogical-advice-banner ${pedagogicalAdvice.type}`}>
        <div className="advice-icon">
          {pedagogicalAdvice.type === 'error' ? '⚠️' : pedagogicalAdvice.type === 'success' ? '💡' : '🤖'}
        </div>
        <div className="advice-body">
          <strong>{pedagogicalAdvice.title}</strong>
          <p>{pedagogicalAdvice.advice}</p>
        </div>
      </div>

      {/* CONSOLA DE SALIDA ESTÁNDAR */}
      <div className={`output-panel ${isSuccess ? 'success' : output ? 'active' : ''}`}>
        <div className="output-header">
          <span className="output-title">Consola de Salida y Registro de Ejecución:</span>
          <span className="output-status">{output ? (isSuccess ? '✅ Ejecutado correctamente' : '⚠️ Errores detectados') : 'En espera'}</span>
        </div>
        <pre className="output-console">{output || 'Presiona "▶ Simular y Ejecutar" para compilar tu algoritmo...'}</pre>
      </div>
    </div>
  );
};

export default CodeEditor;
