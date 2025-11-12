const path = require('path');
const WebpackUserscript = require('webpack-userscript').default;
const TerserPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'free-vip-video.user.js',
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
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: /==\/?UserScript==|@/i,
          },
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
        version: '1.7.0',
        description: '全网VIP视频免费破解，支持：腾讯、爱奇艺、优酷、芒果、pptv、乐视等其它网站；',
        author: 'w__yi',
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
      proxyScript: {
        baseUrl: 'http://127.0.0.1:8080',
        filename: '[basename].proxy.user.js',
        enable: !isProduction,
      },
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
