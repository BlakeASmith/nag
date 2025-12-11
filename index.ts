
import { parseArgs } from "util";
import db from "./db"

const { positionals } = parseArgs({
  args: Bun.argv,
  positionals: ["command"],
  strict: false,
});

const [_, __, cmd] = positionals


function runCmd(cmd: string | undefined) {
    switch (cmd) {
        case "new":
            // create a new nag
            const { values: newValues, positionals: [title] } = parseArgs({
                allowPositionals: true,
                positionals: ["cmd", "title"],
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
                unit
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
            break

        case "nag":
        case undefined:
        default:
            // no command provided
            // assume 'nag' command
            console.log("nag")
            const { values: nagValues } = parseArgs({
                allowPositionals: true,
                options: {
                    workflow: {
                        type: 'string',
                        short: 'w',
                        default: 'default'
                    }
                }
            })
            console.log(nagValues)
            break
    }
}


try {
    db.init()
    runCmd(cmd)
} finally {
    db.close()
}
