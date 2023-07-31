import '@base/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  // prop spreading is necessary for Next.js to work
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Component {...pageProps} />;
}
