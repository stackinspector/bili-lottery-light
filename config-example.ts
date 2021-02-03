import type { Config } from './schema.ts'
export const example: Config = {
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
}