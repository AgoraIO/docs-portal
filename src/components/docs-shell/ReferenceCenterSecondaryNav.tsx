'use client';

import type { ReferenceCenterContext } from '@/lib/reference-center-navigation';
import { ApiReferenceProductNav } from './ApiReferenceProductNav';
import { FaqCategoryNav } from './FaqCategoryNav';
import { SdkDownloadProductNav } from './SdkDownloadProductNav';

export function ReferenceCenterSecondaryNav({
  activePath,
  context,
  onSelectPath,
}: {
  activePath: string;
  context: ReferenceCenterContext;
  onSelectPath: () => void;
}) {
  if (context === 'api') {
    return <ApiReferenceProductNav />;
  }
  if (context === 'sdks') {
    return <SdkDownloadProductNav />;
  }
  if (context === 'faq') {
    return (
      <FaqCategoryNav activePath={activePath} onSelectPath={onSelectPath} />
    );
  }

  return null;
}
