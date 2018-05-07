

module.exports = function(ctx, next) {
    ctx.git(process.cwd())
        .push('origin', ctx.currentBranch, (err) => {
            err && ctx.error(err);
            !err && next();
        });
};