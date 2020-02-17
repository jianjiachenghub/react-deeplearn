## 目录结构


├──packages(带注释的React16.8源码来源[yck](https://github.com/KieSun/react-interpretation))

├── src

│   ├── index.js

│   ├── react

│   │   ├── component.js

│   │   ├── createElement.js

│   │   ├── enqueueSetState.js

│   │   └── index.js

│   └── react-dom

│       ├── diff-两颗虚拟树.js

│       ├── diff.js

│       ├── patch-差异更新到真实树.js

│       └── render.js

└── 学习笔记

├── [React-bable编译Jsx.md](https://github.com/jianjiachenghub/react-deeplearn/blob/master/学习笔记/React-bable编译Jsx.md)

├── [React-组件元素实例与Jsx语法.md](https://github.com/jianjiachenghub/react-deeplearn/blob/master/学习笔记/React-组件元素实例与Jsx语法.md)

├── [React15diff算法模拟实现.md](https://github.com/jianjiachenghub/react-deeplearn/blob/master/学习笔记/React15diff算法模拟实现.md)

├── [React15diff算法策略.md](https://github.com/jianjiachenghub/react-deeplearn/blob/master/学习笔记/React15diff算法策略.md)

├── [React15实现思路.md](https://github.com/jianjiachenghub/react-deeplearn/blob/master/学习笔记/React15实现思路.md)

├── [React16源码解析1-了解Fiber.md](https://github.com/jianjiachenghub/react-deeplearn/blob/master/学习笔记/React16源码解析1-了解Fiber.md)

├── [React16源码解析2-渲染帧与requestIdleCallback.md](https://github.com/jianjiachenghub/react-deeplearn/blob/master/学习笔记/React16源码解析2-渲染帧与requestIdleCallback.md)

├── [React16源码解析3-Scheduler任务调度器.md](https://github.com/jianjiachenghub/react-deeplearn/blob/master/学习笔记/React16源码解析3-Scheduler任务调度器.md)

├── [React16源码解析4-Render流程.md](https://github.com/jianjiachenghub/react-deeplearn/blob/master/学习笔记/React16源码解析4-Render流程.md)

├── [React16源码解析5-setState同步异步本质.md](https://github.com/jianjiachenghub/react-deeplearn/blob/master/学习笔记/React16源码解析5-setState同步异步本质.md)

└── [React16源码解析6-Fiber链式diff算法.md](https://github.com/jianjiachenghub/react-deeplearn/blob/master/学习笔记/React16源码解析6-Fiber链式diff算法.md)


## 说明

这是一个用来深入学习react源码和模拟实现部分react的项目，仅供学习使用，网上有很多源码的分析文章但是都说的不大全面，只看一两篇的话很难理清Fiber架构，这里的部分笔记和代码是对很多优秀文章的总结，部分并非原创，有的地方仅仅是个人理解和总结（不一定是准确的），未证实的地方做了标记。

## 以下是参考文章



React16源码解析(二)-创建更新 - 个人文章 - SegmentFault 思否


React Fiber源码分析 第一篇 - 个人文章 - SegmentFault 思否


React16源码解读：揭秘ReactDOM.render - 掘金


React16源码解读：开篇带你搞懂几个面试考点 - 掘金

剖析 React 源码：render 流程（一） | 前端进阶之道

React@16.8.6原理浅析（源码浅析） - 掘金


React16源码之React Fiber架构 - 掘金


react fiber 主流程及功能模块梳理 - 掘金


这可能是最通俗的 React Fiber(时间分片) 打开方式 - 掘金


React diff原理探究以及应用实践 - 个人文章 - SegmentFault 思否


react的diff 从O(n^3)到 O(n) ，请问 O(n^3) 和O(n) 是怎么算出来？ - 知乎


谈谈React中Diff算法的策略及实现 - SegmentFault 思否


react diff算法 - 个人文章 - SegmentFault 思否


让虚拟DOM和DOM-diff不再成为你的绊脚石 - 掘金





