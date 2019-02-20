const webpack = require('webpack')
const { resolve, join } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");//打包css
const CleanWebpackPlugin = require("clean-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const { getIfUtils, removeEmpty } = require('webpack-config-utils')
const { ifProduction, ifNotProduction } = getIfUtils(process.env.NODE_ENV)

const ROOT_PATH = join(__dirname);
const APP_PATH = join(ROOT_PATH, 'src');
const BUILD_PATH = join(ROOT_PATH, 'dist');

module.exports = {
    mode: ifProduction('production','development'),
    devtool: 'inline-source-map',
    entry: __dirname + "/src/index.js",
    output: {
        path:BUILD_PATH, //编译到当前目录
        chunkFilename: ifProduction('scripts/[id].[contenthash].js', 'scripts/[name].js'),
        filename: ifProduction('scripts/bundle.js?v=[hash]', 'scripts/bundle.js')
    },
    resolve: {
        modules: ['node_modules', join(__dirname, './node_modules')],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.less', '.scss', '.json'],
        alias: {
            components: resolve(APP_PATH, './components')
        }
    },
    devServer: {
        open:true,
        hot: true
    },
    module: {
        rules: [
            // {
            //     test: /\.jsx?$/,
            //     loader: 'eslint-loader',
            //     enforce: 'pre',
            //     exclude: resolve(__dirname, 'node_modules')
            // },
            {
                test: /\.jsx?$/,
                exclude: resolve(__dirname, 'node_modules'),
                loader: 'babel-loader'
            },
            {
                test: /\.(sc|c)ss$/,
                exclude: /node_modules/,
                use: removeEmpty([
                    ifProduction(MiniCssExtractPlugin.loader),
                    ifNotProduction({loader: 'style-loader', options: {sourceMap: true}}),
                    {loader: 'css-loader', options: {sourceMap: true}},
                    {loader: 'postcss-loader', options: {sourceMap: true}},
                    {loader: 'sass-loader', options: {sourceMap: true}},
                ]),
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.(ttf|eot|otf|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: 'url-loader',
                options: {
                    limit: 1024,
                    name: 'fonts/[name].[ext]'
                }
            },
            {
                test: /\.(ico|png|jpg|svg|gif)$/,
                loader: 'url-loader',
                options: {
                    limit: 10240,
                    name: 'images/[name].[ext]?v=[hash:base64:5]'
                }
            }]
    },
    plugins: removeEmpty([
        ifNotProduction(new webpack.NamedModulesPlugin()),
        ifNotProduction(new webpack.HotModuleReplacementPlugin()),
        ifProduction(new OptimizeCSSAssetsPlugin({})),
        ifProduction(new CleanWebpackPlugin([BUILD_PATH])),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
                APP_ENV: JSON.stringify(process.env.APP_ENV || 'production')
            }
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "css/[name].[hash:6].css",
        }),
        new HtmlWebpackPlugin({
            template: __dirname + "/public/index.html",
            inject: true, // 允许插件修改哪些内容，包括head与body
            hash: true // 为静态资源生成hash值
        })
    ]),
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: {
                        warnings: false,
                        screw_ie8: true,
                        conditionals: true,
                        unused: true,
                        comparisons: true,
                        sequences: true,
                        dead_code: true,
                        evaluate: true,
                        if_return: true,
                        join_vars: true
                    },
                    mangle: true,
                    output: { comments: false }
                }
            }),
        ]
    }
}
