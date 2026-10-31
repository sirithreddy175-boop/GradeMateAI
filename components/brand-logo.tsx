type BrandLogoProps = {
  className?: string
}

export function BrandLogo({ className = "h-14 w-auto" }: BrandLogoProps) {
  return <img src="/logo.svg" alt="GradeMate AI — Smarter Assessment. Teacher-Controlled Grading." className={className} />
}
