import Link from "next/link"
import { ArrowUpRight, LockKeyhole } from "lucide-react"
import { Logo } from "@/components/common/logo"
import { CurrentYear } from "@/components/auth/auth-ui"
import { WaterReflection, WaterScene } from "@/components/auth/water-scene"
import styles from "@/components/auth/auth-shell.module.css"

export default function AuthSceneLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <WaterScene>
        <div className={styles.shade} aria-hidden="true" />
        <header className={styles.header}>
          <div className={styles.logo}>
            <Logo asLink iconSize="md" />
          </div>
          <Link href="/" className={styles.back}>
            Voltar ao site
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </header>

        <main className={styles.main}>
          <WaterReflection className={styles.cardAnchor}>
            <div className={styles.card}>{children}</div>
          </WaterReflection>
        </main>

        <footer className={styles.footer}>
          <p className={styles.security}>
            <LockKeyhole size={12} aria-hidden="true" />
            <span>Seus dados são tratados com sigilo</span>
          </p>
          <div className={styles.legal}>
            <span>© <CurrentYear /> lutteros</span>
            <Link href="/privacy">Privacidade</Link>
            <Link href="/terms">Termos de uso</Link>
          </div>
        </footer>
      </WaterScene>
    </div>
  )
}
