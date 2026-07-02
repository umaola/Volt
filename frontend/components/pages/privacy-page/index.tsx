"use client"

import * as React from "react"
import { IconArrowLeft } from "@tabler/icons-react"

interface PrivacyPageProps {
  onBack: () => void
}

export function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <div className="flex-grow flex flex-col h-[100dvh] max-h-[100dvh] bg-white overflow-hidden select-none">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-100 shrink-0 sticky top-0 bg-white z-10">
        <button
          type="button"
          onClick={onBack}
          className="text-[#4B5563] hover:text-[#121212] transition-colors p-1"
        >
          <IconArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-[#052e16] tracking-tight">Privacy Policy</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 text-sm text-[#4B5563] leading-relaxed">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#052e16]">Volt's Privacy Policy</h2>
          <p className="text-xs text-[#9CA3AF]">Effective Date: July 1, 2026</p>
        </div>

        <div className="border border-zinc-200 rounded-xl overflow-hidden">
          <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200 font-bold text-xs text-[#121212] uppercase tracking-wider">
            Document Control Sheet
          </div>
          <div className="divide-y divide-zinc-200 text-xs">
            <div className="grid grid-cols-3 px-4 py-2.5">
              <span className="font-semibold text-[#121212]">Title</span>
              <span className="col-span-2">Privacy Policy</span>
            </div>
            <div className="grid grid-cols-3 px-4 py-2.5">
              <span className="font-semibold text-[#121212]">Status</span>
              <span className="col-span-2">Mandatory</span>
            </div>
            <div className="grid grid-cols-3 px-4 py-2.5">
              <span className="font-semibold text-[#121212]">Audience</span>
              <span className="col-span-2">All users of Volt Platform</span>
            </div>
            <div className="grid grid-cols-3 px-4 py-2.5">
              <span className="font-semibold text-[#121212]">Approver</span>
              <span className="col-span-2">Management of Volt Digital Services LTD</span>
            </div>
            <div className="grid grid-cols-3 px-4 py-2.5">
              <span className="font-semibold text-[#121212]">Effective Date</span>
              <span className="col-span-2">1st July, 2026</span>
            </div>
            <div className="grid grid-cols-3 px-4 py-2.5">
              <span className="font-semibold text-[#121212]">Version</span>
              <span className="col-span-2">1.0</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">1. Introduction</h3>
          <p>
            Volt is committed to protecting your privacy. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you use our platform (the &ldquo;Service&rdquo;) and applies
            to all users of Volt, including those who access the platform via mobile applications (iOS and
            Android), the website, or any other interface through which Volt is made available.
          </p>
          <p>
            By using Volt, you agree to the terms of this Privacy Policy.
          </p>
          <p>
            In addition to these terms, we have published our Terms of Use. We encourage you to read it to
            understand better how you can update, manage, export, and delete your information.
          </p>
          <p>
            For the purposes of this Policy, &ldquo;Personal Data&rdquo; means any nonpublic, personal information that
            identifies or can be used to identify you, including your name, email address, phone number,
            electricity meter number, distribution company details, tariff band information, appliance data,
            energy usage inputs, location data, payment and subscription information, and any other
            information collected through your use of the Service.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">2. Consent</h3>
          <p>
            You accept and consent to this Policy when you access our platforms, or use our Services,
            technologies, features, content or functions offered on our mobile applications, website, or any
            other platform which may be used by Volt. Your continued use of the Service constitutes
            ongoing consent to the processing of your Personal Data as described herein. You may
            withdraw your consent at any time by discontinuing your use of the Service and notifying us at
            info@volt.com. Please note that withdrawal of consent shall not affect the lawfulness of
            processing based on consent before its withdrawal.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">3. Information We Collect</h3>
          <p>
            We collect information to provide accurate electricity insights and improve user experience.
          </p>
          
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-[#121212]">a. Information You Provide</h4>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Name, email address</li>
              <li>Phone number</li>
              <li>Electricity Meter number</li>
              <li>Distribution Company</li>
              <li>Electricity tariff band (A&ndash;E, if provided)</li>
              <li>Appliance data (e.g., fridge, AC, TV usage)</li>
              <li>Energy usage inputs and preferences</li>
              <li>Location data (State and Local Government Area)</li>
              <li>Payment and subscription information</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-[#121212]">b. Automatically Collected Information</h4>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Device type and operating system</li>
              <li>IP address</li>
              <li>App usage data (features used, session duration)</li>
              <li>Log data and analytics</li>
              <li>Unique device identifiers</li>
              <li>Crash reports and performance data</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-[#121212]">c. Derived Data</h4>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Estimated electricity consumption (kWh)</li>
              <li>Cost projections</li>
              <li>Usage patterns and behavioral insights</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">4. How We Use Your Information</h3>
          <p>We use your data to:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Provide electricity usage estimates and insights</li>
            <li>Personalize your dashboard and recommendations</li>
            <li>Improve Volt&rsquo;s algorithms and accuracy</li>
            <li>Analyze trends and user behavior</li>
            <li>Communicate updates, features, or support responses</li>
            <li>Ensure platform security and prevent misuse</li>
            <li>Process subscription payments and manage your account</li>
            <li>Comply with applicable legal and regulatory obligations</li>
            <li>Send you intelligent reminders and notifications regarding your electricity consumption.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">5. Legal Basis for Processing Personal Data</h3>
          <p>
            Under the <strong>Nigeria Data Protection Act 2023 (NDPA)</strong> and the <strong>General Application and
            Implementation Framework 2025 (GAID)</strong>, we process your data based on:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Consent; when you provide information voluntarily</li>
            <li>Contractual necessity: to deliver Volt&rsquo;s services where you utilise our services</li>
            <li>Legitimate interest: improving our platform and ensuring security</li>
            <li>Compliance with legal obligations: where we are required to process data by law</li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">6. Data Sharing and Disclosure</h3>
          <p>We do not sell your personal data. We may share data with:</p>

          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-[#121212]">a. Service Providers</h4>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Cloud storage and hosting providers</li>
              <li>Analytics tools</li>
              <li>Payment processors</li>
              <li>Customer support service providers</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-[#121212]">b. Legal Authorities</h4>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>When required by Nigerian law or regulation</li>
              <li>To comply with lawful requests</li>
              <li>To protect the rights, property, or safety of Volt, its users, or the public</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-[#121212]">c. Business Transfers</h4>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>In case of merger, acquisition, or restructuring</li>
            </ul>
          </div>

          <p className="font-semibold text-[#121212]">Important:</p>
          <p>
            Volt does not share your personal data with electricity distribution companies (DisCos) unless
            you explicitly consent to same.
          </p>

          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-[#121212]">d. International Transfers</h4>
            <p>
              Where your personal data is transferred outside Nigeria (for example, to cloud service providers
              located abroad), we shall ensure that appropriate safeguards are in place in accordance with
              the NDPA and the GAID, including but not limited to adequacy decisions, standard contractual
              clauses, or binding corporate rule.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">7. Where we Store your Personal Data</h3>
          <p>
            The Personal Data that we collect from you may be transferred to and stored at a destination
            outside Nigeria, including on secure cloud storage solutions. By submitting your Personal Data,
            you agree to this transfer, storing or processing. We will take all steps reasonably necessary to
            ensure that your Personal Data is treated securely and in accordance with this Policy and
            applicable data protection laws.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">8. Data Retention</h3>
          <p>We retain your data only as long as necessary to:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Provide the service</li>
            <li>Improve our platform</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p>
            Upon termination of your account, we shall retain your personal data for a period not exceeding
            6 years in accordance with applicable legal and regulatory requirements, after which it shall be
            securely deleted.
          </p>
          <p>You may request deletion of your data at any time.</p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">9. Your Choices</h3>
          <p>
            <strong>Account Information.</strong> You may edit your Personal Data by logging into your account via the
            Service. If you wish to delete or deactivate your account, please contact us at info@volt.com.
            Please note that we may retain certain Personal Data as required by law or for legitimate
            business purposes. Where you notice misrepresentations in your personal information, please
            promptly notify us and provide all requested documentation to enable us to implement the
            necessary updates or changes.
          </p>
          <p>
            <strong>Promotional Communications.</strong> We may contact and inform you of products, features, or
            services that we think may be beneficial or of interest to you. You may opt out of receiving
            promotional emails and messages from Volt by following the instructions in those messages or
            adjusting your notification preferences within the App. Please note that if you opt out, we may
            still send you transactional or relationship messages, such as those about your account,
            electricity consumption alerts, and unit depletion warnings.
          </p>
          <p>
            <strong>Location Information.</strong> If you initially consent to the collection of location information within our
            mobile application, you may subsequently stop this collection through your device operating
            system settings or through your account settings within the App. If these opt-out options are not
            available to you, you may also disable location information by following the standard uninstall
            process to remove our mobile application from your device.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">10. Your Rights</h3>
          <p>Under the <strong>NDPA</strong>, you have the right to:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion (&ldquo;right to be forgotten&rdquo;)</li>
            <li>Withdraw consent at any time</li>
            <li>Object to or restrict processing</li>
            <li>Request data portability</li>
            <li>Lodge a complaint with the Nigeria Data Protection Commission (NDPC)</li>
          </ul>
          <p>
            To exercise these rights, contact us at: <strong>info@volt.com</strong>. We shall respond to your request within
            30 days of receipt. Where we are unable to comply with your request, we shall provide you with
            reasons for such refusal.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">11. Data Security</h3>
          <p>We implement appropriate technical and organisational measures including:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Encryption of personal data in transit and at rest</li>
            <li>Secure servers and access controls</li>
            <li>Monitoring for unauthorized access</li>
            <li>Regular security assessments and vulnerability testing</li>
            <li>Employee training on data protection</li>
            <li>
              User Security Responsibilities. Where you have chosen a password that allows you to
              access your account, you are responsible for keeping this password confidential. We
              advise you not to share your password with anyone. You are responsible for maintaining
              the confidentiality of your account information and any activity that occurs under your
              account. You are advised to: (i) choose strong and unique passwords for your account
              and change them regularly; (ii) keep your login details confidential and avoid sharing
              them with anyone; (iii) regularly review your account activity for any unauthorised
              actions; and (iv) log out of your account when using shared or public devices. If you
              believe your account has been compromised or you notice any suspicious activity,
              please contact us immediately at info@volt.com.
            </li>
          </ul>
          <p>
            However, no system is completely secure. In the event of a breach of security leading to the
            accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to
            Personal Data, we shall, within 72 (Seventy-Two) hours of having knowledge of such breach,
            report the details of the breach to the Nigeria Data Protection Commission. Furthermore, where
            we ascertain that such breach is detrimental, promptly upon having knowledge of the
            occurrence of such breach take steps to inform of the breach incident, the risk to your rights
            freedoms, and any course of action to remedy said breach.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">12. Cookies and Tracking Technologies</h3>
          <p>Volt may use cookies and similar technologies to:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Improve user experience</li>
            <li>Analyze platform usage</li>
            <li>Remember preferences</li>
          </ul>
          <p>You can control cookies through your browser settings.</p>
          <p>We use the following categories of cookies:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li><strong>Strictly necessary cookies:</strong> required for the operation of the platform</li>
            <li><strong>Analytics cookies:</strong> to understand how users interact with the platform</li>
            <li><strong>Functionality cookies:</strong> to remember your preferences</li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">13. Third-Party Analytics and Advertising Services</h3>
          <p>
            We may allow third parties to provide analytics services on our behalf and to serve
            advertisements. These entities may use cookies, web beacons and other technologies to collect
            information about your use of the Service, including your IP address, device information, pages
            viewed, time spent on pages, and conversion information. This information may be used to
            analyse and track data, determine the popularity of certain content, and deliver advertising
            targeted to your interests. Links to privacy policies of third-party service providers used by the
            app include: Google Play Services, Firebase Analytics, and Crashlytics. Please refer to these
            providers&rsquo; respective privacy policies for details about their collection, use, and sharing of
            information.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">14. Children&rsquo;s Privacy</h3>
          <p>
            Volt is not intended for individuals under 18 years. We do not knowingly collect data from
            minors.
          </p>
          <p>
            If we become aware that we have collected personal data from a child under 18, we shall take
            steps to delete such information promptly.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">15. Changes to This Privacy Policy</h3>
          <p>We may update this Privacy Policy periodically.</p>
          <p>You will be notified of significant changes via:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Email</li>
            <li>In-app notification</li>
          </ul>
          <p>
            Where changes are material, we shall seek your renewed consent before the changes take
            effect. Continued use of the Service after being notified of non-material changes shall constitute
            acceptance of the updated policy.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">16. Acknowledgment</h3>
          <p>By using Volt, you acknowledge that:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Your data is used to generate energy insights and estimates</li>
            <li>Volt operates as a data-driven advisory platform, not a utility provider</li>
            <li>You have read and understood this Privacy Policy</li>
            <li>You consent to the collection and processing of your personal data as described herein</li>
            <li>
              Volt may use aggregated or anonymised data derived from your energy consumption
              patterns and appliance usage to improve its algorithms, develop new features, and
              conduct research. Such aggregated data cannot reasonably be used to identify you
              individually and shall not constitute Personal Data.
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">17. Data Protection Officer</h3>
          <p>
            Volt has appointed a Data Protection Officer (DPO) who is responsible for overseeing
            compliance with this Privacy Policy and applicable data protection laws. You may contact our
            DPO at:
          </p>
          <p>Email: <strong>info@volt.com</strong></p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">18. Contact Us</h3>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data
            practices, please contact us at:
          </p>
          <p>Email: <strong>info@volt.com</strong></p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">19. Governing Law</h3>
          <p>
            This Privacy Policy shall be governed by and construed in accordance with the laws of the
            Federal Republic of Nigeria.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">20. Affiliates and Related Entities</h3>
          <p>
            Below is a list of affiliated entities that currently may have access to Personal Data collected
            from you on our Services as set forth in this Policy. We may update this list from time to time, so
            please check back periodically to keep up to date.
          </p>
          <p>Affiliates: <em>[To be updated as applicable]</em>.</p>
        </div>
      </div>
    </div>
  )
}
