import {
  type SdkDownloadProduct,
  type SdkDownloadVersion,
  sdkDownloadPlatforms,
} from '@/components/docs-overview/sdk-downloads-data';
import { deriveInstallCommand } from '@/components/docs-overview/sdk-install-command';

const SDK_CATALOG_COMPONENT = /<SdksCatalog\s*\/>/g;

export function expandSdkCatalogMarkdown(processedText: string) {
  return processedText.replace(SDK_CATALOG_COMPONENT, () =>
    buildSdkCatalogMarkdown(),
  );
}

function buildSdkCatalogMarkdown() {
  const sections = sdkDownloadPlatforms.map((platform) => {
    const products = [...platform.core, ...(platform.addOns ?? [])];

    return [
      `### ${platform.label}`,
      ...products.map(buildProductMarkdown),
    ].join('\n\n');
  });

  return [
    '## SDK catalog',
    'The catalog below lists the latest available SDK release for each supported platform.',
    ...sections,
  ].join('\n\n');
}

function buildProductMarkdown(product: SdkDownloadProduct) {
  const details = [`#### ${product.label}`, product.info];
  const explicitlyCurrentVersions = product.versions.filter((version) =>
    /\bLatest\b/i.test(version.label),
  );
  const currentVersions = explicitlyCurrentVersions.length
    ? explicitlyCurrentVersions
    : product.versions.slice(0, 1);

  if (!currentVersions.length) {
    return details.join('\n\n');
  }

  return [
    ...details,
    currentVersions.map(buildVersionMarkdown).join('\n'),
  ].join('\n\n');
}

function buildVersionMarkdown(version: SdkDownloadVersion) {
  const installCommand = deriveInstallCommand(version);
  const links = [`- Current release: ${version.label}`];

  if (installCommand) {
    links.push(
      `- Install with ${installCommand.tool}: \`${installCommand.command}\``,
    );
  }
  if (version.packageManager) {
    links.push(`- Package manager: [Open package](${version.packageManager})`);
  }
  if (version.downloadLink) {
    links.push(`- Download: [Download SDK](${version.downloadLink})`);
  }

  return links.join('\n');
}
