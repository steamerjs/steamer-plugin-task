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