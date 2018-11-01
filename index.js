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
  const parsedChanges = changes.map(parseCommit).filter(change => (
    change.resolvedIssue || Object.keys(change.patch).length
  ));

  console.log('Sorting commits by version...');
  const changesTracker = parsedChanges.reduce((tracker, change, idx, arr) => {
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

  console.log('Writing changelog...');
  const changelog_md = Object.keys(changesTracker)
    .sort((k1, k2) => k1.match(/\d+\.\d+\.\d+/) ? (k2 - k1) : -1)
    .filter(version => changesTracker[version].length)
    .reduce((file, version) => file.concat(
      ['## ' + version],
      changesTracker[version]
        .map(change => '- ' + change.message.replace('\n', '\n  ')),
      ['']
    ), ['# CHANGELOG\n']);

  fs.writeFileSync('CHANGELOG.md', changelog_md.join('\n') + '\n', 'utf8');
  console.log('Changes dump into CHANGELOG.md');
  process.exit(0);
});

