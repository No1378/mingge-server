# mingge-sever

node 做的静态资源服务器

## 使用方式

#### 1. 安装

```
npm install mingge-server
```

#### 2. 使用

```
// 引入模块
const Server = require('mingge-server');

// 实例化
const server = new Server({
	root: '',  //设置根目录，如果不设置就是该文件所在目录
	port: 8000  // 设置端口号，默认 8000
});

// 开启服务
server.main();
```

#### 3. 配置文件

config 目录下的 config.js 文件是配置文件，也可以在这里指定根目录、端口号以及缓存的控制方式等。

## 全局使用方式

#### 1. 安装

```
npm install mingge-server -g
```

#### 2. 命令行运行

```
mingge-server
```

#### 3. 指定参数

运行 `mingge-server` 的时候也可以指定命令

```
mingge-server --port 8000

ming-server --root /www -port 8080
```

