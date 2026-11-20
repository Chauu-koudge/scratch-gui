/**
 * Code generators for the extra board categories
 * (block definitions: venago-vm/src/devices/common/board-extra-blocks.js).
 *
 * Arduino-framework boards (one generator for every board, the board-specific
 * parts are chosen by the C++ preprocessor):
 *  Serial   : arduino_serial_softSerial*     second serial port on any 2 pins
 *  Display  : arduino_display_ledMatrix*     MAX7219 8x8 LED matrix, 1 or 2 chained modules
 *  Wireless : arduino_wireless_*             HC-05 / HC-06 Bluetooth module
 *  Console  : arduino_console_consolePrint   serial monitor
 *
 *  The second serial port / Bluetooth port is
 *    SoftwareSerial   on AVR (Uno, Nano, Leonardo, Mega), ESP8266 and Uno R4,
 *    HardwareSerial   on ESP32 / ESP32-S3 (UART1 / UART2 on the chosen pins),
 *    SerialPIO        on Raspberry Pi Pico (any pins),
 *    Serial2/Serial3  on K210 (on the chosen pins).
 *
 * micro:bit (MicroPython):
 *  Serial   : microbit_serial_*   (uart)
 *  Data     : microbit_data_*
 *
 * Everything is self-contained, so no extra Arduino libraries need to be installed.
 * Registered at runtime for the same reason as sensor-generators.js.
 */

/* ------------------------------------------------------------ Serial ports */

const UART_PREAMBLE = [
    '#if !defined(ESP32) && !defined(ARDUINO_ARCH_RP2040) && !defined(K210)',
    '#include <SoftwareSerial.h>',
    '#endif',
    '#if defined(ARDUINO_ARCH_AVR) || defined(ESP8266)',
    '#define VENAGO_LISTEN(port) do { if (!(port).isListening()) (port).listen(); } while (0)',
    '#else',
    '#define VENAGO_LISTEN(port) do { } while (0)',
    '#endif',
    '#if defined(ARDUINO_ARCH_RENESAS)',
    '#define VENAGO_PORT_END(port) do { } while (0)',
    '#else',
    '#define VENAGO_PORT_END(port) (port).end()',
    '#endif'
].join('\n');

/**
 * Declare a serial port on the given pins, portable across the supported cores.
 * @param {string} name - C++ object name.
 * @param {string} beginMacro - name of the macro that starts the port: MACRO(baud).
 * @param {string} rx - RX pin.
 * @param {string} tx - TX pin.
 * @param {number} espUart - ESP32 UART number to use.
 * @param {string} k210Port - K210 hardware serial to use.
 * @return {string} C++ declaration.
 */
const uartDeclaration = (name, beginMacro, rx, tx, espUart, k210Port) => [
    '#if defined(ESP32)',
    `HardwareSerial ${name}(${espUart});`,
    `#define ${beginMacro}(baud) ${name}.begin(baud, SERIAL_8N1, ${rx}, ${tx})`,
    '#elif defined(ARDUINO_ARCH_RP2040)',
    `SerialPIO ${name}(${tx}, ${rx});`,
    `#define ${beginMacro}(baud) ${name}.begin(baud)`,
    '#elif defined(K210)',
    `#define ${name} ${k210Port}`,
    `#define ${beginMacro}(baud) ${name}.begin(baud, ${rx}, ${tx})`,
    '#else',
    `SoftwareSerial ${name}(${rx}, ${tx});`,
    `#define ${beginMacro}(baud) do { ${name}.begin(baud); VENAGO_LISTEN(${name}); } while (0)`,
    '#endif'
].join('\n');

const SOFT_SERIAL_FUNCTIONS = [
    'int venagoSoftSerialAvailable() {',
    '  VENAGO_LISTEN(venagoSerial);',
    '  return venagoSerial.available();',
    '}',
    '',
    'int venagoSoftSerialRead() {',
    '  VENAGO_LISTEN(venagoSerial);',
    '  return venagoSerial.read();',
    '}'
].join('\n');

const BT_FUNCTIONS = [
    'bool venagoBtIsOpen = false;',
    '',
    'void venagoBtOpen(long baud) {',
    '  VENAGO_BT_BEGIN(baud);',
    '  venagoBtIsOpen = true;',
    '}',
    '',
    '// The "open wireless communication" block must run first.',
    'bool venagoBtReady() {',
    '  if (!venagoBtIsOpen) return false;',
    '  VENAGO_LISTEN(venagoBt);',
    '  return true;',
    '}',
    '',
    'void venagoBtClose() {',
    '  if (!venagoBtIsOpen) return;',
    '  VENAGO_PORT_END(venagoBt);',
    '  venagoBtIsOpen = false;',
    '}',
    '',
    'void venagoBtReset() {',
    '  if (!venagoBtReady()) return;',
    '  while (venagoBt.available()) venagoBt.read();',
    '}',
    '',
    'void venagoBtSend(String message) {',
    '  if (venagoBtReady()) venagoBt.println(message);',
    '}',
    '',
    'bool venagoBtAvailable() {',
    '  return venagoBtReady() && venagoBt.available() > 0;',
    '}',
    '',
    '// Returns one line (without the line ending), or "" when nothing was received.',
    'String venagoBtReceive() {',
    '  String message = "";',
    '  if (!venagoBtReady() || !venagoBt.available()) return message;',
    '  unsigned long last = millis();',
    '  while (millis() - last < 50) {',
    '    while (venagoBt.available()) {',
    '      char c = venagoBt.read();',
    "      if (c == '\\n') return message;",
    "      if (c != '\\r') message += c;",
    '      last = millis();',
    '    }',
    '  }',
    '  return message;',
    '}'
].join('\n');

/* ------------------------------------------------------------- LED matrix */

// Classic 5x7 font, ASCII 32..126, 5 column bytes per character, bit 0 = top row.
const FONT_5X7 = [
    '00,00,00,00,00', '00,00,5F,00,00', '00,07,00,07,00', '14,7F,14,7F,14', '24,2A,7F,2A,12',
    '23,13,08,64,62', '36,49,55,22,50', '00,05,03,00,00', '00,1C,22,41,00', '00,41,22,1C,00',
    '08,2A,1C,2A,08', '08,08,3E,08,08', '00,50,30,00,00', '08,08,08,08,08', '00,60,60,00,00',
    '20,10,08,04,02', '3E,51,49,45,3E', '00,42,7F,40,00', '42,61,51,49,46', '21,41,45,4B,31',
    '18,14,12,7F,10', '27,45,45,45,39', '3C,4A,49,49,30', '01,71,09,05,03', '36,49,49,49,36',
    '06,49,49,29,1E', '00,36,36,00,00', '00,56,36,00,00', '08,14,22,41,00', '14,14,14,14,14',
    '00,41,22,14,08', '02,01,51,09,06', '32,49,79,41,3E', '7E,11,11,11,7E', '7F,49,49,49,36',
    '3E,41,41,41,22', '7F,41,41,22,1C', '7F,49,49,49,41', '7F,09,09,09,01', '3E,41,49,49,7A',
    '7F,08,08,08,7F', '00,41,7F,41,00', '20,40,41,3F,01', '7F,08,14,22,41', '7F,40,40,40,40',
    '7F,02,0C,02,7F', '7F,04,08,10,7F', '3E,41,41,41,3E', '7F,09,09,09,06', '3E,41,51,21,5E',
    '7F,09,19,29,46', '46,49,49,49,31', '01,01,7F,01,01', '3F,40,40,40,3F', '1F,20,40,20,1F',
    '3F,40,38,40,3F', '63,14,08,14,63', '07,08,70,08,07', '61,51,49,45,43', '00,7F,41,41,00',
    '02,04,08,10,20', '00,41,41,7F,00', '04,02,01,02,04', '40,40,40,40,40', '00,01,02,04,00',
    '20,54,54,54,78', '7F,48,44,44,38', '38,44,44,44,20', '38,44,44,48,7F', '38,54,54,54,18',
    '08,7E,09,01,02', '0C,52,52,52,3E', '7F,08,04,04,78', '00,44,7D,40,00', '20,40,44,3D,00',
    '7F,10,28,44,00', '00,41,7F,40,00', '7C,04,18,04,78', '7C,08,04,04,78', '38,44,44,44,38',
    '7C,14,14,14,08', '08,14,14,18,7C', '7C,08,04,04,08', '48,54,54,54,20', '04,3F,44,40,20',
    '3C,40,40,20,7C', '1C,20,40,20,1C', '3C,40,30,40,3C', '44,28,10,28,44', '0C,50,50,50,3C',
    '44,64,54,4C,44', '00,08,36,41,00', '00,00,7F,00,00', '00,41,36,08,00', '08,04,08,10,08'
];

const fontTable = () => {
    const lines = FONT_5X7.map(glyph => `  ${glyph.split(',').map(b => `0x${b}`).join(', ')},`);
    return [
        '#if defined(__AVR__)',
        '#include <avr/pgmspace.h>',
        '#define VENAGO_PROGMEM PROGMEM',
        '#define VENAGO_FONT_BYTE(p) pgm_read_byte(p)',
        '#else',
        '#define VENAGO_PROGMEM',
        '#define VENAGO_FONT_BYTE(p) (*(p))',
        '#endif',
        `const uint8_t venagoMxFont[] VENAGO_PROGMEM = {\n${lines.join('\n')}\n};`
    ].join('\n');
};

const matrixPins = (din, cs, clk) => [
    `#define VENAGO_MX_DIN ${din}`,
    `#define VENAGO_MX_CS ${cs}`,
    `#define VENAGO_MX_CLK ${clk}`
].join('\n');

// Columns 0-7 are on the module wired to the board, columns 8-15 on a second chained module.
const MATRIX_FUNCTIONS = () => [
    fontTable(),
    'uint16_t venagoMxRows[8] = {0, 0, 0, 0, 0, 0, 0, 0};',
    'bool venagoMxReady = false;',
    '',
    'void venagoMxSend(uint8_t reg, uint8_t secondModule, uint8_t firstModule) {',
    '  digitalWrite(VENAGO_MX_CS, LOW);',
    '  shiftOut(VENAGO_MX_DIN, VENAGO_MX_CLK, MSBFIRST, reg);',
    '  shiftOut(VENAGO_MX_DIN, VENAGO_MX_CLK, MSBFIRST, secondModule);',
    '  shiftOut(VENAGO_MX_DIN, VENAGO_MX_CLK, MSBFIRST, reg);',
    '  shiftOut(VENAGO_MX_DIN, VENAGO_MX_CLK, MSBFIRST, firstModule);',
    '  digitalWrite(VENAGO_MX_CS, HIGH);',
    '}',
    '',
    'void venagoMxRefresh() {',
    '  for (uint8_t r = 0; r < 8; r++) {',
    '    venagoMxSend(r + 1, venagoMxRows[r] & 0xFF, venagoMxRows[r] >> 8);',
    '  }',
    '}',
    '',
    'void venagoMxBegin() {',
    '  if (venagoMxReady) return;',
    '  venagoMxReady = true;',
    '  pinMode(VENAGO_MX_DIN, OUTPUT);',
    '  pinMode(VENAGO_MX_CS, OUTPUT);',
    '  pinMode(VENAGO_MX_CLK, OUTPUT);',
    '  digitalWrite(VENAGO_MX_CS, HIGH);',
    '  venagoMxSend(0x0F, 0, 0);  // display test off',
    '  venagoMxSend(0x09, 0, 0);  // no BCD decode',
    '  venagoMxSend(0x0B, 7, 7);  // scan all 8 rows',
    '  venagoMxSend(0x0A, 4, 4);  // brightness',
    '  venagoMxSend(0x0C, 1, 1);  // normal operation',
    '  venagoMxRefresh();',
    '}',
    '',
    'void venagoMxClear() {',
    '  venagoMxBegin();',
    '  for (uint8_t r = 0; r < 8; r++) venagoMxRows[r] = 0;',
    '  venagoMxRefresh();',
    '}',
    '',
    'void venagoMxBrightness(int value) {',
    '  venagoMxBegin();',
    '  value = constrain(value, 0, 15);',
    '  venagoMxSend(0x0A, value, value);',
    '}',
    '',
    'void venagoMxPixel(int x, int y, bool on) {',
    '  venagoMxBegin();',
    '  if (x < 0 || x > 15 || y < 0 || y > 7) return;',
    '  if (on) venagoMxRows[y] |= (0x8000 >> x);',
    '  else venagoMxRows[y] &= ~(0x8000 >> x);',
    '  venagoMxRefresh();',
    '}',
    '',
    '// image: 96 characters of 0/1, 8 rows x 12 columns',
    'void venagoMxImage(const char *image) {',
    '  venagoMxBegin();',
    '  if (strlen(image) < 96) return;',
    '  for (uint8_t r = 0; r < 8; r++) {',
    '    venagoMxRows[r] = 0;',
    '    for (uint8_t c = 0; c < 12; c++) {',
    "      if (image[r * 12 + c] == '1') venagoMxRows[r] |= (0x8000 >> c);",
    '    }',
    '  }',
    '  venagoMxRefresh();',
    '}',
    '',
    'void venagoMxScroll(String text) {',
    '  venagoMxBegin();',
    '  long total = (long)text.length() * 6;',
    '  for (long shift = -16; shift <= total; shift++) {',
    '    for (uint8_t r = 0; r < 8; r++) venagoMxRows[r] = 0;',
    '    for (uint8_t c = 0; c < 16; c++) {',
    '      long tc = shift + c;',
    '      if (tc < 0 || tc >= total || tc % 6 == 5) continue;',
    '      char ch = text.charAt(tc / 6);',
    "      if (ch < 32 || ch > 126) ch = '?';",
    '      uint8_t bits = VENAGO_FONT_BYTE(&venagoMxFont[(ch - 32) * 5 + (tc % 6)]);',
    '      for (uint8_t r = 0; r < 8; r++) {',
    '        if (bits & (1 << r)) venagoMxRows[r] |= (0x8000 >> c);',
    '      }',
    '    }',
    '    venagoMxRefresh();',
    '    delay(70);',
    '  }',
    '}'
].join('\n');

const IMAGE_PATTERN = /^[01]{96}$/;

// The bundled Servo library (1.1.8) has no Uno R4 (Renesas) support, so the pin category's
// servo block did not compile there. On Renesas, drive the servo with the core's hardware
// PwmOut (50 Hz); everywhere else keep the normal Servo library. Same API for both.
const SERVO_INCLUDE = [
    '#if defined(ARDUINO_ARCH_RENESAS)',
    '#include "pwm.h"',
    'class VenagoServo {',
    ' public:',
    '  void attach(int pin, int minUs, int maxUs) {',
    '    if (pwm_ == nullptr) {',
    '      pwm_ = new PwmOut(pin);',
    '      pwm_->begin((uint32_t)20000, (uint32_t)1500);',
    '    }',
    '    minUs_ = minUs;',
    '    maxUs_ = maxUs;',
    '  }',
    '  void write(int angle) {',
    '    if (pwm_ == nullptr) return;',
    '    angle = constrain(angle, 0, 180);',
    '    pwm_->pulseWidth_us(map(angle, 0, 180, minUs_, maxUs_));',
    '  }',
    ' private:',
    '  PwmOut *pwm_ = nullptr;',
    '  int minUs_ = 544;',
    '  int maxUs_ = 2400;',
    '};',
    '#define Servo VenagoServo',
    '#else',
    '#include <Servo.h>',
    '#endif'
].join('\n');

const registerArduino = Arduino => {
    const atomic = Arduino.ORDER_ATOMIC;

    /* ---- Servo (pin category): portable include ---- */
    const originalServo = Arduino.arduino_pin_setServoOutput;
    if (typeof originalServo === 'function') {
        Arduino.arduino_pin_setServoOutput = block => {
            const code = originalServo(block);
            Arduino.includes_.include_servo = SERVO_INCLUDE;
            return code;
        };
    }
    const field = (block, name, fallback) => block.getFieldValue(name) || fallback;
    const value = (block, name, fallback) =>
        Arduino.valueToCode(block, name, Arduino.ORDER_UNARY_POSTFIX) || fallback;

    /* ---- Fix: the "serial read a byte" block (opcode serialReadAByte on Uno, Nano,
     * Leonardo, Uno R4, ESP8266, ...) had no generator; the precompiled generators only
     * know the old name serialReadData. ---- */
    if (typeof Arduino.arduino_serial_serialReadAByte !== 'function') {
        Arduino.arduino_serial_serialReadAByte = () => ['Serial.read()', atomic];
    }

    /* ---- Second serial port ---- */
    const useSoftSerial = (block, force) => {
        Arduino.includes_.venago_uart = UART_PREAMBLE;
        if (force || !Arduino.definitions_.venago_soft_serial_port) {
            Arduino.definitions_.venago_soft_serial_port = uartDeclaration('venagoSerial', 'VENAGO_SERIAL_BEGIN',
                field(block, 'RX', '10'), field(block, 'TX', '11'), 1, 'Serial2');
        }
        Arduino.definitions_.venago_soft_serial = SOFT_SERIAL_FUNCTIONS;
    };

    Arduino.arduino_serial_softSerialBegin = block => {
        useSoftSerial(block, true);
        return `VENAGO_SERIAL_BEGIN(${field(block, 'VALUE', '9600')});\n`;
    };

    Arduino.arduino_serial_softSerialPrint = block => {
        useSoftSerial(block, false);
        const text = value(block, 'VALUE', '""');
        const fn = field(block, 'EOL', 'warp') === 'warp' ? 'println' : 'print';
        return `venagoSerial.${fn}(${text});\n`;
    };

    Arduino.arduino_serial_softSerialAvailable = block => {
        useSoftSerial(block, false);
        return ['venagoSoftSerialAvailable()', atomic];
    };

    Arduino.arduino_serial_softSerialReadAByte = block => {
        useSoftSerial(block, false);
        return ['venagoSoftSerialRead()', atomic];
    };

    /* ---- LED matrix display ---- */
    const useMatrix = (block, force) => {
        if (force || !Arduino.definitions_.venago_matrix_pins) {
            Arduino.definitions_.venago_matrix_pins = matrixPins(
                field(block, 'DIN', '12'), field(block, 'CS', '10'), field(block, 'CLK', '11'));
        }
        Arduino.definitions_.venago_matrix = MATRIX_FUNCTIONS();
    };
    const imageArg = code => {
        const text = String(code).replace(/^"|"$/g, '');
        if (IMAGE_PATTERN.test(text)) return `"${text}"`;
        return `String(${code}).c_str()`;
    };

    Arduino.arduino_display_ledMatrixSetup = block => {
        useMatrix(block, true);
        return 'venagoMxBegin();\n';
    };

    Arduino.arduino_display_ledMatrixShowImage = block => {
        useMatrix(block, false);
        return `venagoMxImage(${imageArg(value(block, 'VALUE', '0'))});\n`;
    };

    Arduino.arduino_display_ledMatrixShowImageFor = block => {
        useMatrix(block, false);
        const time = value(block, 'TIME', '1');
        return `venagoMxImage(${imageArg(value(block, 'VALUE', '0'))});\n` +
            `delay((${time}) * 1000);\nvenagoMxClear();\n`;
    };

    Arduino.arduino_display_ledMatrixScrollText = block => {
        useMatrix(block, false);
        return `venagoMxScroll(String(${value(block, 'TEXT', '""')}));\n`;
    };

    Arduino.arduino_display_ledMatrixClear = block => {
        useMatrix(block, false);
        return 'venagoMxClear();\n';
    };

    Arduino.arduino_display_ledMatrixLightPixel = block => {
        useMatrix(block, false);
        const on = field(block, 'STATE', '1') === '0' ? 'false' : 'true';
        return `venagoMxPixel(${value(block, 'X', '0')}, ${value(block, 'Y', '0')}, ${on});\n`;
    };

    Arduino.arduino_display_ledMatrixBrightness = block => {
        useMatrix(block, false);
        return `venagoMxBrightness(${value(block, 'VALUE', '4')});\n`;
    };

    /* ---- Wireless (Bluetooth module) ---- */
    const useBluetooth = (block, force) => {
        Arduino.includes_.venago_uart = UART_PREAMBLE;
        if (force || !Arduino.definitions_.venago_bt_port) {
            Arduino.definitions_.venago_bt_port = uartDeclaration('venagoBt', 'VENAGO_BT_BEGIN',
                field(block, 'RX', '2'), field(block, 'TX', '3'), 2, 'Serial3');
        }
        Arduino.definitions_.venago_bt = BT_FUNCTIONS;
    };

    Arduino.arduino_wireless_openWireless = block => {
        useBluetooth(block, true);
        return `venagoBtOpen(${field(block, 'BAUD', '9600')});\n`;
    };

    Arduino.arduino_wireless_closeWireless = block => {
        useBluetooth(block, false);
        return 'venagoBtClose();\n';
    };

    Arduino.arduino_wireless_resetWireless = block => {
        useBluetooth(block, false);
        return 'venagoBtReset();\n';
    };

    Arduino.arduino_wireless_sendWirelessMessage = block => {
        useBluetooth(block, false);
        return `venagoBtSend(String(${value(block, 'TEXT', '""')}));\n`;
    };

    Arduino.arduino_wireless_wirelessMessageAvailable = block => {
        useBluetooth(block, false);
        return ['venagoBtAvailable()', atomic];
    };

    Arduino.arduino_wireless_receiveWirelessMessage = block => {
        useBluetooth(block, false);
        return ['venagoBtReceive()', atomic];
    };

    /* ---- Console ---- */
    Arduino.arduino_console_consolePrint = block => {
        Arduino.setups_.venago_console = 'Serial.begin(9600);';
        return `Serial.println(${value(block, 'TEXT', '""')});\n`;
    };
};

/* ------------------------------------------------------- micro:bit (Python) */

const PY_DATA_FUNCTIONS = [
    'def venago_map(value, from_low, from_high, to_low, to_high):',
    '    if from_high == from_low:',
    '        return to_low',
    '    return int((value - from_low) * (to_high - to_low) / (from_high - from_low) + to_low)',
    '',
    'def venago_to_number(value, decimal):',
    '    try:',
    '        number = float(value)',
    '    except (ValueError, TypeError):',
    '        return 0',
    '    return number if decimal else int(number)',
    ''
].join('\n');

const registerPython = Python => {
    const atomic = Python.ORDER_ATOMIC;
    const none = typeof Python.ORDER_NONE === 'number' ? Python.ORDER_NONE : 99;
    const value = (block, name, fallback) => Python.valueToCode(block, name, none) || fallback;
    const useMicrobit = () => {
        Python.imports_.microbit = 'from microbit import *';
    };
    const useData = () => {
        Python.libraries_.venago_data = PY_DATA_FUNCTIONS;
    };

    /* ---- Fix: "calibrate compass" is a statement block, but its original generator
     * returned a [code, order] pair, which printed "compass.calibrate()" with no newline
     * (joined to the next line) and a stray ",0" in the program. ---- */
    Python.microbit_sensor_calibrateCompass = () => {
        useMicrobit();
        return 'compass.calibrate()\n';
    };

    /* ---- Serial ---- */
    Python.microbit_serial_serialBegin = block => {
        useMicrobit();
        return `uart.init(baudrate=${block.getFieldValue('VALUE') || '115200'})\n`;
    };

    Python.microbit_serial_serialBeginPins = block => {
        useMicrobit();
        const rx = block.getFieldValue('RX') || '1';
        const tx = block.getFieldValue('TX') || '0';
        const baud = block.getFieldValue('VALUE') || '9600';
        return `uart.init(baudrate=${baud}, tx=pin${tx}, rx=pin${rx})\n`;
    };

    Python.microbit_serial_serialPrint = block => {
        useMicrobit();
        const text = value(block, 'VALUE', '""');
        const eol = block.getFieldValue('EOL') === 'noWarp' ? '' : ' + "\\r\\n"';
        return `uart.write(str(${text})${eol})\n`;
    };

    Python.microbit_serial_serialAvailable = () => {
        useMicrobit();
        return ['uart.any()', atomic];
    };

    Python.microbit_serial_serialReadAByte = () => {
        useMicrobit();
        return ['((uart.read(1) or b"\\xff")[0] if uart.any() else -1)', atomic];
    };

    /* ---- Data ---- */
    Python.microbit_data_dataMap = block => {
        useData();
        const args = ['DATA', 'ARG0', 'ARG1', 'ARG2', 'ARG3'].map(name => value(block, name, '0'));
        return [`venago_map(${args.join(', ')})`, atomic];
    };

    Python.microbit_data_dataConstrain = block => {
        const data = value(block, 'DATA', '0');
        const low = value(block, 'ARG0', '0');
        const high = value(block, 'ARG1', '0');
        return [`min(max(${data}, min(${low}, ${high})), max(${low}, ${high}))`, atomic];
    };

    Python.microbit_data_dataConvert = block => {
        const data = value(block, 'DATA', '0');
        switch (block.getFieldValue('TYPE')) {
        case 'DECIMAL':
            useData();
            return [`venago_to_number(${data}, True)`, atomic];
        case 'STRING':
            return [`str(${data})`, atomic];
        default:
            useData();
            return [`venago_to_number(${data}, False)`, atomic];
        }
    };

    Python.microbit_data_dataConvertASCIICharacter = block =>
        [`chr(int(${value(block, 'DATA', '0')}))`, atomic];

    Python.microbit_data_dataConvertASCIINumber = block =>
        [`ord(str(${value(block, 'DATA', '" "')})[0])`, atomic];
};

/**
 * Register the generators on a ScratchBlocks instance. Safe to call repeatedly.
 * @param {object} ScratchBlocks - the openblock-blocks instance used by the workspace.
 * @return {object} the same ScratchBlocks instance.
 */
const registerBoardExtraGenerators = ScratchBlocks => {
    if (!ScratchBlocks) return ScratchBlocks;
    if (ScratchBlocks.Arduino && !ScratchBlocks.Arduino.arduino_console_consolePrint) {
        registerArduino(ScratchBlocks.Arduino);
    }
    if (ScratchBlocks.Python && !ScratchBlocks.Python.microbit_data_dataMap) {
        registerPython(ScratchBlocks.Python);
    }
    return ScratchBlocks;
};

export default registerBoardExtraGenerators;
