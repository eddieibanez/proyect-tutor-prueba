const generateGenericQuestions = (language, levelId) => {
  return [
    {
      id: `q1-${language}-${levelId}`,
      question: `¿Cuál es el concepto principal aprendido en el nivel ${levelId} de ${language.toUpperCase()}?`,
      options: ['Variables', 'Control de Flujo', 'Funciones', 'Estructuras de Datos'],
      correctAnswer: 1,
      explanation: 'El control de flujo es esencial en este nivel.'
    },
    {
      id: `q2-${language}-${levelId}`,
      question: '¿Qué palabra clave usamos frecuentemente aquí?',
      options: ['if', 'while', 'for', 'return'],
      correctAnswer: 0,
      explanation: 'if nos permite tomar decisiones.'
    },
    {
      id: `q3-${language}-${levelId}`,
      question: '¿Cómo cerramos una instrucción?',
      options: ['Con punto y coma', 'Con dos puntos', 'Con un punto', 'No se cierra'],
      correctAnswer: language === 'python' ? 3 : 0,
      explanation: language === 'python' ? 'Python usa indentación en lugar de punto y coma.' : 'En muchos lenguajes se usa punto y coma.'
    },
    {
      id: `q4-${language}-${levelId}`,
      question: '¿Cuál es un error común en este nivel?',
      options: ['Falta de sintaxis', 'Lógica inversa', 'Ciclo infinito', 'Todo lo anterior'],
      correctAnswer: 3,
      explanation: 'Todos estos son errores muy comunes cuando aprendemos.'
    },
    {
      id: `q5-${language}-${levelId}`,
      question: '¿Cómo podemos depurar este código?',
      options: ['Imprimiendo variables', 'Borrando todo', 'Apagando el PC', 'Cambiando de lenguaje'],
      correctAnswer: 0,
      explanation: 'Imprimir variables (usando print o Serial.print) nos ayuda a ver qué pasa.'
    }
  ];
};

export const quizData = {
  arduino: {
    1: {
      title: 'Quiz: Hola Mundo LED',
      questions: [
        { id: 'a1q1', question: '¿Qué significa LED?', options: ['Luz Especial Digital', 'Diodo Emisor de Luz', 'Lámpara de Energía Directa', 'Diodo de Entrada Local'], correctAnswer: 1, explanation: 'LED viene del inglés Light Emitting Diode, que significa Diodo Emisor de Luz.' },
        { id: 'a1q2', question: '¿Qué comando configura un pin como salida?', options: ['digitalWrite()', 'analogRead()', 'pinMode()', 'delay()'], correctAnswer: 2, explanation: 'pinMode() se usa en el setup() para configurar el pin como INPUT o OUTPUT.' },
        { id: 'a1q3', question: '¿Dónde se debe poner el código que se ejecuta una sola vez?', options: ['En el loop()', 'En el setup()', 'Fuera de todo', 'En el delay()'], correctAnswer: 1, explanation: 'setup() se ejecuta una vez cuando el Arduino se enciende.' },
        { id: 'a1q4', question: '¿Para qué sirve delay(1000)?', options: ['Pausar 1 segundo', 'Pausar 1000 segundos', 'Apagar el Arduino', 'Encender el pin 1000'], correctAnswer: 0, explanation: 'delay() pausa el programa en milisegundos. 1000 ms = 1 segundo.' },
        { id: 'a1q5', question: '¿Qué valor envía electricidad al LED?', options: ['LOW', 'OFF', 'HIGH', 'ON'], correctAnswer: 2, explanation: 'HIGH activa el voltaje (usualmente 5V), encendiendo el LED.' }
      ]
    },
    2: { title: 'Quiz: Semáforo', questions: generateGenericQuestions('arduino', 2) },
    3: { title: 'Quiz: Botones', questions: generateGenericQuestions('arduino', 3) },
    4: { title: 'Quiz: Serial', questions: generateGenericQuestions('arduino', 4) },
    5: { title: 'Quiz: For', questions: generateGenericQuestions('arduino', 5) },
  },
  scratch: {
    1: {
      title: 'Quiz: Movimiento Básico',
      questions: [
        { id: 's1q1', question: '¿De qué color son los bloques de Movimiento?', options: ['Naranja', 'Azul', 'Verde', 'Morado'], correctAnswer: 1, explanation: 'Los bloques de Movimiento en Scratch son de color azul oscuro.' },
        { id: 's1q2', question: '¿Qué hace el bloque "Mover 10 pasos"?', options: ['Gira al personaje', 'Mueve al personaje en la dirección actual', 'Hace que el personaje salte', 'Esconde al personaje'], correctAnswer: 1, explanation: 'Avanza 10 unidades en la dirección a la que apunta el objeto.' },
        { id: 's1q3', question: '¿Cómo iniciamos normalmente un programa en Scratch?', options: ['Bandera Verde', 'Círculo Rojo', 'Estrella Amarilla', 'Cuadrado Azul'], correctAnswer: 0, explanation: 'El evento "Al presionar bandera verde" es la forma más común de iniciar.' },
        { id: 's1q4', question: '¿Para qué sirve girar 90 grados?', options: ['Para dar una vuelta completa', 'Para hacer una esquina recta', 'Para ir hacia atrás', 'No hace nada'], correctAnswer: 1, explanation: '90 grados forman un ángulo recto, útil para cuadrados o esquinas.' },
        { id: 's1q5', question: '¿Qué pasa si pones un número negativo en "Mover pasos"?', options: ['Da error', 'Va hacia adelante más rápido', 'Va hacia atrás', 'El personaje desaparece'], correctAnswer: 2, explanation: 'Mover pasos negativos retrocede al personaje.' }
      ]
    },
    2: { title: 'Quiz: Eventos', questions: generateGenericQuestions('scratch', 2) },
    3: { title: 'Quiz: Ciclos', questions: generateGenericQuestions('scratch', 3) },
    4: { title: 'Quiz: If', questions: generateGenericQuestions('scratch', 4) },
    5: { title: 'Quiz: Variables', questions: generateGenericQuestions('scratch', 5) },
  },
  python: {
    1: {
      title: 'Quiz: Imprimiendo',
      questions: [
        { id: 'p1q1', question: '¿Cuál es la función para mostrar texto en Python?', options: ['echo', 'print()', 'console.log()', 'escribir()'], correctAnswer: 1, explanation: 'En Python se usa print() para mostrar salidas.' },
        { id: 'p1q2', question: '¿Cómo debe escribirse un texto dentro de print?', options: ['Sin nada', 'Entre corchetes []', 'Entre comillas "" o \'\'', 'Entre barras //'], correctAnswer: 2, explanation: 'El texto (strings) debe estar entre comillas.' },
        { id: 'p1q3', question: '¿Qué imprimirá: print(2 + 2)?', options: ['2 + 2', '4', 'Error', 'Nada'], correctAnswer: 1, explanation: 'Python evalúa la expresión matemática y muestra el resultado, 4.' },
        { id: 'p1q4', question: '¿Es importante usar minúsculas en print()?', options: ['Sí, Print() dará error', 'No importa', 'Solo en Mac', 'Python convierte todo a mayúsculas'], correctAnswer: 0, explanation: 'Python distingue entre mayúsculas y minúsculas (case-sensitive).' },
        { id: 'p1q5', question: '¿Qué son los comentarios en Python?', options: ['Texto para que lea el usuario', 'Notas para el programador que empiezan con #', 'Errores de código', 'Textos grandes'], correctAnswer: 1, explanation: 'Los comentarios empiezan con # y son ignorados al ejecutar el código.' }
      ]
    },
    2: { title: 'Quiz: Variables', questions: generateGenericQuestions('python', 2) },
    3: { title: 'Quiz: Condicionales', questions: generateGenericQuestions('python', 3) },
    4: { title: 'Quiz: While', questions: generateGenericQuestions('python', 4) },
    5: { title: 'Quiz: Listas', questions: generateGenericQuestions('python', 5) },
  }
};

// Generar niveles 6 al 15
for(let i=6; i<=15; i++) {
  quizData.arduino[i] = { title: `Quiz Nivel ${i}`, questions: generateGenericQuestions('arduino', i) };
  quizData.scratch[i] = { title: `Quiz Nivel ${i}`, questions: generateGenericQuestions('scratch', i) };
  quizData.python[i] = { title: `Quiz Nivel ${i}`, questions: generateGenericQuestions('python', i) };
}
