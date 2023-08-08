import { Context, Schema, h } from 'koishi'

export const name = 'custom-welcome-message'
export const usage = `## 🎮 使用

- 两种使用方法
  - 直接在数据表 \`custom_welcome_table\` 中插入 \`message\`
  - 使用下面的命令（需要自行设置指令别名）

### 📝 命令

这个插件提供了以下几个指令：

- \`cwm\`：查看 customWelcomeMessage 帮助。
- \`cwm.add <guildId:string> <message:text>\`：添加欢迎消息。
- \`cwm.view <guildId:string>\`：查看欢迎消息。
- \`cwm.clear <guildId:string>\`：一键清理欢迎消息。

## 🔮 变量

您可以在欢迎消息中使用以下变量，它们会在发送时被替换成相应的内容：

- \`《艾特被欢迎者》\`：被欢迎者的艾特。
- \`《被欢迎者ID》\`：被欢迎者的 ID。
- \`《被欢迎者名字》\`：被欢迎者的名字。
- \`《当前群组ID》\`：当前群组的 ID。
- \`《当前群组名字》\`：当前群组的名字。
- \`\\n\`：换号符。


## 🎨 图片

您还可以在欢迎消息中使用图片 URL 来发送图片，格式如下：

- \`《图片url为http://或https://...(此处已经省略url链接地址)》\`

例如：

- \`《图片url为https://i.imgur.com/abc.jpg》\`

请注意，图片 URL 必须以 http:// 或 https:// 开头，并且必须是有效的图片地址。否则，将无法发送图片。

## 🎲 示例

以下是一些欢迎消息的示例：

- \`欢迎 《艾特被欢迎者》 加入 《当前群组名字》！\`
- \`《被欢迎者名字》 您好，感谢您加入 《当前群组名字》！\`
- \`《图片url为https://i.imgur.com/xyz.png》\\nHi, 《被欢迎者名字》！Welcome to 《当前群组名字》！\``

export interface Config { }

export const Config: Schema<Config> = Schema.object({})

// 避免硬编码，方便随时修改表名
const Custom_Welcome_TABLE_ID = 'custom_welcome_table'

// TypeScript 用户需要进行类型合并
declare module 'koishi' {
  interface Tables {
    custom_welcome_table: CustomWelcome
  }
}

export interface CustomWelcome {
  id: number
  guildId: string
  message: string
}

// 插件主函数
export function apply(ctx: Context) {
  // 仅群聊触发
  ctx = ctx.guild()
  // 拓展表
  extendAllTable(ctx)
  // 注册 Koishi 指令 cwm 添加 查看 清空
  registerAllKoishiCommands(ctx)
  // 注册监听器 获取成员加入群组的事件
  registerEventEmitter(ctx)
}

function extendAllTable(ctx: Context) {
  ctx.model.extend(Custom_Welcome_TABLE_ID, {
    // 各字段类型
    id: 'unsigned',
    guildId: 'string',
    message: 'text',
  }, {
    // 使用自增的主键值
    autoInc: true,
  })
}

function registerAllKoishiCommands(ctx: Context) {
  //消息
  const msg = {
    added: `添加成功！`,
    cleared: `清理成功！`,
    isNotExist: `该群组暂无 msg！`
  }

  // cwm
  ctx.command('cwm', '查看 customWelcomeMessage 帮助')
    .action(({ session }) => {
      session.execute(`cwm -h`)
    })
  //add
  ctx.command('cwm.add <guildId:string> <message:text>', '添加 msg')
    .action(async ({ session }, guildId: string, message: string) => {
      if (!guildId || !message) {
        return
      }
      await ctx.model.create(Custom_Welcome_TABLE_ID, { guildId: guildId, message: message })
      await session.send(msg.added)
    })
  // view
  ctx.command('cwm.view <guildId:string>', '查看 msg')
    .action(async ({ session }, guildId: string) => {
      if (!guildId) {
        return
      }
      const result = await getTableContentByGuildId(ctx, guildId)
      const isExist = checkGuildExistence(result)
      if (!isExist) {
        msg.isNotExist
      }
      // 定义一个空字符串变量list，用来保存格式化后的内容
      let list: string = '';

      // 使用for循环遍历result数组，获取每个对象的message属性
      for (let i = 0; i < result.length; i++) {
        // 使用slice方法截取message的前30个字符，如果不足30个字符，则保留原样
        let message = result[i].message.slice(0, 30);

        // 使用模板字符串将序号和message拼接成一行，并添加换行符
        let line = `${i + 1}. ${message}\n`;

        // 将line追加到list中
        list += line;
      }
      await session.send(list)
    })
  // clear
  ctx.command('cwm.clear <guildId:string>', '清理 msg')
    .action(async ({ session }, guildId: string) => {
      if (!guildId) {
        return
      }
      const result = getTableContentByGuildId(ctx, guildId)
      const isExist = checkGuildExistence(result)
      if (!isExist) {
        msg.isNotExist
      }
      await ctx.model.remove(Custom_Welcome_TABLE_ID, { guildId: guildId })
      await session.send(msg.cleared)
    })
}

function registerEventEmitter(ctx: Context) {
  // 核心
  // ctx.on('message', async (session) => {
  ctx.on('guild-member-added', async (session) => {
    // 定义一个正则表达式，匹配所有需要替换的内容
    let regex = /《艾特被欢迎者》|《被欢迎者ID》|《被欢迎者名字》|《当前群组ID》|《当前群组名字》/g;
    // 根据群组 ID 获取数据表内容
    const result = await getTableContentByGuildId(ctx, session.guildId)

    // 检查当前群组是否存在欢迎消息
    const isExist = checkGuildExistence(result)

    if (!isExist) {
      return
    }

    // 假设msg是一个数组
    let msg = result[Math.floor(Math.random() * result.length)].message;

    // 使用replace方法，传入正则表达式和替换函数，得到新的字符串
    let newMsg = msg.replace(regex, (match) => replacer(session, match));
    // 使用replace方法，传入正则表达式和替换字符串，将\n替换为<br>
    newMsg = newMsg.replace(/\\n/g, `\n`);
    await session.send(replaceImage(newMsg))
  })
}

function checkGuildExistence(result: any) {
  // 若存在则返回 true，不存在则返回 false
  if (result.length === 0) {
    return false
  } else {
    return true
  }
}

async function getTableContentByGuildId(ctx: Context, guildId: string) {
  return await ctx.model.get(Custom_Welcome_TABLE_ID, { guildId: guildId })
}

// 定义一个替换函数，根据匹配的内容返回不同的变量
function replacer(session: any, match: string) {
  switch (match) {
    case '《艾特被欢迎者》':
      return h.at(session.userId);
    case '《被欢迎者ID》':
      return session.userId;
    case '《被欢迎者名字》':
      return session.username;
    case '《当前群组ID》':
      return session.guildId;
    case '《当前群组名字》':
      return session.guildName;
    default:
      return match;
  }
}


// 定义一个函数，接受一个字符串作为参数
function replaceImage(str: string): string {
  // 定义一个正则表达式，匹配'《图片url为http://或https://...(此处已经省略url链接地址)》'的格式
  // 使用http(s)?表示http或https
  let regex = /《图片url为(http(s)?:\/\/.*?)》/g;
  // 使用replace方法，将匹配到的内容替换成h.image(url)的格式
  // 匹配到的内容会作为参数传递给替换函数
  let result = str.replace(regex, (_match, url) => {
    return `${h.image(`${url}`)}`;
  });
  // 返回替换后的字符串
  return result;
}
