import { parseArgs } from "util";
import db from "../db";
import type { RepeatRule } from "../db";

export function new_() {
    // create a new nag
    const { values: newValues, positionals } = parseArgs({
        allowPositionals: true,
        options: {
            workflow: {
                type: 'string',
                short: 'w',
                default: 'default',
            },
            every: {
                type: 'string',
                short: 'i',
                default: '1',
            },
        }
    })

    const title = positionals[1] // Skip the command name itself

    const tokens = newValues.every.split(' ')
    let unit = undefined
    let every = undefined
    if (tokens.length === 1) {
        unit = tokens[0]
        every = 1
    } else {
        unit = tokens[1]
        every = parseInt(tokens[0] as string)
    }

    if (!unit?.endsWith('s')) {
        unit = `${unit}s`
    }

    const repeat = {
        every,
        unit: unit as RepeatRule['unit']
    }

    if (!title) {
        console.error("Title is required")
        return
    }

    db.nag.create({
        title,
        repeat,
        // TODO: actual date conversion logig
        nagDueTimestamp: Date.now() + repeat.every * 60 * 60,
        onNagWorkflow: {
            type: newValues.workflow,
        },
    })
}