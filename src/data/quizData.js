// quizData.js - Banco de preguntas por lenguaje
// Tipos: mc (multiple choice), tf (true/false), fill (completar)

export const quizzesByLanguage = {
  arduino: [
    { id: 'a1', question: 'Que funcion se ejecuta una sola vez al inicio en Arduino?', type: 'mc', options: ['loop()', 'setup()', 'main()', 'init()'], answer: 1 },
    { id: 'a2', question: 'Que funcion se ejecuta repetidamente en Arduino?', type: 'mc', options: ['setup()', 'begin()', 'loop()', 'run()'], answer: 2 },
    { id: 'a3', question: 'pinMode(13, OUTPUT) configura el pin 13 como salida.', type: 'tf', answer: 'Verdadero' },
    { id: 'a4', question: 'Escribe la funcion para encender un LED en el pin 13:', type: 'fill', answer: 'digitalWrite(13, HIGH)' },
    { id: 'a5', question: 'Que tipo de dato usas para almacenar numeros enteros en Arduino?', type: 'mc', options: ['float', 'String', 'int', 'boolean'], answer: 2 },
  ],
  python: [
    { id: 'p1', question: 'Como imprimes texto en Python 3?', type: 'mc', options: ['echo("hola")', 'print("hola")', 'console.log("hola")', 'printf("hola")'], answer: 1 },
    { id: 'p2', question: 'Python usa llaves {} para definir bloques de codigo.', type: 'tf', answer: 'Falso' },
    { id: 'p3', question: 'Que keyword se usa para definir una funcion en Python?', type: 'fill', answer: 'def' },
    { id: 'p4', question: 'Cual es el resultado de 2 ** 3 en Python?', type: 'mc', options: ['6', '8', '5', '9'], answer: 1 },
    { id: 'p5', question: 'Las listas en Python se crean con corchetes [].', type: 'tf', answer: 'Verdadero' },
  ],
  scratch: [
    { id: 's1', question: 'Que bloque inicia un programa en Scratch?', type: 'mc', options: ['Al presionar espacio', 'Al presionar bandera verde', 'Al hacer clic en el objeto', 'Cuando empiece el juego'], answer: 1 },
    { id: 's2', question: 'El bloque mover 10 pasos mueve el personaje hacia adelante.', type: 'tf', answer: 'Verdadero' },
    { id: 's3', question: 'Que categoria de bloques es de color naranja en Scratch?', type: 'mc', options: ['Movimiento', 'Control', 'Variables', 'Apariencia'], answer: 1 },
    { id: 's4', question: 'Que bloque se usa para repetir acciones varias veces?', type: 'mc', options: ['Si entonces', 'Repetir', 'Esperar', 'Detener todo'], answer: 1 },
    { id: 's5', question: 'Los bloques de Movimiento en Scratch son de color azul.', type: 'tf', answer: 'Verdadero' },
  ]
};

export const finalExamsByLanguage = {
  arduino: [
    { id: 'fa1', type: 'mc', question: 'Cual funcion se ejecuta una sola vez al iniciar el Arduino?', options: ['loop()', 'setup()', 'begin()', 'start()'], answer: 1 },
    { id: 'fa2', type: 'tf', question: 'En Arduino, la funcion loop() se ejecuta repetidamente de forma continua.', answer: 'Verdadero' },
    { id: 'fa3', type: 'fill', question: 'Escribe el comando para configurar el pin 7 como salida:', answer: 'pinMode(7, OUTPUT)' },
    { id: 'fa4', type: 'mc', question: 'Que funcion se usa para leer el estado de un pin digital?', options: ['analogRead()', 'digitalRead()', 'pinRead()', 'readPin()'], answer: 1 },
    { id: 'fa5', type: 'mc', question: 'Que valor representa un nivel ALTO en una salida digital?', options: ['0', '255', 'HIGH', 'TRUE'], answer: 2 },
    { id: 'fa6', type: 'tf', question: 'analogWrite() en Arduino puede producir una senal PWM.', answer: 'Verdadero' },
    { id: 'fa7', type: 'mc', question: 'Que tipo de variable almacena valores con decimales en Arduino?', options: ['int', 'boolean', 'float', 'char'], answer: 2 },
    { id: 'fa8', type: 'fill', question: 'Escribe el comando para encender el LED integrado del Arduino:', answer: 'digitalWrite(LED_BUILTIN, HIGH)' },
    { id: 'fa9', type: 'mc', question: 'Que funcion pausa la ejecucion del programa por un tiempo?', options: ['pause()', 'wait()', 'delay()', 'sleep()'], answer: 2 },
    { id: 'fa10', type: 'tf', question: 'Serial.begin(9600) inicializa la comunicacion serial a 9600 baudios.', answer: 'Verdadero' },
    { id: 'fa11', type: 'mc', question: 'Que pin analogico de Arduino puede leer valores de 0 a 1023?', options: ['Pin digital', 'Pin A0', 'Pin PWM', 'Pin GND'], answer: 1 },
    { id: 'fa12', type: 'fill', question: 'Escribe el codigo para imprimir "Hola" por el monitor serial:', answer: 'Serial.println("Hola")' },
    { id: 'fa13', type: 'mc', question: 'Cuantos pines digitales tiene un Arduino Uno?', options: ['6', '10', '14', '20'], answer: 2 },
    { id: 'fa14', type: 'tf', question: 'En Arduino se puede usar if, else if y else para tomar decisiones.', answer: 'Verdadero' },
    { id: 'fa15', type: 'mc', question: 'Que operador logico representa el AND en Arduino?', options: ['||', '&&', '!', '=='], answer: 1 },
  ],
  python: [
    { id: 'fp1', type: 'mc', question: 'Como se imprime texto en Python 3?', options: ['echo("hola")', 'printf("hola")', 'print("hola")', 'console.log("hola")'], answer: 2 },
    { id: 'fp2', type: 'tf', question: 'Python usa indentacion (espacios/tabulaciones) para definir bloques de codigo.', answer: 'Verdadero' },
    { id: 'fp3', type: 'fill', question: 'Escribe el keyword para definir una funcion en Python:', answer: 'def' },
    { id: 'fp4', type: 'mc', question: 'Cual es el resultado de 2 ** 4 en Python?', options: ['6', '8', '12', '16'], answer: 3 },
    { id: 'fp5', type: 'mc', question: 'Como se crea una lista en Python?', options: ['lista = {}', 'lista = ()', 'lista = []', 'lista = <>'], answer: 2 },
    { id: 'fp6', type: 'tf', question: 'El operador // en Python realiza division entera.', answer: 'Verdadero' },
    { id: 'fp7', type: 'mc', question: 'Como se escribe un comentario de una linea en Python?', options: ['//', '/*', '#', '--'], answer: 2 },
    { id: 'fp8', type: 'fill', question: 'Escribe el keyword para un ciclo que recorre una lista:', answer: 'for' },
    { id: 'fp9', type: 'mc', question: 'Que funcion convierte una cadena a entero en Python?', options: ['str()', 'float()', 'int()', 'num()'], answer: 2 },
    { id: 'fp10', type: 'tf', question: 'En Python, los indices de una lista comienzan en 0.', answer: 'Verdadero' },
    { id: 'fp11', type: 'mc', question: 'Como se importa un modulo en Python?', options: ['include modulo', 'import modulo', 'require modulo', 'using modulo'], answer: 1 },
    { id: 'fp12', type: 'fill', question: 'Escribe el keyword para retornar un valor desde una funcion:', answer: 'return' },
    { id: 'fp13', type: 'mc', question: 'Que tipo de datos es "True" en Python?', options: ['str', 'int', 'bool', 'list'], answer: 2 },
    { id: 'fp14', type: 'tf', question: 'La funcion len() en Python retorna la longitud de una lista o cadena.', answer: 'Verdadero' },
    { id: 'fp15', type: 'mc', question: 'Como se abre un archivo en Python para lectura?', options: ['open("f", "w")', 'open("f", "r")', 'read("f")', 'file("f")'], answer: 1 },
  ],
  scratch: [
    { id: 'fs1', type: 'mc', question: 'Que bloque de Eventos inicia un programa en Scratch?', options: ['Al presionar espacio', 'Al presionar bandera verde', 'Al hacer clic en este objeto', 'Al recibir mensaje'], answer: 1 },
    { id: 'fs2', type: 'tf', question: 'Los bloques de Movimiento en Scratch tienen color azul (#4C97FF).', answer: 'Verdadero' },
    { id: 'fs3', type: 'mc', question: 'De que color son los bloques de Control en Scratch?', options: ['Azul', 'Verde', 'Naranja/Amarillo', 'Morado'], answer: 2 },
    { id: 'fs4', type: 'mc', question: 'Que bloque repite acciones un numero fijo de veces?', options: ['Por siempre', 'Repetir N veces', 'Si entonces', 'Esperar'], answer: 1 },
    { id: 'fs5', type: 'tf', question: 'En Scratch, los bloques tipo Sombrero tienen una curva en la parte superior.', answer: 'Verdadero' },
    { id: 'fs6', type: 'mc', question: 'Que bloque mueve el personaje continuamente hacia adelante?', options: ['Girar 90 grados', 'Mover 10 pasos dentro de Por siempre', 'Ir a posicion aleatoria', 'Fijar x a 0'], answer: 1 },
    { id: 'fs7', type: 'fill', question: 'Escribe el nombre del bloque que hace que el personaje diga algo:', answer: 'decir' },
    { id: 'fs8', type: 'mc', question: 'Que categoria de bloques permite cambiar el disfraz del personaje?', options: ['Movimiento', 'Sensores', 'Apariencia', 'Operadores'], answer: 2 },
    { id: 'fs9', type: 'tf', question: 'El bloque Por siempre en Scratch crea un ciclo infinito.', answer: 'Verdadero' },
    { id: 'fs10', type: 'mc', question: 'Cuantos ejes existen en el escenario de Scratch?', options: ['1 (solo X)', '3 (X, Y, Z)', '2 (X e Y)', '4'], answer: 2 },
    { id: 'fs11', type: 'mc', question: 'Que bloque permite tomar decisiones en Scratch?', options: ['Mover pasos', 'Esperar segundos', 'Si...entonces', 'Cambiar fondo'], answer: 2 },
    { id: 'fs12', type: 'tf', question: 'En Scratch, los bloques de Variables son de color naranja.', answer: 'Verdadero' },
    { id: 'fs13', type: 'fill', question: 'Escribe el nombre del bloque para detectar si se presiono una tecla:', answer: 'tecla presionada' },
    { id: 'fs14', type: 'mc', question: 'Que bloque se usa para tocar un sonido en Scratch?', options: ['Cambiar volumen', 'Tocar sonido hasta el final', 'Iniciar sonido', 'Reproducir nota'], answer: 1 },
    { id: 'fs15', type: 'mc', question: 'Como se detiene completamente un programa en Scratch?', options: ['Presionar bandera verde', 'Usar bloque Detener todo', 'Cerrar el navegador', 'Eliminar el objeto'], answer: 1 },
  ]
};

export const quizData = quizzesByLanguage;