import { NotificationProvider } from "@/context/NotificationProvider";

// ... existing code ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.variable} font-cairo antialiased bg-white text-slate-900`}
      >
        <NotificationProvider>
          <GlobalHeader />
          {children}
          <Footer />
        </NotificationProvider>
      </body>
    </html>
  );
}
