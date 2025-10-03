'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Cookie, ArrowLeft, Settings, BarChart3, Shield, Eye, Sparkles } from 'lucide-react'

export default function CookiePolicy() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <span className="font-bold text-2xl sm:text-4xl">CareScribe</span>
          </button>
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
                <Cookie className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">Cookie Policy</h1>
              <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold mb-4">What Are Cookies?</h2>
                <p className="text-gray-700 leading-relaxed">
                  Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit
                  a website. They help websites remember information about your visit, such as your preferences and login details,
                  which can make your next visit easier and the service more useful.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  CareScribe uses cookies and similar tracking technologies to provide, protect, and improve our AI-powered
                  incident reporting platform. This Cookie Policy explains what cookies we use, why we use them, and how you
                  can manage your cookie preferences.
                </p>
              </section>

              {/* Types of Cookies */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Types of Cookies We Use</h2>

                <div className="space-y-6">
                  {/* Essential Cookies */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Essential Cookies (Always Active)
                    </h3>
                    <p className="text-gray-700 mb-3">
                      These cookies are necessary for the platform to function and cannot be disabled. They are typically set in
                      response to actions you take, such as logging in or filling out forms.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                      <li><strong>Authentication:</strong> Keeps you logged in securely</li>
                      <li><strong>Security:</strong> Protects against unauthorized access and CSRF attacks</li>
                      <li><strong>Session Management:</strong> Maintains your session state across pages</li>
                      <li><strong>Load Balancing:</strong> Ensures optimal performance and reliability</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-3 font-semibold">Duration: Session or up to 24 hours</p>
                  </div>

                  {/* Functional Cookies */}
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      Functional Cookies
                    </h3>
                    <p className="text-gray-700 mb-3">
                      These cookies enable enhanced functionality and personalization, such as remembering your preferences
                      and settings.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                      <li><strong>User Preferences:</strong> Language, timezone, display settings</li>
                      <li><strong>Form Data:</strong> Remembers partially completed reports (temporarily)</li>
                      <li><strong>UI State:</strong> Dashboard layout and filter preferences</li>
                      <li><strong>Accessibility:</strong> Remembers accessibility settings for users with disabilities</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-3 font-semibold">Duration: Up to 12 months</p>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Analytics Cookies
                    </h3>
                    <p className="text-gray-700 mb-3">
                      These cookies help us understand how users interact with our platform, allowing us to improve functionality
                      and user experience. All analytics data is anonymized and aggregated.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                      <li><strong>Usage Statistics:</strong> Pages visited, features used, time spent</li>
                      <li><strong>Performance Monitoring:</strong> Page load times, error rates</li>
                      <li><strong>Feature Usage:</strong> Which features are most/least used</li>
                      <li><strong>User Flow:</strong> How users navigate through the platform</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-3"><strong>Third-party providers:</strong> Google Analytics (anonymized IP)</p>
                    <p className="text-sm text-gray-600 mt-1 font-semibold">Duration: Up to 24 months</p>
                  </div>

                  {/* Performance Cookies */}
                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-primary" />
                      Performance Cookies
                    </h3>
                    <p className="text-gray-700 mb-3">
                      These cookies collect information about how the platform performs and help us identify and fix technical issues.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                      <li><strong>Error Tracking:</strong> Identifies bugs and technical issues</li>
                      <li><strong>Performance Metrics:</strong> API response times, rendering speed</li>
                      <li><strong>Resource Monitoring:</strong> Server load and capacity planning</li>
                      <li><strong>A/B Testing:</strong> Tests new features and improvements</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-3 font-semibold">Duration: Up to 12 months</p>
                  </div>
                </div>
              </section>

              {/* Specific Cookies Table */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Detailed Cookie Information</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Cookie Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Purpose</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Type</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-mono">carescribe_session</td>
                        <td className="border border-gray-300 px-4 py-2">Maintains user session</td>
                        <td className="border border-gray-300 px-4 py-2">Essential</td>
                        <td className="border border-gray-300 px-4 py-2">Session</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-mono">csrf_token</td>
                        <td className="border border-gray-300 px-4 py-2">Security - prevents CSRF attacks</td>
                        <td className="border border-gray-300 px-4 py-2">Essential</td>
                        <td className="border border-gray-300 px-4 py-2">Session</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-mono">auth_token</td>
                        <td className="border border-gray-300 px-4 py-2">User authentication</td>
                        <td className="border border-gray-300 px-4 py-2">Essential</td>
                        <td className="border border-gray-300 px-4 py-2">24 hours</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-mono">user_preferences</td>
                        <td className="border border-gray-300 px-4 py-2">Stores UI preferences and settings</td>
                        <td className="border border-gray-300 px-4 py-2">Functional</td>
                        <td className="border border-gray-300 px-4 py-2">12 months</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-mono">_ga</td>
                        <td className="border border-gray-300 px-4 py-2">Google Analytics - user identification</td>
                        <td className="border border-gray-300 px-4 py-2">Analytics</td>
                        <td className="border border-gray-300 px-4 py-2">24 months</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-mono">_gid</td>
                        <td className="border border-gray-300 px-4 py-2">Google Analytics - session tracking</td>
                        <td className="border border-gray-300 px-4 py-2">Analytics</td>
                        <td className="border border-gray-300 px-4 py-2">24 hours</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-mono">performance_id</td>
                        <td className="border border-gray-300 px-4 py-2">Performance monitoring</td>
                        <td className="border border-gray-300 px-4 py-2">Performance</td>
                        <td className="border border-gray-300 px-4 py-2">12 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Third Party Cookies */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use carefully selected third-party services that may set cookies on your device:
                </p>
                <ul className="space-y-3">
                  <li className="bg-gray-50 rounded p-4">
                    <strong className="text-gray-900">Google Analytics</strong>
                    <p className="text-sm text-gray-700 mt-1">
                      Helps us understand platform usage. IP addresses are anonymized. You can opt out using the{' '}
                      <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Google Analytics Opt-out Browser Add-on
                      </a>.
                    </p>
                  </li>
                  <li className="bg-gray-50 rounded p-4">
                    <strong className="text-gray-900">Supabase (Infrastructure Provider)</strong>
                    <p className="text-sm text-gray-700 mt-1">
                      Provides authentication and database services. Uses cookies for session management and security.
                    </p>
                  </li>
                </ul>
              </section>

              {/* Data Protection */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Cookie Data and Privacy</h2>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Important Privacy Protections:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>No Participant Data:</strong> Cookies never contain participant information or sensitive health data</li>
                    <li><strong>No Incident Content:</strong> Incident reports are never stored in cookies</li>
                    <li><strong>Encryption:</strong> Cookie data is encrypted in transit and at rest</li>
                    <li><strong>Anonymization:</strong> Analytics cookies use anonymized identifiers</li>
                    <li><strong>NDIS Compliance:</strong> All cookie usage complies with NDIS Practice Standards</li>
                    <li><strong>Data Minimization:</strong> We only collect what's necessary for functionality</li>
                  </ul>
                </div>
              </section>

              {/* Managing Cookies */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Managing Your Cookie Preferences</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">Within CareScribe</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can manage your cookie preferences through your account settings:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>Log in to your CareScribe account</li>
                  <li>Navigate to Settings → Privacy & Cookies</li>
                  <li>Toggle individual cookie categories on or off (except essential cookies)</li>
                  <li>Save your preferences</li>
                </ol>

                <h3 className="text-xl font-semibold mb-3 mt-6">Through Your Browser</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Most browsers allow you to control cookies through settings:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                  <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>
                <p className="text-sm text-gray-600 mt-4">
                  <strong>Note:</strong> Blocking essential cookies will prevent you from using CareScribe. Blocking functional
                  cookies may limit certain features.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">Mobile Devices</h3>
                <p className="text-gray-700 leading-relaxed">
                  Mobile browsers have cookie controls in their settings menus. Refer to your device manufacturer's instructions
                  for specific guidance.
                </p>
              </section>

              {/* Do Not Track */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Do Not Track Signals</h2>
                <p className="text-gray-700 leading-relaxed">
                  Some browsers include a "Do Not Track" (DNT) feature. Currently, there is no industry standard for how to
                  respond to DNT signals. CareScribe respects your privacy choices made through our cookie preference center.
                  When you disable analytics cookies through our settings, we will not track your usage patterns.
                </p>
              </section>

              {/* Impact of Disabling */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Impact of Disabling Cookies</h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-gray-700 leading-relaxed mb-3">
                    If you disable cookies, you may experience the following:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                    <li><strong>Essential cookies disabled:</strong> Cannot use CareScribe (login will fail)</li>
                    <li><strong>Functional cookies disabled:</strong> Loss of saved preferences, need to re-enter settings each session</li>
                    <li><strong>Analytics cookies disabled:</strong> No impact on functionality, but we can't improve based on usage patterns</li>
                    <li><strong>Performance cookies disabled:</strong> May experience unoptimized performance</li>
                  </ul>
                </div>
              </section>

              {/* Updates */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Cookie Policy to reflect changes in our practices or legal requirements. We will notify
                  you of significant changes via email or platform notification. The "Last updated" date at the top indicates
                  when changes were last made.
                </p>
              </section>

              {/* Contact */}
              <section className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Questions About Cookies?</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions about our use of cookies or this Cookie Policy, please contact:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Privacy Team</strong></p>
                  <p>CareScribe</p>
                  <p>Email: privacy@carescribe.com.au</p>
                  <p>Phone: 1800 CARE-SCRIBE</p>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  For general privacy inquiries, please see our{' '}
                  <button onClick={() => router.push('/privacy')} className="text-primary hover:underline">Privacy Policy</button>.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} CareScribe. All rights reserved. Built by Bernard Adjei-Yeboah with ❤️ for Maxlife Care. Thank you Dermot.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
