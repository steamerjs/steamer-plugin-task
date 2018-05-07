const path = require('path'),
	  os = require('os'),
	  fs = require('fs-extra'),
	  expect = require('expect.js'),
      sinon = require('sinon'),
      cp = require('child_process'),
	  spawnSync = cp.spawnSync,
      SteamerTask = require('../index');
      
const CUR_ENV = process.cwd();
const TEST = path.join(process.cwd(), 'test');;
const PROJECT = path.join(process.cwd(), 'test/project');


describe('help', function() {

    it('help', function() {
        let task = new SteamerTask({
            help: true
        });

        let printUsageStub = sinon.stub(task, 'printUsage');

        task.help();

        expect(printUsageStub.calledWith('run tasks parallelly or serially', 'task')).to.eql(true);
        expect(printUsageStub.calledOnce).to.eql(true);

        printUsageStub.restore();
    });

});

describe('add', function() {
    it('task', function() {
        let task = new SteamerTask({
            add: 'alloyteam'
        });

        let existCount = 0;
        let existsSyncStub = sinon.stub(task.fs, 'existsSync').callsFake((taskPath) => {
            // console.log(taskPath, taskPath.includes('steamer-plugin-task.js'));
            if (!existCount && taskPath.includes('node_modules/steamer-task-alloyteam')) {
                existCount++;
                return false;
            }
            return true;
        });
        let spawnSyncStub = sinon.stub(task.spawn, 'sync').callsFake((npm, cmds, options) => {
            expect(npm).to.eql('npm');
            expect(cmds).to.eql(['install', '--global', 'steamer-task-alloyteam']);
        });

        let copyCount = 0;
        let coppySyncStub = sinon.stub(task.fs, 'copySync').callsFake((src, dest) => {
            if (!copyCount) {
                expect(src.includes('.steamer/steamer-plugin-jb.js')).to.eql(true);
            }
            else if (copyCount === 1) {
                expect(src.includes('.steamer/steamer-plugin-task.js')).to.eql(true);
            }
            else if (copyCount === 2) {
                expect(src.includes('.steamer/task')).to.eql(true);
            }
            copyCount++;
        });
        let infoStub = sinon.stub(task, 'info');
        let successStub = sinon.stub(task, 'success');

        task.init({
            _: [],
            add: 'alloyteam'
        });

        expect(infoStub.calledWith('Installing steamer-task-alloyteam')).to.eql(true);
        expect(infoStub.calledWith('steamer-task-alloyteam installed')).to.eql(true);
        expect(successStub.calledWith('Task installed success')).to.eql(true);

        existsSyncStub.restore();
        spawnSyncStub.restore();
        coppySyncStub.restore();
        infoStub.restore();
        successStub.restore();
    });
});

describe('run task', function() {

    before(() => {
        process.chdir(PROJECT);
    });

    it('parallel', function(done) {
        this.timeout(3000);

        let task = new SteamerTask({
            _: ['task', 'dev']
        });

        let logStub = sinon.stub(task, 'log');
        let infoStub = sinon.stub(task, 'info');
        let spawnStub = sinon.stub(task, 'spawn').callsFake((npm, cmds, options) => {
            expect(npm).to.eql('steamer');
            expect(cmds).to.eql(['list']);

            return {
                on(evt, cb) {
                    if (evt === 'exit') {
                        cb && cb(0);
                    }
                    else if (env === 'error') {
                        cb && cb(null);
                    }
                }
            }
        });


        task.init({
            _: ['task', 'dev']
        });

        expect(infoStub.calledWith('start running task: steamer list')).to.eql(true);
        expect(infoStub.calledWith('start running task: cde.js')).to.eql(true);
        expect(logStub.calledWith('cde')).to.eql(true);
        expect(infoStub.calledWith('finishing task: cde.js')).to.eql(true);
        expect(infoStub.calledWith('finishing task: steamer list')).to.eql(true);
        

        logStub.restore();
        infoStub.restore();
        spawnStub.restore();

        done();
    });

    it('serial', function(done) {
        this.timeout(3000);

        let task = new SteamerTask({
            _: ['task', 'dist']
        });

        let logStub = sinon.stub(task, 'log');
        let infoStub = sinon.stub(task, 'info');
        let spawnStub = sinon.stub(task.spawn, 'sync').callsFake((npm, cmds, options) => {
            expect(npm).to.eql('steamer');
            expect(cmds).to.eql(['kit', '-l']);
        });


        task.init({
            _: ['task', 'dist']
        });

        expect(infoStub.calledWith('start running task: steamer kit -l')).to.eql(true);
        expect(infoStub.calledWith('start running task: bcd.js')).to.eql(true);
        
        setTimeout(() => {
            expect(logStub.calledWith('bcd')).to.eql(true);
            expect(infoStub.calledWith('start running task: abc.js')).to.eql(true);
            expect(logStub.calledWith('abc')).to.eql(true);

            logStub.restore();
            infoStub.restore();
            spawnStub.restore();

            done();
        }, 1000)
        
        
    });
});