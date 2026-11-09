/**
 * Motor de Análisis de Código con IA Pedagógica
 * Analiza código Arduino, Python y Scratch respecto al contenido de la lección
 * Guía al estudiante de forma socrática sin dar la respuesta directamente
 */

// ───────────────────────────────────────────────────────────────
//  UTILIDADES
// ───────────────────────────────────────────────────────────────
const countOccurrences = (src, pattern) => (src.match(new RegExp(pattern, 'g')) || []).length;

/**
 * Extrae texto plano de HTML (para usar el contenido de las lecciones)
 */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Genera una pista pedagógica de nivel progresivo
 * nivel 1 = muy vaga, nivel 2 = más específica, nivel 3 = casi la respuesta
 */
function buildHint(hints, hintLevel) {
  if (!hints || hints.length === 0) {
    return ['Revisa la teoría de la lección y el ejemplo para orientarte.', 'Compara tu código con el ejemplo de la lección paso a paso.', 'Identifica qué instrucción específica falta o está incorrecta.'][Math.min(hintLevel, 2)];
  }
  const idx = Math.min(hintLevel, hints.length - 1);
  return hints[idx];
}

// ───────────────────────────────────────────────────────────────
//  ANALIZADOR ARDUINO (C++)
// ───────────────────────────────────────────────────────────────
function analyzeArduino(src, lessonData) {
  const errors = [];
  const warnings = [];
  const hints = [];
  let score = 100;
  let isCorrect = true;

  const theory = stripHtml(lessonData?.theory || '');
  const practiceInstructions = (lessonData?.practice?.instructions || '').toLowerCase();
  const challengeDesc = (lessonData?.challenge?.description || '').toLowerCase();
  const lessonHints = lessonData?.challenge?.hints || [];
  const expectedOutput = lessonData?.practice?.expectedOutput || '';

  // 1. Estructura obligatoria
  const hasSetup = /void\s+setup\s*\(\s*\)/.test(src);
  const hasLoop = /void\s+loop\s*\(\s*\)/.test(src);

  if (!hasSetup) {
    errors.push({ line: null, msg: 'Falta la función "void setup() { ... }" — es obligatoria en todo programa Arduino.' });
    isCorrect = false;
    score -= 25;
  }
  if (!hasLoop) {
    errors.push({ line: null, msg: 'Falta la función "void loop() { ... }" — es el bucle principal del microcontrolador.' });
    isCorrect = false;
    score -= 25;
  }

  // 2. Balance de llaves
  const openB = countOccurrences(src, '\\{');
  const closeB = countOccurrences(src, '\\}');
  if (openB !== closeB) {
    errors.push({ line: null, msg: `Llaves desbalanceadas: ${openB} apertura(s) '{' y ${closeB} cierre(s) '}'. Revisa cada bloque de código.` });
    isCorrect = false;
    score -= 20;
  }

  // 3. Puntos y comas
  const lines = src.split('\n');
  const semicolonErrors = [];
  lines.forEach((rawLine, idx) => {
    const l = rawLine.trim();
    if (!l || l.startsWith('//') || l.startsWith('#') || l.startsWith('/*') || l.startsWith('*') || l.endsWith('{') || l.endsWith('}') || l.startsWith('for') || l.startsWith('if') || l.startsWith('while') || l.startsWith('else') || l === '') return;
    if (!l.endsWith(';') && !l.endsWith(',') && !l.endsWith('{') && !l.endsWith('}')) {
      semicolonErrors.push({ line: idx + 1, msg: `Línea ${idx + 1}: Falta punto y coma ';' al final de: "${l}"` });
    }
  });
  if (semicolonErrors.length > 0) {
    errors.push(...semicolonErrors.slice(0, 3));
    isCorrect = false;
    score -= Math.min(20, semicolonErrors.length * 5);
  }

  // 4. Verificaciones según el contenido de la lección
  // — detectar pines mencionados en las instrucciones
  const pinMatches = practiceInstructions.match(/pin\s*(\d+)|pin(\d+)/gi) || [];
  const expectedPins = [...new Set(pinMatches.map(m => m.replace(/\D/g, '')).filter(Boolean))];

  expectedPins.forEach(pin => {
    if (!src.includes(`pinMode(${pin}`) && !src.includes(`pinMode( ${pin}`)) {
      warnings.push(`El pin ${pin} mencionado en las instrucciones no tiene configuración de pinMode(). ¿Lo inicializaste como OUTPUT o INPUT?`);
      score -= 5;
    }
  });

  // — verificar Serial si la lección lo requiere
  if ((practiceInstructions.includes('serial') || theory.includes('serial')) && !src.includes('Serial.begin')) {
    warnings.push('La lección requiere comunicación serial pero no encontramos "Serial.begin(baudios);" en setup().');
    score -= 10;
  }

  // — verificar analogWrite/digitalWrite según lección
  if (challengeDesc.includes('pwm') || practiceInstructions.includes('analogwrite')) {
    if (!src.includes('analogWrite')) {
      hints.push('¿Estás usando analogWrite() para controlar la intensidad? Es la función clave para PWM en Arduino.');
    }
  }

  // 5. Pistas pedagógicas según errores detectados
  const pedagogicalHints = [];
  if (errors.length > 0) {
    if (!hasSetup || !hasLoop) {
      pedagogicalHints.push('¿Recuerdas cuáles son las dos funciones obligatorias en todo sketch de Arduino? Revisa la sección de teoría.');
    } else if (openB !== closeB) {
      pedagogicalHints.push('Cada bloque de código que se abre con "{" debe cerrarse con "}". ¿Puedes contar cuántos tienes de cada tipo?');
    } else {
      pedagogicalHints.push('Revisa el final de cada instrucción — ¿hay algo que siempre termina una línea de código en C++?');
    }
  } else if (warnings.length > 0) {
    pedagogicalHints.push(buildHint(lessonHints, 0));
  } else {
    pedagogicalHints.push(buildHint(lessonHints, 2));
  }

  // 6. Validar contra expectedOutput si existe
  if (expectedOutput && isCorrect) {
    const keyParts = expectedOutput.split(';').filter(Boolean);
    const missingParts = keyParts.filter(part => !src.replace(/\s/g, '').includes(part.replace(/\s/g, '')));
    if (missingParts.length > 0) {
      isCorrect = false;
      score -= missingParts.length * 10;
      hints.push(`Parece que falta alguna instrucción clave. ¿Has incluido todas las llamadas de función que se piden?`);
    }
  }

  score = Math.max(0, score);
  return {
    language: 'arduino',
    isCorrect: isCorrect && errors.length === 0,
    errors,
    warnings,
    hints: [...hints, ...pedagogicalHints].slice(0, 3),
    score,
    feedback: isCorrect && errors.length === 0
      ? '✅ ¡Tu código supera el análisis de sintaxis y estructura! El circuito debería funcionar correctamente.'
      : `❌ Se encontraron ${errors.length} error(es) y ${warnings.length} advertencia(s). Revisa los puntos indicados.`,
    severity: errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'success'
  };
}

// ───────────────────────────────────────────────────────────────
//  ANALIZADOR PYTHON
// ───────────────────────────────────────────────────────────────
function analyzePython(src, lessonData) {
  const errors = [];
  const warnings = [];
  const hints = [];
  let score = 100;
  let isCorrect = true;

  const theory = stripHtml(lessonData?.theory || '');
  const practiceInstructions = (lessonData?.practice?.instructions || '').toLowerCase();
  const lessonHints = lessonData?.challenge?.hints || [];
  const expectedOutput = lessonData?.practice?.expectedOutput || '';

  const lines = src.split('\n');

  // 1. Verificar indentación
  for (let i = 0; i < lines.length; i++) {
    const prev = lines[i - 1]?.trim() || '';
    const curr = lines[i];
    if (prev.endsWith(':') && curr.trim() !== '' && !curr.startsWith(' ') && !curr.startsWith('\t')) {
      errors.push({ line: i + 1, msg: `Línea ${i + 1}: IndentationError — se esperaba un bloque indentado después de "${prev}".` });
      isCorrect = false;
      score -= 20;
    }
  }

  // 2. Verificar sintaxis básica de print
  lines.forEach((rawLine, idx) => {
    const l = rawLine.trim();
    // print sin paréntesis (Python 2 style)
    if (/^print\s+[^(]/.test(l)) {
      errors.push({ line: idx + 1, msg: `Línea ${idx + 1}: SyntaxError — en Python 3 print es una función: usa print("texto") con paréntesis.` });
      isCorrect = false;
      score -= 15;
    }
    // paréntesis sin cerrar
    const opens = (l.match(/\(/g) || []).length;
    const closes = (l.match(/\)/g) || []).length;
    if (opens > closes && !l.endsWith(':') && !l.startsWith('#') && l.includes('(')) {
      errors.push({ line: idx + 1, msg: `Línea ${idx + 1}: Paréntesis sin cerrar — abriste ${opens} y cerraste ${closes}.` });
      isCorrect = false;
      score -= 10;
    }
  });

  // 3. Verificaciones según contenido de lección
  if (practiceInstructions.includes('for') || theory.includes('bucle for')) {
    if (!src.includes('for ') && !src.includes('for\t')) {
      warnings.push('La lección requiere un bucle. ¿Dónde está tu instrucción "for"?');
      score -= 10;
    }
  }
  if (practiceInstructions.includes('while')) {
    if (!src.includes('while ')) {
      warnings.push('Se espera un bucle "while". ¿Lo incluiste en tu solución?');
      score -= 10;
    }
  }
  if (practiceInstructions.includes('def ') || practiceInstructions.includes('función') || practiceInstructions.includes('funcion')) {
    if (!src.includes('def ')) {
      warnings.push('La lección pide definir una función con "def". ¿La has declarado?');
      score -= 10;
    }
  }
  if (practiceInstructions.includes('print')) {
    if (!src.includes('print(')) {
      warnings.push('Se espera que uses print() para mostrar resultados. ¿Lo incluiste?');
      score -= 5;
    }
  }

  // 4. Verificar si el código está vacío o es sólo comentarios
  const meaningfulLines = lines.filter(l => l.trim() && !l.trim().startsWith('#'));
  if (meaningfulLines.length === 0) {
    warnings.push('El área de código está vacía. ¡Empieza a escribir tu solución!');
    score = 0;
    isCorrect = false;
  }

  // 5. Pistas pedagógicas
  const pedagogicalHints = [];
  if (errors.length > 0) {
    const indentError = errors.find(e => e.msg.includes('Indentation'));
    if (indentError) {
      pedagogicalHints.push('En Python, la indentación no es opcional — define la estructura del código. Usa 4 espacios después de los dos puntos ":".');
    } else {
      pedagogicalHints.push('Revisa la sintaxis de Python 3: las funciones como print() necesitan paréntesis y los textos van entre comillas.');
    }
  } else if (warnings.length > 0) {
    pedagogicalHints.push(buildHint(lessonHints, 0));
  } else {
    pedagogicalHints.push(buildHint(lessonHints, 2));
  }

  // 6. Validar contra expectedOutput
  if (expectedOutput && isCorrect) {
    if (!src.includes(expectedOutput.trim())) {
      const keyWords = expectedOutput.split(/\s+/).filter(w => w.length > 2);
      const missing = keyWords.filter(w => !src.includes(w));
      if (missing.length > 0) {
        score -= 10;
        hints.push(`¿Tu solución incluye todas las instrucciones solicitadas? Revisa las instrucciones del ejercicio.`);
      }
    }
  }

  score = Math.max(0, score);
  return {
    language: 'python',
    isCorrect: isCorrect && errors.length === 0,
    errors,
    warnings,
    hints: [...hints, ...pedagogicalHints].slice(0, 3),
    score,
    feedback: isCorrect && errors.length === 0
      ? '✅ ¡Sintaxis Python correcta! El código está bien estructurado.'
      : `❌ Se detectaron ${errors.length} error(es). Revisa los puntos indicados antes de ejecutar.`,
    severity: errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'success'
  };
}

// ───────────────────────────────────────────────────────────────
//  ANALIZADOR SCRATCH (bloques de pseudocódigo)
// ───────────────────────────────────────────────────────────────
function analyzeScratch(src, lessonData) {
  const errors = [];
  const warnings = [];
  const hints = [];
  let score = 100;
  let isCorrect = true;

  const practiceInstructions = (lessonData?.practice?.instructions || '').toLowerCase();
  const lessonHints = lessonData?.challenge?.hints || [];

  const rawLines = src.split('\n').filter(l => l.trim());
  const normalizedBlocks = rawLines.map(l => l.replace(/[\[\]]/g, '').trim().toLowerCase());

  // 1. Verificar bloque de inicio (hat block)
  const hasStartEvent = normalizedBlocks.some(b =>
    b.includes('al presionar bandera verde') ||
    b.includes('al presionar tecla') ||
    b.includes('al hacer click') ||
    b.includes('al recibir mensaje')
  );

  if (!hasStartEvent) {
    warnings.push('El script no tiene un bloque de inicio (sombrero). Añade "al presionar bandera verde" al principio para que el programa pueda ejecutarse.');
    score -= 15;
  }

  // 2. Verificar bloques requeridos según instrucciones
  const requiresMove = practiceInstructions.includes('mover') || practiceInstructions.includes('pasos') || practiceInstructions.includes('movimiento');
  const requiresRepeat = practiceInstructions.includes('repetir') || practiceInstructions.includes('veces') || practiceInstructions.includes('ciclo') || practiceInstructions.includes('bucle');
  const requiresSay = practiceInstructions.includes('decir') || practiceInstructions.includes('mensaje') || practiceInstructions.includes('hablar');
  const requiresForever = practiceInstructions.includes('siempre') || practiceInstructions.includes('continuo') || practiceInstructions.includes('infinito');

  if (requiresMove && !normalizedBlocks.some(b => b.includes('mover'))) {
    warnings.push('La lección pide mover el personaje. ¿Usaste el bloque "mover X pasos"?');
    score -= 10;
  }
  if (requiresRepeat && !normalizedBlocks.some(b => b.includes('repetir') || b.includes('por siempre'))) {
    warnings.push('Se necesita un bloque de repetición. ¿Probaste con "repetir X veces" o "por siempre"?');
    score -= 10;
  }
  if (requiresSay && !normalizedBlocks.some(b => b.includes('decir'))) {
    warnings.push('La lección pide mostrar un mensaje. ¿Usaste el bloque "decir ..."?');
    score -= 10;
  }
  if (requiresForever && !normalizedBlocks.some(b => b.includes('por siempre'))) {
    warnings.push('Se necesita un bucle infinito. Busca el bloque "por siempre" en la categoría Control.');
    score -= 10;
  }

  // 3. Verificar si hay bloques en el script
  if (rawLines.length === 0) {
    isCorrect = false;
    score = 0;
    errors.push({ line: null, msg: 'El espacio de trabajo está vacío. Haz clic en los bloques de la paleta para agregarlos.' });
  }

  // 4. Pistas pedagógicas
  const pedagogicalHints = [];
  if (errors.length > 0) {
    pedagogicalHints.push('Comienza arrastrando o haciendo clic en el bloque "al presionar bandera verde" desde la categoría Eventos para iniciar tu script.');
  } else if (warnings.length > 0) {
    pedagogicalHints.push(buildHint(lessonHints, 0));
  } else {
    pedagogicalHints.push(buildHint(lessonHints, 2));
    isCorrect = true;
  }

  score = Math.max(0, score);
  return {
    language: 'scratch',
    isCorrect: isCorrect && errors.length === 0 && warnings.length === 0,
    errors,
    warnings,
    hints: [...hints, ...pedagogicalHints].slice(0, 3),
    score,
    feedback: isCorrect && errors.length === 0 && warnings.length === 0
      ? '✅ ¡Los bloques están bien ensamblados! El script debería ejecutarse correctamente.'
      : `⚠️ ${warnings.length} punto(s) a mejorar en el ensamblado de bloques.`,
    severity: errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'success'
  };
}

// ───────────────────────────────────────────────────────────────
//  FUNCIÓN PRINCIPAL EXPORTADA
// ───────────────────────────────────────────────────────────────
/**
 * Analiza el código del estudiante según el lenguaje y el contenido de la lección
 * @param {string} code - Código escrito por el estudiante
 * @param {string} language - 'arduino' | 'python' | 'scratch'
 * @param {object} lessonData - Objeto de la lección con theory, practice, challenge
 * @returns {{ isCorrect, errors, warnings, hints, score, feedback, severity }}
 */
export function analyzeCode(code, language, lessonData = {}) {
  if (!code || code.trim() === '') {
    return {
      language,
      isCorrect: false,
      errors: [{ line: null, msg: 'El editor está vacío. ¡Empieza a escribir tu código!' }],
      warnings: [],
      hints: ['Lee las instrucciones del ejercicio y el ejemplo de la lección para comenzar.'],
      score: 0,
      feedback: '📝 Escribe tu código en el editor y presiona "▶ Simular y Ejecutar" para analizarlo.',
      severity: 'neutral'
    };
  }

  switch (language) {
    case 'arduino': return analyzeArduino(code, lessonData);
    case 'python': return analyzePython(code, lessonData);
    case 'scratch': return analyzeScratch(code, lessonData);
    default: return {
      language,
      isCorrect: false,
      errors: [],
      warnings: [`Lenguaje "${language}" no reconocido.`],
      hints: [],
      score: 0,
      feedback: 'Lenguaje no soportado.',
      severity: 'neutral'
    };
  }
}

/**
 * Genera una pista adicional progresiva para el estudiante
 * @param {string} language 
 * @param {object} lessonData 
 * @param {number} hintLevel - 0, 1, 2 (de más vago a más específico)
 */
export function getProgressiveHint(language, lessonData, hintLevel = 0) {
  const hints = lessonData?.challenge?.hints || lessonData?.practice?.hints || [];
  const genericHints = {
    arduino: [
      '¿Recuerdas la estructura básica de un sketch de Arduino? Revisa la teoría.',
      '¿Estás usando las funciones correctas: pinMode(), digitalWrite(), delay()?',
      'Verifica que cada instrucción termine con ";" y que las llaves {} estén balanceadas.'
    ],
    python: [
      '¿Qué tipo de estructura de control necesitas: for, while, if-else o una función?',
      'Revisa la indentación (4 espacios) después de los dos puntos ":".',
      'Compara tu código línea por línea con el ejemplo de la lección.'
    ],
    scratch: [
      '¿Qué bloque de inicio (sombrero) necesitas para que el script comience?',
      '¿En qué categoría de bloques puedes encontrar la instrucción que necesitas?',
      'Conecta los bloques en orden lógico: primero el evento, luego las acciones.'
    ]
  };

  if (hints.length > 0) {
    return hints[Math.min(hintLevel, hints.length - 1)];
  }
  const langHints = genericHints[language] || genericHints.python;
  return langHints[Math.min(hintLevel, langHints.length - 1)];
}
