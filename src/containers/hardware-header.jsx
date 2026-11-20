import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';

import {connect} from 'react-redux';
import {compose} from 'redux';
import {injectIntl} from 'react-intl';

import VM from 'openblock-vm';

import {setStageSize} from '../reducers/stage-size';
import {STAGE_SIZE_MODES, STAGE_DISPLAY_SIZES} from '../lib/layout-constants';
import {openUploadProgress} from '../reducers/modals';
import {showAlertWithTimeout} from '../reducers/alerts';

import HardwareHeaderComponent from '../components/hardware-header/hardware-header.jsx';

const prepareArduinoSerialOutput = code => {
    const digitalWritePattern = /digitalWrite\s*\(\s*([^,]+?)\s*,\s*(HIGH|LOW)\s*\)\s*;/gi;
    const hasDigitalWrite = digitalWritePattern.test(code);
    digitalWritePattern.lastIndex = 0;
    if (!hasDigitalWrite) {
        return {
            code: code,
            baudrate: null
        };
    }

    const serialBeginMatch = code.match(/\bSerial\.begin\s*\(\s*(\d+)\s*\)/i);
    const baudrate = serialBeginMatch ? parseInt(serialBeginMatch[1], 10) : 57600;
    let preparedCode = code.replace(digitalWritePattern, (statement, pin, level) => (
        `${statement}\n` +
        `Serial.print("PIN ");\n` +
        `Serial.print(${pin.trim()});\n` +
        `Serial.println(" -> LED ${level.toUpperCase() === 'HIGH' ? 'ON' : 'OFF'}");`
    ));

    if (!serialBeginMatch) {
        preparedCode = preparedCode.replace(
            /(void\s+setup\s*\(\s*\)\s*\{)/,
            `$1\n  Serial.begin(${baudrate});`
        );
    }

    return {
        code: preparedCode,
        baudrate: baudrate
    };
};

class HardwareHeader extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            compiling: false
        };
        bindAll(this, [
            'handleCompile',
            'handleUpload'
        ]);
    }

    handleCompile () {
        if (!this.props.vm.getPeripheralIsConnected(this.props.deviceId)) {
            this.props.onNoPeripheralIsConnected();
            return;
        }

        const blocklyBlockCanvas = document.querySelector('.blocklyWorkspace .blocklyBlockCanvas');
        if (!blocklyBlockCanvas || blocklyBlockCanvas.childNodes.length === 0) {
            this.props.onWorkspaceIsEmpty();
            return;
        }

        this.setState({compiling: true});
        this.props.vm.compileToPeripheral(this.props.deviceId, this.props.codeEditorValue)
            .then(() => this.setState({compiling: false}))
            .catch(() => {
                this.setState({compiling: false});
                this.props.onCompilationError();
            });
    }

    handleUpload () {
        if (this.props.vm.getPeripheralIsConnected(this.props.deviceId)) {
            const blocklyBlockCanvas = document.querySelector('.blocklyWorkspace .blocklyBlockCanvas');
            if (!blocklyBlockCanvas || blocklyBlockCanvas.childNodes.length === 0) {
                this.props.onWorkspaceIsEmpty();
            } else {
                const upload = this.props.deviceType === 'arduino' ?
                    prepareArduinoSerialOutput(this.props.codeEditorValue) :
                    {code: this.props.codeEditorValue, baudrate: null};
                this.props.vm.emit('PERIPHERAL_UPLOAD_STARTED', {
                    baudrate: upload.baudrate
                });
                this.props.vm.uploadToPeripheral(this.props.deviceId, upload.code);
                this.props.onOpenUploadProgress();
            }
        } else {
            this.props.onNoPeripheralIsConnected();
        }
    }

    render () {
        const {
            ...props
        } = this.props;
        return (
            <HardwareHeaderComponent
                canCompile={this.props.deviceType === 'arduino'}
                compiling={this.state.compiling}
                onCompile={this.handleCompile}
                onUpload={this.handleUpload}
                {...props}
            />
        );
    }
}

HardwareHeader.propTypes = {
    codeEditorValue: PropTypes.string,
    deviceId: PropTypes.string,
    deviceType: PropTypes.string,
    onCompilationError: PropTypes.func.isRequired,
    onNoPeripheralIsConnected: PropTypes.func.isRequired,
    onOpenUploadProgress: PropTypes.func,
    onWorkspaceIsEmpty: PropTypes.func.isRequired,
    peripheralName: PropTypes.string,
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => ({
    codeEditorValue: state.scratchGui.code.codeEditorValue,
    deviceId: state.scratchGui.device.deviceId,
    deviceType: state.scratchGui.device.deviceType,
    peripheralName: state.scratchGui.connectionModal.peripheralName
});

const mapDispatchToProps = dispatch => ({
    onNoPeripheralIsConnected: () => showAlertWithTimeout(dispatch, 'connectAPeripheralFirst'),
    onCompilationError: () => showAlertWithTimeout(dispatch, 'uploadError'),
    onSetStageLarge: () => dispatch(setStageSize(STAGE_SIZE_MODES.large)),
    onSetStageSmall: () => dispatch(setStageSize(STAGE_SIZE_MODES.small)),
    onSetStageHide: () => dispatch(setStageSize(STAGE_SIZE_MODES.hide)),
    onOpenUploadProgress: () => dispatch(openUploadProgress()),
    onWorkspaceIsEmpty: () => showAlertWithTimeout(dispatch, 'workspaceIsEmpty')
});

export default compose(
    injectIntl,
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(HardwareHeader);
