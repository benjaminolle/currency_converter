import Image from "next/image";
import Converter from "@/components/CurrencyConverter";

export default function Home() {
  return (
    <main className="flex flex-1 w-full flex-col justify-center">
      <section className="gap-y-[5rem] cexc-section">
        <div className="cexc-container text-center gap-y-[2rem]">
          <h1 className="max-w-[700px]">Exchange Rate & Currency Converter Tool</h1>
          <p className="max-w-[600px]">Convert seamlessly between global fiat currencies and top cryptocurrencies in real time.</p>
        </div>
        <Converter />
      </section>
    </main>
  );
}
