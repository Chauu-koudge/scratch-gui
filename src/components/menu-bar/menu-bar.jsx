import classNames from 'classnames';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import bowser from 'bowser';
import React from 'react';

import VM from 'openblock-vm';

import Box from '../box/box.jsx';
import Button from '../button/button.jsx';
import CommunityButton from './community-button.jsx'; // eslint-disable-line no-unused-vars
import ShareButton from './share-button.jsx'; // eslint-disable-line no-unused-vars
import {ComingSoonTooltip} from '../coming-soon/coming-soon.jsx';
import Divider from '../divider/divider.jsx';
import LanguageSelector from '../../containers/language-selector.jsx';
import SaveStatus from './save-status.jsx'; // eslint-disable-line no-unused-vars
import ProjectWatcher from '../../containers/project-watcher.jsx'; // eslint-disable-line no-unused-vars
import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuItem, MenuSection} from '../menu/menu.jsx';
import ProjectTitleInput from './project-title-input.jsx';
import AuthorInfo from './author-info.jsx';
import AccountNav from '../../containers/account-nav.jsx'; // eslint-disable-line no-unused-vars
import LoginDropdown from './login-dropdown.jsx'; // eslint-disable-line no-unused-vars
import SB3Downloader from '../../containers/sb3-downloader.jsx';
import DeletionRestorer from '../../containers/deletion-restorer.jsx';
import TurboMode from '../../containers/turbo-mode.jsx';
import MenuBarHOC from '../../containers/menu-bar-hoc.jsx';
import {isScratchDesktop} from '../../lib/isScratchDesktop';
import {UPDATE_MODAL_STATE} from '../../lib/update-state.js';

import {
    openTipsLibrary,
    openUploadProgress,
    openUpdateModal,
    openConnectionModal,
    openDeviceLibrary
} from '../../reducers/modals';
import {setPlayer} from '../../reducers/mode';
import {
    autoUpdateProject,
    getIsUpdating,
    getIsShowingProject,
    manualUpdateProject,
    requestNewProject,
    remixProject,
    saveProjectAsCopy
} from '../../reducers/project-state';
import {
    openAboutMenu,
    closeAboutMenu,
    aboutMenuOpen,
    openAccountMenu,
    closeAccountMenu,
    accountMenuOpen,
    openFileMenu,
    closeFileMenu,
    fileMenuOpen,
    openEditMenu,
    closeEditMenu,
    editMenuOpen,
    openSettingMenu,
    closeSettingMenu,
    settingMenuOpen,
    openLanguageMenu,
    closeLanguageMenu,
    languageMenuOpen,
    openLoginMenu,
    closeLoginMenu,
    loginMenuOpen
} from '../../reducers/menus';
import {setStageSize} from '../../reducers/stage-size';
import {setUploadMode, setRealtimeMode} from '../../reducers/program-mode';
import {setRealtimeConnection, clearConnectionModalPeripheralName, setConnectionModalPeripheralName}
    from '../../reducers/connection-modal';
import ConnectionMenu from '../connection-menu/connection-menu.jsx';
import {onOpenConnectionMenuRequest} from '../../lib/connection-menu-events';
import {saveProjectToComputer, watchProjectLoads} from '../../lib/local-project-file';
import {setUpdate} from '../../reducers/update';
import {STAGE_SIZE_MODES} from '../../lib/layout-constants';

import collectMetadata from '../../lib/collect-metadata';

import styles from './menu-bar.css';

import helpIcon from '../../lib/assets/icon--tutorials.svg';
// import mystuffIcon from './icon--mystuff.png';
// import profileIcon from './icon--profile.png';
import remixIcon from './icon--remix.svg';
import dropdownCaret from './dropdown-caret.svg';
import languageIcon from '../language-selector/language-icon.svg';
import aboutIcon from './icon--about.svg';
import saveIcon from './icon--save.svg';
// import linkSocketIcon from './icon--link-socket.svg';
// import communityIcon from './icon--community.svg';
import wikiIcon from './icon--wiki.svg';
import fileIcon from './icon--file.svg';
import editIcon from './icon--edit.svg';

import openblockLogo from './openblock-logo.svg';
import openblockLogoSmall from './openblock-logo-small.svg';

import sharedMessages from '../../lib/shared-messages';

import Switch from 'react-switch';

import deviceIcon from './icon--device.svg';
import unconnectedIcon from './icon--unconnected.svg';
import connectedIcon from './icon--connected.svg';
import screenshotIcon from './icon--screenshot.svg';
import settingIcon from './icon--setting.svg';

import uploadFirmwareIcon from './icon--upload-firmware.svg';
import saveSvgAsPng from 'openblock-save-svg-as-png';
import {showAlertWithTimeout} from '../../reducers/alerts';

/* === Venago inline SVG icons (Lucide-style, MIT) === */
const IconChip = ({size = 18, color = '#ffffff'}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="2" x2="9" y2="4" /><line x1="15" y1="2" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="22" /><line x1="15" y1="20" x2="15" y2="22" />
        <line x1="20" y1="9" x2="22" y2="9" /><line x1="20" y1="14" x2="22" y2="14" />
        <line x1="2" y1="9" x2="4" y2="9" /><line x1="2" y1="14" x2="4" y2="14" />
    </svg>
);
const IconUnplug = ({size = 18, color = '#ffffff'}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 5l3-3" /><path d="M2 22l3-3" />
        <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4z" />
        <path d="M7.5 13.5L10 11" /><path d="M10.5 16.5L13 14" />
        <path d="M12 6l6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0z" />
    </svg>
);
const IconPlug = ({size = 18, color = '#ffffff'}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22v-5" /><path d="M9 8V2" /><path d="M15 8V2" />
        <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z" />
    </svg>
);
const IconCloudSave = ({size = 16, color = '#48B0B0'}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);
const IconMoreHoriz = ({size = 20, color = '#ffffff'}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
);
const IconChevronDown = ({size = 12, color = '#ffffff'}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);
const venagoIconPropTypes = {size: PropTypes.number, color: PropTypes.string};
IconChip.propTypes = venagoIconPropTypes;
IconUnplug.propTypes = venagoIconPropTypes;
IconPlug.propTypes = venagoIconPropTypes;
IconCloudSave.propTypes = venagoIconPropTypes;
IconMoreHoriz.propTypes = venagoIconPropTypes;
IconChevronDown.propTypes = venagoIconPropTypes;

const ariaMessages = defineMessages({
    language: {
        id: 'gui.menuBar.LanguageSelector',
        defaultMessage: 'language selector',
        description: 'accessibility text for the language selection menu'
    },
    tutorials: {
        id: 'gui.menuBar.tutorialsLibrary',
        defaultMessage: 'Tutorials',
        description: 'accessibility text for the tutorials button'
    },
    community: {
        id: 'gui.menuBar.community',
        defaultMessage: 'Open Community',
        description: 'accessibility text for the community button'
    },
    wiki: {
        id: 'gui.menuBar.wiki',
        defaultMessage: 'Wiki',
        description: 'accessibility text for the wiki button'
    }
});

const MenuBarItemTooltip = ({
    children,
    className,
    enable,
    id,
    place = 'bottom'
}) => {
    if (enable) {
        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
    return (
        <ComingSoonTooltip
            className={classNames(styles.comingSoon, className)}
            place={place}
            tooltipClassName={styles.comingSoonTooltip}
            tooltipId={id}
        >
            {children}
        </ComingSoonTooltip>
    );
};


MenuBarItemTooltip.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    enable: PropTypes.bool,
    id: PropTypes.string,
    place: PropTypes.oneOf(['top', 'bottom', 'left', 'right'])
};

const MenuItemTooltip = ({id, isRtl, children, className}) => (
    <ComingSoonTooltip
        className={classNames(styles.comingSoon, className)}
        isRtl={isRtl}
        place={isRtl ? 'left' : 'right'}
        tooltipClassName={styles.comingSoonTooltip}
        tooltipId={id}
    >
        {children}
    </ComingSoonTooltip>
);

MenuItemTooltip.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    id: PropTypes.string,
    isRtl: PropTypes.bool
};

const AboutButton = props => (
    <Button
        className={classNames(styles.menuBarItem, styles.hoverable)}
        iconClassName={styles.aboutIcon}
        iconSrc={aboutIcon}
        onClick={props.onClick}
    />
);

AboutButton.propTypes = {
    onClick: PropTypes.func.isRequired
};

class MenuBar extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'checkOverflow',
            'containerRef',
            'handleClickNew',
            'handleClickRemix',
            'handleClickOpenCommunity',
            'handleClickOpenWiki',
            'handleClickSave',
            'handleClickSaveAsCopy',
            'handleClickSeeCommunity',
            'handleClickShare',
            'handleKeyPress',
            'handleLanguageMouseUp',
            'handleRestoreOption',
            'getSaveToComputerHandler',
            'restoreOptionMessage',
            'handleConnectionMouseUp',
            'handleConnectionMenuClose',
            'handleUploadFirmware',
            'handleWindowsResize',
            'handleSelectDeviceMouseUp',
            'handleProgramModeSwitchOnChange',
            'handleProgramModeUpdate',
            'handleScreenshot',
            'handleCheckUpdate',
            'handleClearCache',
            'handleMoreClick',
            'handleMoreClose'
        ]);
        this.state = {
            isOverflow: false,
            moreMenuOpen: false,
            connectionMenuOpen: false
        };
    }
    handleMoreClick (e) {
        // Venago: the menu items live inside this button. Ignore the mouse-up of a click on
        // an item, otherwise the menu closes before the item's click runs.
        if (e && e.target && e.target.closest && e.target.closest(`.${styles.menuBarMenu}`)) return;
        this.setState({moreMenuOpen: !this.state.moreMenuOpen});
    }
    handleMoreClose () {
        this.setState({moreMenuOpen: false});
    }
    componentDidMount () {
        document.addEventListener('keydown', this.handleKeyPress);
        watchProjectLoads(this.props.vm);
        this.unsubscribeConnectionMenu = onOpenConnectionMenuRequest(() => this.setState({connectionMenuOpen: true}));
        this.props.vm.on('PERIPHERAL_DISCONNECTED', this.props.onDisconnect);
        this.props.vm.on('PROGRAM_MODE_UPDATE', this.handleProgramModeUpdate);
        window.addEventListener('resize', this.handleWindowsResize);
    }
    componentDidUpdate (prevProps) {
        if (prevProps.isToolboxUpdating !== this.props.isToolboxUpdating && !this.state.isOverflow
        ) {
            this.checkOverflow();
        }
    }
    componentWillUnmount () {
        document.removeEventListener('keydown', this.handleKeyPress);
        if (this.unsubscribeConnectionMenu) this.unsubscribeConnectionMenu();
        this.props.vm.removeListener('PERIPHERAL_DISCONNECTED', this.props.onDisconnect);
        this.props.vm.removeListener('PROGRAM_MODE_UPDATE', this.handleProgramModeUpdate);
        window.removeEventListener('resize', this.handleWindowsResize);
    }
    handleWindowsResize () {
        this.setState({isOverflow: false});
        if (this.resizeTimerout) {
            clearTimeout(this.resizeTimerout);
        }
        // When you continue to drag and resize the window, the menu content is not hidden immediately,
        // but delayed for a period of time to prevent the menu content from flickering frequently.After
        // testing, a delay of 300ms seems to be the most comfortable.
        this.resizeTimerout = setTimeout(() => this.checkOverflow(), 300);
    }
    containerRef (el) {
        this.containerElement = el;
    }
    checkOverflow () {
        if (this.containerElement) {
            const container = this.containerElement;
            this.setState({isOverflow: container.scrollWidth > container.clientWidth});
        }
    }
    handleClickNew () {
        // if the project is dirty, and user owns the project, we will autosave.
        // but if they are not logged in and can't save, user should consider
        // downloading or logging in first.
        // Note that if user is logged in and editing someone else's project,
        // they'll lose their work.
        const readyToReplaceProject = this.props.confirmReadyToReplaceProject(
            this.props.intl.formatMessage(sharedMessages.replaceProjectWarning)
        );
        this.props.onRequestCloseFile();
        if (readyToReplaceProject) {
            this.props.onClickNew(this.props.canSave && this.props.canCreateNew);
        }
        this.props.onRequestCloseFile();
    }
    handleClickRemix () {
        this.props.onClickRemix();
        this.props.onRequestCloseFile();
    }
    handleClickSave () {
        this.props.onRequestCloseFile();
        if (this.props.canSave) {
            this.props.onClickSave();
            return;
        }
        // Venago: no project server here, so save to a file on this computer.
        this.saveToComputer(false);
    }
    handleClickSaveAsCopy () {
        this.props.onRequestCloseFile();
        if (this.props.canCreateCopy) {
            this.props.onClickSaveAsCopy();
            return;
        }
        this.saveToComputer(true);
    }
    saveToComputer (asCopy) {
        const title = (this.props.projectTitle || 'Venago Project').replace(/[\\/:*?"<>|]/g, '_');
        saveProjectToComputer({vm: this.props.vm, filename: `${title.substring(0, 100)}.ob`, asCopy})
            .then(savedName => {
                if (savedName) this.props.onShowSaveSuccess();
            })
            .catch(error => {
                console.error(error); // eslint-disable-line no-console
                this.props.onShowSavingError();
            });
    }
    handleClickSeeCommunity (waitForUpdate) {
        if (this.props.shouldSaveBeforeTransition()) {
            this.props.autoUpdateProject(); // save before transitioning to project page
            waitForUpdate(true); // queue the transition to project page
        } else {
            waitForUpdate(false); // immediately transition to project page
        }
    }
    handleClickShare (waitForUpdate) {
        if (!this.props.isShared) {
            if (this.props.canShare) { // save before transitioning to project page
                this.props.onShare();
            }
            if (this.props.canSave) { // save before transitioning to project page
                this.props.autoUpdateProject();
                waitForUpdate(true); // queue the transition to project page
            } else {
                waitForUpdate(false); // immediately transition to project page
            }
        }
    }
    handleRestoreOption (restoreFun) {
        return () => {
            restoreFun();
            this.props.onRequestCloseEdit();
        };
    }
    handleKeyPress (event) {
        const modifier = bowser.mac ? event.metaKey : event.ctrlKey;
        if (modifier && event.key === 's') {
            this.handleClickSave();
            event.preventDefault();
        }
    }
    getSaveToComputerHandler (downloadProjectCallback) {
        return () => {
            this.props.onRequestCloseFile();
            downloadProjectCallback();
            if (this.props.onProjectTelemetryEvent) {
                const metadata = collectMetadata(this.props.vm, this.props.projectTitle, this.props.locale);
                this.props.onProjectTelemetryEvent('projectDidSave', metadata);
            }
        };
    }
    handleLanguageMouseUp (e) {
        if (!this.props.languageMenuOpen) {
            this.props.onClickLanguage(e);
        }
    }
    handleClickOpenCommunity () {
        window.open('https://community.venagoinnovations.com');
    }
    handleClickOpenWiki () {
        // Venago: wiki.venagoinnovations.com does not exist (the domain does not resolve).
        window.open('https://venagoinnovations.com', '_blank');
    }
    restoreOptionMessage (deletedItem) {
        switch (deletedItem) {
        case 'Sprite':
            return (<FormattedMessage
                defaultMessage="Restore Sprite"
                description="Menu bar item for restoring the last deleted sprite."
                id="gui.menuBar.restoreSprite"
            />);
        case 'Sound':
            return (<FormattedMessage
                defaultMessage="Restore Sound"
                description="Menu bar item for restoring the last deleted sound."
                id="gui.menuBar.restoreSound"
            />);
        case 'Costume':
            return (<FormattedMessage
                defaultMessage="Restore Costume"
                description="Menu bar item for restoring the last deleted costume."
                id="gui.menuBar.restoreCostume"
            />);
        default: {
            return (<FormattedMessage
                defaultMessage="Restore"
                description="Menu bar item for restoring the last deleted item in its disabled state." /* eslint-disable-line max-len */
                id="gui.menuBar.restore"
            />);
        }
        }
    }
    handleConnectionMouseUp () {
        // Venago: PictoBlox-style dropdown (Serial / Bluetooth port lists, or a
        // "select a board" message) instead of the connection window.
        this.setState(state => ({connectionMenuOpen: !state.connectionMenuOpen}));
    }
    handleConnectionMenuClose () {
        this.setState({connectionMenuOpen: false});
    }
    handleSelectDeviceMouseUp () {
        const blocklyBlockCanvas = document.querySelector('.blocklyWorkspace .blocklyBlockCanvas');
        if (blocklyBlockCanvas.childNodes.length === 0) {
            this.props.onOpenDeviceLibrary();
        } else {
            this.props.onWorkspaceIsNotEmpty();
        }
    }
    handleProgramModeSwitchOnChange () {
        if (this.props.isRealtimeMode) {
            this.props.vm.runtime.setRealtimeMode(false);
        } else {
            /**
             * The realtime stage framwork didn't support STAGE_SIZE_MODES.hide,
             * so if the mode is hide switch to large mode.
             *  */
            if (this.props.stageSizeMode === STAGE_SIZE_MODES.hide) {
                this.props.onSetStageLarge();
            }
            this.props.vm.runtime.setRealtimeMode(true);
        }
    }
    handleProgramModeUpdate (data) {
        if (data.isRealtimeMode) {
            this.props.onSetRealtimeMode();
        } else {
            this.props.onSetUploadMode();
        }
    }
    handleUploadFirmware () {
        if (this.props.deviceId) {
            this.props.vm.uploadFirmwareToPeripheral(this.props.deviceId);
            this.props.onSetRealtimeConnection(false);
            this.props.onOpenUploadProgress();
        } else {
            this.props.onNoPeripheralIsConnected();
        }
    }
    handleScreenshot () {
        const blocklyBlockCanvas = document.querySelector('.blocklyWorkspace .blocklyBlockCanvas');
        if (blocklyBlockCanvas.childNodes.length === 0) {
            this.props.onWorkspaceIsEmpty();
        } else {
            const transform = blocklyBlockCanvas.getAttribute('transform');
            const scale = parseFloat(transform.substring(transform.indexOf('scale') + 6, transform.length - 1));
            const data = new Date();

            saveSvgAsPng.saveSvgAsPng(blocklyBlockCanvas, `${this.props.projectTitle}-${data.getTime()}.png`, {
                left: blocklyBlockCanvas.getBBox().x * scale,
                top: blocklyBlockCanvas.getBBox().y * scale,
                height: blocklyBlockCanvas.getBBox().height * scale,
                width: blocklyBlockCanvas.getBBox().width * scale,
                scale: 2 / scale,
                encoderOptions: 1
            });
        }
    }
    handleCheckUpdate () {
        this.props.onSetUpdate({phase: UPDATE_MODAL_STATE.checkingApplication});
        this.props.onClickCheckUpdate();
    }
    handleClearCache () {
        const readyClearCache = this.props.confirmClearCache(
            this.props.intl.formatMessage(sharedMessages.clearCacheWarning)
        );
        if (readyClearCache) {
            this.props.onClickClearCache();
        }
    }
    buildAboutMenu (onClickAbout) {
        if (!onClickAbout) {
            // hide the button
            return null;
        }
        if (typeof onClickAbout === 'function') {
            // make a button which calls a function
            return <AboutButton onClick={onClickAbout} />;
        }
        // assume it's an array of objects
        // each item must have a 'title' FormattedMessage and a 'handleClick' function
        // generate a menu with items for each object in the array
        return (
            onClickAbout.map(itemProps => (
                <MenuItem
                    key={itemProps.title}
                    isRtl={this.props.isRtl}
                    onClick={this.wrapAboutMenuCallback(itemProps.onClick)}
                >
                    {itemProps.title}
                </MenuItem>
            ))
        );
    }
    wrapAboutMenuCallback (callback) {
        return () => {
            callback();
            this.props.onRequestCloseAbout();
        };
    }
    render () {
        const saveNowMessage = (
            <FormattedMessage
                defaultMessage="Save now"
                description="Menu bar item for saving now"
                id="gui.menuBar.saveNow"
            />
        );
        const createCopyMessage = (
            <FormattedMessage
                defaultMessage="Save as a copy"
                description="Menu bar item for saving as a copy"
                id="gui.menuBar.saveAsCopy"
            />
        );
        const remixMessage = (
            <FormattedMessage
                defaultMessage="Remix"
                description="Menu bar item for remixing"
                id="gui.menuBar.remix"
            />
        );
        const newProjectMessage = (
            <FormattedMessage
                defaultMessage="New"
                description="Menu bar item for creating a new project"
                id="gui.menuBar.new"
            />
        );
        const checkUpdate = (
            <FormattedMessage
                defaultMessage="Check update"
                description="Menu bar item for check update"
                id="gui.menuBar.checkUpdate"
            />
        );
        const installDriver = (
            <FormattedMessage
                defaultMessage="Install driver"
                description="Menu bar item for install drivers"
                id="gui.menuBar.installDriver"
            />
        );
        const clearCache = (
            <FormattedMessage
                defaultMessage="Clear cache and restart"
                description="Menu bar item for clear cache and restart"
                id="gui.menuBar.clearCacheAndRestart"
            />
        );
        // eslint-disable-next-line no-unused-vars
        const remixButton = (
            <Button
                className={classNames(
                    styles.menuBarButton,
                    styles.remixButton
                )}
                iconClassName={styles.remixButtonIcon}
                iconSrc={remixIcon}
                onClick={this.handleClickRemix}
            >
                {remixMessage}
            </Button>
        );
        // Show the About button only if we have a handler for it (like in the desktop app)
        const aboutButton = this.buildAboutMenu(this.props.onClickAbout);
        return (
            <Box
                className={classNames(
                    this.props.className,
                    styles.menuBar
                )}
                componentRef={this.containerRef}
            >
                <div className={styles.mainMenu}>
                    <div className={classNames(styles.menuBarItem)} style={{marginRight: 'auto', alignItems: 'center'}}>
                        <span
                            className={classNames(styles.venagoWordmark)}
                            style={{cursor: 'default'}}
                        >Venago</span>
                    </div>
                    {(this.props.canManageFiles) && (
                        <div
                            className={classNames(styles.menuBarItem, styles.hoverable, {
                                [styles.active]: this.props.fileMenuOpen
                            })}
                            style={{display: 'none'}}
                            onMouseUp={this.props.onClickFile}
                        >
                            {this.state.isOverflow ? (
                                <img
                                    className={styles.fileIcon}
                                    src={fileIcon}
                                />) :
                                <FormattedMessage
                                    defaultMessage="File"
                                    description="Text for file dropdown menu"
                                    id="gui.menuBar.file"
                                />}
                            <MenuBarMenu
                                className={classNames(styles.menuBarMenu)}
                                open={this.props.fileMenuOpen}
                                place={this.props.isRtl ? 'left' : 'right'}
                                onRequestClose={this.props.onRequestCloseFile}
                            >
                                <MenuSection>
                                    <MenuItem
                                        isRtl={this.props.isRtl}
                                        onClick={this.handleClickNew}
                                    >
                                        {newProjectMessage}
                                    </MenuItem>
                                </MenuSection>
                                {(this.props.canSave || this.props.canCreateCopy || this.props.canRemix) && (
                                    <MenuSection>
                                        {this.props.canSave && (
                                            <MenuItem onClick={this.handleClickSave}>
                                                {saveNowMessage}
                                            </MenuItem>
                                        )}
                                        {this.props.canCreateCopy && (
                                            <MenuItem onClick={this.handleClickSaveAsCopy}>
                                                {createCopyMessage}
                                            </MenuItem>
                                        )}
                                        {this.props.canRemix && (
                                            <MenuItem onClick={this.handleClickRemix}>
                                                {remixMessage}
                                            </MenuItem>
                                        )}
                                    </MenuSection>
                                )}
                                <MenuSection>
                                    <MenuItem
                                        onClick={this.props.onStartSelectingFileUpload}
                                    >
                                        {this.props.intl.formatMessage(sharedMessages.loadFromComputerTitle)}
                                    </MenuItem>
                                    <SB3Downloader>{(className, downloadProjectCallback) => (
                                        <MenuItem
                                            className={className}
                                            onClick={this.getSaveToComputerHandler(downloadProjectCallback)}
                                        >
                                            <FormattedMessage
                                                defaultMessage="Save to your computer"
                                                description="Menu bar item for downloading a project to your computer" // eslint-disable-line max-len
                                                id="gui.menuBar.downloadToComputer"
                                            />
                                        </MenuItem>
                                    )}</SB3Downloader>
                                </MenuSection>
                            </MenuBarMenu>
                        </div>
                    )}
                    <div
                        className={classNames(styles.menuBarItem,
                            this.props.isRealtimeMode ? styles.hoverable : styles.disabled,
                            {[styles.active]: this.props.editMenuOpen
                            })}
                        style={{display: 'none'}}
                        onMouseUp={this.props.isRealtimeMode ? this.props.onClickEdit : null}
                    >
                        <div className={classNames(styles.editMenu)} >
                            {this.state.isOverflow ? (
                                <img
                                    className={styles.editIcon}
                                    src={editIcon}
                                />) :
                                <FormattedMessage
                                    defaultMessage="Edit"
                                    description="Text for edit dropdown menu"
                                    id="gui.menuBar.edit"
                                />}
                        </div>
                        <MenuBarMenu
                            className={classNames(styles.menuBarMenu)}
                            open={this.props.editMenuOpen}
                            place={this.props.isRtl ? 'left' : 'right'}
                            onRequestClose={this.props.onRequestCloseEdit}
                        >
                            <DeletionRestorer>{(handleRestore, {restorable, deletedItem}) => (
                                <MenuItem
                                    className={classNames({[styles.disabled]: !restorable})}
                                    onClick={this.handleRestoreOption(handleRestore)}
                                >
                                    {this.restoreOptionMessage(deletedItem)}
                                </MenuItem>
                            )}</DeletionRestorer>
                            <MenuSection>
                                <TurboMode>{(toggleTurboMode, {turboMode}) => (
                                    <MenuItem onClick={toggleTurboMode}>
                                        {turboMode ? (
                                            <FormattedMessage
                                                defaultMessage="Turn off Turbo Mode"
                                                description="Menu bar item for turning off turbo mode"
                                                id="gui.menuBar.turboModeOff"
                                            />
                                        ) : (
                                            <FormattedMessage
                                                defaultMessage="Turn on Turbo Mode"
                                                description="Menu bar item for turning on turbo mode"
                                                id="gui.menuBar.turboModeOn"
                                            />
                                        )}
                                    </MenuItem>
                                )}</TurboMode>
                            </MenuSection>
                        </MenuBarMenu>
                    </div>
                    <Divider className={classNames(styles.divider)} />
                    <div
                        className={classNames(styles.menuBarItem, styles.hoverable)}
                        style={{gap: '0.45rem'}}
                        onMouseUp={this.handleSelectDeviceMouseUp}
                    >
                        <IconChip size={18} />
                        {
                            this.props.deviceName ? (
                                <span>
                                    {this.props.deviceName}
                                </span>
                            ) : (
                                <FormattedMessage
                                    defaultMessage="No device selected"
                                    description="Text for menubar no device select button"
                                    id="gui.menuBar.noDeviceSelected"
                                />
                            )}
                    </div>
                    <Divider className={classNames(styles.divider)} />
                    <div style={{position: 'relative', display: 'flex', alignSelf: 'stretch'}}>
                    <div
                        className={classNames(styles.menuBarItem, styles.hoverable, {
                            [styles.active]: this.state.connectionMenuOpen
                        })}
                        data-venago-connection-toggle
                        style={{gap: '0.45rem'}}
                        onMouseUp={this.handleConnectionMouseUp}
                    >
                        {this.props.peripheralName ? (
                            <React.Fragment>
                                <IconPlug size={17} />
                                {this.state.isOverflow ? null : this.props.peripheralName}
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <IconUnplug size={17} />
                                {this.state.isOverflow ? null : <FormattedMessage
                                    defaultMessage="Unconnected"
                                    description="Text for menubar unconnected button"
                                    id="gui.menuBar.noConnection"
                                />}
                            </React.Fragment>
                        )}
                    </div>
                    <ConnectionMenu
                        baudrate={this.props.baudrate}
                        deviceData={this.props.deviceData}
                        deviceId={this.props.deviceId}
                        deviceName={this.props.deviceName}
                        isRealtimeMode={this.props.isRealtimeMode}
                        open={this.state.connectionMenuOpen}
                        peripheralName={this.props.peripheralName}
                        vm={this.props.vm}
                        onConnected={this.props.onPeripheralConnected}
                        onRequestClose={this.handleConnectionMenuClose}
                        onSelectDevice={this.handleSelectDeviceMouseUp}
                    />
                    </div>
                    {/* <div
                        className={classNames(styles.menuBarItem)}
                    >
                        <img
                            className={classNames(styles.linkSocketIcon)}
                            src={linkSocketIcon}
                        />
                    </div>*/}
                </div>
                {this.state.isOverflow ? null :
                    (<div className={styles.fileMenu}>
                        {this.props.canEditTitle ? (
                            <div
                                className={classNames(styles.menuBarItem, styles.projectPill)}
                            >
                                <MenuBarItemTooltip
                                    enable
                                    id="title-field"
                                >
                                    <ProjectTitleInput
                                        className={classNames(styles.titleFieldGrowable)}
                                    />
                                </MenuBarItemTooltip>
                                <SB3Downloader>{(className, downloadProjectCallback) => (
                                    <div
                                        className={classNames(styles.saveBtnInline)}
                                        onClick={this.getSaveToComputerHandler(downloadProjectCallback)}
                                        title="Save project"
                                    >
                                        <IconCloudSave size={15} color="#ffffff" />
                                    </div>
                                )}</SB3Downloader>
                            </div>
                        ) : ((this.props.authorUsername && this.props.authorUsername !== this.props.username) ? (
                            <AuthorInfo
                                className={styles.authorInfo}
                                imageUrl={this.props.authorThumbnailUrl}
                                projectTitle={this.props.projectTitle}
                                userId={this.props.authorId}
                                username={this.props.authorUsername}
                            />
                        ) : null)}
                    </div>)}
                <div className={styles.tailMenu}>
                    {/* <div
                        aria-label={this.props.intl.formatMessage(ariaMessages.community)}
                        className={classNames(styles.menuBarItem, styles.hoverable)}
                        onClick={this.handleClickOpenCommunity}
                    >
                        <img
                            className={styles.communityIcon}
                            src={communityIcon}
                        />
                        {this.state.isOverflow ? null : <FormattedMessage {...ariaMessages.community} />}
                    </div>*/}
                    <div
                        aria-label={this.props.intl.formatMessage(ariaMessages.wiki)}
                        className={classNames(styles.menuBarItem, styles.hoverable)}
                        onClick={this.handleClickOpenWiki}
                    >
                        <img
                            className={styles.wikiIcon}
                            src={wikiIcon}
                        />
                        {this.state.isOverflow ? null : <FormattedMessage {...ariaMessages.wiki} />}
                    </div>
                    <div
                        aria-label={this.props.intl.formatMessage(ariaMessages.tutorials)}
                        className={classNames(styles.menuBarItem, styles.hoverable)}
                        onClick={this.props.onOpenTipLibrary}
                    >
                        <img
                            className={styles.helpIcon}
                            src={helpIcon}
                        />
                        {this.state.isOverflow ? null : <FormattedMessage {...ariaMessages.tutorials} />}
                    </div>
                    <Divider className={classNames(styles.divider)} />
                    <div
                        className={classNames(styles.menuBarItem, styles.hoverable)}
                        onMouseUp={this.handleScreenshot}
                    >
                        <img
                            alt="Screenshot"
                            className={classNames(styles.screenShotLogo)}
                            draggable={false}
                            src={screenshotIcon}
                        />
                    </div>
                    <Divider className={classNames(styles.divider)} />
                    <div
                        className={classNames(styles.menuBarItem, this.props.isRealtimeMode && this.props.isRealtimeSupported &&
                            this.props.peripheralName ? styles.hoverable : styles.disabled)}
                        onMouseUp={this.props.isRealtimeMode && this.props.isRealtimeSupported && this.props.peripheralName ?
                            this.handleUploadFirmware : null}
                    >
                        <img
                            alt="UploadFirmware"
                            className={classNames(styles.uploadFirmwareLogo)}
                            draggable={false}
                            src={uploadFirmwareIcon}
                        />
                        {this.state.isOverflow ? null : <FormattedMessage
                            defaultMessage="Upload Firmware"
                            description="Button to upload the realtime firmware"
                            id="gui.menuBar.uploadFirmware"
                        />}
                    </div>
                    <Divider className={classNames(styles.divider)} />
                    {/* Venago: PictoBlox-style language menu (globe), left of Program Mode. */}
                    {(this.props.canChangeLanguage) && (<div
                        className={classNames(styles.menuBarItem, styles.hoverable, styles.languageMenu)}
                        title={this.props.intl.formatMessage(ariaMessages.language)}
                    >
                        <div>
                            <img
                                className={styles.languageIcon}
                                src={languageIcon}
                            />
                            <img
                                className={styles.languageCaret}
                                src={dropdownCaret}
                            />
                        </div>
                        <LanguageSelector label={this.props.intl.formatMessage(ariaMessages.language)} />
                    </div>)}
                    <div className={classNames(styles.menuBarItem, styles.programModeGroup)}>
                        <FormattedMessage
                            defaultMessage="Program Mode"
                            description="Button to switch to upload mode"
                            id="gui.menu-bar.programMode"
                        />
                        <Switch
                            className={styles.programModeSwitch}
                            onChange={this.handleProgramModeSwitchOnChange}
                            checked={!this.props.isRealtimeMode}
                            disabled={this.props.isToolboxUpdating || !this.props.isSupportSwitchMode}
                            height={25}
                            width={45}
                            onColor={this.props.isToolboxUpdating ||
                                !this.props.isSupportSwitchMode ? '#888888' : '#008800'}
                            offColor={this.props.isToolboxUpdating ||
                                !this.props.isSupportSwitchMode ? '#888888' : '#48B0B0'}
                            uncheckedIcon={false}
                            checkedIcon={false}
                        />
                    </div>
                    <div
                        className={classNames(styles.menuBarItem, styles.hoverable, styles.moreMenuTrigger, {
                            [styles.active]: this.state.moreMenuOpen
                        })}
                        onMouseUp={this.handleMoreClick}
                    >
                        <IconMoreHoriz size={20} />
                        <MenuBarMenu
                            className={classNames(styles.menuBarMenu)}
                            open={this.state.moreMenuOpen}
                            place={this.props.isRtl ? 'right' : 'left'}
                            onRequestClose={this.handleMoreClose}
                        >
                            <MenuSection>
                                <MenuItem onClick={() => { this.handleMoreClose(); this.handleClickNew(); }}>
                                    <FormattedMessage
                                        defaultMessage="New Project"
                                        description="More menu - new project"
                                        id="gui.venago.moreMenu.new"
                                    />
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        this.handleMoreClose();
                                        if (this.props.onStartSelectingFileUpload) this.props.onStartSelectingFileUpload();
                                    }}
                                >
                                    <FormattedMessage
                                        defaultMessage="Load from your computer"
                                        description="More menu - load project from a file"
                                        id="gui.venago.moreMenu.loadFromComputer"
                                    />
                                </MenuItem>
                                <MenuItem onClick={() => { this.handleMoreClose(); this.handleClickSave(); }}>
                                    <FormattedMessage
                                        defaultMessage="Save now"
                                        description="More menu - save now"
                                        id="gui.venago.moreMenu.saveNow"
                                    />
                                </MenuItem>
                                <MenuItem onClick={() => { this.handleMoreClose(); this.handleClickSaveAsCopy(); }}>
                                    <FormattedMessage
                                        defaultMessage="Save as a copy"
                                        description="More menu - save as copy"
                                        id="gui.venago.moreMenu.saveAsCopy"
                                    />
                                </MenuItem>
                                <SB3Downloader>{(className, downloadProjectCallback) => (
                                    <MenuItem
                                        className={className}
                                        onClick={() => { this.handleMoreClose(); this.getSaveToComputerHandler(downloadProjectCallback)(); }}
                                    >
                                        <FormattedMessage
                                            defaultMessage="Save to your computer"
                                            description="More menu - download project"
                                            id="gui.venago.moreMenu.downloadToComputer"
                                        />
                                    </MenuItem>
                                )}</SB3Downloader>
                            </MenuSection>
                            <MenuSection>
                                <MenuItem onClick={() => { this.handleMoreClose(); this.handleClickOpenWiki(); }}>
                                    <FormattedMessage
                                        defaultMessage="Wiki"
                                        description="More menu - wiki"
                                        id="gui.venago.moreMenu.wiki"
                                    />
                                </MenuItem>
                                <MenuItem onClick={() => { this.handleMoreClose(); this.props.onOpenTipLibrary(); }}>
                                    <FormattedMessage
                                        defaultMessage="Tutorials"
                                        description="More menu - tutorials"
                                        id="gui.venago.moreMenu.tutorials"
                                    />
                                </MenuItem>
                                <MenuItem onClick={() => { this.handleMoreClose(); this.handleScreenshot(); }}>
                                    <FormattedMessage
                                        defaultMessage="Take Screenshot"
                                        description="More menu - take screenshot"
                                        id="gui.venago.moreMenu.screenshot"
                                    />
                                </MenuItem>
                                <MenuItem
                                    className={classNames({[styles.disabled]: !(this.props.isRealtimeMode && this.props.isRealtimeSupported && this.props.peripheralName)})}
                                    onClick={() => {
                                        this.handleMoreClose();
                                        if (this.props.isRealtimeMode && this.props.isRealtimeSupported && this.props.peripheralName) {
                                            this.handleUploadFirmware();
                                        }
                                    }}
                                >
                                    <FormattedMessage
                                        defaultMessage="Upload Firmware"
                                        description="More menu - upload firmware"
                                        id="gui.venago.moreMenu.uploadFirmware"
                                    />
                                </MenuItem>
                            </MenuSection>
                        </MenuBarMenu>
                    </div>
                    {isScratchDesktop() ? (
                        <div
                            className={classNames(styles.menuBarItem, styles.hoverable, {
                                [styles.active]: this.props.settingMenuOpen
                            })}
                            onMouseUp={this.props.onClickSetting}
                        >
                            <img
                                className={styles.settingIcon}
                                src={settingIcon}
                            />
                            <MenuBarMenu
                                className={classNames(styles.menuBarMenu)}
                                open={this.props.settingMenuOpen}
                                place={this.props.isRtl ? 'right' : 'left'}
                                onRequestClose={this.props.onRequestCloseSetting}
                            >
                                <MenuSection>
                                    <MenuItem
                                        isRtl={this.props.isRtl}
                                        onClick={this.handleCheckUpdate}
                                    >
                                        {checkUpdate}
                                    </MenuItem>
                                    <MenuItem
                                        isRtl={this.props.isRtl}
                                        onClick={this.handleClearCache}
                                    >
                                        {clearCache}
                                    </MenuItem>
                                </MenuSection>
                                <MenuSection>
                                    <MenuItem
                                        isRtl={this.props.isRtl}
                                        onClick={this.props.onClickInstallDriver}
                                    >
                                        {installDriver}
                                    </MenuItem>
                                </MenuSection>
                                <MenuSection>
                                    {typeof this.props.onClickAbout === 'object' ? aboutButton : null}
                                </MenuSection>
                            </MenuBarMenu>
                        </div>
                    ) : null}
                </div>
                { (typeof this.props.onClickAbout === 'function') ? aboutButton : null}
            </Box>
        );
    }
}

MenuBar.propTypes = {
    aboutMenuOpen: PropTypes.bool,
    accountMenuOpen: PropTypes.bool,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    authorThumbnailUrl: PropTypes.string,
    authorUsername: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    autoUpdateProject: PropTypes.func,
    canChangeLanguage: PropTypes.bool,
    canCreateCopy: PropTypes.bool,
    canCreateNew: PropTypes.bool,
    canEditTitle: PropTypes.bool,
    canManageFiles: PropTypes.bool,
    canRemix: PropTypes.bool,
    canSave: PropTypes.bool,
    canShare: PropTypes.bool,
    className: PropTypes.string,
    confirmReadyToReplaceProject: PropTypes.func,
    confirmClearCache: PropTypes.func,
    editMenuOpen: PropTypes.bool,
    enableCommunity: PropTypes.bool,
    fileMenuOpen: PropTypes.bool,
    settingMenuOpen: PropTypes.bool,
    intl: intlShape,
    isUpdating: PropTypes.bool,
    isRealtimeMode: PropTypes.bool.isRequired,
    isRealtimeSupported: PropTypes.bool,
    baudrate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    deviceData: PropTypes.instanceOf(Array),
    onPeripheralConnected: PropTypes.func,
    isRtl: PropTypes.bool,
    isShared: PropTypes.bool,
    isShowingProject: PropTypes.bool,
    isSupportSwitchMode: PropTypes.bool,
    isToolboxUpdating: PropTypes.bool.isRequired,
    languageMenuOpen: PropTypes.bool,
    locale: PropTypes.string.isRequired,
    loginMenuOpen: PropTypes.bool,
    logo: PropTypes.string,
    logoSmall: PropTypes.string,
    onClickAbout: PropTypes.oneOfType([
        PropTypes.func, // button mode: call this callback when the About button is clicked
        PropTypes.arrayOf( // menu mode: list of items in the About menu
            PropTypes.shape({
                title: PropTypes.string, // text for the menu item
                onClick: PropTypes.func // call this callback when the menu item is clicked
            })
        )
    ]),
    onClickAccount: PropTypes.func,
    onClickEdit: PropTypes.func,
    onClickFile: PropTypes.func,
    onClickSetting: PropTypes.func,
    onClickLanguage: PropTypes.func,
    onClickLogin: PropTypes.func,
    onClickLogo: PropTypes.func,
    onClickNew: PropTypes.func,
    onClickRemix: PropTypes.func,
    onClickSave: PropTypes.func,
    onClickSaveAsCopy: PropTypes.func,
    onShowSaveSuccess: PropTypes.func,
    onShowSavingError: PropTypes.func,
    onClickCheckUpdate: PropTypes.func,
    onClickClearCache: PropTypes.func,
    onClickInstallDriver: PropTypes.func,
    onLogOut: PropTypes.func,
    onNoPeripheralIsConnected: PropTypes.func.isRequired,
    onOpenRegistration: PropTypes.func,
    onOpenTipLibrary: PropTypes.func,
    onProjectTelemetryEvent: PropTypes.func,
    onRequestOpenAbout: PropTypes.func,
    onRequestCloseAbout: PropTypes.func,
    onRequestCloseAccount: PropTypes.func,
    onRequestCloseEdit: PropTypes.func,
    onRequestCloseFile: PropTypes.func,
    onRequestCloseSetting: PropTypes.func,
    onRequestCloseLanguage: PropTypes.func,
    onRequestCloseLogin: PropTypes.func,
    onSeeCommunity: PropTypes.func,
    onShare: PropTypes.func,
    onStartSelectingFileUpload: PropTypes.func,
    onToggleLoginOpen: PropTypes.func,
    projectTitle: PropTypes.string,
    realtimeConnection: PropTypes.bool.isRequired,
    renderLogin: PropTypes.func,
    sessionExists: PropTypes.bool,
    shouldSaveBeforeTransition: PropTypes.func,
    showComingSoon: PropTypes.bool,
    userOwnsProject: PropTypes.bool,
    username: PropTypes.string,
    stageSizeMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)),
    vm: PropTypes.instanceOf(VM).isRequired,
    onSetUploadMode: PropTypes.func,
    onSetRealtimeConnection: PropTypes.func.isRequired,
    onSetRealtimeMode: PropTypes.func,
    onSetUpdate: PropTypes.func.isRequired,
    onOpenConnectionModal: PropTypes.func,
    onOpenUploadProgress: PropTypes.func,
    peripheralName: PropTypes.string,
    onDisconnect: PropTypes.func.isRequired,
    onWorkspaceIsEmpty: PropTypes.func.isRequired,
    onWorkspaceIsNotEmpty: PropTypes.func.isRequired,
    onOpenDeviceLibrary: PropTypes.func,
    onSetStageLarge: PropTypes.func.isRequired,
    deviceId: PropTypes.string,
    deviceName: PropTypes.string,
    onDeviceIsEmpty: PropTypes.func
};

MenuBar.defaultProps = {
    logo: openblockLogo,
    logoSmall: openblockLogoSmall,
    onShare: () => {}
};

const mapStateToProps = (state, ownProps) => {
    const loadingState = state.scratchGui.projectState.loadingState;
    const user = state.session && state.session.session && state.session.session.user;
    return {
        aboutMenuOpen: aboutMenuOpen(state),
        accountMenuOpen: accountMenuOpen(state),
        fileMenuOpen: fileMenuOpen(state),
        settingMenuOpen: settingMenuOpen(state),
        editMenuOpen: editMenuOpen(state),
        isUpdating: getIsUpdating(loadingState),
        isRealtimeMode: state.scratchGui.programMode.isRealtimeMode,
        // Venago: only boards with realtime (Firmata) firmware can upload it.
        isRealtimeSupported: (() => {
            const deviceId = state.scratchGui.device.deviceId;
            const dev = (state.scratchGui.deviceData.deviceData || []).find(item => item.deviceId === deviceId);
            return !!(dev && dev.programMode && dev.programMode.includes('realtime'));
        })(),
        isRtl: state.locales.isRtl,
        isShowingProject: getIsShowingProject(loadingState),
        isSupportSwitchMode: state.scratchGui.programMode.isSupportSwitchMode,
        isToolboxUpdating: state.scratchGui.toolbox.isToolboxUpdating,
        languageMenuOpen: languageMenuOpen(state),
        locale: state.locales.locale,
        loginMenuOpen: loginMenuOpen(state),
        projectTitle: state.scratchGui.projectTitle,
        realtimeConnection: state.scratchGui.connectionModal.realtimeConnection,
        sessionExists: state.session && typeof state.session.session !== 'undefined',
        username: user ? user.username : null,
        userOwnsProject: ownProps.authorUsername && user &&
            (ownProps.authorUsername === user.username),
        stageSizeMode: state.scratchGui.stageSize.stageSize,
        vm: state.scratchGui.vm,
        peripheralName: state.scratchGui.connectionModal.peripheralName,
        deviceId: state.scratchGui.device.deviceId,
        deviceName: state.scratchGui.device.deviceName,
        baudrate: state.scratchGui.hardwareConsole.baudrate,
        deviceData: state.scratchGui.deviceData.deviceData
    };
};

const mapDispatchToProps = dispatch => ({
    autoUpdateProject: () => dispatch(autoUpdateProject()),
    onOpenTipLibrary: () => dispatch(openTipsLibrary()),
    onClickAccount: () => dispatch(openAccountMenu()),
    onRequestCloseAccount: () => dispatch(closeAccountMenu()),
    onClickFile: () => dispatch(openFileMenu()),
    onRequestCloseFile: () => dispatch(closeFileMenu()),
    onClickSetting: () => dispatch(openSettingMenu()),
    onRequestCloseSetting: () => dispatch(closeSettingMenu()),
    onClickEdit: () => dispatch(openEditMenu()),
    onRequestCloseEdit: () => dispatch(closeEditMenu()),
    onClickLanguage: () => dispatch(openLanguageMenu()),
    onRequestCloseLanguage: () => dispatch(closeLanguageMenu()),
    onClickLogin: () => dispatch(openLoginMenu()),
    onRequestCloseLogin: () => dispatch(closeLoginMenu()),
    onRequestOpenAbout: () => dispatch(openAboutMenu()),
    onRequestCloseAbout: () => dispatch(closeAboutMenu()),
    onClickNew: needSave => dispatch(requestNewProject(needSave)),
    onClickRemix: () => dispatch(remixProject()),
    onClickSave: () => dispatch(manualUpdateProject()),
    onShowSaveSuccess: () => showAlertWithTimeout(dispatch, 'localSaveSuccess'),
    onShowSavingError: () => showAlertWithTimeout(dispatch, 'localSaveError'),
    onClickSaveAsCopy: () => dispatch(saveProjectAsCopy()),
    onSeeCommunity: () => dispatch(setPlayer(true)),
    onSetUploadMode: () => {
        dispatch(setUploadMode());
        dispatch(setRealtimeConnection(false));
    },
    onSetRealtimeConnection: state => dispatch(setRealtimeConnection(state)),
    onSetRealtimeMode: () => dispatch(setRealtimeMode()),
    onSetStageLarge: () => dispatch(setStageSize(STAGE_SIZE_MODES.large)),
    onOpenConnectionModal: () => dispatch(openConnectionModal()),
    onPeripheralConnected: peripheralName => dispatch(setConnectionModalPeripheralName(peripheralName)),
    onOpenUploadProgress: () => dispatch(openUploadProgress()),
    onDisconnect: () => {
        dispatch(clearConnectionModalPeripheralName());
        dispatch(setRealtimeConnection(false));
    },
    onSetUpdate: message => {
        dispatch(setUpdate(message));
        dispatch(openUpdateModal());
    },
    onNoPeripheralIsConnected: () => showAlertWithTimeout(dispatch, 'connectAPeripheralFirst'),
    onWorkspaceIsEmpty: () => showAlertWithTimeout(dispatch, 'workspaceIsEmpty'),
    onWorkspaceIsNotEmpty: () => showAlertWithTimeout(dispatch, 'workspaceIsNotEmpty'),
    onOpenDeviceLibrary: () => dispatch(openDeviceLibrary()),
    onDeviceIsEmpty: () => showAlertWithTimeout(dispatch, 'selectADeviceFirst')
});

export default compose(
    injectIntl,
    MenuBarHOC,
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(MenuBar);
