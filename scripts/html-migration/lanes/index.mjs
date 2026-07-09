import { dartdocLane } from './dartdoc.mjs';
import { ditaLane } from './dita.mjs';
import { doxygenJavadocLane } from './doxygen-javadoc.mjs';
import { iosDocGeneratorLane } from './ios-doc-generator.mjs';
import { typedocLane } from './typedoc.mjs';

const sourceLanes = [
  dartdocLane,
  ditaLane,
  doxygenJavadocLane,
  iosDocGeneratorLane,
  typedocLane,
];

export const SOURCE_LANE_IDS = Object.fromEntries(
  sourceLanes.map((lane) => [
    lane.id.toUpperCase().replaceAll('-', '_'),
    lane.id,
  ]),
);

export function getSourceLane(sourceStructure) {
  return (
    sourceLanes.find((lane) => lane.id === sourceStructure.id) ?? {
      id: sourceStructure.id,
      usesSemanticRenderer: false,
    }
  );
}
