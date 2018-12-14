jest.mock('child_process');

const EventEmitter = require('events');
const fs = require('fs')

const spawnMock = require('child_process').spawn;

afterAll((done) => {
  const spawn = require.requireActual('child_process').spawn;
  const cmd = spawn('git', ['checkout', '--', 'CHANGELOG.md']);
  cmd.stderr.on('data', (data) => {
    console.error(data.toString());
    done(new Error('error clearing CHANGELOG.md file'))
  });
  cmd.on('close', (code) => done());
}, 500);

function assertChangelog(commitHistory, options, done) {
  const emitter = new EventEmitter();
  emitter.stderr = new EventEmitter();
  emitter.stdout = new EventEmitter();

  spawnMock.mockReturnValueOnce(emitter);

  const watchListener = fs.watchFile('CHANGELOG.md', (curr, prev) => {
    const changelog = fs.readFileSync('CHANGELOG.md').toString();
    expect(changelog).toMatchSnapshot();
    fs.unwatchFile('CHANGELOG.md', watchListener);
    done();
  });

  require('./index')(options);

  emitter.stdout.emit('data', commitHistory);
  emitter.emit('close', 0);
}

test('changelog creation', (done) => {
  const commitHistory = fs.readFileSync('./__mock__/commit.history');
  assertChangelog(commitHistory, {}, done);
}, 6000);

test('changelog creation using more than 2 lines', (done) => {
  const commitHistory = fs.readFileSync('./__mock__/commit.history');
  assertChangelog(commitHistory, { descLines: 3 }, done);
}, 6000);

test('changelog creation with only unpublished changes', (done) => {
  const commitHistory = fs.readFileSync('./__mock__/commit_unpublished.history');
  assertChangelog(commitHistory, {}, done);
}, 6000);

test('changelog creation with tagged commits', (done) => {
  const commitHistory = fs.readFileSync('./__mock__/commit_tagged.history');
  assertChangelog(commitHistory, { useTags: true }, done);
}, 6000);
