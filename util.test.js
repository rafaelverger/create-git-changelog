/**
 * @jest-environment node
 */

 const util = require('./util');

test('parseCommit', () => {
  commitText = `
commit 0808ee7ab79b3d6b8740375b14e4567e827d3ccf (HEAD -> issue1, origin/master, master)
Author: Rafael Nunes Verger <rafael@rafaelverger.com.br>
Date:   2018-10-31 18:35:27 -0300

    Initial commit

    Double line

diff --git a/README.md b/README.md
new file mode 100644
index 0000000..0361a2c
--- /dev/null
+++ b/README.md
@@ -0,0 +1,2 @@
+# generate-git-changelog
+NPM module to run generate git changelog based on package.json version changes
`.trim();
  const obj = util.parseCommit(commitText);
  expect(obj).toMatchObject({
    id: '0808ee7ab79b3d6b8740375b14e4567e827d3ccf',
    author: 'Rafael Nunes Verger <rafael@rafaelverger.com.br>',
    date: new Date('2018-10-31 18:35:27 -0300'),
    message: 'Initial commit\nDouble line',
    patch: {
      'README.md': [
        'diff --git a/README.md b/README.md',
        'new file mode 100644',
        'index 0000000..0361a2c',
        '--- /dev/null',
        '+++ b/README.md',
        '@@ -0,0 +1,2 @@',
        '+# generate-git-changelog',
        '+NPM module to run generate git changelog based on package.json version changes',
      ]
    }
  })
});


test('parseCommit multiple diffs', () => {
  commitText = `
commit 0808ee7ab79b3d6b8740375b14e4567e827d3ccf
Author: Rafael Nunes Verger <rafael@rafaelverger.com.br>
Date:   2018-10-31 18:35:27 -0300

    Initial commit

    Double line

diff --git a/README.md b/README.md
new file mode 100644
index 0000000..0361a2c
--- /dev/null
+++ b/README.md
@@ -0,0 +1,2 @@
+# generate-git-changelog
+NPM module to run generate git changelog based on package.json version changes

diff --git a/package.json b/package.json
new file mode 100644
index 0000000..b9a6faa
--- /dev/null
+++ b/package.json
@@ -0,0 +1,28 @@
+{
+  "name": "create-git-changelog",
+  "version": "0.0.0",
+  "description": "Automate your changelog update based on repo commits",
+  "main": "index.js",
+  "scripts": {
+    "test": "test"
+  },
+  "repository": {
+    "type": "git",
+    "url": "git+https://github.com/rafaelverger/create-git-changelog.git"
+  },
+  "keywords": [
+    "changelog",
+    "git",
+    "changes",
+    "update",
+    "automate",
+    "generate"
+  ],
+  "author": "rafaelverger",
+  "license": "MIT",
+  "bugs": {
+    "url": "https://github.com/rafaelverger/create-git-changelog/issues"
+  },
+  "homepage": "https://github.com/rafaelverger/create-git-changelog#readme",
+  "engines": { "node" : ">=4" }
+}
`.trim();
  const obj = util.parseCommit(commitText);
  expect(obj).toMatchObject({
    id: '0808ee7ab79b3d6b8740375b14e4567e827d3ccf',
    author: 'Rafael Nunes Verger <rafael@rafaelverger.com.br>',
    date: new Date('2018-10-31 18:35:27 -0300'),
    message: 'Initial commit\nDouble line',
    patch: {
      'README.md': [
        'diff --git a/README.md b/README.md',
        'new file mode 100644',
        'index 0000000..0361a2c',
        '--- /dev/null',
        '+++ b/README.md',
        '@@ -0,0 +1,2 @@',
        '+# generate-git-changelog',
        '+NPM module to run generate git changelog based on package.json version changes',
      ],
      'package.json': [
        'diff --git a/package.json b/package.json',
        'new file mode 100644',
        'index 0000000..b9a6faa',
        '--- /dev/null',
        '+++ b/package.json',
        '@@ -0,0 +1,28 @@',
        '+{',
        '+  "name": "create-git-changelog",',
        '+  "version": "0.0.0",',
        '+  "description": "Automate your changelog update based on repo commits",',
        '+  "main": "index.js",',
        '+  "scripts": {',
        '+    "test": "test"',
        '+  },',
        '+  "repository": {',
        '+    "type": "git",',
        '+    "url": "git+https://github.com/rafaelverger/create-git-changelog.git"',
        '+  },',
        '+  "keywords": [',
        '+    "changelog",',
        '+    "git",',
        '+    "changes",',
        '+    "update",',
        '+    "automate",',
        '+    "generate"',
        '+  ],',
        '+  "author": "rafaelverger",',
        '+  "license": "MIT",',
        '+  "bugs": {',
        '+    "url": "https://github.com/rafaelverger/create-git-changelog/issues"',
        '+  },',
        '+  "homepage": "https://github.com/rafaelverger/create-git-changelog#readme",',
        '+  "engines": { "node" : ">=4" }',
        '+}',
      ]
    }
  })
});
