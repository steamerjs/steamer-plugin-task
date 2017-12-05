# steamer-plugin-task

## 任务配置
```javascript
// .steamer/steamer-plugin-task.js
module.exports = {
    "plugin": "steamer-plugin-task",
    "config": {
        "dev": {
            0: "steamer list",
            1: "abc.js",
        },
        "dist": [
            "steamer kit -l",
            "abc.js"
        ]
    }
};

// .steamer/task
task
 |-- abc.js
 |-- cdf.js

// 并行运行 dev 的命令
steamer task dev
start running task: steamer list
start running task: abc.js
// output from node abc.js
finishing task: abc.js
// output from steamer list
finishing task: steamer list

// 串行运行 dist 的命令
steamer task dist
start running task: steamer kit -l
// output from steamer list
finishing task: steamer kit -l
start running task: abc.js
// output from node abc.js
finishing task: abc.js
```

