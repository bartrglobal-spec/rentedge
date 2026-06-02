import "./globals.css";
import Shell from "./Shell";

export const metadata = {
  title: "RentEdge",
  description: "Know where you stand before you apply",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="app-bg">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}