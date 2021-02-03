export type { Needs, Port, Config, Result, Filtee }

type Needs = 'like' | 'reply' | 'repost'

type Port = (tid: string, set: Set<number>) => Promise<void>

interface Config {
    uid: number
    tid: string[]
    needs: Record<Needs, boolean>
    or: boolean
    follow: boolean
    count: number
    endtime: number
    blockuid: number[]
    blockword: string[]
    blockself: boolean
}

interface Result {
    vaildcount: number
    result: number[]
}

interface Filtee {
    uid: number
    content?: string
    time: number
}

