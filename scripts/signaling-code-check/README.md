# Signaling Apple code check

Compile-checks the Swift and Objective-C code samples in the Signaling docs
against the real AgoraRtmKit SDK.

Every other Signaling platform has had its samples compiled against the shipping
SDK, and each pass found dozens of real defects. iOS and macOS were skipped
because Swift and Objective-C need Xcode, which only runs on macOS. This harness
closes that gap by running on a GitHub Actions macOS runner.

## Run it

Trigger the **Signaling Apple code check** workflow from the Actions tab, or run
it locally on a Mac:

```bash
# 1. Get the SDK. These are the same archives the AgoraRtm_Apple Swift package
#    points its binary targets at, so no Xcode project, CocoaPods or SPM setup
#    is involved.
mkdir -p .sdk
curl -fsSL -o /tmp/AgoraRtmKit.zip https://download.agora.io/rtm2/release/AgoraRtmKit.xcframework_2.3.0.zip
curl -fsSL -o /tmp/aosl.zip        https://download.agora.io/rtm2/release/aosl.xcframework_1.3.5.zip
unzip -q /tmp/AgoraRtmKit.zip -d .sdk
unzip -q /tmp/aosl.zip -d .sdk

# 2. Pull the blocks out of the docs, filtered to one platform range.
node scripts/signaling-code-check/extract-blocks.mjs \
  --platform ios --langs swift,objc --out blocks.json \
  content/docs/en/realtime-media/rtm/quickstart.mdx

# 3. Compile them.
node scripts/signaling-code-check/check-apple.mjs \
  --blocks blocks.json --frameworks .sdk --platform ios \
  --out report.json --summary summary.md
```

`--dry-run` writes the generated sources without compiling, so you can inspect
exactly what the harness feeds the compiler from any OS, including Windows:

```bash
node scripts/signaling-code-check/check-apple.mjs \
  --blocks blocks.json --platform ios --dry-run --work .signaling-code-check
```

## How it works

`extract-blocks.mjs` walks the `.mdx` line by line, tracking the
`<PlatformStructured platform="...">` range each fence sits inside. That filter
matters: one file holds every platform's samples as sibling blocks, so an
unfiltered sweep for Swift fences would also pull in code the iOS reader never
sees.

`check-apple.mjs` wraps each block in a series of candidate shapes and keeps the
first that type-checks:

| Shape | What it suits |
| --- | --- |
| `as-written` | complete samples that bring their own imports |
| `as-written+@end` | the Objective-C class-extension excerpts, which stop before `@end` |
| `file-level` | blocks that declare types but no imports |
| `type-body` / `implementation-body` | property and method declarations |
| `method-body` | bare statement fragments |

Only type-checking runs (`swiftc -typecheck`, `clang -fsyntax-only`). Nothing is
linked, so the harness needs the framework headers but never the binaries, and a
run takes seconds per block.

`harness-context.json` supplies the running-example symbols that the per-step
fragments assume from the rest of the page: the view model's properties, the
view controller's outlets, `addToMessageList`, and so on. A stub is emitted only
when the block does not declare that symbol itself, so a block defining
`var rtmKit` is never flagged for redeclaration.

When an Objective-C block declares a real class interface, the harness treats it
as the page's own header and writes it to the include path. Sibling blocks that
`#import "ViewController.h"` then resolve against the header the docs actually
publish. If the docs omit a property the samples use, that surfaces as a failure
instead of being hidden by an invented stub.

## Reading the results

A failing block is a finding to triage, not a broken harness, so the run exits 0
whenever it managed to check anything. Before counting a failure as a doc bug,
check which shape it got to and what the diagnostic says. Some blocks are
deliberate pseudocode or signature listings and will never compile; the Unity
pass miscounted 17 blocks that way before they were reclassified.

The `summary.md` "Blocks the harness had to adjust" section lists every
transformation applied, such as substituting Xcode `<#placeholder#>` tokens.
Those are choices the harness made on your behalf, so read them before trusting
a pass.

## Extending it

- **macOS**: pass `--platform macos`. The quickstart has no macOS range, but
  the `build/` pages do.
- **Other pages**: pass more `.mdx` paths to the extractor. The api-ref page
  `content/docs/en/api-reference/api-ref/signaling/ios.mdx` is the other large
  source of samples.
- **Running on pull requests**: see the note at the top of
  `.github/workflows/signaling-apple-code-check.yml`.

## What this does not catch

Compiling proves the API names and types are right. It does not prove the code
works. Two defect classes on other platforms were invisible to the compiler and
needed separate audits, both worth running here:

- **Delegate methods that are never called.** `AgoraRtmClientDelegate` methods
  are optional, so a misspelled selector or a wrong parameter type compiles
  cleanly and silently never fires. The C++ pass found exactly this bug in
  `onLoginResult`.
- **Section headings that name a different method than the section documents.**
  76 of those were wrong across the Signaling platform pages.
