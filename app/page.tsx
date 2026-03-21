import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-12">
      <div className="flex max-w-lg flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/verymuch-logo.png"
            alt="Verymuch.ai"
            width={280}
            height={80}
            className="h-14 w-auto object-contain"
            priority
          />
          <h1 className="font-jakarta text-2xl font-extrabold tracking-tight text-[#363536] sm:text-3xl">
            Sistema de Inteligencia Comercial IA
          </h1>
        </div>
        <p className="text-base leading-relaxed text-[#6B6B6B]">
          Herramienta interna de Verymuch.ai para investigar prospectos, preparar llamadas de descubrimiento y generar
          propuestas comerciales personalizadas con IA.
        </p>
      </div>
      <Button
        asChild
        size="lg"
        className="bg-[#AAD4AE] px-8 text-[#363536] hover:bg-[#95C59A] font-semibold rounded-xl"
      >
        <Link href="/login">Iniciar sesión</Link>
      </Button>
    </div>
  );
}
