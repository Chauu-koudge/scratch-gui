# Venago GUI

The Venago-branded Scratch/OpenBlock editor UI.

This package is forked from `openblock-gui`. It remains named `openblock-gui` in `package.json` for compatibility with the existing OpenBlock build and package references, but the folder and visible product surface are being white-labeled for Venago.

GitHub repo: https://github.com/Venago-Innovations/scratch_gui

Recommended local folder name: `venago-gui`

## Role In The System

`venago-gui` is the React app the user opens in the browser. It provides the stage, blocks workspace, device library, menus, loader, project UI, and connection controls.

It imports these sibling packages through local `file:` dependencies:

- `../venago-vm` as `openblock-vm`
- `../venago-blocks` as `openblock-blocks`

Because of those `file:` paths, clone the VM repo into a sibling folder named `venago-vm` and the Blocks repo into `venago-blocks`, even though their GitHub repo names are `scratch_actual_vm` and `scratch_packaged`.

## Fresh Clone Setup

Clone all four repos into one parent folder. The local folder aliases are required:

```bash
mkdir -p ~/venago-workspace/openblock
cd ~/venago-workspace/openblock

git clone https://github.com/Venago-Innovations/scratch_gui.git venago-gui
git clone https://github.com/Venago-Innovations/scratch_actual_vm.git venago-vm
git clone https://github.com/Venago-Innovations/scratch_packaged.git venago-blocks
git clone https://github.com/Venago-Innovations/scratch_connectivity.git venago-link
```

Install the editor:

```bash
cd venago-gui
NODE_OPTIONS=--openssl-legacy-provider npm install
```

Install the bridge:

```bash
cd ../venago-link
npm install
npm run fetch
```

Run the app in two terminals.

Terminal A:

```bash
cd ~/venago-workspace/openblock/venago-gui
NODE_OPTIONS=--openssl-legacy-provider npm start
```

Terminal B:

```bash
cd ~/venago-workspace/openblock/venago-link
npm start
```

Open:

```text
http://127.0.0.1:8601
```

The browser editor connects to the local bridge at:

```text
ws://127.0.0.1:20111/openblock/serialport
```

Do not commit `node_modules`, GUI `build`, Link `tools`, or Link `firmwares`. VM `dist` and Blocks compiled bundles are committed so the app can run after clone without rebuilding legacy Blockly tooling.

At runtime, the GUI talks to `venago-link` over:

```text
ws://127.0.0.1:20111/openblock/serialport
```

The `/openblock/serialport` path is still part of the inherited protocol contract between VM and Link.

## Current Venago Status

Already customized:

- browser title and HTML shell
- loader/preloader branding
- favicon
- Venago wordmark in the menu bar
- Venago menu links
- Venago color palette in GUI CSS and toolbox category dots
- local imports for `venago-vm` and `venago-blocks`

Still needs cleanup:

- package metadata still says `openblock-gui`
- some internal namespaces still say `scratch-gui`
- the device library still exposes upstream boards rather than a first-class Venago Board
- some upstream docs, comments, and user-facing text may still mention OpenBlock/Scratch

## Build

Use the OpenSSL legacy flag with modern Node versions because this app still uses Webpack 4:

```bash
NODE_OPTIONS=--openssl-legacy-provider npm install
NODE_OPTIONS=--openssl-legacy-provider npm start
NODE_OPTIONS=--openssl-legacy-provider npm run build
```

Verified on 2026-07-25:

- `npm run build` passed with `NODE_OPTIONS=--openssl-legacy-provider`
- output `build/index.html` uses title `Venago`

## Hardware Notes

The GUI does not talk to USB directly. It depends on `venago-link` running locally on port `20111`.

For the PDF scope, the main missing GUI work is adding a Venago Board entry to the device library and making the connection flow show the correct Venago board/device state once VM support exists.

## Upstream Credit

Based on the MIT-licensed OpenBlock GUI project:

https://github.com/openblockcc/openblock-gui
