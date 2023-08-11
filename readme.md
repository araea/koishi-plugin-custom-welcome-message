# koishi-plugin-custom-welcome-message

[![npm](https://img.shields.io/npm/v/koishi-plugin-custom-welcome-message?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-custom-welcome-message)

## 🎈 介绍

这是一个 Koishi 插件，用于在群组中发送自定义的 欢迎/离开 消息。您可以为不同的群组设置不同的 欢迎/离开 消息，并使用一些变量来替换成员或群组的信息。您还可以使用图片 URL 来发送图片。

## 🚀 特性

* 🌈 可以为同一个 `guildId` 添加多个 `message`，并进行随机选择。
  
## 📦 安装

```
前往 Koishi 插件市场添加该插件即可
```

## ⚙️ 配置

```
暂无配置项
```
## 🎮 使用

- 这是一个自定义 欢迎/离开 消息插件,有以下两种使用方法：

  - 直接在数据表 `custom_welcome_table` 中插入 `message` 字段。

  - 使用下面的命令。
  

### 📝 命令

这个插件提供了以下几个命令：

- `cwm`：查看 customWelcomeMessage 插件帮助。

- `cwm.add <eventName> <guildId> <message>`：添加 欢迎/离开 消息。

  - `eventName` 为 "进群" 或 "退群"。

  - `guildId` 为群组 ID，多个 ID 用英文逗号或中文逗号分割，使用 `~` 默认指代当前群组 ID。

  - `message` 为 欢迎/离开 消息文本。

- `cwm.view <eventName> <guildId>`：查看指定群组的 欢迎/离开 消息。

- `cwm.clear <eventName> <guildId>`：清空指定群组的 欢迎/离开 消息。
  
  - `cwm.clear -f`：强制清空所有消息，慎用！（建议为该选项设置使用权限）

- 小提示：以上所有命令中的 `guildId` 都可以使用多个用英文逗号或中文逗号分割，也都可以使用 `~` 默认指代当前群组 ID。

## 🔮 变量

消息文本中可以使用以下变量,发送时会替换为对应内容：

- `《艾特被欢迎者》`：艾特加入者(进群)

- `《被欢迎者ID》`：加入者 ID(进群)

- `《被欢迎者名字》`：加入者 名字(进群)  

- `《被欢迎者头像》`：加入者 头像(进群)

- `《当前群组ID》`：当前群组 ID

- `《当前群组名字》`：当前群组 名称

- `《艾特退群者》`：艾特离开者(退群)

- `《退群者ID》`：离开者 ID(退群)

- `《退群者名字》`：离开者 名字(退群)

- `《退群者头像》`：离开者 头像(退群)

- `《一言》`：随机一言

- `《换行》`：换行符


### 🎨 图片

还可以在消息中使用图片 URL 或本地图片：

- `《图片url为http://或https://...》`：图片 URL （可以是图片的 API 链接）

- `《本地图片路径为/path/to/image》`：本地图片路径
  
例如：

- `《图片url为https://th.bing.com/th/id/OIP.Jmx7AEaJvhyuTiW29wRRIAHaHa?w=182&h=182&c=7&r=0&o=5&dpr=1.3&pid=1.7》`

- `《本地图片路径为C:\Users\114514\Pictures\Nawyjx.jpg》` - (Windows)

- `《本地图片路径为home/akisa/koishi/data/suchat/image/1.jpeg》` - (Linux)


### 🎲 示例

欢迎消息示例：

- `欢迎《艾特被欢迎者》加入《当前群组名字》!` 

- `《被欢迎者头像》《换行》Hi，《被欢迎者名字》!《换行》欢迎加入《当前群组名字》!`

- `《被欢迎者头像》《换行》Hi, 《被欢迎者名字》！《换行》Welcome to 《当前群组名字》！`

离开消息示例：

- `《艾特退群者》离开了《当前群组名字》，挥一挥手说再见吧!`

## 🙏 致谢

* [Koishi](https://koishi.chat/)：机器人框架
* [Akisa](https://forum.koishi.xyz/t/topic/4149)：嗯~

## 📄 License

MIT License © 2023