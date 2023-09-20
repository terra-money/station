module.exports = {
    babel: function (config, env) {
        console.log(config)
        config.plugins.push(['@babel/plugin-transform-private-property-in-object']);
        config.plugins.push(['@babel/plugin-transform-optional-chaining']);
        config.plugins.push(['@babel/plugin-proposal-private-property-in-object']);
        config.plugins.push(['@babel/preset-env']);
        return config;
    }
}