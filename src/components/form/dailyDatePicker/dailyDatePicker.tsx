"use client"
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import "./dailyDatePicker.css";
import { useGameFormStore, type GameFormState } from "@/composables/gameForm";
import type { LangCode } from "@/i18n/lang";
import { enUS as en, fr, de, eo, type Locale } from "react-day-picker/locale";
import { isAfter } from "date-fns";
import { useState } from "react";
import { useMount } from "@/composables/useMount";
import { fetchAvailableDates } from "@/composables/gameForm";
import { useShallow } from "zustand/react/shallow";

const calendarLocales:Record<LangCode, Locale> = {
    en,
    fr,
    de,
    eo
}

export function DailyDatePicker({ lang }: { lang: LangCode }) {
    const [open, setOpen] = useState(false);
    const { dailyDate, setDailyDate, wikiLang } = useGameFormStore(
        useShallow((state) => ({
            dailyDate: state.dailyDate,
            setDailyDate: state.setDailyDate,
            wikiLang: state.wikiLang,
        } satisfies Partial<GameFormState>)),   
    );
    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    fetchAvailableDates(wikiLang).then((dates) => {
        setAvailableDates(dates);
    }).catch();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className="daily-date-picker" asChild>
                <Button>
                    <CalendarIcon />
                    <div>{dailyDate?.toLocaleDateString(lang)}</div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="daily-date-picker pop-up" align="start">
                <Calendar
                    lang={lang}
                    locale={calendarLocales[lang]}
                    mode="single"
                    
                    startMonth={new Date(2020, 0)}
                    endMonth={new Date()}
                    selected={dailyDate}
                    required={true}
                    captionLayout="dropdown"
                    disabled={(date) => isAfter(date, new Date()) || date.getFullYear() < 2020}
                    onSelect={(date) => {
                        setDailyDate(date);
                        setOpen(false);
                    }}
                    formatters={{
                        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "long" }),
                    }}
                    components={{
                        DayButton: ({ day, modifiers, className, ...props }) => {
                            return (
                                <button
                                    {...props}
                                    className={`${className} ${availableDates.find(d => d.getTime() === day.date.getTime()) ? "available" : ""}`}
                                >
                                    {day.date.getDate()}
                                </button>
                            );
                        }
                        // Weeks: ({ children, ...props }) => {
                        //     const rows = React.Children.toArray(children);
                        //     while (rows.length < 6) {
                        //         rows.push(
                        //             <tr className="flex w-full justify-between">
                        //             {Array.from({ length: 7 }).map((_, index) => (
                        //                 <td key={index} className="w-full h-full text-center"></td>
                        //             ))}
                        //             </tr>
                        //         );
                        //     }
                        //     return <tbody {...props}>{rows}</tbody>;
                        // },
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
