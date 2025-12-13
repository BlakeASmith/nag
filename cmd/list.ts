import db from "../db";

export function list_() {
    // list all nags
    const nags = db.nag.list()
    if (nags.length === 0) {
        console.log("No nags found.")
        return
    }

    console.log("Nag Records:")
    console.log("─".repeat(80))
    for (const nag of nags) {
        const dueDate = new Date(nag.nagDueTimestamp).toLocaleString()
        let repeatInfo = ""
        if (nag.repeat) {
            if ('days' in nag.repeat) {
                repeatInfo = ` (every ${nag.repeat.every} ${nag.repeat.unit} on days ${nag.repeat.days.join(', ')})`
            } else {
                repeatInfo = ` (every ${nag.repeat.every} ${nag.repeat.unit})`
            }
        }
        console.log(`${nag.id}. ${nag.title}${repeatInfo}`)
        console.log(`   Due: ${dueDate}`)
        console.log(`   Workflow: ${nag.onNagWorkflow?.type || 'default'}`)
        console.log("")
    }
}