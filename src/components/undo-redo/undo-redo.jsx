import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import undoIcon from './icon--undo.svg';
import redoIcon from './icon--redo.svg';
import styles from './undo-redo.css';

/**
 * Undo / Redo buttons shown beside the green flag and stop buttons (like PictoBlox).
 * @param {object} props - component props.
 * @return {React.Element} the buttons.
 */
const UndoRedoComponent = function (props) {
    const {canUndo, canRedo, className, onRedo, onUndo, redoTitle, undoTitle} = props;
    return (
        <div className={classNames(styles.undoRedo, className)}>
            <button
                aria-label={undoTitle}
                className={classNames(styles.button, {[styles.disabled]: !canUndo})}
                disabled={!canUndo}
                title={undoTitle}
                type="button"
                onClick={onUndo}
            >
                <img
                    alt=""
                    className={styles.icon}
                    draggable={false}
                    src={undoIcon}
                />
            </button>
            <button
                aria-label={redoTitle}
                className={classNames(styles.button, {[styles.disabled]: !canRedo})}
                disabled={!canRedo}
                title={redoTitle}
                type="button"
                onClick={onRedo}
            >
                <img
                    alt=""
                    className={styles.icon}
                    draggable={false}
                    src={redoIcon}
                />
            </button>
        </div>
    );
};

UndoRedoComponent.propTypes = {
    canRedo: PropTypes.bool,
    canUndo: PropTypes.bool,
    className: PropTypes.string,
    onRedo: PropTypes.func.isRequired,
    onUndo: PropTypes.func.isRequired,
    redoTitle: PropTypes.string,
    undoTitle: PropTypes.string
};

UndoRedoComponent.defaultProps = {
    canRedo: false,
    canUndo: false,
    redoTitle: 'Redo',
    undoTitle: 'Undo'
};

export default UndoRedoComponent;
