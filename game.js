
const gamestate = {
    day: 0,
    players: [],
    advertisingCost: .15,
    startingMoney: 2.00,
    weather: 0,
    forecast: 0,
    
}

function makePlayer() {
    const player = {
        money: 0.00,
        cupsToMake: 0,
        costToMakeCup: .02,
        price: 0.00,
        isBankrupt: false,
        advertising: 0 
    }

    return player
}


function runGame() {
    const promptDisplay = document.getElementById("prompt")
    const inputHolder = document.getElementById("input-holder")
    const endDayButton = document.getElementById("end-day")

}



