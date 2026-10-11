<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture decisions
- Watch pages are open to all visitors; playback is gated in PlayPage via `playbackLocked` (signed out → sign-in prompt, no active subscription → plan prompt). Do not re-add redirects to /login or /subscribe from PlayPage.
- All content notifications (bell + toasts) are built from `src/lib/content-notifications.ts` so links carry the exact season/episode (`/play/{id}?type=series&season=N&ep=M`) and use the series poster.
- `bun:test` is typed through `src/types/bun-test.d.ts`; tests run with `bun test`, not vitest.
