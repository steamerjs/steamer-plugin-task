const path = require('path');

module.exports = function(ctx, next) {
    ctx.git(process.cwd())
        .branchLocal((err, branches) => {
            err && ctx.error(err);
            ctx.currentBranch = branches.current;
        })
        .exec(() => {
            let jbConfig = require('../steamer-plugin-jb');
            let questions = [
                {
                    type: 'text',
                    message: 'Input your git commit  message',
                    name: 'msg',
                    default: 'update',
                }
            ];
            let RID = jbConfig.config.git[ctx.currentBranch];
        
            if (!RID) {
                questions.push({
                    type: 'text',
                    message: 'Input your JB RID',
                    name: 'jb',
                    default: '',
                });
            }
        
            let prompt = ctx.inquirer.createPromptModule();
            prompt(questions).then((answers) => {
                
                if (!RID) {
                    jbConfig.config.git[ctx.currentBranch] = answers.jb;
                    ctx.fs.writeFileSync(path.join(process.cwd(), '.steamer/steamer-plugin-jb.js'), `module.exports = ${JSON.stringify(jbConfig, null, 4)};`, 'utf-8');
                }

                ctx.git(process.cwd())
                    .commit(`${answers.msg}`, (err) => {
                        err && ctx.error(err);
                        !err && next();
                    });
            });
        });
};