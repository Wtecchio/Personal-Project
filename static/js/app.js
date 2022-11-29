/* initial state */
let selectedPlayer = null;
let playerType = "ALL"
let season = "reg"
let typeClubs = "1st"

/* utils */
function alphaStringComparator(a, b) {
  return a.trim() > b.trim() ? 1 : -1;
}

/* ajax calls */
async function getPlayersNames() {
  const playersNameReq = await fetch('/players/all')
  const players = await playersNameReq.json()

  const playersSelector = document.getElementById('selDataset')
  players.sort(alphaStringComparator).forEach(player => {
    var opt = document.createElement('option');
    opt.value = player;
    opt.innerHTML = player;
    playersSelector.appendChild(opt)
  })
  selectedPlayer = players[0]
  updatePlayerSection()
}

async function getOnePlayer(name) {
  const playerReq = await fetch('/players/' + name)
  const playerInfo = await playerReq.json()
  return playerInfo
}

async function getGoalsByYear(name) {
  const yearsReq = await fetch('/years')
  const years = await yearsReq.json()
  return years
}

async function getClubs() {
  const clubsReq = await fetch('/clubs' + (typeClubs === "1st" ? "/1st" : "/avg"))
  let clubs = await clubsReq.json()
  if (typeClubs !== "1st") {
    clubs = clubs.map(e => {
      return {
        ...e,
        total: e.total["$numberDecimal"]
      }
    })
  }
  return clubs
}

/* event listeners */
function optionChanged(e) {
  selectedPlayer = e
  updatePlayerSection()
}

function typeChanged(e) {
  playerType = e
  updatePlayerSection()
}

function seasonChanged(e) {
  season = e
  updatePlayerSection()
}

function teamTypeChanged(e) {
  typeClubs = e
  updateClubsSection()
}

/* UI functions */
async function updatePlayerSection() {
  const container = document.getElementById('sample-metadata')
  const playerInfos = await getOnePlayer(selectedPlayer)
  const playersInfosWithClub = playerInfos.filter(e => e.Club)
  const lastRow = playersInfosWithClub[playersInfosWithClub.length - 1]

  // player info card
  container.innerHTML = ""
  container.innerHTML += "<strong>POS: " + lastRow.POS + "</strong><br />"
  container.innerHTML += "<strong>Last Club: " + lastRow.Club + "</strong><br />"

  // minutes, goals and assists by year
  const minutesContainer = document.getElementById('minutes');
  const goalsContainer = document.getElementById('goals');
  const startedContainer = document.getElementById('started');

  const minutesByYears = playerInfos.reduce((ac, e) => {
    if (e.Season !== season) return ac;
    const y = playerType === "ALL" ? parseInt(e.MINS) : parseInt(e.MINS) / parseInt(e.GP)

    return {
      x: [...ac.x, e.Year],
      y: [...ac.y, y]
    }
  }, { x: [], y: [] })

  const goalsByYears = playerInfos.reduce((ac, e) => {
    if (e.Season !== season) return ac;
    const y = playerType === "ALL" ? parseInt(e.G) : parseInt(e.G) / parseInt(e.GP)

    return {
      x: [...ac.x, e.Year],
      y: [...ac.y, y],
      name: "Goals",
    }
  }, { x: [], y: [] })

  const assitsByYears = playerInfos.reduce((ac, e) => {
    if (e.Season !== season) return ac;
    const y = playerType === "ALL" ? parseInt(e.A) : parseInt(e.A) / parseInt(e.GP)

    return {
      x: [...ac.x, e.Year],
      y: [...ac.y, y],
      name: "Assists",
    }
  }, { x: [], y: [] })

  let totalGames = 0
  const started = playerInfos.reduce((ac, e) => {
    const gs = parseInt(e.GS)
    const gp = parseInt(e.GP)
    totalGames += gp;
    return {
      ...ac,
      values: [ac.values[0] + gs, ac.values[1] + (gp - gs)]
    }
  }, { values: [0, 0], labels: ["Starter", "From bench"], type: "pie" })

  Plotly.newPlot(minutesContainer, [minutesByYears], {
    title: playerType === "ALL" ? "Total minutes" : "Avg minutes/game"
  })

  Plotly.newPlot(goalsContainer, [goalsByYears, assitsByYears], {
    title: playerType === "ALL" ? "Total goals/assists" : "Avg goals/assists",
  })

  Plotly.newPlot(startedContainer, [started], {
    title: "Total career games: " + totalGames,
  });
}

async function updateClubsSection() {
  const clubs = await getClubs()
  const clubsContainer = document.getElementById('clubs');

  const data = clubs.reduce((ac, e) => {
    return {
      y: [...ac.y, e.total],
      x: [...ac.x, e._id],
      type: 'bar'
    }
  }, { x: [], y: [] })

  Plotly.newPlot(clubsContainer, [data], {
    title: typeClubs === "1st" ? "Nomber of 1st place per team" : "Average position per team"
  })
}

async function updateYearsSection() {
  const years = await getGoalsByYear()
  const yearsContainer = document.getElementById('years');

  const goalsByYears = years.reduce((ac, e) => {
    return {
      x: [...ac.x, e._id],
      y: [...ac.y, e.total['$numberDecimal']]
    }
  }, { x: [], y: [] })

  Plotly.newPlot(yearsContainer, [goalsByYears], {
    title: "Total goals per year"
  })
}

/* on start */
getPlayersNames()
updateClubsSection()
updateYearsSection()
