'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft, Lock, Key, Server, FileCheck, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react'

export default function SecurityPolicy() {
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
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">Security Policy</h1>
              <p className="text-lg text-gray-600">Protecting your data with enterprise-grade security</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Our Commitment to Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  At CareScribe, security is not an afterthought—it's fundamental to everything we do. We understand that our
                  platform handles sensitive participant information and critical incident reports for NDIS service providers.
                  This responsibility drives our unwavering commitment to implementing and maintaining the highest security
                  standards in the industry.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  This Security Policy outlines the comprehensive measures we take to protect your data, ensure platform integrity,
                  and maintain compliance with Australian healthcare and disability support regulations.
                </p>
              </section>

              {/* Compliance & Certifications */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-primary" />
                  Compliance & Certifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      ISO 27001 Certified
                    </h3>
                    <p className="text-sm text-gray-700">
                      International standard for information security management systems (ISMS), ensuring systematic
                      protection of sensitive data.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      HIPAA Compliant
                    </h3>
                    <p className="text-sm text-gray-700">
                      Healthcare-grade security protocols ensuring the confidentiality, integrity, and availability
                      of protected health information.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      NDIS Practice Standards
                    </h3>
                    <p className="text-sm text-gray-700">
                      Full compliance with NDIS (Incident Management and Reportable Incidents) Rules 2018 and
                      Practice Standards requirements.
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Privacy Act 1988 (Cth)
                    </h3>
                    <p className="text-sm text-gray-700">
                      Adherence to Australian Privacy Principles (APPs) for the collection, use, and disclosure
                      of personal information.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Encryption */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-primary" />
                  Data Encryption
                </h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">Encryption in Transit</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>TLS 1.3:</strong> All data transmitted between your device and our servers uses the latest
                    Transport Layer Security protocol</li>
                  <li><strong>Perfect Forward Secrecy:</strong> Unique session keys ensure past communications remain secure
                    even if long-term keys are compromised</li>
                  <li><strong>Certificate Pinning:</strong> Prevents man-in-the-middle attacks by validating server certificates</li>
                  <li><strong>Secure WebSockets:</strong> Real-time communications are encrypted end-to-end</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">Encryption at Rest</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>AES-256 Encryption:</strong> All stored data is encrypted using military-grade Advanced
                    Encryption Standard</li>
                  <li><strong>Encrypted Databases:</strong> Database files are encrypted at the file system level</li>
                  <li><strong>Encrypted Backups:</strong> All backup copies are encrypted before storage</li>
                  <li><strong>Key Management:</strong> Encryption keys are stored separately from encrypted data using
                    AWS Key Management Service (KMS)</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">Voice Data Security</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Real-time Processing:</strong> Voice recordings are processed in secure, isolated environments</li>
                  <li><strong>No Permanent Storage:</strong> Audio files are never permanently stored—only transcribed text is retained</li>
                  <li><strong>Encrypted Transmission:</strong> Voice data is encrypted during capture and transmission</li>
                  <li><strong>Secure Deletion:</strong> Audio data is securely wiped after transcription using DoD 5220.22-M standards</li>
                </ul>
              </section>

              {/* Access Controls */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Key className="w-6 h-6 text-primary" />
                  Access Controls & Authentication
                </h2>

                <h3 className="text-xl font-semibold mb-3">Multi-Factor Authentication (MFA)</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  MFA is mandatory for all users to prevent unauthorized access:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Time-based One-Time Passwords (TOTP) via authenticator apps</li>
                  <li>SMS verification for backup authentication</li>
                  <li>Biometric authentication support (fingerprint, face recognition)</li>
                  <li>Hardware security key support (YubiKey, Google Titan)</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">Role-Based Access Control (RBAC)</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Users only access data necessary for their role:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Support Workers:</strong> Can create and view their own incident reports</li>
                  <li><strong>Team Leaders:</strong> Can review and approve reports within their team</li>
                  <li><strong>Managers:</strong> Access to analytics and cross-team reporting</li>
                  <li><strong>Administrators:</strong> System configuration and user management</li>
                  <li><strong>Auditors:</strong> Read-only access to audit logs and compliance reports</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">Additional Security Measures</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Password Requirements:</strong> Minimum 12 characters, complexity requirements, regular rotation</li>
                  <li><strong>Session Management:</strong> Automatic logout after inactivity, concurrent session limits</li>
                  <li><strong>IP Whitelisting:</strong> Optional restriction to approved IP addresses</li>
                  <li><strong>Device Management:</strong> Track and manage authorized devices</li>
                  <li><strong>Failed Login Protection:</strong> Account lockout after repeated failed attempts</li>
                </ul>
              </section>

              {/* Infrastructure Security */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Server className="w-6 h-6 text-primary" />
                  Infrastructure Security
                </h2>

                <h3 className="text-xl font-semibold mb-3">Data Center Security</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Our infrastructure is hosted in Australian data centers with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Physical Security:</strong> 24/7 security personnel, biometric access controls, surveillance systems</li>
                  <li><strong>Environmental Controls:</strong> Redundant power, cooling, and fire suppression systems</li>
                  <li><strong>Geographic Redundancy:</strong> Data replicated across multiple Australian regions</li>
                  <li><strong>Disaster Recovery:</strong> Automated failover with &lt;1 hour RTO (Recovery Time Objective)</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">Network Security</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Firewalls:</strong> Next-generation firewalls with deep packet inspection</li>
                  <li><strong>DDoS Protection:</strong> Cloudflare enterprise protection against distributed attacks</li>
                  <li><strong>Intrusion Detection:</strong> Real-time monitoring for suspicious activity</li>
                  <li><strong>Network Segmentation:</strong> Isolated environments for production, staging, and development</li>
                  <li><strong>VPN Access:</strong> Encrypted VPN required for administrative access</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">Application Security</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Secure Development:</strong> Security-first development practices and code reviews</li>
                  <li><strong>Dependency Scanning:</strong> Automated vulnerability scanning of third-party libraries</li>
                  <li><strong>OWASP Top 10:</strong> Protection against common web vulnerabilities</li>
                  <li><strong>SQL Injection Prevention:</strong> Parameterized queries and input sanitization</li>
                  <li><strong>XSS Protection:</strong> Content Security Policy (CSP) and output encoding</li>
                  <li><strong>CSRF Protection:</strong> Anti-CSRF tokens on all state-changing requests</li>
                </ul>
              </section>

              {/* Monitoring & Incident Response */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-primary" />
                  Security Monitoring & Incident Response
                </h2>

                <h3 className="text-xl font-semibold mb-3">24/7 Security Monitoring</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>SIEM System:</strong> Security Information and Event Management for real-time threat detection</li>
                  <li><strong>Log Analysis:</strong> Comprehensive logging and analysis of all system activities</li>
                  <li><strong>Anomaly Detection:</strong> AI-powered detection of unusual access patterns</li>
                  <li><strong>Automated Alerts:</strong> Immediate notification of potential security incidents</li>
                  <li><strong>Security Operations Center:</strong> Dedicated team monitoring threats 24/7</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">Incident Response Plan</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  In the event of a security incident, we follow a comprehensive response protocol:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Detection & Analysis:</strong> Identify and assess the incident within 15 minutes</li>
                  <li><strong>Containment:</strong> Isolate affected systems to prevent spread</li>
                  <li><strong>Eradication:</strong> Remove the threat and close security gaps</li>
                  <li><strong>Recovery:</strong> Restore systems and verify security</li>
                  <li><strong>Notification:</strong> Inform affected parties as required by law (within 72 hours for data breaches)</li>
                  <li><strong>Post-Incident Review:</strong> Analyze root cause and implement preventive measures</li>
                </ol>

                <h3 className="text-xl font-semibold mb-3 mt-6">Breach Notification</h3>
                <p className="text-gray-700 leading-relaxed">
                  In accordance with the Privacy Act 1988 (Cth) and NDIS requirements, we will notify:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
                  <li>Affected individuals within 72 hours of discovery</li>
                  <li>The Office of the Australian Information Commissioner (OAIC)</li>
                  <li>The NDIS Quality and Safeguards Commission (if participant data affected)</li>
                  <li>Law enforcement if criminal activity is suspected</li>
                </ul>
              </section>

              {/* Security Testing */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Security Testing & Audits</h2>

                <h3 className="text-xl font-semibold mb-3">Regular Security Assessments</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Penetration Testing:</strong> Quarterly third-party penetration tests by certified ethical hackers</li>
                  <li><strong>Vulnerability Scanning:</strong> Daily automated scans for known vulnerabilities</li>
                  <li><strong>Code Security Review:</strong> All code changes undergo security review before deployment</li>
                  <li><strong>Third-Party Audits:</strong> Annual ISO 27001 certification audits</li>
                  <li><strong>Bug Bounty Program:</strong> Rewards for responsible disclosure of security issues</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">Compliance Audits</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Annual HIPAA compliance audits</li>
                  <li>Regular NDIS Practice Standards reviews</li>
                  <li>Privacy impact assessments for new features</li>
                  <li>Data protection officer reviews</li>
                </ul>
              </section>

              {/* Data Backup */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Data Backup & Recovery</h2>
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Backup Strategy:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Continuous Backups:</strong> Real-time replication to secondary systems</li>
                    <li><strong>Daily Snapshots:</strong> Automated daily backups retained for 30 days</li>
                    <li><strong>Monthly Archives:</strong> Long-term backups retained for 7 years (NDIS compliance)</li>
                    <li><strong>Geographic Distribution:</strong> Backups stored in multiple Australian regions</li>
                    <li><strong>Encrypted Storage:</strong> All backups encrypted with AES-256</li>
                    <li><strong>Regular Testing:</strong> Monthly backup restoration tests to ensure reliability</li>
                    <li><strong>Immutable Backups:</strong> Write-once-read-many (WORM) storage prevents tampering</li>
                  </ul>
                </div>
              </section>

              {/* Employee Security */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Employee Security Practices</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Background Checks:</strong> Comprehensive screening for all employees with data access</li>
                  <li><strong>Security Training:</strong> Mandatory security awareness training for all staff</li>
                  <li><strong>NDIS Worker Screening:</strong> All relevant staff hold valid NDIS Worker Screening Checks</li>
                  <li><strong>Confidentiality Agreements:</strong> All employees sign strict NDAs and security policies</li>
                  <li><strong>Least Privilege Access:</strong> Employees only access data necessary for their role</li>
                  <li><strong>Access Reviews:</strong> Quarterly reviews of employee access permissions</li>
                  <li><strong>Offboarding Process:</strong> Immediate access revocation upon termination</li>
                </ul>
              </section>

              {/* Third-Party Security */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Third-Party Security</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We carefully vet all third-party service providers:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Security assessments before engagement</li>
                  <li>Contractual security and privacy obligations</li>
                  <li>Regular security audits of vendors</li>
                  <li>Data processing agreements (DPAs) with all processors</li>
                  <li>Vendor access limited to the minimum necessary</li>
                  <li>Annual vendor security reviews</li>
                </ul>
              </section>

              {/* User Responsibilities */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Your Security Responsibilities</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Security is a shared responsibility. To protect your account:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Use strong, unique passwords (consider a password manager)</li>
                  <li>Enable multi-factor authentication</li>
                  <li>Never share your credentials with others</li>
                  <li>Keep your devices and software updated</li>
                  <li>Use trusted networks (avoid public Wi-Fi for sensitive work)</li>
                  <li>Lock your device when stepping away</li>
                  <li>Report suspicious activity immediately</li>
                  <li>Review your account activity regularly</li>
                  <li>Complete security training provided by your organization</li>
                </ul>
              </section>

              {/* Reporting */}
              <section className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  Report a Security Issue
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you discover a security vulnerability or have security concerns:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Security Team:</strong></p>
                  <p>Email: security@carescribe.com.au (PGP key available on request)</p>
                  <p>Emergency Hotline: 1800 CARE-SEC (available 24/7)</p>
                  <p className="mt-4 text-sm">
                    <strong>Please DO NOT:</strong> Disclose security issues publicly before we've had a chance to address them.
                    We appreciate responsible disclosure and will work with you to resolve issues promptly.
                  </p>
                </div>
              </section>

              {/* Updates */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Security Policy Updates</h2>
                <p className="text-gray-700 leading-relaxed">
                  We continuously improve our security measures. This policy is reviewed quarterly and updated as needed
                  to reflect new security practices and regulatory requirements. Material changes will be communicated
                  to all users.
                </p>
              </section>

              {/* Contact */}
              <section className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Security Questions?</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For questions about our security practices:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Chief Information Security Officer (CISO)</strong></p>
                  <p>CareScribe</p>
                  <p>Email: ciso@carescribe.com.au</p>
                  <p>Phone: 1800 CARE-SCRIBE</p>
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
