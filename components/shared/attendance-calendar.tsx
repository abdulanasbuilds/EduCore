"use client";

import { useState } from "react";
import { format, addMonths, subMonths, isSameMonth, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Attendance } from "@/types";

interface AttendanceCalendarProps {
  attendance: Attendance[];
}

export function AttendanceCalendar({ attendance }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayIndex = getDay(daysInMonth[0]);
  
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getStatus = (date: Date) => {
    const record = attendance.find(a => isSameDay(new Date(a.date), date));
    return record?.status;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-slate-800 text-lg">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg border text-slate-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg border text-slate-600 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-slate-50 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
        
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-white h-24" />
        ))}

        {daysInMonth.map((date) => {
          const status = getStatus(date);
          const isWeekend = getDay(date) === 0 || getDay(date) === 6;

          return (
            <div 
              key={date.toString()} 
              className={cn(
                "bg-white h-24 p-2 relative group hover:bg-slate-50 transition-colors",
                isToday(date) && "bg-primary-50/30"
              )}
            >
              <span className={cn(
                "text-sm font-medium",
                isToday(date) ? "text-primary-600 font-bold underline" : "text-slate-700",
                isWeekend && "text-slate-400"
              )}>
                {format(date, "d")}
              </span>

              {status && (
                <div className={cn(
                  "mt-2 px-1.5 py-1 rounded text-[10px] font-bold text-center uppercase tracking-tighter shadow-sm",
                  status === "Present" && "bg-green-100 text-green-700 border border-green-200",
                  status === "Absent" && "bg-red-100 text-red-700 border border-red-200",
                  status === "Late" && "bg-amber-100 text-amber-700 border border-amber-200",
                  status === "Excused" && "bg-blue-100 text-blue-700 border border-blue-200"
                )}>
                  {status}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-6 border-t pt-6">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          Present
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          Absent
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          Late
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          Excused
        </div>
      </div>
    </div>
  );
}
