// variables for XDG_HOME spec directories
const XDG_HOME = process.env.XDG_HOME || process.env.HOME;
const XDG_CONFIG_HOME = process.env.XDG_CONFIG_HOME || `${XDG_HOME}/.config`;
const XDG_DATA_HOME = process.env.XDG_DATA_HOME || `${XDG_HOME}/.local/share`;
const XDG_CACHE_HOME = process.env.XDG_CACHE_HOME || `${XDG_HOME}/.cache`;
const XDG_STATE_HOME = process.env.XDG_STATE_HOME || `${XDG_HOME}/.local/state`;

type UserConfig = {
    dirs?: {
        config?: string;
        data?: string;
        cache?: string;
        state?: string;
    };
};
// TODO: support customization of dirs
const userConfig: UserConfig = {} // placeholder

type Dirs = {
    config: string;
    data: string;
    cache: string;
    state: string;
};

const dirs: Dirs = {
    config: userConfig?.dirs?.config|| `${XDG_CONFIG_HOME}/nag`,
    data: userConfig?.dirs?.data|| `${XDG_DATA_HOME}/nag`,
    cache: userConfig?.dirs?.cache|| `${XDG_CACHE_HOME}/nag`,
    state: userConfig?.dirs?.state|| `${XDG_STATE_HOME}/nag`,
}

import { mkdirSync } from "fs";
import { existsSync } from "fs";
if (!existsSync(dirs.config)) mkdirSync(dirs.config, { recursive: true });
if (!existsSync(dirs.data)) mkdirSync(dirs.data, { recursive: true });
if (!existsSync(dirs.cache)) mkdirSync(dirs.cache, { recursive: true });
if (!existsSync(dirs.state)) mkdirSync(dirs.state, { recursive: true });

export default {
    dirs,
}
