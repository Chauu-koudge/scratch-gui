import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import UndoRedoComponent from '../components/undo-redo/undo-redo.jsx';
import {redo, subscribeUndo, undo} from '../lib/workspace-undo';

const messages = defineMessages({
    undo: {
        id: 'gui.venago.controls.undo',
        defaultMessage: 'Undo',
        description: 'Undo button title'
    },
    redo: {
        id: 'gui.venago.controls.redo',
        defaultMessage: 'Redo',
        description: 'Redo button title'
    }
});

/**
 * Undo / Redo buttons for the blocks workspace (beside the green flag / Upload button).
 */
class UndoRedo extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, ['handleUndo', 'handleRedo', 'handleStateChange']);
        this.state = {canUndo: false, canRedo: false};
    }
    componentDidMount () {
        this.unsubscribe = subscribeUndo(this.handleStateChange);
    }
    componentWillUnmount () {
        if (this.unsubscribe) this.unsubscribe();
    }
    handleStateChange (state) {
        if (state.canUndo !== this.state.canUndo || state.canRedo !== this.state.canRedo) {
            this.setState(state);
        }
    }
    handleUndo (e) {
        e.preventDefault();
        undo();
    }
    handleRedo (e) {
        e.preventDefault();
        redo();
    }
    render () {
        return (
            <UndoRedoComponent
                canRedo={this.state.canRedo}
                canUndo={this.state.canUndo}
                className={this.props.className}
                redoTitle={`${this.props.intl.formatMessage(messages.redo)} (Ctrl+Shift+Z)`}
                undoTitle={`${this.props.intl.formatMessage(messages.undo)} (Ctrl+Z)`}
                onRedo={this.handleRedo}
                onUndo={this.handleUndo}
            />
        );
    }
}

UndoRedo.propTypes = {
    className: PropTypes.string,
    intl: intlShape.isRequired
};

export default injectIntl(UndoRedo);
