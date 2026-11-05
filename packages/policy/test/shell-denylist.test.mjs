import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkShell } from '@x/policy';

const mustDeny = [
  'rm -fr /',
  'rm -rf ~',
  'rm -rf $HOME',
  'rm -f -r /',
  'rm -R /*',
  'rm -rf ~/*',
  'rm -rf /',
  'cd /tmp && sudo rm foo',
  'ls | sudo tee /x',
  'true; su root',
  'sudo ls',
  '  sudo ls',
  ':(){ :|:& };:',
  'reboot',
  'shutdown -h now',
  'halt',
  'poweroff',
];

const mustAllow = [
  'echo halt-test',
  'npm run reboot-docs',
  'rm -rf ./build',
  'rm -rf /tmp/foo',
  'ls -la',
];

for (const cmd of mustDeny) {
  test(`denies: ${cmd}`, () => {
    assert.equal(checkShell(cmd).ok, false);
  });
}

for (const cmd of mustAllow) {
  test(`allows: ${cmd}`, () => {
    assert.equal(checkShell(cmd).ok, true);
  });
}
