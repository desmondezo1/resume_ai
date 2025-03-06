import type { AppProps } from 'next/app';
import { Toaster } from '../components/ui/toast';
import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Resume AI Voice Chat</title>
        <meta name="description" content="Upload your resume and chat with an AI agent based on it" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
      <Toaster position="top-center" />
    </>
  );
}