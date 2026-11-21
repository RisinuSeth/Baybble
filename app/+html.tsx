import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=baybble-original-2" />
        <link rel="shortcut icon" type="image/svg+xml" href="/favicon.svg?v=baybble-original-2" />
      </head>
      <body>{children}</body>
    </html>
  );
}
