import {
  type Dispatch,
  type MutableRefObject,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { syncDocsHashTargetFromLocation } from '@/lib/docs-hash';
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
  sectionId,
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
  sectionId: string;
}) {
  const defaultStatus = getDefaultOpenApiResponseStatus(responses);
  const [expandedStatuses, setExpandedStatuses] = useState(
    () => new Set(defaultStatus ? [defaultStatus] : []),
  );
  const [selectedMediaTypes, setSelectedMediaTypes] = useState<
    Map<string, string>
  >(() => getDefaultMediaTypes(responses));
  const previousResponses = useRef(responses);
  const instanceId = useId().replace(/:/g, '');
  const pendingHashRef = useRef(false);
  const hashScrollFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (previousResponses.current === responses) return;

    previousResponses.current = responses;
    const nextDefaultStatus = getDefaultOpenApiResponseStatus(responses);
    setExpandedStatuses(new Set(nextDefaultStatus ? [nextDefaultStatus] : []));
    setSelectedMediaTypes(getDefaultMediaTypes(responses));
  }, [responses]);

  useResponseHashExpansion(pendingHashRef, responses, setExpandedStatuses);

  // biome-ignore lint/correctness/useExhaustiveDependencies: A pending hash must scroll after the matching expansion commits.
  useEffect(() => {
    if (!pendingHashRef.current) return;

    pendingHashRef.current = false;
    if (hashScrollFrameRef.current !== undefined) {
      window.cancelAnimationFrame(hashScrollFrameRef.current);
    }
    hashScrollFrameRef.current = window.requestAnimationFrame(() => {
      hashScrollFrameRef.current = undefined;
      syncDocsHashTargetFromLocation('auto');
    });
  }, [expandedStatuses]);

  useEffect(
    () => () => {
      if (hashScrollFrameRef.current !== undefined) {
        window.cancelAnimationFrame(hashScrollFrameRef.current);
      }
    },
    [],
  );

  return (
    <section className="mt-8" data-openapi-responses id={sectionId}>
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
          const statusId = slugOpenApiAnchorSegment(response.statusCode);
          const triggerId = `${sectionId}-${instanceId}-response-${index}-${statusId}-trigger`;
          const panelId = `${sectionId}-${instanceId}-response-${index}-${statusId}-panel`;
          const mediaSelectId = `${sectionId}-${instanceId}-response-${index}-${statusId}-media`;
          return (
            <div
              className={index === 0 ? '' : 'border-fd-border border-t'}
              key={response.statusCode}
            >
              <button
                aria-controls={panelId}
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-fd-accent/50"
                id={triggerId}
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
              {/* biome-ignore lint/a11y/useSemanticElements: The explicit region role is part of the accordion panel contract. */}
              <div
                aria-labelledby={triggerId}
                className="border-fd-border border-t px-4 py-4"
                hidden={!isExpanded}
                id={panelId}
                role="region"
              >
                {isExpanded ? (
                  <>
                    {response.description ? (
                      <div className="prose-no-margin text-fd-muted-foreground text-sm">
                        {renderDescription(response.description)}
                      </div>
                    ) : null}
                    {response.mediaTypes.length > 1 ? (
                      <div className="mt-3">
                        <label className="sr-only" htmlFor={mediaSelectId}>
                          Media type for {response.statusCode} response
                        </label>
                        <select
                          className="h-9 rounded-md border border-fd-border bg-fd-secondary px-2 text-sm"
                          id={mediaSelectId}
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
                            <option
                              key={media.mediaType}
                              value={media.mediaType}
                            >
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
                  </>
                ) : null}
              </div>
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
  pendingHashRef: MutableRefObject<boolean>,
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
      pendingHashRef.current = true;
      setExpandedStatuses((current) => {
        return new Set([...current, response.statusCode]);
      });
    };

    expandHashTarget();
    window.addEventListener('hashchange', expandHashTarget);
    return () => window.removeEventListener('hashchange', expandHashTarget);
  }, [pendingHashRef, responses, setExpandedStatuses]);
}
