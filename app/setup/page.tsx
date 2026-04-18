export default function SetupPage() {
  const vars = [
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      description: "Your Supabase project URL",
      where: "supabase.com → Project → Settings → API → Project URL",
      required: true,
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", 
      description: "Supabase anonymous/public key",
      where: "supabase.com → Project → Settings → API → anon/public",
      required: true,
    },
    {
      name: "SUPABASE_SERVICE_ROLE_KEY",
      description: "Supabase service role key (keep secret)",
      where: "supabase.com → Project → Settings → API → service_role",
      required: true,
    },
    {
      name: "TWILIO_ACCOUNT_SID",
      description: "Twilio Account SID for SMS",
      where: "twilio.com → Console Dashboard",
      required: false,
    },
    {
      name: "TWILIO_AUTH_TOKEN",
      description: "Twilio Auth Token",
      where: "twilio.com → Console Dashboard",
      required: false,
    },
    {
      name: "TWILIO_PHONE_NUMBER",
      description: "Your Twilio phone number",
      where: "twilio.com → Phone Numbers",
      required: false,
    },
    {
      name: "RESEND_API_KEY",
      description: "Resend API key for emails",
      where: "resend.com → API Keys",
      required: false,
    },
    {
      name: "NEXT_PUBLIC_APP_URL",
      description: "Your deployed app URL",
      where: "e.g. https://yourschool.netlify.app",
      required: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">
            🎓 EduCore Setup
          </h1>
          <p className="text-gray-600">
            Your EduCore deployment is running but needs to be 
            configured. Add the following environment variables 
            to your hosting platform.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm font-medium">
            📍 Where to add these on Netlify:
          </p>
          <p className="text-blue-700 text-sm mt-1">
            Site → Site Configuration → Environment Variables → Add variable
          </p>
          <p className="text-blue-700 text-sm">
            Then go to: Deploys → Trigger Deploy → Deploy site
          </p>
        </div>

        <div className="space-y-4">
          {vars.map((v) => (
            <div key={v.name} 
                 className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <code className="text-sm font-mono font-bold text-[#1e3a5f]">
                    {v.name}
                  </code>
                  {v.required && (
                    <span className="ml-2 text-xs bg-red-100 text-red-700 
                                     px-2 py-0.5 rounded">
                      Required
                    </span>
                  )}
                  {!v.required && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 
                                     px-2 py-0.5 rounded">
                      Optional
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-1">{v.description}</p>
              <p className="text-gray-400 text-xs mt-1">📍 {v.where}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-bold text-[#1e3a5f] mb-3">
            After adding variables:
          </h2>
          <ol className="space-y-2 text-sm text-gray-600">
            <li>1. Go back to Netlify → Deploys</li>
            <li>2. Click &quot;Trigger deploy&quot; → &quot;Deploy site&quot;</li>
            <li>3. Wait for deployment to complete</li>
            <li>4. Visit your site — it will load the login page</li>
            <li>5. Create your first admin account in Supabase Auth</li>
          </ol>
        </div>

        <div className="mt-6 text-center">
          <a href="/login" 
             className="text-[#1e3a5f] text-sm underline">
            Already configured? Go to Login →
          </a>
        </div>
      </div>
    </div>
  )
}
