/**
 * bili-lottery-light Rev 0.1 Beta
 * Copyright 2020 stackinspector(进栈检票). MIT Lincese.
 */

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

interface Data {
  uid: number
  content?: string
  time: number
}

(async (config: Config): Promise<Result> => {

  if (config.blockself) config.blockuid.push(config.uid)

  const req = async (url: string): Promise<any> => (await (await fetch(url, { credentials: 'include' })).json()).data

  const intersect = (foo: Set<number>, bar: Set<number>): Set<number> => {
    const result = new Set<number>()
    for (const el of bar) {
      if (foo.has(el)) result.add(el)
    }
    return result
  }

  const filter = (data: Data) =>
    (data.time < config.endtime)
    && !(data.uid in config.blockuid)
    && (('content' in data && config.blockword.length !== 0) ? ((content: string): boolean => {
      for (const word of config.blockword) {
        if (content.includes(word)) return false
      }
      return true
    })(data.content!) : true)

  const ports: Record<Needs, Port> = {

    like: async (tid, set) => {

      const url = `https://api.vc.bilibili.com/dynamic_like/v1/dynamic_like/spec_item_likes?dynamic_id=${tid}&ps=50&pn=`

      let flag: boolean
      let pn = 1

      do {

        const resp = await req(url + pn)

        for (const raw of resp.item_likes) {
          const data: Data = {
            uid: raw.uid as number,
            time: raw.time as number,
          }
          if (filter(data)) set.add(data.uid)
        }

        flag = Boolean(resp.has_more as number)
        pn += 1

      } while (flag)

    },

    repost: async (tid, set) => {

      const url = `https://api.vc.bilibili.com/dynamic_repost/v1/dynamic_repost/repost_detail?dynamic_id=${tid}&ps=20&offset=`

      let flag: boolean
      let pn = ''

      do {

        const resp = await req(url + pn)

        for (const raw of resp.items) {
          const data: Data = {
            uid: raw.desc.uid as number,
            content: JSON.parse(raw.card).item.content as string,
            time: raw.desc.timestamp as number,
          }
          if (filter(data)) set.add(data.uid)
        }

        flag = Boolean(resp.has_more as number)
        pn = resp.offset as string

      } while (flag)

    },

    reply: async (tid, set) => {

      const desc = (await req(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/get_dynamic_detail?dynamic_id=${tid}`)).card.desc
      const url = `https://api.bilibili.com/x/v2/reply?type=${Boolean(desc.r_type as number) ? 11 : 17}&oid=${desc.rid as number}&sort=0&ps=20&pn=`

      let flag: boolean = true
      let pn = 0

      do {

        const resp = await req(url + pn)

        if (resp.replies !== null) {

          for (const raw of resp.replies) {
            const data: Data = {
              uid: raw.mid as number,
              content: raw.content.message as string,
              time: raw.ctime as number,
            }
            if (filter(data)) set.add(data.uid)
          }

        }

        else flag = false
        pn += 1

      } while (flag)

    }

  }

  const follow = async (uids: number[]): Promise<number[]> => {
    const resp = await req(`https://api.bilibili.com/x/relation/relations?fids=${uids.join(',')}`)
    return resp === null ? [] : Object.keys(resp as object).map(Number)
  }

  const pre = async (): Promise<number[]> => {
    const needs: Needs[] = ['like', 'reply', 'repost']
    if (config.or) {
      const results = new Set<number>()
      for (const tid of config.tid) {
        for (const need of needs) {
          if (config.needs[need]) await ports[need](tid, results)
        }
      }
      return [...results]
    } else {
      const results: Set<number>[] = []
      for (const tid of config.tid) {
        for (const need of needs) {
          const result = new Set<number>()
          if (config.needs[need]) await ports[need](tid, result)
          results.push(result)
        }
      }
      return [...results.reduce(intersect)]
    }
  }

  const prepool = await pre()
  const pool = config.follow ? await follow(prepool) : prepool

  // API returns text: `Set 1: 1, 2, 3, ...`
  const random = JSON.parse('[' + (await (await fetch(
    `https://www.random.org/integer-sets/?sets=1&num=${config.count}&min=0&max=${pool.length - 1}&seqnos=on&commas=on&sort=on&order=index&format=plain&rnd=new`
  )).text()).slice(7) + ']') as number[]

  return {
    vaildcount: pool.length,
    result: random.map((n) => pool[n])
  }

})