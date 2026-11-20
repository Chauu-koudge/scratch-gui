/**
 * Venago: open the menu bar's connection dropdown from anywhere (board selected,
 * a category's status button, "Reconnect" in a connection-lost alert), instead of
 * the old connection window.
 */
const listeners = new Set();

/** Ask the menu bar to open the connection dropdown. */
const requestOpenConnectionMenu = () => {
    listeners.forEach(listener => listener());
};

/**
 * @param {function} listener - called when the dropdown should open.
 * @return {function} call to unsubscribe.
 */
const onOpenConnectionMenuRequest = listener => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export {
    requestOpenConnectionMenu,
    onOpenConnectionMenuRequest
};
