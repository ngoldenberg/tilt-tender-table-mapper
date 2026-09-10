# Tilt & Tender — Table Mapper

## Purpose

An offline, single-file browser application for mapping a 160 × 240 pixel
Tilt & Tender pinball table. It lets a game developer align a reference image,
mark table features on a logical cell grid, resume work later from a portable
project file, and export both a complete visual map and development data.

## Approved design

### Workspace

- The game frame is always 160 × 240 logical pixels and is displayed at a
  configurable zoom.
- Users upload a local background image, drag it to align it, scale and rotate
  it, reset it, fit it to the frame, and adjust its opacity. New projects use
  a 2 px grid, 4× display zoom, 70% image opacity, zero offset, 100% scale,
  and zero rotation.
- A 1 px, 2 px, or 4 px cell grid overlays the background.
- Category controls select the annotation colour. Clicking or dragging paints
  complete logical cells; right-click dragging erases cells.
- Coordinates show the hovered cell and its game-pixel origin.

### Editing and persistence

- Categories include walls, bumpers, targets, rails, flippers, ramps, and
  other; their colours are configurable. The initial palette is deliberately
  high contrast and every annotation uses 55% fill opacity so the reference
  image stays readable beneath it.
- Undo and redo track edits. Clear can affect the active category or the
  whole map, with confirmation for the latter.
- Project JSON is the editable source of truth. It records version, canvas
  settings, embedded background-image data, image alignment and opacity,
  palette, categories, and all painted cells.
- Loading validates the supported project version and image data before it
  replaces the current project.

### Exports

- **Export PNG** renders the final 160 × 240 map with the aligned background,
  grid lines, and all coloured annotations.
- **Export Project** downloads the portable, self-contained editable project
  JSON.
- **Export Game Data** downloads a concise JSON document containing categories
  and their marked cell coordinates in game-grid coordinates.
- All work is client-side. Images and project data are never uploaded.

### Technical direction

The app is one `tilt-tender-mapper.html` file with inline CSS and JavaScript,
using the browser Canvas API. It requires no build process, server, framework,
or third-party dependency; users open it directly in a modern browser.

## Original conversation / requirements supplied by the user

> Yes. Honestly, I think the HTML/JS app is a much better solution for what
> you're trying to do.
>
> What you're describing is actually a pretty small custom tool, and unlike
> Excel or Pixelorama, we can make the UI specifically around your game.
>
> The browser's Canvas API already supports exactly the operations we'd need,
> including cropping and scaling an image into a destination rectangle.
>
> I'd build it like this
>
> Your workspace would have:
>
> ┌──────────────────────────────────────────────┐
> │ Tilt & Tender - Table Mapper                 │
> │                                              │
> │ Image: [Choose Image]                        │
> │                                              │
> │ Scale: [ 100% ]  X: [0]  Y: [0]             │
> │ Opacity: [70%]                               │
> │                                              │
> │ Grid: [2 px]  Zoom: [4x]                     │
> │                                              │
> │ [Walls] [Bumpers] [Targets] [Rails]          │
> │ [Flippers] [Ramps] [Other]                   │
> │                                              │
> │       ┌──────────────────┐                   │
> │       │                  │                   │
> │       │  BACKGROUND      │                   │
> │       │  IMAGE           │                   │
> │       │                  │                   │
> │       │  + GRID          │                   │
> │       │  + PAINT         │                   │
> │       │                  │                   │
> │       └──────────────────┘                   │
> │                                              │
> │ Selected: Bumper                             │
> │ Cell: X=42 Y=87                              │
> │                                              │
> │ [Undo] [Redo] [Clear] [Export JSON]          │
> │ [Export PNG]                                 │
> └──────────────────────────────────────────────┘
>
> And importantly, the coordinate system would be the game's coordinate
> system, not the browser's.
>
> Your 160 x 240 table
>
> We could make the actual logical canvas: 160 x 240 pixels, but display it at
> 4x or 6x zoom. The annotation grid could be 2 x 2 pixels per cell, giving
> 80 x 120 cells. Make the cell size configurable: 1 px (160 x 240), 2 px
> (80 x 120), or 4 px (40 x 60).
>
> Image alignment should provide X, Y, scale, rotation, opacity, fit to frame,
> reset, and direct mouse dragging. The frame remains exactly 160 x 240.
>
> Painting should use chosen categories (walls, bumpers, targets, rails,
> flippers, ramps, other), coloured configurable cells, and unambiguous
> cell-based clicks. Output should be useful game-coordinate JSON, optionally
> represented as cells or component rectangles. The final visual map is a PNG.
>
> The application can be a single HTML file with no React, npm, backend, or
> build process. The local image stays local.
>
> Required first version: 160 × 240 frame; 2 px / 4 px configurable grid;
> background image upload; drag/zoom/crop alignment; adjustable opacity;
> clickable cells; colour/category palette; undo/redo; clear; JSON and PNG
> exports; coordinates under the mouse; and project save/load.
>
> The project file is the source of truth: load a background, align/crop it,
> identify pinball parts, save, reopen later, and export the annotated PNG.
> To stay portable, it embeds the background image rather than storing a local
> filesystem path. Export PNG is the final visual map containing background,
> grid, and annotations; Export Project is the JSON needed for re-editing.
