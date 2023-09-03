import gulp from "gulp";
import browserSync from "browser-sync";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import sourcemap from "gulp-sourcemaps";
import cleanCSS from "gulp-clean-css";
import autoprefixer from "gulp-autoprefixer";
import rename from "gulp-rename";
import imagemin from "gulp-imagemin";
import htmlmin from "gulp-htmlmin";
import webp from "gulp-webp";
import svgstore from "gulp-svgstore";
import del from "del";
import webpack from "webpack-stream";

const baseDir = {
	src: "src",
	dest: "dist"
};

const paths = {
	html: {
		src: `${baseDir.src}/*.html`,
		dest: `${baseDir.dest}/`
	},
	styles: {
		src: `${baseDir.src}/sass/**/*.+(scss|sass|css)`,
		dest: `${baseDir.dest}/css`
	},
	scripts: {
		src: `${baseDir.src}/js/**/*.js`,
		srcEntry: `${baseDir.src}/js/*.js`,
		dest: `${baseDir.dest}/js`
	},
	images: {
		src: `${baseDir.src}/img/**/*.{jgp,png,svg}`,
		srcWebp: `${baseDir.dest}/img/**/*.{png,jpg}`,
		dest: `${baseDir.dest}/img`
	},
	icons: {
		src: `${baseDir.src}/icons/**/*.{jgp,png,svg}`,
		srcSprite: `${baseDir.dest}/icons/**/icon-*.svg`,
		dest: `${baseDir.dest}/icons`
	},
	fonts: {
		src: `${baseDir.src}/fonts/**/*.{woff,woff2}`
	},
	others: {
		src: `${baseDir.src}/*.+(ico|xml|webmanifest)`
	}
};

const sass = gulpSass(dartSass);

const optimizeImg = () => {
	return gulp.src(paths.images.src)
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			imagemin.mozjpeg({progressive: true}),
			imagemin.svgo({
				plugins: [
					{removeViewBox: true},
					{cleanupIDs: false}
				]
			})
		]))
		.pipe(gulp.dest(paths.images.dest));
};

const optimizeIco = () => {
	return gulp.src(paths.icons.src)
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			imagemin.mozjpeg({progressive: true}),
			imagemin.svgo({
				plugins: [
					{removeViewBox: true},
					{cleanupIDs: false}
				]
			})
		]))
		.pipe(gulp.dest(paths.icons.dest));
};

const webpConv = () => {
	return gulp.src(paths.images.srcWebp)
		.pipe(webp({quality: 90}))
		.pipe(gulp.dest(paths.images.dest));
};

const sprite = () => {
	return gulp.src(paths.icons.srcSprite)
		.pipe(svgstore())
		.pipe(rename("sprite.svg"))
		.pipe(gulp.dest(paths.icons.dest));
};

const clean = () => {
	return del("dist");
};

const html = () => {
	return gulp.src(paths.html.src)
		.pipe(gulp.dest(paths.html.dest))
		.pipe(browserSync.stream());
};

const htmlProd = () => {
	return gulp.src(paths.html.src)
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest(paths.html.dest))
		.pipe(browserSync.stream());
};

const styles = () => {
	return gulp.src(paths.styles.src)
		.pipe(sourcemap.init())
		.pipe(sass({
			includePaths: ["./node_modules"]
		}).on("error", sass.logError))
		.pipe(autoprefixer())
		.pipe(rename("main.css"))
		.pipe(sourcemap.write("."))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browserSync.stream());
};

const stylesProd = () => {
	return gulp.src(paths.styles.src)
		.pipe(sass({
			includePaths: ["./node_modules"],
		}).on("error", sass.logError))
		.pipe(autoprefixer())
		.pipe(cleanCSS({
			compatibility: "ie8",
			level: 2
		}))
		.pipe(rename("main.css"))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browserSync.stream());
};

const scripts = () => {
	return gulp.src(paths.scripts.srcEntry)
		.pipe(webpack({
			mode: "development",
			output: {
				filename: "app.js",
			},
			watch: false,
			devtool: "source-map",
			module: {
				rules: [
					{
						test: /\.m?js$/,
						exclude: /(node_modules|bower_components)/,
						use: {
							loader: "babel-loader",
							options: {
								presets: [["@babel/preset-env", {
									debug: true,
									corejs: 3.32,
									useBuiltIns: "entry"
								}]]
							}
						}
					}
				]
			}
		}))
		.pipe(gulp.dest(paths.scripts.dest))
		.pipe(browserSync.stream());
};

const scriptsProd = () => {
	return gulp.src(paths.scripts.srcEntry)
		.pipe(webpack({
			mode: "production",
			output: {
				filename: "app.js",
			},
			module: {
				rules: [
					{
						test: /\.m?js$/,
						exclude: /(node_modules|bower_components)/,
						use: {
							loader: "babel-loader",
							options: {
								presets: [["@babel/preset-env", {
									debug: true,
									corejs: 3.32,
									useBuiltIns: "entry"
								}]]
							}
						}
					}
				]
			}
		}))
		.pipe(gulp.dest(paths.scripts.dest))
		.pipe(browserSync.stream());
};

const copy = () => {
	return gulp.src([
		paths.fonts.src,
		paths.images.src,
		paths.icons.src,
		paths.others.src
	], {
		base: baseDir.src
	})
		.pipe(gulp.dest(baseDir.dest))
		.pipe(browserSync.stream());
};

const copyProd = () => {
	return gulp.src([
		paths.fonts.src,
		paths.others.src
	], {
		base: baseDir.src
	})
		.pipe(gulp.dest(baseDir.dest))
		.pipe(browserSync.stream());
};

const watcher = () => {
	gulp.watch(paths.html.src, gulp.parallel(html));
	gulp.watch(paths.styles.src, gulp.parallel(styles));
	gulp.watch(paths.scripts.src, gulp.parallel(scripts));
	gulp.watch([
		paths.fonts.src,
		paths.images.src,
		paths.icons.src
	], gulp.parallel(copy));
};

const server = (cb) => {
	browserSync.init({
		server: {
			baseDir: baseDir.dest
		},
		cors: true,
		notify: false,
		ui: false
	});
	cb();
};


export default gulp.series(clean, gulp.parallel(html, styles, scripts, copy), server, watcher);

export const build = gulp.series(clean, gulp.parallel(htmlProd, stylesProd, scriptsProd, copyProd, optimizeImg, optimizeIco), gulp.parallel(webpConv, sprite));
