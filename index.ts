
import { parseArgs } from "util";
import db from "./db"
import { new_ } from "./cmd/new"
import { list_ } from "./cmd/list"
import { delete_ } from "./cmd/delete"
import { nag_ } from "./cmd/nag"

const { positionals } = parseArgs({
  args: Bun.argv,
  positionals: ["command"],
  strict: false,
});

const [_, __, cmd] = positionals


function runCmd(cmd: string | undefined) {
    switch (cmd) {
        case "new":
            new_()
            break

        case "list":
            list_()
            break

        case "delete":
            delete_()
            break

        case "nag":
        case undefined:
        default:
            // no command provided
            // assume 'nag' command
            nag_()
            break
    }
}


try {
    db.init()
    runCmd(cmd)
} finally {
    db.close()
}
