let gameData = null;
let colCharacteristics = [];
let rowCharacteristics = [];




async function loadData() {
  try {
    const [charsResponse, bandsResponse] = await Promise.all([
      fetch('caracteristicas.json'),
      fetch('bands.json')
    ]);
    
    const characteristics = await charsResponse.json();
    const bands = await bandsResponse.json();

    gameData = {
      characteristics,
      bands
    };
    console.log("gameData", gameData);
    initializeGame();
  }  
  catch (error) {
    console.error('Erro ao carregar dados:', error);
    alert('Erro ao carregar dados do jogo.');
  }
}

function validateIntersections(rowChars, colChars) {
  console.log(rowChars, colChars);
}

function selectValidCharacteristics() {
  const shuffled = [...gameData.characteristics].sort(() => Math.random() - 0.5);
  // console.log("shuffled", shuffled);
  const rowChar = shuffled.slice(0, 3);
  const colChar = shuffled.slice(3, 6);
  console.log("rowChar", rowChar);
  console.log("colChar", colChar);
  for (const char of rowChar) {
    // console.log(char.texto);
    rowCharacteristics.push(char.texto);
  }
  for (const char of colChar) {
    // console.log(char.texto);
    colCharacteristics.push(char.texto);
  }
  // console.log("colCharacteristics", colCharacteristics);
  // console.log("rowCharacteristics", rowCharacteristics);
}

function initializeGame() {
  if (!gameData) return;

  selectValidCharacteristics();
  createGrid();
}

function createGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  for (let row = 0; row < 4; row++){
    for (let col = 0; col < 4; col++){
      const cell = document.createElement('div');
      cell.className = 'grid-cell';

      if (row === 0 && col === 0) {
        cell.classList.add('header-cell');
      }

      else if (row === 0) {
        cell.classList.add('characteristic-cell');
        cell.textContent = `${rowCharacteristics[col - 1]}`;
      }
      
      else if (col === 0) {
        cell.classList.add('characteristic-cell');
        // console.log(colCharacteristics)
        cell.textContent = `${colCharacteristics[row - 1]}`;
      }
      
      else {
        cell.classList.add('answer-cell');
        // cell.textContent = `${row}${col}`;
      }

      grid.appendChild(cell);

    }
  }
}


window.addEventListener('DOMContentLoaded', loadData);