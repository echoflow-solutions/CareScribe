'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Accessibility, ArrowLeft, Eye, Ear, MousePointer, Keyboard, Type, Contrast, CheckCircle, Sparkles } from 'lucide-react'

export default function AccessibilityStatement() {
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
                <Accessibility className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">Accessibility Statement</h1>
              <p className="text-lg text-gray-600">Committed to inclusive design for all users</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Our Commitment to Accessibility</h2>
                <p className="text-gray-700 leading-relaxed">
                  At CareScribe, we believe that technology should be accessible to everyone, regardless of ability. As a platform
                  serving the disability support sector, accessibility isn't just a feature—it's core to our mission. We are
                  committed to ensuring that CareScribe is accessible to people with disabilities, including those who use
                  assistive technologies.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  This Accessibility Statement outlines our ongoing efforts to make CareScribe conform to the Web Content
                  Accessibility Guidelines (WCAG) 2.1 Level AA standards and comply with relevant Australian accessibility
                  legislation, including the Disability Discrimination Act 1992 (Cth).
                </p>
              </section>

              {/* Compliance Status */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Conformance Status</h2>
                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">WCAG 2.1 Level AA Compliant</h3>
                      <p className="text-gray-700">
                        CareScribe is designed to be fully conformant with the Web Content Accessibility Guidelines (WCAG) 2.1
                        at Level AA. We conduct regular accessibility audits and user testing to maintain this standard.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold text-lg">Additional Standards:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>EN 301 549 - European accessibility standard for ICT products and services</li>
                    <li>Section 508 (United States) - Federal accessibility standards</li>
                    <li>Australian Government Digital Service Standard - Accessibility requirements</li>
                    <li>NDIS Practice Standards - Including participant rights and communication support</li>
                  </ul>
                </div>
              </section>

              {/* Accessibility Features */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Accessibility Features</h2>

                <div className="space-y-6">
                  {/* Visual Accessibility */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-primary" />
                      Visual Accessibility
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>High Contrast Mode:</strong> Enhanced contrast ratios for better visibility</li>
                      <li><strong>Text Resizing:</strong> Content scales up to 200% without loss of functionality</li>
                      <li><strong>Screen Reader Support:</strong> Full compatibility with JAWS, NVDA, VoiceOver, and TalkBack</li>
                      <li><strong>Color Independence:</strong> Information never conveyed by color alone</li>
                      <li><strong>Focus Indicators:</strong> Clear visual indicators for keyboard focus</li>
                      <li><strong>Alt Text:</strong> Descriptive alternative text for all images and icons</li>
                      <li><strong>ARIA Labels:</strong> Comprehensive ARIA labeling for screen reader users</li>
                    </ul>
                  </div>

                  {/* Motor/Mobility Accessibility */}
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <MousePointer className="w-5 h-5 text-primary" />
                      Motor & Mobility Accessibility
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Keyboard Navigation:</strong> Full functionality accessible via keyboard</li>
                      <li><strong>Large Click Targets:</strong> Touch targets minimum 44x44 pixels</li>
                      <li><strong>No Time Limits:</strong> Users can complete tasks at their own pace</li>
                      <li><strong>Voice Input:</strong> Native voice-to-text functionality for hands-free operation</li>
                      <li><strong>Switch Control:</strong> Compatible with adaptive switches and assistive devices</li>
                      <li><strong>Gesture Alternatives:</strong> All gestures have single-pointer alternatives</li>
                    </ul>
                  </div>

                  {/* Keyboard Navigation */}
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Keyboard className="w-5 h-5 text-primary" />
                      Keyboard Navigation
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Tab Navigation:</strong> Logical tab order through all interactive elements</li>
                      <li><strong>Skip Links:</strong> "Skip to main content" for faster navigation</li>
                      <li><strong>Keyboard Shortcuts:</strong> Customizable shortcuts for common actions</li>
                      <li><strong>Modal Focus:</strong> Focus trap in dialogs with easy escape (ESC key)</li>
                      <li><strong>Arrow Key Support:</strong> Navigate lists, menus, and components with arrows</li>
                      <li><strong>Enter/Space:</strong> Activate buttons and controls</li>
                    </ul>
                  </div>

                  {/* Auditory Accessibility */}
                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Ear className="w-5 h-5 text-primary" />
                      Auditory Accessibility
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Visual Alerts:</strong> All audio notifications have visual equivalents</li>
                      <li><strong>Transcripts:</strong> Text transcripts for all audio content</li>
                      <li><strong>Captions:</strong> Closed captions for video training materials</li>
                      <li><strong>Volume Control:</strong> Independent volume controls for audio features</li>
                      <li><strong>No Auto-Play:</strong> Audio/video never plays automatically</li>
                    </ul>
                  </div>

                  {/* Cognitive Accessibility */}
                  <div className="bg-yellow-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Type className="w-5 h-5 text-primary" />
                      Cognitive Accessibility
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Clear Language:</strong> Plain language and simple sentence structures</li>
                      <li><strong>Consistent Layout:</strong> Predictable navigation and design patterns</li>
                      <li><strong>Error Prevention:</strong> Clear labels, instructions, and validation</li>
                      <li><strong>Help Documentation:</strong> Context-sensitive help and tutorials</li>
                      <li><strong>Progress Indicators:</strong> Clear feedback for multi-step processes</li>
                      <li><strong>Distraction-Free:</strong> Minimal animations and auto-updating content</li>
                      <li><strong>Reading Mode:</strong> Simplified layout option for easier reading</li>
                    </ul>
                  </div>

                  {/* Color & Contrast */}
                  <div className="bg-pink-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Contrast className="w-5 h-5 text-primary" />
                      Color & Contrast
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>WCAG AA Ratios:</strong> Minimum 4.5:1 for normal text, 3:1 for large text</li>
                      <li><strong>High Contrast Theme:</strong> Optional high contrast mode (7:1+ ratio)</li>
                      <li><strong>Dark Mode:</strong> Reduced eye strain option for low-light environments</li>
                      <li><strong>Colorblind Friendly:</strong> Patterns and labels supplement color information</li>
                      <li><strong>Custom Themes:</strong> User-defined color schemes for personal needs</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Assistive Technology */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Compatible Assistive Technologies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  CareScribe is designed to work with a wide range of assistive technologies:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Screen Readers</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• JAWS (Windows)</li>
                      <li>• NVDA (Windows)</li>
                      <li>• VoiceOver (macOS, iOS)</li>
                      <li>• TalkBack (Android)</li>
                      <li>• Narrator (Windows)</li>
                    </ul>
                  </div>

                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Voice Recognition</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Dragon NaturallySpeaking</li>
                      <li>• Windows Speech Recognition</li>
                      <li>• Apple Dictation</li>
                      <li>• Google Voice Typing</li>
                    </ul>
                  </div>

                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Screen Magnification</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• ZoomText</li>
                      <li>• MAGic</li>
                      <li>• Windows Magnifier</li>
                      <li>• macOS Zoom</li>
                    </ul>
                  </div>

                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Alternative Input</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Switch controls</li>
                      <li>• Eye tracking devices</li>
                      <li>• Adaptive keyboards</li>
                      <li>• Sip-and-puff systems</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Mobile Accessibility */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Mobile Accessibility</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our mobile-responsive design includes specific accessibility features:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>iOS Accessibility:</strong> Full VoiceOver support, Dynamic Type, Voice Control</li>
                  <li><strong>Android Accessibility:</strong> TalkBack compatibility, font scaling, gesture customization</li>
                  <li><strong>Touch Targets:</strong> All interactive elements meet minimum size requirements</li>
                  <li><strong>Orientation Support:</strong> Works in both portrait and landscape modes</li>
                  <li><strong>Offline Access:</strong> Core features available without internet connection</li>
                </ul>
              </section>

              {/* Testing & Validation */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Testing & Validation</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We maintain accessibility through comprehensive testing:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Automated Testing:</strong> Continuous accessibility scanning using axe, Pa11y, and Lighthouse</li>
                  <li><strong>Manual Testing:</strong> Expert accessibility audits by certified testers</li>
                  <li><strong>User Testing:</strong> Regular testing with disability support workers and participants</li>
                  <li><strong>Screen Reader Testing:</strong> All features tested with major screen readers</li>
                  <li><strong>Keyboard Testing:</strong> Complete keyboard-only navigation testing</li>
                  <li><strong>Color Contrast Analysis:</strong> Automated and manual contrast checking</li>
                  <li><strong>Assistive Tech Testing:</strong> Testing with various assistive devices and software</li>
                </ul>
              </section>

              {/* Known Limitations */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Known Limitations</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We strive for full accessibility, but some limitations currently exist:
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Third-Party Content:</strong> Some embedded content may not meet our accessibility standards.
                      We're working with vendors to improve this.</li>
                    <li><strong>PDF Reports:</strong> Exported PDF reports are accessible, but formatting may vary. Contact us
                      for alternative formats.</li>
                    <li><strong>Legacy Browser Support:</strong> Some accessibility features require modern browsers (Chrome 90+,
                      Firefox 88+, Safari 14+, Edge 90+)</li>
                    <li><strong>Complex Visualizations:</strong> Some analytics charts have limited screen reader support.
                      Data tables are provided as alternatives.</li>
                  </ul>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4">
                  We are actively working to address these limitations. If you encounter accessibility barriers, please let us know.
                </p>
              </section>

              {/* Training & Support */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Training & Support</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We provide comprehensive accessibility support:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Accessibility Documentation:</strong> Detailed guides on using CareScribe with assistive technologies</li>
                  <li><strong>Video Tutorials:</strong> Captioned training videos for all features</li>
                  <li><strong>Phone Support:</strong> Dedicated accessibility support line</li>
                  <li><strong>Email Support:</strong> accessibility@carescribe.com.au for accessibility questions</li>
                  <li><strong>Live Chat:</strong> Real-time assistance with screen reader support</li>
                  <li><strong>Training Sessions:</strong> Free accessibility training for organizations</li>
                  <li><strong>Custom Accommodations:</strong> We work with users to provide reasonable adjustments</li>
                </ul>
              </section>

              {/* Ongoing Commitment */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Our Ongoing Commitment</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Accessibility is an ongoing journey, not a destination. We are committed to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Regular accessibility audits (quarterly)</li>
                  <li>Continuous user feedback integration</li>
                  <li>Staying current with WCAG updates and best practices</li>
                  <li>Accessibility training for all development team members</li>
                  <li>Maintaining an accessibility-first design philosophy</li>
                  <li>Collaborating with the disability community for insights</li>
                  <li>Transparent communication about accessibility improvements</li>
                </ul>
              </section>

              {/* NDIS Alignment */}
              <section>
                <h2 className="text-2xl font-bold mb-4">NDIS Practice Standards Alignment</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our accessibility features align with NDIS Practice Standards, particularly:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Rights and Responsibilities:</strong> Supporting participant choice and control</li>
                  <li><strong>Communication:</strong> Providing information in accessible formats</li>
                  <li><strong>Participation:</strong> Enabling full participation in service planning and feedback</li>
                  <li><strong>Privacy and Dignity:</strong> Accessible privacy controls and settings</li>
                </ul>
              </section>

              {/* Feedback */}
              <section className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
                <h2 className="text-2xl font-bold mb-4">Accessibility Feedback</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We welcome feedback on the accessibility of CareScribe. If you encounter accessibility barriers or have
                  suggestions for improvement:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Accessibility Coordinator</strong></p>
                  <p>Email: accessibility@carescribe.com.au</p>
                  <p>Phone: 1800 ACCESS (1800 222 377)</p>
                  <p>TTY: Available for users who are deaf or hard of hearing</p>
                  <p className="mt-4">
                    We aim to respond to accessibility feedback within 2 business days and will work with you to provide
                    a suitable accommodation or solution.
                  </p>
                </div>
              </section>

              {/* Complaints */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Accessibility Complaints</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you're not satisfied with our accessibility response, you may:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>Contact our Accessibility Coordinator (details above)</li>
                  <li>Escalate to our Chief Product Officer: cpo@carescribe.com.au</li>
                  <li>Lodge a complaint with the Australian Human Rights Commission (AHRC):
                    <ul className="list-disc list-inside ml-6 mt-2 text-sm">
                      <li>Website: humanrights.gov.au</li>
                      <li>Phone: 1300 656 419</li>
                    </ul>
                  </li>
                </ol>
              </section>

              {/* Last Review */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Statement Review</h2>
                <p className="text-gray-700 leading-relaxed">
                  This Accessibility Statement was last reviewed and updated on{' '}
                  {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}.
                  We review and update this statement quarterly to reflect our ongoing accessibility improvements.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Next scheduled review:</strong>{' '}
                  {new Date(new Date().setMonth(new Date().getMonth() + 3)).toLocaleDateString('en-AU', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </p>
              </section>

              {/* Acknowledgment */}
              <section className="border-2 border-primary/20 rounded-lg p-6 bg-primary/5">
                <h3 className="text-xl font-bold mb-3">Our Promise</h3>
                <p className="text-gray-700 leading-relaxed">
                  At CareScribe, we believe everyone deserves equal access to quality incident reporting tools. We're committed
                  to continuously improving accessibility and removing barriers. Your feedback helps us create a more inclusive
                  platform for all disability support professionals and participants.
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
