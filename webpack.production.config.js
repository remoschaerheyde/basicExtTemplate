const path = require('path');
const packageDotJson = require('./package.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const extName = packageDotJson.name
const deploymentPath = path.resolve(`${process.env.USERPROFILE}/Documents/Qlik/Sense/Extensions/${extName}`);

module.exports = {
    mode: 'production',
    context: path.join(__dirname),
    entry:  path.resolve(__dirname, `./src/ts/extension.ts`),
    output: {
        filename: `extension.js`,
        path: deploymentPath,
        publicPath: `/sense/extensions/${extName}/`,
        libraryTarget: "umd"
    },
    externals: [
        { angular: 'angular' },
        { qvangular: 'qvangular' },
        { qlik: 'qlik' },
        { jquery: 'jquery' }
    ],
    plugins: [
        new CleanWebpackPlugin(deploymentPath, { allowExternal: true } ),
        new CopyWebpackPlugin([
            {from: `main.qext`, to: `${deploymentPath}/${extName}.qext`},
            {from: `main.js`, to: `${deploymentPath}/${extName}.js`},
            {from: `wbfolder.wbl`, to: `${deploymentPath}/wbfolder.wbl`}

        ]),
        new UglifyJsPlugin({
            //exclude: /\.min\.js$/gi,
            uglifyOptions: {
                mangle: true,
                comments: true,
                beautify: false,
                warnings: false,
                compress: {
                    drop_console: true
                }
            }
        })
    ],
    module: {
        rules: [
            { // TYPESCRIPT
                test: /\.tsx?$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname, `./src/ts`)]
            },
            { // TEMPLATES
                test: /text!.*\.html$/,
                use: "raw-loader",
                include: [path.resolve(__dirname, './src/templates')]
            },
            { // STYLES
                test: /\.scss$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    { loader: 'css-loader', options: { importLoaders: 2 } },
                    'postcss-loader',
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    resolveLoader: {
        alias: {
            'text': 'raw-loader',
            'css': 'css-loader'
            
        }
    }

}