import { useState, useEffect } from "react";

const EXAMPLE = {
  grid: [
    ["1","*","9","*","8","+"],
    ["+","6","-","1","/","7"],
    ["3","+","6","/","8","*"],
    ["-","3","+","2","*","7"],
    ["3","*","4","-","6","-"],
    ["*","5","-","6","+","5"],
  ],
  target: 89,
  n: 6,
};

const OPS = ["+", "-", "*", "/"];

function initGrid(n) {
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => ((r + c) % 2 === 0 ? "1" : "+"))
  );
}

function applyOp(a, op, b) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return b !== 0 ? a / b : NaN;
  return NaN;
}

function solve(grid, target, N) {
  const solutions = [];

  function dfs(row, col, value, pendingOp, path) {
    if (row === N - 1 && col === N - 1) {
      if (Math.abs(value - target) < 0.0001)
        solutions.push([...path, [row, col]]);
      return;
    }
    const next = [];
    if (col + 1 < N) next.push([row, col + 1]);
    if (row + 1 < N) next.push([row + 1, col]);

    for (const [nr, nc] of next) {
      const cell = grid[nr][nc];
      if ((nr + nc) % 2 === 1) {
        dfs(nr, nc, value, cell, [...path, [row, col]]);
      } else {
        const num = +cell;
        if (isNaN(num)) continue;
        const nv = applyOp(value, pendingOp, num);
        if (isFinite(nv)) dfs(nr, nc, nv, null, [...path, [row, col]]);
      }
    }
  }

  const sv = +grid[0][0];
  if (!isNaN(sv)) dfs(0, 0, sv, null, []);
  return solutions;
}

function buildSteps(grid, path) {
  if (!path || path.length === 0) return [];
  const steps = [];
  let val = +grid[path[0][0]][path[0][1]];
  steps.push({ label: `${val}`, val, isStart: true });
  for (let i = 1; i < path.length; i += 2) {
    if (i + 1 < path.length) {
      const op = grid[path[i][0]][path[i][1]];
      const num = +grid[path[i + 1][0]][path[i + 1][1]];
      const nv = applyOp(val, op, num);
      steps.push({ label: `${val} ${op} ${num}`, val: nv });
      val = nv;
    }
  }
  return steps;
}

export default function GridSolver() {
  const [n, setN] = useState(6);
  const [target, setTarget] = useState(89);
  const [grid, setGrid] = useState(EXAMPLE.grid.map((r) => [...r]));
  const [solutions, setSolutions] = useState(null);
  const [solIdx, setSolIdx] = useState(0);
  const [status, setStatus] = useState("idle");

  const currentPath = solutions?.[solIdx] ?? null;
  const pathSet = new Set(currentPath?.map(([r, c]) => `${r},${c}`) ?? []);
  const steps = buildSteps(grid, currentPath);

  useEffect(() => { setSolIdx(0); }, [solutions]);

  const handleResize = (newN) => {
    setN(newN);
    setGrid(initGrid(newN));
    setSolutions(null);
    setStatus("idle");
  };

  const handleCell = (r, c, val) => {
    setGrid((prev) => {
      const g = prev.map((row) => [...row]);
      g[r][c] = val;
      return g;
    });
    setSolutions(null);
    setStatus("idle");
  };

  const handleSolve = () => {
    setStatus("solving");
    setSolutions(null);
    setTimeout(() => {
      const sols = solve(grid, +target, n);
      setSolutions(sols);
      setStatus("done");
    }, 20);
  };

  const loadExample = () => {
    setN(6);
    setTarget(89);
    setGrid(EXAMPLE.grid.map((r) => [...r]));
    setSolutions(null);
    setStatus("idle");
  };

  const cellPx = Math.min(68, Math.floor(420 / n));
  const fontSize = Math.max(11, Math.min(18, cellPx * 0.3));

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07070f",
      color: "#dddaf0",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      padding: "28px 16px 48px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "22px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box}
        input[type=number]::-webkit-inner-spin-button{display:none}
        input[type=number]{-moz-appearance:textfield}
        .cell-n{
          background:#141428;border:1.5px solid #33316a;color:#b8b5e8;
          border-radius:50%;text-align:center;cursor:pointer;
          transition:background .15s,border-color .15s,box-shadow .15s;outline:none;padding:0;
          font-family:'DM Mono',monospace;font-weight:500;
        }
        .cell-n:hover{border-color:#5855b8;background:#1c1c38}
        .cell-n:focus{border-color:#7c79e0;background:#22224a;box-shadow:0 0 0 3px rgba(124,121,224,.2)}
        .cell-n.lit{background:#2a1a00;border-color:#d4960e;color:#ffd06a;box-shadow:0 0 14px rgba(212,150,14,.35)}
        .cell-o{
          background:#141428;border:1.5px solid #33316a;color:#9896cc;
          border-radius:50%;cursor:pointer;
          transition:background .15s,border-color .15s,box-shadow .15s;
          padding:0;outline:none;appearance:none;-webkit-appearance:none;
          text-align:center;text-align-last:center;font-family:'DM Mono',monospace;
        }
        .cell-o:hover{border-color:#5855b8;background:#1c1c38}
        .cell-o:focus{border-color:#7c79e0}
        .cell-o.lit{background:#141428;border-color:#d4960e;color:#ffd06a;box-shadow:0 0 14px rgba(212,150,14,.25)}
        select option{background:#141428}
        .sz{
          background:#0e0e22;color:#7875b8;border:1px solid #252545;border-radius:7px;
          padding:5px 11px;font-family:'DM Mono',monospace;font-size:12px;cursor:pointer;
          transition:all .15s;
        }
        .sz:hover{border-color:#4a47b8;color:#b0aee0}
        .sz.on{background:#1c1c3a;border-color:#6360c8;color:#dddaf0}
        .go{
          background:#4a47b8;color:#fff;border:none;border-radius:10px;
          padding:12px 36px;font-size:15px;font-weight:500;cursor:pointer;
          font-family:'DM Mono',monospace;letter-spacing:.06em;
          transition:background .15s,transform .1s,box-shadow .15s;
          box-shadow:0 4px 24px rgba(74,71,184,.35);
        }
        .go:hover{background:#6360d4;transform:translateY(-2px);box-shadow:0 6px 28px rgba(74,71,184,.5)}
        .go:active{transform:translateY(0)}
        .go:disabled{opacity:.5;cursor:default;transform:none}
        .nav{
          background:#0e0e22;color:#7875b8;border:1px solid #252545;border-radius:6px;
          padding:5px 14px;font-family:'DM Mono',monospace;font-size:12px;cursor:pointer;
          transition:all .15s;
        }
        .nav:hover:not(:disabled){border-color:#6360c8;color:#b0aee0}
        .nav:disabled{opacity:.3;cursor:default}
        .step{
          display:flex;align-items:center;gap:12px;padding:8px 14px;border-radius:8px;
          background:#0e0e1e;border:1px solid #1e1e3a;font-size:13px;
          transition:border-color .2s;
        }
        .step.win{border-color:#d4960e;background:#120e00}
        .tgt-input{
          background:#0e0e22;border:1px solid #252545;border-radius:8px;
          padding:7px 12px;color:#dddaf0;font-family:'DM Mono',monospace;
          font-size:15px;font-weight:500;width:88px;outline:none;text-align:center;
          transition:border-color .15s;
        }
        .tgt-input:focus{border-color:#6360c8}
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{
          margin: 0, fontSize: "26px",
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          color: "#dddaf0", letterSpacing: "-0.02em",
        }}>
          Grid Path Solver
        </h1>
        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#55528a" }}>
          Move only → or ↓ from top-left to bottom-right · evaluated left-to-right
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#55528a", marginRight: "2px" }}>Grid</span>
          {[3, 4, 5, 6, 7, 8].map((s) => (
            <button key={s} className={`sz${n === s ? " on" : ""}`} onClick={() => handleResize(s)}>
              {s}×{s}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#55528a" }}>Target</span>
          <input
            type="number"
            value={target}
            className="tgt-input"
            onChange={(e) => { setTarget(e.target.value); setSolutions(null); setStatus("idle"); }}
          />
        </div>
        <button className="nav" onClick={loadExample}>Load example</button>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${n}, ${cellPx}px)`,
        gap: "5px",
        padding: "4px",
      }}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const lit = pathSet.has(`${r},${c}`);
            const isN = (r + c) % 2 === 0;
            const isStart = r === 0 && c === 0;
            const isEnd = r === n - 1 && c === n - 1;

            return isN ? (
              <div key={`${r}-${c}`} style={{ position: "relative" }}>
                {isStart && (
                  <div style={{
                    position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)",
                    fontSize: "9px", color: "#7875b8", whiteSpace: "nowrap", letterSpacing: ".05em"
                  }}>START</div>
                )}
                {isEnd && (
                  <div style={{
                    position: "absolute", bottom: -18, left: "50%", transform: "translateX(-50%)",
                    fontSize: "9px", color: "#7875b8", whiteSpace: "nowrap", letterSpacing: ".05em"
                  }}>END</div>
                )}
                <input
                  type="number"
                  value={cell}
                  onChange={(e) => handleCell(r, c, e.target.value)}
                  className={`cell-n${lit ? " lit" : ""}`}
                  style={{ width: cellPx, height: cellPx, fontSize }}
                />
              </div>
            ) : (
              <select
                key={`${r}-${c}`}
                value={cell}
                onChange={(e) => handleCell(r, c, e.target.value)}
                className={`cell-o${lit ? " lit" : ""}`}
                style={{ width: cellPx, height: cellPx, fontSize }}
              >
                {OPS.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            );
          })
        )}
      </div>

      {/* Legend hint */}
      <div style={{ display: "flex", gap: "20px", fontSize: "11px", color: "#3d3a6a" }}>
        <span>◉ Numbers at (row+col) even positions</span>
        <span>◉ Operators at (row+col) odd positions</span>
      </div>

      {/* Solve */}
      <button className="go" onClick={handleSolve} disabled={status === "solving"}>
        {status === "solving" ? "Solving…" : "Solve"}
      </button>

      {/* Results */}
      {status === "done" && solutions !== null && (
        <div style={{ width: "100%", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {solutions.length === 0 ? (
            <div style={{
              textAlign: "center", color: "#c85555", fontSize: "14px",
              padding: "18px", background: "#160808", borderRadius: "12px",
              border: "1px solid #3a1010",
            }}>
              No path found that reaches <strong>{target}</strong>
            </div>
          ) : (
            <>
              {/* Solution nav */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#55528a" }}>
                  {solutions.length} solution{solutions.length !== 1 ? "s" : ""} found
                </span>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button className="nav" disabled={solIdx === 0} onClick={() => setSolIdx((i) => i - 1)}>← Prev</button>
                  <span style={{ fontSize: "12px", color: "#9896cc", minWidth: "52px", textAlign: "center" }}>
                    {solIdx + 1} / {solutions.length}
                  </span>
                  <button className="nav" disabled={solIdx === solutions.length - 1} onClick={() => setSolIdx((i) => i + 1)}>Next →</button>
                </div>
              </div>

              {/* Path expression */}
              <div style={{
                background: "#0e0e22", borderRadius: "10px", padding: "12px 16px",
                border: "1px solid #1e1e3a", fontSize: "13px", color: "#7875b8",
                letterSpacing: ".02em", lineHeight: "1.6",
              }}>
                {steps.map((s, i) => (
                  <span key={i}>
                    {i === 0 ? (
                      <span style={{ color: "#ffd06a", fontWeight: 500 }}>{s.label}</span>
                    ) : (
                      <>
                        <span style={{ color: "#55528a" }}> → </span>
                        <span style={{ color: i === steps.length - 1 ? "#ffd06a" : "#b0aee0" }}>{s.label}</span>
                      </>
                    )}
                  </span>
                ))}
                <span style={{ color: "#55528a" }}> = </span>
                <span style={{ color: "#ffd06a", fontWeight: 500 }}>{steps[steps.length - 1]?.val}</span>
              </div>

              {/* Step breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {steps.slice(1).map((step, i) => (
                  <div key={i} className={`step${i === steps.length - 2 ? " win" : ""}`}>
                    <span style={{ color: "#3d3a6a", fontSize: "11px", minWidth: "18px", textAlign: "right" }}>{i + 1}.</span>
                    <span style={{ flex: 1, color: "#9896cc" }}>{step.label}</span>
                    <span style={{
                      color: i === steps.length - 2 ? "#ffd06a" : "#7875b8",
                      fontWeight: i === steps.length - 2 ? 500 : 400,
                    }}>
                      = {Number.isInteger(step.val) ? step.val : step.val.toFixed(4).replace(/\.?0+$/, "")}
                    </span>
                    {i === steps.length - 2 && (
                      <span style={{ color: "#d4960e", fontSize: "11px" }}>✓</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Path coords */}
              <div style={{ fontSize: "11px", color: "#3d3a6a", textAlign: "center", marginTop: "4px" }}>
                Path: {currentPath?.map(([r, c]) => `(${r},${c})`).join(" → ")}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
