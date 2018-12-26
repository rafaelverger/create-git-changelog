
const COMMIT_HASH_REGEX = /^commit\s+([a-z0-9]{40}).*/i;
const COMMIT_TAG_REGEX = /^.*\(tag:\s?(.*?)(,.*)*\)/i;
const FIX_ISSUE_REGEX = /((fix(es)?)|(closes?))\s?#(\d+)\b/i;
const REFS_ISSUE_REGEX = /(\s*[\w]+\s*)?#(\d+)/i;
const REFS_REGEX = /re((fs?)|(l)|(ferences?)|(lated))\s*/i;

const COMMIT_PROPERTIES_HANDLER = (v) => {
  switch(v.toLowerCase()){
    case 'date':
      return x => new Date(x);
    case 'merge':
      return x => x.split(' ');
    default:
      return x => x
  }
};

function getCommitHash(commitFirstLine) {
  return COMMIT_HASH_REGEX.exec(commitFirstLine)[1];
}

function findCommitTag(commitFirstLine) {
  const rs = COMMIT_TAG_REGEX.exec(commitFirstLine);
  return rs ? rs[1] : null;
}

function parseCommit(commitText) {
  const changeLines = commitText.split('\n').filter(line => line.trim());
  const messageStartLine = changeLines.findIndex(line => line.match(/^date:\s*/i)) + 1;
  const patchingDiffStartLine = Math.max(0, changeLines.findIndex(
    line => line.indexOf('diff --git') === 0
  )) || changeLines.length;

  const change = Object.assign(
    {
      // first line of commit message is its id and tag
      id: getCommitHash(changeLines[0]),
      tag: findCommitTag(changeLines[0])
    },
    changeLines.slice(1, messageStartLine).reduce((obj, line) => {
      const kv = line.split(':');
      const key = kv[0].toLowerCase().trim();
      const value = kv.slice(1).join(':').trim();
      const handler = COMMIT_PROPERTIES_HANDLER(key);
      obj[key] = handler(value);
      return obj;
    }, {}),
    {
      // after commit date line we have commit's message untill patching diff appears
      message: changeLines.slice(messageStartLine, patchingDiffStartLine).map(l => l.trim()).join('\n'),
      // if commit have patching diff it will be stored below
      patch: changeLines.slice(patchingDiffStartLine).reduce((obj, line, idx, arr) => {
        if (line.indexOf('diff --git') === 0) {
          const fname = line.replace(/^diff --git a\/.* b\//, '');
          obj[fname] = [];
          obj.current = obj[fname];
        }
        obj.current.push(line);
        if (idx === arr.length-1) {
          obj.current = null;
          delete obj.current;
        }
        return obj;
      }, {}),
      relatedIssues: [],
    }
  );
  const packageChange = change.patch['package.json'];
  if (packageChange) {
    const versionChange = packageChange.find(diffLine => diffLine.indexOf('+  "version":') === 0);
    if (versionChange) {
      change.version = versionChange.replace(/.*?"(\d+\.\d+\.\d+(-\w+(\.\d+)?)?)".*/, '$1');
    }
  }

  const fixedIssue = FIX_ISSUE_REGEX.exec(change.message)
  if (fixedIssue) {
    change.resolvedIssue = fixedIssue[5];
    change.message = change.message
      .replace(fixedIssue[0], '')
      .replace(/\s+?(\s)/g, '$1')
      .trim();
  }

  var relatedIssues;
  while (relatedIssues = REFS_ISSUE_REGEX.exec(change.message)) {
    change.relatedIssues.push(relatedIssues[2]);
    change.message = change.message.replace(REFS_ISSUE_REGEX, (_, txt, issue) => (
      (!txt || txt.match(REFS_REGEX)) ? '' : txt
    ))
  }

  // trimming message lines
  change.message = change.message.replace(/\s+\n/gm, '\n');

  change.ignoreMessage = !!(
    change.version &&
    Object.keys(change.patch).every(file => file.match(/(package.json)|(changelog.md)/i)) &&
    change.patch['package.json'].filter(l => l.match(/^\+[^\+]/)).length === 1
  );

  return change;
}

module.exports = {
  parseCommit
}
