/**
 * bili-lottery-light Rev 0.1 Beta
 * Copyright 2020 stackinspector(进栈检票). MIT Lincese.
 */

import type { Dict } from 'baseutil/fetchlot.ts'
import { intersect } from 'baseutil/set.ts'
import { randOrgEls } from 'baseutil/random.ts'
import type { Needs, Port, Config, Result, Filtee } from './schema.ts'
import type { Like, Repost, DynamicCard, Reply, Detail } from './api-schema.ts'

(async (config: Config): Promise<Result> => {

  if (config.blockself) config.blockuid.push(config.uid)

  const req = async (url: string): Promise<unknown> => (await (await fetch(url, { credentials: 'include' })).json()).data

  const filter = (data: Filtee) =>
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

        const resp = await req(url + pn) as Like

        for (const raw of resp.item_likes) {
          const data: Filtee = {
            uid: raw.uid,
            time: raw.time,
          }
          if (filter(data)) set.add(data.uid)
        }

        flag = Boolean(resp.has_more)
        pn += 1

      } while (flag)

    },

    repost: async (tid, set) => {

      const url = `https://api.vc.bilibili.com/dynamic_repost/v1/dynamic_repost/repost_detail?dynamic_id=${tid}&ps=20&offset=`

      let flag: boolean
      let pn = ''

      do {

        const resp = await req(url + pn) as Repost

        for (const raw of resp.items) {
          const data: Filtee = {
            uid: raw.desc.uid,
            content: (JSON.parse(raw.card) as DynamicCard).item.content,
            time: raw.desc.timestamp,
          }
          if (filter(data)) set.add(data.uid)
        }

        flag = Boolean(resp.has_more)
        pn = resp.offset

      } while (flag)

    },

    reply: async (tid, set) => {

      const desc = (await req(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/get_dynamic_detail?dynamic_id=${tid}`) as Detail).card.desc
      const url = `https://api.bilibili.com/x/v2/reply?type=${desc.r_type ? 11 : 17}&oid=${desc.rid}&sort=0&ps=20&pn=`

      let flag = true
      let pn = 0

      do {

        const resp = await req(url + pn) as Reply

        if (resp.replies !== null) {

          for (const raw of resp.replies) {
            const data: Filtee = {
              uid: raw.mid,
              content: raw.content.message,
              time: raw.ctime,
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
    return resp === null ? [] : Object.keys(resp as Dict).map(Number)
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

  return {
    vaildcount: pool.length,
    result: await randOrgEls(pool, config.count)
  }

})