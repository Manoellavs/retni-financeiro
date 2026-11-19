"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const isSignUp = mode === "sign-up";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      const result = isSignUp
        ? await authClient.signUp.email({
            name: String(formData.get("name") ?? "").trim(),
            email,
            password,
          })
        : await authClient.signIn.email({
            email,
            password,
          });

      if (result.error) {
        setError(
          result.error.message ||
            "Não foi possível autenticar. Confira seus dados e tente novamente.",
        );
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error("Erro na autenticação:", err);
      setError(
        "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <div className="auth-card-heading">
        <span className="auth-kicker">
          {isSignUp ? "COMECE POR VOCÊ" : "BEM-VINDA DE VOLTA"}
        </span>

        <h1 id="auth-title">
          {isSignUp ? "Crie sua conta" : "Acesse sua conta"}
        </h1>

        <p>
          {isSignUp
            ? "Organize sua vida financeira com clareza e tranquilidade."
            : "Entre para acompanhar seus planos e escolhas."}
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} method="post">
        {isSignUp && (
          <label className="field-label">
            Nome completo
            <span className="input-wrap">
              <UserRound size={17} />
              <input
                autoComplete="name"
                name="name"
                placeholder="Seu nome"
                required
                maxLength={80}
              />
            </span>
          </label>
        )}

        <label className="field-label">
          E-mail
          <span className="input-wrap">
            <Mail size={17} />
            <input
              autoComplete="email"
              name="email"
              type="email"
              placeholder="voce@email.com"
              required
            />
          </span>
        </label>

        <label className="field-label">
          Senha
          <span className="input-wrap">
            <LockKeyhole size={17} />
            <input
              autoComplete={isSignUp ? "new-password" : "current-password"}
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="No mínimo 8 caracteres"
              required
              minLength={8}
            />
            <button
              className="password-toggle"
              type="button"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button className="auth-submit" type="submit" disabled={busy}>
          {busy ? "Aguarde..." : isSignUp ? "Criar conta" : "Entrar"}
          <ArrowRight size={17} />
        </button>
      </form>

      <p className="auth-switch">
        {isSignUp ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
        <Link href={isSignUp ? "/sign-in" : "/sign-up"}>
          {isSignUp ? "Entrar" : "Criar conta"}
        </Link>
      </p>

      <div className="auth-security">
        <LockKeyhole size={14} />
        Seus dados são protegidos e privados.
      </div>
    </section>
  );
}
