'use strict';

/*
 * Refuse to publish anything git does not have.
 *
 *   node scripts/check-pack.js      (npm publish runs it too, as prepublishOnly)
 *
 * package.json's `files` field lists whole folders, and npm does not apply
 * .gitignore inside a folder that `files` names. So a file made locally, such
 * as an example's output image, is published with the package: from a working
 * copy with examples/output/ full of PNGs, `npm publish --dry-run` gave 42 MB
 * instead of 1.5 MB (2026-09-26). `files` now excludes examples/output/, and
 * this check catches whatever the next such folder is.
 *
 * It lists the files `npm pack --dry-run` would publish and compares them with
 * git: every packed file must be tracked and unmodified, so the tarball is
 * exactly the commit. Exit 1, with the offending paths, when one is not.
 * Outside a git work tree (a `git archive` export, which holds only tracked
 * files) it reports and exits 0.
 */

const path = require('path');
const {execFileSync, execSync} = require('child_process');

const root = path.resolve(__dirname, '..');
const options = {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20};
const exec = (file, args) => execFileSync(file, args, options);

// npm itself: through node and npm-cli.js when npm runs this script, else the
// npm on the PATH, as one fixed command line (npm.cmd on Windows needs a shell).
const PACK_ARGS = ['pack', '--dry-run', '--json', '--ignore-scripts'];
const pack_list = () => (process.env.npm_execpath && /\.c?js$/.test(process.env.npm_execpath)
    ? exec(process.execPath, [process.env.npm_execpath, ...PACK_ARGS])
    : execSync('npm ' + PACK_ARGS.join(' '), options));

const in_git = (() => {
    try { return exec('git', ['rev-parse', '--is-inside-work-tree']).trim() === 'true'; } catch (error) { return false; }
})();

const packed = JSON.parse(pack_list())[0].files.map(f => f.path);

if (!in_git) {
    console.log(`check-pack: not a git work tree; ${packed.length} files would be packed (nothing to compare)`);
    process.exit(0);
}

const tracked = new Set(exec('git', ['ls-files', '-z']).split('\0').filter(Boolean));
const changed = new Set(exec('git', ['status', '--porcelain=v1', '-z', '--untracked-files=no']).split('\0')
    .filter(entry => entry.length > 3).map(entry => entry.slice(3)));

const untracked = packed.filter(p => !tracked.has(p));
const modified = packed.filter(p => tracked.has(p) && changed.has(p));

if (untracked.length || modified.length) {
    if (untracked.length) console.error(`check-pack: ${untracked.length} packed file(s) are not tracked by git:\n  ${untracked.join('\n  ')}`);
    if (modified.length) console.error(`check-pack: ${modified.length} packed file(s) have uncommitted changes:\n  ${modified.join('\n  ')}`);
    console.error('check-pack: exclude them in package.json "files", commit them, or publish from a `git archive` export of the tag.');
    process.exit(1);
}
console.log(`check-pack: ok, all ${packed.length} packed files are tracked and unmodified`);
