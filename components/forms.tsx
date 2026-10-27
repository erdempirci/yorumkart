"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions";

export function Submit({ children, className = "btn block" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending} type="submit">
      {pending ? "Bekleyin…" : children}
    </button>
  );
}

export function Msg({ state }: { state: FormState }) {
  if (state?.error) return <div className="msg err" role="alert">{state.error}</div>;
  if (state?.ok) return <div className="msg ok" role="status">{state.ok}</div>;
  return null;
}

export function ActionForm({
  action,
  children,
  className = "stack",
}: {
  action: (s: FormState, f: FormData) => Promise<FormState>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useFormState(action, undefined);
  return (
    <form action={formAction} className={className}>
      {children}
      <Msg state={state} />
    </form>
  );
}
