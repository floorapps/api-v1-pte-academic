# Deploying

@doc-version: 16.0.3

Next.js can be deployed as a Node.js server, Docker container, static export, or adapted to run on different platforms.

| Deployment Option                | Feature Support   |
| -------------------------------- | ----------------- |
| [Node.js server](#nodejs-server) | All               |
| [Docker container](#docker)      | All               |
| [Static export](#static-export)  | Limited           |
| [Adapters](#adapters)            | Platform-specific |

## Node.js server

Next.js can be deployed to any provider that supports Node.js. Ensure your `package.json` has the `"build"` and `"start"` scripts:

```json filename="package.json"
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

Then, run `npm run build` to build your application and `npm run start` to start the Node.js server. This server supports all Next.js features. If needed, you can also eject to a [custom server](/docs/app/guides/custom-server.md).

Node.js deployments support all Next.js features. Learn how to [configure them](/docs/app/guides/self-hosting.md) for your infrastructure.

### Templates

* [Flightcontrol](https://github.com/nextjs/deploy-flightcontrol)
* [Railway](https://github.com/nextjs/deploy-railway)
* [Replit](https://github.com/nextjs/deploy-replit)

## Docker

Next.js can be deployed to any provider that supports [Docker](https://www.docker.com/) containers. This includes container orchestrators like Kubernetes or a cloud provider that runs Docker.

Docker deployments support all Next.js features. Learn how to [configure them](/docs/app/guides/self-hosting.md) for your infrastructure.

> **Note for development:** While Docker is excellent for production deployments, consider using local development (`npm run dev`) instead of Docker during development on Mac and Windows for better performance. [Learn more about optimizing local development](/docs/app/guides/local-development.md).

### Templates

* [Docker](https://github.com/vercel/next.js/tree/canary/examples/with-docker)
* [Docker Multi-Environment](https://github.com/vercel/next.js/tree/canary/examples/with-docker-multi-env)
* [DigitalOcean](https://github.com/nextjs/deploy-digitalocean)
* [Fly.io](https://github.com/nextjs/deploy-fly)
* [Google Cloud Run](https://github.com/nextjs/deploy-google-cloud-run)
* [Render](https://github.com/nextjs/deploy-render)
* [SST](https://github.com/nextjs/deploy-sst)

## Static export

Next.js enables starting as a static site or [Single-Page Application (SPA)](/docs/app/guides/single-page-applications.md), then later optionally upgrading to use features that require a server.

Since Next.js supports [static exports](/docs/app/guides/static-exports.md), it can be deployed and hosted on any web server that can serve HTML/CSS/JS static assets. This includes tools like AWS S3, Nginx, or Apache.

Running as a [static export](/docs/app/guides/static-exports.md) **does not** support Next.js features that require a server. [Learn more](/docs/app/guides/static-exports.md#unsupported-features).

### Templates

* [GitHub Pages](https://github.com/nextjs/deploy-github-pages)

## Adapters

Next.js can be adapted to run on different platforms to support their infrastructure capabilities.

Refer to each provider's documentation for information on supported Next.js features:

* [Appwrite Sites](https://appwrite.io/docs/products/sites/quick-start/nextjs)
* [AWS Amplify Hosting](https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components)
* [Cloudflare](https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs)
* [Deno Deploy](https://docs.deno.com/examples/next_tutorial)
* [Netlify](https://docs.netlify.com/frameworks/next-js/overview/#next-js-support-on-netlify)
* [Vercel](https://vercel.com/docs/frameworks/nextjs)

> **Note:** We are working on a [Deployment Adapters API](https://github.com/vercel/next.js/discussions/77740) for all platforms to adopt. After completion, we will add documentation on how to write your own adapters.# Deploying
@doc-version: 16.0.3

Next.js can be deployed as a Node.js server, Docker container, static export, or adapted to run on different platforms.

| Deployment Option                | Feature Support   |
| -------------------------------- | ----------------- |
| [Node.js server](#nodejs-server) | All               |
| [Docker container](#docker)      | All               |
| [Static export](#static-export)  | Limited           |
| [Adapters](#adapters)            | Platform-specific |

## Node.js server

Next.js can be deployed to any provider that supports Node.js. Ensure your `package.json` has the `"build"` and `"start"` scripts:

```json filename="package.json"
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

Then, run `npm run build` to build your application and `npm run start` to start the Node.js server. This server supports all Next.js features. If needed, you can also eject to a [custom server](/docs/app/guides/custom-server.md).

Node.js deployments support all Next.js features. Learn how to [configure them](/docs/app/guides/self-hosting.md) for your infrastructure.

### Templates

* [Flightcontrol](https://github.com/nextjs/deploy-flightcontrol)
* [Railway](https://github.com/nextjs/deploy-railway)
* [Replit](https://github.com/nextjs/deploy-replit)

## Docker

Next.js can be deployed to any provider that supports [Docker](https://www.docker.com/) containers. This includes container orchestrators like Kubernetes or a cloud provider that runs Docker.

Docker deployments support all Next.js features. Learn how to [configure them](/docs/app/guides/self-hosting.md) for your infrastructure.

> **Note for development:** While Docker is excellent for production deployments, consider using local development (`npm run dev`) instead of Docker during development on Mac and Windows for better performance. [Learn more about optimizing local development](/docs/app/guides/local-development.md).

### Templates

* [Docker](https://github.com/vercel/next.js/tree/canary/examples/with-docker)
* [Docker Multi-Environment](https://github.com/vercel/next.js/tree/canary/examples/with-docker-multi-env)
* [DigitalOcean](https://github.com/nextjs/deploy-digitalocean)
* [Fly.io](https://github.com/nextjs/deploy-fly)
* [Google Cloud Run](https://github.com/nextjs/deploy-google-cloud-run)
* [Render](https://github.com/nextjs/deploy-render)
* [SST](https://github.com/nextjs/deploy-sst)

## Static export

Next.js enables starting as a static site or [Single-Page Application (SPA)](/docs/app/guides/single-page-applications.md), then later optionally upgrading to use features that require a server.

Since Next.js supports [static exports](/docs/app/guides/static-exports.md), it can be deployed and hosted on any web server that can serve HTML/CSS/JS static assets. This includes tools like AWS S3, Nginx, or Apache.

Running as a [static export](/docs/app/guides/static-exports.md) **does not** support Next.js features that require a server. [Learn more](/docs/app/guides/static-exports.md#unsupported-features).

### Templates

* [GitHub Pages](https://github.com/nextjs/deploy-github-pages)

## Adapters

Next.js can be adapted to run on different platforms to support their infrastructure capabilities.

Refer to each provider's documentation for information on supported Next.js features:

* [Appwrite Sites](https://appwrite.io/docs/products/sites/quick-start/nextjs)
* [AWS Amplify Hosting](https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components)
* [Cloudflare](https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs)
* [Deno Deploy](https://docs.deno.com/examples/next_tutorial)
* [Netlify](https://docs.netlify.com/frameworks/next-js/overview/#next-js-support-on-netlify)
* [Vercel](https://vercel.com/docs/frameworks/nextjs)

> **Note:** We are working on a [Deployment Adapters API](https://github.com/vercel/next.js/discussions/77740) for all platforms to adopt. After completion, we will add documentation on how to write your own adapters.<https://react.dev/reference/react/ActivityReact> 19.2 and Canary Features
The App Router in Next.js 16 uses the latest React Canary release, which includes the newly released React 19.2 features and other features being incrementally stabilized. Highlights include:

View Transitions: Animate elements that update inside a Transition or navigation
useEffectEvent: Extract non-reactive logic from Effects into reusable Effect Event functions
Activity: Render "background activity" by hiding UI with display: none while maintaining state and cleaning up Effects
Learn more in the React 19.2 announcement.

Breaking Changes and Other Updates
Version Requirements
Change Details
Node.js 20.9+ Minimum version now 20.9.0 (LTS); Node.js 18 no longer supported
TypeScript 5+ Minimum version now 5.1.0
Browsers Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+
Removals
These features were previously deprecated and are now removed:

Removed Replacement
AMP support All AMP APIs and configs removed (useAmp, export const config = { amp: true })
next lint command Use Biome or ESLint directly; next build no longer runs linting. A codemod is available: npx @next/codemod@canary next-lint-to-eslint-cli .
devIndicators options appIsrStatus, buildActivity, buildActivityPosition removed from config. The indicator remains.
serverRuntimeConfig, publicRuntimeConfig Use environment variables (.env files)
experimental.turbopack location Config moved to top-level turbopack (no longer in experimental)
experimental.dynamicIO flag Renamed to cacheComponents
experimental.ppr flag PPR flag removed; evolving into Cache Components programming model
export const experimental_ppr Route-level PPR export removed; evolving into Cache Components programming model
Automatic scroll-behavior: smooth Add data-scroll-behavior="smooth" to HTML document to opt back in
unstable_rootParams() We are working on an alternative API that we will ship in an upcoming minor
Sync params, searchParams props access Must use async: await params, await searchParams
Sync cookies(), headers(), draftMode() access Must use async: await cookies(), await headers(), await draftMode()
Metadata image route params argument Changed to async params; id from generateImageMetadata now Promise<string>
next/image local src with query strings Now requires images.localPatterns config to prevent enumeration attacks
Behavior Changes
These features have new default behaviors in Next.js 16:

Changed Behavior Details
Default bundler Turbopack is now the default bundler for all apps; opt out with next build --webpack
images.minimumCacheTTL default Changed from 60s to 4 hours (14400s); reduces revalidation cost for images without cache-control headers
images.imageSizes default Removed 16 from default sizes (used by only 4.2% of projects); reduces srcset size and API variations
images.qualities default Changed from [1..100] to [75]; quality prop is now coerced to closest value in images.qualities
images.dangerouslyAllowLocalIP New security restriction blocks local IP optimization by default; set to true for private networks only
images.maximumRedirects default Changed from unlimited to 3 redirects maximum; set to 0 to disable or increase for rare edge cases
@next/eslint-plugin-next default Now defaults to ESLint Flat Config format, aligning with ESLint v10 which will drop legacy config support
Prefetch cache behavior Complete rewrite with layout deduplication and incremental prefetching
revalidateTag() signature Now requires cacheLife profile as second argument for stale-while-revalidate behavior
Babel configuration in Turbopack Automatically enables Babel if a babel config is found (previously exited with hard error)
Terminal output Redesigned with clearer formatting, better error messages, and improved performance metrics
Dev and build output directories next dev and next build now use separate output directories, enabling concurrent execution
Lockfile behavior Added lockfile mechanism to prevent multiple next dev or next build instances on the same project
Parallel routes default.js All parallel route slots now require explicit default.js files; builds fail without them. Create default.js that calls notFound() or returns null for previous behavior
Modern Sass API Bumped sass-loader to v16, which supports modern Sass syntax and new features
Deprecations
These features are deprecated in Next.js 16 and will be removed in a future version:

Deprecated Details
middleware.ts filename Rename to proxy.ts to clarify network boundary and routing focus
next/legacy/image component Use next/image instead for improved performance and features
images.domains config Use images.remotePatterns config instead for improved security restriction
revalidateTag() single argument Use revalidateTag(tag, profile) for SWR, or updateTag(tag) in Actions for read-your-writes
Additional Improvements
Performance improvements: Significant performance optimizations for next dev and next start commands
Node.js native TypeScript for next.config.ts: Run next dev, next build, and next start comma
