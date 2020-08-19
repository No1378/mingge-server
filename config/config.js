// 获取命令行的参数
let argv = require('yargs').argv;

module.exports = {
    "root": argv.root || process.cwd(),  // 网站根目录 没有指定使用命令所在的目录
    "port": argv.port || 8000, // 端口
    "cache-control": "max-age=0",  // 缓存控制
    "auto-open": true  // 是否自动打开浏览器
}