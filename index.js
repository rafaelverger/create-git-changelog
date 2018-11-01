const spawn = require('child_process').spawn;
const fs = require('fs');

const parseCommit = require('./util').parseCommit;

const pkg = JSON.parse(fs.readFileSync('package.json').toString());
const currVersion = pkg.version;
console.log('Creating changelog. Current version: ' + currVersion);

console.log('Fetching git-log');
const gitHistory = spawn('git', ['log', '-p', '--date=iso']);
gitHistory.stderr.on('data', (data) => {
  console.error(data.toString());
});

// `\n` is necessary due to `split` in line#16
var commitsHistory = '\n';
gitHistory.stdout.on('data', (buffer) => {
  console.log('.');
  commitsHistory += buffer.toString();
});


gitHistory.on('close', (code) => {
  console.log('git-log fetched')
  const changes = commitsHistory.split(/\ncommit\s/g).slice(1);
  console.log(changes.length + ' commits were found');

  console.log('Parsing commits...')
  const changesObject = changes.map(changeText => {
    const change = parseCommit(changeText);
    const packageChange = change.patch['package.json'];
    if (packageChange) {
      const versionChange = packageChange.find(diffLine => diffLine.indexOf('+  "version":') === 0);
      if (versionChange) {
        change.version = versionChange.replace(/.*?"(\d+\.\d+\.\d+)".*/, '$1');
      }
    }
    return change;
  }).sort();

  console.log('Sorting commits by version...');
  // const fixIssueRegex = /((fix(es)?)|(closes?))\s?#\d+\b/i;
  const changesTracker = changesObject.reduce((tracker, change, idx, arr) => {
    if (change.version) {
      if (Object.keys(tracker).length === 1) {
        // if it's the first version found, set curr commits as unpublished version
        tracker.unpublished = tracker.curr;
      }
      tracker[change.version] = [];
      tracker.curr = tracker[change.version];
    }
    tracker.curr.push(change);

    if (Object.keys(tracker) === 1 && idx === arr.length-1) {
      // if it's the last item and no version is found, set curr commits as unpublished version
      changesTracker.unpublished = changesTracker.curr;
    }
    return tracker;
  }, { curr: [] });
  changesTracker.curr = null;
  delete changesTracker.curr;


  const changelog_md = Object.keys(changesTracker)
    .sort((k1, k2) => k1.match(/\d+\.\d+\.\d+/) ? (k2 - k1) : -1)
    .filter(version => changesTracker[version].length)
    .reduce((file, version) => file.concat(
      ['## ' + version], changesTracker[version].map(change => '- ' + change.message)
    ), ['# CHANGELOG\n']);

  fs.writeFileSync('CHANGELOG.md', changelog_md.join('\n') + '\n', 'utf8');
  console.log('Changes dump into CHANGELOG.md');
  process.exit(0);
});

