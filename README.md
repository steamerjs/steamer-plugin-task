# steamer-plugin-task

## 任务配置
```javascript
// 自动生成配置
steamer task

// .steamer/steamer-plugin-task.js
module.exports = {
    "plugin": "steamer-plugin-task",
    "config": {
        // 用对象写法是并行运行命令
        "dev": {
            0: "steamer list",
            1: "cde.js",
        },
        // 用数组写法是串行运行命令
        "dist": [
            "steamer kit -l",
            "bcd.js",
            "abc.js"
        ]
    }
};

// .steamer/task
task
 |-- abc.js
 |-- bcd.js
 |-- cde.js
 |-- def.js

// 并行任务
// cde.js
module.exports = function (ctx) {
    console.log('cde');
};

// def.js
module.exports = function (ctx) {
    console.log('def');
};

// 串行任务
// bcd.js
module.exports = function(ctx, next) {
    console.log('bcd');
    next();
};

// abc.js, 最后一个任务无须执行next
module.exports = function(ctx) {
    console.log('abc');
};

```

## 并行或串行运行任务
```javascript
// 并行运行 dev 的命令
steamer task dev
start running task: steamer list
start running task: cde.js
// output from node cde.js
finishing task: cde.js
// output from steamer list
finishing task: steamer list

// 串行运行 dist 的命令
start running task: steamer kit -l
// output from steamer list
steamer task dist
start running task: bcd.js
// 1 second later
// output from node bcd.js
start running task: abc.js
// out from node abc.js
```

