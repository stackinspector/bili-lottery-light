# bili-lottery-light

**本项目的目标是实现一个基于浏览器的、功能全面的、轻量级的B站第三方互动抽奖工具。**

目前仍在Beta阶段，**还没有添加任何错误提示和错误捕捉**。各位大佬如果发现了代码中的bug，请尽快指出，不胜感激。也欢迎来添加新功能。

对于一般使用者，在Beta阶段，出现任何报错或者非预期现象，请优先B站私信我（@进栈检票 uid=573732342 或者 @72EU uid=669819542），实在不行再提issue。因为有可能不是bug，而是目前还没有捕捉的预期错误。常见预期错误的表现我会在下面“常见预期错误”一节列出，可以参考，但是不管出了什么错最好还是私信我一下，万一真的是bug。。

## 敬告使用者

### 对于任何版本

本人仅提供该代码，对于抽奖结果的正确性（正确包含了所有符合抽奖条件的用户）和公正性等**不做任何形式的保证**，以任何形式使用该代码产生的任何后果由使用者**自行承担**，包括但不限于以抽奖为名义进行网络诈骗或者恶意套取个人信息、代码本身存在未发现的bug或者使用者恶意修改代码导致抽奖结果不公正等。

对于电磁力达标的UP主，强烈建议使用更加规范的官方互动抽奖功能。另请注意，**使用了官方互动抽奖功能的动态，再附加其他附加抽奖条件，是官方所禁止的行为**。

即使未来添加了**视频、专栏**等可选抽奖目标，也不会包含点赞（动态点赞仍然支持）、收藏、投币等抽奖条件。**利用抽奖增加视频、专栏的点赞、收藏、投币量是官方所禁止的行为**，并且这些数据本来也基本上都不可获取。

### 对于当前(0.1 Beta)版本

由于当前版本**对于请求速度没有限制**，对于**需要请求数**（如果抽奖条件选择了：点赞数/50 + 评论数/20 + 转发数/20（除法结果进位））**大于200**的抽奖动态，**不建议**使用该工具。因为短时间的大量请求不仅会增加服务器压力，而且有可能导致**你甚至你所在的地区在一段时间内受到对相应接口的访问限制**，尤其是在你**没有登录账号**的情况下。请多为他人着想。

## 功能

### 已有功能

✔️ 在任意B站域名下的网页上打开console执行（不必在目标动态页面），使用浏览器Cookie作为登录信息

✔️ 支持抽奖目标：文字动态、图片动态、转发其他内容的动态（未经验证）的tid（目前为18位），支持多个动态抽一个奖

✔️ 支持抽奖条件：**点赞**、评论、转发（可以设置和/或），（并且）关注，截止时间

✔️ 可设置评论、转发内容中不能出现的词语，以及禁止参与抽奖的用户。可设置禁止自己参与抽奖。

✔️ 调用random.org提供的接口获取**真随机数**，在符合条件的用户池中抽取 

### 未来可能会添加的功能（按照实现优先级排序）

✖️ 抽奖结果可以分组（也就是可以分一等奖二等奖等等）

✖️ 对于常见错误的提示

✖️ 支持视频、专栏等作为抽奖目标

✖️ 判断配置中的uid与当前环境登录的用户uid是否一致

✖️ 评论抽奖包含楼中楼评论

### 暂时不考虑添加的功能

❌ “抽奖号”的筛选（争议较大，很难给出公允的判断方法）

## 使用

在`build`文件夹中找到最新版本的js文件，文件包含了经过类型擦除和压缩的代码（除此之外未进行任何JS特性降级和代码混淆）以及预先写好注释的配置模板。将文件**全文内容**复制到文本编辑器，**按照注释中的提示编辑配置项**，再复制修改好配置的**全文内容**。下面是一个配置示例（请不要理会第一行的导出声明）：

```ts
export default {
  /** 抽奖发起者的uid */
  uid: 573732342,
  /** 至少一个或多个抽奖动态的tid（目前为18位），注意要字符串形式（因为超过了JS最大安全整数） */
  tid: ['444985232080584289'],
  /** 选择抽奖条件，至少选择一个条件，至多全选 */
  needs: {
    /** 点赞 */
    like: true,
    /** 回复 */
    reply: true,
    /** 转发 */
    repost: true,
  },
  /** 以上三个条件之间的关系，“并且”填false，“或者”填true */
  or: true,
  /** 参与抽奖者是否需要关注抽奖发起者 */
  follow: true,
  /** 被抽中的抽奖者人数 */
  count: 2,
  /** 抽奖截止时间，去掉字符串（注意不是把字符串清空）则为当前时间 */
  endtime: Number(new Date('2020-12-20 20:00:00')),
  /** 禁止参与抽奖的用户的uid列表，可以为空 */
  blockuid: [],
  /** 参与抽奖者在评论或者转发时不能出现的关键字字符串列表，可以为空 */
  blockword: [],
  /** 禁止自己参与抽奖 */
  blockself: true,
}
```

这个配置表示，uid为573732342的抽奖发起者要对tid为444985232080584289的动态（其实不是抽奖动态，只是点赞回复的比较多的动态（捂脸））进行抽奖，条件为点赞或者回复或者转发，并且关注，参与截止时间为2020-12-20 20:00:00，两个人将中奖，禁止自己参与抽奖。

需要注意的是，如果多个动态抽一个奖或者抽奖条件之间的关系选择了“或者”，那么**多条动态都符合条件**的或者**多个条件都符合**的，**不会**增加中奖的概率。

另请开发人员注意，配置的接口定义在源代码中是在主函数前定义的`interface Config`。

用**登录了抽奖发起者（要求与之后在选项中填写的uid一致）的B站账号，并且未开启无痕浏览模式的最新版Chrome浏览器**打开任意一个**B站二级域名下**的网页。

此处**强烈推荐使用404页面**，因为这个页面很简单，没有复杂的JS在运行，**给工具一个干净的运行环境**。

> https://www.bilibili.com/404

按住`Fn + F12`或者`Shift + Ctrl + I`，或者在页面上右键选择点击`检查`，启动Chrome DevTools。

在最上方选择切换到`console`选项卡，找到光标所在位置，右键点击`粘贴为纯文本`，将刚才修改后的全文内容粘贴到console，如图（图片链接请复制链接地址再粘贴到地址栏查看，否则会被拦截为盗链）：

> https://i0.hdslb.com/bfs/album/9ff8e8afa7f09a3ce08ebbdf42454547e0bc987a.png

确认配置填写正确后点击回车，如果没有发生错误，稍等片刻即可看到结果返回，如图：

> https://i0.hdslb.com/bfs/album/11c5a0603f03afdaaf5a657eb94ba4c97ed9b94b.png

下面是一个结果示例（请不要理会第一行的导出声明）：

```ts
export default {
  result: [54710333, 96726472]
  vaildcount: 8
}
```

属性`vaildcount`是符合所有抽奖条件的抽奖参与者数量，`result`是中奖者的uid列表。

另请开发人员注意，结果的接口定义在源代码中是在主函数前定义的`interface Result`。

可以切换到`network`选项卡，查看工具发起了哪些请求，如图：

> https://i0.hdslb.com/bfs/album/03cb1685aa531f7912961dad84ad75a0d4367829.png

## 常见预期错误

1. console提示对`random.org`的接口的请求报503错误，响应体为`Error: The maximum value must be greater than the minimum value`。这代表**没有符合抽奖条件的参与者**。

2. console提示对`random.org`的接口的请求报503错误，响应体为`Error: You requested # integers in each set, but the interval you specified [#,#] only has #`。这代表**符合抽奖条件的参与者数量小于设置的中奖者人数**。

## 构建（针对开发者）

目前还没有搞构建系统。。由我手动用`deno bundle bili-lottery-light.ts`生成js代码，然后再在vscode中去掉换行和缩进，再加上`config-example.ts`中的配置模板作为主函数的参数，组合成可直接使用的build文件。如果你想不用deno自己构建，建议在deno官方文档中找出deno的tsconfig并使用。