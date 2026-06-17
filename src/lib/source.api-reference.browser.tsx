import type { MDXComponents } from 'mdx/types';
import {
  isConversationalAiServerSdkApiReferenceContentPath,
  isRtcAndroidApiReferenceContentPath,
} from './docs-source-buckets';
import {
  preloadConversationalAiServerSdkApiReferenceContent,
  useConversationalAiServerSdkApiReferenceContent,
} from './source.api-reference.conversational-ai-server-sdk.browser';
import {
  preloadOtherApiReferenceContent,
  useOtherApiReferenceContent,
} from './source.api-reference.other.browser';
import {
  preloadRtcAndroidApiReferenceContent,
  useRtcAndroidApiReferenceContent,
} from './source.api-reference.rtc-android.browser';

export function preloadApiReferenceContent(path: string) {
  if (isRtcAndroidApiReferenceContentPath(path)) {
    return preloadRtcAndroidApiReferenceContent(path);
  }

  if (isConversationalAiServerSdkApiReferenceContentPath(path)) {
    return preloadConversationalAiServerSdkApiReferenceContent(path);
  }

  return preloadOtherApiReferenceContent(path);
}

export function useApiReferenceContent(
  path: string,
  props?: { components?: MDXComponents },
) {
  if (isRtcAndroidApiReferenceContentPath(path)) {
    return useRtcAndroidApiReferenceContent(path, props);
  }

  if (isConversationalAiServerSdkApiReferenceContentPath(path)) {
    return useConversationalAiServerSdkApiReferenceContent(path, props);
  }

  return useOtherApiReferenceContent(path, props);
}
