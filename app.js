const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(express.static('static'));


// minesweeper 

class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.is_bomb = false;
    this.is_revealed = false;
    this.neighborhood_bomb_ct = -1;  // only set when it is revealed
  }

  render() {
    if (this.is_revealed && this.is_bomb) {
      return '!';
    } else if (this.is_revealed) {
      return this.neighborhood_bomb_ct;
    } else {
      return 'x';
    }
  }
}

class Board {
  constructor(id, rows, cols, bombs) {
    this.id = id;
    this.rows = rows;
    this.cols = cols;
    this.bombs = bombs;

    // board setup
    this.board = [];
    for (let i = 0; i < rows; i++) {
      let row = [];
      for (let j = 0; j < cols; j++) {
        let cell = new Cell(i, j);
        row.push(cell);
      }
      this.board.push(row);
    }

    // generate bombs
    for (let i = 0; i < bombs; i++) {
      const rand = Math.random();
      const rand_int = Math.floor(rand * (rows * cols));
      const rand_y = Math.floor(rand_int / cols);
      const rand_x = rand_int % cols;

      this.board[rand_y][rand_x].is_bomb = true;
    }
  }

  // revealing a cell
  reveal(row, col) {
    const cell = this.board[row][col]

    // count neighborhood bombs
    let bomb_ct = 0;

    for (let n of this.neighbors(row, col)) {
      if (n.is_bomb) {
        bomb_ct += 1;
      }
    }

    cell.neighborhood_bomb_ct = bomb_ct;
    cell.is_revealed = true;

    if (bomb_ct === 0) {
      for (let n of this.neighbors(row, col)) {
        if (!n.is_revealed) {
          this.reveal(n.row, n.col);
        }
      }
    }
  }

  *neighbors(row, col) {
    for (let y = row-1; y <= row+1; y++) {
      for (let x = col-1; x <= col+1; x++) {
        if ((x >= 0 && x < this.cols)
            && (y >= 0 && y < this.rows)
            && !(x === col && y === row)) {
          yield this.board[y][x];
        }
      }
    }
  }

  find_state() {
    for (let row of this.board) {
      for (let cell of row) {
        if (cell.is_bomb && cell.is_revealed) {
          return 'blown_up';
        }
      }
    }
    for (let row of this.board) {
      for (let cell of row) {
        if (!cell.is_bomb && !cell.is_revealed) {
          return 'ongoing';
        }
      }
    }
    return 'safe';
  }

  render() {
    // return less data, don't reveal where the bombs are!
    let ret = [];
    for (let row of this.board) {
      let ret_row = [];
      for (let cell of row) {
        ret_row.push(cell.render());
      }
      ret.push(ret_row);
    }
    return ret;
  }
}


let open_boards = []

// api

app.get('/minesweeper/board', (req, res) => {
  const id = parseInt(req.query.id);
  const board = open_boards.find(b => b.id === id);
  if (board) {
    res.json({id: id, board: board.render(), state: board.find_state()});
  } else {
    res.json({});
  }
});

// this *should* be 'post' but I'm not sure how to properly encode/decode params
app.get('/minesweeper/reveal', (req, res) => {
  const id = parseInt(req.query.id);
  const row = parseInt(req.query.row);
  const col = parseInt(req.query.col);
  const board = open_boards.find(b => b.id === id);
  if (board) {
    board.reveal(row, col);
    res.json({id: id, board: board.render(), state: board.find_state()});
  } else {
    res.json({});
  }
});

app.get('/minesweeper/create', (req, res) => {
  const rows = parseInt(req.query.rows);
  const cols = parseInt(req.query.cols);
  const bombs = parseInt(req.query.bombs);

  const id = Math.floor(Math.random() * 10000);
  const board = new Board(id, rows, cols, bombs);
  open_boards.push(board);
  if (open_boards.length > 10) {
    open_boards.shift();
  }
  console.log(open_boards.map(b => b.id));

  res.json({id: id, board: board.render(), state: board.find_state()});
});


const port = 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

