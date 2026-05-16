import { redirect } from "next/navigation";
import Link from "next/link";
import { schoolConfig } from "@/lib/env";
import { ArrowRight, BarChart3, MessageCircle, Wallet, MapPin, Phone, Mail } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  // Demo mode: redirect to /demo
  if (process.env.DEMO_MODE === 'true') {
    redirect("/demo");
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-slate-200">
      {/* SECTION 1 — HERO */}
      <section 
        className="relative pt-24 pb-32 text-center text-white overflow-hidden"
        style={{ backgroundColor: schoolConfig.primaryColor }}
      >
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {schoolConfig.logoUrl && (
            <img 
              src={schoolConfig.logoUrl} 
              alt={`${schoolConfig.name} Logo`} 
              className="w-24 h-24 mx-auto rounded-full border-4 border-white/20 mb-8 object-cover bg-white"
            />
          )}
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-sm">
            {schoolConfig.name}
          </h1>
          
          {schoolConfig.tagline && (
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto font-medium">
              {schoolConfig.tagline}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-white transition-transform hover:scale-105 hover:shadow-xl active:scale-95 shadow-md flex items-center justify-center gap-2"
              style={{ color: schoolConfig.primaryColor }}
            >
              Login to Portal <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/apply"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-transparent border-2 border-white/80 text-white transition-all hover:bg-white/10 hover:border-white active:scale-95 flex items-center justify-center"
            >
              Apply for Admission
            </Link>
          </div>
        </div>
        
        {/* Subtle background pattern/gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </section>

      {/* SECTION 2 — WHAT PARENTS AND STUDENTS GET */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need in one place</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Our secure digital portal gives you instant access to essential school information and services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all group">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${schoolConfig.accentColor}15`, color: schoolConfig.accentColor }}
              >
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Track Academic Progress</h3>
              <p className="text-slate-600 leading-relaxed">
                View grades, attendance records, and performance reports anytime from any device. Stay connected to your child&apos;s education.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all group">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${schoolConfig.primaryColor}15`, color: schoolConfig.primaryColor }}
              >
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Reports on WhatsApp</h3>
              <p className="text-slate-600 leading-relaxed">
                Receive report cards, fee receipts, and school announcements directly on WhatsApp. No more lost paper letters.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all group">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform bg-amber-50 text-amber-600"
              >
                <Wallet className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Fee Management</h3>
              <p className="text-slate-600 leading-relaxed">
                Check your fee balance, view payment history, and download official receipts instantly without visiting the bursar&apos;s office.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — NEW TO THE SCHOOL? */}
      <section className="py-24 bg-slate-100 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">New to {schoolConfig.name}?</h2>
            <p className="text-slate-600 text-lg">Select the option that best describes you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Parent Registration */}
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow text-center flex flex-col h-full">
              <div className="text-5xl mb-6">👨‍👩‍👧</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Register as a Parent</h3>
              <p className="text-slate-600 mb-8 flex-grow">
                Already have a child enrolled? Create your parent portal account using their admission number to view their records.
              </p>
              <Link 
                href="/register/parent"
                className="w-full py-4 rounded-xl text-white font-semibold text-center hover:opacity-90 transition-opacity"
                style={{ backgroundColor: schoolConfig.primaryColor }}
              >
                Register Now &rarr;
              </Link>
            </div>

            {/* Student Admission */}
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow text-center flex flex-col h-full">
              <div className="text-5xl mb-6">🎓</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Apply for Admission</h3>
              <p className="text-slate-600 mb-8 flex-grow">
                New student? Submit an admission application online and our administrative team will be in touch with next steps.
              </p>
              <Link 
                href="/apply"
                className="w-full py-4 rounded-xl text-white font-semibold text-center hover:opacity-90 transition-opacity"
                style={{ backgroundColor: schoolConfig.accentColor }}
              >
                Apply Now &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — CONTACT */}
      {(schoolConfig.phone || schoolConfig.email || schoolConfig.address) && (
        <section className="py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-10">Contact the School Office</h2>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mb-10 text-slate-600">
                {schoolConfig.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-lg">{schoolConfig.phone}</span>
                  </div>
                )}
                
                {schoolConfig.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-lg">{schoolConfig.email}</span>
                  </div>
                )}
              </div>

              {schoolConfig.address && (
                <div className="flex items-center justify-center gap-3 text-slate-600 mb-10">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-lg">{schoolConfig.address}</span>
                </div>
              )}

              {schoolConfig.whatsapp && (
                <a 
                  href={`https://wa.me/${schoolConfig.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#20bd5a] transition-colors shadow-sm"
                >
                  <MessageCircle className="w-6 h-6" />
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 py-16 text-slate-400 text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-10">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
            <div className="text-left">
              <h2 className="text-2xl font-extrabold text-white mb-2">{schoolConfig.name}</h2>
              <p className="text-sm max-w-xs">{schoolConfig.tagline || "Academic Excellence for the Digital Age"}</p>
            </div>
            <div className="flex gap-8 text-sm font-bold">
              <Link href="/login" className="hover:text-white transition-colors">Portal Login</Link>
              <Link href="/apply" className="hover:text-white transition-colors">Admissions</Link>
              <Link href="/register/parent" className="hover:text-white transition-colors">Parent Sign Up</Link>
            </div>
          </div>

          <div className="w-full h-px bg-slate-800" />

          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
            <p className="text-sm">
              &copy; {currentYear} {schoolConfig.name}. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Follow Developer:</span>
              <div className="flex gap-4">
                <a href="https://twitter.com/abdulanasbuilds" target="_blank" rel="noopener" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all shadow-sm">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://facebook.com/abdulanasbuilds" target="_blank" rel="noopener" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all shadow-sm">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://instagram.com/abdulanasbuilds" target="_blank" rel="noopener" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all shadow-sm">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://linkedin.com/in/abdulanasbuilds" target="_blank" rel="noopener" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all shadow-sm">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Designed & Developed by <a href="https://github.com/abdulanasbuilds" className="text-slate-400 hover:text-white transition-colors underline underline-offset-4">@abdulanasbuilds</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
