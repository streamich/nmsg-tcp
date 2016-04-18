var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');


module.exports = {
    entry: {
        app: './tcp'
    },
    output: {
        path: './dist',
        filename: 'webpack.js'
    },
    resolve: {
        extensions: ['.js']
    },
    target: 'node', // in order to ignore built-in modules like path, fs, etc.
    externals: [nodeExternals()] // in order to ignore all modules in node_modules folder
};
