const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      background: './src/background.ts',
      'content-script': './src/content-script.ts',
      popup: './src/popup.ts',
      options: './src/options.ts'
    },
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },
    
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]'
          }
        }
      ]
    },
    
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    
    plugins: [
      // Copy static assets
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public/manifest.json',
            to: 'manifest.json'
          },
          {
            from: 'public/icons',
            to: 'icons'
          },
          {
            from: 'public/*.png',
            to: '[name][ext]'
          }
        ]
      }),
      
      // Generate HTML files
      new HtmlWebpackPlugin({
        template: './src/popup.html',
        filename: 'popup.html',
        chunks: ['popup']
      }),
      
      new HtmlWebpackPlugin({
        template: './src/options.html', 
        filename: 'options.html',
        chunks: ['options']
      })
    ],
    
    // Development settings
    devtool: isProduction ? false : 'source-map',
    
    optimization: {
      minimize: isProduction,
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all'
          }
        }
      }
    },
    
    // Chrome extension specific settings
    target: 'web',
    
    // Externals for Chrome APIs
    externals: {
      chrome: 'chrome'
    }
  };
};