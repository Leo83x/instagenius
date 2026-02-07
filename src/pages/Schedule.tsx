import { Header } from "@/components/Header";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";

export default function Schedule() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="container py-4 md:py-8 space-y-4 md:space-y-8">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-2xl md:text-3xl font-display font-bold">Agenda</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Organize e agende suas publicações no calendário
          </p>
        </div>
        <ScheduleCalendar />
      </main>
    </div>
  );
}
