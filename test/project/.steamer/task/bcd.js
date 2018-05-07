

module.exports = function(ctx, next) {
    setTimeout(() => {
        ctx.log('bcd');
        next();
    }, 1000);
};