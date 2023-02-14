// DODO was here
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const {
  WebpackManifestPlugin,
} = require('webpack-manifest-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const parsedArgs = require('yargs').argv;
const getProxyConfig = require('./webpack.proxy-config');
const packageConfig = require('./package');
const Dotenv = require('dotenv');
const rm = require('rimraf');

const {
  PROD_OUTPUT_FOLDER,
  DEV_OUTPUT_FOLDER,
  getHtmlTemplate,
} = require('./webpackUtils/constants');

const { rulesStyles } = require('./webpackUtils/styles');
const { rulesStaticAssets } = require('./webpackUtils/assets');

const {
  mode = 'development',
  devserverPort = 3000,
  measure = false,
  analyzeBundle = false,
  analyzerPort = 8888,
  nameChunks = false,
  envFile = '.env',
} = parsedArgs;
const isDevMode = mode !== 'production';
const isDevServer = process.argv[1].includes('webpack-dev-server');
const ASSET_BASE_URL = process.env.ASSET_BASE_URL || '';

const isProd = mode === 'production';

const getPublicPath = isProdMode =>
  isProdMode ? (publicPath ? `${publicPath}/` : '') : '';

// input dir
const APP_DIR = path.resolve(__dirname, './');
// output dir
const BUILD_DIR = path.resolve(
  __dirname,
  isProd ? PROD_OUTPUT_FOLDER : DEV_OUTPUT_FOLDER,
);


/*
 ** APP VERSION BASE is a base from which the app inherited the code base
 ** (i.e. 1.3 => was inherited from Superset 1.3)
*/
const APP_VERSION_BASE = '1.3';
const date = new Date();
const month = date.getMonth();
const day = date.getDate();
const hours = date.getHours();
const APP_VERSION = `${APP_VERSION_BASE}.${month}-${day}:${hours}`;

console.group('Params:');
console.log('Parsed Args', parsedArgs);
console.log('______');
console.log('isProd =>', JSON.stringify(isProd));
console.log('input APP_DIR =>', JSON.stringify(APP_DIR));
console.log('webpack mode =>', JSON.stringify(mode));
console.log('output BUILD_DIR =>', JSON.stringify(BUILD_DIR));
console.log('publicPath =>', JSON.stringify(getPublicPath(isProd)));
console.log('APP_VERSION =>', JSON.stringify(APP_VERSION));
console.log('______');
console.log('');
console.groupEnd();

// clearing the directory
rm(BUILD_DIR, err => {
  if (err) throw err;
});

const output = {
  path: BUILD_DIR,
  // publicPath: `${ASSET_BASE_URL}/static/assets/`,
  publicPath: getPublicPath(isProd),
  filename: '[name].[hash].js',
  library: '[name]',
  libraryTarget: 'this',
};

console.group('Config:');
const envFileParsed = `./${envFile}`;
console.log('envFile =>', envFile);
console.log('envFileParsed =>', envFileParsed);

const envConfig = Dotenv.config({ path: envFileParsed }).parsed;
console.log('envConfig =>', envConfig);

const envKeys = Object.keys(envConfig).reduce((prev, next) => {
  // eslint-disable-next-line no-param-reassign
  prev[`process.env.${next}`] = JSON.stringify(envConfig[next]);
  return prev;
}, {});

const FULL_ENV = {
  ...envKeys,
  'process.env.WEBPACK_MODE': JSON.stringify(mode),
  'process.env.APP_VERSION': JSON.stringify(APP_VERSION),
};

console.log('FULL_ENV =>', FULL_ENV);
console.log('');
console.groupEnd();


// if (isDevMode) {
//   output.filename = '[name].[contenthash:8].entry.js';
//   output.chunkFilename = '[name].[contenthash:8].chunk.js';
// } else if (nameChunks) {
//   output.filename = '[name].[chunkhash].entry.js';
//   output.chunkFilename = '[name].[chunkhash].chunk.js';
// } else {
//   output.filename = '[name].[chunkhash].entry.js';
//   output.chunkFilename = '[chunkhash].chunk.js';
// }

if (!isDevMode) {
  output.clean = true;
}

const plugins = [
  // new webpack.ProvidePlugin({
  //   process: 'process/browser.js',
  // }),

  new webpack.DefinePlugin(FULL_ENV),

  new WebpackManifestPlugin({
    removeKeyHash: /([a-f0-9]{1,32}\.?)/gi,
  }),

  // expose mode variable to other modules
  new webpack.DefinePlugin({
    'process.env.WEBPACK_MODE': JSON.stringify(mode),
  }),

  new CopyPlugin({
    patterns: [
      'package.json',
      { from: 'src/assets/images', to: 'images' },
      { from: 'src/assets/stylesheets', to: 'stylesheets' },
    ],
  }),

  new HtmlWebpackPlugin({
    title: 'Superset dashboard plugin',
    minify: false,
    filename: 'index.html',
    meta: {
      charset: 'UTF-8',
      viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
    },
    templateContent: ({ htmlWebpackPlugin }) =>
      getHtmlTemplate(htmlWebpackPlugin),
  }),
  new MiniCssExtractPlugin({
    filename: '[name].[hash].css',
  }),
  // new OptimizeCSSAssetsPlugin(),
];

if (!process.env.CI) {
  plugins.push(new webpack.ProgressPlugin());
}

if (!isDevMode) {
  // text loading (webpack 4+)
  plugins.push(
    new MiniCssExtractPlugin({
      filename: '[name].[chunkhash].entry.css',
      chunkFilename: '[name].[chunkhash].chunk.css',
    }),
  );

  plugins.push(
    // runs type checking on a separate process to speed up the build
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        files: './{src,packages,plugins}/**/*.{ts,tsx,js,jsx}',
        memoryLimit: 4096,
        options: {
          ignorePath: './.eslintignore',
        },
      },
    }),
  );
}

const babelLoader = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    // disable gzip compression for cache files
    // faster when there are millions of small files
    cacheCompression: false,
    plugins: ['emotion'],
    presets: [
      [
        '@emotion/babel-preset-css-prop',
        {
          autoLabel: 'dev-only',
          labelFormat: '[local]',
        },
      ],
    ],
  },
};

const config = {
  entry: {
    supersetDashboardPlugin: (APP_DIR, '/src/Superstructure/main.tsx'),
  },
  output,
  stats: 'minimal',
  performance: {
    assetFilter(assetFilename) {
      // don't throw size limit warning on geojson and font files
      return !/\.(map|geojson|woff2)$/.test(assetFilename);
    },
  },
  optimization: {
    sideEffects: true,
    splitChunks: {
      chunks: 'all',
      // increase minSize for devMode to 1000kb because of sourcemap
      minSize: isDevMode ? 1000000 : 20000,
      name: nameChunks,
      automaticNameDelimiter: '-',
      minChunks: 2,
      cacheGroups: {
        automaticNamePrefix: 'chunk',
        // basic stable dependencies
        vendors: {
          priority: 50,
          name: 'vendors',
          test: new RegExp(
            `/node_modules/(${[
              'abortcontroller-polyfill',
              'react',
              'react-dom',
              'prop-types',
              'react-prop-types',
              'prop-types-extra',
              'redux',
              'react-redux',
              'react-hot-loader',
              'react-select',
              'react-sortable-hoc',
              'react-virtualized',
              'react-table',
              'react-ace',
              '@hot-loader.*',
              'webpack.*',
              '@?babel.*',
              'lodash.*',
              'antd',
              '@ant-design.*',
              '.*bootstrap',
              'moment',
              'jquery',
              'core-js.*',
              '@emotion.*',
              'd3',
              'd3-(array|color|scale|interpolate|format|selection|collection|time|time-format)',
            ].join('|')})/`,
          ),
        },
        // viz thumbnails are used in `addSlice` and `explore` page
        thumbnail: {
          name: 'thumbnail',
          test: /thumbnail(Large)?\.(png|jpg)/i,
          priority: 20,
          enforce: true,
        },
      },
    },
    usedExports: 'global',
    minimizer: [new CssMinimizerPlugin(), '...'],
  },
  resolve: {
    // resolve modules from `/superset_frontend/node_modules` and `/superset_frontend`
    modules: ['node_modules', APP_DIR],
    alias: {
      // TODO: remove aliases once React has been upgraded to v. 17 and
      //  AntD version conflict has been resolved
      antd: path.resolve(path.join(APP_DIR, './node_modules/antd')),
      react: path.resolve(path.join(APP_DIR, './node_modules/react')),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.yml'],
    fallback: {
      fs: false,
      vm: require.resolve('vm-browserify'),
      path: false,
    },
  },
  context: APP_DIR, // to automatically find tsconfig.json
  module: {
    rules: [
      {
        test: /datatables\.net.*/,
        loader: 'imports-loader',
        options: {
          additionalCode: 'var define = false;',
        },
      },
      {
        test: /\.tsx?$/,
        exclude: [/\.test.tsx?$/],
        use: [
          'thread-loader',
          babelLoader,
          {
            loader: 'ts-loader',
            options: {
              // transpile only in happyPack mode
              // type checking is done via fork-ts-checker-webpack-plugin
              happyPackMode: true,
              transpileOnly: true,
              // must override compiler options here, even though we have set
              // the same options in `tsconfig.json`, because they may still
              // be overriden by `tsconfig.json` in node_modules subdirectories.
              compilerOptions: {
                esModuleInterop: false,
                importHelpers: false,
                module: 'esnext',
                target: 'esnext',
              },
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        // include source code for plugins, but exclude node_modules and test files within them
        exclude: [/superset-ui.*\/node_modules\//, /\.test.jsx?$/],
        include: [
          new RegExp(`${APP_DIR}/(src|.storybook|plugins|packages)`),
          ...['./src', './.storybook', './plugins', './packages'].map(p =>
            path.resolve(__dirname, p),
          ), // redundant but required for windows
          /@encodable/,
        ],
        use: [babelLoader],
      },
      // react-hot-loader use "ProxyFacade", which is a wrapper for react Component
      // see https://github.com/gaearon/react-hot-loader/issues/1311
      // TODO: refactor recurseReactClone
      {
        test: /\.js$/,
        include: /node_modules\/react-dom/,
        use: ['react-hot-loader/webpack'],
      },
      {
        test: /\.css$/,
        include: [APP_DIR, /superset-ui.+\/src/],
        use: [
          isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.less$/,
        include: APP_DIR,
        use: [
          isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: true,
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      /* for css linking images (and viz plugin thumbnails) */
      {
        test: /\.png$/,
        issuer: {
          not: [/\/src\/assets\/staticPages\//],
        },
        type: 'asset',
        generator: {
          filename: '[name].[contenthash:8].[ext]',
        },
      },
      {
        test: /\.png$/,
        issuer: /\/src\/assets\/staticPages\//,
        type: 'asset',
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        issuer: /\.([jt])sx?$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              svgoConfig: {
                plugins: {
                  removeViewBox: false,
                  icon: true,
                },
              },
            },
          },
        ],
      },
      {
        test: /\.(jpg|gif)$/,
        type: 'asset/resource',
        generator: {
          filename: '[name].[contenthash:8].[ext]',
        },
      },
      /* for font-awesome */
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.ya?ml$/,
        include: APP_DIR,
        loader: 'js-yaml-loader',
      },
      {
        test: /\.geojson$/,
        type: 'asset/resource',
      },
    ],
  },
  externals: {
    cheerio: 'window',
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true,
  },
  plugins,
  devtool: 'source-map',
};

// find all the symlinked plugins and use their source code for imports
Object.entries(packageConfig.dependencies).forEach(([pkg, relativeDir]) => {
  const srcPath = path.join(APP_DIR, `./node_modules/${pkg}/src`);
  const dir = relativeDir.replace('file:', '');

  if (/^@superset-ui/.test(pkg) && fs.existsSync(srcPath)) {
    console.log(`[Superset Plugin] Use symlink source for ${pkg} @ ${dir}`);
    config.resolve.alias[pkg] = path.resolve(APP_DIR, `${dir}/src`);
  }
});
console.log(''); // pure cosmetic new line

if (isDevMode) {
  config.devtool = 'eval-cheap-module-source-map';
  config.devServer = {
    historyApiFallback: true,
    hot: true,
    port: devserverPort,
    devMiddleware: {
      index: true,
      // mimeTypes: { phtml: 'text/html' },
      // publicPath: '/publicPathForDevServe',
      publicPath: path.join(process.cwd(), DEV_OUTPUT_FOLDER),
      serverSideRender: true,
      writeToDisk: true,
    },
    client: {
      progress: true,
      overlay: {
        errors: true,
        warnings: false,
      },
      logging: 'error',
    },
    // static: path.join(process.cwd(), '../static/assets'),
  };
}

// Bundle analyzer is disabled by default
// Pass flag --analyzeBundle=true to enable
// e.g. npm run build -- --analyzeBundle=true
if (analyzeBundle) {
  config.plugins.push(new BundleAnalyzerPlugin({ analyzerPort }));
}

// Speed measurement is disabled by default
// Pass flag --measure=true to enable
// e.g. npm run build -- --measure=true
const smp = new SpeedMeasurePlugin({
  disable: !measure,
});

module.exports = smp.wrap(config);
