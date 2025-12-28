/**
 * @title Pathfinding Algorithms
 * @author Luyu Cheng
 * @created 2025-12-25
 * @pull_request 185
 * @github chengluyu
 * @label Algorithm
 */

/**
 * ============================================================================
 * =                        Pathfinding Algorithms                            =
 * ============================================================================
 *
 * A side-by-side comparison of three classic pathfinding algorithms: BFS
 * (Breadth-First Search), DFS (Depth-First Search), and A* (A-star). This
 * example visualizes how each algorithm explores a randomly generated maze
 * to find the shortest path from the top-left corner to the bottom-right.
 *
 * The visualization shows:
 *
 * - **BFS**: Explores level by level, guaranteeing the shortest path but
 *   exploring many cells. Uses a queue to process nodes in order of distance.
 *
 * - **DFS**: Explores deeply before backtracking, often finding a path quickly
 *   but not necessarily the shortest. Uses recursion/stack to explore paths.
 *
 * - **A***: Uses a heuristic (Manhattan distance) to guide the search toward
 *   the goal, typically exploring fewer cells than BFS while still finding the
 *   optimal path. Uses a priority queue (heap) ordered by f = g + h.
 *
 * Each algorithm is visualized with:
 * - `█` (walls) - Obstacles that cannot be traversed
 * - `░` (planned) - Cells considered but not yet visited
 * - `▒` (walked) - Cells that have been visited
 * - Box-drawing characters - The final path from start to exit
 *
 * The timing shows that A* is significantly faster in this scenario because
 * it uses the heuristic to focus the search toward the goal.
 */

//➜ ╔══════════════════════════╗    ╔══════════════════════════╗    ╔══════════════════════════╗
//➜ ║ ╾─────────────────╮█▒▒▒▒ ║    ║ ╾─────────────────╮█╭──╮ ║    ║ ╿░                 █     ║
//➜ ║ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒█▒▒▒│█▒▒▒▒ ║    ║ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒█╭──╯█│╭─╯ ║    ║ │░            █    █     ║
//➜ ║ ▒▒▒▒▒▒▒▒▒▒▒████▒▒▒╰───╮▒ ║    ║ ▒▒▒▒▒▒▒▒▒▒▒████╰────╯╰─╮ ║    ║ │░         ████          ║
//➜ ║ ▒▒▒▒▒▒▒▒▒▒▒████▒▒▒▒▒▒▒│▒ ║    ║ ▒▒▒▒▒▒▒▒▒▒▒████╭───────╯ ║    ║ │░         ████          ║
//➜ ║ ▒▒▒▒▒▒▒▒▒▒▒████▒▒▒▒▒▒▒│█ ║    ║ ╭───────╮▒▒████╰──────╮█ ║    ║ │░         ████        █ ║
//➜ ║ ▒▒▒▒█▒▒█▒▒▒▒▒▒▒▒▒▒▒▒▒▒╰╮ ║    ║ ╰──╮█╭╮█╰─────────────╯▒ ║    ║ │░  █  █                 ║
//➜ ║ ▒▒▒▒█▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██│ ║    ║ ╭──╯█│╰─────────────╮██▒ ║    ║ │░  █                ██  ║
//➜ ║ ▒▒▒█▒▒▒▒▒▒▒▒▒██▒▒▒▒▒▒██│ ║    ║ ╰─╮█╭╯       ██╭────╯██▒ ║    ║ │░ █         ██      ██  ║
//➜ ║ ▒▒▒▒▒▒▒▒▒▒▒▒▒██▒▒▒▒▒▒█▒│ ║    ║ ╭─╯╭╯        ██╰────╮█╭╮ ║    ║ │░           ██      █   ║
//➜ ║ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█▒│ ║    ║ ╰──╯╭───────────────╯█││ ║    ║ │░                   █   ║
//➜ ║ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ ║    ║ ╭───╯╭────────────────╯│ ║    ║ │░░░░░░░░░░░░░░░░░░░░░░  ║
//➜ ║ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒╽ ║    ║ ╰────╯                 ╽ ║    ║ ╰──────────────────────╼ ║
//➜ ╚══════════════════════════╝    ╚══════════════════════════╝    ╚══════════════════════════╝
//➜ BFS                   6.199s    DFS                   5.438s    A*                    1.238s
{
  echo.set("typeface", "Google Sans Code");
  echo(renderState(state));
}

// State management: tracks the three rooms (BFS, DFS, A*) and animation status
const [state, setState] = recho.state(createState());

// Button to start/reset the pathfinding animation
recho.button("Run", () => {
  // Prevent starting a new run if one is already in progress
  if (state.start !== null && state.end === null) return; // Started but not finished.
  // Reset if previous run completed
  if (state.done) setState(createState());
  // Start animation: update state every 12ms
  const ctx = {};
  ctx.id = setInterval(setState.bind(null, updateState.bind(null, ctx)), 12);
});

// Creates initial state with a new room and solves it with all three algorithms
function createState() {
  const room = createRoom();
  // Solve the same room layout with each algorithm (using clones to avoid interference)
  const rooms = [
    solveRoom(structuredClone(room), "BFS", bfs),
    solveRoom(structuredClone(room), "DFS", dfs),
    solveRoom(structuredClone(room), "A*", astar),
  ];
  return {rooms, start: null, done: false};
}

// Updates the animation state by advancing each room's pathfinding step
function updateState({id}, {rooms, start}) {
  start ??= Date.now(); // Record start time on first update
  const newRooms = rooms.map(updateRoom); // Advance each algorithm one step
  const done = newRooms.every(room => room.end !== null); // Check if all finished
  if (done) clearInterval(id); // Stop animation when complete
  return {rooms: newRooms, start, done};
}

// Renders all three rooms side-by-side with timing information
function renderState({rooms, start}) {
  const chunks = rooms.map(room => renderRoom(start, room).split("\n"));
  // Combine corresponding lines from each room with spacing
  const lines = [];
  for (let i = 0, n = chunks[0].length; i < n; i++) {
    lines.push(chunks.map(chunk => chunk[i]).join("    "));
  }
  return lines.join("\n");
}

// Renders a single room with its current state and timing
function renderRoom(start, {name, map: rows, exit, steps, path, pathChars, at, end}) {
  const w = rows[0].length, d = start ? (end ?? Date.now()) - start : 0;
  // During animation: show cells as-is. After completion: overlay path characters
  const row = at < steps.length
    ? (cells => cells.join(""))
    : ((cells, y) => cells.map((c, x) => pathChars.get(key(x, y)) ?? c).join(""))
  // Build the room with box-drawing borders
  const m = "╔═" + "═".repeat(w) + "═╗\n" +
    rows.map((cells, y) => "║ " + row(cells, y) + " ║").join("\n") +
    "\n╚═" + "═".repeat(w) + "═╝\n";
  // Add algorithm name and elapsed time below the room
  const b = spaceBetween(w + 4, name, (d / 1000).toFixed(3) + "s");
  return m + b;
}

// Creates a random room with walls and an exit point
function createRoom(rows = 12, cols = 24, numBlockages = 10) {
  const exit = [23, 11]; // Bottom-right corner
  // Generate random rectangular blockages
  const blockages = Array.from({length: numBlockages}).map(_ => blockage(rows, cols));
  // Determine cell type: exit, wall, or empty space
  const cell = (x, y) => x === exit[0] && y === exit[1] ? EXIT :
    blockages.some(b => inside(b, x, y)) ? WALL : AIR;
  // Build the 2D map
  const map = Array.from({length: rows})
    .map((_, y) => Array.from({length: cols}).map((_, x) => cell(x, y)));
  return {map, exit, at: 0, start: null, end: null};
}

// Solves a room using the specified pathfinding algorithm
function solveRoom(room, name, work) {
  // work is the pathfinding function (bfs, dfs, or astar)
  const {steps, path} = work(room.map, [0, 0], room.exit);
  // Pre-compute path visualization characters
  return {...room, name, steps, path, pathChars: drawPath(path)};
}

// Advances a room's animation by one step
function updateRoom(room) {
  // Mark as complete if all steps processed
  if (room.at >= room.steps.length) return {...room, end: room.end ?? Date.now()};
  const {map, exit, steps, at, ...rest} = room;
  // Apply the current step: mark cell as walked
  const [x, y, c] = steps[at];
  map[y][x] = x === exit[0] && y === exit[1] ? EXIT_WALKED : c;
  return {map, exit, steps, at: at + 1, ...rest}
}

// Cell type constants for the maze
const WALL = "█", EXIT = "╳", AIR = " ", PLANNED = "░", WALKED = "▒", EXIT_WALKED = "▓";

/**
 * Breadth-First Search: Explores level by level using a queue.
 * Guarantees shortest path but may explore many cells.
 * @param {string[][]} m - The map/grid
 * @param {number[]} s - Start position [x, y]
 * @param {number[]} t - Target/exit position [x, y]
 * @returns {{steps: Array, path: Array}} - All steps taken and the final path
 */
function bfs(m, s, t) {
  const q = [s], v = new Map([[s.join(","), false]]), ss = new Map();
  const steps = [];
  // Attempt to visit a neighbor cell
  function attempt(u, x, y) {
    const k = key(x, y);
    if (m[y][x] !== WALL && !v.has(k)) {
      v.set(k, false); // Mark as discovered (not yet visited)
      steps.push([x, y, PLANNED]); // Record planning step
      ss.set(k, u); // Store parent for path reconstruction
      q.push([x, y]); // Add to queue
    }
  }
  // Process queue until exit found
  while (q.length > 0) {
    const u = q.shift() // Process nodes in order (FIFO)
    const [x, y] = u, k = key(u);
    steps.push([x, y, WALKED]); // Mark as visited
    v.set(k, true);
    if (m[y][x] === EXIT) break; // Found the exit!
    // Explore neighbors (left, up, right, down)
    if (x - 1 >= 0) attempt(u, x - 1, y);
    if (y - 1 >= 0) attempt(u, x, y - 1);
    if (x + 1 < m[0].length) attempt(u, x + 1, y);
    if (y + 1 < m.length) attempt(u, x, y + 1);
  }
  // Reconstruct path by following parent pointers from exit to start
  let path = [], p, k;
  for (p = t, k = key(p); ss.has(k); p = ss.get(k), k = key(p)) path.push(p);
  path.push(p), path.reverse();
  return {steps, path};
}

/**
 * Depth-First Search: Explores deeply before backtracking.
 * May find a path quickly but not necessarily the shortest.
 * @param {string[][]} m - The map/grid
 * @param {number[]} s - Start position [x, y]
 * @param {number[]} t - Target/exit position [x, y]
 * @returns {{steps: Array, path: Array}} - All steps taken and the final path
 */
function dfs(m, s, t) {
  const v = new Map(), ss = new Map();
  const steps = [], W = m[0].length, H = m.length;
  // Recursive visit function: explores one path until dead end or goal
  function visit(p, x, y) {
    const k = key(x, y)
    if (m[y][x] === WALL || v.has(k)) return false; // Skip walls and visited cells
    v.set(k, true);
    if (p) ss.set(k, p); // Store parent for path reconstruction
    steps.push([x, y, PLANNED]);
    steps.push([x, y, WALKED]);
    let found = x === t[0] && y === t[1]; // Check if we reached the goal
    // Recursively explore neighbors (left, up, right, down)
    if (!found && x - 1 >= 0) found ||= visit([x, y], x - 1, y);
    if (!found && y - 1 >= 0) found ||= visit([x, y], x, y - 1);
    if (!found && x + 1 < W) found ||= visit([x, y], x + 1, y);
    if (!found && y + 1 < H) found ||= visit([x, y], x, y + 1);
    return found;
  }
  visit(null, ...s);
  // Reconstruct path from exit to start
  let path = [], p, k;
  for (p = t, k = key(p); ss.has(k); p = ss.get(k), k = key(p)) path.push(p);
  path.push(p), path.reverse();
  return {steps, path};
}

/**
 * A* Search: Uses heuristic (Manhattan distance) to guide search toward goal.
 * Explores fewer cells than BFS while still finding optimal path.
 * @param {string[][]} m - The map/grid
 * @param {number[]} s - Start position [x, y]
 * @param {number[]} t - Target/exit position [x, y]
 * @returns {{steps: Array, path: Array}} - All steps taken and the final path
 */
function astar(m, s, t) {
  const steps = [];
  const path = [];
  // Heuristic function: Manhattan distance to goal
  const h = (x, y) => Math.abs(x - t[0]) + Math.abs(y - t[1]);

  // Priority queue ordered by f = g + h (cost + heuristic)
  const heap = new Heap((a, b) => a.f < b.f || (a.f === b.f && a.h < b.h));
  const kg = new Map(); // key -> best g (cost from start)
  const closed = new Set(); // expanded keys (nodes we've fully processed)
  const ss = new Map(); // key -> prevKey (for path reconstruction)

  const [sx, sy] = s;
  const sk = key(sx, sy);
  kg.set(sk, 0); // Start has cost 0
  heap.push({ x: sx, y: sy, g: 0, h: h(sx, sy), f: h(sx, sy) });
  steps.push([sx, sy, PLANNED]);

  let goalKey = null;

  // Consider adding a neighbor to the open set
  function consider(nx, ny, ng, fromKey) {
    if (m[ny][nx] === WALL) return; // Can't traverse walls
    const nk = key(nx, ny);
    if (closed.has(nk)) return; // Already fully explored
    const best = kg.get(nk);
    // If we found a better path to this node, update it
    if (best === undefined || ng < best) {
      kg.set(nk, ng);
      ss.set(nk, fromKey); // Store parent for path reconstruction
      steps.push([nx, ny, PLANNED]);
      const hh = h(nx, ny);
      heap.push({ x: nx, y: ny, g: ng, h: hh, f: ng + hh }); // f = g + h
    }
  }
  // Main A* loop: process nodes in order of f-value
  while (heap.nonEmpty) {
    const cur = heap.pop();
    if (!cur) break;

    const { x, y, g } = cur;
    const ck = key(x, y);

    // Skip stale heap entries (we may have found a better path after adding to heap)
    if (kg.get(ck) !== g) continue;
    if (closed.has(ck)) continue;

    steps.push([x, y, WALKED]);
    closed.add(ck); // Mark as fully explored

    const isGoal = (t && x === t[0] && y === t[1]) || m[y][x] === EXIT;
    if (isGoal) { goalKey = ck; break; } // Found the goal!

    // Explore neighbors with cost g + 1
    const ng = g + 1;
    if (x - 1 >= 0) consider(x - 1, y, ng, ck);
    if (y - 1 >= 0) consider(x, y - 1, ng, ck);
    if (x + 1 < m[0].length) consider(x + 1, y, ng, ck);
    if (y + 1 < m.length) consider(x, y + 1, ng, ck);
  }
  // Reconstruct path from goal to start
  if (goalKey !== null) {
    for (let k = goalKey; k != null; k = ss.get(k)) {
      path.push(unkey(k));
      if (k === sk) break;
    }
    path.reverse();
  }
  return {steps, path};
}

// Helper function to create a map (unused in current implementation)
function createMap(rows, cols, numBlocks) {
  const blockages = Array.from({length: numBlocks}).map(_ => blockage(rows, cols));
  const test = (x, y) => blockages.some(b => inside(b, x, y));
  const map = Array.from({length: rows})
    .map((_, y) => Array.from({length: cols}).map((_, x) => test(x, y) ? WALL : AIR));
  return map;
}

// Check if a point is inside a rectangular blockage
function inside(b, x, y) {
  return b.x <= x && x < b.x + b.w && b.y <= y && y < b.y + b.h;
}

// Generate a random rectangular blockage
function blockage(rows, cols) {
  const w = sample(cols), h = sample(rows);
  return {x: _.random(0, cols - w), y: _.random(0, rows - h), w, h};
}

// Convert coordinates to a string key for Map/Set lookups
function key(x, y) {
  if (Array.isArray(x) && y === undefined && x.length >= 2) [x, y] = x;
  return `${x},${y}`;
}

// Convert a key string back to coordinates
function unkey(xy) {
  return xy.split(",").slice(0, 2).map(v => parseInt(v, 10));
}

// Format text with left and right parts, padding the middle
function spaceBetween(n, left, right) {
  left = left.toString(), right = right.toString();
  return left + " ".repeat(n - left.length - right.length) + right;
}

// Determine relative direction from point [a,b] to point [c,d]
// Returns 2-bit encoding: 00=up, 01=down, 10=left, 11=right
function rel([a, b], [c, d]) {
  if (a === c) return b < d ? /* up */ 0b00 : /* down */ 0b01;
  if (b === d) return a < c ? /* left */ 0b10 : /* right */ 0b11;
  throw new Error("unreachable");
}

// Box-drawing characters for path visualization
// Head/tail characters for path endpoints
const headChars = Array.from("╿╽╾╼"); // Array.from("╻╹╺╸");
const tailChars = Array.from("╽╿╼╾"); // Array.from("╹╻╸╺");
// Characters for path segments based on incoming/outgoing directions
// Encoded as: (incoming_direction << 2) | outgoing_direction
const stepChars = [
  /* UU */ "│", /* UD */ "╳", /* UL */ "╰", /* UR */ "╯",
  /* DU */ "╳", /* DD */ "│", /* DL */ "╭", /* DR */ "╮",
  /* LU */ "╮", /* LD */ "╯", /* LL */ "─", /* LR */ "╳",
  /* RU */ "╭", /* RD */ "╰", /* RL */ "╳", /* RR */ "─",
];

// Generate box-drawing characters for the path visualization
function drawPath(path) {
  const pathChars = new Map(), last = path.length - 1;
  // First cell: head character based on direction to next cell
  pathChars.set(key(path[0]), headChars[rel(path[0], path[1])]);
  // Middle cells: character based on incoming and outgoing directions
  for (let i = 1; i < last; i++) {
    const p = path[i - 1], c = path[i], n = path[i + 1]
    pathChars.set(key(c), stepChars[(rel(p, c) << 2) | rel(c, n)]);
  }
  // Last cell: tail character based on direction from previous cell
  pathChars.set(key(path[last]), tailChars[rel(path[last - 1], path[last])]);
  return pathChars;
}

const _ = recho.require("lodash");

// Sample from a geometric distribution (biased toward smaller values)
// Used to generate blockage sizes that tend to be smaller
function sample(n) {
  const x = 1 - Math.random() * (1 - Math.pow(2, -n));
  const k = Math.ceil(-Math.log(x) / Math.LN2);
  return k < 1 ? 1 : k > n ? n : k;
}

/**
 * Min-heap implementation for A* priority queue.
 * Maintains elements in order based on the provided comparison function.
 */
class Heap {
  constructor(lt) { this.a = []; this.lt = lt; }
  swap(i, j) { const tmp = this.a[i]; this.a[i] = this.a[j]; this.a[j] = tmp; }
  // Add element and bubble up to maintain heap property
  push(n) {
    this.a.push(n);
    for (let i = this.size - 1; i > 0;) {
      const p = (i - 1) >> 1; // Parent index
      if (this.lt(this.a[p], this.a[i])) break; // Heap property satisfied
      this.swap(p, i);
      i = p;
    }
  }
  // Remove and return minimum element, then bubble down
  pop() {
    if (this.size === 0) return null;
    if (this.size === 1) return this.a.pop();
    const top = this.a[0];
    this.a[0] = this.a.pop(); // Move last element to root
    // Bubble down to restore heap property
    for (let i = 0;;) {
      const l = i * 2 + 1, r = l + 1; // Left and right child indices
      let s = i;
      if (l < this.size && this.lt(this.a[l], this.a[s])) s = l;
      if (r < this.size && this.lt(this.a[r], this.a[s])) s = r;
      if (s === i) break; // Heap property satisfied
      this.swap(i, s);
      i = s;
    }
    return top;
  }
  get size() { return this.a.length; }
  get nonEmpty() { return this.a.length > 0; };
  get top() { return this.a.length > 0 ? this.a[0] : null; }
}
