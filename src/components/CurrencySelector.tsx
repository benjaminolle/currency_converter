"use client"

import Image from "next/image"
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface Currency {
    iso_code: string
    name: string
    symbol: string
    type: "currency" | "crypto"
}

function CurrencyArtwork({ currency }: { currency: Currency }) {
    const isoCode = currency.iso_code.toLowerCase()
    const src = currency.type === "crypto"
        ? `/api/currency-artwork/crypto/${isoCode}`
        : `/api/currency-artwork/country/${isoCode.slice(0, 2)}`
    const [failedSrc, setFailedSrc] = React.useState<string | null>(null)

    return (
        <span
            aria-hidden="true"
            className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[10px] font-semibold"
        >
            <span>{currency.symbol || currency.iso_code.slice(0, 2)}</span>
            {src && failedSrc !== src && (
                <Image
                    src={src}
                    alt=""
                    width={24}
                    height={24}
                    loading="lazy"
                    unoptimized
                    onError={() => setFailedSrc(src)}
                    className="absolute inset-0 h-6 w-6 rounded-full object-cover"
                />
            )}
        </span>
    )
}

interface CurrencySelectorProps {
    currencies: Currency[]
    value?: string
    onChange?: (value: string) => void
}

export function CurrencySelector({ currencies, value = "USD", onChange }: CurrencySelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedCurrency, setSelectedCurrency] = React.useState(value)

    const current = currencies.find((currency) => currency.iso_code === selectedCurrency)

    const handleSelect = (code: string) => {
        setSelectedCurrency(code)
        setOpen(false)
        if (onChange) onChange(code)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-fit max-w-full min-w-0 !shrink justify-start gap-2 overflow-hidden cursor-pointer"
                >
                    {current ? (
                        <span className="flex min-w-0 max-w-full items-center gap-2">
                            <CurrencyArtwork currency={current} />
                            <span className="shrink-0 font-semibold">{current.iso_code}</span>
                            <span className="min-w-0 truncate text-muted-foreground">({current.name})</span>
                        </span>
                    ) : (
                        "Select currency..."
                    )}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[250px] p-0">
                <Command>
                    <CommandInput placeholder="Search currency or code..." />
                    <CommandList>
                        <CommandEmpty>No currency found.</CommandEmpty>
                        <CommandGroup>
                            {currencies.map((currency) => (
                                <CommandItem
                                    key={currency.iso_code}
                                    value={`${currency.iso_code} ${currency.name}`}
                                    onSelect={() => handleSelect(currency.iso_code)}
                                >
                                    <Check
                                        className={cn(
                                            "h-4 w-4",
                                            selectedCurrency === currency.iso_code ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <CurrencyArtwork currency={currency} />
                                    <span className="font-medium mr-2">{currency.iso_code}</span>
                                    <span className="text-muted-foreground text-sm truncate">
                                        {currency.name}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
