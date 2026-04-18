import Link from "next/link";
import { 
  ArrowRight, 
  MessageSquare, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  Users, 
  ChevronRight,
  Globe
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center text-white font-black text-xs">E</div>
              <span className="text-xl font-bold tracking-tight text-primary-900">EduCore</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-primary-800 transition-colors">School Login</Link>
              <Link href="/login" className="bg-primary-800 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary-700 transition-all shadow-md">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-black uppercase tracking-widest mb-8">
            <Globe className="w-3 h-3" /> Built for African Institutions
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
            Complete School Management, <br />
            <span className="text-primary-800">Automated for Growth</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Attendance, grades, fees, and parent communication — all automated. 
            Official report cards delivered directly to parents on WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-primary-800 text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-primary-700 shadow-xl transition-all flex items-center justify-center gap-2 hover:translate-y-[-2px]">
              Request a Demo
            </button>
            <Link href="/login" className="bg-white text-slate-900 border-2 border-slate-200 px-10 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              School Login <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary-50 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-blue-50 rounded-full opacity-50 blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Everything your school needs</h2>
            <div className="h-1.5 w-20 bg-primary-800 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary-200 transition-all hover:shadow-xl hover:translate-y-[-4px]">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">WhatsApp Reports</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Parents receive automated report cards, attendance alerts, and fee receipts directly on WhatsApp. No more lost paper.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary-200 transition-all hover:shadow-xl hover:translate-y-[-4px]">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-800 mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Live Dashboards</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Headmasters see attendance trends, fee collection status, and teacher performance across the whole institution in real time.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary-200 transition-all hover:shadow-xl hover:translate-y-[-4px]">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">One-Click Promotion</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                End of year processed in seconds. Review system suggestions based on grades and promote every student across the school in one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4 tracking-tight text-white">How it works</h2>
            <p className="text-slate-400 font-medium">Implementation is fast, simple, and supported.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Upload Data", desc: "Import your current student list via CSV." },
              { step: "02", title: "Auto-Setup", desc: "System creates classes, accounts, and fees instantly." },
              { step: "03", title: "Daily Use", desc: "Teachers mark attendance and enter grades on mobile." },
              { step: "04", title: "Auto-Notify", desc: "Parents receive automated updates on WhatsApp." },
            ].map((item, i) => (
              <div key={i} className="relative p-6">
                <div className="text-5xl font-black text-primary-500/20 absolute top-0 left-0 -translate-y-4">{item.step}</div>
                <h4 className="text-xl font-bold mb-3 relative z-10">{item.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-50 rounded-3xl mb-8">
                <ShieldCheck className="w-10 h-10 text-primary-800" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Ready to modernise your school?</h2>
            <p className="text-lg text-slate-600 mb-10 font-medium">Join over 50 institutions streamlining their operations with EduCore.</p>
            
            <form className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 shadow-2xl space-y-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 ml-1">Your Name</label>
                        <input required className="w-full px-5 py-3 rounded-2xl border-2 border-slate-200 focus:border-primary-500 outline-none transition-all" placeholder="John Mensah" />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 ml-1">School Name</label>
                        <input required className="w-full px-5 py-3 rounded-2xl border-2 border-slate-200 focus:border-primary-500 outline-none transition-all" placeholder="Heritage Academy" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2 ml-1">Phone Number</label>
                    <input required className="w-full px-5 py-3 rounded-2xl border-2 border-slate-200 focus:border-primary-500 outline-none transition-all" placeholder="024 123 4567" />
                </div>
                <button className="w-full bg-primary-800 text-white py-4 rounded-2xl text-lg font-black hover:bg-primary-700 shadow-lg transition-all active:scale-95">
                    Request demo & Pricing
                </button>
                <a href="https://wa.me/2330000000" className="flex items-center justify-center gap-2 text-green-600 font-bold hover:text-green-700 transition-colors pt-4">
                    <MessageSquare className="w-5 h-5" /> Chat with us on WhatsApp
                </a>
            </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary-800 rounded-md flex items-center justify-center text-white font-black text-[10px]">E</div>
                    <span className="text-lg font-bold tracking-tight text-primary-900">EduCore</span>
                </div>
                <div className="text-slate-500 text-sm font-medium italic">&quot;Built with integrity for African Schools&quot;</div>
                <div className="flex gap-6">
                    <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-primary-800">Institutional Login</Link>
                    <Link href="#" className="text-sm font-bold text-slate-600 hover:text-primary-800">Terms</Link>
                    <Link href="#" className="text-sm font-bold text-slate-600 hover:text-primary-800">Privacy</Link>
                </div>
            </div>
            <div className="mt-8 text-center text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">
                &copy; 2024 EduCore Technology Solutions. All Rights Reserved.
            </div>
        </div>
      </footer>
    </div>
  );
}
