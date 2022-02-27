import {resolve, dirname} from 'path'
import { fileURLToPath } from 'url'
import MiniCSSExtractPlugin from 'mini-css-extract-plugin'
import {VueLoaderPlugin} from 'vue-loader'

const __dirname = dirname(fileURLToPath(import.meta.url))
console.log(import.meta.url)
export default [{
  target:'electron-renderer',
  entry:{
    main:'./src/ts/main.ts'
  },
  mode:'development',
  output:{
    path:resolve(__dirname, 'app/bundle/'),
    filename:'[name].js'
  },
  resolve: {
    extensions: ['.ts', '.vue', '.js']
  },
  module:{
    rules:[
      {
        test:/\.ts$/,
        loader: 'esbuild-loader',
        options:{
          loader:'ts',
          target:'esnext'
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
    path:resolve(__dirname, 'app/'),
    filename:'[name].js'
  },
  resolve: {
    extensions: ['.ts', '.vue', '.js']
  },
  node:{
    __dirname:false
  },
  module:{
    rules:[
      {
        test:/\.ts$/,
        loader: 'esbuild-loader',
        options:{
          loader:'ts',
          target:'esnext'
        }
      },
    ]
  },
  devtool:'inline-source-map'
}]