console.log('hello app client');

let id;
let board;
let state;

let nodesMap;


// setup forms:

const rows_in = document.getElementById('rows_in');
const cols_in = document.getElementById('cols_in');
const bombs_in = document.getElementById('bombs_in');
const create_btn = document.getElementById('create_btn');

const load_in = document.getElementById('load_in');
const load_btn = document.getElementById('load_btn');

create_btn.addEventListener('click', async () => {
  const rows = rows_in.value;
  const cols = cols_in.value;
  const bombs = bombs_in.value;

  console.log(`minesweeper/create?rows=${rows}&cols=${cols}&bombs=${bombs}`);
  const fetch_res = await fetch(`minesweeper/create?rows=${rows}&cols=${cols}&bombs=${bombs}`);
  const res = await fetch_res.json();
  console.log(res);
  
  update_globals(res);

  setup();
});

load_btn.addEventListener('click', async () => {
  const id = load_in.value;

  console.log(`minesweeper/board?id=${id}`);
  const fetch_res = await fetch(`minesweeper/board?id=${id}`);
  const res = await fetch_res.json();
  console.log(res);

  update_globals(res);

  setup();
});

function update_globals(res) {
  id = res.id;
  board = res.board;
  state = res.state;

  load_in.value = id;
}


// setup board:

function setup() {
  if (!board) {
    console.log(`bad board: ${board}`);
    return;
  }

  rows = board.length;
  cols = board[0].length;

  const boardNode = document.getElementById('minefield');

  // reset
  while (boardNode.firstChild) {
    boardNode.removeChild(boardNode.firstChild);
  }
  nodesMap = [];

  // create
  for (let i = 0; i < rows; i++) {
    let rowNode = document.createElement('tr');
    let rowNodesMap = []
    for (let j = 0; j < cols; j++) {
      let cellNode = document.createElement('td');
      cellNode.addEventListener("click", async () => {
        console.log(`clicked ${i} ${j}`);
        await reveal(i, j);
        console.log(`revealed`);
        render();
      });

      rowNode.appendChild(cellNode);
      rowNodesMap.push(cellNode);
    }
    boardNode.appendChild(rowNode);
    nodesMap.push(rowNodesMap);
  }

  render();
}

async function reveal(row, col) {
  const fetch_res = await fetch(`/minesweeper/reveal?id=${id}&row=${row}&col=${col}`);
  const res = await fetch_res.json();
  update_globals(res);
}

// rendering

function render() {
  let row_i = 0;
  for (let row of board) {
    let col_i = 0;
    for (let cell of row) {
      let node = nodesMap[row_i][col_i];
      if (cell === 'x') {
        // unknown, not revealed
        node.style.backgroundColor = 'gray';
        node.textContent = '';
      } else if (Number.isInteger(cell)) {
        // revealed, a cell with some number of bombs around it
        node.style.backgroundColor = 'lightgray';
        node.textContent = cell;
      } else if (cell === '!') {
        // revealed, a cell with a bomb (the game should be over)
        node.style.backgroundColor = 'red';
        node.textContent = '!';
      } else {
        console.log(`Unrecognized cell value ${cell}`);
      }

      col_i += 1;
    }
    row_i += 1;
  }
  
  if (state === 'blown_up') {
    document.getElementById('text').textContent = 'DED';
  } else if (state === 'safe') {
    document.getElementById('text').textContent = '(: (: You found all the mines! :) :)';
  } else {
    document.getElementById('text').textContent = 'A minefield!';
  }
}
