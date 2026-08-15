/* ═══════════════════════════════════════════════════════════════════
   Medical Body Map — Full Application Logic & Drill-down System
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Anatomical Region Hierarchy (WebMD Symptom Checker Style) ────
  const SUB_REGIONS = {
    // Front View Major Regions
    'Head': [
      'Forehead', 'Scalp', 'Left Temple', 'Right Temple',
      'Left Eye / Eyelid', 'Right Eye / Eyelid', 'Nose / Bridge',
      'Left Ear', 'Right Ear', 'Mouth / Lips', 'Teeth / Gums',
      'Jaw / Chin', 'Left Cheek', 'Right Cheek'
    ],
    'Neck': [
      'Left Side of Neck', 'Front of Neck', 'Right Side of Neck',
      'Thyroid Area', 'Throat / Voicebox', 'Collarbone Area'
    ],
    // Acromion (the bony cap at the very top of the shoulder, near the
    // collarbone) sits above the deltoid muscle, and shoulder joint/rotator
    // cuff are the deepest, most sunk-in landmarks — so top-to-bottom this
    // is Acromion, then the two visible deltoid heads side by side, then
    // joint/rotator cuff. See ROW_LAYOUT_OVERRIDE below for the 1/2/2 split
    // that keeps Acromion alone in its own top band instead of sharing a
    // row with something else.
    'Left Shoulder': [
      'Acromion', 'Front Deltoid', 'Side Deltoid',
      'Shoulder Joint', 'Rotator Cuff Area'
    ],
    'Right Shoulder': [
      'Acromion', 'Front Deltoid', 'Side Deltoid',
      'Shoulder Joint', 'Rotator Cuff Area'
    ],
    'Chest': [
      'Left Collarbone', 'Upper Chest', 'Right Collarbone',
      'Left Breast / Pectoral', 'Sternum / Mid-Chest', 'Right Breast / Pectoral',
      'Left Rib Cage', 'Lower Chest', 'Right Rib Cage'
    ],
    'Abdomen': [
      'Upper Left Abdomen (Spleen/Stomach)', 'Upper Abdomen (Epigastric)', 'Upper Right Abdomen (Gallbladder/Liver)',
      'Left Flank', 'Navel / Periumbilical Area', 'Right Flank',
      'Lower Left Abdomen (Colon)', 'Lower Abdomen (Hypogastric)', 'Lower Right Abdomen (Appendix)'
    ],
    // Left/Right pairs below are mirror images of each other in the artwork,
    // so unlike the boxy torso regions above, these limb sub-lists are NOT
    // shared verbatim between the Left/Right entries — each one is ordered
    // to match that specific side's own left-to-right visual layout (medial
    // side nearest the torso, lateral side away from it). Sharing one order
    // across a mirrored pair is exactly what caused Inner/Outer-style names
    // to land on the wrong side before this fix.
    'Left Upper Arm': ['Outer Upper Arm', 'Bicep', 'Inner Upper Arm'],
    'Right Upper Arm': ['Inner Upper Arm', 'Bicep', 'Outer Upper Arm'],
    'Left Forearm': ['Elbow Crease', 'Outer Forearm', 'Inner Forearm', 'Wrist (Palmar side)'],
    'Right Forearm': ['Elbow Crease', 'Inner Forearm', 'Outer Forearm', 'Wrist (Palmar side)'],
    'Left Hand': ['Palm', 'Thumb', 'Index Finger', 'Middle Finger', 'Ring Finger', 'Little Finger', 'Knuckles'],
    'Right Hand': ['Palm', 'Thumb', 'Index Finger', 'Middle Finger', 'Ring Finger', 'Little Finger', 'Knuckles'],
    'Pelvis': ['Left Hip Joint', 'Iliac Crest', 'Right Hip Joint', 'Groin (Left)', 'Pubic Region', 'Groin (Right)'],
    'Left Thigh': ['Outer Thigh', 'Quadriceps (Front Thigh)', 'Inner Thigh (Adductors)'],
    'Right Thigh': ['Inner Thigh (Adductors)', 'Quadriceps (Front Thigh)', 'Outer Thigh'],
    'Left Knee': ['Kneecap (Patella)', 'Outer Knee', 'Inner Knee', 'Below Kneecap'],
    'Right Knee': ['Kneecap (Patella)', 'Inner Knee', 'Outer Knee', 'Below Kneecap'],
    'Left Shin': ['Outer Lower Leg', 'Shin Bone (Tibia)', 'Ankle (Front)', 'Inner Ankle'],
    'Right Shin': ['Shin Bone (Tibia)', 'Outer Lower Leg', 'Inner Ankle', 'Ankle (Front)'],
    // Toes fan out side-by-side at the end of the foot rather than stacking
    // front-to-back, so the last three names are ordered left-to-right by
    // which side of that foot is medial (nearest the other foot) — see
    // buildHotspots()'s ROW_LAYOUT_OVERRIDE handling below.
    'Left Foot': ['Ankle Joint', 'Top of Foot', 'Arch of Foot', 'Fourth/Fifth Toe', 'Second/Third Toe', 'Big Toe'],
    'Right Foot': ['Ankle Joint', 'Top of Foot', 'Arch of Foot', 'Big Toe', 'Second/Third Toe', 'Fourth/Fifth Toe'],

    // Back View Major Regions
    'Head (Back)': [
      'Occiput / Back of Head', 'Crown of Head', 'Base of Skull',
      'Behind Left Ear', 'Behind Right Ear'
    ],
    'Neck (Back)': [
      'Left Cervical Muscle', 'Upper Spine (Cervical)', 'Base of Neck', 'Right Cervical Muscle'
    ],
    // Upper Trapezius runs along the top of the shoulder nearest the neck,
    // with the rear deltoid (lateral) and shoulder blade (medial, lower)
    // below it — so it needs to be alone in a top band rather than sharing
    // a row with something else. See ROW_LAYOUT_OVERRIDE below for the 1/2
    // split.
    'Left Shoulder (Back)': [
      'Upper Trapezius', 'Rear Deltoid', 'Left Shoulder Blade (Scapula)'
    ],
    'Right Shoulder (Back)': [
      'Upper Trapezius', 'Rear Deltoid', 'Right Shoulder Blade (Scapula)'
    ],
    'Upper Back': [
      'Left Shoulder Blade Area', 'Spine (Thoracic)', 'Right Shoulder Blade Area',
      'Left Upper Paraspinal', 'Mid-Back Spine', 'Right Upper Paraspinal'
    ],
    'Lower Back': [
      'Left Lower Back', 'Lumbar Spine (L1-L5)', 'Right Lower Back',
      'Sacroiliac Joint (Left)', 'Sacrum', 'Sacroiliac Joint (Right)',
      'Tailbone (Coccyx)'
    ],
    'Left Tricep': ['Tricep Lateral Head', 'Tricep Long Head', 'Back of Elbow'],
    'Right Tricep': ['Tricep Long Head', 'Tricep Lateral Head', 'Back of Elbow'],
    'Left Forearm (Back)': ['Elbow Tip', 'Back of Forearm', 'Back of Wrist'],
    'Right Forearm (Back)': ['Elbow Tip', 'Back of Forearm', 'Back of Wrist'],
    'Left Hand (Back)': ['Back of Hand', 'Back of Thumb', 'Back of Fingers'],
    'Right Hand (Back)': ['Back of Hand', 'Back of Thumb', 'Back of Fingers'],
    'Buttocks': ['Left Gluteus Major', 'Gluteus Medius (Hip)', 'Piriformis Area', 'Right Gluteus Major'],
    // Upper/Lower describe position along the leg's length, Inner/Outer
    // describe medial-lateral side — two different axes that a plain 2x2
    // grid conflates. Splitting the middle band into Inner/Outer (see
    // ROW_LAYOUT_OVERRIDE below) keeps Upper strictly at the top and Lower
    // strictly at the bottom while still giving Inner/Outer a correctly
    // side-ordered band in between.
    'Left Hamstring': ['Upper Hamstring', 'Outer Hamstring', 'Inner Hamstring', 'Lower Hamstring'],
    'Right Hamstring': ['Upper Hamstring', 'Inner Hamstring', 'Outer Hamstring', 'Lower Hamstring'],
    'Left Knee (Back)': ['Outer Back Knee', 'Popliteal Fossa (Behind Knee)', 'Inner Back Knee'],
    'Right Knee (Back)': ['Inner Back Knee', 'Popliteal Fossa (Behind Knee)', 'Outer Back Knee'],
    'Left Calf': ['Gastrocnemius (Upper Calf)', 'Soleus (Lower Calf)', 'Achilles Tendon'],
    'Right Calf': ['Gastrocnemius (Upper Calf)', 'Soleus (Lower Calf)', 'Achilles Tendon'],
    'Left Foot (Back)': ['Back of Ankle', 'Heel (Calcaneus)', 'Plantar Fascia / Sole'],
    'Right Foot (Back)': ['Back of Ankle', 'Heel (Calcaneus)', 'Plantar Fascia / Sole']
  };

  // Severity labels & colors
  const SEVERITY_LABELS = {
    1: 'Mild — Minor discomfort',
    2: 'Low — Noticeable but manageable',
    3: 'Moderate — Affects daily activity',
    4: 'High — Significant pain / issue',
    5: 'Severe — Urgent medical attention'
  };

  const SEVERITY_COLORS = {
    1: '#4ade80',
    2: '#a3e635',
    3: '#facc15',
    4: '#fb923c',
    5: '#f87171'
  };

  // ── State ──────────────────────────────────────────────────────
  const state = {
    currentView: 'front',
    // key: "f-head::Forehead" or "f-head"
    selections: new Map(), // key -> { regionId, parentRegion, subRegion, side, severity, note }
    activeSelectionKey: null,
    zoomedRegionId: null,   // region id currently zoomed into (null = full body)
    zoomAnimFrame: null,    // active requestAnimationFrame id for viewBox tween
  };

  // ── DOM References ─────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    btnFront: $('#btn-front'),
    btnBack: $('#btn-back'),
    toggleIndicator: $('.toggle-indicator'),
    bodyFront: $('#body-front'),
    bodyBack: $('#body-back'),
    tooltip: $('#tooltip'),
    tooltipText: $('#tooltip-text'),
    zoomHeader: $('#zoom-header'),
    zoomTitle: $('#zoom-title'),
    zoomBack: $('#zoom-back'),
    zoomEntire: $('#zoom-entire'),
    selectedList: $('#selected-list'),
    selectionCount: $('#selection-count'),
    severitySection: $('#severity-section'),
    severityLabel: $('#severity-label'),
    notesSection: $('#notes-section'),
    notesInput: $('#notes-input'),
    btnSaveNote: $('#btn-save-note'),
    btnClear: $('#btn-clear'),
    btnExport: $('#btn-export'),
    exportModal: $('#export-modal'),
    exportJson: $('#export-json'),
    modalClose: $('#modal-close'),
    btnCopy: $('#btn-copy')
  };

  // Remember each svg's full (un-zoomed) viewBox so we can animate back to it.
  const fullViewBox = {};
  [dom.bodyFront, dom.bodyBack].forEach((svg) => {
    fullViewBox[svg.id] = svg.getAttribute('viewBox').split(' ').map(Number);
  });

  // ── Init ───────────────────────────────────────────────────────
  function init() {
    bindViewToggle();
    bindSVGRegionEvents();
    bindZoomHeader();
    bindSeverity();
    bindNotes();
    bindActions();
  }

  // ── View Toggle ────────────────────────────────────────────────
  function bindViewToggle() {
    dom.btnFront.addEventListener('click', () => switchView('front'));
    dom.btnBack.addEventListener('click', () => switchView('back'));
  }

  function switchView(view) {
    unzoomBody();

    state.currentView = view;
    dom.btnFront.classList.toggle('active', view === 'front');
    dom.btnBack.classList.toggle('active', view === 'back');
    dom.toggleIndicator.classList.toggle('right', view === 'back');

    dom.bodyFront.classList.toggle('active', view === 'front');
    dom.bodyBack.classList.toggle('active', view === 'back');
  }

  // ── SVG Region Events ──────────────────────────────────────────
  function bindSVGRegionEvents() {
    $$('.region').forEach((regionEl) => {
      regionEl.addEventListener('mouseenter', (e) => {
        if (state.zoomedRegionId) return;
        const name = regionEl.dataset.region;
        dom.tooltipText.textContent = name + ' (Click to zoom in)';
        dom.tooltip.classList.add('visible');
        moveTooltip(e);
      });

      regionEl.addEventListener('mousemove', (e) => {
        if (state.zoomedRegionId) return;
        moveTooltip(e);
      });

      regionEl.addEventListener('mouseleave', () => {
        dom.tooltip.classList.remove('visible');
      });

      regionEl.addEventListener('click', () => {
        if (state.zoomedRegionId) return; // ignore while zoomed (region is non-interactive then)
        zoomIntoRegion(regionEl);
      });
    });
  }

  function moveTooltip(e) {
    dom.tooltip.style.left = (e.clientX + 14) + 'px';
    dom.tooltip.style.top = (e.clientY - 10) + 'px';
  }

  // ── Zoom-to-Region + On-Body Sub-region Hotspots ───────────────
  function zoomIntoRegion(regionEl) {
    const svg = regionEl.ownerSVGElement;
    const regionId = regionEl.id;
    const parentRegionName = regionEl.dataset.region;
    const side = regionEl.dataset.side;

    state.zoomedRegionId = regionId;

    // Dim every other region in this svg; highlight the target region.
    svg.querySelectorAll('.region').forEach((el) => {
      if (el === regionEl) {
        el.classList.remove('dimmed');
        el.classList.add('zoomed-active');
      } else {
        el.classList.add('dimmed');
      }
    });

    // Animate the viewBox in to a padded crop around the region.
    const bbox = regionEl.getBBox();
    const full = fullViewBox[svg.id];
    const target = paddedBBox(bbox, full, 0.45);
    animateViewBox(svg, target, 420);

    // Build clickable sub-region hotspots directly on the zoomed body part.
    buildHotspots(svg, regionEl, regionId, parentRegionName, side, bbox);

    // Header UI
    dom.zoomTitle.textContent = parentRegionName;
    dom.zoomHeader.classList.remove('hidden');
    updateEntireButtonState(regionId, parentRegionName, side);

    dom.tooltip.classList.remove('visible');
  }

  function unzoomBody() {
    if (!state.zoomedRegionId) return;
    const prevId = state.zoomedRegionId;
    state.zoomedRegionId = null;

    const regionEl = document.getElementById(prevId);
    const svg = regionEl ? regionEl.ownerSVGElement : (state.currentView === 'front' ? dom.bodyFront : dom.bodyBack);

    svg.querySelectorAll('.region').forEach((el) => {
      el.classList.remove('dimmed', 'zoomed-active');
    });

    removeHotspots(svg);
    animateViewBox(svg, fullViewBox[svg.id], 380);
    dom.zoomHeader.classList.add('hidden');
  }

  function bindZoomHeader() {
    dom.zoomBack.addEventListener('click', unzoomBody);
    dom.zoomEntire.addEventListener('click', () => {
      const regionEl = document.getElementById(state.zoomedRegionId);
      if (!regionEl) return;
      const parentRegionName = regionEl.dataset.region;
      const side = regionEl.dataset.side;
      toggleSubSelection(state.zoomedRegionId, parentRegionName, 'Entire Region', side, dom.zoomEntire);
      updateEntireButtonState(state.zoomedRegionId, parentRegionName, side);
    });
  }

  function updateEntireButtonState(regionId, parentRegionName, side) {
    const isSelected = isSelectionExists(regionId, 'Entire Region');
    dom.zoomEntire.classList.toggle('btn-accent', !isSelected);
    dom.zoomEntire.textContent = isSelected ? '✓ Entire Area Selected' : 'Select Entire Area';
  }

  // ── viewBox tween ───────────────────────────────────────────────
  function paddedBBox(bbox, full, padFactor) {
    const padX = bbox.width * padFactor;
    const padY = bbox.height * padFactor;
    let x = bbox.x - padX;
    let y = bbox.y - padY;
    let w = bbox.width + padX * 2;
    let h = bbox.height + padY * 2;

    const [fx, fy, fw, fh] = full;
    if (x < fx) { w += (x - fx); x = fx; }
    if (y < fy) { h += (y - fy); y = fy; }
    if (x + w > fx + fw) w = (fx + fw) - x;
    if (y + h > fy + fh) h = (fy + fh) - y;
    return [x, y, w, h];
  }

  function animateViewBox(svg, target, duration) {
    if (state.zoomAnimFrame) cancelAnimationFrame(state.zoomAnimFrame);
    const start = svg.getAttribute('viewBox').split(' ').map(Number);
    const t0 = performance.now();

    function step(now) {
      const t = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const cur = start.map((v, i) => v + (target[i] - v) * ease);
      svg.setAttribute('viewBox', cur.join(' '));
      if (t < 1) {
        state.zoomAnimFrame = requestAnimationFrame(step);
      } else {
        state.zoomAnimFrame = null;
      }
    }
    state.zoomAnimFrame = requestAnimationFrame(step);
  }

  // ── Sub-region hotspots ─────────────────────────────────────────
  // Hotspots are rendered as a grid over the zoomed region's bounding box,
  // but CLIPPED to the region's own silhouette path. This guarantees a
  // hotspot can never be selectable (or even visible) outside the actual
  // body-part shape in the artwork — no more oversized/leaking hit areas.
  // Sub-region names are shown via the floating cursor tooltip (same one
  // used for major regions) rather than baked-in on-body text, so hovering
  // the body is what reveals what you're about to select.
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';

  function removeHotspots(svg) {
    const layer = svg.querySelector('#hotspot-layer');
    if (layer) layer.remove();
    const clip = svg.querySelector('#hotspot-clip');
    if (clip) clip.remove();
  }

  // Clip everything in the hotspot layer to the exact silhouette of the
  // region that was clicked to zoom in (re-uses that path via <use>, so it
  // always matches the artwork pixel-for-pixel), and return the empty <g>
  // ready for hotspot rects to be appended to it. Shared by both the
  // generic grid layout and the hand digit layout below.
  function createHotspotLayer(svg, regionId) {
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(SVG_NS, 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }
    const clipPath = document.createElementNS(SVG_NS, 'clipPath');
    clipPath.setAttribute('id', 'hotspot-clip');
    clipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');
    const clipUse = document.createElementNS(SVG_NS, 'use');
    clipUse.setAttributeNS(XLINK_NS, 'xlink:href', '#' + regionId);
    clipUse.setAttribute('href', '#' + regionId);
    clipPath.appendChild(clipUse);
    defs.appendChild(clipPath);

    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('id', 'hotspot-layer');
    g.setAttribute('clip-path', 'url(#hotspot-clip)');
    return g;
  }

  // For regions where the sub-region list above was hand-ordered into a
  // deliberate Left / Middle / Right anatomical layout, pin the column
  // count so that layout actually lines up — the aspect-ratio-based
  // auto column count below is a good default elsewhere, but it doesn't
  // know about that intent and can pick a different column count.
  //
  // This also covers the "lengthwise limb" case: Upper Arm, Thigh, and
  // Knee (Back) all have 3 sub-parts that are meant to run the *entire*
  // length of the limb as parallel medial/center/lateral strips (e.g.
  // Outer Upper Arm | Bicep | Inner Upper Arm), not stack front-to-back
  // along it. The auto aspect-ratio heuristic below picks column counts
  // to roughly match the bounding box's own proportions, but a limb's
  // bounding box is tall-and-narrow along the *length* axis even though
  // the sub-regions are meant to divide the *width* axis — so left to
  // its own devices it very often collapses these to a single column
  // (top/middle/bottom bands) instead of 3 side-by-side strips. Pinning
  // cols = the sub-part count forces the width-wise split these regions
  // actually need. Left Shin needs the same fix in the other direction
  // (it was pinned to 1 column with no override before, which merged
  // Inner Ankle/Ankle (Front) into the wrong band — 2 columns matches
  // its 2-per-row layout instead).
  const GRID_COLS_OVERRIDE = {
    'Neck': 3, 'Chest': 3, 'Abdomen': 3,
    'Pelvis': 3, 'Upper Back': 3, 'Lower Back': 3,
    'Left Upper Arm': 3, 'Right Upper Arm': 3,
    'Left Thigh': 3, 'Right Thigh': 3,
    'Left Knee (Back)': 3, 'Right Knee (Back)': 3,
    'Left Shin': 2, 'Right Shin': 2
  };

  // For regions where neither a uniform column count nor the aspect-ratio
  // heuristic can express the right shape — the row-major grid fill below
  // normally uses the SAME column count for every row (except a shorter
  // last row), but some regions genuinely need a *different* item count
  // per row: e.g. the forearm has one name at the elbow end (full width),
  // two side-by-side names in the middle (inner/outer), and one name at
  // the wrist end (full width) — a 1 / 2 / 1 split, not a uniform grid.
  // Each array here is the item count for each row top-to-bottom, and must
  // sum to that region's SUB_REGIONS length. buildHotspots() reads this
  // (falling back to the uniform aspect/GRID_COLS_OVERRIDE logic when a
  // region has no entry here) and still runs every row through the same
  // real-silhouette mass-split as the uniform case, so rows/cells still
  // hug the actual artwork instead of a blind equal-size split.
  const ROW_LAYOUT_OVERRIDE = {
    'Left Forearm': [1, 2, 1], 'Right Forearm': [1, 2, 1],
    'Left Knee': [1, 2, 1], 'Right Knee': [1, 2, 1],
    'Left Hamstring': [1, 2, 1], 'Right Hamstring': [1, 2, 1],
    // Shoulder: Acromion sits alone at the very top (nearest the collarbone)
    // above the two deltoid heads, which are themselves above the deeper
    // joint/rotator-cuff landmarks — a 1 / 2 / 2 split top-to-bottom.
    'Left Shoulder': [1, 2, 2], 'Right Shoulder': [1, 2, 2],
    // Shoulder (Back): Upper Trapezius alone at the top (nearest the neck),
    // rear deltoid + shoulder blade side by side below it — a 1 / 2 split.
    'Left Shoulder (Back)': [1, 2], 'Right Shoulder (Back)': [1, 2],
    // Forearm (Back): the bbox of a diagonally-drawn limb segment ends up
    // almost square (or even wider than tall), so the aspect-ratio-based
    // column guess would put Elbow Tip and Back of Forearm side by side
    // instead of stacked — these three genuinely need one full-width band
    // each, top (elbow) to bottom (wrist), same as the front forearm does.
    'Left Forearm (Back)': [1, 1, 1], 'Right Forearm (Back)': [1, 1, 1],
    // Feet: Ankle Joint / Top of Foot / Arch of Foot each get a full-width
    // band running down the foot, then the toes fan out side-by-side in a
    // final 3-way split (medial-to-lateral ordered in SUB_REGIONS above)
    // instead of stacking as 3 more front-to-back bands.
    'Left Foot': [1, 1, 1, 3], 'Right Foot': [1, 1, 1, 3]
  };

  // ── Proportional (non-grid) layout ─────────────────────────────
  // The head is the one shape where even a silhouette-aware grid can't
  // work: it's one solid filled blob (no branching/gaps to trace like the
  // hands) but packs many small, irregularly-positioned features (eyes,
  // nose, ears, mouth) that don't tile into rows and columns at all — an
  // eye and an ear sit at the same height but are utterly different
  // widths, so any row-major grid cell boundary that lines up with one
  // misses the other. Instead these regions are laid out as fixed
  // fractional rectangles (relative to the region's own bounding box),
  // hand-placed to match the actual proportions of the artwork and
  // verified against front-m.webp / back-m.webp directly. Rects listed
  // later are drawn on top, so a small feature (e.g. Teeth / Gums) can sit
  // inside a larger one (Jaw / Chin) and still take hover/click priority.
  const PROPORTIONAL_LAYOUT = {
    'Head': [
      { name: 'Scalp', x0: 0.00, y0: 0.00, x1: 1.00, y1: 0.16 },
      { name: 'Left Temple', x0: 0.00, y0: 0.16, x1: 0.22, y1: 0.57 },
      { name: 'Forehead', x0: 0.22, y0: 0.16, x1: 0.78, y1: 0.44 },
      { name: 'Right Temple', x0: 0.78, y0: 0.16, x1: 1.00, y1: 0.57 },
      { name: 'Left Ear', x0: 0.00, y0: 0.57, x1: 0.17, y1: 0.87 },
      { name: 'Right Ear', x0: 0.83, y0: 0.57, x1: 1.00, y1: 0.87 },
      { name: 'Left Cheek', x0: 0.17, y0: 0.58, x1: 0.35, y1: 0.90 },
      { name: 'Right Cheek', x0: 0.65, y0: 0.58, x1: 0.83, y1: 0.90 },
      // Jaw drawn before Mouth/Eyes/Nose so those smaller, more specific
      // features correctly take hover/click priority in the small strip
      // where their boxes overlap it, instead of the jaw's broad band
      // silently winning that overlap.
      { name: 'Jaw / Chin', x0: 0.06, y0: 0.88, x1: 0.94, y1: 1.00 },
      { name: 'Left Eye / Eyelid', x0: 0.16, y0: 0.44, x1: 0.35, y1: 0.58 },
      { name: 'Right Eye / Eyelid', x0: 0.65, y0: 0.44, x1: 0.84, y1: 0.58 },
      { name: 'Nose / Bridge', x0: 0.35, y0: 0.42, x1: 0.65, y1: 0.77 },
      { name: 'Mouth / Lips', x0: 0.28, y0: 0.85, x1: 0.70, y1: 0.93 },
      { name: 'Teeth / Gums', x0: 0.42, y0: 0.865, x1: 0.58, y1: 0.905 }
    ],
    'Head (Back)': [
      { name: 'Crown of Head', x0: 0.00, y0: 0.00, x1: 1.00, y1: 0.15 },
      { name: 'Occiput / Back of Head', x0: 0.13, y0: 0.15, x1: 0.87, y1: 0.68 },
      { name: 'Base of Skull', x0: 0.00, y0: 0.68, x1: 1.00, y1: 1.00 },
      { name: 'Behind Left Ear', x0: 0.00, y0: 0.48, x1: 0.15, y1: 0.80 },
      { name: 'Behind Right Ear', x0: 0.85, y0: 0.48, x1: 1.00, y1: 0.80 }
    ]
  };

  // ── Hand digit layout ──────────────────────────────────────────
  // Hands are the one shape where a plain rows-then-columns grid over the
  // bounding box fundamentally cannot line up with the artwork: the palm is
  // one solid mass and five digits radiate out from it at different angles
  // and lengths, so a rectangular grid cell almost never matches a real
  // finger. Instead, for these regions we trace how the silhouette
  // physically splits apart (palm -> thumb peels off -> the remaining mass
  // splits into finger pairs -> each pair splits into two fingertips) and
  // assign names based on that real branching structure. See
  // buildHandHotspots() below.
  const HAND_LAYOUT = {
    'Left Hand': { palm: 'Palm', thumb: 'Thumb', knuckles: 'Knuckles', fingers: ['Index Finger', 'Middle Finger', 'Ring Finger', 'Little Finger'] },
    'Right Hand': { palm: 'Palm', thumb: 'Thumb', knuckles: 'Knuckles', fingers: ['Index Finger', 'Middle Finger', 'Ring Finger', 'Little Finger'] },
    'Left Hand (Back)': { palm: 'Back of Hand', thumb: 'Back of Thumb', knuckles: null, fingers: ['Back of Fingers', 'Back of Fingers', 'Back of Fingers', 'Back of Fingers'] },
    'Right Hand (Back)': { palm: 'Back of Hand', thumb: 'Back of Thumb', knuckles: null, fingers: ['Back of Fingers', 'Back of Fingers', 'Back of Fingers', 'Back of Fingers'] }
  };

  function buildHotspots(svg, regionEl, regionId, parentRegionName, side, bbox) {
    removeHotspots(svg);

    const subList = SUB_REGIONS[parentRegionName] || [parentRegionName];
    const n = subList.length;

    const g = createHotspotLayer(svg, regionId);

    // Head/Head (Back): fixed proportional zones, not a grid at all — see
    // PROPORTIONAL_LAYOUT above for why a grid fundamentally can't work here.
    if (PROPORTIONAL_LAYOUT[parentRegionName]) {
      buildProportionalHotspots(g, regionId, parentRegionName, side, bbox);
      svg.appendChild(g);
      return;
    }

    // Rasterize the region's true silhouette so hotspots can be placed by
    // actual covered area rather than raw bbox geometry. Without this, a
    // uniform grid over a tapered/curved shape (a chest, a torso) leaves
    // whole cells sitting mostly or entirely outside the silhouette —
    // clipped away and effectively dead to hover/click. Splitting rows
    // and columns so each band holds an equal share of real body-part
    // pixels keeps every cell meaningfully clickable.
    const mask = rasterizeRegionMask(regionEl, bbox);

    // Hands: try the anatomically-aware digit-tracing layout first. Falls
    // through to the generic grid below only if the artwork doesn't yield
    // a clean 5-way split (shouldn't happen with the current art, but this
    // keeps things safe if the silhouette ever changes).
    if (HAND_LAYOUT[parentRegionName] && mask && buildHandHotspots(g, regionId, parentRegionName, side, bbox, mask)) {
      svg.appendChild(g);
      return;
    }

    // Row layout: either a deliberate per-row item-count array (see
    // ROW_LAYOUT_OVERRIDE above, for regions where rows genuinely need
    // different item counts), or the uniform-columns default expressed in
    // that same shape (every row gets GRID_COLS_OVERRIDE/aspect-derived
    // `cols` items, except a shorter last row) so both cases share one
    // code path below.
    let rowLayout = ROW_LAYOUT_OVERRIDE[parentRegionName];
    if (!rowLayout) {
      const aspect = bbox.width / bbox.height || 1;
      let cols = GRID_COLS_OVERRIDE[parentRegionName] || Math.max(1, Math.round(Math.sqrt(n * aspect)));
      cols = Math.min(cols, n);
      const rows = Math.ceil(n / cols);
      rowLayout = [];
      for (let r = 0; r < rows; r++) {
        rowLayout.push(r === rows - 1 ? (n - cols * (rows - 1)) : cols);
      }
    }
    const rows = rowLayout.length;

    let idx = 0;
    if (mask) {
      const rowBoundsPx = massSplit1D(mask.rowMass, rows);
      for (let r = 0; r < rows; r++) {
        const itemsInRow = rowLayout[r];
        const yTopPx = rowBoundsPx[r];
        const yBotPx = rowBoundsPx[r + 1];
        const colMass = mask.colMassInBand(yTopPx, yBotPx);
        const colBoundsPx = massSplit1D(colMass, itemsInRow);

        for (let c = 0; c < itemsInRow; c++) {
          const subName = subList[idx++];
          const xLPx = colBoundsPx[c];
          const xRPx = colBoundsPx[c + 1];

          const x = bbox.x + xLPx / mask.scaleX;
          const y = bbox.y + yTopPx / mask.scaleY;
          const w = Math.max(1, (xRPx - xLPx) / mask.scaleX);
          const h = Math.max(1, (yBotPx - yTopPx) / mask.scaleY);

          appendHotspotRect(g, regionId, parentRegionName, subName, side, x, y, w, h);
        }
      }
    } else {
      // Fallback: plain uniform-height-row grid (only reachable if
      // rasterization isn't available in this environment) — still
      // clipped to the silhouette so nothing can ever render/click
      // outside the body part.
      const cellH = bbox.height / rows;
      for (let r = 0; r < rows; r++) {
        const itemsInRow = rowLayout[r];
        const cellW = bbox.width / itemsInRow;
        for (let c = 0; c < itemsInRow; c++) {
          const subName = subList[idx++];
          const x = bbox.x + c * cellW;
          const y = bbox.y + r * cellH;
          appendHotspotRect(g, regionId, parentRegionName, subName, side, x, y, cellW, cellH);
        }
      }
    }

    svg.appendChild(g);
  }

  // Builds fixed fractional-rectangle hotspots for regions listed in
  // PROPORTIONAL_LAYOUT (currently the head, front and back). Rects are
  // specified as fractions [0,1] of the region's own bounding box and
  // drawn in listed order, so later entries (small features like Teeth /
  // Gums) render on top of and take hover/click priority over earlier,
  // larger ones (Jaw / Chin) they sit inside of.
  function buildProportionalHotspots(g, regionId, parentRegionName, side, bbox) {
    const zones = PROPORTIONAL_LAYOUT[parentRegionName];
    zones.forEach((zone) => {
      const x = bbox.x + zone.x0 * bbox.width;
      const y = bbox.y + zone.y0 * bbox.height;
      const w = Math.max(1, (zone.x1 - zone.x0) * bbox.width);
      const h = Math.max(1, (zone.y1 - zone.y0) * bbox.height);
      appendHotspotRect(g, regionId, parentRegionName, zone.name, side, x, y, w, h);
    });
  }

  function appendHotspotRect(g, regionId, parentRegionName, subName, side, x, y, w, h) {
    const key = `${regionId}::${subName}`;
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', x.toFixed(1));
    rect.setAttribute('y', y.toFixed(1));
    rect.setAttribute('width', w.toFixed(1));
    rect.setAttribute('height', h.toFixed(1));
    rect.classList.add('hotspot');
    if (state.selections.has(key)) rect.classList.add('selected');
    rect.dataset.sub = subName;

    // Hovering reveals the zone (fill/glow) and names it via the
    // cursor-following tooltip — nothing is written on the body itself.
    rect.addEventListener('mouseenter', (e) => {
      dom.tooltipText.textContent = subName;
      dom.tooltip.classList.add('visible');
      moveTooltip(e);
    });
    rect.addEventListener('mousemove', moveTooltip);
    rect.addEventListener('mouseleave', () => dom.tooltip.classList.remove('visible'));
    rect.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSubSelection(regionId, parentRegionName, subName, side, rect);
    });

    g.appendChild(rect);
  }

  // ── Hand digit layout ──────────────────────────────────────────
  // Traces how the silhouette's per-row cross-section splits apart from
  // top to bottom: it starts as one solid run (the palm), the thumb peels
  // off as a small side-branch, the remaining mass later forks into two
  // finger-pairs, and each pair forks again into two individual fingertips.
  // Returns the root branch of that tree, or null if the mask is unusable.
  function traceMaskBranches(mask) {
    const { cw, ch, grid } = mask;

    function rowRuns(y) {
      const runs = [];
      const rowOff = y * cw;
      let start = -1;
      for (let x = 0; x < cw; x++) {
        const covered = grid[rowOff + x];
        if (covered && start === -1) start = x;
        if (!covered && start !== -1) { runs.push([start, x - 1]); start = -1; }
      }
      if (start !== -1) runs.push([start, cw - 1]);
      return runs;
    }

    // Precompute every row's runs, then smooth out single-row rasterization
    // glitches: where two nearly-touching silhouette edges (e.g. the web
    // between two fingers) come within a sub-pixel gap of each other, that
    // one row can rasterize as briefly merged even though every row above
    // and below it is clearly split. Left alone this reads as a spurious
    // "un-split then re-split" and fabricates extra branches. Detect a row
    // whose run count dips below both neighbors and re-split it using
    // whichever neighbor is more split, clipped to the merged run.
    const allRuns = [];
    for (let y = 0; y < ch; y++) allRuns.push(rowRuns(y));
    for (let y = 1; y < ch - 1; y++) {
      const above = allRuns[y - 1], cur = allRuns[y], below = allRuns[y + 1];
      if (cur.length < above.length && cur.length < below.length) {
        const ref = above.length >= below.length ? above : below;
        const fixed = [];
        cur.forEach(([lo, hi]) => {
          const pieces = ref
            .map(([a0, a1]) => [Math.max(a0, lo), Math.min(a1, hi)])
            .filter(([a0, a1]) => a0 <= a1);
          if (pieces.length > 1) fixed.push(...pieces);
          else fixed.push([lo, hi]);
        });
        if (fixed.length > cur.length) allRuns[y] = fixed;
      }
    }

    function overlaps(a, b) { return a[0] <= b[1] && b[0] <= a[1]; }

    function newBranch(parent, birthRow) {
      return { parent, children: [], rows: [], birthRow, zone: null };
    }

    const root = newBranch(null, 0);
    let active = [{ branch: root, run: null }];

    for (let y = 0; y < ch; y++) {
      const runs = allRuns[y];
      if (runs.length === 0) continue;

      const claimed = new Array(runs.length).fill(false);
      const nextActive = [];

      active.forEach((a) => {
        const matchIdxs = [];
        runs.forEach((r, i) => {
          if (!claimed[i] && (a.run === null || overlaps(r, a.run))) matchIdxs.push(i);
        });

        if (matchIdxs.length === 0) {
          // branch ends here (nothing to do — it just stops growing)
        } else if (matchIdxs.length === 1) {
          const r = runs[matchIdxs[0]];
          claimed[matchIdxs[0]] = true;
          a.branch.rows.push({ y, x0: r[0], x1: r[1] });
          nextActive.push({ branch: a.branch, run: r });
        } else {
          // split: this branch forks into N children this row
          matchIdxs.forEach((i) => {
            const r = runs[i];
            claimed[i] = true;
            const child = newBranch(a.branch, y);
            child.rows.push({ y, x0: r[0], x1: r[1] });
            a.branch.children.push(child);
            nextActive.push({ branch: child, run: r });
          });
        }
      });

      // Any unclaimed run this row (shouldn't normally happen for a simple
      // silhouette) starts as its own fresh branch off the root.
      runs.forEach((r, i) => {
        if (!claimed[i]) {
          const child = newBranch(root, y);
          child.rows.push({ y, x0: r[0], x1: r[1] });
          root.children.push(child);
          nextActive.push({ branch: child, run: r });
        }
      });

      active = nextActive;
    }

    return root;
  }

  function collectLeaves(branch, out) {
    if (branch.children.length === 0) {
      if (branch.rows.length) out.push(branch);
    } else {
      branch.children.forEach((c) => collectLeaves(c, out));
    }
    return out;
  }

  function branchCentroidX(branch) {
    let sum = 0, count = 0;
    branch.rows.forEach((r) => { sum += (r.x0 + r.x1) / 2; count++; });
    return count ? sum / count : 0;
  }

  // Bounding rect (in raster px) of one or more branches' rows combined.
  function branchesPixelRect(branches) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    branches.forEach((b) => {
      b.rows.forEach((r) => {
        if (r.x0 < minX) minX = r.x0;
        if (r.x1 > maxX) maxX = r.x1;
        if (r.y < minY) minY = r.y;
        if (r.y > maxY) maxY = r.y;
      });
    });
    return { minX, maxX, minY, maxY };
  }

  function pixelRectToSvg(rect, bbox, mask) {
    const x = bbox.x + rect.minX / mask.scaleX;
    const y = bbox.y + rect.minY / mask.scaleY;
    const w = Math.max(1, (rect.maxX - rect.minX + 1) / mask.scaleX);
    const h = Math.max(1, (rect.maxY - rect.minY + 1) / mask.scaleY);
    return { x, y, w, h };
  }

  // Builds Palm / Thumb / [Knuckles] / Index / Middle / Ring / Little
  // hotspots (or the simpler Back-of-Hand equivalents) from the branch
  // tree instead of a blind grid. Returns true on success, false if the
  // silhouette didn't yield the expected 5-way digit split (in which case
  // buildHotspots() falls back to the generic grid).
  function buildHandHotspots(g, regionId, parentRegionName, side, bbox, mask) {
    const layout = HAND_LAYOUT[parentRegionName];
    if (!layout) return false;

    const root = traceMaskBranches(mask);
    // Drop 1-2 row noise branches (sub-pixel anti-aliasing slivers that can
    // appear for a row or two right where a real branch ends) before
    // counting leaves — they carry negligible area and would otherwise be
    // miscounted as extra digits.
    const leaves = collectLeaves(root, []).filter((l) => l.rows.length >= 4);
    if (leaves.length !== 5) return false; // not the shape we expect — bail to grid

    // The thumb is whichever leaf split off earliest (closest to the
    // wrist) — it always separates from the palm well before the other
    // four fingers fork apart from each other.
    let thumbLeaf = leaves[0];
    leaves.forEach((l) => { if (l.birthRow < thumbLeaf.birthRow) thumbLeaf = l; });
    const fingerLeaves = leaves.filter((l) => l !== thumbLeaf);
    if (fingerLeaves.length !== 4) return false;

    // Order the remaining four fingers left-to-right, then orient that
    // order (Index→Little vs Little→Index) by which side the thumb sits
    // on, so it always reads Thumb, Index, Middle, Ring, Little regardless
    // of whether this is the mirrored left or right hand.
    fingerLeaves.sort((a, b) => branchCentroidX(a) - branchCentroidX(b));
    const thumbX = branchCentroidX(thumbLeaf);
    const meanFingerX = fingerLeaves.reduce((s, l) => s + branchCentroidX(l), 0) / 4;
    const orderedFingers = thumbX <= meanFingerX ? fingerLeaves : fingerLeaves.slice().reverse();

    // Classify every non-leaf branch as either still-Palm (the trunk,
    // before/around the thumb split-off) or Knuckles (a true fork where
    // the remaining mass divides into finger-pairs, i.e. it's no longer
    // one solid mass but isn't an individual fingertip yet either).
    const palmBranches = [];
    const knuckleBranches = [];
    (function classify(branch) {
      if (branch.children.length === 0) return; // leaf, handled separately
      // This branch's own accumulated rows (up to wherever it next forks)
      // are always still "base of hand" — palm — regardless of what it
      // forks into next.
      palmBranches.push(branch);

      const hasThumbChild = branch.children.includes(thumbLeaf);
      if (hasThumbChild) {
        branch.children.forEach((c) => { if (c !== thumbLeaf) classify(c); });
        return;
      }

      const isForkIntoDigits = branch.children.length >= 2 &&
        branch.children.every((c) => c.children.length > 0 || fingerLeaves.includes(c));
      if (isForkIntoDigits) {
        // A genuine fork into multiple still-forking (or final finger)
        // branches — those children are the knuckle ridge, not the palm.
        branch.children.forEach((c) => {
          if (fingerLeaves.includes(c)) return; // final fingertip, handled elsewhere
          knuckleBranches.push(c);
          classify(c);
        });
      } else {
        branch.children.forEach(classify);
      }
    })(root);

    const palmRect = pixelRectToSvg(branchesPixelRect(palmBranches.length ? palmBranches : [root]), bbox, mask);
    appendHotspotRect(g, regionId, parentRegionName, layout.palm, side, palmRect.x, palmRect.y, palmRect.w, palmRect.h);

    if (layout.knuckles && knuckleBranches.length) {
      const kRect = pixelRectToSvg(branchesPixelRect(knuckleBranches), bbox, mask);
      appendHotspotRect(g, regionId, parentRegionName, layout.knuckles, side, kRect.x, kRect.y, kRect.w, kRect.h);
    } else if (knuckleBranches.length) {
      // No dedicated "Knuckles" name for this region (e.g. back-of-hand) —
      // fold that transitional area into the palm name instead.
      const kRect = pixelRectToSvg(branchesPixelRect(knuckleBranches), bbox, mask);
      appendHotspotRect(g, regionId, parentRegionName, layout.palm, side, kRect.x, kRect.y, kRect.w, kRect.h);
    }

    // Fingers drawn last so they take hover/click priority over the palm
    // and knuckle rects in any small overlap near their base.
    orderedFingers.forEach((leaf, i) => {
      const r = pixelRectToSvg(branchesPixelRect([leaf]), bbox, mask);
      appendHotspotRect(g, regionId, parentRegionName, layout.fingers[i], side, r.x, r.y, r.w, r.h);
    });
    const tRect = pixelRectToSvg(branchesPixelRect([thumbLeaf]), bbox, mask);
    appendHotspotRect(g, regionId, parentRegionName, layout.thumb, side, tRect.x, tRect.y, tRect.w, tRect.h);

    return true;
  }

  // ── Silhouette rasterization + equal-coverage grid splitting ──────
  function rasterizeRegionMask(regionEl, bbox) {
    let d;
    try {
      d = regionEl.getAttribute('d');
      if (!d || typeof Path2D === 'undefined') return null;

      const RES = 160; // max raster dimension — only used to *place* grid
                        // lines; the clip-path still trims to the exact
                        // vector silhouette regardless of this resolution.
      const aspect = bbox.width / bbox.height || 1;
      let cw, ch;
      if (aspect >= 1) { cw = RES; ch = Math.max(8, Math.round(RES / aspect)); }
      else { ch = RES; cw = Math.max(8, Math.round(RES * aspect)); }

      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d');
      const scaleX = cw / bbox.width;
      const scaleY = ch / bbox.height;
      ctx.setTransform(scaleX, 0, 0, scaleY, -bbox.x * scaleX, -bbox.y * scaleY);
      const path2d = new Path2D(d);
      ctx.fillStyle = '#000';
      ctx.fill(path2d);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      const data = ctx.getImageData(0, 0, cw, ch).data;
      const grid = new Uint8Array(cw * ch);
      const rowMass = new Int32Array(ch);
      let total = 0;
      for (let y = 0; y < ch; y++) {
        let rc = 0;
        const rowOff = y * cw;
        for (let x = 0; x < cw; x++) {
          const covered = data[(rowOff + x) * 4 + 3] > 128 ? 1 : 0;
          grid[rowOff + x] = covered;
          rc += covered;
        }
        rowMass[y] = rc;
        total += rc;
      }
      if (total < 8) return null; // degenerate — fall back to uniform grid

      return {
        cw, ch, scaleX, scaleY, grid, rowMass,
        colMassInBand(yTop, yBot) {
          const arr = new Array(cw).fill(0);
          for (let y = yTop; y < yBot; y++) {
            const rowOff = y * cw;
            for (let x = 0; x < cw; x++) arr[x] += grid[rowOff + x];
          }
          return arr;
        }
      };
    } catch (err) {
      return null; // any raster failure just falls back to a uniform grid
    }
  }

  // Given per-index "mass" (e.g. covered-pixel counts along one axis),
  // return k+1 monotonically increasing boundaries [0..L] such that the
  // mass between consecutive boundaries is as equal as possible. This is
  // what lets a row/column of grid cells hug the real silhouette instead
  // of a blind equal-size split.
  function massSplit1D(massArr, k) {
    const L = massArr.length;
    if (k <= 1) return [0, L];
    const total = massArr.reduce((a, b) => a + b, 0);
    const boundaries = [0];
    if (total <= 0) {
      for (let i = 1; i < k; i++) boundaries.push(Math.round((L * i) / k));
      boundaries.push(L);
      return boundaries;
    }
    const cum = new Array(L);
    let acc = 0;
    for (let i = 0; i < L; i++) { acc += massArr[i]; cum[i] = acc; }
    for (let i = 1; i < k; i++) {
      const target = (total * i) / k;
      let lo = 0, hi = L - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] < target) lo = mid + 1; else hi = mid;
      }
      const prev = boundaries[boundaries.length - 1];
      boundaries.push(Math.min(L, Math.max(prev + 1, lo)));
    }
    boundaries.push(L);
    return boundaries;
  }

  function toggleSubSelection(regionId, parentRegionName, subName, side, el) {
    const key = `${regionId}::${subName}`;

    if (state.selections.has(key)) {
      state.selections.delete(key);
      if (el) el.classList.remove('selected');
      if (state.activeSelectionKey === key) {
        state.activeSelectionKey = null;
        hidePanelSections();
      }
    } else {
      state.selections.set(key, {
        regionId,
        parentRegion: parentRegionName,
        subRegion: subName,
        side,
        severity: null,
        note: ''
      });
      if (el) el.classList.add('selected');
      state.activeSelectionKey = key;
      setActiveSelection(key);
    }

    updateSVGRegionState(regionId);
    renderSelectedList();
  }

  function isSelectionExists(regionId, subName) {
    const key = `${regionId}::${subName}`;
    return state.selections.has(key);
  }

  function updateSVGRegionState(regionId) {
    const regionEl = document.getElementById(regionId);
    if (!regionEl) return;

    // Check if any selection belongs to this regionId
    let count = 0;
    let maxSeverity = 0;

    state.selections.forEach((sel) => {
      if (sel.regionId === regionId) {
        count++;
        if (sel.severity && sel.severity > maxSeverity) {
          maxSeverity = sel.severity;
        }
      }
    });

    // Reset classes
    regionEl.classList.remove('selected', 'has-sub-selections');
    for (let i = 1; i <= 5; i++) regionEl.classList.remove('severity-' + i);

    if (count > 0) {
      regionEl.classList.add('selected');
      if (maxSeverity > 0) {
        regionEl.classList.add('severity-' + maxSeverity);
      }
    }
  }

  // ── Active Selection & Detail Panel ────────────────────────────
  function setActiveSelection(key) {
    state.activeSelectionKey = key;
    const data = state.selections.get(key);
    if (!data) return;

    dom.severitySection.classList.remove('hidden');
    dom.notesSection.classList.remove('hidden');

    $$('.severity-dot').forEach((dot) => {
      dot.classList.toggle('active', Number(dot.dataset.level) === data.severity);
    });
    dom.severityLabel.textContent = data.severity ? SEVERITY_LABELS[data.severity] : 'Select severity';
    dom.notesInput.value = data.note || '';

    $$('.selection-card').forEach((card) => {
      card.classList.toggle('active-card', card.dataset.key === key);
    });
  }

  function hidePanelSections() {
    dom.severitySection.classList.add('hidden');
    dom.notesSection.classList.add('hidden');
  }

  // ── Severity Selector ──────────────────────────────────────────
  function bindSeverity() {
    $$('.severity-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        if (!state.activeSelectionKey) return;
        const level = Number(dot.dataset.level);
        const data = state.selections.get(state.activeSelectionKey);
        if (!data) return;

        data.severity = data.severity === level ? null : level;
        state.selections.set(state.activeSelectionKey, data);

        $$('.severity-dot').forEach((d) => {
          d.classList.toggle('active', Number(d.dataset.level) === data.severity);
        });
        dom.severityLabel.textContent = data.severity ? SEVERITY_LABELS[data.severity] : 'Select severity';

        updateSVGRegionState(data.regionId);
        renderSelectedList();
      });
    });
  }

  // ── Notes Section ──────────────────────────────────────────────
  function bindNotes() {
    dom.btnSaveNote.addEventListener('click', () => {
      if (!state.activeSelectionKey) return;
      const data = state.selections.get(state.activeSelectionKey);
      if (!data) return;

      data.note = dom.notesInput.value.trim();
      state.selections.set(state.activeSelectionKey, data);
      showToast('Note saved');
      renderSelectedList();
    });
  }

  // ── Render Selected List ───────────────────────────────────────
  function renderSelectedList() {
    const count = state.selections.size;
    dom.selectionCount.textContent = count;

    if (count === 0) {
      dom.selectedList.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
          <p>Click on any body region</p>
          <span>Select a region to see minor sub-regions</span>
        </div>`;
      hidePanelSections();
      return;
    }

    let html = '';
    state.selections.forEach((data, key) => {
      const isActive = key === state.activeSelectionKey;
      const sevBadge = data.severity
        ? `<span class="card-severity-tag" style="background:${SEVERITY_COLORS[data.severity]}22; color:${SEVERITY_COLORS[data.severity]}">Lv ${data.severity}</span>`
        : '';
      const noteBadge = data.note ? `<span style="color:var(--accent)">📝</span>` : '';

      html += `
        <div class="selection-card ${isActive ? 'active-card' : ''}" data-key="${key}">
          <div class="card-indicator" style="${data.severity ? 'background:' + SEVERITY_COLORS[data.severity] + '; box-shadow:0 0 6px ' + SEVERITY_COLORS[data.severity] + '44' : ''}"></div>
          <div class="card-info">
            <div class="card-region-name">${data.parentRegion} → ${data.subRegion}</div>
            <div class="card-meta">
              <span class="card-side-tag">${data.side}</span>
              ${sevBadge}
              ${noteBadge}
            </div>
          </div>
          <button class="card-remove" data-remove-key="${key}" title="Remove">&times;</button>
        </div>`;
    });

    dom.selectedList.innerHTML = html;

    $$('.selection-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-remove')) return;
        setActiveSelection(card.dataset.key);
        renderSelectedList();
      });
    });

    $$('.card-remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const removeKey = btn.dataset.removeKey;
        const data = state.selections.get(removeKey);
        state.selections.delete(removeKey);

        if (data) {
          updateSVGRegionState(data.regionId);
        }

        if (state.activeSelectionKey === removeKey) {
          state.activeSelectionKey = null;
          hidePanelSections();
        }

        renderSelectedList();
      });
    });
  }

  // ── Actions: Clear & Export ─────────────────────────────────────
  function bindActions() {
    dom.btnClear.addEventListener('click', () => {
      state.selections.forEach((data) => {
        const regionEl = document.getElementById(data.regionId);
        if (regionEl) {
          regionEl.classList.remove('selected', 'has-sub-selections');
          for (let i = 1; i <= 5; i++) regionEl.classList.remove('severity-' + i);
        }
      });
      state.selections.clear();
      state.activeSelectionKey = null;
      unzoomBody();
      renderSelectedList();
      showToast('All selections cleared');
    });

    dom.btnExport.addEventListener('click', () => {
      const exportData = {
        timestamp: new Date().toISOString(),
        totalSelections: state.selections.size,
        selections: []
      };

      state.selections.forEach((data) => {
        exportData.selections.push({
          parentRegion: data.parentRegion,
          subRegion: data.subRegion,
          view: data.side,
          severity: data.severity,
          severityLabel: data.severity ? SEVERITY_LABELS[data.severity].split(' — ')[0] : null,
          note: data.note || null
        });
      });

      dom.exportJson.textContent = JSON.stringify(exportData, null, 2);
      dom.exportModal.classList.remove('hidden');
    });

    dom.modalClose.addEventListener('click', () => dom.exportModal.classList.add('hidden'));
    dom.exportModal.addEventListener('click', (e) => {
      if (e.target === dom.exportModal) dom.exportModal.classList.add('hidden');
    });

    dom.btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(dom.exportJson.textContent).then(() => {
        showToast('Copied to clipboard');
      });
    });
  }

  // ── Toast ──────────────────────────────────────────────────────
  function showToast(msg) {
    const existing = $('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
