/**
 * Venago: generate the programming-mode (upload) code from every block the user has
 * placed, not only from blocks snapped under the "when <board> begin" hat.
 *
 * The original generators (venago-blocks generators/arduino.js and python.js) skip any
 * stack that is not under the board's begin hat, so blocks dragged in Stage mode (or
 * dropped loose in programming mode) produced only "#include <Arduino.h>". Blocks that
 * have no generator at all (Stage-only blocks such as motion / looks) made the whole
 * generation fail.
 *
 * We generate from a headless copy of the workspace (the user's workspace is never
 * changed) in which:
 *  - stacks under "when green flag clicked" and loose stacks are joined, in their
 *    on-screen order, under one begin hat (one is created if there is none);
 *  - when several stacks end with a "forever" loop, their loop bodies are merged into
 *    a single forever, which becomes the Arduino loop() / micro:bit main loop;
 *  - stacks under other Stage-only hats (key pressed, sprite clicked, ...) are left
 *    out and listed in a comment;
 *  - a block that has no code generator becomes a comment instead of an error.
 */

/** Hats that mean "start of the program" in Stage mode. */
const STAGE_START_HATS = ['event_whenflagclicked'];

/** Begin hat for each generator / device type. */
const beginHatFor = (generatorName, deviceType) => {
    if (generatorName === 'Arduino') return 'event_whenarduinobegin';
    if (deviceType === 'microPython') return 'event_whenmicropythonbegin';
    return 'event_whenmicrobitbegin';
};

const lastInStack = block => {
    let last = block;
    while (last.getNextBlock()) last = last.getNextBlock();
    return last;
};

/**
 * Split a stack into the part before a final "forever" block and that forever block.
 * @param {Blockly.Block} top - first block of the stack (already unplugged).
 * @return {{body: ?Blockly.Block, forever: ?Blockly.Block}} the two parts, detached.
 */
const splitForever = top => {
    const last = lastInStack(top);
    if (last.type !== 'control_forever') return {body: top, forever: null};
    if (last === top) return {body: null, forever: top};
    last.unplug(false);
    return {body: top, forever: last};
};

/**
 * Append the blocks inside `from`'s forever to the end of `into`'s forever.
 * @param {Blockly.Block} into - the forever that is kept.
 * @param {Blockly.Block} from - a forever whose body is moved.
 * @return {boolean} true if merged.
 */
const mergeForever = (into, from) => {
    const fromInput = from.getInput('SUBSTACK');
    const intoInput = into.getInput('SUBSTACK');
    if (!fromInput || !intoInput) return false;
    const moving = fromInput.connection.targetBlock();
    if (!moving) return true;
    const existing = intoInput.connection.targetBlock();
    const tail = existing ? lastInStack(existing) : null;
    if (tail && !tail.nextConnection) return false;
    fromInput.connection.disconnect();
    if (tail) {
        tail.nextConnection.connect(moving.previousConnection);
    } else {
        intoInput.connection.connect(moving.previousConnection);
    }
    return true;
};

/**
 * Join the given stacks, in order, under `hat`.
 * @param {Blockly.Block} hat - begin hat.
 * @param {Array.<Blockly.Block>} stacks - first blocks of the stacks, already unplugged.
 */
const joinUnderHat = (hat, stacks) => {
    const bodies = [];
    let forever = null;
    stacks.forEach(top => {
        const parts = splitForever(top);
        if (parts.body) bodies.push(parts.body);
        if (parts.forever) {
            if (!forever) {
                forever = parts.forever;
            } else if (!mergeForever(forever, parts.forever)) {
                // Could not merge (e.g. nested forever at the end): keep it as a separate step.
                bodies.push(parts.forever);
            }
        }
    });
    if (forever) bodies.push(forever);

    let tail = hat;
    bodies.forEach(top => {
        if (tail.nextConnection && top.previousConnection) {
            tail.nextConnection.connect(top.previousConnection);
            tail = lastInStack(top);
        }
    });
};

const isHat = block => !block.previousConnection && !block.outputConnection && !!block.nextConnection;

/**
 * Build the program in a headless copy of the workspace.
 * @param {object} ScratchBlocks - the openblock-blocks instance.
 * @param {object} generator - ScratchBlocks.Arduino or ScratchBlocks.Python.
 * @param {string} beginType - begin hat block type.
 * @param {Blockly.Workspace} copy - headless workspace with the user's blocks.
 * @return {Array.<string>} block types of Stage-only hat stacks that were left out.
 */
const prepareProgram = (ScratchBlocks, generator, beginType, copy) => {
    const skippedHats = [];
    const begins = [];
    const stacks = [];

    copy.getTopBlocks(true).forEach(block => {
        if (block.type === beginType) {
            begins.push(block);
        } else if (STAGE_START_HATS.includes(block.type)) {
            const next = block.getNextBlock();
            if (next) {
                next.unplug(false);
                stacks.push(next);
            }
            block.dispose(false);
        } else if (isHat(block)) {
            // Other hats keep working if the board has a generator for them
            // (e.g. micro:bit "when button pressed", custom block definitions).
            if (typeof generator[block.type] !== 'function') {
                skippedHats.push(block.type);
                block.dispose(false);
            }
        } else if (block.previousConnection && !block.outputConnection) {
            stacks.push(block); // a loose stack of command blocks
        }
    });

    if (begins.length === 0 && stacks.length === 0) return skippedHats;

    const hat = begins.length > 0 ? begins[0] : copy.newBlock(beginType);
    const ordered = [];
    begins.forEach(begin => {
        const next = begin.getNextBlock();
        if (next) {
            next.unplug(false);
            ordered.push(next);
        }
        if (begin !== hat) begin.dispose(false);
    });
    joinUnderHat(hat, ordered.concat(stacks));
    return skippedHats;
};

/**
 * Give every block type without a generator a fallback that emits a comment.
 * @param {object} generator - ScratchBlocks.Arduino or ScratchBlocks.Python.
 * @param {Blockly.Workspace} copy - workspace to scan.
 * @param {string} commentPrefix - '//' or '#'.
 * @return {Array.<string>} block types that got a fallback (to remove afterwards).
 */
const addFallbackGenerators = (generator, copy, commentPrefix) => {
    const added = [];
    copy.getAllBlocks().forEach(block => {
        if (typeof generator[block.type] === 'function' || added.includes(block.type)) return;
        added.push(block.type);
        generator[block.type] = b => {
            if (b.outputConnection) {
                // Arduino can show an inline comment; Python cannot.
                const value = commentPrefix === '//' ? `0 /* "${b.type}" not available in Upload mode */` : '0';
                return [value, generator.ORDER_ATOMIC];
            }
            return `${commentPrefix} "${b.type}" block is not available in Upload mode\n`;
        };
    });
    return added;
};

/**
 * Generate the upload-mode program for a workspace.
 * @param {object} ScratchBlocks - the openblock-blocks instance used by the workspace.
 * @param {string} generatorName - 'Arduino' or 'Python'.
 * @param {Blockly.Workspace} workspace - the user's workspace (not modified).
 * @param {string} deviceType - device type, e.g. 'arduino', 'microbit', 'microPython'.
 * @return {string} generated code.
 */
const generateProgramCode = (ScratchBlocks, generatorName, workspace, deviceType) => {
    const generator = ScratchBlocks[generatorName];
    if (!generator) throw new Error(`No code generator for "${generatorName}"`);

    const commentPrefix = generatorName === 'Python' ? '#' : '//';
    const dom = ScratchBlocks.Xml.workspaceToDom(workspace);
    // Building the copy must not touch the user's undo history: keep events off while we
    // work (always paired with enable() below) and restore the current event group after.
    const eventGroup = ScratchBlocks.Events.getGroup();
    ScratchBlocks.Events.disable();
    const copy = new ScratchBlocks.Workspace({});
    let fallbacks = [];
    try {
        ScratchBlocks.Xml.domToWorkspace(dom, copy);
        const skippedHats = prepareProgram(ScratchBlocks, generator, beginHatFor(generatorName, deviceType), copy);
        fallbacks = addFallbackGenerators(generator, copy, commentPrefix);
        let code = generator.workspaceToCode(copy);
        if (skippedHats.length > 0) {
            const unique = skippedHats.filter((type, index) => skippedHats.indexOf(type) === index);
            const note = `${commentPrefix} Not used in Upload mode (Stage-only start blocks): ${unique.join(', ')}\n`;
            const firstLineEnd = code.indexOf('\n');
            code = firstLineEnd === -1 ? note + code :
                code.slice(0, firstLineEnd + 1) + note + code.slice(firstLineEnd + 1);
        }
        return code;
    } finally {
        fallbacks.forEach(type => {
            delete generator[type];
        });
        copy.dispose();
        ScratchBlocks.Events.enable();
        ScratchBlocks.Events.setGroup(eventGroup);
    }
};

export default generateProgramCode;
