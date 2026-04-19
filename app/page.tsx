import Link from "next/link";
import { 
  ArrowRight, 
  Menu,
  X,
  GraduationCap,
  ClipboardCheck,
  Wallet,
  MessageCircle,
  BarChart3,
  Calendar,
  FileText,
  Users,
  Building2,
  CheckCircle2,
  ChevronRight,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-sm">EC</div>
              <span className="text-lg font-semibold tracking-tight text-slate-900">EduCore</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
              <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
              <Link href="#contact" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Contact</Link>
              <Link href="/login" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-medium uppercase tracking-wider mb-6">
              <GraduationCap className="w-3 h-3" /> For Schools & Institutions
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.15] mb-6 tracking-tight">
              School management<br />
              <span className="text-slate-700">made simple</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
              Track attendance, manage grades, collect fees, and communicate with parents — 
              all from one system. Report cards delivered automatically via WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                Access School Portal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Existing schools: sign in to your dashboard
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">What you get</h2>
            <p className="text-slate-600 max-w-xl">A complete school management system with everything your staff needs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
              <ClipboardCheck className="w-8 h-8 text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Attendance</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Daily attendance marked on mobile. Automatic alerts sent to parents when children are absent.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
              <FileText className="w-8 h-8 text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Grades & Reports</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Record scores and generate professional report cards. Auto-distributed to parents.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
              <Wallet className="w-8 h-8 text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fee Management</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Track fees, record payments, and generate receipts. Know exactly who owes what.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
              <MessageCircle className="w-8 h-8 text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Parent Communication</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Send updates via WhatsApp. Bulk messaging for class or entire school.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
              <Users className="w-8 h-8 text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Student Records</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Complete student profiles. Enrollment history and academic records maintained.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
              <BarChart3 className="w-8 h-8 text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Reports & Analytics</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                See attendance trends, fee collection, and academic performance at a glance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-slate-600 max-w-xl">Get started in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold mb-4">1</div>
              <h4 className="text-lg font-semibold mb-2">Set Up</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Create your school account and import existing student data via CSV.
              </p>
            </div>

            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold mb-4">2</div>
              <h4 className="text-lg font-semibold mb-2">Daily Use</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Teachers mark attendance and grades on their phones.
              </p>
            </div>

            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold mb-4">3</div>
              <h4 className="text-lg font-semibold mb-2">Stay Connected</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Parents receive automatic updates. No additional app required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Simple */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Simple pricing</h2>
            <p className="text-slate-600 mb-8">
              One price per student per term. No setup fees, no hidden costs.
            </p>

            <div className="p-8 rounded-2xl border-2 border-slate-200 bg-slate-50">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold">GHS 15</span>
                <span className="text-slate-600">per student / term</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600" /> Full attendance system
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600" /> Grades & report cards
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600" /> Fee management
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600" /> WhatsApp notifications
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600" /> All features included
                </li>
              </ul>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors w-full">
                Get Started <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Get in touch</h2>
              <p className="text-slate-400 mb-8">Ready to modernize your school? Let us tell you more.</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <span>+233 20 000 0000</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <span>hello@educore.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span>Accra, Ghana</span>
                </div>
              </div>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Your name" 
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500"
                />
                <input 
                  type="text" 
                  placeholder="School name" 
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500"
                />
              </div>
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500"
              />
              <textarea 
                placeholder="Tell us about your school" 
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 resize-none"
              />
              <button type="submit" className="w-full bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-xs">EC</div>
              <span className="text-base font-medium">EduCore</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="/login" className="hover:text-slate-900">Sign In</Link>
              <Link href="#" className="hover:text-slate-900">Privacy</Link>
              <Link href="#" className="hover:text-slate-900">Terms</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-slate-600">Built by Abdul Anas</p>
              <div className="flex items-center gap-4">
                <a href="https://twitter.com/@abdulanasbuilds" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-slate-900">Twitter</a>
                <span className="text-slate-300">|</span>
                <a href="https://github.com/abdulanasbuilds" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-slate-900">GitHub</a>
                <span className="text-slate-300">|</span>
                <a href="https://linkedin.com/in/abdulanasbuilds" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-slate-900">LinkedIn</a>
                <span className="text-slate-300">|</span>
                <a href="https://instagram.com/abdulanasbuilds" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-slate-900">Instagram</a>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} EduCore. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}