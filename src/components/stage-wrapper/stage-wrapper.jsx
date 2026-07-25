import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import VM from 'openblock-vm';

import Box from '../box/box.jsx';
import {STAGE_DISPLAY_SIZES} from '../../lib/layout-constants.js';
import StageHeader from '../../containers/stage-header.jsx';
import Stage from '../../containers/stage.jsx';
import Loader from '../loader/loader.jsx';

import styles from './stage-wrapper.css';

/* === Venago: first-load "Hi!" speech bubble over the cat === */
class HiBubble extends React.Component {
    constructor (props) {
        super(props);
        let show = false;
        try {
            if (!sessionStorage.getItem('venago-hi-shown')) {
                show = true;
                sessionStorage.setItem('venago-hi-shown', '1');
            }
        } catch (e) { /* sessionStorage may be unavailable */ }
        this.state = {show, fadingOut: false};
    }
    componentDidMount () {
        if (!this.state.show) return;
        this._fadeTimer = setTimeout(() => this.setState({fadingOut: true}), 2600);
        this._hideTimer = setTimeout(() => this.setState({show: false}), 3400);
    }
    componentWillUnmount () {
        clearTimeout(this._fadeTimer);
        clearTimeout(this._hideTimer);
    }
    render () {
        if (!this.state.show) return null;
        const wrapStyle = {
            position: 'absolute',
            top: '14%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            pointerEvents: 'none',
            opacity: this.state.fadingOut ? 0 : 1,
            transition: 'opacity 0.7s ease'
        };
        const bubbleStyle = {
            background: '#ffffff',
            color: '#48B0B0',
            fontFamily: "'Caveat', 'Comic Sans MS', cursive",
            fontWeight: 700,
            fontSize: '1.8rem',
            padding: '0.4rem 1.2rem',
            borderRadius: '20px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            border: '2px solid #48B0B0',
            position: 'relative',
            animation: 'venago-hi-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)'
        };
        const tailStyle = {
            position: 'absolute',
            bottom: '-9px',
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '14px',
            height: '14px',
            background: '#ffffff',
            borderRight: '2px solid #48B0B0',
            borderBottom: '2px solid #48B0B0'
        };
        return (
            <div style={wrapStyle}>
                <style>{'@keyframes venago-hi-pop { 0%{transform:scale(0.4);opacity:0} 60%{transform:scale(1.1);opacity:1} 100%{transform:scale(1);opacity:1} }'}</style>
                <div style={bubbleStyle}>
                    Hi! <span role="img" aria-label="wave">👋</span>
                    <div style={tailStyle} />
                </div>
            </div>
        );
    }
}

const StageWrapperComponent = function (props) {
    const {
        isFullScreen,
        isRtl,
        isRendererSupported,
        loading,
        stageSize,
        vm
    } = props;

    return (
        <Box
            className={classNames(
                styles.stageWrapper,
                {[styles.fullScreen]: isFullScreen}
            )}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            <Box className={styles.stageMenuWrapper}>
                <StageHeader
                    stageSize={stageSize}
                    vm={vm}
                />
            </Box>
            <Box className={styles.stageCanvasWrapper} style={{position: 'relative'}}>
                {
                    isRendererSupported ?
                        <Stage
                            stageSize={stageSize}
                            vm={vm}
                        /> :
                        null
                }
                {!loading && <HiBubble />}
            </Box>
            {loading ? (
                <Loader isFullScreen={isFullScreen} />
            ) : null}
        </Box>
    );
};

StageWrapperComponent.propTypes = {
    isFullScreen: PropTypes.bool,
    isRendererSupported: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    loading: PropTypes.bool,
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default StageWrapperComponent;
