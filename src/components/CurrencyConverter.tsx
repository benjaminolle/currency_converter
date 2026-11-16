"use client";

import BaseCard from "@/components/BaseCard";
import QuoteCard from "@/components/QuoteCard";
import type { Currency } from "@/components/CurrencySelector";
import { useCallback, useEffect, useRef, useState } from "react";

const refreshCooldownMs = 30_000;
const refreshCooldownStorageKey = "currency-converter:rates-refresh-available-at";

interface CachedRate {
    rate: number
    date: string | null
}

function isRateResult(value: unknown): value is { rate: number; date: string } {
    return (
        typeof value === "object" &&
        value !== null &&
        "rate" in value &&
        typeof value.rate === "number" &&
        "date" in value &&
        typeof value.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value.date)
    );
}

export default function Converter() {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [baseCurrency, setBaseCurrency] = useState("EUR");
    const [quoteCurrency, setQuoteCurrency] = useState("USD");
    const [amount, setAmount] = useState("1.00");
    const [amountSide, setAmountSide] = useState<"base" | "quote">("base");
    const [rate, setRate] = useState<number | null>(null);
    const [rateDate, setRateDate] = useState<string | null>(null);
    const [isRateLoading, setIsRateLoading] = useState(true);
    const [rateError, setRateError] = useState<string | null>(null);
    const [refreshAvailableAt, setRefreshAvailableAt] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const rateCache = useRef(new Map<string, CachedRate>());
    const rateRequestId = useRef(0);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            const storedTime = Number(localStorage.getItem(refreshCooldownStorageKey));
            if (Number.isFinite(storedTime) && storedTime > Date.now()) {
                setRefreshAvailableAt(storedTime);
                setCurrentTime(Date.now());
            } else {
                localStorage.removeItem(refreshCooldownStorageKey);
            }
        });

        return () => window.cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        if (refreshAvailableAt === null) {
            return;
        }

        const interval = window.setInterval(() => {
            const now = Date.now();
            setCurrentTime(now);
            if (now >= refreshAvailableAt) {
                setRefreshAvailableAt(null);
                localStorage.removeItem(refreshCooldownStorageKey);
            }
        }, 250);

        return () => window.clearInterval(interval);
    }, [refreshAvailableAt]);

    useEffect(() => {
        async function loadCurrencies() {
            const res = await fetch('/api/currencies');
            const data = await res.json();
            setCurrencies(data);
        }
        loadCurrencies();
    }, []);

    const loadRate = useCallback(async (forceRefresh = false) => {
        const requestId = ++rateRequestId.current;
        const pairKey = `${baseCurrency}/${quoteCurrency}`;
        setIsRateLoading(true);
        setRateError(null);

        if (!forceRefresh) {
            const cached = rateCache.current.get(pairKey);
            if (cached) {
                setRate(cached.rate);
                setRateDate(cached.date);
                setIsRateLoading(false);
                return;
            }
            setRateDate(null);
        }

        if (baseCurrency === quoteCurrency) {
            const cached = { rate: 1, date: null };
            rateCache.current.set(pairKey, cached);
            setRate(cached.rate);
            setRateDate(cached.date);
            setIsRateLoading(false);
            return;
        }

        try {
            const params = new URLSearchParams({
                base: baseCurrency,
                quote: quoteCurrency,
                ...(forceRefresh ? { refresh: "true" } : {}),
            });
            const res = await fetch(`/api/rates?${params}`, {
                cache: "no-store",
            });
            if (!res.ok) {
                if (forceRefresh && res.status === 429) {
                    const retryAfter = Number(res.headers.get("Retry-After"));
                    if (Number.isFinite(retryAfter) && retryAfter > 0) {
                        const availableAt = Date.now() + retryAfter * 1000;
                        setRefreshAvailableAt(availableAt);
                        localStorage.setItem(refreshCooldownStorageKey, String(availableAt));
                    }
                }
                throw new Error(`Rate request failed (${res.status})`);
            }

            const data: unknown = await res.json();
            if (!isRateResult(data)) {
                throw new Error("The rates API returned an unexpected response.");
            }

            if (requestId === rateRequestId.current) {
                const cached = { rate: data.rate, date: data.date };
                rateCache.current.set(pairKey, cached);
                setRate(cached.rate);
                setRateDate(cached.date);
                setIsRateLoading(false);
            }
        } catch (error) {
            if (requestId === rateRequestId.current) {
                setRateError(error instanceof Error ? error.message : "Unable to load exchange rate.");
                setIsRateLoading(false);
            }
        }
    }, [baseCurrency, quoteCurrency]);

    useEffect(() => {
        void loadRate();
        return () => {
            rateRequestId.current += 1;
        };
    }, [loadRate]);

    const numericAmount = Number(amount);
    const hasValidAmount = amount.trim() !== "" && Number.isFinite(numericAmount);
    const baseAmount =
        amountSide === "base"
            ? amount
            : rate !== null && hasValidAmount
                ? (numericAmount / rate).toFixed(2)
                : "";
    const quoteAmount =
        amountSide === "quote"
            ? amount
            : rate !== null && hasValidAmount
                ? (numericAmount * rate).toFixed(2)
                : "";

    const handleBaseAmountChange = (nextAmount: string) => {
        setAmount(nextAmount);
        setAmountSide("base");
    };

    const handleQuoteAmountChange = (nextAmount: string) => {
        setAmount(nextAmount);
        setAmountSide("quote");
    };
    const refreshCooldownSeconds = refreshAvailableAt === null
        ? 0
        : Math.max(0, Math.ceil((refreshAvailableAt - currentTime) / 1000));

    const handleManualRefresh = () => {
        if (isRateLoading || refreshCooldownSeconds > 0) {
            return;
        }

        const availableAt = Date.now() + refreshCooldownMs;
        setRefreshAvailableAt(availableAt);
        setCurrentTime(Date.now());
        localStorage.setItem(refreshCooldownStorageKey, String(availableAt));
        void loadRate(true);
    };

    return (
        <div className="cexc-container gap-y-[4rem]">
            {rateError && <p role="alert">{rateError}</p>}
            <div className="grid w-full min-w-0 md:grid-cols-2 justify-items-center items-center gap-5">
                <BaseCard
                    currencies={currencies}
                    currency={baseCurrency}
                    onCurrencyChange={setBaseCurrency}
                    amount={baseAmount}
                    onAmountChange={handleBaseAmountChange}
                    isRateLoading={isRateLoading}
                />
                <div className="absolute absolute top-1/2 -translate-y-1/2 z-1 bg-green-500 min-w-[40px] min-h-[40px] aspect-square item-center text-center text-dark-green justify-center rounded-full p-2">
                    <svg className="max-md:rotate-90" width={26} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.2413 6.7587l3.1033 3.1034H1.4483c-0.2761 0-0.5 0.2238-0.5 0.5s0.2239 0.5 0.5 0.5h21.1034c0.2022 0 0.3845-0.1218 0.4619-0.3087s0.0346-0.4019-0.1084-0.5449l-3.9568-3.9569c-0.1953-0.1952-0.5119-0.1952-0.7071 0s-0.1953 0.5119 0 0.7071zM5.7587 17.2413 2.6554 14.1379h19.8963c0.2761 0 0.5-0.2238 0.5-0.5s-0.2239-0.5-0.5-0.5H1.4483c-0.2022 0-0.3845 0.1218-0.4619 0.3087s-0.0346 0.4019 0.1084 0.5449l3.9568 3.9569c0.1953 0.1952 0.5119 0.1952 0.7071 0s0.1953-0.5119 0-0.7071z" data-name="primary" />
                    </svg>
                </div>
                <QuoteCard
                    currencies={currencies}
                    baseCurrency={baseCurrency}
                    currency={quoteCurrency}
                    onCurrencyChange={setQuoteCurrency}
                    amount={quoteAmount}
                    onAmountChange={handleQuoteAmountChange}
                    rate={rate}
                    rateError={rateError}
                    isRateLoading={isRateLoading}
                    className="dark"
                />
            </div>
            <div>
                <p className="text-xs tracking-normal flex max-md:flex-col gap-2 items-center">
                    Last updated:{" "}
                    {rateDate === null
                        ? "loading..."
                        : rateDate}
                    <button
                        type="button"
                        onClick={handleManualRefresh}
                        disabled={isRateLoading || refreshCooldownSeconds > 0}
                        className="border border-gray-400 font-[600] tracking-tight py-1 px-2 rounded-lg cursor-pointer hover:bg-mint-cream transition-colors ease-in duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isRateLoading
                            ? "Refreshing…"
                            : refreshCooldownSeconds > 0
                                ? `Refresh in ${refreshCooldownSeconds}s`
                                : "Refresh rates"}
                    </button>
                </p>
            </div>
        </div>
    );
}