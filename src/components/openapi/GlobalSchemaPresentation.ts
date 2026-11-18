import { createContext, useContext } from 'react';

export const GlobalSchemaPresentation = createContext(false);

export function useGlobalSchemaPresentation() {
  return useContext(GlobalSchemaPresentation);
}
