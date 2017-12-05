'use strict';

const path = require('path'),
    spawn = require('cross-spawn'),
    SteamerPlugin = require('steamer-plugin');

class TaskPlugin extends SteamerPlugin {
    constructor(args) {
        super(args);
        this.argv = args;
        this.pluginName = 'steamer-plugin-task';
        this.description = 'run tasks parallelly or serially';
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

    // []
    runSerialTask(tasks, taskFolderPath) {
        let taskArr = [];

        tasks.forEach((task) => {
            let cmd = task.trim();

            if (!cmd.includes(' ')) {
                let taskPath = path.join(taskFolderPath, `${task}`);
                this.checkTaskFile(taskPath);
                cmd = `node ${taskPath}`;
            }

            let cmdArr = cmd.split(' '),
                runner = cmdArr.splice(0, 1);

            this.info(`start running task: ${task.trim()}`);
            spawn.sync(runner[0], cmdArr, { stdio: 'inherit' });
            this.info(`finishing task: ${task.trim()}`);

        });
    }

    // {}
    runParallelTask(tasks, taskFolderPath) {
        Object.keys(tasks).forEach((key) => {
            let cmd = tasks[key].trim();

            if (!cmd.includes(' ')) {
                let taskPath = path.join(taskFolderPath, `${tasks[key]}`);
                this.checkTaskFile(taskPath);
                cmd = `node ${taskPath}`;
            }

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
        });
    }

    help() {
        this.printUsage('run tasks parallelly or serially', 'task');
    }
}

module.exports = TaskPlugin;
