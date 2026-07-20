import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-faxa-preto px-4">
      <div className="w-full max-w-sm rounded-2xl border-t-[3px] border-faxa-amarelo bg-faxa-branco p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-faxa-amarelo text-lg font-extrabold text-faxa-preto">
            f
          </div>
          <div>
            <div className="text-[15px] font-bold">faxa · Calendário Editorial</div>
            <div className="text-[11px] text-faxa-cinza-3">Acesso da equipe</div>
          </div>
        </div>
        <LoginForm next={next ?? "/admin"} />
      </div>
    </div>
  );
}
