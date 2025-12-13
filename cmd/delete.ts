import { parseArgs } from "util";
import db from "../db";

export function delete_() {
    // delete nags by ID or title
    const { positionals } = parseArgs({
        allowPositionals: true,
    })

    const arg = positionals.slice(1).join(' ')

    if (!arg.trim()) {
        console.error("ID or title is required")
        return
    }

    // Check if argument is a number (ID) or string (title)
    const id = parseInt(arg)
    if (!isNaN(id) && arg === id.toString()) {
        // Delete by ID
        const nag = db.nag.get(id)
        if (!nag) {
            console.error(`No nag found with ID ${id}`)
            return
        }

        if (nag.isDeleted) {
            console.error(`Nag with ID ${id} is already deleted`)
            return
        }

        db.nag.delete(id)
        console.log(`Deleted nag "${nag.title}" (ID: ${id})`)
    } else {
        // Delete by title
        const title = arg

        // Get all nags and filter by title
        const allNags = db.nag.list()
        const matchingNags = allNags.filter(nag => nag.title.toLowerCase() === title.toLowerCase())

        if (matchingNags.length === 0) {
            console.error(`No active nags found with title "${title}"`)
            return
        }

        // Delete all matching nags
        let deletedCount = 0
        for (const nag of matchingNags) {
            db.nag.delete(nag.id)
            deletedCount++
        }

        console.log(`Deleted ${deletedCount} nag${deletedCount > 1 ? 's' : ''} with title "${title}"`)
    }
}