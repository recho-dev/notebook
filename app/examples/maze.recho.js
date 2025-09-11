/**
 * @title Maze
 * @author Luyu Cheng
 * @created 2025-09-11
 * @pull_request 86
 * @github chengluyu
 */

/**
 * ============================================================================
 * =                               Maze                                       =
 * ============================================================================
 *
 * A maze generator and pathfinder visualization using ASCII box-drawing
 * characters. This example demonstrates complex grid-based rendering and
 * animation techniques in Recho.
 *
 * The implementation uses a recursive backtracking algorithm to generate
 * random mazes, then employs breadth-first search to find the shortest path
 * from entrance to exit. The visualization shows:
 *
 * - Maze walls rendered with Unicode box-drawing characters
 * - Animated pathfinding with a filled circle (●) moving along the solution
 * - Automatic maze regeneration when the path animation completes
 *
 * The rendering system manually constructs a character grid using proper
 * junction detection to ensure walls connect seamlessly. Each maze cell
 * tracks which walls are present, allowing for precise wall removal during
 * generation.
 *
 * Adjust the `width` and `height` parameters to create different maze sizes!
 */

//➜ ──┬───────┬─────┬───────────────────┐
//➜   │       │     │                   │
//➜ │ │ ──┬─┐ │ ┌── ├─────┐ ┌────── ┌── │
//➜ │ │   │ │   │   │     │ │       │   │
//➜ │ │ │ │ └───┤ ┌─┤ ──┐ └─┘ ┌─────┤ ──┤
//➜ │ │ │ │     │ │ │   │     │     │   │
//➜ │ └─┘ │ │ ┌─┘ │ │ │ ├───┬─┘ ┌───┴── │
//➜ │     │ │ │   │   │ │   │   │       │
//➜ ├─────┤ │ │ ┌─┘ ┌─┤ │ │ │ │ │ ──┬───┤
//➜ │     │ │ │ │   │ │  ●│ │ │ │   │   │
//➜ │ ┌───┘ │ │ │ ──┘ ├───┘ │ │ └─┐ ├── │
//➜ │ │     │   │     │     │ │   │ │   │
//➜ │ │ ──┬─┴───┴───┐ │ ────┴─┤ ──┤ │ ──┤
//➜ │ │   │         │ │       │   │ │   │
//➜ │ └─┐ └─┐ ──┬─┐ └─┼────── │ │ │ └── │
//➜ │   │   │   │ │   │       │ │ │     │
//➜ │ ──┴─┐ ├── │ └─┐ │ ┌───┬─┴─┘ └─┬── │
//➜ │     │ │   │   │   │   │       │   │
//➜ │ ──┐ │ │ ┌─┘ ──┴───┘ ──┘ │ ────┘ ──┘
//➜ │   │     │               │
//➜ └───┴─────┴───────────────┴──────────
{
  frame;

  if (!maze.walk()) maze.regenerate();
  echo(maze.render());
}

const width = 18;
const height = 10;

const maze = new Maze(width, height);

const frame = recho.interval(100);

const cell = () => ({top: true, right: true, bottom: true, left: true});

class Maze {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.initialize();
    this.generate();
  }

  initialize() {
    this.grid = _.times(this.height, () => _.times(this.width, cell));
    this.visited = _.times(this.height, () => _.times(this.width, _.constant(false)));
    this.path = null;
    this.step = 0;
  }

  regenerate() {
    this.initialize();
    this.generate();
  }

  generate() {
    this.carvePassage(0, 0);
    this.grid[0][0].left = false;
    this.grid[this.height - 1][this.width - 1].right = false;
  }

  walk() {
    if (this.path === null) {
      this.path = this.findPath();
      this.step = 0;
      return true;
    } else if (this.step + 1 < this.path.length) {
      this.step += 1;
      return true;
    } else {
      return false;
    }
  }

  carvePassage(x, y) {
    this.visited[y][x] = true;
    for (const neighbor of _.shuffle(this.getUnvisitedNeighbors(x, y))) {
      if (!this.visited[neighbor.y][neighbor.x]) {
        // Remove walls between current cell and neighbor
        this.removeWall(x, y, neighbor.x, neighbor.y);
        // Recursively visit neighbor
        this.carvePassage(neighbor.x, neighbor.y);
      }
    }
  }

  getUnvisitedNeighbors(x, y) {
    const neighbors = [];
    if (y > 0 && !this.visited[y - 1][x]) neighbors.push({x: x, y: y - 1}); // up
    if (x < this.width - 1 && !this.visited[y][x + 1]) neighbors.push({x: x + 1, y: y}); // right
    if (y < this.height - 1 && !this.visited[y + 1][x]) neighbors.push({x: x, y: y + 1}); // down
    if (x > 0 && !this.visited[y][x - 1]) neighbors.push({x: x - 1, y: y}); // left
    return neighbors;
  }

  removeWall(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx === 1) {
      // Moving right
      this.grid[y1][x1].right = false;
      this.grid[y2][x2].left = false;
    } else if (dx === -1) {
      // Moving left
      this.grid[y1][x1].left = false;
      this.grid[y2][x2].right = false;
    } else if (dy === 1) {
      // Moving down
      this.grid[y1][x1].bottom = false;
      this.grid[y2][x2].top = false;
    } else if (dy === -1) {
      // Moving up
      this.grid[y1][x1].top = false;
      this.grid[y2][x2].bottom = false;
    }
  }

  findPath() {
    const queue = [[0, 0, [{x: 0, y: 0}]]];
    const visited = new Set([`${0},${0}`]);
    while (queue.length > 0) {
      const [x, y, path] = queue.shift();
      if (x === this.width - 1 && y === this.height - 1) return path;
      for (const {dx, dy, direction} of directions) {
        const nx = x + dx;
        const ny = y + dy;
        const key = `${nx},${ny}`;
        if (
          nx >= 0 &&
          nx < this.width &&
          ny >= 0 &&
          ny < this.height &&
          !visited.has(key) &&
          !this.grid[y][x][direction]
        ) {
          visited.add(key);
          queue.push([nx, ny, [...path, {x: nx, y: ny}]]);
        }
      }
    }
    return null;
  }

  render() {
    const pathSet = new Set();
    if (this.path !== null && this.step < this.path.length) {
      pathSet.add(`${this.path[this.step].x},${this.path[this.step].y}`);
    }

    // Create output grid (2x dimensions + 1 for walls)
    const outputHeight = this.height * 2 + 1;
    const outputWidth = this.width * 2 + 1;
    const output = _.times(outputHeight, () => _.times(outputWidth, _.constant(chars.space)));

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        const ox = x * 2;
        const oy = y * 2;
        if (cell.top) output[oy][ox + 1] = chars.horizontal;
        if (cell.bottom) output[oy + 2][ox + 1] = chars.horizontal;
        if (cell.left) output[oy + 1][ox] = chars.vertical;
        if (cell.right) output[oy + 1][ox + 2] = chars.vertical;
        if (pathSet.has(`${x},${y}`)) output[oy + 1][ox + 1] = chars.ghost;
      }
    }

    // Draw corners and junctions
    for (let y = 0; y < outputHeight; y += 2) {
      for (let x = 0; x < outputWidth; x += 2) {
        const top = y > 0 && output[y - 1][x] === chars.vertical;
        const bottom = y < outputHeight - 1 && output[y + 1][x] === chars.vertical;
        const left = x > 0 && output[y][x - 1] === chars.horizontal;
        const right = x < outputWidth - 1 && output[y][x + 1] === chars.horizontal;
        const connections = (top ? 1 : 0) + (right ? 1 : 0) + (bottom ? 1 : 0) + (left ? 1 : 0);
        if (connections === 0) {
          output[y][x] = chars.space;
        } else if (connections === 1) {
          if (top || bottom) output[y][x] = chars.vertical;
          else output[y][x] = chars.horizontal;
        } else if (connections === 2) {
          if (top && bottom) output[y][x] = chars.vertical;
          else if (left && right) output[y][x] = chars.horizontal;
          else if (top && right) output[y][x] = chars.bottomLeft;
          else if (top && left) output[y][x] = chars.bottomRight;
          else if (bottom && right) output[y][x] = chars.topLeft;
          else if (bottom && left) output[y][x] = chars.topRight;
        } else if (connections === 3) {
          if (!top) output[y][x] = chars.teeDown;
          else if (!right) output[y][x] = chars.teeLeft;
          else if (!bottom) output[y][x] = chars.teeUp;
          else if (!left) output[y][x] = chars.teeRight;
        } else {
          output[y][x] = chars.cross;
        }
      }
    }
    output[1][0] = chars.startMarker;
    output[outputHeight - 2][outputWidth - 1] = chars.endMarker;
    return output.map((row) => row.join("")).join("\n");
  }
}

const directions = [
  {dx: 0, dy: -1, direction: "top"},
  {dx: 1, dy: 0, direction: "right"},
  {dx: 0, dy: 1, direction: "bottom"},
  {dx: -1, dy: 0, direction: "left"},
];

const chars = {
  horizontal: "─",
  vertical: "│",
  topLeft: "┌",
  topRight: "┐",
  bottomLeft: "└",
  bottomRight: "┘",
  teeUp: "┴",
  teeDown: "┬",
  teeLeft: "┤",
  teeRight: "├",
  cross: "┼",
  space: " ",
  ghost: "●",
  startMarker: " ",
  endMarker: " ",
};

const _ = recho.require("lodash");
