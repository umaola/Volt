"use client"

import * as React from "react"
import { IconArrowLeft } from "@tabler/icons-react"

interface TermsPageProps {
  onBack: () => void
}

export function TermsPage({ onBack }: TermsPageProps) {
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
        <h1 className="text-lg font-bold text-[#052e16] tracking-tight">Terms of Use</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 text-sm text-[#4B5563] leading-relaxed">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#052e16]">Volt's Terms of Use</h2>
          <p className="text-xs text-[#9CA3AF]">Effective Date: July 1, 2026</p>
        </div>

        <div className="border border-zinc-200 rounded-xl overflow-hidden">
          <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200 font-bold text-xs text-[#121212] uppercase tracking-wider">
            Document Control Sheet
          </div>
          <div className="divide-y divide-zinc-200 text-xs">
            <div className="grid grid-cols-3 px-4 py-2.5">
              <span className="font-semibold text-[#121212]">Title</span>
              <span className="col-span-2">Terms of Use</span>
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

        <div className="flex flex-col gap-3">
          <p>
            Welcome to Volt, a digital platform designed to help users monitor, estimate and better
            understand their electricity consumption.
          </p>
          <p>
            By accessing or using Volt, you agree to be bound by these Terms of Use (&ldquo;Terms&rdquo;). If you do
            not agree, you must not use the Service. These Terms of Use help define Volt&rsquo;s relationship with
            you as you interact with our services.
          </p>
          <p>
            In addition to these terms, we publish our Privacy Policy. We encourage you to read it to
            understand better how you can update, manage, export, and delete your information.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">1. Introduction</h3>
          <p>
            These Terms of Use are a legally binding contract between you and Volt Digital Services LTD, a company
            incorporated under the laws of the Federal Republic of Nigeria (the &ldquo;Company&rdquo;), with RC number: 9637947.
            Access to and use Volt&rsquo;s product and services are expressly conditioned upon your accepting these Terms.
            If you do not accept these Terms, you will not be able to access Volt or its services.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">2. Definitions</h3>
          <p>In these Terms, unless the context otherwise requires:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>&ldquo;App&rdquo;</strong> means the Volt mobile application available on iOS and Android platforms;
            </li>
            <li>
              <strong>&ldquo;DisCo&rdquo;</strong> means a Distribution Company licensed by NERC to distribute electricity in Nigeria;
            </li>
            <li>
              <strong>&ldquo;NDPA&rdquo;</strong> means the Nigeria Data Protection Act, 2023;
            </li>
            <li>
              <strong>&ldquo;NERC&rdquo;</strong> means the Nigerian Electricity Regulatory Commission;
            </li>
            <li>
              <strong>&ldquo;Service&rdquo;</strong> means the services provided by Volt, including electricity usage tracking, estimation
              tools, predictive analytics, and related features;
            </li>
            <li>
              <strong>&ldquo;Subscription&quot;</strong> means a paid plan granting access to premium features of Volt;
            </li>
            <li>
              <strong>&ldquo;User&rdquo;</strong> or <strong>&ldquo;you&rdquo;</strong> means any individual who accesses or uses the Volt platform.
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">3. Nature of the Service</h3>
          <p>Volt provides:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>electricity usage tracking and estimation tools</li>
            <li>tariff-based consumption calculations (including band A-E structures)</li>
            <li>appliance-based energy insights</li>
            <li>predictive analytics-based on user input and available data</li>
          </ul>
          <p className="font-semibold text-[#121212]">Volt is NOT:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>an electricity distribution company (DisCo)</li>
            <li>a licensed electricity supplier</li>
            <li>a metering authority</li>
            <li>a billing authority</li>
          </ul>
          <p>
            Volt does not <strong>sell electricity</strong> or issue official electricity bills. All outputs are <strong>informational
            estimates only</strong>.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">4. Regulatory Context</h3>
          <p>
            Volt operates in compliance with applicable Nigerian laws. Nothing in this service shall be
            interpreted as:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Replacing official metering systems</li>
            <li>Interfering with electricity distribution infrastructure</li>
            <li>Acting as a regulated utility service</li>
          </ul>
          <p>
            Users remain subject to their respective distribution company (DisCo) for:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Meter Readings</li>
            <li>Billing</li>
            <li>Tariff Classification</li>
            <li>Service Disputes</li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">3. User Eligibility</h3>
          <p>You must:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>You must be at least <strong>18 years old</strong> to use the Volt App</li>
            <li>We do not knowingly collect personal information from children under 18 years of age.</li>
            <li>We do not allow people to use the App and access Volt if they are younger than 18.</li>
            <li>Provide accurate and complete information</li>
            <li>Use the Service only for lawful purposes</li>
            <li>Be a resident of Nigeria or have a valid Nigerian electricity meter number</li>
            <li>Not have been previously suspended or terminated from using the Service</li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">4. User Responsibilities</h3>
          <p>You agree to:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Provide accurate appliance and usage data</li>
            <li>Not manipulate or misuse Volt&rsquo;s calculations</li>
            <li>Not rely solely on Volt for financial or billing decisions</li>
            <li>Verify all estimates against your official electricity provider</li>
            <li>Keep your account credentials confidential and not share them with third parties</li>
            <li>Notify Volt immediately of any unauthorised access to your account</li>
          </ul>
          <p>You are solely responsible for:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Any decisions made based on Volt insights</li>
            <li>Ensuring compliance with your DisCo&rsquo;s terms</li>
            <li>Maintaining the security of your account credentials</li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">5. Accuracy Disclaimer</h3>
          <p>Volt uses algorithms based on:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Tariff structures (e.g., Eko Electricity Distribution Company, Ikeja Electricity Distribution Company etc.)</li>
            <li>User-provided data</li>
            <li>General energy consumption models</li>
          </ul>
          <p>however:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>results are estimates, not guarantees</li>
            <li>
              actual consumption may vary due to:
              <ul className="list-circle pl-5 mt-1 flex flex-col gap-1 text-xs">
                <li>voltage fluctuations</li>
                <li>meter inaccuracies</li>
                <li>tariff changes</li>
                <li>load shedding or outages</li>
              </ul>
            </li>
          </ul>
          <p>Volt shall <strong>not be liable</strong> for discrepancies between:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>estimated units and actual billed units</li>
            <li>predicted cost and actual electricity charges</li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">6. Prohibited Use</h3>
          <p>You may not:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Use Volt to reverse-engineer or exploit DisCo systems</li>
            <li>Misrepresent Volt data as official billing</li>
            <li>Use the platform for fraudulent or illegal activity</li>
            <li>Attempt to gain unauthorized access to Volt systems</li>
            <li>Use automated bots, scrapers, or similar tools to access the Service</li>
            <li>Interfere with or disrupt the integrity or performance of the Service</li>
            <li>Upload viruses, malware, or other harmful code</li>
            <li>Use the Service to infringe upon the intellectual property rights of any third party</li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">7. Intellectual Property</h3>
          <p>
            We grant you a personal, worldwide, revocable, non-transferable and non-exclusive licence to
            access and use the App for personal and non-commercial purposes in accordance with the
            terms of these Terms. You may not copy, store, modify, distribute, transmit, perform, reproduce,
            publish, licence, create derivative works from, transfer or sell any text, graphics, logos and other
            source-identifying symbols, designs, icons, images, or other information, software or code
            obtained from the App without prior express written permission from the Company which may be
            withheld for any or no reason. You further agree not to download, display or use any content on
            the App that is provided by the Company or its licensors located on the App for use in any
            publications, in public performances, on websites other than the App for any other commercial
            purpose, in connection with products or services that are not those of the Company, in any other
            manner that is likely to confuse consumers, that disparages or discredits the Company and/or
            its licensors, that dilutes the strength of the Company or its licensor&rsquo;s property, or that otherwise
            infringes the Company or its licensors&rsquo; intellectual property rights. You further agree not to
            misuse any content published by the Company or third-party content that appears on the App.
          </p>
          <p>
            All rights, title, and interest in and to the App not expressly granted in these Terms are reserved
            by the Company. If you wish to use the Company&rsquo;s software, title, trade name, trademark,
            service mark, logo, domain name, and/or any other identification with notable brand features or
            other content owned by the Company, you must obtain written permission from the Company.
            Permission requests may be sent to info@volt.com.
          </p>
          <p>
            Any feedback, suggestions, or ideas you provide to Volt regarding the Service shall become the
            exclusive property of Volt, and you hereby assign all intellectual property rights in such feedback
            to Volt without any obligation of compensation or attribution.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">8. Data Privacy</h3>
          <p>Volt collects and processes user data in accordance with:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>The Nigeria Data Protection Act 2023 and the General Application and Implementation Directive 2025</li>
            <li>Our Privacy Policy.</li>
          </ul>
          <p>By using Volt, you consent to:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Collection of usage data</li>
            <li>Storage of appliance and consumption inputs</li>
            <li>Analytical processing for improving the Service</li>
          </ul>
          <p>
            Volt does <strong>not</strong> share personal data with electricity distribution companies without explicit
            consent.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">9. Limitation of Liability</h3>
          <p>
            To the fullest extent permitted by applicable law, you agree that Volt, its affiliates and their
            respective employees, officers, directors, agents, partners, representatives and third-party
            service providers will not be liable to you or any third party for (a) billing discrepancies; (b)
            financial losses from reliance on estimates (c) service interruptions (d) errors in tariff
            calculations (e) any indirect, incidental, special, consequential, punitive, or exemplary damages,
            whether based in contract, tort, or otherwise, including, but not limited to, damages for loss of
            profits, goodwill, use, data, or other intangible losses, even if such persons have been advised
            of the possibility of such damages, which arise out of or are in any way connected with these
            terms, the services, or content; or (f) any event beyond our reasonable control.
          </p>
          <p>
            To the fullest extent permitted by applicable law, we will not be liable for the actions or inactions
            of any third party not acting on our instructions, and we will not be liable for actions or inactions
            not directly traceable to us.
          </p>
          <p>
            Notwithstanding the foregoing, nothing in these terms shall exclude or limit liability for: (i) death
            or personal injury caused by negligence; (ii) fraud or fraudulent misrepresentation; or (iii) any
            other liability that cannot be excluded by law.
          </p>
          <p>
            In any event, Volt&rsquo;s total aggregate liability to you for all claims arising out of or relating to these
            terms or the service shall not exceed the total amount of fees paid by you to Volt in the twelve
            (12) months preceding the claim.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">10. Third-Party Dependencies</h3>
          <p>Volt may rely on:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Public tariff data from DisCos</li>
            <li>External APIs or datasets We do not guarantee:</li>
            <li>Real-time accuracy of third-party data</li>
            <li>Continuity of external services</li>
          </ul>
          <p>
            Volt shall not be liable for any failure or delay in performance resulting from the unavailability or
            inaccuracy of third-party data sources.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">11. Modifications to the Service</h3>
          <p>Volt reserves the right to:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Update features</li>
            <li>Modify calculations</li>
            <li>Adjust tariff logic based on regulatory changes</li>
          </ul>
          <p>
            We may update these Terms at any time. We shall notify you of material changes to these
            Terms before they take effect. Continued use of the Service after such notice period constitutes
            acceptance of the updated Terms. If you do not agree with the changes, you must discontinue
            use of the Service.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">12. Subscriptions</h3>
          <p>
            Our subscriptions include a trial period, where you can experience the application for a specified
            period at no cost or at a reduced price (&ldquo;Trial&rdquo;). Trials automatically convert to a paid
            subscription when the trial ends. To avoid being charged, you must cancel before the trial
            expires. PLEASE REVIEW ALL APPLICABLE TERMS CAREFULLY BEFORE YOU SIGN UP
            FOR TRIAL OR SUBSCRIPTION. PLEASE NOTE THAT DELETING THE VOLT APP DOES
            NOT CANCEL YOUR SUBSCRIPTION. Even if the app is gone from your phone, you will still
            be charged. To stop being charged, you need to cancel your subscription separately.
          </p>
          <p>
            By accessing Volt, you agree that your purchases are not contingent on the provision of any
            future functionality or features, or dependent on any oral or written public statements, and
            comments made by Volt regarding such functionality or features.
          </p>
          <p>
            Volt App is available via the third-party platform operators, such as Apple App Store and Google
            Play Store. Therefore, when you make a purchase, you may additionally enter into a separate
            contract with the respective third-party service provider providing your app store, whose terms
            and conditions may apply. Depending on the respective third-party service provider&rsquo;s terms and
            conditions, you may need to exercise your rights of cancellation, refunds, and revocation with
            these service providers.
          </p>
          <p>
            Volt may, from time to time, make changes to subscription, including recurring subscription fees,
            and will communicate any price changes to you in advance. Where your subscription was
            purchased through a third-party platform (such as the Apple App Store, Google Play Store, or
            others), we may deliver this notice through the functionality of that platform, in accordance with
            their policies. Price changes will take effect at the start of the next subscription period following
            the date of the price change. By continuing to use the subscription after the price change takes
            effect, you will have accepted the new price. If you don&rsquo;t agree to a price change, you can reject
            the change by unsubscribing from the applicable subscription prior to the price change going
            into effect.
          </p>
          <p>
            Tax rates or other fees are based on the rates applicable at the time of your monthly charge.
            These amounts can change over time with local tax requirements in your country, state, territory,
            county, or city. Any change in tax rate will be automatically applied based on the account
            information you provide.
          </p>
          <p>
            Your payment to Volt or the third party through which you purchased the subscription will
            automatically renew at the end of the applicable subscription period, unless you cancel your
            subscription before the end of the then-current subscription period.
          </p>
          <p>
            <strong>Subscriptions purchased through an App Store.</strong> If you purchased your subscription through a
            third-party app store or marketplace (each, an &ldquo;App Store&rdquo;), such as the Apple App Store,
            Google Play Store, or any other platform through which Volt subscriptions are made available,
            the following applies:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Your billing relationship is directly with the App Store, not with Volt.</li>
            <li>Subscription fees are billed by the App Store using the payment method associated with your App Store account.</li>
            <li>All cancellation and refund requests must be submitted directly to the relevant App Store in accordance with its policies.</li>
            <li>Volt does not process, manage, or issue cancellations or refunds for App Store subscriptions.</li>
            <li>Where this Agreement conflicts with the App Store&rsquo;s terms regarding purchase, billing, cancellation, or refunds, the respective App Store&rsquo;s Terms will govern.</li>
          </ul>
          <p>
            If you purchased your subscription directly through the app - including purchases made through
            an app-to-web flow as an alternative to App Store payments - your billing relationship is with
            Volt. To avoid being charged for the next billing period, you must cancel at least 24 hours before
            your current subscription period renews. You can cancel your subscription in any of the following
            ways:
          </p>
          <ol className="list-decimal pl-5 flex flex-col gap-1 text-xs">
            <li>Cancel yourself via the website or go to the Volt app and navigate to the Manage Subscription section. Log in to your account and follow the steps to cancel.</li>
            <li>Contact us: Reach out to our support team at info@volt.com and provide the email address associated with your Volt account.</li>
            <li>Cancel by email: Send the following to our support team via email info@volt.com.</li>
          </ol>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">13. Refund Policy</h3>
          <p>
            Where you have purchased a subscription directly from Volt (not through an App Store), you
            may request a refund within 7 days of purchase if you have not substantially used the Service
            during that period. Refund requests should be sent to info@volt.com. Refunds are not available
            for partially used subscription periods or after the 7-day window has elapsed.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">14. Termination</h3>
          <p>We may suspend or terminate your access if you:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Violate these Terms</li>
            <li>Use the Service unlawfully</li>
            <li>Attempt to compromise the platform</li>
          </ul>
          <p>We reserve the right to close, suspend, freeze, or limit access to your account if:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>The information we obtain from you does not comply with regulatory requirements.</li>
            <li>You do not meet, or are in breach of, the terms and conditions contained herein;</li>
            <li>You create risk or possible legal exposure to us;</li>
            <li>We are required to do so by law, or</li>
            <li>There is a report of or our investigations reveal that you have engaged in, fraudulent or suspicious activity with Volt.</li>
          </ul>
          <p>Please note that the list above is not exhaustive.</p>
          <p>
            Upon termination, your right to use the Service shall immediately cease. Provisions of these
            Terms that by their nature should survive termination shall survive, including but not limited to
            intellectual property provisions, disclaimers, limitations of liability, and indemnification
            obligations.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">15. Governing Law</h3>
          <p>
            These Terms, and any dispute or claim arising out of or in connection with them or their subject
            matter or formation, shall be governed by and construed in accordance with the laws of the
            Federal Republic of Nigeria.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">16. General</h3>
          <p>
            <strong>Entire Agreement:</strong> These Terms, together with the Privacy Policy, constitute the entire
            agreement between Volt and you regarding the Service.
          </p>
          <p>
            <strong>Severability:</strong> If any provision of these Terms is held to be invalid or unenforceable, that
            provision shall be severed and the remaining provisions shall continue in full force and effect.
          </p>
          <p>
            <strong>Waiver:</strong> No failure or delay by Volt in exercising any right under these Terms shall operate as a
            waiver of that right, and no single or partial exercise shall preclude any further exercise of it.
          </p>
          <p>
            <strong>Assignment:</strong> Volt may assign or transfer its rights and obligations under these Terms to any
            affiliate or successor in interest.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">17. Declaration</h3>
          <p>
            By choosing to proceed, you agree that you understand that you are opening an account with
            Volt and that all the information you have supplied is for this purpose. You agree to abide by the
            above-listed terms and conditions, which govern our operations. You also agree that the
            information supplied is true and correct. By opening an account with us, you consent to our
            carrying out regular identity and fraud prevention checks.
          </p>
          <p>
            Finally, you agree to indemnify Volt for any loss suffered as a result of any false information or
            error in the information you have supplied us.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#121212] text-base">18. Contact Information</h3>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>Email: <strong>info@volt.com</strong></p>
        </div>
      </div>
    </div>
  )
}
