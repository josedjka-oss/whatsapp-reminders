"use client";

import { ContactForm } from "@/components/ContactForm";
import { NavigationHeader } from "@/components/NavigationHeader";
import { useRouter } from "next/navigation";

export default function NewContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader title="Agregar Contacto" />
      <div className="py-8">
        <ContactForm
          onSuccess={() => router.push("/reminders/new")}
          onCancel={() => router.push("/reminders/new")}
        />
      </div>
    </div>
  );
}
