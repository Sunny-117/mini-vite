## 预构建 实现思路
1. 在项目启动前分析依赖，找到三方包的依赖，然后进行预打包到node_modules/.vite/vue.js
2. 在返回main.js的时候，找到vue,替换成/node_modules/.vite/vue.js
3. 在客户端请求/node_modules/.vite/vue.js的时候，需要能返回对应的内容


刚才这个过程只是分析第三依赖，不需要写入文件系统

那这些模块那些要输出到硬盘那些不用呢？
是自己写的编译了就要输出到硬盘三方模块就直接去拿node_modules了吗？
是的
自己编译 好了，放在缓存目录
以事直接云缓存目录里拿 就可以，不再需要读取node_modules

获取vue路径时，前面不用加node_modules吗
main.js 重写导入的路径
import { createApp } from '/node_modules/.vite/vue.js?v=572b325e'
不太明白为啥把vue设置成外部模块
因为vue我们自己先预编译 处理好，不需要vite帮我们打包了

修改main.js里引入vue的那行代码了吗
             那这些模块那些要输出到硬盘那些不用呢？是自己写的编译了就要输出到硬盘三方模块就直接去拿node_modules了吗？




resolve.sync是干嘛的。require.resolve
即系一个文件路径的 
build是会从入口文件开始深度递归解析路径吗 是的
onResolve和onLoad是交叉执行的吗 是的
解析文件路径，读取文件内容
再找到这个文件内容里面的依赖的模块
再解析他们的路径，再读取他们的内容

我是指解释路径时 resolveId时，匹配到是第三方库时，拼凑成绝对路径时
好像没加node_modules
有写。resolve.sync获取vue的目录。然后下一步就是获取node_modules