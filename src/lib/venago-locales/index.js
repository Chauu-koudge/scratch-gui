/**
 * Venago: Indian and other world languages for the editor (in addition to the languages
 * shipped by openblock-l10n: English, Russian, Simplified and Traditional Chinese). Each language translates the most visible parts of the editor:
 * tabs, menu bar, hamburger menu, connection menu, sprite pane, libraries, block
 * categories and the common blocks. Anything else falls back to English.
 *
 * Translations are stored as ordered lists (see translations-*.js) matching GUI_KEYS and
 * BLOCK_KEYS below; checkTranslations() verifies lengths and %1 / {port} placeholders.
 */
import asLocaleData from 'react-intl/locale-data/as';
import bnLocaleData from 'react-intl/locale-data/bn';
import guLocaleData from 'react-intl/locale-data/gu';
import hiLocaleData from 'react-intl/locale-data/hi';
import knLocaleData from 'react-intl/locale-data/kn';
import mlLocaleData from 'react-intl/locale-data/ml';
import mrLocaleData from 'react-intl/locale-data/mr';
import orLocaleData from 'react-intl/locale-data/or';
import paLocaleData from 'react-intl/locale-data/pa';
import taLocaleData from 'react-intl/locale-data/ta';
import teLocaleData from 'react-intl/locale-data/te';
import urLocaleData from 'react-intl/locale-data/ur';
import arLocaleData from 'react-intl/locale-data/ar';
import deLocaleData from 'react-intl/locale-data/de';
import esLocaleData from 'react-intl/locale-data/es';
import frLocaleData from 'react-intl/locale-data/fr';
import idLocaleData from 'react-intl/locale-data/id';
import itLocaleData from 'react-intl/locale-data/it';
import jaLocaleData from 'react-intl/locale-data/ja';
import koLocaleData from 'react-intl/locale-data/ko';
import msLocaleData from 'react-intl/locale-data/ms';
import ptLocaleData from 'react-intl/locale-data/pt';
import thLocaleData from 'react-intl/locale-data/th';
import trLocaleData from 'react-intl/locale-data/tr';
import viLocaleData from 'react-intl/locale-data/vi';

import part1 from './translations-1';
import part2 from './translations-2';
import part3 from './translations-3';
import part4 from './translations-4';
import part5 from './translations-5';

/** Editor (react-intl) message ids, in the order used by the `gui` lists. */
const GUI_KEYS = [
    'gui.gui.codeTab', 'gui.gui.costumesTab', 'gui.gui.soundsTab', 'gui.gui.backdropsTab',
    'gui.menuBar.noDeviceSelected', 'gui.menuBar.noConnection', 'gui.menu-bar.programMode', 'gui.hardwareHeader.upload',
    'gui.gui.addExtension', 'gui.extensionLibrary.chooseAnExtension', 'gui.deviceLibrary.chooseADevice',
    'gui.SpriteInfo.sprite', 'gui.SpriteInfo.show', 'gui.SpriteInfo.size', 'gui.SpriteInfo.direction',
    'gui.stageSelector.stage', 'gui.stageSelector.backdrops', 'gui.library.filterPlaceholder', 'gui.library.allTag',
    'gui.extensionLibrary.loaded', 'gui.extensionLibrary.notLoaded', 'gui.controls.go', 'gui.controls.stop',
    'gui.tipsLibrary.tutorials', 'gui.spriteSelector.addSpriteFromLibrary', 'gui.spriteSelector.addBackdropFromLibrary',
    'gui.venago.moreMenu.new', 'gui.venago.moreMenu.loadFromComputer', 'gui.venago.moreMenu.saveNow',
    'gui.venago.moreMenu.saveAsCopy', 'gui.venago.moreMenu.downloadToComputer', 'gui.venago.moreMenu.wiki',
    'gui.venago.moreMenu.tutorials', 'gui.venago.moreMenu.screenshot', 'gui.venago.moreMenu.uploadFirmware',
    'gui.venago.controls.undo', 'gui.venago.controls.redo',
    'gui.venago.connection.noBoardTitle', 'gui.venago.connection.selectBoard', 'gui.venago.connection.subtitle',
    'gui.venago.connection.serial', 'gui.venago.connection.bluetooth', 'gui.venago.connection.refresh',
    'gui.venago.connection.changeBoard', 'gui.venago.connection.disconnect', 'gui.venago.connection.scanning',
    'gui.venago.connection.noSerialPort', 'gui.venago.connection.connected', 'gui.venago.alerts.localSaveSuccess'
];

/** Block (Blockly.Msg) keys, in the order used by the `blocks` lists. */
const BLOCK_KEYS = [
    'CATEGORY_MOTION', 'CATEGORY_LOOKS', 'CATEGORY_SOUND', 'CATEGORY_EVENTS', 'CATEGORY_CONTROL', 'CATEGORY_SENSING',
    'CATEGORY_OPERATORS', 'CATEGORY_VARIABLES', 'CATEGORY_MYBLOCKS',
    'MOTION_MOVESTEPS', 'MOTION_TURNRIGHT', 'MOTION_TURNLEFT', 'MOTION_POINTINDIRECTION', 'MOTION_POINTTOWARDS',
    'MOTION_GOTO', 'MOTION_GOTOXY', 'MOTION_GLIDETO', 'MOTION_GLIDESECSTOXY', 'MOTION_CHANGEXBY', 'MOTION_SETX',
    'MOTION_CHANGEYBY', 'MOTION_SETY', 'MOTION_IFONEDGEBOUNCE', 'MOTION_SETROTATIONSTYLE', 'MOTION_XPOSITION',
    'MOTION_YPOSITION', 'MOTION_DIRECTION',
    'MOTION_GOTO_POINTER', 'MOTION_GOTO_RANDOM', 'MOTION_POINTTOWARDS_RANDOM',
    'LOOKS_SAYFORSECS', 'LOOKS_SAY', 'LOOKS_HELLO', 'LOOKS_THINKFORSECS', 'LOOKS_THINK', 'LOOKS_HMM', 'LOOKS_SHOW',
    'LOOKS_HIDE', 'LOOKS_SWITCHCOSTUMETO', 'LOOKS_NEXTCOSTUME', 'LOOKS_SWITCHBACKDROPTO', 'LOOKS_NEXTBACKDROP',
    'LOOKS_CHANGESIZEBY', 'LOOKS_SETSIZETO', 'LOOKS_SIZE', 'LOOKS_CHANGEEFFECTBY', 'LOOKS_SETEFFECTTO',
    'LOOKS_CLEARGRAPHICEFFECTS', 'LOOKS_EFFECT_COLOR', 'LOOKS_GOTOFRONTBACK', 'LOOKS_GOTOFRONTBACK_FRONT',
    'LOOKS_GOTOFRONTBACK_BACK',
    'SOUND_PLAYUNTILDONE', 'SOUND_PLAY', 'SOUND_STOPALLSOUNDS', 'SOUND_CHANGEVOLUMEBY', 'SOUND_SETVOLUMETO', 'SOUND_VOLUME',
    'EVENT_WHENFLAGCLICKED', 'EVENT_WHENKEYPRESSED', 'EVENT_WHENTHISSPRITECLICKED', 'EVENT_WHENBACKDROPSWITCHESTO',
    'EVENT_WHENBROADCASTRECEIVED', 'EVENT_BROADCAST', 'EVENT_BROADCASTANDWAIT', 'EVENT_WHENARDUINOBEGIN',
    'EVENT_WHENKEYPRESSED_SPACE', 'EVENT_WHENKEYPRESSED_ANY',
    'CONTROL_WAIT', 'CONTROL_REPEAT', 'CONTROL_FOREVER', 'CONTROL_IF', 'CONTROL_ELSE', 'CONTROL_WAITUNTIL',
    'CONTROL_REPEATUNTIL', 'CONTROL_STOP', 'CONTROL_STOP_ALL', 'CONTROL_STARTASCLONE', 'CONTROL_CREATECLONEOF',
    'CONTROL_CREATECLONEOF_MYSELF', 'CONTROL_DELETETHISCLONE',
    'SENSING_TOUCHINGOBJECT', 'SENSING_TOUCHINGOBJECT_EDGE', 'SENSING_TOUCHINGCOLOR', 'SENSING_DISTANCETO',
    'SENSING_ASKANDWAIT', 'SENSING_ASK_TEXT', 'SENSING_ANSWER', 'SENSING_KEYPRESSED', 'SENSING_MOUSEDOWN',
    'SENSING_MOUSEX', 'SENSING_MOUSEY', 'SENSING_LOUDNESS', 'SENSING_TIMER', 'SENSING_RESETTIMER', 'SENSING_CURRENT',
    'OPERATORS_RANDOM', 'OPERATORS_AND', 'OPERATORS_OR', 'OPERATORS_NOT', 'OPERATORS_JOIN', 'OPERATORS_JOIN_APPLE',
    'OPERATORS_JOIN_BANANA', 'OPERATORS_LETTEROF', 'OPERATORS_LENGTH', 'OPERATORS_CONTAINS', 'OPERATORS_ROUND',
    'DATA_SETVARIABLETO', 'DATA_CHANGEVARIABLEBY', 'DATA_SHOWVARIABLE', 'DATA_HIDEVARIABLE', 'DATA_ADDTOLIST',
    'DATA_DELETEOFLIST', 'DATA_ITEMOFLIST', 'DATA_LENGTHOFLIST',
    'NEW_VARIABLE', 'NEW_LIST', 'NEW_PROCEDURE', 'PROCEDURES_DEFINITION', 'DUPLICATE', 'DELETE', 'ADD_COMMENT',
    'CLEAN_UP', 'UNDO', 'REDO', 'DELETE_BLOCK'
];

/** Block keys that reuse another key's translation. */
const BLOCK_ALIASES = {
    MOTION_POINTTOWARDS_POINTER: 'MOTION_GOTO_POINTER',
    MOTION_GLIDETO_POINTER: 'MOTION_GOTO_POINTER',
    SENSING_TOUCHINGOBJECT_POINTER: 'MOTION_GOTO_POINTER',
    SENSING_DISTANCETO_POINTER: 'MOTION_GOTO_POINTER',
    MOTION_GLIDETO_RANDOM: 'MOTION_GOTO_RANDOM',
    LOOKS_NEXTBACKDROP_BLOCK: 'LOOKS_NEXTBACKDROP',
    SENSING_OF_SIZE: 'LOOKS_SIZE',
    SENSING_OF_DIRECTION: 'MOTION_DIRECTION',
    SENSING_OF_XPOSITION: 'MOTION_XPOSITION',
    SENSING_OF_YPOSITION: 'MOTION_YPOSITION'
};

// Indian languages first, then other world languages.
const LANGUAGES = Object.assign({}, part1, part2, part3, part4, part5);

/** react-intl plural / date data for the added languages. */
const venagoLocaleData = [].concat(
    hiLocaleData, bnLocaleData, mrLocaleData, teLocaleData, taLocaleData, guLocaleData,
    knLocaleData, mlLocaleData, paLocaleData, orLocaleData, asLocaleData, urLocaleData,
    esLocaleData, frLocaleData, deLocaleData, ptLocaleData, itLocaleData, trLocaleData,
    jaLocaleData, koLocaleData, arLocaleData, idLocaleData, msLocaleData, viLocaleData, thLocaleData
);

/** {code: native name} for the language menu, in a fixed order. */
const venagoLocaleNames = {};
Object.keys(LANGUAGES).forEach(code => {
    venagoLocaleNames[code] = LANGUAGES[code].name;
});

const VENAGO_RTL = Object.keys(LANGUAGES).filter(code => LANGUAGES[code].rtl);
const isVenagoRtl = locale => VENAGO_RTL.includes(locale);

const placeholders = text => (String(text).match(/%\d+|\{\w+\}/g) || []).sort()
    .join(',');

/**
 * Check every language against the English texts (lengths and placeholders).
 * @param {object} englishGui - editor messages for "en".
 * @param {object} englishBlocks - Blockly messages for "en".
 * @return {Array.<string>} problems found (empty when everything is fine).
 */
const checkTranslations = (englishGui, englishBlocks) => {
    const problems = [];
    Object.keys(LANGUAGES).forEach(code => {
        const {gui, blocks} = LANGUAGES[code];
        if (gui.length !== GUI_KEYS.length) problems.push(`${code}: gui has ${gui.length}, expected ${GUI_KEYS.length}`);
        if (blocks.length !== BLOCK_KEYS.length) {
            problems.push(`${code}: blocks has ${blocks.length}, expected ${BLOCK_KEYS.length}`);
        }
        GUI_KEYS.forEach((key, i) => {
            if (englishGui && englishGui[key] && placeholders(englishGui[key]) !== placeholders(gui[i])) {
                problems.push(`${code}: ${key} placeholders differ ("${gui[i]}")`);
            }
        });
        BLOCK_KEYS.forEach((key, i) => {
            if (englishBlocks && englishBlocks[key] && placeholders(englishBlocks[key]) !== placeholders(blocks[i])) {
                problems.push(`${code}: ${key} placeholders differ ("${blocks[i]}")`);
            }
        });
    });
    return problems;
};

/**
 * Editor messages for every added language: English as the base, translated ids on top.
 * @param {object} englishMessages - editor messages for "en".
 * @return {object} {code: messages}.
 */
const buildEditorMessages = englishMessages => {
    const result = {};
    Object.keys(LANGUAGES).forEach(code => {
        const messages = Object.assign({}, englishMessages);
        GUI_KEYS.forEach((key, i) => {
            if (LANGUAGES[code].gui[i]) messages[key] = LANGUAGES[code].gui[i];
        });
        result[code] = messages;
    });
    return result;
};

/**
 * Register the block translations on a ScratchBlocks instance (safe to call repeatedly).
 * English is the base, so untranslated blocks show in English rather than in whatever
 * language was selected before.
 * @param {object} ScratchBlocks - the openblock-blocks instance.
 * @return {object} the same ScratchBlocks instance.
 */
const registerBlocksLocales = ScratchBlocks => {
    if (!ScratchBlocks || !ScratchBlocks.ScratchMsgs || !ScratchBlocks.ScratchMsgs.locales) return ScratchBlocks;
    const locales = ScratchBlocks.ScratchMsgs.locales;
    const english = locales.en || {};
    Object.keys(LANGUAGES).forEach(code => {
        if (locales[code] && locales[code].venagoTranslated) return;
        const messages = Object.assign({}, english);
        BLOCK_KEYS.forEach((key, i) => {
            if (LANGUAGES[code].blocks[i]) messages[key] = LANGUAGES[code].blocks[i];
        });
        Object.keys(BLOCK_ALIASES).forEach(alias => {
            const index = BLOCK_KEYS.indexOf(BLOCK_ALIASES[alias]);
            if (index !== -1 && LANGUAGES[code].blocks[index]) messages[alias] = LANGUAGES[code].blocks[index];
        });
        Object.defineProperty(messages, 'venagoTranslated', {value: true});
        locales[code] = messages;
    });
    return ScratchBlocks;
};

export {
    GUI_KEYS,
    BLOCK_KEYS,
    venagoLocaleData,
    venagoLocaleNames,
    isVenagoRtl,
    checkTranslations,
    buildEditorMessages,
    registerBlocksLocales
};
