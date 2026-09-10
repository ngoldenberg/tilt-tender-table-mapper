# Tilt & Tender Table Mapper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an offline HTML tool for aligning a 160 × 240 table image, annotating its cell grid, and exporting editable and production-ready maps.

**Architecture:** A single HTML document owns the DOM, Canvas renderer, and state. State serializes into an embedded-image project JSON; pure helpers map pointer positions, manage cells, and construct exports.

**Tech Stack:** Semantic HTML, CSS, browser Canvas API, vanilla JavaScript, Node built-in tests.

**Spec:** `design.md`

## Global Constraints

- Deliver `tilt-tender-mapper.html` with no dependencies, framework, server, or build process.
- The game canvas is exactly 160 × 240 logical pixels.
- Grid sizes are exactly 1, 2, and 4 logical pixels; default is 2.
- Project files embed the reference image and retain editable state.
- PNG always includes background image, grid lines, and annotations.

---

### Task 1: Create the testable state model

**Files:**
- Create: `test/mapper-logic.test.js`
- Create: `tilt-tender-mapper.html`

**Interfaces:**
- Produces: `cellFromPoint(pointX, pointY, cellSize)`, `cellKey(x, y)`, `parseCellKey(key)`, `makeProject(state)`, `validateProject(project)`.
- Uses constants: `CANVAS_WIDTH = 160`, `CANVAS_HEIGHT = 240`, `PROJECT_VERSION = 1`.

- [ ] Write a failing Node test that calls `cellFromPoint(159.9, 239.9, 2)` and expects `{ x: 79, y: 119 }`, and calls `validateProject({ version: 99 })` expecting an exception.
- [ ] Run `node --test test/mapper-logic.test.js`; confirm it fails because the functions are absent.
- [ ] Add the helpers to a marked `/* LOGIC_START */` / `/* LOGIC_END */` block in the HTML script. The test reads that block into a Node VM context, so the release application remains one file.
- [ ] Run `node --test test/mapper-logic.test.js`; confirm it passes.

### Task 2: Build the workspace and canvas renderer

**Files:**
- Modify: `tilt-tender-mapper.html`
- Modify: `test/mapper-logic.test.js`

**Interfaces:**
- Produces: `createDefaultState()` and `render()`.
- Consumes: central `state`, rendered at `state.viewport.zoom`.

- [ ] Add a failing test asserting `makeProject(createDefaultState()).canvas` equals `{ width: 160, height: 240, cellSize: 2 }`.
- [ ] Run the Node test and confirm the new assertion fails because `createDefaultState` is absent.
- [ ] Implement a responsive semantic layout: image controls, category palette, canvas stage, coordinate readout, history controls, and export controls. Canvas rendering supplies a checkerboard empty state and grid lines for the active cell size.
- [ ] Add keyboard focus styles, labels for all native inputs, and reduced-motion CSS.
- [ ] Run the Node test; confirm it passes. Open the page and confirm visible controls and a scaled 160 × 240 frame.

### Task 3: Support background import and alignment

**Files:**
- Modify: `tilt-tender-mapper.html`
- Modify: `test/mapper-logic.test.js`

**Interfaces:**
- Consumes: `state.background = { imageData, x, y, scale, rotation, opacity }`.
- Produces: `fitBackground(imageWidth, imageHeight)` and `drawBackground(context, background)`.

- [ ] Add a failing test expecting `fitBackground(1200, 1800)` to return x/y 0 and scale 0.13333333333333333.
- [ ] Run the test and confirm it fails because `fitBackground` is absent.
- [ ] Use `FileReader.readAsDataURL` and Canvas transforms to import, fit, reset, translate, scale, rotate, and opacity-adjust an image. Enable pointer dragging in an explicit Align image mode.
- [ ] Run the test and confirm it passes; manually inspect Fit, Reset, and dragging.

### Task 4: Paint category cells and record history

**Files:**
- Modify: `tilt-tender-mapper.html`
- Modify: `test/mapper-logic.test.js`

**Interfaces:**
- Produces: `paintCell(state, category, cell, shouldPaint)`, `undo(state)`, `redo(state)`.
- Consumes: `state.parts[category]` as `Set` instances keyed by `"x,y"`.

- [ ] Add a failing test: paint bumper cell `{ x: 42, y: 18 }`, undo, and expect the bumper set to be empty.
- [ ] Run the test and confirm it fails because the paint/history behavior is absent.
- [ ] Implement selected categories (walls, bumpers, targets, rails, flippers, ramps, other), configurable colours, left-click painting, right-click erasing, pointer-drag strokes, one undo item per stroke, redo, clear category, and confirmed clear all.
- [ ] Render 55% opacity cell fills, cell coordinate status, and disabled unavailable Undo/Redo actions.
- [ ] Run the test and confirm it passes; manually paint, erase, undo, redo, and clear.

### Task 5: Implement project and final-map exports

**Files:**
- Modify: `tilt-tender-mapper.html`
- Modify: `test/mapper-logic.test.js`

**Interfaces:**
- Produces: `makeGameData(state)`, `downloadProject()`, `loadProject(file)`, `exportPng()`.
- Consumes: `makeProject`, `validateProject`, and `renderToCanvas(canvas)`.

- [ ] Add a failing test that paints walls cell `{ x: 0, y: 0 }` and expects `makeGameData(state).parts.walls` to equal `[[0, 0]]`.
- [ ] Run the test and confirm it fails because `makeGameData` is absent.
- [ ] Implement Blob downloads for project and game-data JSON. Validate project version, dimensions, allowed grid size, categories, arrays, and data-URI image before replacing state.
- [ ] Render an offscreen 160 × 240 canvas in background → grid → annotations order, then download `table-map.png` with `toBlob`.
- [ ] Run the test and confirm it passes; save a project, reload it, and confirm the image and annotations restore.

### Task 6: Verify and commit

**Files:**
- Modify only when testing exposes a defect.

- [ ] Run `node --test test/mapper-logic.test.js` and confirm every test passes.
- [ ] Open `tilt-tender-mapper.html`, upload an image, fit/drag it, paint and erase cells, undo/redo, change grid size, save/load a project, and export each format.
- [ ] Inspect the exported PNG dimensions and verify it visibly contains the background, grid, and colours.
- [ ] Commit using `git add tilt-tender-mapper.html test/mapper-logic.test.js docs/superpowers/plans/2026-09-10-tilt-tender-table-mapper.md && git commit -m "feat: add offline table mapper"`.
