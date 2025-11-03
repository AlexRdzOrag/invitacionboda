import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-900">
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-[390px]">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
 