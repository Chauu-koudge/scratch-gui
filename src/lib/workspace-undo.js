/**
 * Venago: shared Undo / Redo for the blocks workspace, used by the Undo / Redo buttons
 * beside the green flag (Stage mode) and the Upload button (programming mode).
 *
 * The blocks workspace (containers/blocks.jsx) registers itself here; the buttons call
 * undo() / redo() and subscribe() to know when they are enabled. Undo / redo use
 * openblock-blocks' own undo stack, so the VM stays in sync through the normal block
 * events, exactly like Ctrl+Z / Ctrl+Shift+Z in the workspace.
 */

/**
 * Events that must never be part of the undo history. openblock-blocks fires
 * "toolBoxFinish" on the main workspace every time the palette is refreshed (after
 * almost every change) and records it as undoable. That put an invisible step on top
 * of the history (one Undo click undid "nothing" and switched to Redo) and, because a
 * newly recorded event clears the redo list, it also wiped Redo after each Undo.
 */
const NOT_UNDOABLE_EVENTS = ['toolBoxFinish'];

let workspace = null;
let changeListener = null;
const subscribers = new Set();
let notifyTimer = null;

const getState = () => ({
    canUndo: !!(workspace && workspace.undoStack_ && workspace.undoStack_.length > 0),
    canRedo: !!(workspace && workspace.redoStack_ && workspace.redoStack_.length > 0)
});

const notify = () => {
    const state = getState();
    subscribers.forEach(callback => callback(state));
};

// Block events are fired asynchronously, so check again once they have been recorded.
const notifySoon = () => {
    notify();
    if (notifyTimer) clearTimeout(notifyTimer);
    notifyTimer = setTimeout(() => {
        notifyTimer = null;
        notify();
    }, 50);
};

/**
 * Register the main blocks workspace (call again whenever it is recreated).
 * @param {?Blockly.WorkspaceSvg} newWorkspace - the main workspace, or null to detach.
 */
const setUndoWorkspace = newWorkspace => {
    if (workspace === newWorkspace) return;
    if (workspace && changeListener) workspace.removeChangeListener(changeListener);
    workspace = newWorkspace;
    changeListener = null;
    if (workspace) {
        if (!workspace.venagoUndoFilterInstalled) {
            const fireChangeListener = workspace.fireChangeListener.bind(workspace);
            workspace.fireChangeListener = event => {
                if (event && NOT_UNDOABLE_EVENTS.includes(event.type)) event.recordUndo = false;
                return fireChangeListener(event);
            };
            workspace.venagoUndoFilterInstalled = true;
            const keep = event => !NOT_UNDOABLE_EVENTS.includes(event.type);
            if (workspace.undoStack_) workspace.undoStack_ = workspace.undoStack_.filter(keep);
            if (workspace.redoStack_) workspace.redoStack_ = workspace.redoStack_.filter(keep);
        }
        changeListener = () => notifySoon();
        workspace.addChangeListener(changeListener);
        // Switching sprites / loading a project clears the undo history.
        if (!workspace.venagoClearUndoWrapped) {
            const clearUndo = workspace.clearUndo.bind(workspace);
            workspace.clearUndo = () => {
                clearUndo();
                notifySoon();
            };
            workspace.venagoClearUndoWrapped = true;
        }
    }
    notifySoon();
};

/** Undo the last block change. */
const undo = () => {
    if (!workspace || !getState().canUndo) return;
    workspace.undo(false);
    notifySoon();
};

/** Redo the last undone block change. */
const redo = () => {
    if (!workspace || !getState().canRedo) return;
    workspace.undo(true);
    notifySoon();
};

/**
 * Listen for changes of the undo / redo availability.
 * @param {function({canUndo: boolean, canRedo: boolean})} callback - called with the new state.
 * @return {function} call to unsubscribe.
 */
const subscribeUndo = callback => {
    subscribers.add(callback);
    callback(getState());
    return () => subscribers.delete(callback);
};

export {
    setUndoWorkspace,
    subscribeUndo,
    undo,
    redo
};
