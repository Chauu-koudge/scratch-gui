import React from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';
import styles from './loader.css';
import PropTypes from 'prop-types';

/* Venago: cat loader (replaces topBlock/middleBlock/bottomBlock animation) */
const VenagoCatLoader = () => (
    <svg
        viewBox="0 0 186 160"
        xmlns="http://www.w3.org/2000/svg"
        style={{stroke: 'none', strokeLinejoin: 'round', strokeLinecap: 'round', width: '11rem', height: 'auto', display: 'block', margin: '0 auto'}}
    >
        <defs>
            <linearGradient id="loaderFurG2" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#FFD2BD" />
                <stop offset="100%" stopColor="#F4A28C" />
            </linearGradient>
            <radialGradient id="loaderBlush2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF8FA8" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FF8FA8" stopOpacity="0" />
            </radialGradient>
        </defs>
        <ellipse cx="93" cy="151" rx="46" ry="3.5" fill="#1A2B3D" opacity="0.10" />
        {/* Wagging tail */}
        <path
            d="M 138 122 Q 162 118 166 100 Q 168 84 156 80 Q 150 82 152 92 Q 152 104 144 114 Z"
            fill="url(#loaderFurG2)"
            stroke="#9C5A45"
            strokeWidth="2"
        >
            <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                values="-18 140 122; -12.7 140 122; 0 140 122; 12.7 140 122; 18 140 122; 12.7 140 122; 0 140 122; -12.7 140 122; -18 140 122"
                keyTimes="0; 0.125; 0.25; 0.375; 0.5; 0.625; 0.75; 0.875; 1"
                dur="1.6s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
            />
        </path>
        <ellipse cx="93" cy="125" rx="42" ry="24" fill="url(#loaderFurG2)" stroke="#9C5A45" strokeWidth="2.2" />
        <ellipse cx="76" cy="146" rx="9" ry="4" fill="#FFD2BD" stroke="#9C5A45" strokeWidth="2" />
        <ellipse cx="110" cy="146" rx="9" ry="4" fill="#FFD2BD" stroke="#9C5A45" strokeWidth="2" />
        <path d="M 50 50 Q 54 18 78 32 Q 70 42 50 50 Z" fill="url(#loaderFurG2)" stroke="#9C5A45" strokeWidth="2.2" />
        <path d="M 136 50 Q 132 18 108 32 Q 116 42 136 50 Z" fill="url(#loaderFurG2)" stroke="#9C5A45" strokeWidth="2.2" />
        <path d="M 58 44 Q 60 26 74 36 Q 70 42 58 44 Z" fill="#FFC0D0" />
        <path d="M 128 44 Q 126 26 112 36 Q 116 42 128 44 Z" fill="#FFC0D0" />
        <ellipse cx="93" cy="70" rx="48" ry="42" fill="url(#loaderFurG2)" stroke="#9C5A45" strokeWidth="2.5" />
        <ellipse cx="56" cy="84" rx="11" ry="6" fill="url(#loaderBlush2)" />
        <ellipse cx="130" cy="84" rx="11" ry="6" fill="url(#loaderBlush2)" />
        <ellipse cx="74" cy="68" rx="10" ry="13" fill="#2C1B3D" />
        <ellipse cx="77" cy="63" rx="3.5" ry="2.8" fill="#FFFFFF" />
        <circle cx="71" cy="74" r="2.2" fill="#FFFFFF" />
        <ellipse cx="112" cy="68" rx="10" ry="13" fill="#2C1B3D" />
        <ellipse cx="115" cy="63" rx="3.5" ry="2.8" fill="#FFFFFF" />
        <circle cx="109" cy="74" r="2.2" fill="#FFFFFF" />
        <path d="M 89 88 Q 93 86 97 88 Q 95 93 93 93 Q 91 93 89 88 Z" fill="#E58FA0" stroke="#9C5A45" strokeWidth="1" />
        <path d="M 93 93 Q 93 97 89 98 Q 86 98 84 96" fill="none" stroke="#9C5A45" strokeWidth="1.6" />
        <path d="M 93 93 Q 93 97 97 98 Q 100 98 102 96" fill="none" stroke="#9C5A45" strokeWidth="1.6" />
        <path d="M 36 88 Q 46 88 56 90" fill="none" stroke="#9C5A45" strokeWidth="1.1" />
        <path d="M 36 94 Q 46 94 56 95" fill="none" stroke="#9C5A45" strokeWidth="1.1" />
        <path d="M 150 88 Q 140 88 130 90" fill="none" stroke="#9C5A45" strokeWidth="1.1" />
        <path d="M 150 94 Q 140 94 130 95" fill="none" stroke="#9C5A45" strokeWidth="1.1" />
    </svg>
);
const messages = [
    {
        message: (
            <FormattedMessage
                defaultMessage="Creating blocks …"
                description="One of the loading messages"
                id="gui.loader.message1"
            />
        ),
        weight: 50
    },
    {
        message: (
            <FormattedMessage
                defaultMessage="Loading sprites …"
                description="One of the loading messages"
                id="gui.loader.message2"
            />
        ),
        weight: 50
    },
    {
        message: (
            <FormattedMessage
                defaultMessage="Loading sounds …"
                description="One of the loading messages"
                id="gui.loader.message3"
            />
        ),
        weight: 50
    },
    {
        message: (
            <FormattedMessage
                defaultMessage="Loading extensions …"
                description="One of the loading messages"
                id="gui.loader.message4"
            />
        ),
        weight: 50
    },
    {
        message: (
            <FormattedMessage
                defaultMessage="Creating blocks …"
                description="One of the loading messages"
                id="gui.loader.message1"
            />
        ),
        weight: 20
    },
    {
        message: (
            <FormattedMessage
                defaultMessage="Herding cats …"
                description="One of the loading messages"
                id="gui.loader.message5"
            />
        ),
        weight: 1
    },
    {
        message: (
            <FormattedMessage
                defaultMessage="Transmitting nanos …"
                description="One of the loading messages"
                id="gui.loader.message6"
            />
        ),
        weight: 1
    },
    {
        message: (
            <FormattedMessage
                defaultMessage="Inflating gobos …"
                description="One of the loading messages"
                id="gui.loader.message7"
            />
        ),
        weight: 1
    },
    {
        message: (
            <FormattedMessage
                defaultMessage="Preparing emojis …"
                description="One of the loading messages"
                id="gui.loader.message8"
            />
        ),
        weight: 1
    }
];
const mainMessages = {
    'gui.loader.headline': (
        <FormattedMessage
            defaultMessage="Loading Project"
            description="Main loading message"
            id="gui.loader.headline"
        />
    ),
    'gui.loader.creating': (
        <FormattedMessage
            defaultMessage="Creating Project"
            description="Main creating message"
            id="gui.loader.creating"
        />
    )
};

class LoaderComponent extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            messageNumber: this.chooseRandomMessage()
        };
    }
    componentDidMount () {
        // Start an interval to choose a new message every 5 seconds
        this.intervalId = setInterval(() => {
            this.setState({messageNumber: this.chooseRandomMessage()});
        }, 5000);
    }
    componentWillUnmount () {
        clearInterval(this.intervalId);
    }
    chooseRandomMessage () {
        let messageNumber;
        const sum = messages.reduce((acc, m) => acc + m.weight, 0);
        let rand = sum * Math.random();
        for (let i = 0; i < messages.length; i++) {
            rand -= messages[i].weight;
            if (rand <= 0) {
                messageNumber = i;
                break;
            }
        }
        return messageNumber;
    }
    render () {
        return (
            <div
                className={classNames(styles.background, {
                    [styles.fullscreen]: this.props.isFullScreen
                })}
            >
                <div className={styles.container}>
                    <div className={styles.blockAnimation}>
                        <VenagoCatLoader />
                    </div>
                    <div className={styles.title}>
                        {mainMessages[this.props.messageId]}
                    </div>
                    <div className={styles.messageContainerOuter}>
                        <div
                            className={styles.messageContainerInner}
                            style={{transform: `translate(0, -${this.state.messageNumber * 25}px)`}}
                        >
                            {messages.map((m, i) => (
                                <div
                                    className={styles.message}
                                    key={i}
                                >
                                    {m.message}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

LoaderComponent.propTypes = {
    isFullScreen: PropTypes.bool,
    messageId: PropTypes.string
};
LoaderComponent.defaultProps = {
    isFullScreen: false,
    messageId: 'gui.loader.headline'
};

export default LoaderComponent;
