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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { syncDocsHashTargetFromLocation } from '@/lib/docs-hash';
import {
  buildOpenApiResponseSchemaAnchorId,
  slugOpenApiAnchorSegment,
} from '@/lib/openapi/anchors';
import {
  getDefaultOpenApiMediaType,
  getDefaultOpenApiResponseStatus,
  type OpenApiResponseHeaderView,
  type OpenApiResponseView,
} from '@/lib/openapi/response-view';
import { OpenApiSectionHeading } from './OpenApiSectionHeading';

export type OpenApiResponseLabels = {
  mediaTypeForResponse: (status: string) => string;
  responses: string;
  responseBody: string;
  schemaHasNoFields: string;
  schemaNotProvided: string;
};

export function OpenApiResponses({
  labels,
  renderDescription,
  renderHeaders,
  renderSchema,
  responses,
  sectionId,
}: {
  labels: OpenApiResponseLabels;
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
  const [selectedStatus, setSelectedStatus] = useState(defaultStatus);
  const [hashRevision, setHashRevision] = useState(0);
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
    setSelectedStatus(nextDefaultStatus);
    setSelectedMediaTypes(getDefaultMediaTypes(responses));
  }, [responses]);

  useResponseHashSelection(
    pendingHashRef,
    responses,
    setSelectedStatus,
    setSelectedMediaTypes,
    setHashRevision,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Scroll after each hash-driven tab selection commits, including repeated targets in one tab.
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
  }, [hashRevision]);

  useEffect(
    () => () => {
      if (hashScrollFrameRef.current !== undefined) {
        window.cancelAnimationFrame(hashScrollFrameRef.current);
      }
    },
    [],
  );

  return (
    <section className="mt-8" data-openapi-responses>
      <OpenApiSectionHeading id={sectionId}>
        {labels.responses}
      </OpenApiSectionHeading>
      {responses.length > 0 ? (
        <Tabs
          className="min-w-0 gap-0"
          onValueChange={(value) =>
            setSelectedStatus(decodeURIComponent(value))
          }
          value={encodeURIComponent(selectedStatus)}
        >
          <div className="overflow-x-auto border-b border-fd-border pb-px">
            <TabsList
              aria-label={labels.responses}
              className="min-w-full justify-start px-1 group-data-[orientation=horizontal]/tabs:h-auto"
              variant="line"
            >
              {responses.map((response) => (
                <TabsTrigger
                  className="min-h-11 px-3"
                  key={response.statusCode}
                  value={encodeURIComponent(response.statusCode)}
                >
                  {response.statusCode}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {responses.map((response, index) => {
            const selectedMediaType =
              selectedMediaTypes.get(response.statusCode) ??
              getDefaultOpenApiMediaType(response);
            const selectedMedia = response.mediaTypes.find(
              (media) => media.mediaType === selectedMediaType,
            );
            const isSelected = selectedStatus === response.statusCode;
            const statusId = slugOpenApiAnchorSegment(response.statusCode);
            const mediaSelectId = `${sectionId}-${instanceId}-response-${index}-${statusId}-media`;
            return (
              <TabsContent
                className="min-w-0 py-4"
                key={response.statusCode}
                value={encodeURIComponent(response.statusCode)}
              >
                {isSelected ? (
                  <>
                    {response.description ? (
                      <div className="prose-no-margin text-fd-muted-foreground text-sm">
                        {renderDescription(response.description)}
                      </div>
                    ) : null}
                    {response.headers.length > 0 ? (
                      <div className="mt-4">
                        {renderHeaders(response.headers, response.statusCode)}
                      </div>
                    ) : null}
                    {response.hasContent ? (
                      <section className="mt-6">
                        <h3 className="mb-3 font-semibold text-base">
                          {labels.responseBody}
                        </h3>
                        {response.mediaTypes.length > 1 ? (
                          <div className="mb-3">
                            <label className="sr-only" htmlFor={mediaSelectId}>
                              {labels.mediaTypeForResponse(response.statusCode)}
                            </label>
                            <select
                              className="h-9 rounded-md border border-fd-border bg-fd-secondary px-2 text-sm"
                              id={mediaSelectId}
                              onChange={(event) =>
                                setSelectedMediaTypes((current) => {
                                  const next = new Map(current);
                                  next.set(
                                    response.statusCode,
                                    event.target.value,
                                  );
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
                        <ResponseSchemaState
                          labels={labels}
                          response={response}
                          selectedMedia={selectedMedia}
                          renderSchema={renderSchema}
                        />
                      </section>
                    ) : null}
                  </>
                ) : null}
              </TabsContent>
            );
          })}
        </Tabs>
      ) : null}
    </section>
  );
}

function ResponseSchemaState({
  labels,
  response,
  selectedMedia,
  renderSchema,
}: {
  labels: OpenApiResponseLabels;
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
  if (response.mediaTypes.length === 0 || !selectedMedia) {
    return <p>{labels.schemaNotProvided}</p>;
  }
  // biome-ignore lint/suspicious/noPrototypeBuiltins: This must distinguish schema: false from an absent key.
  if (!Object.prototype.hasOwnProperty.call(selectedMedia.source, 'schema')) {
    return <p>{labels.schemaNotProvided}</p>;
  }

  const result = renderSchema({
    mediaType: selectedMedia.mediaType,
    schema: selectedMedia.schema,
    status: response.statusCode,
  });

  return result.hasFields ? result.node : <p>{labels.schemaHasNoFields}</p>;
}

function getDefaultMediaTypes(responses: OpenApiResponseView[]) {
  return new Map(
    responses.map((response) => [
      response.statusCode,
      getDefaultOpenApiMediaType(response),
    ]),
  );
}

function useResponseHashSelection(
  pendingHashRef: MutableRefObject<boolean>,
  responses: OpenApiResponseView[],
  setSelectedStatus: Dispatch<SetStateAction<string>>,
  setSelectedMediaTypes: Dispatch<SetStateAction<Map<string, string>>>,
  setHashRevision: Dispatch<SetStateAction<number>>,
) {
  useEffect(() => {
    const expandHashTarget = () => {
      const hash = window.location.hash.slice(1);
      const copiedSchemaTarget = responses
        .flatMap((response) =>
          response.mediaTypes.map((media) => ({ media, response })),
        )
        .find(({ media, response }) => {
          return (
            hash ===
            buildOpenApiResponseSchemaAnchorId(
              response.statusCode,
              media.mediaType,
              response.mediaTypes.map((item) => item.mediaType),
            )
          );
        });
      const response =
        copiedSchemaTarget?.response ??
        responses.find((candidate) => {
          const status = slugOpenApiAnchorSegment(candidate.statusCode);
          return (
            hash.startsWith(`responses-${status}-`) ||
            hash.startsWith(`response-headers-${status}-`)
          );
        });

      if (!response) return;
      if (copiedSchemaTarget) {
        setSelectedMediaTypes((current) => {
          const next = new Map(current);
          next.set(response.statusCode, copiedSchemaTarget.media.mediaType);
          return next;
        });
      }
      pendingHashRef.current = true;
      setSelectedStatus(response.statusCode);
      // A second hash can target another field inside the already selected tab.
      setHashRevision((revision) => revision + 1);
    };

    expandHashTarget();
    window.addEventListener('hashchange', expandHashTarget);
    return () => window.removeEventListener('hashchange', expandHashTarget);
  }, [
    pendingHashRef,
    responses,
    setSelectedStatus,
    setSelectedMediaTypes,
    setHashRevision,
  ]);
}
