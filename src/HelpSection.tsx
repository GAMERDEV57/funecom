import React, { useState } from "react";
import { Search, X, Book, Shield, Trash, PhoneCall, MessageCircle } from "lucide-react";

interface HelpSectionProps {
  onClose: () => void;
}

type HelpTab = "faq" | "terms" | "privacy" | "cancellation" | "contact";

export default function HelpSection({ onClose }: HelpSectionProps) {
  const [activeTab, setActiveTab] = useState<HelpTab>("faq");
  const [faqSearch, setFaqSearch] = useState("");

  const TabButton = ({
    tab,
    label,
    icon: Icon,
    isActive,
    onClick,
  }: {
    tab: HelpTab;
    label: string;
    icon: React.ComponentType<any>;
    isActive: boolean;
    onClick: (tab: HelpTab) => void;
  }) => (
    <button
      onClick={() => onClick(tab)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? "bg-primary text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const faqs = [
    {
      question: "How do I create an account on FunEcom?",
      answer:
        "Simply click on the sign-in button and choose to create a new account. Provide your email and password, then complete your profile with name and phone number.",
    },
    {
      question: "How can I start selling on FunEcom?",
      answer:
        "After login, go to 'Create Your Store' section. Fill in store details and upload necessary documents. Once approved, you can add products and start selling.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept UPI, Credit/Debit Cards, Net Banking, and COD. COD availability depends on the store's policy and may include additional charges.",
    },
    {
      question: "How do I track my order?",
      answer:
        "Once shipped, you receive a tracking ID. Track your order in 'My Orders' or on courier partner's website using the tracking ID.",
    },
    {
      question: "What is the return/exchange policy?",
      answer:
        "Return/exchange policies vary by store. Items can be returned within 7-15 days if unused and in original packaging. Check store policy before purchase.",
    },
    {
      question: "Are there any platform fees for buyers?",
      answer:
        "FunEcom charges zero platform fees. Buyers pay only for product price, taxes, shipping charges (if any), and COD charges (if applicable).",
    },
    {
      question: "What should I do if I receive a damaged product?",
      answer:
        "Contact the store owner via order details or FunEcom support. Provide photos of the damaged item and packaging.",
    },
    {
      question: "How do I change my delivery address?",
      answer:
        "Change address before shipment by contacting the store owner. Once shipped, changes depend on courier policy.",
    },
    {
      question: "What are the seller fees on FunEcom?",
      answer:
        "FunEcom charges no platform fees to sellers. Sellers may set their own service charges, GST, and COD charges. Payment gateway fees may apply for online payments.",
    },
    {
      question: "How do I contact customer support?",
      answer:
        "Reach support via email at support@funecom.com, phone +91 79752 14527, or contact form on website.",
    },
    {
      question: "Can I sell digital products?",
      answer:
        "Yes, sellers can list digital products. Ensure proper delivery method and usage rights are clear.",
    },
    {
      question: "How is GST applied on products?",
      answer:
        "GST is calculated based on the store's settings. Some stores include GST in product price, others add it at checkout.",
    },
  ];

  const FAQSection = () => {
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);
    const filteredFaqs = faqs.filter((f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Book className="w-5 h-5" /> Frequently Asked Questions
        </h3>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full px-10 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        {filteredFaqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              className="w-full px-4 py-3 text-left font-medium text-gray-800 hover:bg-gray-50 flex justify-between items-center"
            >
              {faq.question}
              <span
                className={`transform transition-transform ${
                  openFAQ === index ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>
            {openFAQ === index && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const TermsSection = () => (
    <div className="space-y-6 text-gray-700">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <Book className="w-5 h-5" /> Terms and Conditions
      </h3>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">1. Acceptance of Terms</h4>
        <p>
          By accessing FunEcom, you agree to the terms and conditions of use. If you disagree, please do not use the platform.
        </p>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">2. Platform Overview</h4>
        <p>
          FunEcom, owned by Funmakerz, is an e-commerce platform connecting buyers and sellers. Stores operate independently.
        </p>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">3. User Accounts</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Provide accurate information while creating accounts</li>
          <li>Maintain confidentiality of account credentials</li>
          <li>Notify us of unauthorized account access</li>
          <li>Accounts violating terms may be suspended or terminated</li>
        </ul>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">4. Seller Responsibilities</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Provide accurate product details</li>
          <li>Maintain inventory</li>
          <li>Process orders promptly and provide tracking</li>
          <li>Handle customer service and returns per policy</li>
          <li>Comply with applicable laws</li>
        </ul>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">5. Buyer Responsibilities</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Provide accurate shipping information</li>
          <li>Make prompt payments for confirmed orders</li>
          <li>Review product details carefully</li>
          <li>Contact sellers for order-related queries</li>
        </ul>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">6. Platform Fees</h4>
        <p>
          FunEcom charges no platform fees. Sellers may set service charges, GST, and COD fees. Payment gateway fees apply for online transactions.
        </p>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">7. Prohibited Activities</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Selling illegal or prohibited items</li>
          <li>Engaging in fraudulent activities</li>
          <li>Violating intellectual property rights</li>
          <li>Manipulating reviews or ratings</li>
          <li>Spamming or unsolicited communications</li>
        </ul>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">8. Limitation of Liability</h4>
        <p>
          FunEcom is an intermediary. Not liable for disputes between buyers and sellers or delivery issues.
        </p>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">9. Modifications</h4>
        <p>
          We may modify terms anytime. Continued use implies acceptance.
        </p>
      </section>
    </div>
  );

  const PrivacySection = () => (
    <div className="space-y-6 text-gray-700">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <Shield className="w-5 h-5" /> Privacy Policy
      </h3>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">1. Information We Collect</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Personal info: Name, email, phone, addresses</li>
          <li>Account info: Username, password, preferences</li>
          <li>Transaction data: Order history, payment info, shipping</li>
          <li>Usage data: Pages visited, interactions, time spent</li>
          <li>Device info: IP, browser, device identifiers</li>
        </ul>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">2. How We Use Information</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Process orders and shipping</li>
          <li>Provide customer support</li>
          <li>Send notifications about orders</li>
          <li>Improve platform</li>
          <li>Prevent fraud and ensure security</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">3. Information Sharing</h4>
        <p>Shared only with:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Sellers (order and shipping info)</li>
          <li>Service providers (payment, shipping)</li>
          <li>Legal requirements</li>
          <li>Business transfers (merger, acquisition)</li>
        </ul>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">4. Data Security</h4>
        <p>
          We implement security measures, but no transmission over the Internet is 100% secure.
        </p>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">5. Your Rights</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Access/update personal information</li>
          <li>Delete account and data</li>
          <li>Opt-out of marketing</li>
          <li>Request data portability</li>
          <li>Lodge complaints with authorities</li>
        </ul>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">6. Cookies & Tracking</h4>
        <p>Cookies enhance experience, analytics, and personalization. Manage via browser settings.</p>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">7. Data Retention</h4>
        <p>Retain personal info as long as necessary for services and legal compliance.</p>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">8. Contact Us</h4>
        <p>Contact at privacy@funecom.com or phone +91 79752 14527.</p>
      </section>
    </div>
  );

  const CancellationSection = () => (
    <div className="space-y-6 text-gray-700">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <Trash className="w-5 h-5" /> Cancellation & Refund Policy
      </h3>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">1. Order Cancellation</h4>
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li><strong>Within 1 hour:</strong> Free cancellation</li>
            <li><strong>1-24 hours:</strong> Allowed, no charges for prepaid</li>
            <li><strong>After 24 hours:</strong> Seller approval needed</li>
            <li><strong>After shipping:</strong> Cancellation not allowed</li>
          </ul>
        </div>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">2. Refund Process</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Prepaid: Refund within 7-10 business days</li>
          <li>COD: Penalty charges may apply, no direct refund</li>
        </ul>
      </section>
      <section>
        <h4 className="font-semibold text-gray-800 mb-2">3. Return & Exchange</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Return window: 7-15 days depending on store</li>
          <li>Items must be unused and in original packaging</li>
          <li>Refund processed after quality check</li>
        </ul>
      </section>
    </div>
  );

  const ContactSection = () => (
    <div className="space-y-6 text-gray-700">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <PhoneCall className="w-5 h-5" /> Contact Us
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-primary/5 p-6 rounded-lg">
            <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> FunEcom Support
            </h4>
            <div className="space-y-2 text-gray-700">
              <div className="flex items-center gap-2">
                <span className="font-medium w-20">Email:</span>
                <a href="mailto:funmakerzoffcial@gmail.com" className="text-primary hover:underline">funmakerzoffcial@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium w-20">Phone:</span>
                <a href="tel:+917975214527" className="text-primary hover:underline">+91 79752 14527</a>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium w-20">HQ:</span>
                <div>Coming Soon</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-primary/5">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-primary">Help & Support</h2>
            <span className="text-gray-600">FunEcom by Funmakerz</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200 bg-gray-50">
          <TabButton tab="faq" label="FAQ" icon={Book} isActive={activeTab === "faq"} onClick={setActiveTab} />
          <TabButton tab="terms" label="Terms & Conditions" icon={Book} isActive={activeTab === "terms"} onClick={setActiveTab} />
          <TabButton tab="privacy" label="Privacy Policy" icon={Shield} isActive={activeTab === "privacy"} onClick={setActiveTab} />
          <TabButton tab="cancellation" label="Cancellation Policy" icon={Trash} isActive={activeTab === "cancellation"} onClick={setActiveTab} />
          <TabButton tab="contact" label="Contact Us" icon={PhoneCall} isActive={activeTab === "contact"} onClick={setActiveTab} />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "faq" && <FAQSection />}
          {activeTab === "terms" && <TermsSection />}
          {activeTab === "privacy" && <PrivacySection />}
          {activeTab === "cancellation" && <CancellationSection />}
          {activeTab === "contact" && <ContactSection />}
        </div>
      </div>
    </div>
  );
}
