import { describe, expect, it } from 'vitest';
import { docs } from '../../source.config';

describe('source config', () => {
  it('only includes meta.json and meta.yaml files in the meta collection', () => {
    expect(docs.meta.files).toEqual(['**/meta.{json,yaml}']);
  });
});
