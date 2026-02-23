export const CLAUSES = {
  general: {
    intro: (disclosing, receiving, type, effectiveDate) => {
      const isMutual = type === 'mutual';
      const date = effectiveDate || new Date().toLocaleDateString();
      return `This ${isMutual ? 'Mutual' : 'Unilateral'} Non-Disclosure Agreement (the "Agreement") is entered into as of ${date} (the "Effective Date") by and between ${disclosing || "[Disclosing Party]"} ${isMutual ? '' : '("Disclosing Party")'} and ${receiving || "[Receiving Party]"} ${isMutual ? '' : '("Receiving Party")'}${isMutual ? ', collectively referred to as the "Parties" and individually as a "Party"' : ''}.`;
    },
    definition: "Confidential Information shall include all information, whether oral, written, or electronic, relating to the business of the Disclosing Party, including but not limited to financial data, customer lists, trade secrets, strategic plans, technical specifications, and proprietary methodologies.",
    exclusions: "Confidential Information does not include information that is (a) publicly known through no breach of this Agreement, (b) already in Receiving Party's lawful possession prior to disclosure, (c) independently developed without use of the Disclosing Party's Confidential Information, or (d) received from a third party without breach of any confidentiality obligation.",
    term: (years) => `The obligations of confidentiality shall survive for a period of ${years || 3} years from the date of disclosure of the respective Confidential Information, or until such information becomes publicly available through no fault of the Receiving Party.`,
    return: "Upon termination of discussions or upon written request, the Receiving Party shall promptly return or destroy all documents, materials, and other tangible manifestations of Confidential Information and all copies thereof."
  },
  tech: {
    label: "Technology & Software",
    clauses: [
      {
        title: "Intellectual Property & Source Code Protection",
        text: "Confidential Information specifically includes algorithms, source code, data structures, architectural designs, technical specifications, development methodologies, and any software or technology solutions. The Receiving Party shall not reverse engineer, decompile, disassemble, or attempt to derive the source code of any software or technology provided."
      },
      {
        title: "Non-Solicitation of Technical Personnel",
        text: "For a period of 12 months following the termination of this Agreement, the Receiving Party shall not, directly or indirectly, solicit for employment any technical staff, engineers, developers, or key personnel of the Disclosing Party who had access to or knowledge of the Confidential Information."
      },
      {
        title: "Data Security Requirements",
        text: "The Receiving Party agrees to implement and maintain reasonable security measures to protect any technical data or software code disclosed, including but not limited to access controls, encryption where applicable, and secure storage protocols consistent with industry standards."
      }
    ]
  },
  creative: {
    label: "Creative & Design",
    clauses: [
      {
        title: "Creative Work Protection",
        text: "Any creative concepts, visual assets, design drafts, artistic works, branding materials, or creative methodologies shared remain the exclusive property of the Disclosing Party. No license, transfer, or assignment of intellectual property rights or moral rights is implied by this disclosure."
      },
      {
        title: "Portfolio and Publication Restrictions",
        text: "The Receiving Party is strictly prohibited from displaying, publishing, or showcasing any project materials, creative works, or concepts in any public portfolio, social media, case studies, marketing materials, or professional presentations without express prior written consent from the Disclosing Party."
      },
      {
        title: "Attribution and Credit",
        text: "In the event that the Disclosing Party grants permission for limited use or display of creative materials, proper attribution and credit must be given to the Disclosing Party as the original creator and owner of such materials."
      }
    ]
  },
  realestate: {
    label: "Real Estate & Development",
    clauses: [
      {
        title: "Non-Circumvention Clause",
        text: "The Receiving Party agrees to not circumvent the Disclosing Party by directly contacting property owners, developers, lenders, investors, or other parties associated with the disclosed real estate opportunities, projects, or transactions to pursue any business relationship or transaction independently."
      },
      {
        title: "Property Information Protection",
        text: "Confidential Information includes property valuations, financial analyses, development plans, zoning information, environmental reports, tenant information, and any proprietary investment strategies or market analyses related to real estate assets."
      },
      {
        title: "Geographic Restrictions",
        text: "The Receiving Party acknowledges that the geographic location and specific details of properties discussed are highly sensitive and agrees not to pursue similar opportunities within a 5-mile radius of any disclosed property for a period of 6 months without the Disclosing Party's written consent."
      }
    ]
  },
  healthcare: {
    label: "Healthcare & Life Sciences",
    clauses: [
      {
        title: "HIPAA and Medical Data Protection",
        text: "The Receiving Party acknowledges that any healthcare-related information may be subject to HIPAA regulations and agrees to maintain the highest standards of privacy and security for any medical data, patient information, or healthcare processes disclosed."
      },
      {
        title: "Regulatory Compliance",
        text: "All parties acknowledge that healthcare information may be subject to FDA, state medical board, and other regulatory requirements. The Receiving Party agrees to comply with all applicable healthcare regulations and standards."
      }
    ]
  },
  financial: {
    label: "Financial Services",
    clauses: [
      {
        title: "Financial Data Protection",
        text: "Confidential Information includes financial models, investment strategies, client portfolios, trading algorithms, risk assessments, and any proprietary financial methodologies. The Receiving Party agrees to treat such information with the highest level of confidentiality consistent with financial industry standards."
      },
      {
        title: "Regulatory Compliance",
        text: "The Receiving Party acknowledges that financial information may be subject to SEC, FINRA, and other financial regulatory requirements and agrees to comply with all applicable financial services regulations."
      }
    ]
  },
  robust: {
    definition: {
      title: "Broad Interpretation of Confidential Information",
      text: "Confidential Information shall be interpreted in the broadest possible sense allowed by law, covering all communications, observations, and information gained through any interaction with the Disclosing Party, regardless of whether such information was explicitly marked 'Confidential' at the time of disclosure."
    },
    enforcement: [
      {
        title: "Liquidated Damages and Remedies",
        text: "The Parties agree that any breach of this Agreement would cause irreparable harm for which monetary damages would be inadequate. In the event of a proven breach, the Receiving Party agrees to pay liquidated damages of $25,000 as a reasonable estimate of the harm caused, plus any actual damages exceeding this amount, attorney fees, and costs of enforcement."
      },
      {
        title: "Injunctive Relief",
        text: "The Receiving Party acknowledges that any breach or threatened breach of this Agreement may cause immediate and irreparable injury to the Disclosing Party, and that monetary damages may be inadequate to compensate for such breach. Therefore, the Disclosing Party shall be entitled to seek injunctive relief and other equitable remedies without the necessity of proving actual damages."
      },
      {
        title: "Third Party Restrictions",
        text: "The Receiving Party agrees not to disclose any Confidential Information to third parties, including employees, consultants, advisors, or agents, without the prior written consent of the Disclosing Party. Any permitted disclosures must be made only to individuals who have signed confidentiality agreements with terms no less restrictive than those contained herein."
      }
    ]
  }
};

export const JURISDICTIONS = [
  "Delaware", "California", "New York", "Texas", "Florida", "Illinois",
  "Washington", "Nevada", "Colorado", "Georgia", "North Carolina",
  "Virginia", "Massachusetts", "Pennsylvania", "Other"
];

export const INDUSTRY_OPTIONS = [
  { value: 'general', label: 'General Business' },
  { value: 'tech', label: 'Technology & Software' },
  { value: 'creative', label: 'Creative & Design' },
  { value: 'realestate', label: 'Real Estate' },
  { value: 'healthcare', label: 'Healthcare & Life Sciences' },
  { value: 'financial', label: 'Financial Services' }
];
