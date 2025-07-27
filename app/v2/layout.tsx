import "../globals.css"
import "./animations.css"

export default function V2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen bg-black">
      {children}
    </div>
  )
} 