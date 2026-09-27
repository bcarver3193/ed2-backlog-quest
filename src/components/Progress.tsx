import { LoaderCircle } from 'lucide-react'

export function Spinner() {
  return <LoaderCircle className="spinner" size={16} aria-hidden="true" />
}

export default function Progress({ children }: { children: string }) {
  return <p className="progress" role="status"><Spinner />{children}</p>
}
