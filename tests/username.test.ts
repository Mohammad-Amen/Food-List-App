/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  emailToHandle,
  formatHandle,
  handleKey,
  handleToEmail,
  parseHandle,
  randomTag,
  validateName,
} from '../src/lib/username.ts';

test('randomTag is always 4 digits', () => {
  assert.equal(randomTag(() => 0), '0000');
  assert.equal(randomTag(() => 0.0042), '0042');
  assert.equal(randomTag(() => 0.99999), '9999');
  for (let i = 0; i < 200; i++) assert.match(randomTag(), /^\d{4}$/);
});

test('validateName', () => {
  assert.equal(validateName('أمي'), null);
  assert.equal(validateName('Mom 2'), null);
  assert.equal(validateName('أ'), 'tooShort');
  assert.equal(validateName('   '), 'tooShort');
  assert.equal(validateName('اسم طويل جداً جداً'), 'tooLong');
  assert.equal(validateName('mom#1'), 'invalidChars');
  assert.equal(validateName('a@b'), 'invalidChars');
});

test('parseHandle accepts Arabic-Indic digits and extra spaces', () => {
  assert.deepEqual(parseHandle('أمي#4821'), { name: 'أمي', tag: '4821' });
  assert.deepEqual(parseHandle('  أمي#٤٨٢١ '), { name: 'أمي', tag: '4821' });
  assert.deepEqual(parseHandle('ام  محمد#0001'), { name: 'ام محمد', tag: '0001' });
  assert.equal(parseHandle('أمي'), null);
  assert.equal(parseHandle('أمي#12'), null);
  assert.equal(parseHandle('#1234'), null);
});

test('handleKey is case-insensitive', () => {
  assert.equal(handleKey('Mom#1234'), 'mom#1234');
  assert.equal(handleKey('mom#1234'), handleKey('MOM#1234'));
});

test('handle ↔ email round trip, ASCII-only and short enough', () => {
  for (const h of ['أمي#4821', 'mom#0001', 'ام محمد#9999', 'أبو_علي#1234']) {
    const email = handleToEmail(h)!;
    assert.match(email, /^[a-z0-9.]+@users\.foodlist\.app$/);
    assert.ok(email.split('@')[0].length <= 64, email);
    assert.equal(emailToHandle(email), formatHandle(parseHandle(h)!.name.toLowerCase(), parseHandle(h)!.tag));
  }
  // Worst case: 12 Arabic letters (2 bytes each) still fits the 64-char local part.
  const longest = handleToEmail('ابتثجحخدذرزس#1234')!;
  assert.ok(longest.split('@')[0].length <= 64);
  assert.equal(handleToEmail('Mom#1234'), handleToEmail('mom#1234'));
  assert.equal(handleToEmail('nope'), null);
});
