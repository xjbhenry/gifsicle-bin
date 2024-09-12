'use strict';
const path = require('path');
const binBuild = require('bin-build');
const log = require('logalot');
const bin = require('.');
const fs = require('fs');

// use local gifsicle binary on arm64 linux otherwise download from github, since
// github doesn't have arm64 linux binaries
const dest = path.resolve(__dirname, '../vendor/gifsicle')
if (process.platform === 'linux' && process.arch === 'arm64') {
	fs.symlinkSync(path.resolve(__dirname, '../vendor/linux/arm64/gifsicle'), dest);
	log.success('gifsicle symlinked successfully');
}

(async () => {
	try {
		await bin.run(['--version']);
		log.success('gifsicle pre-build test passed successfully');
	} catch (error) {
		log.warn(error.message);
		log.warn('gifsicle pre-build test failed');
		log.info('compiling from source');

		const config = [
			'./configure --disable-gifview --disable-gifdiff',
			`--prefix="${bin.dest()}" --bindir="${bin.dest()}"`
		].join(' ');

		try {
			await binBuild.file(path.resolve(__dirname, '../vendor/source/gifsicle-1.92.tar.gz'), [
				'autoreconf -ivf',
				config,
				'make install'
			]);

			log.success('gifsicle built successfully');
		} catch (error) {
			log.error(error.stack);

			// eslint-disable-next-line unicorn/no-process-exit
			process.exit(1);
		}
	}
})();
