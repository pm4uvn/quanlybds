"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signInWithPassword, signUpWithPassword } from "@/lib/supabase/session-store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Sunrise, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const err =
      mode === "signin"
        ? await signInWithPassword(email, password)
        : await signUpWithPassword(email, password);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (mode === "signup") {
      setInfo("Đã tạo tài khoản. Kiểm tra email để xác nhận (nếu dự án yêu cầu), sau đó đăng nhập.");
      setMode("signin");
      return;
    }
    router.replace("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Sunrise className="size-8 text-secondary mx-auto mb-2" />
          <CardTitle className="text-lg">Realty360</CardTitle>
          <p className="text-xs text-muted-foreground">
            {mode === "signin" ? "Đăng nhập để truy cập dữ liệu của bạn" : "Tạo tài khoản mới"}
          </p>
        </CardHeader>
        <CardContent>
          {!isSupabaseConfigured && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-xs">
              <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
              <span>
                Chưa cấu hình Supabase. Thêm{" "}
                <code className="bg-muted px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> và{" "}
                <code className="bg-muted px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> vào
                file <code className="bg-muted px-1 rounded">.env.local</code> rồi khởi động lại.
              </span>
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {info && <p className="text-sm text-secondary">{info}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang xử lý..." : mode === "signin" ? "Đăng nhập" : "Tạo tài khoản"}
            </Button>
          </form>
          <button
            type="button"
            className="w-full text-xs text-muted-foreground mt-4 hover:text-foreground"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
          >
            {mode === "signin" ? "Chưa có tài khoản? Tạo mới" : "Đã có tài khoản? Đăng nhập"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
