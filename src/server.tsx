import {
  defineHandlerCallback,
  renderSsrHtmlResponse,
} from '@tanstack/react-router/ssr/server';
import {
  createServerEntry,
  createStartHandler,
  defaultStreamHandler,
  StartServer,
} from '@tanstack/react-start/server';
import { renderStaticHtml } from './lib/render-static-html';

const handler = defineHandlerCallback((context) => {
  const { router, request, responseHeaders } = context;
  if (!router.options.isPrerendering || router.isShell())
    return defaultStreamHandler(context);
  return renderSsrHtmlResponse({
    router,
    responseHeaders,
    render: () =>
      renderStaticHtml(<StartServer router={router} />, {
        signal: request.signal,
      }),
  });
});

export default createServerEntry({ fetch: createStartHandler(handler) });
