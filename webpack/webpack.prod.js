const mergeConfig = require('./webpack.common');
const TerserPlugin = require('terser-webpack-plugin');

const config = mergeConfig({
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({ // 压缩js
        test: /\.js(\?.*)?$/i,
        exclude: /node_modules/,
        parallel: true,
        extractComments: true // 将注释提取到单独的文件中
      })
    ],
  },
});

module.exports = config;
