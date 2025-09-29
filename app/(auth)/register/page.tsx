import Image from "next/image";
import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          className="flex items-center gap-2 self-center font-medium"
          href="/"
        >
          <Image
            alt="Unlock"
            aria-hidden
            height={28}
            src="/logo.svg"
            width={115}
          />
        </Link>
        <RegisterForm />
      </div>
    </div>
  );
}
