import { ReferenceSearchInput } from '@/components/reference-center/ReferenceFilterControls';

export function FaqSearch({
  placeholder,
  query,
  setQuery,
}: {
  placeholder: string;
  query: string;
  setQuery: (query: string) => void;
}) {
  return (
    <ReferenceSearchInput
      onChange={setQuery}
      placeholder={placeholder}
      value={query}
    />
  );
}
