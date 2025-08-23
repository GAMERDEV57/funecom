import React, { useState } from 'react';

interface HelpSectionProps {
  onClose: () => void;
}

type HelpTab = 'faq' | 'terms' | 'privacy' | 'cancellation' | 'contact';

export default function HelpSection({ onClose }: HelpSectionProps) {
  const [activeTab, setActiveTab] = useState<HelpTab>('faq');

  const TabButton = ({ tab, label, isActive, onClick }: {
    tab: HelpTab;
    label: string;
    isActive: boolean;
    onClick: (tab: HelpTab) => void;
  }) => (
    <button
      onClick={() => onClick(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  const FAQSection = () => {
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);

    const faqs = [
      {
        question: "How do I create an account on FunEcom?",
        answer: "Simply click on the sign-in button and choose to create a new account. You'll need to provide your email and create a password. After registration, complete your profile with your name and phone number."
      },
      {
        question: "How can I start selling on FunEcom?",
        answer: "To start selling, go to 'Create Your Store' section after logging in. Fill in your store details, business information, and upload necessary documents. Once your store is created, you can start adding products."
      },
      {
        question: "What payment methods are accepted?",
        answer: "We accept various payment methods including UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery (COD). COD availability depends on the store's policy and may include additional charges."
      },
      {
        question: "How do I track my order?",
        answer: "Once your order is shipped, you'll receive a tracking ID via email/SMS. You can track your order in the 'My Orders' section of your dashboard or use the tracking ID on the courier partner's website."
      },
      {
        question: "What is the return/exchange policy?",
        answer: "Return and exchange policies vary by store. Generally, items can be returned within 7-15 days of delivery if they are unused and in original packaging. Check the specific store's policy before purchasing."
      },
      {
        question: "Are there any platform fees for buyers?",
        answer: "No, FunEcom does not charge any platform fees to buyers. You only pay for the product price, applicable taxes, shipping charges (if any), and COD charges (if applicable)."
      },
      {
        question: "How do I contact customer support?",
        answer: "You can reach our customer support team via email at support@funecom.com, call our helpline at 1800-123-4567, or use the contact form in the 'Contact Us' section."
      },
      {
        question: "What should I do if I receive a damaged product?",
        answer: "If you receive a damaged product, immediately contact the store owner through the order details page or our customer support. Take photos of the damaged item and packaging for faster resolution."
      },
      {
        question: "How do I change my delivery address?",
        answer: "You can change your delivery address before the order is shipped by contacting the store owner directly. Once shipped, address changes may not be possible depending on the courier partner's policy."
      },
      {
        question: "What are the seller fees on FunEcom?",
        answer: "FunEcom charges no platform fees to sellers. However, sellers can set their own service charges, GST (if applicable), and COD charges. Payment gateway fees may apply for online transactions."
      }
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h3>
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              className="w-full px-4 py-3 text-left font-medium text-gray-800 hover:bg-gray-50 flex justify-between items-center"
            >
              {faq.question}
              <span className={`transform transition-transform ${openFAQ === index ? 'rotate-180' : ''}`}>
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
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Terms and Conditions</h3>
      
      <div className="space-y-4 text-gray-700">
        <section>
          <h4 className="font-semibold text-gray-800 mb-2">1. Acceptance of Terms</h4>
          <p>By accessing and using FunEcom, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">2. Platform Overview</h4>
          <p>FunEcom is an e-commerce platform that connects buyers and sellers. We facilitate transactions but are not directly involved in the sale of products. Each store operates independently.</p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">3. User Accounts</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Users must provide accurate and complete information when creating accounts</li>
            <li>Users are responsible for maintaining the confidentiality of their account credentials</li>
            <li>Users must notify us immediately of any unauthorized use of their account</li>
            <li>We reserve the right to suspend or terminate accounts that violate our terms</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">4. Seller Responsibilities</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Provide accurate product descriptions and pricing</li>
            <li>Maintain adequate inventory levels</li>
            <li>Process orders promptly and provide tracking information</li>
            <li>Handle customer service and returns according to their stated policies</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">5. Buyer Responsibilities</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Provide accurate shipping and contact information</li>
            <li>Make payments promptly for confirmed orders</li>
            <li>Review product details carefully before purchasing</li>
            <li>Contact sellers directly for order-related queries</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">6. Platform Fees</h4>
          <p>FunEcom operates on a zero platform fee model. We do not charge buyers or sellers any platform fees. However, sellers may set their own service charges, and standard payment gateway fees may apply.</p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">7. Prohibited Activities</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Selling counterfeit, illegal, or prohibited items</li>
            <li>Engaging in fraudulent activities</li>
            <li>Violating intellectual property rights</li>
            <li>Manipulating reviews or ratings</li>
            <li>Spamming or sending unsolicited communications</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">8. Limitation of Liability</h4>
          <p>FunEcom acts as an intermediary platform. We are not liable for disputes between buyers and sellers, product quality issues, or delivery problems. Our liability is limited to the extent permitted by law.</p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">9. Modifications</h4>
          <p>We reserve the right to modify these terms at any time. Users will be notified of significant changes, and continued use of the platform constitutes acceptance of modified terms.</p>
        </section>
      </div>
    </div>
  );

  const PrivacySection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Privacy Policy</h3>
      
      <div className="space-y-4 text-gray-700">
        <section>
          <h4 className="font-semibold text-gray-800 mb-2">1. Information We Collect</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Personal Information:</strong> Name, email address, phone number, shipping addresses</li>
            <li><strong>Account Information:</strong> Username, password, profile preferences</li>
            <li><strong>Transaction Data:</strong> Order history, payment information, shipping details</li>
            <li><strong>Usage Data:</strong> How you interact with our platform, pages visited, time spent</li>
            <li><strong>Device Information:</strong> IP address, browser type, device identifiers</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">2. How We Use Your Information</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Process and fulfill your orders</li>
            <li>Provide customer support and respond to inquiries</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Improve our platform and user experience</li>
            <li>Prevent fraud and ensure platform security</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">3. Information Sharing</h4>
          <p>We share your information only in the following circumstances:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>With Sellers:</strong> Order and shipping information necessary to fulfill your purchases</li>
            <li><strong>Service Providers:</strong> Payment processors, shipping companies, and other service providers</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">4. Data Security</h4>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">5. Your Rights</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Opt-out of marketing communications</li>
            <li>Request data portability</li>
            <li>Lodge complaints with data protection authorities</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">6. Cookies and Tracking</h4>
          <p>We use cookies and similar technologies to enhance your browsing experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.</p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">7. Data Retention</h4>
          <p>We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.</p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">8. Contact Us</h4>
          <p>If you have questions about this Privacy Policy, please contact us at privacy@funecom.com or through our customer support channels.</p>
        </section>
      </div>
    </div>
  );

  const CancellationSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Cancellation & Refund Policy</h3>
      
      <div className="space-y-4 text-gray-700">
        <section>
          <h4 className="font-semibold text-gray-800 mb-2">1. Order Cancellation</h4>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h5 className="font-medium text-blue-800 mb-2">Cancellation Timeline</h5>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li><strong>Within 1 hour:</strong> Free cancellation for all orders</li>
              <li><strong>1-24 hours:</strong> Cancellation allowed, no charges for prepaid orders</li>
              <li><strong>After 24 hours:</strong> Cancellation subject to seller approval</li>
              <li><strong>After shipping:</strong> Cancellation not allowed, return process applies</li>
            </ul>
          </div>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">2. How to Cancel Orders</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to "My Orders" in your dashboard</li>
            <li>Find the order you want to cancel</li>
            <li>Click on "Cancel Order" if available</li>
            <li>Select cancellation reason and confirm</li>
            <li>You'll receive a confirmation email/SMS</li>
          </ol>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">3. COD Order Cancellations</h4>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-800">
              <strong>Important:</strong> COD orders cancelled after dispatch may incur penalty charges as per the store's policy. Multiple COD cancellations may result in temporary restriction of COD facility.
            </p>
          </div>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">4. Refund Process</h4>
          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-gray-800">Prepaid Orders:</h5>
              <ul className="list-disc list-inside space-y-1">
                <li>Refunds processed within 7-10 business days</li>
                <li>Amount credited to original payment method</li>
                <li>Bank processing time may vary (2-7 business days)</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-800">COD Orders:</h5>
              <ul className="list-disc list-inside space-y-1">
                <li>No refund applicable for cancelled COD orders</li>
                <li>Penalty charges may apply as per store policy</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">5. Return & Exchange</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Return window varies by store (typically 7-15 days)</li>
            <li>Items must be unused and in original packaging</li>
            <li>Return shipping costs may apply</li>
            <li>Refund processed after quality check</li>
            <li>Some items may not be eligible for return (perishables, personal care items)</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">6. Non-Cancellable Orders</h4>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-800">
              <strong>The following orders cannot be cancelled:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-red-700 mt-2">
              <li>Custom or personalized products</li>
              <li>Perishable items</li>
              <li>Digital products or services</li>
              <li>Orders marked as "non-cancellable" by the seller</li>
            </ul>
          </div>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">7. Dispute Resolution</h4>
          <p>If you face any issues with cancellations or refunds:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Contact the store owner directly through order details</li>
            <li>If unresolved, contact FunEcom customer support</li>
            <li>Provide order details and relevant screenshots</li>
            <li>Our team will mediate and help resolve the issue</li>
          </ol>
        </section>
      </div>
    </div>
  );

  const ContactSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Contact Us</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-primary/5 p-6 rounded-lg">
            <h4 className="font-semibold text-primary mb-4 flex items-center">
              <img 
                src="https://i.ibb.co/1W3dCXw/1000056576-removebg-preview.png" 
                alt="FunEcom" 
                className="h-8 w-auto mr-2"
              />
              FunEcom Customer Support
            </h4>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-center">
                <span className="font-medium w-20">Email:</span>
                <a href="mailto:support@funecom.com" className="text-primary hover:underline">
                  support@funecom.com
                </a>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-20">Phone:</span>
                <a href="tel:18001234567" className="text-primary hover:underline">
                  1800-123-4567
                </a>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-20">Hours:</span>
                <div>
                  <p>Monday - Saturday: 9:00 AM - 8:00 PM</p>
                  <p>Sunday: 10:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-3">Quick Support</h4>
            <div className="space-y-2 text-green-700">
              <p><strong>WhatsApp:</strong> +91-98765-43210</p>
              <p><strong>Live Chat:</strong> Available on website</p>
              <p><strong>Response Time:</strong> Within 2-4 hours</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3">Business Address</h4>
            <div className="text-blue-700 space-y-1">
              <p>FunEcom Technologies Pvt. Ltd.</p>
              <p>123, Tech Park, Sector 18</p>
              <p>Gurugram, Haryana - 122015</p>
              <p>India</p>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-3">For Business Inquiries</h4>
            <div className="text-purple-700 space-y-1">
              <p><strong>Email:</strong> business@funecom.com</p>
              <p><strong>Phone:</strong> +91-11-4567-8900</p>
              <p><strong>Partnerships:</strong> partners@funecom.com</p>
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-3">Report Issues</h4>
            <div className="text-orange-700 space-y-1">
              <p><strong>Fraud/Abuse:</strong> security@funecom.com</p>
              <p><strong>Technical Issues:</strong> tech@funecom.com</p>
              <p><strong>Feedback:</strong> feedback@funecom.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">About FunEcom</h4>
        <p className="text-gray-700 mb-4">
          FunEcom is India's leading e-commerce platform connecting buyers and sellers across the nation. 
          We believe in empowering small businesses and providing customers with a seamless shopping experience 
          with zero platform fees.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <span className="font-medium">Founded:</span>
            <span className="ml-1">2024</span>
          </div>
          <div className="flex items-center text-gray-600">
            <span className="font-medium">Headquarters:</span>
            <span className="ml-1">Gurugram, India</span>
          </div>
          <div className="flex items-center text-gray-600">
            <span className="font-medium">Mission:</span>
            <span className="ml-1">Connecting Buyers & Sellers Nationwide</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-primary/5">
          <div className="flex items-center">
            <img 
              src="https://i.ibb.co/1W3dCXw/1000056576-removebg-preview.png" 
              alt="FunEcom Logo" 
              className="h-10 w-auto mr-3"
            />
            <div>
              <h2 className="text-2xl font-bold text-primary">Help & Support</h2>
              <p className="text-gray-600">Everything you need to know about FunEcom</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200 bg-gray-50">
          <TabButton tab="faq" label="FAQ" isActive={activeTab === 'faq'} onClick={setActiveTab} />
          <TabButton tab="terms" label="Terms & Conditions" isActive={activeTab === 'terms'} onClick={setActiveTab} />
          <TabButton tab="privacy" label="Privacy Policy" isActive={activeTab === 'privacy'} onClick={setActiveTab} />
          <TabButton tab="cancellation" label="Cancellation Policy" isActive={activeTab === 'cancellation'} onClick={setActiveTab} />
          <TabButton tab="contact" label="Contact Us" isActive={activeTab === 'contact'} onClick={setActiveTab} />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'faq' && <FAQSection />}
          {activeTab === 'terms' && <TermsSection />}
          {activeTab === 'privacy' && <PrivacySection />}
          {activeTab === 'cancellation' && <CancellationSection />}
          {activeTab === 'contact' && <ContactSection />}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 text-center">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <img 
              src="https://i.ibb.co/1W3dCXw/1000056576-removebg-preview.png" 
              alt="FunEcom" 
              className="h-6 w-auto"
            />
            <span className="font-semibold">FunEcom - Connecting Buyers & Sellers</span>
          </div>
          <p className="text-xs text-gray-500">
            © 2024 FunEcom Technologies Pvt. Ltd. All rights reserved. | Zero Platform Fees | Trusted E-commerce Platform
          </p>
        </div>
      </div>
    </div>
  );
}
