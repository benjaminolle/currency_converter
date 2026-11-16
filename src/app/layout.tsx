import type { Metadata } from "next";
import { Parkinsans } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import StaticParticleBg from "@/components/StaticParticleBg";


const parkinSans = Parkinsans({
  variable: "--font-parkinsans",
  subsets: ["latin"],
  display: 'swap',
  adjustFontFallback: false,
});


export const metadata: Metadata = {
  title: "Currency Converter",
  description: "Exchange Rate and Currency converter tool",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", parkinSans.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        <StaticParticleBg spacing={128}
          jitter={5}
          connectDiagonals={false}
          dotRadius={1}
          centerOpacity={0} // 12% visible in the middle (use 0 for completely clear)
          fadeRadius={900}
          dotColor="rgba(5, 48, 7, 0.4)"
          lineColor="rgba(2, 51, 25, 0.08)" />
        {children}
      </body>
    </html>
  );
}
