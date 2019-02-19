const webpack = require('webpack')
const { resolve, join } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");//打包css
const CleanWebpackPlugin = require("clean-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const ROOT_PATH = join(__dirname);
const APP_PATH = join(ROOT_PATH, 'src');
const BUILD_PATH = join(ROOT_PATH, 'dist');
const env = process.env.NODE_ENV;

module.exports = {
    mode: env === 'production' ? 'production' : 'development',
    devtool: env === 'production' ? false : 'inline-source-map',
    entry: __dirname + "/src/index.js",
    output: {
        path:BUILD_PATH, //编译到当前目录
        filename: 'scripts/[id].chunk.js', //编译后的文件名字
        chunkFilename: 'scripts/[id].chunk.js',
    },
    devServer: {
        open:true,
        hot: true
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use:
                    env === 'production'
                        ? [MiniCssExtractPlugin.loader, 'css-loader?importLoaders=1', 'postcss-loader']
                        : [
                            'css-hot-loader',
                            MiniCssExtractPlugin.loader,
                            'css-loader?importLoaders=1',
                            'postcss-loader'
                        ]
            },
            {
                test: /\.css$/,
                include: [resolve('src')],
                use: ['css-hot-loader', 'style-loader', 'css-loader', 'postcss-loader']
            },
            {
                test:/\.(js|jsx)$/,
                loader: "babel-loader",
                include: [join(__dirname, 'src')]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [{
                    loader: 'url-loader',
                    options: { // 这里的options选项参数可以定义多大的图片转换为base64
                        limit: 50000, // 表示小于50kb的图片转为base64,大于50kb的是路径
                        outputPath: 'images' //定义输出的图片文件夹
                    }
                }]
            }]
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "css/[name].[hash:6].css",
        }),
        new HtmlWebpackPlugin({
            template: __dirname + "/public/index.html",
            inject: true, // 允许插件修改哪些内容，包括head与body
            hash: true // 为静态资源生成hash值
        })
    ],
    resolve: {
        modules: ['node_modules', join(__dirname, './node_modules')],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.less', '.scss', '.json'],
        alias: {
            components: resolve(APP_PATH, './components')
        }
    },
}
if (env === 'production') {
    module.exports.optimization = {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                    compress: true,
                    ecma: 6,
                    mangle: true
                },
                sourceMap: true
            })
        ]
    };
    module.exports.plugins = (module.exports.plugins || []).concat([
        new OptimizeCSSAssetsPlugin({}),
        new CleanWebpackPlugin([BUILD_PATH])
    ]);
}
