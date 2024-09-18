import type { Metadata } from "next";
import "./globals.css";
import { Roboto_Serif } from "next/font/google";
import { Providers } from "./providers/providers";

const roboto = Roboto_Serif({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Wheel Smithi",
  description: "Wheel game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <div className="">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
