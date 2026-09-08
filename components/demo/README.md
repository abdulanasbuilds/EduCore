# EduCore Demo Mode

The `/demo` route is a public, local-only product simulation. It intentionally does not authenticate against Supabase and does not call school notification, payment, or email providers.

The demo dataset lives in `lib/demo/data.ts` and the interactive shell lives in `components/demo/DemoApp.tsx`.

## Design rule

Demo data may be fictional, but interactions should remain honest: actions such as attendance changes and fee payments update local session state only. Nothing is written to a school database.

## Production isolation

Production school routes continue using the existing authenticated application and Supabase data layer. The demo is a separate route and provider, so public visitors cannot affect production school records.

## QA note

Before using `/demo` as a public sales surface, run the repository in a browser and verify every demo role and interactive action. The current environment supports static repository inspection but not full browser execution.
