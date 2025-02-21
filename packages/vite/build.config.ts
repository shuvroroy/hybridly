import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
	entries: [
		'src/index',
	],
	clean: true,
	declaration: true,
	externals: [
		'vite',
		'debug',
		'hybridly',
		'@hybridly/config',
		'@hybridly/utils',
	],
	rollup: {
		emitCJS: true,
	},
})
