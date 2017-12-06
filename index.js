/**
 * reference:
 * 1. http://llever.com/2017/06/13/%E4%B8%AD%E9%97%B4%E4%BB%B6js%E5%AE%9E%E7%8E%B0/
 * 2. https://zhuanlan.zhihu.com/p/26063036
 */

const path = require('path'),
    spawn = require('cross-spawn'),
    git = require('simple-git'),
    SteamerPlugin = require('steamer-plugin');

let bindSerialTask = (runner, cmdArr) => (ctx, next) => {
    spawn.sync(runner, cmdArr, { stdio: 'inherit' });
    next && next();
}

class TaskPlugin extends SteamerPlugin {
    constructor(args) {
        super(args);
        this.argv = args;
        this.pluginName = 'steamer-plugin-task';
        this.description = 'run tasks parallelly or serially';
        this.git = git;
        this.spawn = spawn;
        this.middleware = [];
    }

    init(argv) {
        let argvs = argv || this.argv; // command argv

        // 如果配置不存在，则创建
        this.checkPluginConfig();
        
        argvs._.shift();
        let tasks = argvs._;

        if (!tasks.length) {
            return;
        }
        let task = tasks[0],
            config = this.readConfig();

        if (!config.hasOwnProperty(task)) {
            throw new Error(`The task '${task}' is not found.`);
        }

        this.processTask(config, task);
    }

    checkPluginConfig() {
        let configPath = path.join(process.cwd(), './.steamer/steamer-plugin-task.js');
        if (!this.fs.existsSync(configPath)) {
            this.createConfig({}, {
                overwrite: true
            });
        }
    }

    checkTaskFile(taskPath) {
        if (!this.fs.existsSync(taskPath)) {
            throw new Error(`${taskPath} is not found.`);
        }
    }

    processTask(config, task) {
        let taskFolderPath = path.join(process.cwd(), './.steamer/task/');
        
        if (this._.isArray(config[task])) {
            this.runSerialTask(config[task], taskFolderPath);
        }
        // Serially
        else if (this._.isObject(config[task])) {
            this.runParallelTask(config[task], taskFolderPath);
        }
    }

    getSerialTask(cmd, taskFolderPath) {
        if (!cmd.includes(' ')) {
            let taskPath = path.join(taskFolderPath, `${cmd}`);
            this.checkTaskFile(taskPath);
            cmd = require(taskPath);
        }
        else {
            let cmdArr = cmd.split(' '),
                runner = cmdArr.splice(0, 1);
            cmd = bindSerialTask(runner[0], cmdArr);
        }

        return cmd;
    }

    beforeSerialTask(ctx) {
        
    }

    use(task, taskName) {
        this.middleware.push({
            task,
            taskName
        });
    }

    run(ctx) {
        this.middleware.reverse().reduce((next, item) => {
            return () => {
                this.info(`start running task: ${item.taskName}`);
                item.task(ctx, () => {
                    next && next();
                });
            };
        }, this.beforeSerialTask(ctx))();
    }

    // []
    runSerialTask(tasks, taskFolderPath) {

        tasks.forEach((task, key) => {
            let cmd = task.trim();
            cmd = this.getSerialTask(cmd, taskFolderPath);
            this.use(cmd, task.trim());
        });

        this.run(this);
    }

    // {}
    runParallelTask(tasks, taskFolderPath) {
        Object.keys(tasks).forEach((key) => {
            let cmd = tasks[key].trim();

            if (!cmd.includes(' ')) {
                let taskPath = path.join(taskFolderPath, `${tasks[key]}`);
                this.checkTaskFile(taskPath);
                cmd = require(taskPath);
            }

            if (this._.isFunction(cmd)) {
                this.info(`start running task: ${tasks[key].trim()}`);
                cmd(this);
                this.info(`finishing task: ${tasks[key].trim()}`);
            }
            else if (this._.isString(cmd)) {
                let cmdArr = cmd.split(' '),
                runner = cmdArr.splice(0, 1);

                new Promise((resolve, reject) => {
                    this.info(`start running task: ${tasks[key].trim()}`);
                    let child = spawn(runner[0], cmdArr, { stdio: 'inherit' });
                    
                    child.on('exit', (code, signal) => {
                        if (!code) {
                            this.info(`finishing task: ${tasks[key].trim()}`);
                            resolve(code);
                        }
                    });

                    child.on('error', (err) => {
                        if (err) {
                            this.error(`task error: ${err}`);
                            reject(rer);
                        }
                    });
                });  
            }          
        });
    }

    help() {
        this.printUsage('run tasks parallelly or serially', 'task');
    }
}

module.exports = TaskPlugin;
