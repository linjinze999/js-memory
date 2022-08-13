---
home: true
heroImage: /hero.png
heroText: js-memory
tagline: 用于分析JS引擎生成的内存文件。
footer: MIT Licensed | Copyright © 2022 linjinze999
---

<el-row :gutter="20">
<el-col :span="12" class="hero">
<el-card>
<div slot="header">
<span style="font-size: 1.5rem;font-weight: bold;">V8(Chrome)</span>
</div>
<div>
<div>解析V8（Chrome）生成的堆内存（heapsnapshot、heaptimeline、heapprofile）。</div>
<br/>
<a href="./V8/snapshot/statistics" class="nav-link action-button">分析 V8</a>
</div>
</el-card>
</el-col>
<el-col :span="12" class="hero">
<el-card>
<div slot="header">
<span  style="font-size: 1.5rem;font-weight: bold;">JSC(Safari)</span>
</div>
<div>
<div>解析JSC（Safari）生成的堆内存（json）。</div>
<br/>
<a href="./JSC/" class="nav-link action-button">分析 JSC</a>
</div>
</el-card>
</el-col>
</el-row>


在线地址：[https://linjinze999.github.io/js-memory/](https://linjinze999.github.io/js-memory/)

源码地址：[https://github.com/linjinze999/js-memory](https://github.com/linjinze999/js-memory)
