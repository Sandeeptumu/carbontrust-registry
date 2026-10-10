import { Link } from 'react-router-dom'
import { Leaf, ArrowUpRight, ShieldCheck, Waves } from 'lucide-react'
export default function AuthLayout({ children }) {
  return <div className="registry-auth">
    <header className="registry-auth__header">
      <Link to="/" className="registry-auth__brand"><span><Leaf size={23} /></span>CarbonTrust <small>REGISTRY</small></Link>
      <Link to="/" className="registry-auth__back">Explore the registry <ArrowUpRight size={17} /></Link>
    </header>
    <main className="registry-auth__main">
      <aside className="registry-auth__story">
        <div className="registry-auth__tag"><span /> ROOTED IN TRUST</div>
        <h2>Small actions.<br /><em>Lasting impact.</em></h2>
        <p>Connect restoration, evidence and climate action in one trusted registry.</p>
        <div className="registry-auth__landscape" aria-hidden="true"><div className="contour contour--one" /><div className="contour contour--two" /><div className="contour contour--three" /><Waves className="registry-auth__waves" size={76} strokeWidth={0.7} /><Leaf className="registry-auth__leaf" size={120} strokeWidth={0.65} /></div>
        <div className="registry-auth__caption"><ShieldCheck size={20} /><span>A clearer path from restoration<br />to verified climate impact.</span></div>
      </aside>
      <section className="registry-auth__form" aria-label="Account access">{children}</section>
    </main>
    <footer className="registry-auth__footer"><span>© {new Date().getFullYear()} CarbonTrust Registry</span><span>For a planet that thrives.</span></footer>
  </div>
}
