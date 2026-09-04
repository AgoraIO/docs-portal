import { describe, expect, it } from 'vitest';
import { API_REFERENCE_CAPABILITY_GROUPS } from '@/lib/api-reference-navigation';
import { buildSdkCapabilityGroups } from './sdk-download-capabilities';
import type { SdkDownloadPlatform } from './sdk-downloads-data';

const platforms: readonly SdkDownloadPlatform[] = [
  {
    id: 'android',
    label: 'Android',
    core: [
      {
        id: 'video-sdk-android',
        label: 'Video SDK',
        info: 'video',
        versions: [],
      },
      {
        id: 'voice-sdk-android',
        label: 'Voice SDK',
        info: 'voice',
        versions: [],
      },
      {
        id: 'fastboard-sdk-android',
        label: 'Fastboard SDK',
        info: 'fastboard',
        versions: [],
      },
      {
        id: 'agents-sdk-android',
        label: 'Agents SDK',
        info: 'agents',
        versions: [],
      },
    ],
  },
];

describe('buildSdkCapabilityGroups', () => {
  it('uses the API reference capability order and labels', () => {
    const groups = buildSdkCapabilityGroups(platforms);

    expect(groups.map((group) => group.id)).toEqual([
      'conversational-ai',
      'realtime-core',
      'extensions-ecosystem',
    ]);
    expect(groups.map((group) => group.label)).toEqual([
      API_REFERENCE_CAPABILITY_GROUPS.find(
        (group) => group.id === 'conversational-ai',
      )?.label,
      API_REFERENCE_CAPABILITY_GROUPS.find(
        (group) => group.id === 'realtime-core',
      )?.label,
      API_REFERENCE_CAPABILITY_GROUPS.find(
        (group) => group.id === 'extensions-ecosystem',
      )?.label,
    ]);
  });

  it('maps SDK products to the agreed nearest capability', () => {
    const groups = buildSdkCapabilityGroups(platforms);

    expect(
      groups
        .find((group) => group.id === 'conversational-ai')
        ?.products.map((product) => product.productId),
    ).toEqual(['agents']);
    expect(
      groups
        .find((group) => group.id === 'realtime-core')
        ?.products.map((product) => product.productId),
    ).toEqual(['video', 'voice']);
    expect(
      groups
        .find((group) => group.id === 'extensions-ecosystem')
        ?.products.map((product) => product.productId),
    ).toEqual(['fastboard']);
  });

  it('omits capability groups that have no SDK product', () => {
    expect(
      buildSdkCapabilityGroups([{ id: 'python', label: 'Python', core: [] }]),
    ).toEqual([]);
  });
});
