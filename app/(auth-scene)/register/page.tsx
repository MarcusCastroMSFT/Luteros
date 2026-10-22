import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="w-full py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  )
}
