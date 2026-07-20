"use client";

import { useActionState } from "react";
import { login, LoginState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { FieldWrap, TextInput } from "@/components/ui/Field";

const initialState: LoginState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="next" value={next} />
      <FieldWrap label="Usuário">
        <TextInput type="text" name="username" required placeholder="seu.usuario" autoFocus autoCapitalize="none" />
      </FieldWrap>
      <FieldWrap label="Senha">
        <TextInput type="password" name="password" required placeholder="••••••••" />
      </FieldWrap>
      {state.error && <p className="mb-3 text-xs text-faxa-alerta">{state.error}</p>}
      <Button type="submit" variant="yellow" className="w-full justify-center" disabled={isPending}>
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
