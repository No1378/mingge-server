//导入模块
const http = require('http');
const urlTool = require('url');
const fs = require('fs');
const zlib = require('zlib');
const etag = require('etag');
const _ = require('lodash');
const ejs = require('ejs');
const config = require('./config/config');  // 获取配置文件

// 封装一个类
class Server {
    constructor(custom) {
        // 合并对象
        Object.assign(config, custom);
    }

    main() {
        // 创建 http 服务
        const server = http.createServer((request, response) => {
            // 获取url中的路径部分
            let pathname = urlTool.parse(request.url, true).pathname;
            // 设置网站的根目录
            //let documentRoot = __dirname + '/public';
            let documentRoot = config['root'];
            // 拼接静态文件路径
            let filename = decodeURI(documentRoot + pathname);

            // 读取文件状态
            fs.stat(filename, (err, stats) => {
                // 判断，如果错误，报 404 错误
                if (err) {
                    response.statusCode = 404;
                    response.setHeader('Content-Type', 'text/html;charset=utf-8');
                    response.end('<h1>404 Not Found</h1>');
                    return;
                }

                //协商缓存的相关判断
                //获取当前资源的 etag 值
                let tag = etag(stats);
                // 获取文件的左后修改时间
                let lastModified = stats.mtime.toUTCString();
                // 与请求头进行对比，看是否调用缓存
                if (request.headers['if-none-match'] === tag && request.headers['if-modified-since'] === lastModified) {
                    //返回304
                    response.statusCode = 304;
                    // 响应个空的
                    return response.end('');
                }

                //判断是否是文件夹
                if (stats.isDirectory()) {
                    // 读取文件夹中的内容
                    fs.readdir(filename, (err, data) => {
                        // response.setHeader('content-type', 'text/html;charset=utf-8');
                        // let body = '<ul>';
                        // data.forEach((item) => {
                        //     body += `<li><a href="${_.trimEnd(pathname, '/')}/${item}">${item}</a></li>`;
                        // });
                        // body += '</ul>';
                        // console.log(_.trimEnd(pathname, '/'));
                        // response.end(body);
                        
                        // 以模板的形式显示目录
                        let pathname2 = _.trimEnd(pathname, '/');
                        ejs.renderFile(__dirname + '/views/directory.html', {
                            dirList:data,
                            pathname: pathname2,
                            title: 'Index of ' + decodeURI(pathname2)
                        }, (err, content) => {
                            if (err) {
                                console.log(err);
                                //响应错误
                                return response.end('Server Internal Error');
                            }
                            // 响应内容
                            response.end(content);
                        })
                    })
                } else {
                    // 设置强制缓存
                    response.setHeader('Cache-Control', config['cache-control']);
                    // 设置协商缓存
                    //设置响应头
                    response.setHeader('Etag', tag);
                    response.setHeader('Last-Modified', lastModified);

                    //读取文件后缀
                    let suffix = pathname.split('.').pop();
                    // 获取所有的 mimes 类型
                    let mimes = require('./mimes/mimes.json');
                    // 如果存在对应的类型，就设置响应的响应类型，否则 text/plain
                    if (mimes[suffix]) {
                        response.setHeader('Content-Type', mimes[suffix]);
                    } else {
                        response.setHeader('Content-Type', 'text/plain;charset=utf-8');
                    }

                    // 读取静态文件
                    fs.readFile(filename, (err, data) => {
                        if (err) {
                            console.log(err);
                            //响应错误
                            return response.end('Server Internal Error');
                        }
                        //对内容进行压缩
                        // 获取请求头信息，看浏览器能够解压那些格式
                        let encodings = request.headers['accept-encoding'];
                        // 判断是否支持 gzip 压缩
                        if (encodings.indexOf('gzip') >= 0) {
                            //设置响应头
                            response.setHeader('content-encoding', 'gzip');
                            // 进行gzip 压缩
                            zlib.gzip(data, (err, data) => {
                                // 响应静态文件内容
                                response.end(data);
                            });
                        } else if (encodings.indexOf('deflate') >= 0) {
                            //设置响应头
                            response.setHeader('content-encoding', 'deflate');
                            //进行 flate 压缩
                            zlib.deflate(data, (err, data) => {
                                // 响应静态文件内容
                                response.end(data);
                            })
                        } else {
                            // 不进行压缩了
                            response.end(data);
                        }
                    });
                }  
            });

        
            
        });

        // 启动 http 服务
        server.listen(config['port'], () => {
            console.log(`HTTP 服务已经启动，${config['port']} 端口监听中...`);
            //如果自动打开
            if (config['auto-open']) {
                const opn = require('better-opn'); // 引入 better-opn
                opn(`http://127.0.0.1:${config['port']}`);
            }
        })
    }
}

// 暴露模块
module.exports = Server;

