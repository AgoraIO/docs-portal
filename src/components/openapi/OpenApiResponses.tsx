import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { slugOpenApiAnchorSegment } from '@/lib/openapi/anchors';
import {
  getDefaultOpenApiMediaType,
  getDefaultOpenApiResponseStatus,
  type OpenApiResponseHeaderView,
  type OpenApiResponseView,
} from '@/lib/openapi/response-view';

const OPENAPI_MAJOR_SECTION_HEADING_CLASS = 'font-semibold text-2xl';

export function OpenApiResponses({
  renderDescription,
  renderHeaders,
  renderSchema,
  responses,
}: {
  renderDescription: (markdown: string) => ReactNode;
  renderHeaders: (
    headers: OpenApiResponseHeaderView[],
    status: string,
  ) => ReactNode;
  renderSchema: ({
    mediaType,
    schema,
    status,
  }: {
    mediaType: string;
    schema: unknown;
    status: string;
  }) => { hasFields: boolean; node: ReactNode };
  responses: OpenApiResponseView[];
}) {
  const defaultStatus = getDefaultOpenApiResponseStatus(responses);
  const [expandedStatuses, setExpandedStatuses] = useState(
    () => new Set(defaultStatus ? [defaultStatus] : []),
  );
  const [selectedMediaTypes, setSelectedMediaTypes] = useState<
    Map<string, string>
  >(() => getDefaultMediaTypes(responses));
  const previousResponses = useRef(responses);

  useEffect(() => {
    if (previousResponses.current === responses) return;

    previousResponses.current = responses;
    const nextDefaultStatus = getDefaultOpenApiResponseStatus(responses);
    setExpandedStatuses(new Set(nextDefaultStatus ? [nextDefaultStatus] : []));
    setSelectedMediaTypes(getDefaultMediaTypes(responses));
  }, [responses]);

  useResponseHashExpansion(responses, setExpandedStatuses);

  return (
    <section className="mt-8" data-openapi-responses id="response-body">
      <h2
        className={`mb-3 scroll-mt-24 ${OPENAPI_MAJOR_SECTION_HEADING_CLASS}`}
      >
        Response Body
      </h2>
      <div className="border border-fd-border text-fd-card-foreground">
        {responses.map((response, index) => {
          const selectedMediaType =
            selectedMediaTypes.get(response.statusCode) ??
            getDefaultOpenApiMediaType(response);
          const selectedMedia = response.mediaTypes.find(
            (media) => media.mediaType === selectedMediaType,
          );
          const isExpanded = expandedStatuses.has(response.statusCode);
          const panelId = `openapi-response-${slugOpenApiAnchorSegment(response.statusCode)}`;
          return (
            <div
              className={index === 0 ? '' : 'border-fd-border border-t'}
              key={response.statusCode}
            >
              <button
                aria-controls={panelId}
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-fd-accent/50"
                onClick={() =>
                  setExpandedStatuses((current) => {
                    const next = new Set(current);
                    if (next.has(response.statusCode)) {
                      next.delete(response.statusCode);
                    } else {
                      next.add(response.statusCode);
                    }
                    return next;
                  })
                }
                type="button"
              >
                <code className="font-medium text-fd-foreground text-sm">
                  {response.statusCode}
                </code>
                {selectedMediaType ? (
                  <span className="font-mono text-fd-muted-foreground text-xs">
                    {selectedMediaType}
                  </span>
                ) : null}
              </button>
              {isExpanded ? (
                <div
                  className="border-fd-border border-t px-4 py-4"
                  id={panelId}
                >
                  {response.description ? (
                    <div className="prose-no-margin text-fd-muted-foreground text-sm">
                      {renderDescription(response.description)}
                    </div>
                  ) : null}
                  {response.mediaTypes.length > 1 ? (
                    <div className="mt-3">
                      <label
                        className="sr-only"
                        htmlFor={`openapi-response-media-${slugOpenApiAnchorSegment(response.statusCode)}`}
                      >
                        Media type for {response.statusCode} response
                      </label>
                      <select
                        className="h-9 rounded-md border border-fd-border bg-fd-secondary px-2 text-sm"
                        id={`openapi-response-media-${slugOpenApiAnchorSegment(response.statusCode)}`}
                        onChange={(event) =>
                          setSelectedMediaTypes((current) => {
                            const next = new Map(current);
                            next.set(response.statusCode, event.target.value);
                            return next;
                          })
                        }
                        value={selectedMediaType}
                      >
                        {response.mediaTypes.map((media) => (
                          <option key={media.mediaType} value={media.mediaType}>
                            {media.mediaType}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  {response.headers.length > 0 ? (
                    <div className="mt-4">
                      {renderHeaders(response.headers, response.statusCode)}
                    </div>
                  ) : null}
                  <div className="mt-4">
                    <ResponseSchemaState
                      response={response}
                      selectedMedia={selectedMedia}
                      renderSchema={renderSchema}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ResponseSchemaState({
  response,
  selectedMedia,
  renderSchema,
}: {
  response: OpenApiResponseView;
  selectedMedia?: OpenApiResponseView['mediaTypes'][number];
  renderSchema: ({
    mediaType,
    schema,
    status,
  }: {
    mediaType: string;
    schema: unknown;
    status: string;
  }) => { hasFields: boolean; node: ReactNode };
}) {
  if (!response.hasContent) return <p>Empty response body</p>;
  if (response.mediaTypes.length === 0 || !selectedMedia) {
    return <p>Schema not provided</p>;
  }
  // biome-ignore lint/suspicious/noPrototypeBuiltins: This must distinguish schema: false from an absent key.
  if (!Object.prototype.hasOwnProperty.call(selectedMedia.source, 'schema')) {
    return <p>Schema not provided</p>;
  }

  const result = renderSchema({
    mediaType: selectedMedia.mediaType,
    schema: selectedMedia.schema,
    status: response.statusCode,
  });

  if (result.hasFields) return result.node;
  return result.node ?? <p>Schema has no fields</p>;
}

function getDefaultMediaTypes(responses: OpenApiResponseView[]) {
  return new Map(
    responses.map((response) => [
      response.statusCode,
      getDefaultOpenApiMediaType(response),
    ]),
  );
}

function useResponseHashExpansion(
  responses: OpenApiResponseView[],
  setExpandedStatuses: Dispatch<SetStateAction<Set<string>>>,
) {
  useEffect(() => {
    const expandHashTarget = () => {
      const hash = window.location.hash.slice(1);
      const response = responses.find((candidate) => {
        const status = slugOpenApiAnchorSegment(candidate.statusCode);
        return (
          hash.startsWith(`responses-${status}-`) ||
          hash.startsWith(`response-headers-${status}-`)
        );
      });

      if (!response) return;
      setExpandedStatuses((current) => {
        if (current.has(response.statusCode)) return current;
        const next = new Set(current);
        next.add(response.statusCode);
        return next;
      });
    };

    expandHashTarget();
    window.addEventListener('hashchange', expandHashTarget);
    return () => window.removeEventListener('hashchange', expandHashTarget);
  }, [responses, setExpandedStatuses]);
}
