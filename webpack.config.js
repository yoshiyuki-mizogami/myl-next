const path = require('path')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const {VueLoaderPlugin} = require('vue-loader')

module.exports = [{
  target:'electron-renderer',
  entry:{
    main:'./src/ts/main.ts'
  },
  mode:'development',
  output:{
    path:path.resolve(__dirname, 'app/bundle/'),
    filename:'[name].js'
  },
  resolve: {
    extensions: ['.ts', '.vue', '.js']
  },
  module:{
    rules:[
      {
        loader:'ts-loader',
        test:/\.ts$/,
        options:{
          appendTsSuffixTo:[/\.vue$/]
        }
      },
      {
        test:/\.vue$/,
        loader:'vue-loader'
      },
      {
        test:/\.stylus$/,
        use:[
          MiniCSSExtractPlugin.loader,
          'css-loader',
          'stylus-loader'
        ]
      }
    ]
  },
  plugins:[
    new VueLoaderPlugin(),
    new MiniCSSExtractPlugin({
      chunkFilename:'[name].css'
    })
  ],
  devtool:'inline-source-map'
},
{
  target:'electron-main', 
  entry:{
    index:'./src/index.ts'
  },
  mode:'development',
  output:{
    path:path.resolve(__dirname, 'app/'),
    filename:'[name].js'
  },
  node:{
    __dirname:false
  },
  module:{
    rules:[
      {
        loader:'ts-loader',
        test:/\.ts$/
      }
    ]
  },
  devtool:'inline-source-map'
}]