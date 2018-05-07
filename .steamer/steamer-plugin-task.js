let dev = [
        'npm start'
    ],
    dist = [
        'npm run lint',
        'npm run dist',
        'git add --all',
        'git-commit.js',
        'git-pull.js',
        'git-push.js',
        'steamer jb --run',
    ];

module.exports = {
    "plugin": "steamer-plugin-task",
    "config": {
        "start": dev,
        "s": dev,
        "dist": dist,
        "d": dist,
    }
};