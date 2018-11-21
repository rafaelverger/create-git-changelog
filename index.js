const spawn = require('child_process').spawn;
const fs = require('fs');

const parseCommit = require('./util').parseCommit;

const pkg = JSON.parse(fs.readFileSync('package.json').toString());
const currVersion = pkg.version;

const defaultOptions = { useTags: false };
module.exports = function(options) {
  console.log('Creating changelog. Current version: ' + currVersion);
  const opts = Object.assign({}, defaultOptions, options);
  const useTags = opts.useTags;
  if (useTags) {
    console.log('** Using only tagged commits as version changes')
  }

  console.log('Fetching git-log');
  const gitHistory = spawn('git', ['log', '-p', '--date=iso', '--decorate']);
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
    const changes = commitsHistory.replace(/\n(commit\s)/g, ':||:$1').split(':||:').slice(1);
    console.log(changes.length + ' commits were found');

    console.log('Parsing commits...')
    const parsedChanges = changes.map(parseCommit).filter(change => (
      change.resolvedIssue || Object.keys(change.patch).length
    ));

    console.log('Sorting commits by version...');
    const unpublishedChanges = [];
    const changesTracker = parsedChanges.reduce((tracker, change, idx, arr) => {
      if ((useTags && change.tag) || (!useTags && change.version)) {
        const version = useTags ? change.tag : change.version;
        if (Object.keys(tracker).length === 1) {
          // if it's the first version found, set curr commits as unpublished version
          [].push.apply(unpublishedChanges, tracker.curr);
        }
        tracker[version] = [];
        tracker.curr = tracker[version];
      }
      tracker.curr.push(change);

      if (Object.keys(tracker).length === 1 && idx === arr.length-1) {
        // if it's the last item and no version is found, set curr commits as unpublished version
        [].push.apply(unpublishedChanges, tracker.curr);
      }
      return tracker;
    }, { curr: [] });
    changesTracker.curr = null;
    delete changesTracker.curr;

    console.log('Writing changelog...');
    const writeVersionChanges = (version, changes) => {
      if (changes.length === 0) return [];
      return ['\n## ' + version].concat(
        changes.map(change => {
          if (change.ignoreMessage) return '';
          const resolvedIssue = change.resolvedIssue;
          return (
            '- ' +
            (resolvedIssue ? '[FIX #' + resolvedIssue + '] ' : '') +
            change.message.replace('\n', '\n  ')
          );
        }).filter(msg => msg)
      )
    };
    const changelog_md = ['# CHANGELOG'].concat(
      writeVersionChanges('unpublished', unpublishedChanges),
      Object.keys(changesTracker)
        .sort((k1, k2) => k2 - k1)
        .reduce((acc, version) => acc.concat(
          writeVersionChanges(version, changesTracker[version])
        ), [])
    );

    fs.writeFileSync('CHANGELOG.md', changelog_md.join('\n') + '\n', 'utf8');
    console.log('Changes dump into CHANGELOG.md');
  });
};
