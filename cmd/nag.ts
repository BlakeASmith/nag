import db from "../db";

export function nag_() {
    // Check for past due nags and display them
    const allNags = db.nag.list()
    const now = Date.now()
    const pastDueNags = allNags.filter(nag => nag.nagDueTimestamp < now)

    if (pastDueNags.length === 0) {
        console.log("No past due nags! 🎉")
        return
    }

    console.log(`You have ${pastDueNags.length} past due nag${pastDueNags.length > 1 ? 's' : ''}:`)
    console.log("─".repeat(80))

    for (const nag of pastDueNags) {
        const dueDate = new Date(nag.nagDueTimestamp)
        const now = new Date()
        const overdueBy = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60)) // hours overdue

        let overdueText = ""
        if (overdueBy > 24) {
            const days = Math.floor(overdueBy / 24)
            overdueText = ` (${days} day${days > 1 ? 's' : ''} overdue)`
        } else if (overdueBy > 0) {
            overdueText = ` (${overdueBy} hour${overdueBy > 1 ? 's' : ''} overdue)`
        } else {
            const minutes = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60))
            overdueText = ` (${minutes} minute${minutes > 1 ? 's' : ''} overdue)`
        }

        console.log(`${nag.id}. ${nag.title}${overdueText}`)
        console.log(`   Was due: ${dueDate.toLocaleString()}`)

        if (nag.repeat) {
            if ('days' in nag.repeat) {
                console.log(`   Repeats: every ${nag.repeat.every} ${nag.repeat.unit} on days ${nag.repeat.days.join(', ')}`)
            } else {
                console.log(`   Repeats: every ${nag.repeat.every} ${nag.repeat.unit}`)
            }
        }

        if (nag.onNagWorkflow) {
            console.log(`   Workflow: ${nag.onNagWorkflow.type}`)
        }

        console.log("")
    }

    console.log("💡 Tip: Use 'bun run index.ts list' to see all your nags")
}