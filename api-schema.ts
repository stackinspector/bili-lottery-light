// deno-lint-ignore-file camelcase

export type { Like, Repost, DynamicCard, Reply, Detail }

interface Dynamic {
    desc: {
        uid: number
        timestamp: number
        r_type: number
        rid: number
    },
    card: string // DynamicCard (parsed)
}

interface DynamicCard {
    item: {
        content: string
    }
}

interface Like {
    item_likes: {
        uid: number
        time: number
    }[]
    has_more: number
}

interface Repost {
    items: Dynamic[]
    has_more: number
    offset: string
}

interface Reply {
    replies: {
        mid: number
        content: {
            message: string
        }
        ctime: number
    }[] | null
}

interface Detail {
    card: Dynamic
}

