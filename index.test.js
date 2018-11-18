const EventEmitter = require('events');
const fs = require('fs')

test('changelog creation', (done) => {
  jest.mock('child_process');
  const spawnMock = require('child_process').spawn;
  const commitHistory = fs.readFileSync('./__mock__/commit.history');

  const emitter = new EventEmitter();
  emitter.stderr = new EventEmitter();
  emitter.stdout = new EventEmitter();

  spawnMock.mockReturnValue(emitter);

  fs.watchFile('CHANGELOG.md', (curr, prev) => {
    const changelog = fs.readFileSync('CHANGELOG.md').toString();
    expect(changelog).toMatchSnapshot();
    done();
  });

  require('./index')();

  emitter.stdout.emit('data', commitHistory);
  emitter.emit('close', 0);
});
