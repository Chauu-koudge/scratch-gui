/**
 * Show the selected board's name in the programming-mode start block, e.g.
 * "when Arduino Uno begin", "when Arduino Mega 2560 begin", "when ESP32 begin",
 * "when Micro:bit begin" instead of the generic "when Arduino begin".
 *
 * The blocks are defined in venago-blocks (blocks_vertical/device.js) and read their
 * text from ScratchBlocks.Msg when they are created. We wrap their init so the
 * generic word in that (possibly translated) text is replaced with the board name,
 * and relabel the blocks already in the workspace when the board changes.
 * Only the label changes; the generated code is the same.
 */

// block type -> [message key, generic word in the message]
const BEGIN_BLOCKS = {
    event_whenarduinobegin: ['EVENT_WHENARDUINOBEGIN', 'Arduino'],
    event_whenmicropythonbegin: ['EVENT_WHENMICROPYTHONBEGIN', 'MicroPython'],
    event_whenmicrobitbegin: ['EVENT_WHENMICROBITBEGIN', 'Microbit']
};

let boardName = null;

const relabel = (message, genericWord) => {
    if (!boardName || typeof message !== 'string') return message;
    const pattern = new RegExp(genericWord, 'i');
    if (pattern.test(message)) return message.replace(pattern, boardName);
    return `${message} (${boardName})`;
};

const patchBlockDefinitions = ScratchBlocks => {
    Object.keys(BEGIN_BLOCKS).forEach(type => {
        const definition = ScratchBlocks.Blocks[type];
        if (!definition || definition.venagoBoardNamePatched) return;
        const [key, genericWord] = BEGIN_BLOCKS[type];
        const originalInit = definition.init;
        definition.init = function () {
            const message = ScratchBlocks.Msg[key];
            ScratchBlocks.Msg[key] = relabel(message, genericWord);
            try {
                originalInit.call(this);
            } finally {
                ScratchBlocks.Msg[key] = message;
            }
        };
        definition.venagoBoardNamePatched = true;
    });
};

const relabelWorkspace = (ScratchBlocks, workspace) => {
    if (!workspace || typeof workspace.getAllBlocks !== 'function') return;
    workspace.getAllBlocks().forEach(block => {
        const entry = BEGIN_BLOCKS[block.type];
        if (!entry) return;
        const text = relabel(ScratchBlocks.Msg[entry[0]], entry[1]);
        block.inputList.forEach(input => {
            input.fieldRow.forEach(field => {
                if (field instanceof ScratchBlocks.FieldLabel && field.getText() !== text) {
                    field.setText(text);
                }
            });
        });
    });
};

/**
 * Set the board name shown in the start blocks.
 * @param {object} ScratchBlocks - the openblock-blocks instance used by the workspace.
 * @param {?string} name - board name, e.g. 'Arduino Uno'. Anything else keeps the generic text.
 * @param {?object} workspace - the main workspace, whose existing blocks are relabelled.
 */
const setBoardBeginName = (ScratchBlocks, name, workspace) => {
    if (!ScratchBlocks || !ScratchBlocks.Blocks) return;
    boardName = typeof name === 'string' && name.trim() ? name.trim() : null;
    patchBlockDefinitions(ScratchBlocks);
    relabelWorkspace(ScratchBlocks, workspace);
};

export default setBoardBeginName;
