# js-memory

## 简介
分析JS内存。

在线地址：[https://linjinze999.github.io/js-memory/](https://linjinze999.github.io/js-memory/)

> 源码地址：[https://github.com/linjinze999/js-memory](https://github.com/linjinze999/js-memory)

## 使用

1. 安装：`npm install js-memory`
2. 使用：
``` js
import { V8Snapshot } from "js-memory";

const snapshot = new V8Snapshot({text: "heapsnapshot文件内容"});
const statistics = snapshot.calculateStatistics();
```

## 开发
``` shell
npm install
npm run dev
```

## 备注
参考：[devtools-frontend](https://github.com/ChromeDevTools/devtools-frontend)
