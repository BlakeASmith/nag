import { Database } from "bun:sqlite";
import cfg from "../cfg.ts"
import { join } from "path"

const db = new Database(join(cfg.dirs.data, "db.sqlite"), { create: true });


type WorkflowType = string
type WorkflowId = string
type JSONAny = any

type WorkflowInstance = {
    type: WorkflowType
    id: WorkflowId
    data: JSONAny
}

// support repeating by x number of units
// as well as repeat rules like "every week on Monday and Thursday"
type RepeatRule = {
    every: number,
    unit: 'hours' | 'days' | 'weeks' | 'months' | 'years' | 'days',
} | {
    days: number[],
    every: number,
    unit: 'days',
}

type GetNag = {
    id: number,
    title: string,
    nagDueTimestamp: number,
    nagCreatedTimestamp: number,
    repeat?: RepeatRule,
    onNagWorkflow?: {
        type: WorkflowType
        current?: WorkflowInstance
    },
    isDeleted: boolean,
}

type CreateNag = Omit<GetNag, 'id' | 'nagCreatedTimestamp' | 'isDeleted'>
type UpdateNag = GetNag
export type Nag = GetNag | CreateNag | UpdateNag


async function init() {
    db.run(`
        CREATE TABLE IF NOT EXISTS nag (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            nagDueTimestamp INTEGER NOT NULL,
            repeat JSON NOT NULL,
            onNagWorkflow JSON NOT NULL,
            isDeleted INTEGER NOT NULL DEFAULT 0,
            nagCreatedTimestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `)
}

async function close() {
    db.close()
}

const nagDao = {
    create: (nag: CreateNag) => {
        db.run(`
            INSERT INTO nag (title, nagDueTimestamp, repeat, onNagWorkflow) VALUES (?, ?, ?, ?)
        `, [nag.title, nag.nagDueTimestamp, JSON.stringify(nag.repeat), JSON.stringify(nag.onNagWorkflow)])
    },
    // needs to return a GetNag
    get: (id: number) => {
        const result = db.query(`
            SELECT * FROM nag WHERE id = ?
        `).get(id)
        return result as GetNag
    },
    update: (nag: UpdateNag) => {
        db.run(`
            UPDATE nag SET title = ?, nagDueTimestamp = ?, repeat = ?, onNagWorkflow = ? WHERE id = ?
        `, [nag.title, nag.nagDueTimestamp, JSON.stringify(nag.repeat), JSON.stringify(nag.onNagWorkflow), nag.id])
    },
}

export default {
    init,
    close,
    nag: nagDao
}
