
import { parseArgs } from "util";

const { positionals } = parseArgs({
  args: Bun.argv,
  positionals: ["command"],
  strict: false,
});

const [_, __, cmd] = positionals


switch (cmd) {
    // only one command for now
    case "nag":
    case undefined:
    default:
        // no command provided
        // assume 'nag' command
        console.log("nag")
        break

}

