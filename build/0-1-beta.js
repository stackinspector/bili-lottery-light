await(async (config) => { if (config.blockself) config.blockuid.push(config.uid); const req = async (url) => (await (await fetch(url, { credentials: 'include' })).json()).data; const intersect = (foo, bar) => { const result = new Set(); for (const el of bar) { if (foo.has(el)) result.add(el); } return result; }; const filter = (data) => data.time < config.endtime && !(data.uid in config.blockuid) && ('content' in data && config.blockword.length !== 0 ? ((content) => { for (const word of config.blockword) { if (content.includes(word)) return false; } return true; })(data.content) : true); const ports = { like: async (tid, set) => { const url = `https://api.vc.bilibili.com/dynamic_like/v1/dynamic_like/spec_item_likes?dynamic_id=${tid}&ps=50&pn=`; let flag; let pn = 1; do { const resp = await req(url + pn); for (const raw of resp.item_likes) { const data = { uid: raw.uid, time: raw.time }; if (filter(data)) set.add(data.uid); } flag = Boolean(resp.has_more); pn += 1; } while (flag) }, repost: async (tid, set) => { const url = `https://api.vc.bilibili.com/dynamic_repost/v1/dynamic_repost/repost_detail?dynamic_id=${tid}&ps=20&offset=`; let flag; let pn = ''; do { const resp = await req(url + pn); for (const raw of resp.items) { const data = { uid: raw.desc.uid, content: JSON.parse(raw.card).item.content, time: raw.desc.timestamp }; if (filter(data)) set.add(data.uid); } flag = Boolean(resp.has_more); pn = resp.offset; } while (flag) }, reply: async (tid, set) => { const desc = (await req(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/get_dynamic_detail?dynamic_id=${tid}`)).card.desc; const url = `https://api.bilibili.com/x/v2/reply?type=${Boolean(desc.r_type) ? 11 : 17}&oid=${desc.rid}&sort=0&ps=20&pn=`; let flag = true; let pn = 0; do { const resp = await req(url + pn); if (resp.replies !== null) { for (const raw of resp.replies) { const data = { uid: raw.mid, content: raw.content.message, time: raw.ctime }; if (filter(data)) set.add(data.uid); } } else flag = false; pn += 1; } while (flag) } }; const follow = async (uids) => { const resp = await req(`https://api.bilibili.com/x/relation/relations?fids=${uids.join(',')}`); return resp === null ? [] : Object.keys(resp).map(Number); }; const pre = async () => { const needs = ['like', 'reply', 'repost']; if (config.or) { const results = new Set(); for (const tid of config.tid) { for (const need of needs) { if (config.needs[need]) await ports[need](tid, results); } } return [...results]; } else { const results = []; for (const tid of config.tid) { for (const need of needs) { const result = new Set(); if (config.needs[need]) await ports[need](tid, result); results.push(result); } } return [...results.reduce(intersect)]; } }; const prepool = await pre(); const pool = config.follow ? await follow(prepool) : prepool; const random = JSON.parse('[' + (await (await fetch(`https://www.random.org/integer-sets/?sets=1&num=${config.count}&min=0&max=${pool.length - 1}&seqnos=on&commas=on&sort=on&order=index&format=plain&rnd=new`)).text()).slice(7) + ']'); return { vaildcount: pool.length, result: random.map((n) => pool[n]) }; })({
  /** 抽奖发起者的uid */
  uid: 573732342,
  /** 至少一个或多个抽奖动态的tid（目前为18位），注意要字符串形式（因为超过了JS最大安全整数） */
  tid: ['##################'],
  /** 选择抽奖条件，至少选择一个条件，至多全选 */
  needs: {
    /** 点赞 */
    like: false,
    /** 回复 */
    reply: false,
    /** 转发 */
    repost: true,
  },
  /** 以上三个条件之间的关系，“并且”填false，“或者”填true */
  or: false,
  /** 参与抽奖者是否需要关注抽奖发起者 */
  follow: true,
  /** 被抽中的抽奖者人数 */
  count: 1,
  /** 抽奖截止时间，去掉字符串（注意不是把字符串清空）则为当前时间 */
  endtime: Number(new Date('2020-12-20 20:00:00')),
  /** 禁止参与抽奖的用户的uid列表，可以为空 */
  blockuid: [],
  /** 参与抽奖者在评论或者转发时不能出现的关键字字符串列表，可以为空 */
  blockword: [],
  /** 禁止自己参与抽奖 */
  blockself: true,
})