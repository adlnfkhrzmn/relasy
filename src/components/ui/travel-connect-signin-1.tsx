"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LuxuryNotification } from "@/components/ui/luxury-toast";

const cn = (...classes: (string | false | null | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}

const Button = ({
  children,
  variant = "default",
  className = "",
  ...props
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 cursor-pointer";

  const variantStyles = {
    default:
      "bg-[#635BCE] hover:bg-[#524AB8] text-white dark:bg-[#635BCE] dark:hover:bg-[#746DD6] dark:text-white",
    outline:
      "border border-[#E5E4DE] bg-[#F7F6F1] text-[#252927] hover:bg-[#E9E8FC]/50",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = ({ className = "", ...props }: InputProps) => {
  return (
    <input
      className={`flex h-11 w-full rounded-lg border border-[#E5E4DE] bg-[#F7F6F1] px-3.5 py-2 text-sm text-[#252927] placeholder:text-[#A8AAA4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-55 ${className}`}
      {...props}
    />
  );
};

type RoutePoint = {
  x: number;
  y: number;
  delay: number;
};

const DotMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const routes: { start: RoutePoint; end: RoutePoint; color: string }[] = [
    {
      start: { x: 100, y: 150, delay: 0 },
      end: { x: 200, y: 80, delay: 2 },
      color: "#635BCE",
    },
    {
      start: { x: 200, y: 80, delay: 2 },
      end: { x: 260, y: 120, delay: 4 },
      color: "#635BCE",
    },
    {
      start: { x: 50, y: 50, delay: 1 },
      end: { x: 150, y: 180, delay: 3 },
      color: "#635BCE",
    },
    {
      start: { x: 280, y: 60, delay: 0.5 },
      end: { x: 180, y: 180, delay: 2.5 },
      color: "#635BCE",
    },
  ];

  const generateDots = (width: number, height: number) => {
    const dots = [];
    const gap = 12;
    const dotRadius = 1.2;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        const isInMapShape =
          (x < width * 0.25 && x > width * 0.05 && y < height * 0.4 && y > height * 0.1) ||
          (x < width * 0.25 && x > width * 0.15 && y < height * 0.8 && y > height * 0.4) ||
          (x < width * 0.45 && x > width * 0.3 && y < height * 0.35 && y > height * 0.15) ||
          (x < width * 0.5 && x > width * 0.35 && y < height * 0.65 && y > height * 0.35) ||
          (x < width * 0.7 && x > width * 0.45 && y < height * 0.5 && y > height * 0.1) ||
          (x < width * 0.8 && x > width * 0.65 && y < height * 0.8 && y > height * 0.6);

        if (isInMapShape && Math.random() > 0.3) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.5 + 0.25,
          });
        }
      }
    }
    return dots;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });

    resizeObserver.observe(canvas.parentElement);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      return;
    }
    if (!ctx) return;

    const dots = generateDots(dimensions.width, dimensions.height);
    let animationFrameId: number;
    let startTime = Date.now();

    function drawDots() {
      if (!ctx) return;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      dots.forEach((dot) => {
        ctx!.beginPath();
        ctx!.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(99, 91, 206, ${dot.opacity})`;
        ctx!.fill();
      });
    }

    function drawRoutes() {
      if (!ctx) return;
      const currentTime = (Date.now() - startTime) / 1000;

      routes.forEach((route) => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;

        const duration = 3;
        const progress = Math.min(elapsed / duration, 1);

        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;

        ctx!.beginPath();
        ctx!.moveTo(route.start.x, route.start.y);
        ctx!.lineTo(x, y);
        ctx!.strokeStyle = route.color;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
        ctx!.fillStyle = route.color;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(x, y, 3, 0, Math.PI * 2);
        ctx!.fillStyle = "#746DD6";
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(x, y, 6, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(99, 91, 206, 0.35)";
        ctx!.fill();

        if (progress === 1) {
          ctx!.beginPath();
          ctx!.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
          ctx!.fillStyle = route.color;
          ctx!.fill();
        }
      });
    }

    function animate() {
      drawDots();
      drawRoutes();

      const currentTime = (Date.now() - startTime) / 1000;
      if (currentTime > 15) {
        startTime = Date.now();
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export const SignInCard = () => {
  const router = useRouter();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("pemilik@usaha.id");
  const [password, setPassword] = useState("relasy123");
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const authenticateUser = async (targetEmail: string, targetPassword: string) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Email atau kata sandi tidak cocok. Silakan coba lagi.");
      }
    } catch {
      setError("Terjadi kendala jaringan. Pastikan koneksi server tersedia.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authenticateUser(email, password);
  };

  const handleQuickDemoLogin = async () => {
    setEmail("pemilik@usaha.id");
    setPassword("relasy123");
    await authenticateUser("pemilik@usaha.id", "relasy123");
  };

  return (
    <div className="flex w-full h-full items-center justify-center">
      <motion.div
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl overflow-hidden rounded-2xl flex bg-[#FFFFFF] border border-[#E5E4DE] shadow-xl animate-page-in"
      >
        {/* Left side - Animated DotMap & Overlay */}
        <div className="hidden md:block w-1/2 min-h-[600px] relative overflow-hidden border-r border-[#E5E4DE] bg-[#F7F6F1]">
          <div className="absolute inset-0 bg-[#E9E8FC]/40 dark:bg-[#141615]">
            <DotMap />

            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
              <div className="mb-6">
                <div className="h-14 w-14 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
                  <img
                    src="/logo-1.png"
                    alt="Logo Relasy"
                    className="w-full h-full object-contain block dark:hidden"
                  />
                  <img
                    src="/logo-2.png"
                    alt="Logo Relasy"
                    className="w-full h-full object-contain hidden dark:block"
                  />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2.5 text-center text-[#635BCE] dark:text-[#9D96F0] tracking-tight">
                Relasy
              </h2>
              <p className="text-sm text-center text-[#252927] dark:text-[#E5E4DE] font-medium max-w-xs leading-relaxed">
                Masuk untuk mengakses dashboard CRM, memantau pipeline penjualan, dan mengelola jadwal follow-up pelanggan Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Sign In Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-[#FFFFFF]">
          <div>
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1 text-[#252927] tracking-tight">
                  Selamat datang
                </h1>
                <p className="text-sm text-[#6F716D]">
                  Masuk ke akun ruang kerja Anda
                </p>
              </div>
              <div className="shrink-0 pt-0.5">
                <ThemeToggle />
              </div>
            </div>

            {error && (
              <div className="mb-5">
                <LuxuryNotification
                  variant="error"
                  title="Gagal Masuk"
                  message={error}
                  onClose={() => setError("")}
                />
              </div>
            )}

            <div className="mb-6">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleQuickDemoLogin}
                className="w-full flex items-center justify-center gap-2.5 bg-[#F7F6F1] border border-[#E5E4DE] rounded-lg p-3 hover:bg-[#E9E8FC]/60 transition-all duration-200 text-[#252927] text-sm font-medium shadow-2xs cursor-pointer"
              >
                <KeyRound className="h-4 w-4 text-[#635BCE]" />
                <span>Masuk Cepat dengan Akun Demo</span>
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E4DE]"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="px-3 bg-[#FFFFFF] text-[#6F716D]">atau</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#252927] mb-1.5"
                >
                  Alamat Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.id"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#252927] mb-1.5"
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi Anda"
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#6F716D] hover:text-[#252927] cursor-pointer"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    aria-label={
                      isPasswordVisible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                    }
                  >
                    {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 py-2.5 rounded-lg transition-colors duration-150 shadow-xs"
                >
                  <span>{isLoading ? "Memproses masuk..." : "Masuk ke Dashboard"}</span>
                </Button>
              </div>

              <div className="text-center mt-6 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setError(
                      "Pemulihan kata sandi belum tersedia di versi ini. Hubungi pemilik ruang kerja untuk mengatur ulang akses."
                    )
                  }
                  className="inline-flex items-center text-[#635BCE] dark:text-[#9D96F0] hover:underline text-sm font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
                >
                  Lupa password
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F7F6F1] p-4">
      <SignInCard />
    </div>
  );
};

export default Index;
