// I asked Cursor to look at my final game.js file and do a version in as few lines as possible.

const SIGN_COST_CENTS = 15
const STARTING_CASH_CENTS = 200
const WEATHER_NAME = {
    2: "Sunny",
    7: "Hot and dry",
    10: "Cloudy",
    5: "Thunderstorms!",
}

const state = {
    day: 1,
    weather: 2,
    costPerCupCents: 2,
    cashCents: STARTING_CASH_CENTS,
    cups: 0,
    priceCents: 0,
    signs: 0,
}

let notices = ["How will you prepare for your first day?"]

function dollars(cents) {
    return "$" + (cents / 100).toFixed(2)
}

function planCostCents() {
    return state.cups * state.costPerCupCents + state.signs * SIGN_COST_CENTS
}

function rollWeather() {
    const roll = Math.random()
    if (roll < 0.6) state.weather = 2
    else if (roll < 0.8) state.weather = 10
    else state.weather = 7
    if (state.day < 3) state.weather = 2
}

function weatherEffects() {
    if (state.weather === 10) {
        if (Math.random() < 0.25) {
            state.weather = 5
            return { demandMultiplier: 0, streetCrewBuysAll: false }
        }
        const rainPercent = 30 + Math.trunc(Math.random() * 5) * 10
        return { demandMultiplier: 1 - rainPercent / 100, streetCrewBuysAll: false }
    }
    if (state.weather === 7) {
        return { demandMultiplier: 2, streetCrewBuysAll: false }
    }
    if (Math.random() < 0.25) {
        notices.push("Your street has been shut to the public for road work.")
        if (Math.random() < 0.5) {
            notices.push("...but the work crew bought all your lemonade!")
            return { demandMultiplier: 0.1, streetCrewBuysAll: true }
        }
        return { demandMultiplier: 0.1, streetCrewBuysAll: false }
    }
    return { demandMultiplier: 1, streetCrewBuysAll: false }
}

function calculateSales(demandMultiplier, streetCrewBuysAll) {
    if (streetCrewBuysAll) return state.cups
    const price = state.priceCents
    const demand = price < 10
        ? (10 - price) / 10 * 0.8 * 30 + 30
        : 100 * 30 / (price * price)
    const advertising = 1 - Math.exp(-state.signs * 0.5)
    const cupsSold = demandMultiplier * demand * (1 + advertising)
    return Math.min(Math.trunc(cupsSold), state.cups)
}

function updateLemonadeCost() {
    let message = `On day ${state.day}, the cost of lemonade is `
    if (state.day >= 7) {
        state.costPerCupCents = 6
        message += "$0.06 (the price of lemonade mix just went up)"
    } else if (state.day >= 3) {
        state.costPerCupCents = 4
        message += "$0.04 (your mother stopped giving you free sugar)"
    } else {
        message += "$0.02"
    }
    notices.push(message)
}

function $(id) {
    return document.getElementById(id)
}

const page = {
    day: $("day"),
    forecast: $("forecast"),
    notice: $("notice"),
    costToMake: $("cost-to-make"),
    cash: $("cash"),
}

function makeInput(parentId, step) {
    const input = document.createElement("input")
    input.type = "number"
    input.min = "0"
    input.max = "100"
    input.step = step
    input.value = step === "0.01" ? "0.00" : "0"
    input.style.width = "50px"
    $(parentId).appendChild(input)
    return input
}

const cupsInput = makeInput("cups-to-make", "1")
const priceInput = makeInput("price", "0.01")
const signsInput = makeInput("flyers", "1")

function render() {
    page.day.textContent = state.day
    page.forecast.textContent = WEATHER_NAME[state.weather]
    page.costToMake.textContent = dollars(state.costPerCupCents)
    page.cash.textContent = dollars(state.cashCents)
    page.notice.innerHTML = notices.join("<br>")
}

function startDay() {
    state.cups = Number(cupsInput.value)
    state.priceCents = Number(priceInput.value) * 100
    state.signs = Number(signsInput.value)

    if (state.cashCents <= state.costPerCupCents) {
        notices = ["You have run out of money. Your mom hopes you learned something about economics."]
        return render()
    }
    if (planCostCents() > state.cashCents) {
        notices = [`You want to spend ${dollars(planCostCents())} on lemonade and advertising but you only have ${dollars(state.cashCents)}`]
        return render()
    }
    if (state.cashCents >= 10000) {
        notices = ["You made enough to buy whatever you want, time to retire!"]
        return render()
    }

    notices = []
    const effects = weatherEffects()
    const sold = calculateSales(effects.demandMultiplier, effects.streetCrewBuysAll)
    const profit = sold * state.priceCents - planCostCents()
    state.cashCents += profit

    notices.unshift(`Today's weather was ${WEATHER_NAME[state.weather]}`)
    notices.push(`You put up ${state.signs} signs and sold ${sold} cups of lemonade. You netted ${dollars(profit)}`)

    state.day++
    rollWeather()
    updateLemonadeCost()
    render()
}

$("start-day").addEventListener("click", startDay)
render()
