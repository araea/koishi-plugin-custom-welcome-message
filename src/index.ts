import { Channel, Context, Schema, Session, User, h } from 'koishi'
// 导入fs模块，用于读取文件
import fs from 'fs';
import path from 'path';

export const name = 'custom-welcome-message'
export const usage = `## 🎮 使用

- 这是一个自定义 欢迎/离开 消息插件,有以下两种使用方法：

  - 直接在数据表 \`custom_welcome_table\` 中插入 \`message\` 字段。

  - 使用下面的命令。
  

### 📝 命令

这个插件提供了以下几个命令：

- \`cwm\`：查看 customWelcomeMessage 插件帮助。

- \`cwm.add <eventName> <guildId> <message>\`：添加 欢迎/离开 消息。

  - \`eventName\` 为 "进群" 或 "退群"。

  - \`guildId\` 为群组 ID，多个 ID 用英文逗号或中文逗号分割。使用 \`~\` 默认指代当前群组 ID。

  - \`message\` 为 欢迎/离开 消息文本。

- \`cwm.view <eventName> <guildId>\`：查看指定群组的 欢迎/离开 消息。

- \`cwm.clear <eventName> <guildId>\`：清空指定群组的 欢迎/离开 消息。

  - \`cwm.clear -f\`：强制清空所有消息，慎用！（建议为该选项设置使用权限）

- 小提示：以上所有命令中的 \`guildId\` 都可以使用多个用英文逗号或中文逗号分割，也都可以使用 \`~\` 默认指代当前群组 ID。

## 🔮 变量

消息文本中可以使用以下变量,发送时会替换为对应内容：

- \`《艾特被欢迎者》\`：艾特加入者(进群)

- \`《被欢迎者ID》\`：加入者 ID(进群)

- \`《被欢迎者名字》\`：加入者 名字(进群)  

- \`《被欢迎者头像》\`：加入者 头像(进群)

- \`《当前群组ID》\`：当前群组 ID

- \`《当前群组名字》\`：当前群组 名称

- \`《艾特退群者》\`：艾特离开者(退群)

- \`《退群者ID》\`：离开者 ID(退群)

- \`《退群者名字》\`：离开者 名字(退群)

- \`《退群者头像》\`：离开者 头像(退群)

- \`《换行》\`：换行符


### 🎨 图片

还可以在消息中使用图片 URL 或本地图片：

- \`《图片url为http://或https://...》\`：图片 URL

- \`《本地图片路径为/path/to/image》\`：本地图片路径
  
例如：

- \`《图片url为https://th.bing.com/th/id/OIP.Jmx7AEaJvhyuTiW29wRRIAHaHa?w=182&h=182&c=7&r=0&o=5&dpr=1.3&pid=1.7》\`

- \`《本地图片路径为C:\\Users\\114514\\Pictures\\Nawyjx.jpg》\` - (Windows)

- \`《本地图片路径为home/akisa/koishi/data/suchat/image/1.jpeg》\` - (Linux)


### 🎲 示例

欢迎消息示例：

- \`欢迎《艾特被欢迎者》加入《当前群组名字》!\` 

- \`《被欢迎者头像》《换行》Hi，《被欢迎者名字》!《换行》欢迎加入《当前群组名字》!\`

- \`《被欢迎者头像》《换行》Hi, 《被欢迎者名字》！《换行》Welcome to 《当前群组名字》！\`

离开消息示例：

- \`《艾特退群者》离开了《当前群组名字》，挥一挥手说再见吧!\``

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
  eventName: string
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
    eventName: 'string',
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
    invalidEvent: `无效的事件名，请使用'进群'或'退群'！`,
    clearedForce: `已强制清空所有消息！`
  }

  // cwm
  ctx.command('cwm', '查看 customWelcomeMessage 帮助')
    .action(({ session }) => {
      session.execute(`cwm -h`)
    })
  // add
  ctx.command('cwm.add <eventName:string> <guildId:string> <message:text>', '添加 msg')
    .action(async ({ session }, eventName: string, guildId: string, message: string) => {
      if (!eventName || !guildId || !message) {
        return await session.execute(`cwm.add -h`)
      }
      if (!['进群', '退群'].includes(eventName)) {
        return msg.invalidEvent;
      }
      // 用英文逗号或中文逗号分隔 guildId 字符串，并修剪所有空白
      let guildIds = guildId.split(/[,，]\s*/);
      // 在 guildId 数组中循环
      for (let id of guildIds) {
        if (id === '~') {
          id = session.guildId
        }
        // 添加一个判断条件，如果 id 不是一个有效的数字，就跳过这个循环
        if (isNaN(Number(id))) {
          continue
        }
        // 为每个 guildId 创建一个记录
        await ctx.model.create(Custom_Welcome_TABLE_ID, { eventName: eventName, guildId: id, message: message })
      }
      await session.send(msg.added)
    })
  // view
  ctx.command('cwm.view <eventName:string> <guildId:string>', '查看 msg')
    .action(async ({ session }, eventName: string, guildId: string) => {
      if (!eventName || !guildId) {
        return await session.execute(`cwm.view -h`)
      }
      if (!['进群', '退群'].includes(eventName)) {
        return msg.invalidEvent;
      }
      // 用英文逗号或中文逗号分隔 guildId 字符串，并修剪所有空白
      let guildIds = guildId.split(/[,，]\s*/);
      // 在 guildId 数组中循环
      for (let id of guildIds) {
        if (id === '~') {
          id = session.guildId
        }
        // 添加一个判断条件，如果 id 不是一个有效的数字，就跳过这个循环
        if (isNaN(Number(id))) {
          continue
        }
        const result = await getTableContentByGuildId(ctx, id, eventName)
        const isExist = checkGuildExistence(result)
        if (!isExist) {
          await session.send(`群组 ID：${id}\n暂无可用消息。`)
          continue
        }
        // 定义一个空字符串变量list，用来保存格式化后的内容
        let list: string = `群组 ID：${id}\n`;

        // 使用for循环遍历result数组，获取每个对象的message属性
        for (let i = 0; i < result.length; i++) {
          // 使用slice方法截取message的前 100 个字符，如果不足 100 个字符，则保留原样
          let message = result[i].message.slice(0, 100);

          // 使用模板字符串将序号和message拼接成一行，并添加换行符
          let line = `${i + 1}. ${message}\n\n`;

          // 将line追加到list中
          list += line;
        }
        await session.send(list)
      }

    })
  // clear
  ctx.command('cwm.clear <eventName:string> <guildId:string>', '清理 msg')
    .option('force', '-f 强制全清')
    .action(async ({ options, session }, eventName: string, guildId: string) => {
      if (options.force) {
        await ctx.model.remove(Custom_Welcome_TABLE_ID, {})
        return msg.clearedForce
      }
      if (!eventName || !guildId) {
        return await session.execute(`cwm.clear -h`)
      }
      if (!['进群', '退群'].includes(eventName)) {
        return msg.invalidEvent;
      }
      // 用英文逗号或中文逗号分隔 guildId 字符串，并修剪所有空白
      let guildIds = guildId.split(/[,，]\s*/);
      // 在 guildId 数组中循环
      for (let id of guildIds) {
        if (id === '~') {
          id = session.guildId
        }
        // 添加一个判断条件，如果 id 不是一个有效的数字，就跳过这个循环
        if (isNaN(Number(id))) {
          continue
        }
        const result = await getTableContentByGuildId(ctx, id, eventName)
        const isExist = checkGuildExistence(result)
        if (!isExist) {
          continue
        }
        await ctx.model.remove(Custom_Welcome_TABLE_ID, { eventName: eventName, guildId: id })
      }
      await session.send(msg.cleared)
    })
  // test
  ctx.command('cwm.test <event:string>', '测试')
    .action(async ({ session }, event: string) => {
      if (!event) {
        return await session.execute(`cwm.test -h`)
      }
      // 定义一个对象，映射event和对应的事件名
      const eventMap = {
        '进群': 'guild-member-added',
        '退群': 'guild-member-deleted'
      };
      // 检查event是否在对象的键中
      if (event in eventMap) {
        // 如果是，根据event获取对应的事件名
        const eventName = eventMap[event];
        // 触发对应的事件，传入session作为参数
        session.app.emit(eventName, session as any);
      } else {
        // 如果不是，返回提示信息
        session.send(msg.invalidEvent);
      }
    });
}


function registerEventEmitter(ctx: Context) {
  const ADDED_ID = '进群'
  const DELETED_ID = '退群'
  // 核心

  // 进群
  ctx.on('guild-member-added', async (session) => {
    // 根据群组 ID 获取数据表内容
    const result = await getTableContentByGuildId(ctx, session.guildId, ADDED_ID)

    // 检查当前群组是否存在消息
    const isExist = checkGuildExistence(result)

    if (!isExist) {
      return
    }
    const newMsg = await regexReplace(ctx, session, result)
    await session.send(newMsg)
  })
  // 退群
  ctx.on('guild-member-deleted', async (session) => {

    // 根据群组 ID 获取数据表内容
    const result = await getTableContentByGuildId(ctx, session.guildId, DELETED_ID)

    // 检查当前群组是否存在欢迎消息
    const isExist = checkGuildExistence(result)
    if (!isExist) {
      return
    }
    const newMsg = await regexReplace(ctx, session, result)
    await session.send(newMsg)
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

async function getTableContentByGuildId(ctx: Context, guildId: string, eventName: string) {
  return await ctx.model.get(Custom_Welcome_TABLE_ID, { eventName: eventName, guildId: guildId })
}

// 定义一个异步函数，根据匹配的内容返回不同的变量
async function replacer(session: any, match: string) {
  switch (match) {
    // 进群
    case '《艾特被欢迎者》':
      return h.at(await session.userId);
    case '《被欢迎者ID》':
      return await session.userId;
    case '《被欢迎者名字》':
      return (await session.bot.getUser(session.userId)).username;
    case '《被欢迎者头像》':
      return h.image(await session.author.avatar);

    // 退群
    case '《艾特退群者》':
      return h.at(await session.userId);
    case '《退群者ID》':
      return await session.userId;
    case '《退群者名字》':
      return (await session.bot.getUser(session.userId)).username;
    case '《退群者头像》':
      return h.image(await session.author.avatar);

    // 群组信息
    case '《当前群组ID》':
      return await session.guildId; // 使用 await 关键字
    case '《当前群组名字》':
      return (await session.bot.getGuild(session.guildId)).guildName;
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

function replaceImagePath(str) {
  const regex = /《本地图片路径为([^》]*?)》/g;

  return str.replace(regex, (match, p1) => {
    let imagePath = p1;

    imagePath = path.resolve(imagePath);
    imagePath = path.normalize(imagePath);

    if (!fs.existsSync(imagePath)) {
      return match;
    }

    // 读取文件内容生成缓冲区
    const buffer = fs.readFileSync(imagePath);

    return `${h.image(buffer, 'image/png')}`;
  });
}


async function regexReplace(ctx: Context, session: Session<keyof User.Prelude, keyof Channel.Prelude>, result: any[]) {
  // 定义一个正则表达式，匹配所有需要替换的内容
  let regex = /《艾特被欢迎者》|《被欢迎者ID》|《被欢迎者名字》|《被欢迎者头像》|《当前群组ID》|《当前群组名字》|《艾特退群者》|《退群者ID》|《退群者名字》|《退群者头像》/g;

  // 假设msg是一个数组
  let msg = result[Math.floor(Math.random() * result.length)].message;

  let newMsg = '';
  let lastIndex = 0;

  // 使用循环找出所有的匹配项
  while (true) {
    const match = regex.exec(msg);
    if (!match) {
      // 没找到匹配项,添加剩余部分并退出循环
      newMsg += msg.slice(lastIndex);
      break;
    }

    // 添加前面未匹配的部分
    newMsg += msg.slice(lastIndex, match.index);

    // 调用替换函数处理匹配项
    newMsg += await replacer(session, match[0]);

    // 更新最后处理的位置
    lastIndex = regex.lastIndex;
  }

  // 定义一个正则表达式，匹配'《换行》'
  let regexWrap = /《换行》/g;

  // 使用replace方法，将匹配到的'《换行》'替换成'\n'
  newMsg = newMsg.replace(regexWrap, `\n`);
  newMsg = replaceImage(newMsg)
  newMsg = replaceImagePath(newMsg)
  return newMsg
}
