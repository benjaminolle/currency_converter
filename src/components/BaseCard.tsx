"use client"
import { CurrencySelector, type Currency } from "@/components/CurrencySelector";

interface BaseCardProps {
    className?: string
    currencies: Currency[]
    currency: string
    onCurrencyChange: (currency: string) => void
    amount: string
    onAmountChange: (amount: string) => void
    isRateLoading: boolean
}

export default function BaseCard({
    className = "",
    currencies,
    currency,
    onCurrencyChange,
    amount,
    onAmountChange,
    isRateLoading,
}: BaseCardProps) {
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
                className="focus:outline-none border-b border-current/20 text-5xl font-bold text-center w-full max-w-50 text-dark-green"
            />
            <span className="text-sm">1 {currency}</span>
        </div>
    );
}