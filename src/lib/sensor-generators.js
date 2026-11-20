/**
 * Code generators for the shared Venago "Sensors" blocks
 * (block definitions: venago-vm/src/devices/common/sensor-blocks.js).
 *
 * These are registered at runtime instead of in venago-blocks/generators/,
 * because the GUI loads the precompiled arduino_compressed.js /
 * python_compressed.js and that bundle can only be rebuilt with Python 2.
 *
 * Arduino opcodes: arduino_sensor_<opcode>   (every Arduino-framework board)
 * micro:bit opcodes: microbit_sensor_<opcode> (MicroPython)
 */

const ADC_DEFINES = [
    '#ifndef VENAGO_ADC_MAX',
    '#if defined(ESP32)',
    '#define VENAGO_ADC_MAX 4095.0',
    '#define VENAGO_ADC_VREF 3.3',
    '#elif defined(ESP8266) || defined(ARDUINO_ARCH_RP2040) || defined(ARDUINO_ARCH_K210) || defined(K210)',
    '#define VENAGO_ADC_MAX 1023.0',
    '#define VENAGO_ADC_VREF 3.3',
    '#else',
    '#define VENAGO_ADC_MAX 1023.0',
    '#define VENAGO_ADC_VREF 5.0',
    '#endif',
    '#endif'
].join('\n');

const ULTRASONIC_FUNCTION = [
    'float venagoUltrasonicCm(int trigPin, int echoPin) {',
    '  pinMode(trigPin, OUTPUT);',
    '  pinMode(echoPin, INPUT);',
    '  digitalWrite(trigPin, LOW);',
    '  delayMicroseconds(2);',
    '  digitalWrite(trigPin, HIGH);',
    '  delayMicroseconds(10);',
    '  digitalWrite(trigPin, LOW);',
    '  unsigned long duration = pulseIn(echoPin, HIGH, 30000UL);',
    '  if (duration == 0) return -1.0;',
    '  return duration / 58.0;',
    '}'
].join('\n');

// Self-contained DHT11/DHT22 reader (no external library needed).
// Uses loop counting rather than micros(), so it is safe with interrupts disabled.
const DHT_FUNCTION = [
    'static uint32_t venagoDhtExpect(uint8_t pin, int level) {',
    '  uint32_t count = 0;',
    '  while (digitalRead(pin) == level) {',
    '    if (++count >= 100000UL) return 0;',
    '  }',
    '  return count;',
    '}',
    '',
    'float venagoReadDHT(uint8_t pin, uint8_t model, uint8_t humidity) {',
    '  static uint8_t lastPin = 255;',
    '  static uint8_t lastModel = 0;',
    '  static unsigned long lastTime = 0;',
    '  static float lastTemp = NAN;',
    '  static float lastHum = NAN;',
    '  // DHT sensors need ~2 s between conversions; reuse the last reading.',
    '  if (pin == lastPin && model == lastModel && lastTime != 0 && millis() - lastTime < 2000UL) {',
    '    return humidity ? lastHum : lastTemp;',
    '  }',
    '  uint8_t data[5] = {0, 0, 0, 0, 0};',
    '  uint32_t cycles[80];',
    '  pinMode(pin, INPUT_PULLUP);',
    '  delay(1);',
    '  pinMode(pin, OUTPUT);',
    '  digitalWrite(pin, LOW);',
    '  if (model == 11) delay(20); else delayMicroseconds(1100);',
    '  bool ok = true;',
    '  noInterrupts();',
    '  pinMode(pin, INPUT_PULLUP);',
    '  delayMicroseconds(55);',
    '  if (venagoDhtExpect(pin, LOW) == 0 || venagoDhtExpect(pin, HIGH) == 0) ok = false;',
    '  for (int i = 0; ok && i < 80; i += 2) {',
    '    cycles[i] = venagoDhtExpect(pin, LOW);',
    '    cycles[i + 1] = venagoDhtExpect(pin, HIGH);',
    '  }',
    '  interrupts();',
    '  lastPin = pin;',
    '  lastModel = model;',
    '  lastTime = millis();',
    '  if (!ok) { lastTemp = NAN; lastHum = NAN; return NAN; }',
    '  for (int i = 0; i < 40; i++) {',
    '    uint32_t low = cycles[2 * i];',
    '    uint32_t high = cycles[2 * i + 1];',
    '    if (low == 0 || high == 0) { lastTemp = NAN; lastHum = NAN; return NAN; }',
    '    data[i / 8] <<= 1;',
    '    if (high > low) data[i / 8] |= 1;',
    '  }',
    '  if (((data[0] + data[1] + data[2] + data[3]) & 0xFF) != data[4]) {',
    '    lastTemp = NAN; lastHum = NAN; return NAN;',
    '  }',
    '  if (model == 11) {',
    '    lastHum = data[0] + data[1] * 0.1;',
    '    lastTemp = data[2] + (data[3] & 0x7F) * 0.1;',
    '    if (data[3] & 0x80) lastTemp = -lastTemp;',
    '  } else {',
    '    lastHum = ((data[0] << 8) | data[1]) * 0.1;',
    '    lastTemp = (((data[2] & 0x7F) << 8) | data[3]) * 0.1;',
    '    if (data[2] & 0x80) lastTemp = -lastTemp;',
    '  }',
    '  return humidity ? lastHum : lastTemp;',
    '}'
].join('\n');

const LM35_FUNCTION = [
    'float venagoLm35Celsius(int pin) {',
    '  return analogRead(pin) * (VENAGO_ADC_VREF / VENAGO_ADC_MAX) * 100.0;',
    '}'
].join('\n');

const PY_ULTRASONIC_FUNCTION = [
    'def venago_ultrasonic_cm(trig, echo):',
    '    trig.write_digital(0)',
    '    utime.sleep_us(2)',
    '    trig.write_digital(1)',
    '    utime.sleep_us(10)',
    '    trig.write_digital(0)',
    '    echo.read_digital()',
    '    t = machine.time_pulse_us(echo, 1, 30000)',
    '    if t < 0:',
    '        return -1',
    '    return t / 58',
    ''
].join('\n');

// Pin level that means "detected" for each digital sensor in the dropdown.
// Keep in sync with DIGITAL_SENSORS in venago-vm/src/devices/common/sensor-blocks.js.
const DIGITAL_ACTIVE_LOW = ['ir', 'flame', 'rain'];

const registerArduino = Arduino => {
    const atomic = Arduino.ORDER_ATOMIC;
    const pinOf = (block, name, fallback) => block.getFieldValue(name) || fallback;

    Arduino.arduino_sensor_ultrasonicDistance = block => {
        Arduino.definitions_.venago_ultrasonic = ULTRASONIC_FUNCTION;
        const trig = pinOf(block, 'TRIG', '9');
        const echo = pinOf(block, 'ECHO', '8');
        return [`venagoUltrasonicCm(${trig}, ${echo})`, atomic];
    };

    Arduino.arduino_sensor_dhtReading = block => {
        Arduino.definitions_.venago_dht = DHT_FUNCTION;
        const pin = pinOf(block, 'PIN', '2');
        const model = pinOf(block, 'MODEL', '11') === '22' ? 22 : 11;
        const humidity = pinOf(block, 'READING', 'temperature') === 'humidity' ? 1 : 0;
        return [`venagoReadDHT(${pin}, ${model}, ${humidity})`, atomic];
    };

    Arduino.arduino_sensor_digitalSensor = block => {
        const pin = pinOf(block, 'PIN', '2');
        const level = DIGITAL_ACTIVE_LOW.includes(block.getFieldValue('SENSOR')) ? 'LOW' : 'HIGH';
        return [`(digitalRead(${pin}) == ${level})`, atomic];
    };

    Arduino.arduino_sensor_analogSensor = block => {
        const pin = pinOf(block, 'PIN', 'A0');
        if (block.getFieldValue('SENSOR') === 'lm35') {
            Arduino.definitions_.venago_adc = ADC_DEFINES;
            Arduino.definitions_.venago_lm35 = LM35_FUNCTION;
            return [`venagoLm35Celsius(${pin})`, atomic];
        }
        return [`analogRead(${pin})`, atomic];
    };
};

const registerPython = Python => {
    const atomic = Python.ORDER_ATOMIC;
    const pinName = (block, name) => `pin${block.getFieldValue(name) || '0'}`;
    const useMicrobit = () => {
        Python.imports_.microbit = 'from microbit import *';
    };


    Python.microbit_sensor_ultrasonicDistance = block => {
        useMicrobit();
        Python.imports_.machine = 'import machine';
        Python.imports_.utime = 'import utime';
        Python.libraries_.venago_ultrasonic = PY_ULTRASONIC_FUNCTION;
        return [`venago_ultrasonic_cm(${pinName(block, 'TRIG')}, ${pinName(block, 'ECHO')})`, atomic];
    };

    Python.microbit_sensor_digitalSensor = block => {
        useMicrobit();
        const level = DIGITAL_ACTIVE_LOW.includes(block.getFieldValue('SENSOR')) ? 0 : 1;
        return [`(${pinName(block, 'PIN')}.read_digital() == ${level})`, atomic];
    };

    Python.microbit_sensor_analogSensor = block => {
        useMicrobit();
        const read = `${pinName(block, 'PIN')}.read_analog()`;
        if (block.getFieldValue('SENSOR') === 'lm35') {
            return [`(${read} * 330 / 1023)`, atomic];
        }
        return [read, atomic];
    };
};

/**
 * Register the sensor generators on a ScratchBlocks instance. Safe to call repeatedly.
 * @param {object} ScratchBlocks - the openblock-blocks instance used by the workspace.
 * @return {object} the same ScratchBlocks instance.
 */
const registerSensorGenerators = ScratchBlocks => {
    if (!ScratchBlocks) return ScratchBlocks;
    if (ScratchBlocks.Arduino && !ScratchBlocks.Arduino.arduino_sensor_dhtReading) {
        registerArduino(ScratchBlocks.Arduino);
    }
    if (ScratchBlocks.Python && !ScratchBlocks.Python.microbit_sensor_ultrasonicDistance) {
        registerPython(ScratchBlocks.Python);
    }
    return ScratchBlocks;
};

export default registerSensorGenerators;
