module.exports = {
    "plugin": "steamer-plugin-task",
    "config": {
        "dev": {
            0: "steamer list",
            1: "cde.js",
        },
        "dist": [
            "steamer kit -l",
            "bcd.js",
            "abc.js"
        ]
    }
};