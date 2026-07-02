const { build } = require('vite');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const targetBrowser = process.env.TARGET_BROWSER || 'chrome';
const isDev = process.env.dev === 'true';

const outDir = path.resolve(__dirname, `dist-${targetBrowser}`);

// Helper: Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Helper: Copy directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Phase 1: Generate PNG icons from SVG template using macOS sips
function generateIcons() {
  console.log('Generating PNG icons from SVG template using sips...');
  const iconsSrcDir = path.resolve(__dirname, 'src/icons');
  ensureDir(iconsSrcDir);

  const svgPath = path.join(iconsSrcDir, 'icon.svg');
  if (!fs.existsSync(svgPath)) {
    console.error(`Error: SVG icon template not found at ${svgPath}`);
    process.exit(1);
  }

  const sizes = [16, 48, 128];
  sizes.forEach((size) => {
    const outPngPath = path.join(iconsSrcDir, `icon-${size}.png`);
    try {
      // Use macOS sips to convert SVG to PNG with specific dimensions
      execSync(`sips -s format png -z ${size} ${size} "${svgPath}" --out "${outPngPath}"`, {
        stdio: 'ignore',
      });
      console.log(`Generated icon: icon-${size}.png`);
    } catch (err) {
      console.error(`Failed to generate icon-${size}.png:`, err.message);
    }
  });
}

async function runBuild() {
  console.log(`\n========================================`);
  console.log(`Starting build for [${targetBrowser.toUpperCase()}] (Mode: ${isDev ? 'Development' : 'Production'})`);
  console.log(`========================================\n`);

  // Ensure icons are generated before building
  generateIcons();

  // Ensure output directory is clean
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  ensureDir(outDir);

  // 1. Build Popup and Options (HTML/CSS/TS)
  console.log('\n--- Building HTML Pages (Popup & Options) ---');
  await build({
    configFile: false,
    root: path.resolve(__dirname, 'src'),
    base: '', // relative paths in assets
    build: {
      outDir: outDir,
      emptyOutDir: false,
      sourcemap: isDev,
      minify: !isDev,
      rollupOptions: {
        input: {
          popup: path.resolve(__dirname, 'src/popup/index.html'),
          options: path.resolve(__dirname, 'src/options/index.html'),
        },
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
  });

  // 2. Build Background Service Worker
  console.log('\n--- Building Background Script ---');
  await build({
    configFile: false,
    root: path.resolve(__dirname, 'src'),
    build: {
      outDir: outDir,
      emptyOutDir: false,
      sourcemap: isDev,
      minify: !isDev,
      lib: {
        entry: path.resolve(__dirname, 'src/background/index.ts'),
        name: 'background',
        formats: ['iife'],
        fileName: () => 'background.js',
      },
      rollupOptions: {
        // Ensure polyfill is bundled and variables aren't stripped
        output: {
          extend: true,
        },
      },
    },
  });

  // 3. Build Content Script
  console.log('\n--- Building Content Script ---');
  await build({
    configFile: false,
    root: path.resolve(__dirname, 'src'),
    build: {
      outDir: outDir,
      emptyOutDir: false,
      sourcemap: isDev,
      minify: !isDev,
      lib: {
        entry: path.resolve(__dirname, 'src/content/index.ts'),
        name: 'content',
        formats: ['iife'],
        fileName: () => 'content.js',
      },
      rollupOptions: {
        output: {
          extend: true,
        },
      },
    },
  });

  // 4. Copy Manifest and Assets to dist
  console.log('\n--- Copying Manifest & Assets ---');
  const manifestSrc = path.resolve(__dirname, `src/manifest.${targetBrowser}.json`);
  const manifestDest = path.resolve(outDir, 'manifest.json');
  if (fs.existsSync(manifestSrc)) {
    fs.copyFileSync(manifestSrc, manifestDest);
    console.log(`Copied manifest.json for ${targetBrowser}`);
  } else {
    console.error(`Error: Manifest file not found at ${manifestSrc}`);
  }

  // Copy icons folder to dist
  const iconsSrcDir = path.resolve(__dirname, 'src/icons');
  const iconsDestDir = path.resolve(outDir, 'icons');
  ensureDir(iconsDestDir);

  const sizes = [16, 48, 128];
  sizes.forEach((size) => {
    const iconName = `icon-${size}.png`;
    const srcIcon = path.join(iconsSrcDir, iconName);
    const destIcon = path.join(iconsDestDir, iconName);
    if (fs.existsSync(srcIcon)) {
      fs.copyFileSync(srcIcon, destIcon);
    }
  });
  console.log('Copied extension PNG icons.');

  console.log(`\n========================================`);
  console.log(`Build for [${targetBrowser.toUpperCase()}] finished successfully!`);
  console.log(`Output: ${outDir}`);
  console.log(`========================================\n`);
}

runBuild().catch((err) => {
  console.error('Build process failed:', err);
  process.exit(1);
});
