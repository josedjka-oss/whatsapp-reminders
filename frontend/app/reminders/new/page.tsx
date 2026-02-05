import { ReminderForm } from "@/components/ReminderForm";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function NewReminderPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Crear Recordatorio" />
      <ReminderForm />
    </div>
  );
}
