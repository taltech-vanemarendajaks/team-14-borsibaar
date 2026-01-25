export const dynamic = "force-dynamic";

import Image from "next/image";

function GoogleG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.158 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.109 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.36 4.337-17.694 10.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.066 0 9.754-1.944 13.254-5.103l-6.118-5.173C29.087 35.318 26.705 36 24 36c-5.134 0-9.62-3.317-11.286-7.946l-6.52 5.02C9.486 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.06 12.06 0 0 1-4.167 5.724l.003-.002 6.118 5.173C36.823 39.3 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const publicBackendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070A12]">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        {/* LEFT: image panel */}
        <section className="relative hidden lg:block bg-[#070A12]">
          <Image
            src="/login-hero.jpg"
            alt=""
            fill
            priority
            className="
              object-cover opacity-78 blur-[1.2px] scale-[1.03] saturate-90
              [mask-image:linear-gradient(to_right,black_0%,black_72%,transparent_100%)]
              [-webkit-mask-image:linear-gradient(to_right,black_0%,black_72%,transparent_100%)]
            "
          />

          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-48
            bg-gradient-to-r from-transparent via-[#070A12]/60 to-[#070A12]"
          />

          <div className="absolute bottom-10 left-10 flex items-center gap-3 text-white/55">
            <div className="h-2 w-2 rounded-full bg-amber-400/70 shadow-[0_0_18px_rgba(245,158,11,0.55)]" />
            <span className="text-xs">POS</span>
          </div>
        </section>

        {/* RIGHT */}
        <section className="relative isolate flex items-center justify-center px-6 py-12">
          <div className="pointer-events-none absolute inset-0 z-0 bg-[#070A12]" />
          <div className="pointer-events-none absolute inset-0 z-0">
            <div
              className="
                absolute inset-y-0 left-[-220px] right-0
                blur-[12px]
                bg-[linear-gradient(
                  90deg,
                  rgba(7,10,18,0) 0%,
                  rgba(7,10,18,0.18) 20%,
                  rgba(7,10,18,0.55) 45%,
                  rgba(7,10,18,0.90) 75%,
                  rgba(7,10,18,1) 100%
                )]
              "
            />
          </div>

          {/* Content */}
          <div className="relative z-10 w-full max-w-lg text-center">
            {/* halo */}
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-[48px] bg-[radial-gradient(60%_40%_at_50%_30%,rgba(255,255,255,0.06)_0%,rgba(7,10,18,0)_72%)]" />

            <div className="flex justify-center">
              <Image
                src="/tudengibaarlogo.png"
                alt="Tudengibaar"
                width={320}
                height={120}
                priority
                className="h-auto w-[320px] opacity-95"
              />
            </div>

            <p className="mt-5 text-sm font-medium text-white/70">Logi sisse</p>

            <a
              href={`${publicBackendUrl}/oauth2/authorization/google`}
              className="mt-10 block">
              <span
                className="
                  inline-flex w-full items-center justify-center gap-3
                  rounded-[99px]
                  bg-white/10
                  px-8 py-6
                  text-lg font-semibold text-white
                  shadow-[0_18px_60px_rgba(0,0,0,0.45)]
                  transition
                  hover:bg-white/14
                  active:scale-[0.985]
                  focus:outline-none focus:ring-2 focus:ring-amber-400/35
                ">
                <GoogleG className="h-5 w-5" />
                Jätka Google kontoga
              </span>
            </a>

            <p className="mt-4 text-sm text-white/45">
              Google OAuth autentimine
            </p>

            <div className="mt-10 flex items-center justify-between text-sm text-white/45">
              <span>© {new Date().getFullYear()} Tudengibaar</span>
              <span>v0.1</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
