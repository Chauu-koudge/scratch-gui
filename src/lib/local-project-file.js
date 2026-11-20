/**
 * Venago: save the project to a file on this computer (the editor has no project server).
 *
 *  - "Save now": the first time, asks where to save (Chrome / Edge "Save as" dialog);
 *    after that it saves straight back into the same file, like a desktop app.
 *  - "Save as a copy": always asks for a new file and leaves "Save now" pointing at the
 *    original file.
 *  - Browsers without the File System Access API (Firefox, Safari) download the file.
 *
 * Loading or creating a project forgets the remembered file, so "Save now" never
 * overwrites another project's file.
 *
 * Note: written with plain promises, not async/await. This project's Babel setup turns
 * async functions into regenerator code without including regeneratorRuntime, which
 * crashes the whole editor at load time.
 */
import downloadBlob from './download-blob';

const FILE_TYPES = [{
    description: 'Venago project',
    accept: {'application/x.scratch.sb3': ['.ob', '.sb3']}
}];

let currentFileHandle = null;
let watchedRuntime = null;

const forgetFile = () => {
    currentFileHandle = null;
};

/**
 * Forget the remembered file whenever another project is loaded.
 * @param {object} vm - the VM.
 */
const watchProjectLoads = vm => {
    if (!vm || !vm.runtime || watchedRuntime === vm.runtime) return;
    watchedRuntime = vm.runtime;
    vm.runtime.on('PROJECT_LOADED', forgetFile);
};

const canPickFiles = () => typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function';

const copyName = filename => filename.replace(/(\.\w+)?$/, ' copy$1');

const writeToHandle = (handle, blob) => handle.createWritable()
    .then(writable => writable.write(blob).then(() => writable.close()));

/**
 * Save the project.
 * @param {object} options - save options.
 * @param {object} options.vm - the VM.
 * @param {string} options.filename - suggested file name, e.g. "My Project.ob".
 * @param {boolean} [options.asCopy] - always ask for a new file and keep the current one.
 * @return {Promise<?string>} the saved file name, or null if the user cancelled.
 */
const saveProjectToComputer = ({vm, filename, asCopy = false}) => {
    watchProjectLoads(vm);
    return vm.saveProjectSb3().then(blob => {
        if (!canPickFiles()) {
            const name = asCopy ? copyName(filename) : filename;
            downloadBlob(name, blob);
            return name;
        }
        const knownHandle = asCopy ? null : currentFileHandle;
        const pickHandle = knownHandle ? Promise.resolve(knownHandle) : window.showSaveFilePicker({
            suggestedName: asCopy ? copyName(filename) : filename,
            types: FILE_TYPES
        });
        return pickHandle
            .then(handle => writeToHandle(handle, blob).then(() => {
                if (!asCopy) currentFileHandle = handle;
                return handle.name;
            }))
            .catch(error => {
                if (error && error.name === 'AbortError') return null; // user cancelled the dialog
                throw error;
            });
    });
};

export {
    saveProjectToComputer,
    watchProjectLoads,
    forgetFile
};
