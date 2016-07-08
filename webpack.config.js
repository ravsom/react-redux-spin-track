module.exports = {
	entry: [
		//'webpack/hot/dev-server',
		'./public/src/index.js'
	],
	output: {
		path: __dirname + '/public/',
		publicPath: '/',
		filename: 'bundle.js'
	},
	module: {
		loaders: [{
			exclude: /node_modules/,
			loader: 'babel'
		}]
	},
	resolve: {
		extensions: ['', '.js', '.jsx']
	},
	//devtool: "source-map",
	devServer: {
		historyApiFallback: true,
		contentBase: './public'
	}
};
