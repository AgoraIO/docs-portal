import { expect, it } from 'vitest';
import { rankEnglishDocs } from './english-docs-ranking';
import { classifySearchIntent } from './search-intent';

function doc(title: string, section = '', snippet = '') {
  return { recordKind: 'guide', title, url: `/${title}`, section, snippet };
}

it('prefers the named product overview to endpoint guides for a product query', () => {
  const endpoint = doc('Start a cloud recording task');
  const overview = doc('Cloud Recording overview');
  expect(
    rankEnglishDocs(
      [endpoint, overview],
      classifySearchIntent('cloud recording'),
    ),
  ).toEqual([overview, endpoint]);
});

it('prefers an error code table with the exact number over a longer numeric prefix', () => {
  const release = doc('Release notes', 'Version 110');
  const other = doc('Error codes', 'Common error codes', '1100');
  const target = doc('SDK error codes', 'Common error codes', '110');
  expect(
    rankEnglishDocs(
      [release, other, target],
      classifySearchIntent('error code 110'),
    )[0],
  ).toEqual(target);
});

it('prefers a guide whose title covers the task, including singular and plural forms', () => {
  const release = doc('Release notes', 'Send a message');
  const guide = doc('Send and receive messages');
  expect(
    rankEnglishDocs([release, guide], classifySearchIntent('send a message')),
  ).toEqual([guide, release]);
});
