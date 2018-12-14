const spawn = require('child_process').spawn;
const fs = require('fs');

const logger = require('./logger');
const parseCommit = require('./util').parseCommit;

const pkg = JSON.parse(fs.readFileSync('package.json').toString());
const currVersion = pkg.version;

const defaultOptions = { useTags: false, descLines: 2 };
module.exports = function(options) {
  logger.info('Creating changelog. Current version: ' + currVersion);
  const opts = Object.assign({}, defaultOptions, options);
  logger.info('** Commits description will be truncated in ' + opts.descLines + ' lines');
  const useTags = opts.useTags;
  if (useTags) {
    logger.info('** Using only tagged commits as version changes')
  }

  logger.info('Fetching git-log...');
  const gitHistory = spawn('git', ['log', '-p', '--date=iso', '--decorate']);
  gitHistory.stderr.on('data', (data) => {
    logger.error(data.toString());
  });

  // `\n` is necessary due to `split` in line#16
  var commitsHistory = '\n';

  gitHistory.stdout.on('data', (buffer) => {
    commitsHistory += buffer.toString();
    const logSize = parseFloat(commitsHistory.length/1024.0).toFixed(2);
    logger.progress('Fetched ' + logSize + 'Kb from git-log...');
  });


  gitHistory.on('close', (code) => {
    logger.info('git-log fetched')
    // doing (':|:'+':|:') is necessary to avoid spliting this line after commit
    const changes = commitsHistory
      .replace(/^(commit\s+([a-zA-Z0-9]{40})(\s+\([^\)]+\))?)$/gm, ':|:'+':|:$1')
      .split(':|:'+':|:')
      .slice(1);
    const totalChanges = changes.length;
    logger.info(totalChanges + ' commits were found');

    logger.info('Parsing commits...')
    const parsedChanges = changes.map((c, i) => {
      logger.progress('Parsing commits: ' + parseFloat(100.0*i/totalChanges).toFixed(2) + '%');
      return parseCommit(c);
    }).filter(change => (
      change.resolvedIssue || Object.keys(change.patch).length
    ));
    logger.info('Valid commits: ' + parsedChanges.length);

    logger.info('Sorting commits by version...');
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

    logger.info('Writing changelog...');
    const writeVersionChanges = (version, changes) => {
      if (changes.length === 0) return [];
      return ['\n## ' + version].concat(
        changes.map(change => {
          if (change.ignoreMessage) return '';
          const resolvedIssue = change.resolvedIssue;
          return (
            '- ' +
            (resolvedIssue ? '[FIX #' + resolvedIssue + '] ' : '') +
            change.message.split(/\n/).slice(0, opts.descLines).join('\n  ')
          );
        }).filter(msg => msg)
      )
    };
    const changelog_md = ['# CHANGELOG'].concat(
      writeVersionChanges('unpublished', unpublishedChanges),
      Object.keys(changesTracker)
        .sort()
        .reverse()
        .reduce((acc, version) => acc.concat(
          writeVersionChanges(version, changesTracker[version])
        ), [])
    );

    fs.writeFileSync('CHANGELOG.md', changelog_md.join('\n') + '\n', 'utf8');
    logger.info('Changes dump into CHANGELOG.md');
  });
};
