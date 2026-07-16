export const metadata = {
  title: "Resume Maximizer API",
  description: "Backend services for an AI-assisted CS student resume builder"
};

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
