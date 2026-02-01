// frontend/app/(client)/c/[tableCode]/page.tsx
import { use } from "react";
import ClientTablePageClient from "./ClientTablePageClient";

type PageProps = {
  params: Promise<{ tableCode: string }>;
};

export default function Page({ params }: PageProps) {
  const { tableCode } = use(params); // Next 15.5 params Promise
  return <ClientTablePageClient tableCode={tableCode} />;
}
