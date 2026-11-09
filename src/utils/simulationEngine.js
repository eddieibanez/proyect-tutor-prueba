/**
 * Motor de Simulación Fiel a las Lecciones
 * Ejecuta simulaciones realistas para Arduino, Python y Scratch
 * integrando el contexto del reto o ejercicio de cada lección.
 */

export function runSimulation(code, language, lessonData = {}) {
  const instructions = (lessonData?.practice?.instructions || '').toLowerCase();
  const challenge = (lessonData?.challenge?.description || '').toLowerCase();
  const expectedOutput = lessonData?.practice?.expectedOutput || '';

  if (language === 'arduino') {
    return simulateArduino(code, instructions, challenge, expectedOutput);
  } else if (language === 'python') {
    return simulatePython(code, instructions, challenge, expectedOutput);
  } else if (language === 'scratch') {
    return simulateScratch(code, instructions, challenge);
  }

  return {
    success: false,
    output: 'Lenguaje no soportado para simulación.',
    simState: {}
  };
}

// ─────────────────────────────────────────────────────────────
// SIMULACIÓN ARDUINO
// ─────────────────────────────────────────────────────────────
function simulateArduino(code, instructions, challenge, expectedOutput) {
  const logs = [];
  const configuredPins = {};
  const digitalStates = {};
  const pwmStates = {};
  const serialOutput = [];
  let isLedOn = false;
  let targetPin = 13;
  let pwm = 0;

  // Analizar setup() y pinMode
  const pinModeRegex = /pinMode\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*(OUTPUT|INPUT|INPUT_PULLUP)\s*\)/g;
  let match;
  while ((match = pinModeRegex.exec(code)) !== null) {
    const pin = match[1];
    const mode = match[2];
    configuredPins[pin] = mode;
    logs.push(`[GPIO Setup] Pin ${pin} configurado como ${mode}`);
  }

  // Analizar Serial.begin
  if (code.includes('Serial.begin')) {
    logs.push('[UART Serie] Puerto COM3 inicializado a 9600 baudios.');
  }

  // Analizar digitalWrite
  const digitalRegex = /digitalWrite\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*(HIGH|LOW)\s*\)/g;
  while ((match = digitalRegex.exec(code)) !== null) {
    const pin = match[1];
    const state = match[2];
    targetPin = pin;
    digitalStates[pin] = state;
    if (state === 'HIGH') {
      isLedOn = true;
      pwm = 255;
    } else {
      isLedOn = false;
      pwm = 0;
    }
    logs.push(`[Salida Digital] Pin ${pin} -> ${state} (${state === 'HIGH' ? '🟢 5V ENCENDIDO' : '⚫ 0V APAGADO'})`);
  }

  // Analizar analogWrite (PWM)
  const analogRegex = /analogWrite\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*([0-9]+)\s*\)/g;
  while ((match = analogRegex.exec(code)) !== null) {
    const pin = match[1];
    const val = parseInt(match[2], 10);
    targetPin = pin;
    pwmStates[pin] = val;
    pwm = Math.min(255, Math.max(0, val));
    isLedOn = pwm > 0;
    logs.push(`[Señal PWM] Pin ${pin} modulado a ${pwm}/255 (${Math.round((pwm / 255) * 100)}% ciclo de trabajo)`);
  }

  // Analizar Serial.print / println
  const serialRegex = /Serial\.println?\s*\(\s*["']?([^"')]+)["']?\s*\)/g;
  while ((match = serialRegex.exec(code)) !== null) {
    serialOutput.push(match[1]);
    logs.push(`[Telemetría UART] > ${match[1]}`);
  }

  // Analizar delays
  const delayRegex = /delay\s*\(\s*([0-9]+)\s*\)/g;
  let totalDelay = 0;
  while ((match = delayRegex.exec(code)) !== null) {
    totalDelay += parseInt(match[1], 10);
  }
  if (totalDelay > 0) {
    logs.push(`[Temporización] Temporizadores detectados: total acumulado ${totalDelay} ms`);
  }

  // Evaluación de fidelidad según la lección
  let fidelityCheck = true;
  let fidelityMsg = '';

  // Semáforo (pines 10, 11, 12 o verde, amarillo, rojo)
  if (instructions.includes('semáforo') || instructions.includes('semaforo') || instructions.includes('10, 11 y 12')) {
    const hasPins = (configuredPins['10'] || code.includes('10')) && (configuredPins['11'] || code.includes('11'));
    if (!hasPins) {
      fidelityCheck = false;
      fidelityMsg = 'La simulación requiere configurar las salidas para la secuencia del semáforo.';
    }
  }

  return {
    success: fidelityCheck,
    output: logs.join('\n') + (fidelityMsg ? `\n⚠️ Observación: ${fidelityMsg}` : '\n✅ Circuito simulado fielmente.'),
    simState: {
      ledOn: isLedOn,
      ledPin: targetPin,
      pwmBrightness: pwm,
      serialHistory: serialOutput
    }
  };
}

// ─────────────────────────────────────────────────────────────
// SIMULACIÓN PYTHON
// ─────────────────────────────────────────────────────────────
function simulatePython(code, instructions, challenge, expectedOutput) {
  const lines = code.split('\n');
  const logs = [];
  const vars = {};

  try {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Variables simples: x = valor
      const assignMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      if (assignMatch) {
        const vName = assignMatch[1];
        const rawExpr = assignMatch[2].trim();
        try {
          // Evaluar expresión en contexto seguro de vars
          const val = Function(...Object.keys(vars), `"use strict"; return (${rawExpr})`)(...Object.values(vars));
          vars[vName] = val;
        } catch {
          vars[vName] = rawExpr.replace(/['"]/g, '');
        }
        continue;
      }

      // Print
      const printMatch = trimmed.match(/^print\s*\((.*)\)$/);
      if (printMatch) {
        const inner = printMatch[1].trim();
        if (inner.startsWith('f"') || inner.startsWith("f'")) {
          const raw = inner.slice(2, -1);
          const interpolated = raw.replace(/\{([^}]+)\}/g, (_, exp) => {
            try {
              return Function(...Object.keys(vars), `"use strict"; return (${exp.trim()})`)(...Object.values(vars));
            } catch {
              return `<${exp}>`;
            }
          });
          logs.push(interpolated);
        } else if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
          logs.push(inner.slice(1, -1));
        } else {
          try {
            const out = Function(...Object.keys(vars), `"use strict"; return (${inner})`)(...Object.values(vars));
            logs.push(String(out));
          } catch {
            logs.push(inner);
          }
        }
        continue;
      }

      // Ciclo for en range
      const forMatch = trimmed.match(/^for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+range\s*\(([^)]+)\)\s*:/);
      if (forMatch) {
        const loopVar = forMatch[1];
        const rangeVal = parseInt(forMatch[2], 10) || 5;
        const nextLine = lines[i + 1];
        if (nextLine && (nextLine.startsWith(' ') || nextLine.startsWith('\t'))) {
          const body = nextLine.trim();
          const pSub = body.match(/^print\s*\((.*)\)$/);
          if (pSub) {
            for (let step = 0; step < Math.min(rangeVal, 20); step++) {
              vars[loopVar] = step;
              const subContent = pSub[1].trim();
              if (subContent === loopVar) {
                logs.push(String(step));
              } else {
                logs.push(subContent.replace(/\{([^}]+)\}/g, String(step)).replace(/['"]/g, ''));
              }
            }
            i++;
          }
        }
        continue;
      }

      logs.push(`> ${trimmed}`);
    }

    return {
      success: true,
      output: logs.join('\n') || '>>> Programa ejecutado con éxito (sin salidas print).',
      simState: { pythonVars: vars }
    };
  } catch (err) {
    return {
      success: false,
      output: `Error de ejecución: ${err.message}`,
      simState: { pythonVars: vars }
    };
  }
}

// ─────────────────────────────────────────────────────────────
// SIMULACIÓN SCRATCH
// ─────────────────────────────────────────────────────────────
function simulateScratch(code, instructions, challenge) {
  const blocks = code.split('\n').filter(b => b.trim());
  const logs = [];
  let x = 0;
  let y = 0;
  let rot = 90;
  let message = '';
  let size = 100;
  let visible = true;
  let soundPlayed = null;

  blocks.forEach(line => {
    const clean = line.replace(/[\[\]]/g, '').trim().toLowerCase();

    // Eventos
    if (clean.includes('bandera verde') || clean.includes('al presionar')) {
      logs.push('🎬 Evento: Programa iniciado.');
    }
    // Movimiento
    else if (clean.includes('mover') && clean.includes('pasos')) {
      const match = clean.match(/-?\d+/);
      const steps = match ? parseInt(match[0], 10) : 10;
      const rad = ((rot - 90) * Math.PI) / 180;
      x = Math.max(-150, Math.min(150, Math.round(x + steps * Math.cos(rad))));
      y = Math.max(-110, Math.min(110, Math.round(y - steps * Math.sin(rad))));
      logs.push(`🐾 Movimiento: Avanzó ${steps} pasos -> Posición actual (X:${x}, Y:${y})`);
    } else if (clean.includes('girar a la derecha') || clean.includes('girar')) {
      const match = clean.match(/\d+/);
      const deg = match ? parseInt(match[0], 10) : 15;
      rot = (rot + deg) % 360;
      logs.push(`🔄 Giro: Rotó ${deg}° -> Dirección actual: ${rot}°`);
    } else if (clean.includes('ir a x:')) {
      const matches = clean.match(/-?\d+/g);
      if (matches && matches.length >= 2) {
        x = Math.max(-150, Math.min(150, parseInt(matches[0], 10)));
        y = Math.max(-110, Math.min(110, parseInt(matches[1], 10)));
        logs.push(`📍 Ubicación: Teletransportado a (X:${x}, Y:${y})`);
      }
    } else if (clean.includes('rebotar si toca borde')) {
      if (Math.abs(x) >= 140 || Math.abs(y) >= 100) {
        rot = (rot + 180) % 360;
        logs.push(`⚡ Rebote en el borde: Dirección invertida a ${rot}°`);
      }
    }
    // Apariencia
    else if (clean.includes('decir')) {
      const textMatch = clean.match(/decir\s+\[(.*?)\]|decir\s+(.*)/);
      const text = textMatch ? (textMatch[1] || textMatch[2] || '¡Hola!') : '¡Hola!';
      message = text.replace(/por.*segundos/g, '').trim();
      logs.push(`💬 Decir: "${message}"`);
    } else if (clean.includes('mostrar')) {
      visible = true;
      logs.push('👁️ Apariencia: Personaje visible en el escenario.');
    } else if (clean.includes('esconder')) {
      visible = false;
      logs.push('🙈 Apariencia: Personaje oculto.');
    } else if (clean.includes('cambiar tamaño por') || clean.includes('fijar tamaño a')) {
      const match = clean.match(/\d+/);
      if (match) size = parseInt(match[0], 10);
      logs.push(`📐 Tamaño ajustado a ${size}%`);
    }
    // Sonido
    else if (clean.includes('sonido')) {
      soundPlayed = 'Pop / Miau';
      logs.push(`🔊 Sonido reproducido: [${soundPlayed}]`);
    }
    // Control
    else if (clean.includes('repetir')) {
      logs.push('🔁 Bucle de repetición iterado.');
    } else if (clean.includes('esperar')) {
      logs.push('⏳ Pausa temporal en el flujo del hilo.');
    }
  });

  return {
    success: true,
    output: logs.join('\n') || 'Escenario preparado.',
    simState: {
      spriteX: x,
      spriteY: y,
      spriteRot: rot,
      speechBubble: message,
      spriteVisible: visible,
      spriteSize: size
    }
  };
}
