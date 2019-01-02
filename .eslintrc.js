module.exports = {
    "extends": "airbnb-base",
    "rules": {
        "no-underscore-dangle": ["error", {
            "allowAfterThis": true,
        }],
        "indent": ["error", 4, {
            "SwitchCase": 1
        }],
        "prefer-destructuring": "off",
        "no-console": "off",
        "no-param-reassign": "off"
    },
    "env": {
        "browser": true
    }
};
