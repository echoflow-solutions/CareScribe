'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft, Lock, Database, UserCheck, FileText, AlertCircle, Eye, Sparkles } from 'lucide-react'

export default function PrivacyPolicy() {
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
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  CareScribe ("we", "our", or "us") is committed to protecting the privacy and security of personal information.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
                  AI-powered incident reporting platform designed for NDIS service providers and disability support organizations.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  We understand the sensitive nature of disability support services and the critical importance of maintaining
                  participant confidentiality in accordance with the NDIS Practice Standards, Privacy Act 1988 (Cth), and
                  Australian Privacy Principles (APPs).
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Database className="w-6 h-6 text-primary" />
                  Information We Collect
                </h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">1. Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Account information (name, email, role, organization details)</li>
                  <li>Authentication credentials (encrypted passwords)</li>
                  <li>Contact information for authorized personnel</li>
                  <li>Professional registration details where applicable</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">2. Participant Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>NDIS participant identifiers (as required for incident reporting)</li>
                  <li>Incident-related information (descriptions, classifications, outcomes)</li>
                  <li>Support worker observations and documentation</li>
                  <li>Medical or health information relevant to incident reporting</li>
                  <li>Location and timestamp data for incidents</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">3. Voice Data</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Audio recordings of incident reports (temporarily processed, not permanently stored)</li>
                  <li>Transcribed text from voice inputs</li>
                  <li>AI processing metadata for quality improvement</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">4. Technical Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Device information (type, operating system, browser)</li>
                  <li>IP addresses and usage logs</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Access times and usage patterns</li>
                </ul>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-primary" />
                  How We Use Your Information
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>To provide and maintain our incident reporting services</li>
                  <li>To process voice inputs and generate compliant incident reports</li>
                  <li>To facilitate communication between support workers, managers, and regulatory bodies</li>
                  <li>To comply with NDIS reporting requirements and legal obligations</li>
                  <li>To analyze incident patterns and improve participant safety</li>
                  <li>To provide analytics and insights for service quality improvement</li>
                  <li>To maintain system security and prevent unauthorized access</li>
                  <li>To communicate important updates, security alerts, or service changes</li>
                  <li>To improve our AI models and service functionality (with de-identified data only)</li>
                </ul>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-primary" />
                  Data Security
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement industry-leading security measures to protect your information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                  <li><strong>Access Controls:</strong> Role-based access with multi-factor authentication</li>
                  <li><strong>ISO 27001 Certification:</strong> Compliance with international security standards</li>
                  <li><strong>HIPAA Compliance:</strong> Healthcare-grade security protocols</li>
                  <li><strong>Regular Audits:</strong> Ongoing security assessments and penetration testing</li>
                  <li><strong>Data Isolation:</strong> Organization data is logically separated and protected</li>
                  <li><strong>Secure Voice Processing:</strong> Audio data is processed in secure, isolated environments</li>
                  <li><strong>Incident Response:</strong> 24/7 security monitoring and rapid response protocols</li>
                </ul>
              </section>

              {/* Data Sharing */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-primary" />
                  Information Sharing and Disclosure
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell your personal information. We may share information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>With Your Consent:</strong> When you explicitly authorize information sharing</li>
                  <li><strong>NDIS Compliance:</strong> To meet mandatory reporting requirements to the NDIS Commission</li>
                  <li><strong>Legal Obligations:</strong> When required by law, court order, or regulatory authority</li>
                  <li><strong>Service Providers:</strong> With trusted vendors who assist in service delivery (under strict confidentiality agreements)</li>
                  <li><strong>Emergency Situations:</strong> To protect participant safety or prevent imminent harm</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions (with continued privacy protections)</li>
                </ul>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-primary" />
                  Data Retention
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We retain information in accordance with NDIS record-keeping requirements:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Incident Reports:</strong> Retained for a minimum of 7 years as per NDIS requirements</li>
                  <li><strong>Voice Recordings:</strong> Audio files are processed in real-time and not permanently stored</li>
                  <li><strong>Account Information:</strong> Retained for the duration of the service relationship plus 7 years</li>
                  <li><strong>System Logs:</strong> Security and access logs retained for 2 years</li>
                  <li><strong>Analytics Data:</strong> De-identified data may be retained indefinitely for service improvement</li>
                </ul>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Your Privacy Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Under the Australian Privacy Principles, you have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your information (subject to legal retention requirements)</li>
                  <li><strong>Restriction:</strong> Request limitation on how we use your information</li>
                  <li><strong>Portability:</strong> Receive your information in a structured, machine-readable format</li>
                  <li><strong>Objection:</strong> Object to certain types of processing</li>
                  <li><strong>Complaint:</strong> Lodge a complaint with the Office of the Australian Information Commissioner (OAIC)</li>
                </ul>
              </section>

              {/* NDIS Specific */}
              <section>
                <h2 className="text-2xl font-bold mb-4">NDIS-Specific Privacy Protections</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Compliance with NDIS Practice Standards (Core Module: Rights and Responsibilities)</li>
                  <li>Adherence to NDIS Commission incident reporting and notification requirements</li>
                  <li>Protection of participant privacy in accordance with the NDIS Act 2013</li>
                  <li>Secure handling of sensitive disability support information</li>
                  <li>Participant consent management for information sharing</li>
                </ul>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Cookies and Tracking Technologies</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar technologies to enhance your experience. For detailed information,
                  please see our <button onClick={() => router.push('/cookies')} className="text-primary hover:underline">Cookie Policy</button>.
                </p>
              </section>

              {/* International Transfers */}
              <section>
                <h2 className="text-2xl font-bold mb-4">International Data Transfers</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your data is primarily stored and processed within Australia. If data is transferred internationally
                  (e.g., for AI processing), we ensure appropriate safeguards are in place, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                  <li>Use of jurisdictions with adequate privacy protections</li>
                  <li>Standard contractual clauses and binding corporate rules</li>
                  <li>Data de-identification before international processing where possible</li>
                </ul>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  When incident reports involve NDIS participants who are minors, we take extra care to protect their
                  privacy. We comply with guardian consent requirements and ensure age-appropriate data handling practices.
                </p>
              </section>

              {/* Changes */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements.
                  We will notify you of significant changes via email or prominent notice within the platform. Continued use
                  of our services after such changes constitutes acceptance of the updated policy.
                </p>
              </section>

              {/* Contact */}
              <section className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Privacy Officer</strong></p>
                  <p>CareScribe</p>
                  <p>Email: privacy@carescribe.com.au</p>
                  <p>Phone: 1800 CARE-SCRIBE</p>
                  <p className="mt-4 text-sm">
                    You may also contact the Office of the Australian Information Commissioner:<br />
                    Website: www.oaic.gov.au<br />
                    Phone: 1300 363 992
                  </p>
                </div>
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
