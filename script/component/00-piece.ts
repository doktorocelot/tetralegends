const DIRECTIONS = ['up', 'right', 'down', 'left'];
/**
 * Class that creates data for a puzzle piece
 */
class PieceType {
  name: string;
  coordinates: {
    up: number[][];
    right: number[][];
    down: number[][];
    left: number[][];
  };
  spinBonusHigh: {
    up: number[][];
    right: number[][];
    down: number[][];
    left: number[][];
  };
  spinBonusLow: {
    up: number[][];
    right: number[][];
    down: number[][];
    left: number[][];
  };
  /**
   * Defines the data for the piece
   * @param {string} shortName The short name of the piece
   *                            (usually just a letter)
   * @param {string} longName The full name of the piece
   * @param {Array} coordinates X & Y coordinates of the minos
   * starting at the first facing and rotating right
   * @param {Array} spinBonusHigh X & Y coordinates of the high points to
   *                              check for spins
   * @param {Array} spinBonusLow X & Y coordinates of the low points to
   *                              check for spins
   */
  constructor(
    shortName: string,
    longName: string,
    coordinates: number[][][],
    spinBonusHigh: number[][][],
    spinBonusLow: number[][][],
  ) {
    this.name = name;
    this.coordinates = {
      up: coordinates[0],
      right: coordinates[1],
      down: coordinates[2],
      left: coordinates[3],
    };
    this.spinBonusHigh = {
      up: spinBonusHigh[0],
      right: spinBonusHigh[1],
      down: spinBonusHigh[2],
      left: spinBonusHigh[3],
    };
    this.spinBonusLow = {
      up: spinBonusLow[0],
      right: spinBonusLow[1],
      down: spinBonusLow[2],
      left: spinBonusLow[3],
    };
  }
  /**
   * Draws the piece and its spin detection points to a debug canvas
   * @param {string} direction Select the direction of the piece
   */
  drawDebug(direction: string) {
    const cellSize = 25;
    const canvas = <HTMLCanvasElement>document.getElementById('debug');
    const ctx = canvas.getContext('2d');
    const properties = ['coordinates', 'spinBonusHigh', 'spinBonusLow'];
    const colors = ['#000', '#f00', '#00f'];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < properties.length; i++) {
      for (let j = 0; j < this[properties[i]][direction].length; j++) {
        const x =
          this[properties[i]][direction][j][0] * cellSize + cellSize * 2;
        const y =
          this[properties[i]][direction][j][1] * cellSize + cellSize * 2;
        ctx.fillStyle = colors[i];
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }
}
const PIECES = {
  I: new PieceType(
    'I',
    'I Tetromino',
    [
      [[0, 1], [1, 1], [2, 1], [3, 1]],
      [[2, 0], [2, 1], [2, 2], [2, 3]],
      [[3, 2], [2, 2], [1, 2], [0, 2]],
      [[1, 3], [1, 2], [1, 1], [1, 0]],
    ],
    [
      [[1, 0], [2, 2], [2, 0], [1, 2]],
      [[1, 1], [3, 2], [1, 2], [3, 1]],
      [[1, 1], [2, 3], [2, 1], [1, 3]],
      [[0, 1], [2, 2], [0, 2], [2, 1]],
    ],
    [
      [[-1, 1], [4, 1], [-1, 1], [4, 1]],
      [[2, -1], [2, 4], [2, -1], [2, 4]],
      [[-1, 2], [4, 2], [-1, 2], [4, 2]],
      [[1, -1], [1, 4], [1, -1], [1, 4]],
    ],
  ),
  L: new PieceType(
    'L',
    'L Tetromino',
    [
      [[2, 0], [2, 1], [1, 1], [0, 1]],
      [[2, 2], [1, 2], [1, 1], [1, 0]],
      [[0, 2], [0, 1], [1, 1], [2, 1]],
      [[0, 0], [1, 0], [1, 1], [1, 2]],
    ],
    [[[1, 0], [0, 0]], [[2, 1], [2, 0]], [[1, 2], [2, 2]], [[0, 1], [0, 2]]],
    [[[2, 2], [0, 2]], [[0, 2], [0, 0]], [[0, 0], [2, 0]], [[2, 0], [2, 2]]],
  ),
  O: new PieceType(
    'O',
    'O Tetromino',
    [
      [[0, 0], [1, 0], [1, 1], [0, 1]],
      [[1, 0], [1, 1], [0, 1], [0, 0]],
      [[1, 1], [0, 1], [0, 0], [1, 0]],
      [[0, 1], [0, 0], [1, 0], [1, 1]],
    ],
    [[[]], [[]], [[]], [[]]],
    [[[]], [[]], [[]], [[]]],
  ),
  Z: new PieceType(
    'Z',
    'Z Tetromino',
    [
      [[0, 0], [1, 0], [1, 1], [2, 1]],
      [[2, 0], [2, 1], [1, 1], [1, 2]],
      [[2, 2], [1, 2], [1, 1], [0, 1]],
      [[0, 2], [0, 1], [1, 1], [1, 0]],
    ],
    [[[2, 0], [0, 1]], [[2, 2], [1, 0]], [[0, 2], [2, 1]], [[0, 0], [1, 2]]],
    [
      [[-1, 0], [3, 1]],
      [[2, -1], [1, 3]],
      [[3, 2], [-1, 1]],
      [[0, 3], [1, -1]],
    ],
  ),
  T: new PieceType(
    'T',
    'T Tetromino',
    [
      [[1, 0], [0, 1], [1, 1], [2, 1]],
      [[2, 1], [1, 0], [1, 1], [1, 2]],
      [[1, 2], [2, 1], [1, 1], [0, 1]],
      [[0, 1], [1, 2], [1, 1], [1, 0]],
    ],
    [[[0, 0], [2, 0]], [[2, 0], [2, 2]], [[0, 2], [2, 2]], [[0, 0], [0, 2]]],
    [[[0, 2], [2, 2]], [[0, 0], [0, 2]], [[0, 0], [2, 0]], [[2, 0], [2, 2]]],
  ),
  J: new PieceType(
    'J',
    'J Tetromino',
    [
      [[0, 0], [0, 1], [1, 1], [2, 1]],
      [[2, 0], [1, 0], [1, 1], [1, 2]],
      [[2, 2], [2, 1], [1, 1], [0, 1]],
      [[0, 2], [1, 2], [1, 1], [1, 0]],
    ],
    [[[1, 0], [2, 0]], [[2, 1], [2, 2]], [[1, 2], [0, 2]], [[0, 1], [0, 0]]],
    [[[0, 2], [2, 2]], [[0, 0], [0, 2]], [[2, 0], [0, 0]], [[2, 2], [2, 0]]],
  ),
  S: new PieceType(
    'S',
    'S Tetromino',
    [
      [[2, 0], [1, 0], [1, 1], [0, 1]],
      [[2, 2], [2, 1], [1, 1], [1, 0]],
      [[0, 2], [1, 2], [1, 1], [2, 1]],
      [[0, 0], [0, 1], [1, 1], [1, 2]],
    ],
    [[[0, 0], [2, 1]], [[1, 2], [2, 0]], [[2, 2], [0, 1]], [[1, 0], [0, 2]]],
    [
      [[3, 0], [-1, 1]],
      [[1, -1], [2, 3]],
      [[-1, 2], [3, 1]],
      [[1, 3], [0, -1]],
    ],
  ),
};
const PIECE_SETS = {
  TETROMINO: ['I', 'L', 'O', 'Z', 'T', 'J', 'S'],
  STARTING_TETRO: ['I', 'L', 'T', 'J'],
};
