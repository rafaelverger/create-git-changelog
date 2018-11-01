
const COMMIT_PROPERTIES_HANDLER = (v) => {
  switch(v.toLowerCase()){
    case 'date':
      return x => new Date(x);
    default:
      return x => x
  }
};

function parseCommit(commitText) {
  const changeLines = commitText.split('\n').filter(line => line.trim());
  const messageStartLine = changeLines.findIndex(line => line.match(/^date:\s*/i)) + 1;
  const patchingDiffStartLine = Math.max(0, changeLines.findIndex(
    line => line.indexOf('diff --git') === 0
  )) || changeLines.length;

  return Object.assign(
    {
      // first line of commit message is its id
      id: changeLines[0].replace(/^commit\s+([a-z0-9]{40}).*/, '$1')
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
    }
  );
}

module.exports = {
  parseCommit
}
