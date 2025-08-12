import React, { useMemo, useState, useEffect } from "react";

// === Picross Generator + Player ===
// Fix: Clipboard API can be blocked in sandboxed/embedded contexts.
// We now use a robust copy helper with fallbacks (execCommand → manual modal)
// so clicking "Copy Matrix" never throws. Added lightweight tests.

// Small inline sample so you can try immediately (a simple smiley)
const SAMPLE_15x15 = [
  "000000000000000",
  "000111111111000",
  "001100000001100",
  "011000000000110",
  "011000110001110",
  "110001111000011",
  "110011111100011",
  "110011111100011",
  "110001111000011",
  "011000110001110",
  "011000000000110",
  "001100000001100",
  "000111111111000",
  "000000000000000",
  "000000000000000",
];

function fromBinaryRows(rows) {
  return rows.map((r) => r.split("").map((ch) => ch === "1"));
}

// Compute nonogram clues from boolean matrix (true = filled)
function computeClues(matrix) {
  const h = matrix.length;
  const w = matrix[0].length;
  const rowClues = matrix.map((row) => {
    const clues = [];
    let run = 0;
    for (let c = 0; c < w; c++) {
      if (row[c]) run++;
      else if (run) {
        clues.push(run);
        run = 0;
      }
    }
    if (run) clues.push(run);
    return clues.length ? clues : [0];
  });

  const colClues = [];
  for (let c = 0; c < w; c++) {
    const clues = [];
    let run = 0;
    for (let r = 0; r < h; r++) {
      if (matrix[r][c]) run++;
      else if (run) {
        clues.push(run);
        run = 0;
      }
    }
    if (run) clues.push(run);
    colClues.push(clues.length ? clues : [0]);
  }
  return { rowClues, colClues };
}

// Image -> 15x15 boolean matrix using canvas (contrast + threshold)
async function imageToMatrix({ file, contrast = 1.8, threshold = 128 }) {
  const img = new Image();
  img.decoding = "async";
  img.crossOrigin = "anonymous";
  const url = file instanceof File ? URL.createObjectURL(file) : file; // allow dataURL
  img.src = url;
  await img.decode();

  // Draw to temp canvas
  const src = document.createElement("canvas");
  const sctx = src.getContext("2d", { willReadFrequently: true });
  src.width = img.width;
  src.height = img.height;
  sctx.drawImage(img, 0, 0);

  // Convert to grayscale + contrast
  const imgData = sctx.getImageData(0, 0, src.width, src.height);
  const d = imgData.data;
  const factor =
    (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    const c = factor * (gray - 128) + 128; // increase contrast around mid-point
    const v = Math.max(0, Math.min(255, c));
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  sctx.putImageData(imgData, 0, 0);

  // Downscale to 15x15 with nearest-neighbor (preserve pixels)
  const SIZE = 15;
  const dst = document.createElement("canvas");
  const dctx = dst.getContext("2d", { willReadFrequently: true });
  dst.width = SIZE;
  dst.height = SIZE;
  dctx.imageSmoothingEnabled = false;
  dctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, SIZE, SIZE);

  // Read back, threshold to BW, build matrix
  const out = dctx.getImageData(0, 0, SIZE, SIZE);
  const matrix = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4;
      const val = out.data[idx];
      const black = val < threshold; // black pixel
      matrix[y][x] = black;
      // also write back pure B/W for preview
      const bw = black ? 0 : 255;
      out.data[idx] = out.data[idx + 1] = out.data[idx + 2] = bw;
      out.data[idx + 3] = 255;
    }
  }
  dctx.putImageData(out, 0, 0);
  const previewURL = dst.toDataURL("image/png");
  return { matrix, previewURL };
}

function useDownload() {
  return (dataURL, filename) => {
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = filename;
    a.click();
  };
}

// Robust copy helper with fallbacks
async function safeCopy(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return { ok: true, via: "clipboard" };
    }
  } catch (e) {
    // ignore and try legacy
  }
  // Legacy fallback
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok ? { ok: true, via: "execCommand" } : { ok: false };
  } catch (e) {
    document.body.removeChild(ta);
    return { ok: false, error: e };
  }
}

const CellState = { Empty: 0, Fill: 1, X: 2 };

export default function PicrossApp() {
  const [matrix, setMatrix] = useState(fromBinaryRows(SAMPLE_15x15));
  const [preview, setPreview] = useState(null);
  const [contrast, setContrast] = useState(1.8);
  const [threshold, setThreshold] = useState(128);
  const [grid, setGrid] = useState(() =>
    Array.from({ length: 15 }, () => Array(15).fill(CellState.Empty))
  );
  const download = useDownload();

  // Copy modal fallback (manual)
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [lastCopyText, setLastCopyText] = useState("");
  const [toast, setToast] = useState("");

  const { rowClues, colClues } = useMemo(() => computeClues(matrix), [matrix]);
  const maxRow = useMemo(
    () => Math.max(...rowClues.map((r) => r.length)),
    [rowClues]
  );
  const maxCol = useMemo(
    () => Math.max(...colClues.map((c) => c.length)),
    [colClues]
  );

  const solved = useMemo(() => {
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        if (matrix[y][x] && grid[y][x] !== CellState.Fill) return false;
        if (!matrix[y][x] && grid[y][x] === CellState.Fill) return false;
      }
    }
    return true;
  }, [matrix, grid]);

  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  function regenerateFromSample() {
    const m = fromBinaryRows(SAMPLE_15x15);
    setMatrix(m);
    setGrid(Array.from({ length: 15 }, () => Array(15).fill(CellState.Empty)));
    setPreview(null);
  }

  async function handleFile(file) {
    const { matrix: m, previewURL } = await imageToMatrix({
      file,
      contrast,
      threshold,
    });
    setMatrix(m);
    setPreview(previewURL);
    setGrid(Array.from({ length: 15 }, () => Array(15).fill(CellState.Empty)));
  }

  function exportPuzzle() {
    const data = { matrix, rowClues, colClues };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    download(url, "picross-15x15.json");
    URL.revokeObjectURL(url);
  }

  function downloadPreview() {
    if (!preview) return;
    download(preview, "picross_15x15.png");
  }

  async function copyMatrix() {
    const text = JSON.stringify({ matrix });
    setLastCopyText(text);
    const res = await safeCopy(text);
    if (res.ok) flash(`Copied (${res.via})`);
    else {
      setCopyModalOpen(true); // manual UI fallback
    }
  }

  // --- Lightweight tests ---
  const [testSummary, setTestSummary] = useState({ passed: 0, total: 0 });
  useEffect(() => {
    function deepEq(a, b) {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    let passed = 0;
    let total = 0;

    // Test 1: 3x3 all empty
    total++;
    const t1 = Array.from({ length: 3 }, () => Array(3).fill(false));
    const e1 = { row: [[0], [0], [0]], col: [[0], [0], [0]] };
    const r1 = computeClues(t1);
    if (deepEq(r1.rowClues, e1.row) && deepEq(r1.colClues, e1.col)) passed++;

    // Test 2: 5x5 full third row
    total++;
    const t2 = Array.from({ length: 5 }, (_, r) =>
      Array.from({ length: 5 }, () => r === 2)
    );
    const e2row = [[0], [0], [5], [0], [0]];
    const e2col = Array.from({ length: 5 }, () => [1]);
    const r2 = computeClues(t2);
    if (deepEq(r2.rowClues, e2row) && deepEq(r2.colClues, e2col)) passed++;

    // Test 3: 1x5 with two runs in row -> [2,1]
    total++;
    const t3 = [[true, true, false, true, false]];
    const r3 = computeClues(t3);
    if (
      deepEq(r3.rowClues, [[2, 1]]) &&
      deepEq(r3.colClues, [[1], [1], [0], [1], [0]])
    )
      passed++;

    setTestSummary({ passed, total });
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 selection:bg-fuchsia-500/40">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Picross Generator + Player
          </h1>
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                solved
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              {solved ? "Solved!" : "Playing"}
            </div>
            <div className="px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-300 ring-1 ring-white/10">
              Tests {testSummary.passed}/{testSummary.total}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Controls */}
          <aside className="lg:col-span-4">
            <div className="bg-slate-800/70 rounded-2xl p-4 shadow-xl ring-1 ring-white/10">
              <h2 className="text-lg font-medium mb-3">1) Build the puzzle</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] && handleFile(e.target.files[0])
                      }
                    />
                    <span>Upload image</span>
                  </label>
                  <button
                    onClick={regenerateFromSample}
                    className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600"
                  >
                    Use sample
                  </button>
                </div>
                <div>
                  <label className="text-sm text-slate-300">
                    Contrast: {contrast.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min={0.2}
                    max={3}
                    step={0.05}
                    value={contrast}
                    onChange={(e) => setContrast(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">
                    Threshold: {threshold}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    step={1}
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Tip: Upload any image. It will be contrasted, downscaled to
                  15×15, and thresholded to black/white.
                </p>
                {preview && (
                  <div className="pt-2">
                    <img
                      src={preview}
                      alt="15x15 preview"
                      className="mx-auto rounded-lg border border-white/10 image-render-pixel"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={downloadPreview}
                        className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600"
                      >
                        Download 15×15 PNG
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-800/70 rounded-2xl p-4 shadow-xl ring-1 ring-white/10 mt-4">
              <h2 className="text-lg font-medium mb-3">2) Share or save</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={exportPuzzle}
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600"
                >
                  Export JSON
                </button>
                <button
                  onClick={copyMatrix}
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600"
                >
                  Copy Matrix
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                If clipboard access is blocked by your browser or sandbox, a
                manual copy dialog will appear.
              </p>
            </div>
          </aside>

          {/* Puzzle */}
          <main className="lg:col-span-8">
            <div className="bg-slate-800/70 rounded-2xl p-4 md:p-6 shadow-2xl ring-1 ring-white/10">
              <h2 className="text-lg font-medium mb-4">3) Solve the puzzle</h2>
              <Board
                matrix={matrix}
                grid={grid}
                setGrid={setGrid}
                rowClues={rowClues}
                colClues={colClues}
                maxRow={maxRow}
                maxCol={maxCol}
              />
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() =>
                    setGrid(
                      Array.from({ length: 15 }, () =>
                        Array(15).fill(CellState.Empty)
                      )
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600"
                >
                  Clear
                </button>
                <button
                  onClick={() =>
                    setGrid(
                      matrix.map((row) =>
                        row.map((v) => (v ? CellState.Fill : CellState.X))
                      )
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600"
                >
                  Reveal
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-3 right-3 bg-slate-800 text-slate-100 px-3 py-2 rounded-lg shadow-lg ring-1 ring-white/10">
          {toast}
        </div>
      )}

      {/* Manual copy modal */}
      {copyModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm grid place-items-center p-4 z-50">
          <div className="w-full max-w-xl bg-slate-800 rounded-2xl p-4 ring-1 ring-white/10 shadow-xl">
            <h3 className="text-lg font-medium mb-2">
              Clipboard not available
            </h3>
            <p className="text-sm text-slate-300 mb-2">
              Your environment blocked clipboard access. Select and copy the
              text below.
            </p>
            <textarea
              className="w-full h-48 p-3 rounded-lg bg-slate-900 text-slate-100 border border-white/10"
              defaultValue={lastCopyText}
              onFocus={(e) => e.currentTarget.select()}
            />
            <div className="flex gap-2 justify-end mt-3">
              <button
                className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600"
                onClick={async () => {
                  const res = await safeCopy(lastCopyText);
                  if (res.ok) {
                    setCopyModalOpen(false);
                    flash(`Copied (${res.via})`);
                  } else {
                    flash("Select text and press Ctrl/Cmd+C");
                  }
                }}
              >
                Try Copy
              </button>
              <button
                className="px-3 py-2 rounded-xl bg-slate-600 hover:bg-slate-500"
                onClick={() => setCopyModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.image-render-pixel{image-rendering: pixelated;}`}</style>
    </div>
  );
}

function Board({ matrix, grid, setGrid, rowClues, colClues, maxRow, maxCol }) {
  const SIZE = 15;
  function handleClick(e, y, x) {
    e.preventDefault();
    const right = e.button === 2 || e.ctrlKey || e.metaKey;
    setGrid((prev) => {
      const cur = prev[y][x];
      const next = right ? (cur === 2 ? 0 : 2) : cur === 1 ? 0 : 1;
      const copy = prev.map((r) => r.slice());
      copy[y][x] = next;
      return copy;
    });
  }

  return (
    <div
      className="w-full overflow-auto"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="inline-grid"
        style={{
          gridTemplateColumns: `repeat(${maxCol}, 1.5rem) repeat(${SIZE}, 1.75rem)`,
          gridTemplateRows: `repeat(${maxRow}, 1.5rem) repeat(${SIZE}, 1.75rem)`,
        }}
      >
        {/* top-left empty spacer (use style, not literal class values) */}
        <div
          style={{
            gridColumn: `1 / span ${maxCol}`,
            gridRow: `1 / span ${maxRow}`,
          }}
        />

        {/* Column clues */}
        {colClues.map((col, c) => (
          <div
            key={`c-${c}`}
            className="flex flex-col justify-end items-center gap-0.5 pb-1 border-b border-white/20"
            style={{
              gridColumn: maxCol + 1 + c,
              gridRow: `1 / span ${maxRow}`,
            }}
          >
            {Array.from({ length: maxCol - col.length }).map((_, i) => (
              <div key={`ci-${i}`} className="h-3"></div>
            ))}
            {col.map((n, i) => (
              <div key={i} className="text-xs text-slate-200 leading-none">
                {n}
              </div>
            ))}
          </div>
        ))}

        {/* Row clues and grid */}
        {rowClues.map((row, r) => (
          <React.Fragment key={`r-${r}`}>
            <div
              className="flex items-center justify-end gap-1 pr-1 border-r border-white/20"
              style={{
                gridColumn: `1 / span ${maxRow ? maxCol : 0}`,
                gridRow: maxRow + 1 + r,
              }}
            >
              {Array.from({ length: maxRow - row.length }).map((_, i) => (
                <div key={`ri-${i}`} className="w-3"></div>
              ))}
              {row.map((n, i) => (
                <div key={i} className="text-xs text-slate-200 leading-none">
                  {n}
                </div>
              ))}
            </div>
            {Array.from({ length: SIZE }).map((_, c) => {
              const v = grid[r][c];
              const isBoldV = (c + 1) % 5 === 0;
              const isBoldH = (r + 1) % 5 === 0;
              return (
                <button
                  key={`cell-${r}-${c}`}
                  onClick={(e) => handleClick(e, r, c)}
                  onContextMenu={(e) => handleClick(e, r, c)}
                  className={`relative select-none border border-white/10 ${
                    isBoldV ? "border-r-white/40" : ""
                  } ${
                    isBoldH ? "border-b-white/40" : ""
                  } hover:bg-white/10 active:scale-[.98] transition-transform`}
                  style={{
                    width: "1.75rem",
                    height: "1.75rem",
                    gridColumn: maxCol + 1 + c,
                    gridRow: maxRow + 1 + r,
                  }}
                >
                  <div
                    className={`absolute inset-0 ${
                      v === 1 ? "bg-slate-100" : ""
                    }`}
                  ></div>
                  {v === 2 && (
                    <div className="absolute inset-0 grid place-items-center text-slate-300">
                      ×
                    </div>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="text-xs text-slate-400 mt-3">
        Left click = fill, Right click/Ctrl-click = X. Bold lines every 5.
      </div>
    </div>
  );
}
