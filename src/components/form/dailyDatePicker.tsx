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
import { useGameFormStore } from "@/composables/gameForm";
import type { LangCode } from "@/i18n/lang";
import { enUS as en, fr, de, eo, type Locale } from "react-day-picker/locale";
import { isAfter } from "date-fns";
import { useState } from "react";
import { useMount } from "@/composables/useMount";

const calendarLocales:Record<LangCode, Locale> = {
    en,
    fr,
    de,
    eo
}

export function DailyDatePicker({ lang }: { lang: LangCode }) {
    const [open, setOpen] = useState(false);
    const { dailyDate, setDailyDate } = useGameFormStore();
    
    // Used to load default state after hydration
    useMount(() => {
        if (dailyDate == null) setDailyDate(new Date());
    });

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
                    // endMonth={new Date()}
                    selected={dailyDate}
                    required={true}
                    captionLayout="dropdown"
                    disabled={(date) => /*isAfter(date, new Date()) ||*/ date.getFullYear() < 2020}
                    onSelect={(date) => {
                        setDailyDate(date);
                        setOpen(false);
                    }}
                    formatters={{
                        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "long" }),
                    }}
                    // classNames={{
                    //     table: "w-full border-collapse table-fixed",
                    //     week: "flex w-full justify-between",
                    //     day: "w-full h-full text-center",
                    // }}
                    // components={{
                        
                    //     Weeks: ({ children, ...props }) => {
                    //         const rows = React.Children.toArray(children);
                    //         while (rows.length < 6) {
                    //             rows.push(
                    //                 <tr className="flex w-full justify-between">
                    //                 {Array.from({ length: 7 }).map((_, index) => (
                    //                     <td key={index} className="w-full h-full text-center"></td>
                    //                 ))}
                    //                 </tr>
                    //             );
                    //         }
                    //         return <tbody {...props}>{rows}</tbody>;
                    //     },
                    // }}
                />
            </PopoverContent>
        </Popover>
    );
}
