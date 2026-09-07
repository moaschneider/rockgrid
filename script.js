let gameData = null;
let colQuestions = [];
let rowQuestions = [];
let currentCell = null;
let answers = {};
let usedBands = new Set();
let guessesCount = 0;
const MAX_GUESSES = 12;

async function loadData() {
  try {
    const [questionsResponse, bandsResponse] = await Promise.all([
      fetch('questions.json'),
      fetch('bands.json')
    ]);
    
    const questions = await questionsResponse.json();
    const bands = await bandsResponse.json();

    gameData = {
      questions,
      bands
    };
    // console.log("gameData", gameData);
    initializeGame();
  }  
  catch (error) {
    console.error('Erro ao carregar dados:', error);
    // alert('Erro ao carregar dados do jogo.');
  }
}

function bandSatisfiesQuestion(band, question) {
  const bandValue = band[question.key];

  if (question.min !== undefined || question.max !== undefined) {
    return (
      (question.min === undefined || bandValue >= question.min) &&
      (question.max === undefined || bandValue <= question.max)
    );
  }

  if (question.quantity !== undefined) {
    return Array.isArray(bandValue) && bandValue.length === question.quantity;
  }

  if (Array.isArray(bandValue)) {
    return bandValue.includes(question.value);
  }

  return bandValue === question.value;
}

function validateIntersections(questions) {
  const ids = [];
  questions.forEach(q => ids.push(q.id));
  
  for (let i = 0; i < questions.length; i++){
    for (let j = 0; j < questions.length; j++){
      if (questions[i].id !== questions[j].id) {
        const intersection = questions[i].bands.filter(band => questions[j].bands.includes(band));
        
        if (intersection.length === 0) return false;
      }
    }
  }
  return true;
}

function getIntersectionQuestions(questions) {
  const selectedQuestions = [];

  for (let i = 0; i < questions.length; i++){
    const bandsForQuestion = gameData.bands.filter((band) => bandSatisfiesQuestion(band, questions[i])).map((band) => band.bandName);

    if (bandsForQuestion.length > 1) {
      const objQuestion = {};
      objQuestion.id = questions[i].id;
      objQuestion.textQuestion = questions[i].textQuestion;
      objQuestion.bands = bandsForQuestion;
      selectedQuestions.push(objQuestion);
  
      if (selectedQuestions.length === 6) break;
    }
  }

  // console.log("selectedQuestions", selectedQuestions);
  return selectedQuestions;
}

function selectValidQuestions() {
  let checkedQuestions = [];
  let validateQuestions;
  let shuffledQuestions;
  
  const maxAttempts = 200;
  let attempts = 0;

  while (maxAttempts > attempts) {
    // console.log(`====${attempts}====`);
    
    shuffledQuestions = [...gameData.questions].sort(() => Math.random() - 0.5);
    // console.log("shuffledQuestions", shuffledQuestions);
    
    checkedQuestions = getIntersectionQuestions(shuffledQuestions);
    // console.log("checkedQuestions", checkedQuestions);
    
    validateQuestions = validateIntersections(checkedQuestions);
    // console.log("validateQuestions", validateQuestions);
    // console.log("checkedQuestions", checkedQuestions);
    
    if (validateQuestions) break;

    attempts++;
  }
  console.log("Attempts:", attempts);
  return checkedQuestions;
}

function initializeGame() {
  if (!gameData) return;

  const questions = selectValidQuestions();
  // console.log(questions);
  
  rowQuestions = questions.slice(0, 3);
  colQuestions = questions.slice(3, 6);

  // selectValidQuestions();
  // bandSatisfiesQuestion();
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
        cell.classList.add('question-cell');
        cell.textContent = `${rowQuestions[col - 1].textQuestion}`;
      }
      
      else if (col === 0) {
        cell.classList.add('question-cell');
        // console.log(colQuestions)
        cell.textContent = `${colQuestions[row - 1].textQuestion}`;
      }
      
      else {
        cell.classList.add('answer-cell');
        const rowLabel = String.fromCharCode(64 + row);
        const colLabel = col;
        const cellId = `${rowLabel}${colLabel}`;
        cell.dataset.cellId = cellId;
        cell.onclick = () => openModal(cellId, row - 1, col - 1);

        if (answers[cellId]) {
          cell.classList.add('filled');
        }
      }

      grid.appendChild(cell);
    }
  }
}

function openModal(cellId, rowIndex, colIndex) {
  if (guessesCount >= MAX_GUESSES) {
    alert(`Você atingiu o limite de ${MAX_GUESSES} palpites.`);
    return;
  }

  currentCell = { cellId, rowIndex, colIndex };

  const modal = document.getElementById('modalOverlay');
  const stateInput = document.getElementById('stateInput');
  const messageDiv = document.getElementById('modalMessage');

  messageDiv.classList.remove('show', 'success', 'error');
  messageDiv.textContent = '';

  if (answers[cellId]) {
    stateInput.value = stateNames[answers[cellId]];
  }
  else {
    stateInput.value = '';
  }

  modal.classList.add('active');
  setTimeout(() => stateInput.focus(), 100);

  stateInput.onkeypress = (e) => {
    if (e.key === 'Enter') {
      console.log('Submeter resposta');
      // submitAnswer();
    }
  }
}


window.addEventListener('DOMContentLoaded', loadData);