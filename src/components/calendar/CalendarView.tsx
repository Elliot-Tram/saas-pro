"use client";

import { useState, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { NewAppointmentModal } from "./NewAppointmentModal";
import { updateAppointmentStatus, deleteAppointment } from "@/app/actions/appointments";

interface SerializedAppointment {
  id: string;
  title: string;
  description: string | null;
  date: string;
  endDate: string;
  status: string;
  clientId: string;
  clientName: string;
}

interface SerializedClient {
  id: string;
  name: string;
}

interface CalendarViewProps {
  appointments: SerializedAppointment[];
  clients: SerializedClient[];
}

const statusConfig: Record<string, { label: string; variant: "info" | "success" | "danger" }> = {
  scheduled: { label: "Planifié", variant: "info" },
  completed: { label: "Terminé", variant: "success" },
  cancelled: { label: "Annulé", variant: "danger" },
};

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function CalendarView({ appointments, clients }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getAppointmentsForDay = useCallback(
    (day: Date) => {
      return appointments.filter((apt) => isSameDay(new Date(apt.date), day));
    },
    [appointments]
  );

  const selectedDayAppointments = selectedDate
    ? getAppointmentsForDay(selectedDate)
    : [];

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), "HH:mm");
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateAppointmentStatus(id, newStatus);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce rendez-vous ?")) return;
    await deleteAppointment(id);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setCurrentMonth(new Date());
                setSelectedDate(new Date());
              }}
              className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus className="h-4 w-4" />
          Nouveau RDV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2 overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isDayToday = isToday(day);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative min-h-[80px] p-2 border-b border-r border-gray-100 text-left transition-colors
                    ${isCurrentMonth ? "bg-white" : "bg-gray-50/50"}
                    ${isSelected ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50"}
                  `}
                >
                  <span
                    className={`
                      inline-flex h-7 w-7 items-center justify-center rounded-full text-sm
                      ${isDayToday ? "bg-blue-600 text-white font-semibold" : ""}
                      ${!isDayToday && isCurrentMonth ? "text-gray-900" : ""}
                      ${!isDayToday && !isCurrentMonth ? "text-gray-400" : ""}
                    `}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Appointment indicators */}
                  {dayAppointments.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className={`
                            text-xs truncate rounded px-1 py-0.5
                            ${apt.status === "scheduled" ? "bg-blue-100 text-blue-700" : ""}
                            ${apt.status === "completed" ? "bg-green-100 text-green-700" : ""}
                            ${apt.status === "cancelled" ? "bg-red-100 text-red-700" : ""}
                          `}
                        >
                          {formatTime(apt.date)} {apt.title}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <p className="text-xs text-gray-500 px-1">
                          +{dayAppointments.length - 2} autre{dayAppointments.length - 2 > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Day Detail Sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                {selectedDate
                  ? format(selectedDate, "EEEE d MMMM", { locale: fr })
                  : "Sélectionnez un jour"}
              </h3>
              {selectedDate && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedDayAppointments.length} rendez-vous
                </p>
              )}
            </div>

            <div className="p-4">
              {!selectedDate ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Cliquez sur un jour pour voir les rendez-vous
                </p>
              ) : selectedDayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 mb-3">
                    Aucun rendez-vous ce jour
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowNewModal(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter un RDV
                  </Button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {selectedDayAppointments.map((apt) => {
                    const config = statusConfig[apt.status] || statusConfig.scheduled;
                    return (
                      <li
                        key={apt.id}
                        className="rounded-lg border border-gray-100 p-3 hover:border-gray-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {apt.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {apt.clientName}
                            </p>
                          </div>
                          <Badge variant={config.variant}>{config.label}</Badge>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(apt.date)} - {formatTime(apt.endDate)}
                        </div>

                        {apt.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {apt.description}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-50">
                          {apt.status === "scheduled" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(apt.id, "completed")}
                                className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                              >
                                Terminer
                              </button>
                              <span className="text-gray-200">|</span>
                              <button
                                onClick={() => handleStatusChange(apt.id, "cancelled")}
                                className="text-xs text-gray-500 hover:text-red-600 font-medium transition-colors"
                              >
                                Annuler
                              </button>
                            </>
                          )}
                          {apt.status === "cancelled" && (
                            <button
                              onClick={() => handleStatusChange(apt.id, "scheduled")}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              Replanifier
                            </button>
                          )}
                          <div className="flex-1" />
                          <button
                            onClick={() => handleDelete(apt.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* New Appointment Modal */}
      <NewAppointmentModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        clients={clients}
        defaultDate={selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined}
      />
    </div>
  );
}
