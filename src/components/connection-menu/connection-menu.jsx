/**
 * Venago: PictoBlox-style connection dropdown for the menu bar's "Unconnected" button.
 *
 *  - No board selected: a board picture, a message and a "Select board" button.
 *  - Board selected, not connected: "Serial (USB)" and "Bluetooth" sections that list the
 *    serial ports on this computer (live, from Venago Link). Click a port to connect.
 *    Bluetooth lists paired Bluetooth serial ports (HC-05 / HC-06, ESP32 Classic
 *    Bluetooth), which Windows shows as COM ports after pairing.
 *  - Connected: the port name and a "Disconnect" button.
 */
import bindAll from 'lodash.bindall';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import VM from 'openblock-vm';

import styles from './connection-menu.css';

const BOARD_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">' +
    '<rect x="6" y="10" width="148" height="82" rx="8" fill="#1f8a8a" stroke="#156b6b" stroke-width="3"/>' +
    '<rect x="0" y="34" width="22" height="22" rx="2" fill="#c9ced6" stroke="#8a919c" stroke-width="2"/>' +
    '<rect x="2" y="64" width="18" height="16" rx="2" fill="#2b2b2b"/>' +
    '<rect x="62" y="40" width="50" height="22" rx="2" fill="#2b2b2b"/>' +
    '<g fill="#c9ced6">' +
    '<rect x="66" y="36" width="3" height="4"/><rect x="74" y="36" width="3" height="4"/>' +
    '<rect x="82" y="36" width="3" height="4"/><rect x="90" y="36" width="3" height="4"/>' +
    '<rect x="98" y="36" width="3" height="4"/><rect x="106" y="36" width="3" height="4"/>' +
    '<rect x="66" y="62" width="3" height="4"/><rect x="74" y="62" width="3" height="4"/>' +
    '<rect x="82" y="62" width="3" height="4"/><rect x="90" y="62" width="3" height="4"/>' +
    '<rect x="98" y="62" width="3" height="4"/><rect x="106" y="62" width="3" height="4"/>' +
    '</g>' +
    '<g fill="#2b2b2b"><rect x="40" y="14" width="104" height="8" rx="1"/><rect x="60" y="80" width="84" height="8" rx="1"/></g>' +
    '<circle cx="32" cy="22" r="3" fill="#ffd34d"/><circle cx="140" cy="44" r="3" fill="#7CFC7C"/>' +
    '<circle cx="18" cy="18" r="3" fill="#156b6b"/><circle cx="146" cy="84" r="3" fill="#156b6b"/>' +
    '</svg>'
)}`;

const UsbIcon = () => (
    <svg
        height="16"
        viewBox="0 0 24 24"
        width="16"
    >
        <path
            d="M12 2l3 4h-2v9.3l3-1.9V11h-1V8h4v3h-1v3.5l-5 3.1V19a2 2 0 1 1-2 0v-2.6L6 13.6V11.7A2 2 0 1 1 8 11.7v1.1l3 1.9V6H9z"
            fill="currentColor"
        />
    </svg>
);

const BluetoothIcon = () => (
    <svg
        height="16"
        viewBox="0 0 24 24"
        width="16"
    >
        <path
            d="M7 7l10 10-5 5V2l5 5L7 17"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
        />
    </svg>
);

const Chevron = ({open}) => (
    <svg
        className={classNames(styles.chevron, {[styles.open]: open})}
        height="12"
        viewBox="0 0 24 24"
        width="12"
    >
        <path
            d="M9 5l7 7-7 7"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3"
        />
    </svg>
);
Chevron.propTypes = {open: PropTypes.bool};

const SECTIONS = ['serial', 'bluetooth'];

class ConnectionMenu extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleConnect',
            'handleConnected',
            'handleDisconnect',
            'handleDocumentMouseDown',
            'handleListUpdate',
            'handleRefresh',
            'handleRequestError',
            'handleScanTimeout',
            'handleSelectBoard',
            'setRef',
            'toggleSection'
        ]);
        this.state = this.initialState();
    }
    componentDidMount () {
        const {vm} = this.props;
        vm.on('PERIPHERAL_LIST_UPDATE', this.handleListUpdate);
        vm.on('PERIPHERAL_SCAN_TIMEOUT', this.handleScanTimeout);
        vm.on('PERIPHERAL_REQUEST_ERROR', this.handleRequestError);
        vm.on('PERIPHERAL_CONNECTED', this.handleConnected);
        if (this.props.open) this.onOpen();
    }
    componentDidUpdate (prevProps) {
        if (this.props.open && !prevProps.open) this.onOpen();
        if (!this.props.open && prevProps.open) this.onClose();
        if (this.props.open && this.props.deviceId !== prevProps.deviceId) this.onOpen();
    }
    componentWillUnmount () {
        const {vm} = this.props;
        vm.removeListener('PERIPHERAL_LIST_UPDATE', this.handleListUpdate);
        vm.removeListener('PERIPHERAL_SCAN_TIMEOUT', this.handleScanTimeout);
        vm.removeListener('PERIPHERAL_REQUEST_ERROR', this.handleRequestError);
        vm.removeListener('PERIPHERAL_CONNECTED', this.handleConnected);
        document.removeEventListener('mousedown', this.handleDocumentMouseDown, true);
    }
    initialState () {
        return {
            openSection: 'serial',
            ports: [],
            scanning: false,
            linkUnavailable: false,
            connectingPort: null,
            error: null
        };
    }
    isConnected () {
        return !!(this.props.deviceId && this.props.vm.getPeripheralIsConnected(this.props.deviceId));
    }
    onOpen () {
        document.addEventListener('mousedown', this.handleDocumentMouseDown, true);
        this.setState(this.initialState());
        if (this.props.deviceId && !this.isConnected()) this.startScan();
    }
    onClose () {
        document.removeEventListener('mousedown', this.handleDocumentMouseDown, true);
        // Stop scanning (closes the Link session) unless we are now connected.
        if (this.scanStarted && this.props.deviceId && !this.isConnected()) {
            try {
                this.props.vm.disconnectPeripheral(this.props.deviceId);
            } catch (e) {
                // nothing to stop
            }
        }
        this.scanStarted = false;
    }
    startScan () {
        this.scanStarted = true;
        this.setState({scanning: true, ports: [], linkUnavailable: false, error: null});
        // List every port (like PictoBlox); the board name is shown next to each one.
        this.props.vm.scanForPeripheral(this.props.deviceId, true);
    }
    handleDocumentMouseDown (e) {
        if (this.rootRef && this.rootRef.contains(e.target)) return;
        if (e.target.closest && e.target.closest('[data-venago-connection-toggle]')) return;
        this.props.onRequestClose();
    }
    handleListUpdate (list) {
        if (!this.props.open) return;
        // Bluetooth "incoming" ports (used when a phone app connects to this PC) go last.
        const ports = Object.keys(list).map(id => list[id])
            .sort((a, b) => ((a.incoming ? 1 : 0) - (b.incoming ? 1 : 0)) ||
                String(a.peripheralId).localeCompare(String(b.peripheralId), undefined, {numeric: true}));
        this.setState({ports, scanning: false, linkUnavailable: false});
    }
    handleScanTimeout () {
        if (this.props.open) this.setState({scanning: false});
    }
    handleRequestError (err) {
        if (!this.props.open) return;
        if (this.state.connectingPort) {
            this.setState({
                connectingPort: null,
                error: (err && err.message) || 'Could not open the port.'
            });
        } else {
            this.setState({scanning: false, linkUnavailable: true});
        }
    }
    handleConnected () {
        if (!this.state.connectingPort) return;
        const port = this.state.connectingPort;
        this.setState({connectingPort: null});
        this.scanStarted = false;
        this.props.onConnected(port.path || port.peripheralId);
        this.props.onRequestClose();
    }
    handleConnect (port) {
        const {deviceData, deviceId, isRealtimeMode, vm} = this.props;
        const device = deviceData.find(dev => dev.deviceId === deviceId);
        const supportsRealtime = !!(device && device.programMode && device.programMode.includes('realtime'));
        this.setState({connectingPort: port, error: null});
        if (isRealtimeMode && supportsRealtime) {
            vm.connectPeripheral(deviceId, port.peripheralId);
        } else {
            vm.connectPeripheral(deviceId, port.peripheralId, parseInt(this.props.baudrate, 10));
        }
    }
    handleDisconnect () {
        try {
            this.props.vm.disconnectPeripheral(this.props.deviceId);
        } finally {
            this.props.onRequestClose();
        }
    }
    handleRefresh () {
        this.startScan();
    }
    handleSelectBoard () {
        this.props.onRequestClose();
        this.props.onSelectDevice();
    }
    toggleSection (section) {
        this.setState(state => ({openSection: state.openSection === section ? null : section}));
    }
    setRef (ref) {
        this.rootRef = ref;
    }
    renderNoBoard () {
        return (
            <div className={styles.empty}>
                <img
                    alt=""
                    className={styles.emptyImage}
                    draggable={false}
                    src={BOARD_IMAGE}
                />
                <div className={styles.emptyTitle}>
                    <FormattedMessage
                        defaultMessage="No board selected"
                        description="Connection menu title when no board is selected"
                        id="gui.venago.connection.noBoardTitle"
                    />
                </div>
                <div className={styles.emptyText}>
                    <FormattedMessage
                        defaultMessage="Select your board first, then connect it to this computer with a USB cable or Bluetooth."
                        description="Connection menu text when no board is selected"
                        id="gui.venago.connection.noBoardText"
                    />
                </div>
                <button
                    className={styles.primaryButton}
                    type="button"
                    onClick={this.handleSelectBoard}
                >
                    <FormattedMessage
                        defaultMessage="Select board"
                        description="Button to open the board library"
                        id="gui.venago.connection.selectBoard"
                    />
                </button>
            </div>
        );
    }
    renderHeader (device) {
        return (
            <div className={styles.header}>
                {device && (device.connectionSmallIconURL || device.iconURL) ? (
                    <img
                        alt=""
                        className={styles.headerIcon}
                        draggable={false}
                        src={device.connectionSmallIconURL || device.iconURL}
                    />
                ) : null}
                <div>
                    <div className={styles.headerTitle}>{this.props.deviceName || (device && device.name)}</div>
                    <div className={styles.headerSubtitle}>
                        <FormattedMessage
                            defaultMessage="Choose how to connect your board"
                            description="Connection menu subtitle"
                            id="gui.venago.connection.subtitle"
                        />
                    </div>
                </div>
            </div>
        );
    }
    renderPorts (section, device) {
        const {ports, scanning, linkUnavailable, connectingPort} = this.state;
        const list = ports.filter(port => (port.transport || 'serial') === section);
        if (linkUnavailable) {
            return (
                <div className={styles.error}>
                    <FormattedMessage
                        defaultMessage="Venago Link is not running. Start Venago Link on this computer, then click Refresh."
                        description="Connection menu error when the link is not running"
                        id="gui.venago.connection.linkUnavailable"
                    />
                </div>
            );
        }
        const notes = [];
        if (list.length === 0) {
            notes.push(scanning ? (
                <FormattedMessage
                    defaultMessage="Looking for ports…"
                    description="Connection menu: scanning"
                    id="gui.venago.connection.scanning"
                    key="scanning"
                />
            ) : (
                section === 'serial' ? (
                    <div key="none">
                        <b>
                            <FormattedMessage
                                defaultMessage="No board found on any serial port."
                                description="Connection menu: no serial port"
                                id="gui.venago.connection.noSerialPort"
                            />
                        </b>
                        <ul className={styles.checklist}>
                            <li>
                                <FormattedMessage
                                    defaultMessage="Plug in the board itself (Arduino, ESP32, Pico, micro:bit…). Phones and other USB devices are not listed."
                                    description="Connection menu checklist: board"
                                    id="gui.venago.connection.checkBoard"
                                />
                            </li>
                            <li>
                                <FormattedMessage
                                    defaultMessage="Use a data USB cable. Many cables only charge and the board will not appear."
                                    description="Connection menu checklist: cable"
                                    id="gui.venago.connection.checkCable"
                                />
                            </li>
                            <li>
                                <FormattedMessage
                                    defaultMessage="Clone boards need a USB driver: {ch340} or {cp210x}."
                                    description="Connection menu checklist: drivers"
                                    id="gui.venago.connection.checkDriver"
                                    values={{
                                        ch340: (
                                            <a
                                                href="https://www.wch-ic.com/downloads/CH341SER_EXE.html"
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >{'CH340'}</a>
                                        ),
                                        cp210x: (
                                            <a
                                                href="https://www.silabs.com/developer-tools/usb-to-uart-bridge-vcp-drivers"
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >{'CP210x'}</a>
                                        )
                                    }}
                                />
                            </li>
                        </ul>
                    </div>
                ) : (
                    <FormattedMessage
                        defaultMessage="No Bluetooth port found."
                        description="Connection menu: no bluetooth port"
                        id="gui.venago.connection.noBluetoothPort"
                        key="none"
                    />
                )
            ));
        }
        if (section === 'bluetooth') {
            notes.push(device && device.type === 'microbit' ? (
                <FormattedMessage
                    defaultMessage="micro:bit connects over USB. Use Serial."
                    description="Connection menu: micro:bit bluetooth note"
                    id="gui.venago.connection.microbitBluetooth"
                    key="help"
                />
            ) : (
                <div key="help">
                    <FormattedMessage
                        defaultMessage="Pair your Bluetooth module (HC-05 / HC-06 – PIN 1234 or 0000 – or an ESP32 running Bluetooth Serial) in Windows Bluetooth settings first. It then shows up here as a COM port."
                        description="Connection menu: bluetooth pairing help"
                        id="gui.venago.connection.bluetoothHelp"
                    />
                    <div>
                        <a
                            className={styles.inlineLink}
                            href="ms-settings:bluetooth"
                        >
                            <FormattedMessage
                                defaultMessage="Open Bluetooth settings"
                                description="Connection menu: open Windows bluetooth settings"
                                id="gui.venago.connection.openBluetoothSettings"
                            />
                        </a>
                    </div>
                </div>
            ));
        }
        return (
            <div className={styles.portList}>
                {list.map(port => (
                    <button
                        className={styles.port}
                        disabled={!!connectingPort}
                        key={port.peripheralId}
                        type="button"
                        // eslint-disable-next-line react/jsx-no-bind
                        onClick={() => this.handleConnect(port)}
                    >
                        <span className={styles.portName}>
                            {connectingPort && connectingPort.peripheralId === port.peripheralId ? (
                                <FormattedMessage
                                    defaultMessage="Connecting to {port}…"
                                    description="Connection menu: connecting"
                                    id="gui.venago.connection.connecting"
                                    values={{port: port.path || port.peripheralId}}
                                />
                            ) : (port.path || port.peripheralId)}
                        </span>
                        <span className={styles.portBoard}>{port.boardName || port.name}</span>
                    </button>
                ))}
                {notes.map(note => (
                    <div
                        className={styles.note}
                        key={note.key}
                    >{note}</div>
                ))}
            </div>
        );
    }
    renderSections (device) {
        const titles = {
            serial: (
                <FormattedMessage
                    defaultMessage="Serial (USB)"
                    description="Connection menu: serial section"
                    id="gui.venago.connection.serial"
                />
            ),
            bluetooth: (
                <FormattedMessage
                    defaultMessage="Bluetooth"
                    description="Connection menu: bluetooth section"
                    id="gui.venago.connection.bluetooth"
                />
            )
        };
        return (
            <React.Fragment>
                {this.renderHeader(device)}
                {SECTIONS.map(section => {
                    const open = this.state.openSection === section;
                    const count = this.state.ports.filter(p => (p.transport || 'serial') === section).length;
                    return (
                        <div key={section}>
                            <button
                                className={classNames(styles.sectionToggle, {[styles.open]: open})}
                                type="button"
                                // eslint-disable-next-line react/jsx-no-bind
                                onClick={() => this.toggleSection(section)}
                            >
                                <span className={styles.sectionIcon}>
                                    {section === 'serial' ? <UsbIcon /> : <BluetoothIcon />}
                                </span>
                                {titles[section]}
                                <span className={styles.sectionCount}>{count > 0 ? count : ''}</span>
                                <Chevron open={open} />
                            </button>
                            {open ? this.renderPorts(section, device) : null}
                        </div>
                    );
                })}
                {this.state.error ? (
                    <div className={styles.error}>{this.state.error}</div>
                ) : null}
                <div className={styles.footer}>
                    <button
                        className={styles.linkButton}
                        type="button"
                        onClick={this.handleRefresh}
                    >
                        <FormattedMessage
                            defaultMessage="↻ Refresh"
                            description="Connection menu: refresh ports"
                            id="gui.venago.connection.refresh"
                        />
                    </button>
                    <button
                        className={styles.linkButton}
                        type="button"
                        onClick={this.handleSelectBoard}
                    >
                        <FormattedMessage
                            defaultMessage="Change board"
                            description="Connection menu: change board"
                            id="gui.venago.connection.changeBoard"
                        />
                    </button>
                </div>
            </React.Fragment>
        );
    }
    renderConnected (device) {
        return (
            <React.Fragment>
                {this.renderHeader(device)}
                <div className={styles.connected}>
                    <div>
                        <span className={styles.connectedDot} />
                        <FormattedMessage
                            defaultMessage="Connected to {port}"
                            description="Connection menu: connected"
                            id="gui.venago.connection.connected"
                            values={{port: <b>{this.props.peripheralName}</b>}}
                        />
                    </div>
                    <button
                        className={styles.dangerButton}
                        type="button"
                        onClick={this.handleDisconnect}
                    >
                        <FormattedMessage
                            defaultMessage="Disconnect"
                            description="Connection menu: disconnect"
                            id="gui.venago.connection.disconnect"
                        />
                    </button>
                </div>
            </React.Fragment>
        );
    }
    render () {
        if (!this.props.open) return null;
        const device = this.props.deviceData.find(dev => dev.deviceId === this.props.deviceId);
        let content;
        if (!this.props.deviceId) {
            content = this.renderNoBoard();
        } else if (this.props.peripheralName && this.isConnected()) {
            content = this.renderConnected(device);
        } else {
            content = this.renderSections(device);
        }
        return (
            <div
                className={styles.menu}
                ref={this.setRef}
            >
                {content}
            </div>
        );
    }
}

ConnectionMenu.propTypes = {
    baudrate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    deviceData: PropTypes.instanceOf(Array).isRequired,
    deviceId: PropTypes.string,
    deviceName: PropTypes.string,
    isRealtimeMode: PropTypes.bool,
    onConnected: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    onSelectDevice: PropTypes.func.isRequired,
    open: PropTypes.bool,
    peripheralName: PropTypes.string,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default ConnectionMenu;
