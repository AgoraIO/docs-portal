# Cloud Recording Script Download Link Design

## Goal

Make the current Agora Cloud Recording format-conversion script downloadable from the English merge-files guide.

## Scope

In `content/docs/en/realtime-media/cloud-recording/build/process-recorded-files/merge-files.mdx`, link the existing download instruction in the “Get the script” section to the current package URL used by the Chinese guide:

`https://download.agora.io/ardsdk/release/rtsc-convert_tool.v3.17.4.17-202607170725-release-prod.tar.gz`

Do not change the page’s instructions, examples, parameter descriptions, output naming, or Chinese content. Verify the edited content and run the repository’s documentation type check.

## Design Review

- Scope is limited to one Markdown link in the English guide.
- The package URL was verified against the corresponding Chinese guide.
- No implementation or runtime behavior changes are involved.
