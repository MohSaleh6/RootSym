import { prisma } from "@/lib/prisma";
import { AdminTitle, Empty } from "../ui";
import MessagesList, { type MessageRow } from "./MessagesList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: [{ handled: "asc" }, { createdAt: "desc" }],
  });

  const rows: MessageRow[] = messages.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    organisation: m.organisation,
    subject: m.subject,
    message: m.message,
    handled: m.handled,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <AdminTitle title="Messages" subtitle="Everything sent through the contact form." />
      {rows.length === 0 ? <Empty>No messages yet.</Empty> : <MessagesList rows={rows} />}
    </div>
  );
}
