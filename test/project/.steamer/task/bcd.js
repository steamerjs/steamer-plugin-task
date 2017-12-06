

module.exports = function(ctx, next) {
    setTimeout(() => {
        console.log('bcd');
        next();
    }, 1000);
};