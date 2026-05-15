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
      <footer className="bg-slate-900 py-12 text-slate-400 text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-medium text-slate-300">
            {schoolConfig.name} &copy; {currentYear}
          </p>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/apply" className="hover:text-white transition-colors">Apply for Admission</Link>
            <Link href="/register/parent" className="hover:text-white transition-colors">Parent Registration</Link>
          </div>
          <p className="text-xs text-slate-500 opacity-70">
            Powered by ABDUL ANAS and @abdulanasbuilds on all social media platform
          </p>
        </div>
      </footer>
    </div>
  );
}
