const path = require('node:path');
const mergeConfig = require('./webpack.common');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = mergeConfig({
  mode: 'development',
  devServer: {
    static: { // 指定服务器文件基础的目录
      directory: path.join(__dirname, 'dist'),
    },
    proxy: {
      '/api': {
        // target: 'http://127.0.0.1:8082',
        target: 'https://sfm.kk1.fun',
        // pathRewrite: { '^/api': '/' },
        changeOrigin: true,
      }
    },
    port: 9092, // 指定服务端口
    hot: true, // 使用热更新
  },
  devtool: 'source-map', // 便于代码调试
  performance: {
    maxEntrypointSize: 1024 * 1024 * 1, // 设置最大入口文件的大小，超出会警告
    maxAssetSize: 1024 * 1024 * 1 // 设置最大资源文件的大小，超出会警告
  }
});

config.module.rules.push({
  test: /\.css$/,
  use: [
    'css-loader',
  ],
  // 在package.json中如果错误设置sideEffects为false，webpack在打包时会认为整个项目都是无副作用的
  // 部分三方库会错误设置sideEffects参数，此时如果引入其中的css文件import xxx/xxx.css会出现问题
  // 由于没有在js代码中使用引入的css文件，webpack会认为这个模块的引入是可以忽略的（因为该库被声明为无副作用）
  // 这样就会导致css文件不会被打包，从而导致样式丢失
  // See https://github.com/webpack/webpack/issues/6571
  sideEffects: true,
});

config.plugins.push(
  new HtmlWebpackPlugin({ // 如果是多页面应用可以添加多个HtmlWebpackPlugin
    template: path.resolve(__dirname, '..', 'dev', 'index.html'), // 指定模板html文件名称
    filename: 'index.html', // 指定生成的html文件名称
    inject: 'body', // 将js文件插入到body之后
    title: 'conventionjs', // 标题，将注入到模板当中
  })
);

module.exports = config;
