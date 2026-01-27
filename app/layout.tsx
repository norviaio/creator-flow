import "./globals.css";
import { HeaderWrapper } from "@/components/HeaderWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <HeaderWrapper />
        <main>{children}</main>
      </body>
    </html>
  );
}
