import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="w-full py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
