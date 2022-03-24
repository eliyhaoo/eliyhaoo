'use strict'
const EMPTY = ' '
const MINE = '💣'
const FLAG = '🚩'
const WRONG = '❌'
const LIVE = '❤️'

var gTimeInterval

var gBoard

var gLevels = [{
    level: 1,
    size: 4,
    mines: 2
},
{
    level: 2,
    size: 8,
    mines: 12
},
{
    level: 3,
    size: 12,
    mines: 30
}
]

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    minesLocation: [],
    selectedLevel: null,
    lives: 3,
}


function init(levelSelect = 0) {
    resetGame()
    var selectedValueIdx = (levelSelect) ? levelSelect.value : levelSelect
    gGame.selectedLevel = gLevels[selectedValueIdx]
    gBoard = createMat(gGame.selectedLevel.size, gGame.selectedLevel.size)
    updateLives()
    printMat(gBoard, '.table')
}

function resetLevel() {
    var lastLevel = gGame.selectedLevel
    resetGame()
    gGame.selectedLevel = lastLevel
    gBoard = createMat(gGame.selectedLevel.size, gGame.selectedLevel.size)
    updateLives()
    printMat(gBoard, '.table')
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var negsCount = countNeighbors(i, j, gBoard)
            gBoard[i][j].minesAroundCount = negsCount
        }
    }
}

function placeMinesRandom(count) {
    for (var i = 0; i < count; i++) {
        var location = getEmptyCell(gBoard)
        gGame.minesLocation.push(location)
        gBoard[location.i][location.j].isMine = true
    }
}

function cellClicked(elCell, i, j, minesAmount) {

    if (!gGame.isOn) return
    var cell = gBoard[i][j]
    if (cell.isShown) return
    if (cell.isMarked) return
    if (cell.isMine) {
        gGame.lives--
        updateLives()
        if (!gGame.lives) {
            gameOver({ i, j })
            return

        }
    }
    elCell.classList.remove('hide')
    cell.isShown = true
    gGame.shownCount++
    if (cell.minesAroundCount === 0) openEmptyCellsAroundInModel(gBoard, { i, j })
    printMat(gBoard, '.table')

    if (gGame.secsPassed === 0) {
        placeMinesRandom(gGame.selectedLevel.mines)
        setMinesNegsCount()
        printMat(gBoard, '.table')
        startTimer()
    }

    if (gGame.markedCount === gGame.selectedLevel.mines) checkVictory()
}

function cellFlaged(ev, elCell, i, j) {
    ev.preventDefault()
    if (!gGame.isOn) return
    var cell = gBoard[i][j]
    if (cell.isShown) return
    cell.isMarked = !cell.isMarked
    if (cell.isMarked) {
        elCell.innerText = FLAG
        gGame.markedCount++
    } else {
        elCell.innerText = EMPTY
        gGame.markedCount--
    }
    if (gGame.markedCount === gGame.selectedLevel.mines) checkVictory()
}

function openEmptyCellsAroundInModel(mat, location) {
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (i === location.i && j === location.j) continue;
            if (j < 0 || j >= mat[i].length) continue;
            if (!mat[i][j].minesAroundCount && !mat[i][j].isMarked) {
                if (!mat[i][j].isShown) gGame.shownCount++
                mat[i][j].isShown = true
            }
        }
    }

}


function startTimer() {
    var timeStart = new Date()
    updateClock(timeStart)
    gTimeInterval = setInterval(updateClock, 1000, timeStart)
}

function updateClock(timeStart) {
    var elTimer = document.querySelector('.timer span')
    var timeNow = new Date()
    var timePass = new Date(timeNow - timeStart)
    var sec = timePass.getSeconds()
    var min = timePass.getMinutes()
    var time = min + ':' + sec
    elTimer.innerHTML = time
    gGame.secsPassed = time
}

function gameOver(pos) {
    var elIcon = document.querySelector('.icon button')
    elIcon.innerText = '🤯'
    console.log('game over');
    gGame.isOn = false
    revealMines()
    printMat(gBoard, '.table', elCell)
    var elCell = document.querySelector(getSelector(pos))
    elCell.classList.add('hit')
}

function checkVictory() {
    console.log('checking Victory');

    console.log('gGame.selectedLevel.size', gGame.selectedLevel.size);
    console.log('gGame.selectedLevel', gGame.selectedLevel.mines);
    console.log('gGame.shownCount', gGame.shownCount);
    if (gGame.shownCount === gGame.selectedLevel.size ** 2 - gGame.selectedLevel.mines) {
        var elIcon = document.querySelector('.icon button')
        elIcon.innerText = '😎'
    }
}

function revealMines() {
    for (var i = 0; i < gGame.minesLocation.length; i++) {
        var iIdx = gGame.minesLocation[i].i
        var jIdx = gGame.minesLocation[i].j
        gBoard[iIdx][jIdx].isShown = true

    }

    // printMat(gBoard,'.table',elCell)

}

function resetGame() {
    clearInterval(gTimeInterval)
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        minesLocation: [],
        selectedLevel: null,
        lives: 3,
    }
}

function updateLives() {
    var elLives = document.querySelector('.lives span')
    var currentLives = gGame.lives
    // console.log('currentLives',currentLives);
    var strLives = ''
    switch (currentLives) {
        case 1: strLives = LIVE
            break
        case 2: strLives = LIVE + LIVE
            break
        case 3: strLives = LIVE + LIVE + LIVE
            break
    }
    elLives.innerHTML = strLives
    if (gGame.secsPassed) gGame.selectedLevel.mines--
    console.log('mines count', gGame.selectedLevel.mines);
}

function showNeighbors(elBtn) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue
            var cell = gboard[i][j]
        }
    }
}