function checkDateWeekdayMatch(remindDateStr, weekdaysArr) {
    const validWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    let remindDate = new Date(remindDateStr)
    let remindDayOfWeek = validWeekdays[remindDate.getDay()]
    if (!weekdaysArr.includes(remindDayOfWeek)) {
        return { error:
            `Error: The day of the date currently set for the reminder ` +
            `(${remindDayOfWeek}) is not one of the days specfied for it ` +
            `to repeat on (${weekdaysArr.join(", ")}).`
        }
    } else return true
}

module.exports = checkDateWeekdayMatch