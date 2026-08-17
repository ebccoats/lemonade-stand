const AD_COST = 15
const STARTING_CASH = 200
const MAX_DAY = 99

const state = {
    day: 1,
    weather: 2,
    forecast: "Sunny",
    notice: "",
    costPerCupCents: 2,
    player: {
        cashCents: STARTING_CASH,
        cups: 0,
        priceCents: 0,
        flyers: 0,
        bankrupt: false,
    },
}


function rollWeather() {
    let sc = Math.random()

    if (sc < 0.6) state.weather = 2
    else if (sc < 0.8) state.weather = 10
    else state.weather = 7

    if (state.day < 3) state.weather = 2
}

function checkWeather(demandMultiplier) {
    if (state.weather === 10) {
        const rainChance = 30 + Math.trunc(Math.random() * 5) * 10
        return demandMultiplier - (rainChance / 100)
    } else if (state.weather === 7) {
        return 2
    } else if (Math.random() < 0.25) {
        notices.push("Your street has been shut to the public for road work.")
        return 0.1
    }
    if (state.weather === 10 && Math.random() < 0.25) {
        state.weather = 5
        return 0
    }
    return 1
}

function returnWeatherLabel() {
    if (state.weather === 2) return "Sunny"
    if (state.weather === 7) return "Hot and dry"
    if (state.weather === 10) return "Cloudy"
    if (state.weather === 5) return "Thunderstorms!"
}

function costOfPlanCents() {
    let costCups = state.player.cups * state.costPerCupCents
    let costFlyers = state.player.flyers * AD_COST

    return (costCups + costFlyers)
}

function checkCost() {

    let notice = `On day ${state.day}, the cost of lemonade is...`
    if (state.day >= 3 && state.day <= 6) {
        state.costPerCupCents = 4
        notice = notice + "$0.04 (your mother stopped giving you free sugar)"
    } else if (state.day >= 7) {
        state.costPerCupCents = 6
        notice = notice + "$0.06 (the price of lemonade mix just went up)"
    } else {
        notice = notice + "$0.02"
    }
    notices.push(notice)

}

// this part touches the page
const elements = {
    day: document.getElementById("day"),
    forecast: document.getElementById("forecast"),
    notice: document.getElementById("notice"),
    costToMake: document.getElementById("cost-to-make"),
    cash: document.getElementById("cash"),
    cups: document.createElement("input"),
    price: document.createElement("input"),
    flyers: document.createElement("input")
}

let notices = [
    "How will you prepare for your first day?"
]

function setupInputs() {

    const startDayButton = document.getElementById("start-day")
    startDayButton.addEventListener('click', () => {
        startDay()
    })

    const inputs = [elements.cups, elements.price, elements.flyers]

    inputs.forEach(element => {
        element.type = "number"
        element.value = "0"
        element.min = "0"
        element.max = "100"
        element.style.width = "50px"
    })
    elements.price.value = "0.00"
    elements.price.step = "0.01"

    let parent = document.getElementById("cups-to-make")
    parent.appendChild(elements.cups)
    parent = document.getElementById("price")
    parent.appendChild(elements.price)
    parent = document.getElementById("flyers")
    parent.appendChild(elements.flyers)

}

function updateDisplays() {
    elements.day.innerHTML = state.day
    elements.forecast.innerHTML = state.forecast
    elements.costToMake.innerHTML = "$" + (state.costPerCupCents / 100).toFixed(2)
    elements.cash.innerHTML = "$" + (state.player.cashCents / 100).toFixed(2)
    elements.notice.innerHTML = ""

    notices.forEach(notice => {
        if (notice !== notices[0]) {
            elements.notice.innerHTML = elements.notice.innerHTML + "<br>"
        }
        elements.notice.innerHTML = elements.notice.innerHTML + notice

    })

}

function calculateSales(demandMultiplier, streetCrew) {
    if (streetCrew === 2) {
        return Number(state.player.cups)
    }

    const price = Number(state.player.priceCents)
    const cups = Number(state.player.cups)
    const flyers = Number(state.player.flyers)

    let demand

    if (price < 10) {
        demand = (10 - price) / 10 * 0.8 * 30 + 30
    } else {
        demand = (10 * 10) * 30 / (price * price)
    }

    const adFactor = 1 - Math.exp(-flyers * 0.5)
    let cupsSold = demandMultiplier * (demand + demand * adFactor)
    cupsSold = Math.min(Math.trunc(cupsSold), cups)

    return cupsSold

}


function startDay() {
    state.player.cups = elements.cups.value
    state.player.priceCents = elements.price.value * 100
    state.player.flyers = elements.flyers.value

    notices = []
    if (state.player.cashCents <= 0 || Number(state.player.cashCents) <= Number(state.costPerCupCents)) {

        notices = ["You have run out of money. Your mom hopes you learned something about economics."]
        updateDisplays()
        return

    } else if (costOfPlanCents() > state.player.cashCents) {

        notices = [`You want to spend $${(costOfPlanCents() / 100)} on lemonade and advertising but you only have $${(state.player.cashCents / 100)}`]
        updateDisplays()
        return

    } else if (state.player.cashCents >= 10000) {
        notices = ["You made enough to buy whatever you want, time to retire!"]
        updateDisplays()
        return

    } else {
        let demandMultiplier = 1
        let streetCrew = 0

        demandMultiplier = checkWeather(demandMultiplier)
        if (demandMultiplier === 0.1) {
            if (Math.random() < 0.5) {
                streetCrew = 2
                notices.push("...but the work crew bought all your lemonade!")
            }
        }

        state.forecast = returnWeatherLabel()


        let cupsSold = calculateSales(demandMultiplier, streetCrew)
        let income = cupsSold * state.player.priceCents
        let expenses = costOfPlanCents()
        let profit = income - expenses
        state.player.cashCents = state.player.cashCents + profit

        notices = [`Today's weather was ${state.forecast}`]
        notices.push(`You put up ${state.player.flyers} signs and sold ${cupsSold} cups of lemonade. You netted $${(profit / 100).toFixed(2)}`)

        state.day++
        rollWeather()
        checkCost()
        state.forecast = returnWeatherLabel()



        updateDisplays()
    }

}

setupInputs()
updateDisplays()



