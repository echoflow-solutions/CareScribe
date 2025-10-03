'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { FileText, ArrowLeft, Scale, AlertCircle, CheckCircle, XCircle, Users, Sparkles } from 'lucide-react'

export default function TermsOfService() {
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
                <Scale className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">Terms of Service</h1>
              <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  Agreement to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms of Service ("Terms") constitute a legally binding agreement between you (the "User", "you", or "your")
                  and CareScribe ("we", "us", or "our") concerning your access to and use of our AI-powered incident reporting
                  platform for NDIS service providers and disability support organizations.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  By accessing or using CareScribe, you acknowledge that you have read, understood, and agree to be bound by these
                  Terms and our Privacy Policy. If you do not agree, you must not access or use our services.
                </p>
              </section>

              {/* Eligibility */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Eligibility and Account Registration
                </h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">Eligibility Requirements</h3>
                <p className="text-gray-700 leading-relaxed mb-4">You must meet the following criteria to use CareScribe:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Be at least 18 years of age</li>
                  <li>Be affiliated with a registered NDIS service provider or disability support organization</li>
                  <li>Have the legal authority to enter into this agreement on behalf of your organization (if applicable)</li>
                  <li>Hold appropriate qualifications or certifications as required by your role</li>
                  <li>Comply with all applicable laws, regulations, and NDIS Practice Standards</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">Account Registration</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>You must provide accurate, current, and complete information during registration</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You must notify us immediately of any unauthorized access or security breach</li>
                  <li>One person per account - sharing credentials is strictly prohibited</li>
                  <li>Your organization administrator may have access to manage your account</li>
                </ul>
              </section>

              {/* Acceptable Use */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Acceptable Use Policy
                </h2>

                <h3 className="text-xl font-semibold mb-3">You Agree To:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Use CareScribe solely for legitimate incident reporting and documentation purposes</li>
                  <li>Provide accurate and truthful information in all incident reports</li>
                  <li>Comply with NDIS Practice Standards and all applicable laws and regulations</li>
                  <li>Respect participant privacy and confidentiality at all times</li>
                  <li>Use the platform in accordance with your organization's policies and procedures</li>
                  <li>Report security vulnerabilities or system issues promptly to our support team</li>
                  <li>Maintain the professional standards expected in disability support services</li>
                </ul>
              </section>

              {/* Prohibited Use */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  Prohibited Activities
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">You must NOT:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Submit false, misleading, or fraudulent incident reports</li>
                  <li>Access or attempt to access accounts or data belonging to other users or organizations</li>
                  <li>Reverse engineer, decompile, or attempt to extract source code from our platform</li>
                  <li>Use automated systems (bots, scrapers) to access the platform without authorization</li>
                  <li>Transmit viruses, malware, or any malicious code</li>
                  <li>Interfere with or disrupt the platform's operation or security</li>
                  <li>Use the platform for any illegal or unauthorized purpose</li>
                  <li>Violate participant privacy or misuse sensitive information</li>
                  <li>Harass, abuse, or harm other users or participants</li>
                  <li>Circumvent any security features or access controls</li>
                  <li>Use the platform to compete with or replicate our services</li>
                </ul>
              </section>

              {/* Service Description */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Service Description</h2>
                <p className="text-gray-700 leading-relaxed mb-4">CareScribe provides:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Voice-to-Text Incident Reporting:</strong> AI-powered conversion of spoken incident descriptions to structured reports</li>
                  <li><strong>Automated Classification:</strong> Intelligent determination of report type (ABC vs. Incident)</li>
                  <li><strong>Compliance Management:</strong> NDIS-compliant report generation and notification workflows</li>
                  <li><strong>Analytics Dashboard:</strong> Insights and pattern recognition for safety improvement</li>
                  <li><strong>Secure Storage:</strong> Encrypted storage of incident reports with appropriate access controls</li>
                  <li><strong>Multi-user Collaboration:</strong> Role-based access for teams and hierarchical review processes</li>
                </ul>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Intellectual Property Rights</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">Our Rights</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  CareScribe and all associated intellectual property, including but not limited to software, algorithms, designs,
                  trademarks, logos, and documentation, are owned by us or our licensors. You receive no ownership rights.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">Your Content</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You retain ownership of the incident reports and data you submit. By using our services, you grant us a
                  limited license to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Process and store your data to provide the services</li>
                  <li>Use de-identified, aggregated data to improve our AI models and services</li>
                  <li>Share data as required for NDIS compliance and reporting</li>
                </ul>
              </section>

              {/* Data and Privacy */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Data Protection and Privacy</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We are committed to protecting your data in accordance with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Privacy Act 1988 (Cth) and Australian Privacy Principles (APPs)</li>
                  <li>NDIS Act 2013 and NDIS Practice Standards</li>
                  <li>HIPAA compliance standards for healthcare data</li>
                  <li>ISO 27001 information security management standards</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  For detailed information on how we collect, use, and protect your data, please review our{' '}
                  <button onClick={() => router.push('/privacy')} className="text-primary hover:underline">Privacy Policy</button>.
                </p>
              </section>

              {/* Service Availability */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Service Availability and Modifications</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">Availability</h3>
                <p className="text-gray-700 leading-relaxed">
                  We strive to provide 24/7 availability but cannot guarantee uninterrupted access. We may perform scheduled
                  maintenance, updates, or experience unexpected downtime. We are not liable for any losses resulting from
                  service unavailability.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">Modifications</h3>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify, suspend, or discontinue any aspect of the service at any time. We will
                  provide reasonable notice of significant changes affecting your use of the platform.
                </p>
              </section>

              {/* Subscription and Payment */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Subscription and Payment Terms</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Subscription Plans:</strong> Access to CareScribe requires a paid subscription based on your organization's size and needs</li>
                  <li><strong>Billing:</strong> Subscriptions are billed monthly or annually in advance</li>
                  <li><strong>Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled before the renewal date</li>
                  <li><strong>Price Changes:</strong> We may modify pricing with 30 days' notice</li>
                  <li><strong>Refunds:</strong> No refunds for partial months; cancellation takes effect at the end of the billing period</li>
                  <li><strong>Payment Methods:</strong> We accept major credit cards and direct debit</li>
                  <li><strong>Overdue Payments:</strong> Failure to pay may result in service suspension or termination</li>
                </ul>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Termination</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">By You</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may cancel your subscription at any time. Cancellation takes effect at the end of your billing period.
                  You remain responsible for any charges incurred before cancellation.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">By Us</h3>
                <p className="text-gray-700 leading-relaxed mb-4">We may suspend or terminate your access if:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>You violate these Terms or our policies</li>
                  <li>You engage in fraudulent or illegal activities</li>
                  <li>Your account poses a security risk</li>
                  <li>Payment obligations are not met</li>
                  <li>We are required to do so by law or regulatory authority</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">Effect of Termination</h3>
                <p className="text-gray-700 leading-relaxed">
                  Upon termination, your access will cease immediately. You may request a data export within 30 days. We will
                  retain data as required by NDIS regulations (minimum 7 years) and then securely delete it.
                </p>
              </section>

              {/* Liability */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-primary" />
                  Limitation of Liability
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To the maximum extent permitted by law:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>CareScribe is provided "as is" without warranties of any kind</li>
                  <li>We do not guarantee the accuracy or completeness of AI-generated content</li>
                  <li>You are responsible for reviewing and verifying all incident reports before submission</li>
                  <li>We are not liable for indirect, incidental, or consequential damages</li>
                  <li>Our total liability is limited to the amount you paid in the 12 months preceding the claim</li>
                  <li>Nothing in these Terms excludes liability for death, personal injury, fraud, or consumer guarantees under Australian law</li>
                </ul>
              </section>

              {/* Indemnification */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Indemnification</h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree to indemnify and hold harmless CareScribe, its officers, directors, employees, and agents from any
                  claims, losses, damages, or expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                  <li>Your use or misuse of the platform</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any laws or third-party rights</li>
                  <li>Content you submit or actions you take through the platform</li>
                </ul>
              </section>

              {/* NDIS Compliance */}
              <section>
                <h2 className="text-2xl font-bold mb-4">NDIS Compliance Obligations</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  While CareScribe facilitates NDIS-compliant reporting, you remain responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Ensuring reports meet NDIS Practice Standards requirements</li>
                  <li>Timely submission of incidents to the NDIS Commission as required</li>
                  <li>Following your organization's policies and procedures</li>
                  <li>Maintaining appropriate professional conduct and documentation standards</li>
                  <li>Participant consent and communication requirements</li>
                </ul>
              </section>

              {/* Dispute Resolution */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Dispute Resolution</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If a dispute arises, we encourage resolution through:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Informal Negotiation:</strong> Contact us at disputes@carescribe.com.au to discuss the issue</li>
                  <li><strong>Mediation:</strong> If unresolved, we may engage in mediation through an agreed mediator</li>
                  <li><strong>Arbitration:</strong> Disputes will be resolved through binding arbitration under Australian law</li>
                  <li><strong>Governing Law:</strong> These Terms are governed by the laws of Victoria, Australia</li>
                </ol>
              </section>

              {/* General Provisions */}
              <section>
                <h2 className="text-2xl font-bold mb-4">General Provisions</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Entire Agreement:</strong> These Terms, along with our Privacy Policy, constitute the entire agreement</li>
                  <li><strong>Severability:</strong> If any provision is found invalid, the remainder continues in effect</li>
                  <li><strong>Waiver:</strong> Failure to enforce any right does not constitute a waiver</li>
                  <li><strong>Assignment:</strong> You may not assign your rights; we may assign ours with notice</li>
                  <li><strong>Notices:</strong> Official notices will be sent to your registered email address</li>
                  <li><strong>Force Majeure:</strong> We are not liable for delays caused by circumstances beyond our control</li>
                </ul>
              </section>

              {/* Updates */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Updates to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update these Terms from time to time. We will notify you of material changes via email or platform
                  notification at least 14 days before they take effect. Continued use after changes constitute acceptance.
                </p>
              </section>

              {/* Contact */}
              <section className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For questions about these Terms of Service, please contact:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Legal Department</strong></p>
                  <p>CareScribe</p>
                  <p>Email: legal@carescribe.com.au</p>
                  <p>Phone: 1800 CARE-SCRIBE</p>
                  <p>Mail: CareScribe Legal, Melbourne VIC 3000, Australia</p>
                </div>
              </section>

              {/* Acknowledgment */}
              <section className="border-2 border-primary/20 rounded-lg p-6 bg-primary/5">
                <h3 className="text-xl font-bold mb-3">Acknowledgment</h3>
                <p className="text-gray-700 leading-relaxed">
                  By using CareScribe, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                  You also acknowledge your responsibilities as a disability support professional and your commitment to upholding
                  the highest standards of participant care and privacy.
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
