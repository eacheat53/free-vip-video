const path = require('path');
const WebpackUserscript = require('webpack-userscript').default;
const TerserPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const isReadable = process.env.NODE_ENV === 'readable';

module.exports = {
  mode: isReadable ? 'development' : (isProduction ? 'production' : 'development'),
  devtool: isProduction ? 'source-map' : false, // 生产环境使用source-map，开发环境禁用以获得真正可读的代码
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: /==\/?UserScript==|@/i,
            beautify: !isProduction,
            indent_level: 2,
          },
          mangle: isProduction,
          compress: isProduction,
        },
        extractComments: false,
      }),
    ],
  },
  plugins: [
    new WebpackUserscript({
      headers: {
        name: 'free-vip-vedeo',
        namespace: 'http://tampermonkey.net/',
        version: '0.2.1',
        description: 'VIP视频源替换播放，支持：腾讯、爱奇艺、优酷、芒果、pptv、乐视等',
        author: 'deadalux',
        match: [
          '*://*.youku.com/*',
          '*://*.iqiyi.com/*',
          '*://*.iq.com/*',
          '*://*.le.com/*',
          '*://v.qq.com/*',
          '*://m.v.qq.com/*',
          '*://*.tudou.com/*',
          '*://*.mgtv.com/*',
          '*://tv.sohu.com/*',
          '*://film.sohu.com/*',
          '*://*.1905.com/*',
          '*://*.bilibili.com/*',
          '*://*.pptv.com/*',
        ],
        require: 'https://cdn.bootcdn.net/ajax/libs/jquery/3.2.1/jquery.min.js',
        grant: [
          'unsafeWindow',
          'GM_addStyle',
          'GM_openInTab',
          'GM_getValue',
          'GM_setValue',
          'GM_xmlhttpRequest',
          'GM_log',
        ],
        license: 'GPL License',
        downloadURL: 'https://update.greasyfork.org/scripts/438657/%E5%85%A8%E7%BD%91VIP%E8%A7%86%E9%A2%91%E5%85%8D%E8%B4%B9%E7%A0%B4%E8%A7%A3%E3%80%90%E4%B8%93%E6%B3%A8%E4%B8%80%E4%B8%AA%E8%84%9A%E6%9C%AC%E5%8F%AA%E5%81%9A%E4%B8%80%E4%BB%B6%E4%BA%8B%E4%BB%B6%E3%80%91.user.js',
        updateURL: 'https://update.greasyfork.org/scripts/438657/%E5%85%A8%E7%BD%91VIP%E8%A7%86%E9%A2%91%E5%85%8D%E8%B4%B9%E7%A0%B4%E8%A7%A3%E3%80%90%E4%B8%93%E6%B3%A8%E4%B8%80%E4%B8%AA%E8%84%9A%E6%9C%AC%E5%8F%AA%E5%81%9A%E4%B8%80%E4%BB%B6%E4%BA%8B%E4%BB%B6%E3%80%91.meta.js',
      },
      metajs: false,
    }),
  ],
  externals: {
    jquery: 'jQuery',
  },
  devServer: {
    port: 8080,
    hot: true,
  },
};
