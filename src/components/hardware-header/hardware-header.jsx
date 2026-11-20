import React from 'react';
import PropTypes from 'prop-types';
import Box from '../box/box.jsx';
import Button from '../button/button.jsx';
import classNames from 'classnames';
import {defineMessages, FormattedMessage, intlShape} from 'react-intl';

import {STAGE_DISPLAY_SIZES} from '../../lib/layout-constants';
import {getStageDimensions} from '../../lib/screen-utils.js';

import styles from './hardware-header.css';

import largeStageIcon from './icon--large-stage.svg';
import smallStageIcon from './icon--small-stage.svg';
import hideStageIcon from './icon--hide-stage.svg';
import uploadIcon from './icon--upload.svg';
import compileIcon from './icon--compile.svg';
import UndoRedo from '../../containers/undo-redo.jsx';

const messages = defineMessages({
    uploadMessage: {
        defaultMessage: 'Upload',
        description: 'Button to upload program',
        id: 'gui.hardwareHeader.upload'
    },
    compileMessage: {
        defaultMessage: 'Compile',
        description: 'Button to compile the generated Arduino program',
        id: 'gui.hardwareHeader.compile'
    },
    largeStageSizeMessage: {
        defaultMessage: 'Switch to large stage',
        description: 'Button to upload code to device alt',
        id: 'gui.stageHeader.codeStageSizeLarge'
    },
    smallStageSizeMessage: {
        defaultMessage: 'Switch to small stage',
        description: 'Button to change stage size to small',
        id: 'gui.stageHeader.codeStageSizeSmall'
    },
    hideStageSizeMessage: {
        defaultMessage: 'Hide stage',
        description: 'Button to hide stage',
        id: 'gui.stageHeader.hideStage'
    }
});

const HardwareHeaderComponent = props => {
    const {
        onSetStageLarge,
        onSetStageSmall,
        onSetStageHide,
        onCompile,
        onUpload,
        stageSize
    } = props;
    const stageDimensions = getStageDimensions(stageSize === STAGE_DISPLAY_SIZES.hide ?
        STAGE_DISPLAY_SIZES.small : stageSize, null);
    return (
        <Box
            className={classNames(
                styles.hardwareHeaderWrapper
            )}
            style={{width: stageDimensions.width + 2}}
        >
            <div className={styles.uploadGroup}>
                <UndoRedo className={styles.undoRedo} />
                {props.canCompile ? (
                    <button
                        aria-label={props.intl.formatMessage(messages.compileMessage)}
                        className={styles.compileButton}
                        disabled={props.compiling}
                        onClick={onCompile}
                        title={props.intl.formatMessage(messages.compileMessage)}
                        type="button"
                    >
                        <img
                            alt=""
                            className={styles.compileIcon}
                            draggable={false}
                            src={compileIcon}
                        />
                    </button>
                ) : null}
                <div
                    className={classNames(
                        styles.uploadButton,
                        props.compiling ? styles.uploadButtonDisabled : null
                    )}
                    onClick={props.compiling ? null : onUpload}
                    aria-disabled={props.compiling}
                >
                    <img
                        alt={props.intl.formatMessage(messages.uploadMessage)}
                        className={styles.uploadIcon}
                        draggable={false}
                        src={uploadIcon}
                    />
                    <FormattedMessage
                        defaultMessage="Upload"
                        description="Button to upload program"
                        id="gui.hardwareHeader.upload"
                    />
                </div>
            </div>
            <div className={styles.stageSizeToggleGroup}>
                <div>
                    <Button
                        className={classNames(
                            styles.stageButton,
                            styles.stageButtonFirst,
                            (stageSize === STAGE_DISPLAY_SIZES.small) ? null : styles.stageButtonToggledOff
                        )}
                        onClick={onSetStageSmall}
                    >
                        <img
                            alt={props.intl.formatMessage(messages.smallStageSizeMessage)}
                            className={styles.stageButtonIcon}
                            draggable={false}
                            src={smallStageIcon}
                        />
                    </Button>
                </div>
                <div>
                    <Button
                        className={classNames(
                            styles.stageButton,
                            styles.stageButtonLast,
                            (stageSize === STAGE_DISPLAY_SIZES.large) ? null : styles.stageButtonToggledOff
                        )}
                        onClick={onSetStageLarge}
                    >
                        <img
                            alt={props.intl.formatMessage(messages.largeStageSizeMessage)}
                            className={styles.stageButtonIcon}
                            draggable={false}
                            src={largeStageIcon}
                        />
                    </Button>
                </div>
            </div>
            <div className={styles.stageHideGroup}>
                <div>
                    <Button
                        className={classNames(
                            styles.stageButton,
                            (stageSize === STAGE_DISPLAY_SIZES.hide) ? null : styles.stageButtonToggledOff
                        )}
                        onClick={onSetStageHide}
                    >
                        <img
                            alt={props.intl.formatMessage(messages.hideStageSizeMessage)}
                            className={styles.stageButtonIcon}
                            draggable={false}
                            src={hideStageIcon}
                        />
                    </Button>
                </div>
            </div>
        </Box>
    );
};

HardwareHeaderComponent.propTypes = {
    intl: intlShape,
    canCompile: PropTypes.bool,
    compiling: PropTypes.bool,
    onCompile: PropTypes.func,
    onUpload: PropTypes.func.isRequired,
    onSetStageLarge: PropTypes.func.isRequired,
    onSetStageSmall: PropTypes.func.isRequired,
    onSetStageHide: PropTypes.func.isRequired,
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired
};

export default HardwareHeaderComponent;
