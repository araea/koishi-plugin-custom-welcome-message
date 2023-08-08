# koishi-plugin-custom-welcome-message

[![npm](https://img.shields.io/npm/v/koishi-plugin-custom-welcome-message?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-custom-welcome-message)

## 🎈 介绍

这是一个 Koishi 插件，用于在群组中发送自定义的欢迎消息。您可以为不同的群组设置不同的欢迎消息，并使用一些变量来替换成员或群组的信息。您还可以使用图片 URL 来发送图片。

## 🚀 特性

* 🌈 可为同一 `guildId` 添加多个 `message`，会随机选择
* 🎁 随开随用，操作简单
  
## 📦 安装

```
前往 Koishi 插件市场添加该插件即可
```

## ⚙️ 配置

```
暂无配置项
```

## 🎮 使用

- 两种使用方法
  - 直接在数据表 `custom_welcome_table` 中插入 `message`
  - 使用下面的命令（需要自行设置指令别名）

### 📝 命令

这个插件提供了以下几个指令：

- `cwm`：查看 customWelcomeMessage 帮助。
- `cwm.add <guildId:string> <message:text>`：添加欢迎消息。支持多个 guildId 的输入，只要用逗号隔开就行了。
- `cwm.view <guildId:string>`：查看欢迎消息。
- `cwm.clear <guildId:string>`：一键清理欢迎消息。

## 🔮 变量

您可以在欢迎消息中使用以下变量，它们会在发送时被替换成相应的内容：

- `《艾特被欢迎者》`：被欢迎者的艾特。
- `《被欢迎者ID》`：被欢迎者的 ID。
- `《被欢迎者名字》`：被欢迎者的名字。
- `《被欢迎者头像》`：被欢迎者的头像。
- `《当前群组ID》`：当前群组的 ID。
- `《当前群组名字》`：当前群组的名字。
- `\n`：换行符。

## 🎨 图片

您还可以在欢迎消息中使用图片 URL 或本地图片路径来发送图片，格式如下：

- `《图片url为http://或https://...(此处已经省略url链接地址)》`
- `《本地图片路径为(.*?)》`

例如：

- `《图片url为https://i.imgur.com/abc.jpg》`
- `《本地图片路径为C:\Users\114514\Pictures\Nawyjx.jpg》`

请注意，图片 URL 必须以 http:// 或 https:// 开头，并且必须是有效的图片地址。否则，将无法发送图片。

## 🎲 示例

以下是一些欢迎消息的示例：

- `欢迎 《艾特被欢迎者》 加入 《当前群组名字》！`
- `《被欢迎者名字》 您好，感谢您加入 《当前群组名字》！`
- `《图片url为https://i.imgur.com/xyz.png》\nHi, 《被欢迎者名字》！Welcome to 《当前群组名字》！`

### 🙏 致谢

* [Koishi](https://koishi.chat/)：机器人框架
* [Akisa](https://forum.koishi.xyz/t/topic/4149)：嗯~

## 📄 License

MIT License © 2023