import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [pwd, setPwd] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (pwd === "admin") {
      login();
      navigate("/dashboard");
    } else {
      alert('Sai mật khẩu! Vui lòng nhập "admin".');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <form
        onSubmit={submit}
        className="bg-card p-8 rounded-2xl border border-border w-full max-w-sm shadow-xl relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Box className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-center mb-6 text-foreground">
          Đăng nhập Quản trị
        </h1>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Tài khoản
            </label>
            <Input
              value="admin"
              readOnly
              className="bg-secondary/50 text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Mật khẩu (Gợi ý: "admin")
            </label>
            <Input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoFocus
              className="bg-secondary border-border"
              placeholder="Nhập admin..."
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 mt-2"
          >
            Truy cập Dashboard
          </Button>
        </div>
      </form>
    </div>
  );
}
