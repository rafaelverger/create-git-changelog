const util = require('./util');

test('parseCommit', () => {
  const commitText = `
commit 0808ee7ab79b3d6b8740375b14e4567e827d3ccf (tag: v0.0.1, HEAD -> issue1, origin/master, master)
Author: Anon <anon@noone.knows>
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
    tag: 'v0.0.1',
    author: 'Anon <anon@noone.knows>',
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
    },
    ignoreMessage: false,
  })
});

test('parseCommit multiple diffs', () => {
  const commitText = `
commit 0808ee7ab79b3d6b8740375b14e4567e827d3ccf
Author: Anon <anon@noone.knows>
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
    tag: null,
    author: 'Anon <anon@noone.knows>',
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
    },
    ignoreMessage: false,
  })
});

test('parseCommit merged commit', () => {
  const commitText = `
commit 2d028acf8157a6626b9dd6a080810dd25e3cff3a
Merge: 53fa825 21a6349
Author: Anon <anon@noone.knows>
Date:   2018-11-01 00:05:15 -0300

    Merge pull request #6 from rafaelverger/issue3

    Using wercker as Continuous Integration service
`.trim();
  const obj = util.parseCommit(commitText);
  expect(obj).toMatchObject({
    id: '2d028acf8157a6626b9dd6a080810dd25e3cff3a',
    tag: null,
    merge: ['53fa825', '21a6349'],
    author: 'Anon <anon@noone.knows>',
    date: new Date('2018-11-01 00:05:15 -0300'),
    message: 'Merge pull request #6 from rafaelverger/issue3\nUsing wercker as Continuous Integration service',
    patch: {},
    ignoreMessage: false,
  })
});

test('parseCommit pkg version change commit', () => {
  const commitText = `
commit cc70261c7cbe458221caec5bfab14745d73cff79 (tag: v1.3.1)
Author: Anon <anon@noone.knows>
Date:   2017-04-10 17:50:05 -0700

    Version Bump v13.1: #16 fix issue where concat was used incorrectly

diff --git a/package.json b/package.json
index b952b44..602c994 100644
--- a/package.json
+++ b/package.json
@@ -1,6 +1,6 @@
 {
   "name": "smtpapi",
-  "version": "1.3.0",
+  "version": "1.3.1",
   "main": "lib/main.js",
`.trim();
  const obj = util.parseCommit(commitText);
  expect(obj).toMatchObject({
    id: 'cc70261c7cbe458221caec5bfab14745d73cff79',
    author: 'Anon <anon@noone.knows>',
    date: new Date('2017-04-10 17:50:05 -0700'),
    message: 'Version Bump v13.1: #16 fix issue where concat was used incorrectly',
    patch: {
      'package.json': [
        'diff --git a/package.json b/package.json',
        'index b952b44..602c994 100644',
        '--- a/package.json',
        '+++ b/package.json',
        '@@ -1,6 +1,6 @@',
        ' {',
        '   "name": "smtpapi",',
        '-  "version": "1.3.0",',
        '+  "version": "1.3.1",',
        '   "main": "lib/main.js",',
      ]
    },
    version: '1.3.1',
    ignoreMessage: true,
  })
});

test('parseCommit commit with resolved issue', () => {
  const commitTexts = [
  `
commit 21a63493df3557cf4efd31fe9d902cbd33734743
Author: Anon <anon@noone.knows>
Date:   2018-11-01 00:03:01 -0300

    Using wercker as CI.

    Testing

    close #3

diff --git a/wercker.yml b/wercker.yml
new file mode 100644
index 0000000..f6c9cb5
--- /dev/null
+++ b/wercker.yml
@@ -0,0 +1,5 @@
+box: node:4
+build:
+  steps:
+    - npm-install
+    - npm-test
  `.trim(),
  `
commit 21a63493df3557cf4efd31fe9d902cbd33734743
Author: Anon <anon@noone.knows>
Date:   2018-11-01 00:03:01 -0300

    Using wercker as CI.

    Testing

    closes #3

diff --git a/wercker.yml b/wercker.yml
new file mode 100644
index 0000000..f6c9cb5
--- /dev/null
+++ b/wercker.yml
@@ -0,0 +1,5 @@
+box: node:4
+build:
+  steps:
+    - npm-install
+    - npm-test
  `.trim(),
  `
commit 21a63493df3557cf4efd31fe9d902cbd33734743
Author: Anon <anon@noone.knows>
Date:   2018-11-01 00:03:01 -0300

    Using wercker as CI.

    Testing

    fixes #3

diff --git a/wercker.yml b/wercker.yml
new file mode 100644
index 0000000..f6c9cb5
--- /dev/null
+++ b/wercker.yml
@@ -0,0 +1,5 @@
+box: node:4
+build:
+  steps:
+    - npm-install
+    - npm-test
  `.trim(),
  `
commit 21a63493df3557cf4efd31fe9d902cbd33734743
Author: Anon <anon@noone.knows>
Date:   2018-11-01 00:03:01 -0300

    Using wercker as CI.

    Testing

    fix #3

diff --git a/wercker.yml b/wercker.yml
new file mode 100644
index 0000000..f6c9cb5
--- /dev/null
+++ b/wercker.yml
@@ -0,0 +1,5 @@
+box: node:4
+build:
+  steps:
+    - npm-install
+    - npm-test
  `.trim(),
  ];
  const expected = {
    id: '21a63493df3557cf4efd31fe9d902cbd33734743',
    author: 'Anon <anon@noone.knows>',
    date: new Date('2018-11-01 00:03:01 -0300'),
    message: 'Using wercker as CI.\nTesting',
    patch: {
      'wercker.yml': [
        'diff --git a/wercker.yml b/wercker.yml',
        'new file mode 100644',
        'index 0000000..f6c9cb5',
        '--- /dev/null',
        '+++ b/wercker.yml',
        '@@ -0,0 +1,5 @@',
        '+box: node:4',
        '+build:',
        '+  steps:',
        '+    - npm-install',
        '+    - npm-test',
      ]
    },
    resolvedIssue: '3',
    ignoreMessage: false,
  }
  commitTexts.forEach(commitText => {
    const obj = util.parseCommit(commitText);
    expect(obj).toMatchObject(expected);
  });
});
