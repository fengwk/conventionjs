const path = require('node:path'); // 旧的node版本为require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

// 将obj1和obj2深度合并，如果产生冲突以obj2为主
function deepMerge(obj1, obj2) {
  const result = {};
  // 遍历obj1的属性
  Object.keys(obj1).forEach((key) => {
    if (obj1.hasOwnProperty(key)) {
      if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
        result[key] = deepMerge(obj1[key], obj2[key]);
      } else {
        result[key] = obj2[key] || obj1[key];
      }
    }
  });
  // 遍历obj2的属性
  Object.keys(obj2).forEach((key) => {
    if (obj2.hasOwnProperty(key)) {
      if (!result.hasOwnProperty(key)) {
        result[key] = obj2[key];
      }
    }
  });
  return result;
}

function selectEntry(mode) {
  if (mode == 'development') {
    return path.resolve(__dirname, '..', 'dev', 'index.js');
  } else {
    return path.resolve(__dirname, '..', 'lib', 'index.js');
  }
}

// 导出一个合并函数用于生成新的配置信息
module.exports = function(config) {
  // 基础配置信息
  const commonConfig = {
    entry: selectEntry(config.mode),
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, '..', 'dist'),
      library: 'conventionjs',
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader'
            }
          ],
        },
      ]
    },
    plugins: [
      new CleanWebpackPlugin(), // 自动清理构建产物
      new ESLintPlugin(),
    ]
  };

  // 合并
  return deepMerge(commonConfig, config);
};
