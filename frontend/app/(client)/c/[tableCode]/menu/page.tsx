import { notFound } from "next/navigation";
import ClientMenuPageClient from "./ClientMenuPageClient";

export default function Page({ params }: { params?: { tableCode?: string } }) {
  const tableCode = params?.tableCode;

  if (!tableCode) notFound(); // või return null;

  return <ClientMenuPageClient tableCode={tableCode} />;
}
