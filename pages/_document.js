import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
      <footer className="w-full bg-gray-100 py-6 text-gray-600 text-center border-t">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6">
          <div className="flex space-x-6">
            <a
              href="https://thewebmole.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Terms
            </a>
            <a
              href="https://thewebmole.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Privacy
            </a>
            <a
              href="https://thewebmole.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Contact
            </a>
          </div>
          <p className="mt-4 md:mt-0 text-sm">
            © 2025{" "}
            <a
              href="https://thewebmole.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              thewebmole.com
            </a>
            , Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </Html>
  );
}
