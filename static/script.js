console.log('hello client');

const rows = 10;
const cols = 10;
const bombs = 3;

const x_len = cols;
const y_len = rows;

class Cell {
  constructor(row_idx, col_idx) {
    this.row_idx = row_idx;
    this.col_idx = col_idx;
    this.is_bomb = false;
    this.is_revealed = false;
    this.neighborhood_bomb_ct = -1;  // only set when it is revealed
    this.node = null;
  }
}

// board setup

const board = [];
const boardNode = document.getElementById('minefield');
for (let i = 0; i < rows; i++) {
  let row = [];
  let rowNode = document.createElement('tr');
  for (let j = 0; j < cols; j++) {
    let cell = new Cell(i, j);
    row.push(cell);

    let cellNode = document.createElement('td');
    cell.node = cellNode;
    rowNode.appendChild(cellNode);
  }
  board.push(row);
  boardNode.appendChild(rowNode);
}

// generate bombs
for (let i = 0; i < bombs; i++) {
  const rand = Math.random();
  const rand_int = Math.floor(rand * (rows * cols));
  const rand_y = Math.floor(rand_int / x_len);
  const rand_x = rand_int % x_len;

  board[rand_y][rand_x].is_bomb = true;
}


// revealing a cell

function reveal(row_idx, col_idx) {
  const i = row_idx;
  const j = col_idx;
  const cell = board[i][j]

  // count neighborhood bombs
  let bomb_ct = 0;

  for (neighbor of neighbors(i, j)) {
    if (neighbor.is_bomb) {
      bomb_ct += 1;
    }
  }

  cell.neighborhood_bomb_ct = bomb_ct;
  cell.is_revealed = true;

  if (bomb_ct === 0) {
    for (n of neighbors(i, j)) {
      if (!n.is_revealed) {
        reveal(n.row_idx, n.col_idx);
      }
    }
  }
}

function* neighbors(row_idx, col_idx) {
  for (let x = col_idx-1; x <= col_idx+1; x++) {
    for (let y = row_idx-1; y <= row_idx+1; y++) {
      if ((x >= 0 && x < cols)
          && (y >= 0 && y < rows)
          && !(x === col_idx && y === row_idx)) {
        yield board[y][x];
      }
    }
  }
}

// rendering

function render() {
  for (const row of board) {
    for (const cell of row) {
      render_cell(cell);
    }
  }
  const board_state = find_board_state();
  console.log(board_state);
  if (board_state === 'blown_up') {
    document.getElementById('text').textContent = 'DED';
  } else if (board_state === 'safe') {
    document.getElementById('text').textContent = '(: (: You found all the mines! :) :)';
  }
}

function render_cell(cell) {
  if (!cell.is_revealed) {
    cell.node.style.backgroundColor = 'gray';
  } else if (cell.is_bomb) {
    cell.node.style.backgroundColor = 'red';
    cell.node.textContent = '!';
  } else {
    cell.node.style.backgroundColor = 'lightgray';
    cell.node.textContent = cell.neighborhood_bomb_ct;
  }
}

function find_board_state() {
  for (let row of board) {
    for (let cell of row) {
      if (cell.is_bomb && cell.is_revealed) {
        return 'blown_up';
      }
    }
  }
  for (let row of board) {
    for (let cell of row) {
      if (!cell.is_bomb && !cell.is_revealed) {
        return 'ongoing';
      }
    }
  }
  return 'safe';
}


render()

// click handling

for (let row of board) {
  for (let cell of row) {
    cell.node.addEventListener("click", () => {
      reveal(cell.row_idx, cell.col_idx);
      render();
    });
  }
}
