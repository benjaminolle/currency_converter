"use client"
import { CurrencySelector, type Currency } from "@/components/CurrencySelector";

interface QuoteCardProps {
    className?: string
    currencies: Currency[]
    baseCurrency: string
    currency: string
    onCurrencyChange: (currency: string) => void
    amount: string
    onAmountChange: (amount: string) => void
    rate: number | null
    rateError: string | null
    isRateLoading: boolean
}

export default function QuoteCard({
    className,
    currencies,
    baseCurrency,
    currency,
    onCurrencyChange,
    amount,
    onAmountChange,
    rate,
    rateError,
    isRateLoading,
}: QuoteCardProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^\d.]/g, "");
        const [int, ...rest] = raw.split(".");
        onAmountChange(rest.length ? `${int}.${rest.join("").replace(/\./g, "")}` : int);
    };

    const handleBlur = () => {
        if (amount === "") {
            onAmountChange("1.00");
        } else {
            onAmountChange(Number(amount).toFixed(2));
        }
    };

    return (
        <div className={`cexc-card cexc-div w-full min-w-0 items-center gap-y-[1.5rem] md:gap-y-[3rem] ${className}`}>
            <CurrencySelector currencies={currencies} value={currency} onChange={onCurrencyChange} />
            <input
                type="text"
                value={amount}
                autoComplete="off"
                onBlur={handleBlur}
                onChange={handleChange}
                inputMode="decimal"
                placeholder={isRateLoading && amount === "" ? "…" : undefined}
                aria-busy={isRateLoading}
                className="focus:outline-none border-b border-current/50 text-5xl font-bold text-center w-full max-w-50"
            />
            <span>
                {isRateLoading
                    ? "Updating..."
                    : rateError
                        ? "Exchange rate unavailable"
                        : rate === null
                            ? "Exchange rate unavailable"
                            : `${rate} ${currency}`}
            </span>
        </div>
    );
}