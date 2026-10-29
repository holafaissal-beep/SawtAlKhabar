import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "صوت الخبر | Sawt Al Khabar",
  description: "صوت الحقيقة.. أخبار بلا حدود. تغطية إخبارية بالعربية والإسبانية والفرنسية.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
