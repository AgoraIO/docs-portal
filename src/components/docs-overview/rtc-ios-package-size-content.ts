import type { SdkDownloadVersion } from './sdk-downloads-data';

export function getRtcIosPackageSizeContent(
  product: 'video' | 'voice',
  version: SdkDownloadVersion,
) {
  if (!version.packageSize) return undefined;
  if (/\bLite\b/i.test(version.label))
    return `参考包体积增量：${version.packageSize}`;
  return `RtcBasic 基础库参考包体积增量：${version.packageSize}。${product === 'video' ? 'Full SDK ' : ''}实际增量取决于集成的组件和构建配置。`;
}
