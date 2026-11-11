export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "1. Introduction",
      content: [
        "HiRepute is committed to protecting the privacy and personal information of users who access and use our NFC Digital Business Card application. This Privacy Policy explains how we collect, use, store, and protect your information when you interact with our application.",
        "Our application allows users to create and manage digital business cards, save contact information, write business card details to NFC cards, store contacts on mobile devices, and export contacts.",
        "By accessing or using the application, you agree to the collection and use of information in accordance with this Privacy Policy."
      ]
    },
    {
      title: "2. Information We Collect",
      content: [
        "Our application may collect or access the following information based on the features used by users:"
      ],
      list: [
        "Personal information such as name, phone numbers, email addresses, and physical addresses.",
        "Business information such as company name, designation, job title, department, website, and social media links.",
        "Profile photographs and business card images provided by users.",
        "Contact information manually entered or imported from the mobile device.",
        "Authentication information required for application access, where applicable.",
        "Application preferences and settings."
      ]
    },
    {
      title: "3. How We Use Your Information",
      content: [
        "The information collected or stored may be used for the following purposes:"
      ],
      list: [
        "To create and manage digital business cards.",
        "To add, save, and organize contact information.",
        "To write business card details to compatible NFC cards.",
        "To read information from supported NFC tags.",
        "To save business card details to the mobile device's contact list.",
        "To export saved contacts in VCF file format.",
        "To generate QR codes and digital business card sharing links.",
        "To enable users to share contact information through available sharing options.",
        "To maintain application preferences and improve user experience."
      ]
    },
    {
      title: "4. Local Data Storage",
      list: [
        "Our application uses React Native AsyncStorage to store application-related information locally on the user's mobile device.",
        "This may include business card details, contact information, authentication tokens, session information, and application preferences.",
        "AsyncStorage does not provide encryption by default. Therefore, locally stored information may not be encrypted.",
        "The stored information remains on the device until users manually delete the data, clear application data, or uninstall the application.",
        "Users are advised to secure their devices to prevent unauthorized access to locally stored information."
      ]
    },
    {
      title: "5. NFC Technology",
      list: [
        "Our application provides Near Field Communication (NFC) functionality to read and write business card information to compatible NFC tags.",
        "Users can write their digital business card details to physical NFC cards and share contact information with other NFC-enabled devices.",
        "NFC functionality requires a compatible device with NFC hardware enabled and explicit user interaction.",
        "Information written to NFC tags may be accessible to other compatible NFC devices. Users are responsible for the information they choose to write to their NFC cards."
      ]
    },
    {
      title: "6. Device Permissions",
      content: [
        "Our application may request the following device permissions to provide its functionality:"
      ],
      list: [
        "Camera: To capture profile photographs and business card images, where supported.",
        "Photo Library: To select and upload images from the device.",
        "Contacts: To import contacts from or save contact information to the mobile device.",
        "NFC: To read and write information to compatible NFC tags.",
        "Storage / File Access: To access relevant files and export contacts in VCF format."
      ],
      footer: "These permissions are used to support the corresponding application features. Users can manage or revoke permissions through their device settings."
    },
    {
      title: "7. Data Sharing and Export",
      content: [
        "Our application allows users to export and share their business card and contact information through various features, including:"
      ],
      list: [
        "Exporting contacts in VCF file format.",
        "Generating QR codes for digital business card sharing.",
        "Generating digital business card sharing links.",
        "Sharing contact information through the device's native sharing options.",
        "Writing selected contact information to NFC cards."
      ],
      footer: "We do not sell or rent users' personal information to third parties. Users control the information they choose to export or share."
    },
    {
      title: "8. Data Security and Retention",
      list: [
        "We take reasonable measures to protect information handled by our application.",
        "However, information stored using AsyncStorage is not encrypted by default. Users should take appropriate precautions to protect their mobile devices and locally stored information.",
        "Application data remains stored locally until the user deletes it, clears application data, or uninstalls the application.",
        "Exported files and information written to NFC cards may remain outside the application. Users are responsible for managing or deleting such information separately."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white py-16 px-6 sm:px-8 lg:px-12">
      <div className=" mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-semibold text-gray-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm">
            Last updated: November 2026
          </p>
        </div>

        {/* Divider */}
        <div className="border-b border-gray-200 mb-12"></div>

        {/* Content Sections */}
        <div className="space-y-10">
          {sections.map((section, index) => (
            <div key={index} className="text-gray-800">
              {/* Section Title */}
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {section.title}
              </h2>

              {/* Paragraph Content */}
              {section.content && (
                <div className="space-y-3 mb-4">
                  {section.content.map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className="text-gray-700 leading-relaxed text-base"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {/* List Items */}
              {section.list && (
                <ul className="space-y-2.5 ml-5 mb-4">
                  {section.list.map((item, lIndex) => (
                    <li
                      key={lIndex}
                      className="flex gap-3 text-gray-700 text-base leading-relaxed"
                    >
                      <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Footer Text */}
              {section.footer && (
                <p className="text-gray-700 leading-relaxed text-base">
                  {section.footer}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer Divider */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <p className="text-gray-500 text-sm text-center">
            © 2026 HiRepute. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
