/**
 * Venago: PictoBlox-style tools in the full-screen stage header:
 *  - Record video of the stage (with the project's sounds, plus the microphone when it is on).
 *    Saves a .webm file when stopped (or when leaving full screen while recording).
 *  - Take a screenshot of the stage (saves a .png).
 *  - Microphone on / off (mixes your voice into the recording).
 *
 * Works for every board / project: it records the stage canvas, not the hardware.
 * Plain promises only (no async/await: the Babel setup has no regenerator runtime).
 */
import bindAll from 'lodash.bindall';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import VM from 'openblock-vm';

import downloadBlob from '../../lib/download-blob';
import styles from './stage-media-controls.css';

const messages = defineMessages({
    startRecording: {id: 'gui.venago.stageMedia.startRecording', defaultMessage: 'Start video recording',
        description: 'Full screen: start recording the stage'},
    stopRecording: {id: 'gui.venago.stageMedia.stopRecording', defaultMessage: 'Stop recording and save the video',
        description: 'Full screen: stop recording'},
    screenshot: {id: 'gui.venago.stageMedia.screenshot', defaultMessage: 'Take screenshot',
        description: 'Full screen: save a picture of the stage'},
    micOn: {id: 'gui.venago.stageMedia.micOn', defaultMessage: 'Microphone on (click to turn off)',
        description: 'Full screen: microphone is on'},
    micOff: {id: 'gui.venago.stageMedia.micOff', defaultMessage: 'Microphone off (click to turn on)',
        description: 'Full screen: microphone is off'},
    micDenied: {id: 'gui.venago.stageMedia.micDenied', defaultMessage: 'Microphone not available or permission denied',
        description: 'Full screen: microphone could not be opened'},
    recordingUnsupported: {id: 'gui.venago.stageMedia.recordingUnsupported',
        defaultMessage: 'Video recording is not supported in this browser', description: 'Full screen: no MediaRecorder'},
    saved: {id: 'gui.venago.stageMedia.saved', defaultMessage: 'Saved {file}', description: 'Full screen: file saved'}
});

const MIME_TYPES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];

const RecordIcon = () => (
    <svg
        height="18"
        viewBox="0 0 24 24"
        width="18"
    ><circle
            cx="12"
            cy="12"
            fill="#e5534b"
            r="7"
        /></svg>
);
const StopIcon = () => (
    <svg
        height="18"
        viewBox="0 0 24 24"
        width="18"
    ><rect
            fill="#e5534b"
            height="12"
            rx="2"
            width="12"
            x="6"
            y="6"
        /></svg>
);
const CameraIcon = () => (
    <svg
        height="20"
        viewBox="0 0 24 24"
        width="20"
    >
        <path
            d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
            fill="none"
            stroke="#575e75"
            strokeLinejoin="round"
            strokeWidth="1.8"
        />
        <circle
            cx="12"
            cy="13"
            fill="none"
            r="3.5"
            stroke="#575e75"
            strokeWidth="1.8"
        />
    </svg>
);
const MicIcon = ({on}) => (
    <svg
        height="20"
        viewBox="0 0 24 24"
        width="20"
    >
        <rect
            fill="none"
            height="11"
            rx="3"
            stroke={on ? '#2ea043' : '#575e75'}
            strokeWidth="1.8"
            width="6"
            x="9"
            y="3"
        />
        <path
            d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"
            fill="none"
            stroke={on ? '#2ea043' : '#575e75'}
            strokeLinecap="round"
            strokeWidth="1.8"
        />
        {on ? null : (
            <path
                d="M4 4l16 16"
                stroke="#e5534b"
                strokeLinecap="round"
                strokeWidth="2"
            />
        )}
    </svg>
);
MicIcon.propTypes = {on: PropTypes.bool};

const formatTime = seconds => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};

const safeName = title => (title || 'Venago Project').replace(/[\\/:*?"<>|]/g, '_').substring(0, 80);

// e.g. "2026-11-19 16-05-42", so every recording / screenshot gets its own file.
const timestamp = () => {
    const d = new Date();
    const p = n => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
};

class StageMediaControls extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, ['handleRecordClick', 'handleScreenshotClick', 'handleMicClick', 'handleRecorderStop', 'tick']);
        this.state = {recording: false, seconds: 0, micOn: false, message: null, flash: false};
        this.recorder = null;
        this.chunks = [];
        this.micStream = null;
        this.micSource = null;
        this.audioDestination = null;
    }
    componentWillUnmount () {
        // Leaving full screen while recording: stop and save the video.
        this.unmounted = true;
        if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop();
        this.stopMicrophone();
        clearInterval(this.timer);
        clearTimeout(this.messageTimer);
    }
    getAudio () {
        const engine = this.props.vm.runtime.audioEngine;
        return engine && engine.audioContext ? engine : null;
    }
    showMessage (message) {
        if (this.unmounted) return;
        this.setState({message});
        clearTimeout(this.messageTimer);
        this.messageTimer = setTimeout(() => {
            if (!this.unmounted) this.setState({message: null});
        }, 3000);
    }
    /* ---------------- microphone ---------------- */
    startMicrophone () {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return Promise.reject(new Error('no getUserMedia'));
        }
        return navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
            this.micStream = stream;
            this.connectMicToRecording();
            return stream;
        });
    }
    stopMicrophone () {
        if (this.micSource) {
            this.micSource.disconnect();
            this.micSource = null;
        }
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
            this.micStream = null;
        }
    }
    connectMicToRecording () {
        const audio = this.getAudio();
        if (!audio || !this.micStream || !this.audioDestination || this.micSource) return;
        this.micSource = audio.audioContext.createMediaStreamSource(this.micStream);
        this.micSource.connect(this.audioDestination);
    }
    handleMicClick () {
        if (this.state.micOn) {
            this.stopMicrophone();
            this.setState({micOn: false});
            return;
        }
        this.startMicrophone()
            .then(() => {
                if (!this.unmounted) this.setState({micOn: true});
            })
            .catch(() => this.showMessage(this.props.intl.formatMessage(messages.micDenied)));
    }
    /* ---------------- recording ---------------- */
    handleRecordClick () {
        if (this.state.recording) {
            this.recorder.stop();
            return;
        }
        const canvas = this.props.vm.renderer && this.props.vm.renderer.canvas;
        if (!canvas || !canvas.captureStream || typeof window.MediaRecorder === 'undefined') {
            this.showMessage(this.props.intl.formatMessage(messages.recordingUnsupported));
            return;
        }
        const tracks = canvas.captureStream(30).getVideoTracks();
        const audio = this.getAudio();
        if (audio) {
            if (audio.audioContext.state === 'suspended') audio.audioContext.resume();
            // Project sounds (and the microphone, when on) go into one audio track.
            this.audioDestination = audio.audioContext.createMediaStreamDestination();
            audio.inputNode.connect(this.audioDestination);
            this.connectMicToRecording();
            this.audioDestination.stream.getAudioTracks().forEach(track => tracks.push(track));
        }
        const mimeType = MIME_TYPES.find(type => window.MediaRecorder.isTypeSupported(type)) || '';
        this.chunks = [];
        this.recorder = new window.MediaRecorder(new window.MediaStream(tracks), mimeType ? {mimeType} : {});
        this.recorder.ondataavailable = e => {
            if (e.data && e.data.size > 0) this.chunks.push(e.data);
        };
        this.recorder.onstop = this.handleRecorderStop;
        this.recorder.start(1000);
        this.startedAt = Date.now();
        this.timer = setInterval(this.tick, 500);
        this.setState({recording: true, seconds: 0});
    }
    tick () {
        if (!this.unmounted) this.setState({seconds: Math.floor((Date.now() - this.startedAt) / 1000)});
    }
    handleRecorderStop () {
        clearInterval(this.timer);
        const audio = this.getAudio();
        if (audio && this.audioDestination) {
            try {
                audio.inputNode.disconnect(this.audioDestination);
            } catch (e) {
                // already disconnected
            }
        }
        if (this.micSource) {
            this.micSource.disconnect();
            this.micSource = null;
        }
        this.audioDestination = null;
        if (this.recorder && this.recorder.stream) this.recorder.stream.getVideoTracks().forEach(track => track.stop());
        const blob = new Blob(this.chunks, {type: 'video/webm'});
        this.chunks = [];
        const file = `${safeName(this.props.projectTitle)} recording ${timestamp()}.webm`;
        if (blob.size > 0) downloadBlob(file, blob);
        this.recorder = null;
        if (!this.unmounted) {
            this.setState({recording: false, seconds: 0});
            this.showMessage(this.props.intl.formatMessage(messages.saved, {file}));
        }
    }
    /* ---------------- screenshot ---------------- */
    handleScreenshotClick () {
        const renderer = this.props.vm.renderer;
        if (!renderer) return;
        renderer.requestSnapshot(dataURL => {
            fetch(dataURL)
                .then(response => response.blob())
                .then(blob => {
                    const file = `${safeName(this.props.projectTitle)} screenshot ${timestamp()}.png`;
                    downloadBlob(file, blob);
                    if (this.unmounted) return;
                    this.setState({flash: true});
                    setTimeout(() => {
                        if (!this.unmounted) this.setState({flash: false});
                    }, 250);
                    this.showMessage(this.props.intl.formatMessage(messages.saved, {file}));
                });
        });
        // Make sure a frame is drawn even if the project is not running.
        renderer.draw();
    }
    render () {
        const {intl} = this.props;
        const {recording, seconds, micOn, message, flash} = this.state;
        return (
            <div className={styles.mediaControls}>
                <button
                    aria-label={intl.formatMessage(recording ? messages.stopRecording : messages.startRecording)}
                    className={classNames(styles.button, {[styles.recording]: recording})}
                    title={intl.formatMessage(recording ? messages.stopRecording : messages.startRecording)}
                    type="button"
                    onClick={this.handleRecordClick}
                >
                    {recording ? <StopIcon /> : <RecordIcon />}
                    {recording ? <span className={styles.timer}>{formatTime(seconds)}</span> : null}
                </button>
                <button
                    aria-label={intl.formatMessage(messages.screenshot)}
                    className={classNames(styles.button, {[styles.flash]: flash})}
                    title={intl.formatMessage(messages.screenshot)}
                    type="button"
                    onClick={this.handleScreenshotClick}
                >
                    <CameraIcon />
                </button>
                <button
                    aria-label={intl.formatMessage(micOn ? messages.micOn : messages.micOff)}
                    aria-pressed={micOn}
                    className={classNames(styles.button, {[styles.micOn]: micOn})}
                    title={intl.formatMessage(micOn ? messages.micOn : messages.micOff)}
                    type="button"
                    onClick={this.handleMicClick}
                >
                    <MicIcon on={micOn} />
                </button>
                {message ? <div className={styles.message}>{message}</div> : null}
            </div>
        );
    }
}

StageMediaControls.propTypes = {
    intl: intlShape.isRequired,
    projectTitle: PropTypes.string,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => ({
    projectTitle: state.scratchGui.projectTitle
});

export default injectIntl(connect(mapStateToProps)(StageMediaControls));
