// quizData.js - Banco de preguntas exclusivo por lenguaje de programación
// 15+ preguntas por lenguaje con validaciones pedagógicas

export const finalExamsByLanguage = {
  arduino: [
    { id: 'a1', type: 'mc', question: '¿Cuál función se ejecuta una sola vez al encender o reiniciar el microcontrolador Arduino?', options: ['loop()', 'setup()', 'init()', 'begin()'], answer: 1 },
    { id: 'a2', type: 'tf', question: 'En la arquitectura Arduino, la función loop() se ejecuta continuamente en bucle infinito.', answer: 'Verdadero' },
    { id: 'a3', type: 'fill', question: 'Escribe la instrucción exacta para configurar el pin digital 13 como salida:', answer: 'pinMode(13, OUTPUT)' },
    { id: 'a4', type: 'mc', question: '¿Qué función se utiliza para leer el valor lógico de un pin digital?', options: ['analogRead()', 'digitalRead()', 'pinRead()', 'readDigital()'], answer: 1 },
    { id: 'a5', type: 'mc', question: '¿Cuál es el rango de resolución de 10 bits devuelto por analogRead()?', options: ['0 a 255', '0 a 1023', '0 a 4095', '0 a 5000'], answer: 1 },
    { id: 'a6', type: 'mc', question: '¿Qué técnica permite simular una salida analógica mediante modulación de ancho de pulso?', options: ['SPI', 'I2C', 'PWM (analogWrite)', 'UART'], answer: 2 },
    { id: 'a7', type: 'fill', question: 'Escribe la función para inicializar la comunicación serial a 9600 baudios:', answer: 'Serial.begin(9600)' },
    { id: 'a8', type: 'tf', question: 'El pin LED_BUILTIN hace referencia al LED integrado en la placa (usualmente pin 13 en el Uno).', answer: 'Verdadero' },
    { id: 'a9', type: 'mc', question: '¿Qué función congela la ejecución del programa durante un número específico de milisegundos?', options: ['wait()', 'pause()', 'delay()', 'sleep()'], answer: 2 },
    { id: 'a10', type: 'mc', question: '¿Qué función retorna el número de milisegundos transcurridos desde que se encendió el Arduino?', options: ['micros()', 'millis()', 'clock()', 'time()'], answer: 1 },
    { id: 'a11', type: 'fill', question: 'Escribe el comando para enviar un texto con salto de línea al monitor serial:', answer: 'Serial.println("Hola")' },
    { id: 'a12', type: 'tf', question: 'La función analogWrite() solo funciona en pines marcados con soporte PWM (tilde ~).', answer: 'Verdadero' },
    { id: 'a13', type: 'mc', question: '¿Cuál es el valor que representa un nivel alto de voltaje (5V o 3.3V) en Arduino?', options: ['LOW', 'HIGH', 'MAX', 'ON'], answer: 1 },
    { id: 'a14', type: 'mc', question: '¿Qué tipo de dato primitivo en C++/Arduino ocupa 2 bytes y almacena enteros de -32,768 a 32,767?', options: ['byte', 'int', 'long', 'float'], answer: 1 },
    { id: 'a15', type: 'tf', question: 'pinMode(pin, INPUT_PULLUP) activa la resistencia interna de pull-up del microcontrolador.', answer: 'Verdadero' },
    { id: 'a16', type: 'mc', question: '¿Qué función remapea un número desde un rango original hacia otro rango objetivo?', options: ['map()', 'constrain()', 'abs()', 'scale()'], answer: 0 }
  ],
  python: [
    { id: 'p1', type: 'mc', question: '¿Cómo se define un bloque de código dependiente en Python (como el cuerpo de un if o función)?', options: ['Con llaves { }', 'Con indentación (sangría consistente)', 'Con las palabras BEGIN y END', 'Con corchetes [ ]'], answer: 1 },
    { id: 'p2', type: 'tf', question: 'En Python 3, la función print() requiere paréntesis obligatorios.', answer: 'Verdadero' },
    { id: 'p3', type: 'fill', question: 'Escribe la palabra clave para declarar una nueva función en Python:', answer: 'def' },
    { id: 'p4', type: 'mc', question: '¿Cuál es el operador aritmético para elevar un número a una potencia en Python?', options: ['^', '**', 'pow', '^^'], answer: 1 },
    { id: 'p5', type: 'mc', question: '¿Qué estructura de datos ordenada y mutable se declara utilizando corchetes [ ]?', options: ['Tupla', 'Diccionario', 'Lista', 'Conjunto (set)'], answer: 2 },
    { id: 'p6', type: 'tf', question: 'Las tuplas en Python se definen con paréntesis ( ) y son inmutables.', answer: 'Verdadero' },
    { id: 'p7', type: 'fill', question: 'Escribe el símbolo utilizado para escribir comentarios de una sola línea en Python:', answer: '#' },
    { id: 'p8', type: 'mc', question: '¿Cuál es el resultado de la expresión: 15 // 4 en Python?', options: ['3.75', '3', '4', '1'], answer: 1 },
    { id: 'p9', type: 'mc', question: '¿Qué función retorna la cantidad de elementos de una lista o caracteres de una cadena?', options: ['size()', 'length()', 'count()', 'len()'], answer: 3 },
    { id: 'p10', type: 'tf', question: 'En Python, los tipos booleanos válidos se escriben con mayúscula inicial: True y False.', answer: 'Verdadero' },
    { id: 'p11', type: 'fill', question: 'Escribe la palabra clave para retornar un valor desde el interior de una función:', answer: 'return' },
    { id: 'p12', type: 'mc', question: '¿Cómo se comprueba si el valor "x" está presente dentro de una lista llamada "datos"?', options: ['if x exists datos:', 'if x in datos:', 'if datos.has(x):', 'if x.inside(datos):'], answer: 1 },
    { id: 'p13', type: 'tf', question: 'La función range(5) genera una secuencia de enteros de 0 a 4.', answer: 'Verdadero' },
    { id: 'p14', type: 'mc', question: '¿Qué método de listas permite añadir un nuevo elemento al final de la misma?', options: ['push()', 'add()', 'append()', 'insert()'], answer: 2 },
    { id: 'p15', type: 'mc', question: '¿Cómo se convierte una cadena numérica "42" a un número entero?', options: ['integer("42")', 'int("42")', 'to_int("42")', 'Number("42")'], answer: 1 },
    { id: 'p16', type: 'tf', question: 'El bloque try...except se utiliza en Python para capturar y manejar excepciones y errores.', answer: 'Verdadero' }
  ],
  scratch: [
    { id: 's1', type: 'mc', question: '¿Qué bloque tipo Sombrero se utiliza comúnmente para iniciar la ejecución del proyecto al presionar el botón verde?', options: ['al hacer clic en este objeto', 'al presionar bandera verde', 'al recibir mensaje1', 'cuando el fondo cambie'], answer: 1 },
    { id: 's2', type: 'tf', question: 'En Scratch, los bloques de la categoría Movimiento son de color azul (#4C97FF).', answer: 'Verdadero' },
    { id: 's3', type: 'fill', question: 'Escribe el nombre del bloque para hacer que el personaje emita un texto en pantalla:', answer: 'decir' },
    { id: 's4', type: 'mc', question: '¿Qué categoría de bloques tiene el color naranja oscuro / ámbar (#FFAB19)?', options: ['Variables', 'Control', 'Eventos', 'Sensores'], answer: 1 },
    { id: 's5', type: 'mc', question: '¿Qué bloque crea un bucle infinito que nunca deja de ejecutarse hasta presionar el botón rojo?', options: ['repetir (10)', 'por siempre', 'repetir hasta que', 'esperar (1) segundos'], answer: 1 },
    { id: 's6', type: 'tf', question: 'El centro del escenario de Scratch tiene coordenadas cartesianas (X: 0, Y: 0).', answer: 'Verdadero' },
    { id: 's7', type: 'mc', question: '¿En qué dirección mira un personaje en Scratch por defecto cuando su valor de dirección es 90°?', options: ['Hacia arriba', 'Hacia la derecha', 'Hacia abajo', 'Hacia la izquierda'], answer: 1 },
    { id: 's8', type: 'fill', question: 'Escribe el bloque para detener todos los programas en ejecución en el proyecto:', answer: 'detener todos' },
    { id: 's9', type: 'mc', question: '¿Qué forma geométrica tienen los bloques que devuelven un valor booleano (Verdadero o Falso) en Scratch?', options: ['Rectangular', 'Ovalada', 'Hexagonal con puntas', 'Triangular'], answer: 2 },
    { id: 's10', type: 'tf', question: 'Los bloques tipo Reportero con bordes redondeados (óvalos) devuelven números o texto.', answer: 'Verdadero' },
    { id: 's11', type: 'mc', question: '¿Qué categoría de bloques es de color verde (#59C059) e incluye suma, azar y comparaciones?', options: ['Sensores', 'Variables', 'Operadores', 'Mis Bloques'], answer: 2 },
    { id: 's12', type: 'mc', question: 'Si un personaje gira 90 grados a la derecha y luego se mueve 10 pasos, ¿hacia dónde avanzará?', options: ['Hacia donde esté apuntando su nueva dirección orientada', 'Siempre hacia la derecha absoluta', 'Hacia la izquierda', 'No se moverá'], answer: 0 },
    { id: 's13', type: 'tf', question: 'Un bloque en forma de "C" (como si...entonces) permite anidar otros bloques dentro de su boca.', answer: 'Verdadero' },
    { id: 's14', type: 'mc', question: '¿Qué bloque permite cambiar la apariencia del sprite a otro cuadro de animación guardado?', options: ['siguiente fondo', 'cambiar disfraz a', 'cambiar tamaño por', 'mostrar'], answer: 1 },
    { id: 's15', type: 'fill', question: 'Escribe el nombre del sensor para detectar si el personaje colisiona con el puntero:', answer: 'tocando el puntero del ratón' },
    { id: 's16', type: 'tf', question: 'La categoría Variables es de color naranja (#FF8C1A) y permite crear variables y listas.', answer: 'Verdadero' }
  ]
};

export const quizzesByLanguage = finalExamsByLanguage;
export const quizData = quizzesByLanguage;
