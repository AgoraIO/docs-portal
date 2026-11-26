import { createIsomorphicFn } from '@tanstack/react-start';
import type { ResultsSnapshot, Selection } from './docs-measurement';
import {
  invitationAllowed as browserInvitationAllowed,
  measurementEnabled as browserMeasurementEnabled,
  getDocsMeasurement as getBrowserMeasurement,
  markInvitationVisible as markBrowserInvitationVisible,
  selectDocsResult as selectBrowserResult,
} from './measurement.client';

// Shared components render on both sides. Start removes the browser adapter
// from the server graph and supplies inert server implementations.
export const getDocsMeasurement = createIsomorphicFn()
  .server(() => undefined)
  .client(() => getBrowserMeasurement());

export const measurementEnabled = createIsomorphicFn()
  .server(() => false)
  .client(() => browserMeasurementEnabled());

export const selectDocsResult = createIsomorphicFn()
  .server(
    (
      _snapshot: ResultsSnapshot | undefined,
      selection: Selection,
      _newTab = false,
    ) => selection.path,
  )
  .client(
    (
      snapshot: ResultsSnapshot | undefined,
      selection: Selection,
      newTab = false,
    ) => selectBrowserResult(snapshot, selection, newTab),
  );

export const invitationAllowed = createIsomorphicFn()
  .server(() => false)
  .client(() => browserInvitationAllowed());

export const markInvitationVisible = createIsomorphicFn()
  .server(() => {})
  .client(() => markBrowserInvitationVisible());
