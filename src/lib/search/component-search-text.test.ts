import { describe, expect, it } from 'vitest';
import { getComponentSearchText } from './component-search-text';

describe('component prose contracts', () => {
  it('retains API parameter identity and modifiers but excludes similarly named configuration', () => {
    const values = getComponentSearchText(
      '<Parameter name="uid" type="number" direction="[in]" defaultValue="0" possibleValues="1, 2" required nullable /><ApiSignature labels="inline pure" /><ApiReturns /><Slot name="config-slot" /><ApiReferenceCards type="all" />',
    );
    expect(values).toEqual(
      expect.arrayContaining([
        'uid',
        'number',
        '[in]',
        '0',
        '1, 2',
        'required',
        'nullable',
        'inline pure',
        'Returns',
      ]),
    );
    expect(values).not.toContain('config-slot');
    expect(values).not.toContain('all');
  });
  it('matches optional flags and required precedence without evaluating expressions', () => {
    expect(getComponentSearchText('<Parameter required={false} />')).toEqual([
      'optional',
      'Optional',
    ]);
    expect(
      getComponentSearchText('<ParameterList required optional />'),
    ).toEqual(['required']);
    expect(
      getComponentSearchText(
        '<Parameter required={isRequired()} nullable={false} />',
      ),
    ).toEqual([]);
    expect(getComponentSearchText('<ApiReturns title="返回值" />')).toEqual([
      '返回值',
    ]);
  });
  it('retains plan prose and selected SDK versions without leaking configuration', () => {
    const values = getComponentSearchText(
      '<PlanCards plans={[{name: "体验套餐", features: ["免费试用"], badge: "推荐", accent: "blue"}]} /><ProductSdkDownloads versionIds={["1.8.2-fastboard-android"]} /><DownloadResourceCards items={[{platform: "ios", version: "4.6.0"}, {platform: "android"}]} />',
    );
    expect(values).toEqual(
      expect.arrayContaining([
        '体验套餐',
        '免费试用',
        '推荐',
        '1.8.2',
        'iOS',
        'Android',
        '4.6.0',
      ]),
    );
    expect(values).not.toContain('blue');
    expect(values).not.toContain('1.8.2-fastboard-android');
  });
});
