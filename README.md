# Pomment Frontend v3

评论系统 Pomment 的官方访客前端（客户端）。该组件基于 [ef.js](https://ef.js.org) 实现，可单独使用或用于已有的 ef.js 项目中。

## 安装

### 直接引用到已有页面中

```html
<script src="pomment-frontend.min.js"></script>
<script>
var plugin = new PommentWidget({
    // ...
});
plugin.$mount({
    target: document.getElementById("main"), // 要将挂件插入到哪个元素中？
});
plugin.load();
</script>
```

### 引用到其它 ef.js 项目中

```bash
npm install pomment-frontend
```

```javascript
import PommentWidget from 'pomment-frontend';

const plugin = new PommentWidget({
    // ...
});
someElement.comment = plugin;
```

## 配置项

```javascript
const plugin = new PommentWidget(props);
```

`props` 是一个 object，可用键值如下：

| 值名 | 类型 | 介绍 | 必须项 |
| - | - | - | - |
| `server` | string | Pomment 服务器地址 | 是 |
| `url` | string | 本页 URL。如果不指定，则依次尝试读取 [Canonical link element](https://en.wikipedia.org/wiki/Canonical_link_element) 值和该页面实际 URL | 否 |
| `title` | string | 本页标题。如果不指定，则默认使用在 `<title>` 标签中指定的标题 | 否 |
| `adminName` | string | 管理员昵称（用于统一拥有 `byAdmin` 属性的评论的评论者信息） | 否 |
| `adminAvatar` | string | 管理员头像 URL（用于统一拥有 `byAdmin` 属性的评论的评论者信息） | 否 |
| `fixedHeight` | number | 页面已有的固定导航栏高度（单位为像素） | 否 |
| `avatarPrefix` | string | Gravatar 服务器地址，以 `/` 结尾。如 `https://secure.gravatar.com/avatar/` | 否 |
| `reCAPTCHA` | string | reCAPTCHA v3 网站密钥。如果留空，则不启用 reCAPTCHA 模式 | 否 |
| `showReceiveEmail` | boolean | 展示『发送邮件提醒』选项。如果设置隐藏，则访客提交的评论均默认为不展示 | 否 |

## 编译

```bash
npm run build
```

编译得到的 css 与 js 将出现在 dist 目录下。
