import type { FaqDocument } from "@/lib/cms/schemas";

/**
 * Default FAQ copy.
 *
 * Source: "Frequently Asked Questions (FAQ) – CBN Staff Multipurpose
 * Cooperative Society Limited", supplied by the Society. Staff edit this from
 * the console; the grouped shape is shared with the public page and the
 * FAQPage structured data.
 *
 * Two deliberate departures from the source document:
 *  - Bank account numbers are not published, except the Guaranty Trust Bank
 *    account used for the ₦5,000 membership fee. Members are routed to the
 *    Accounts Department for the account that applies to their transaction.
 *  - Facility multiples follow the Society's 2026 Credit Policy already
 *    published on this website, where the FAQ document states different
 *    figures (see docs/09-faq-update-notes.md).
 */
export const faqGroups: FaqDocument["groups"] = [
  {
    title: "Membership and registration",
    items: [
      {
        q: "How do I become a member of the Cooperative?",
        a: "You must be a CBN staff member (active, retired or pensioner) or a member of Coop staff.\n• Visit cbn.coop.ng and select Register, then complete and submit the form.\n• Pay the ₦5,000 membership fee into the Society's Guaranty Trust Bank account 0023723318 (also shown on the membership page).\n• Attach proof of payment to your registration.",
      },
      {
        q: "Who are the eligible members of the Cooperative?",
        a: "Membership consists of:\n• CBN active staff\n• CBN retired staff\n• CBN pensioners\n• CBN staff on secondment to other institutions\n• Coop staff",
      },
    ],
  },
  {
    title: "Contact and address",
    items: [
      {
        q: "What is the official contact information for the Cooperative?",
        a: "Telephone and WhatsApp: 0909 679 7982.\nEmail: customerservice@cbncoopng.com",
      },
      {
        q: "What is the official address of the Society?",
        a: "No. 9 Zaria Street, Garki II, CBN Quarters Block D5, opposite CBN Clinic, Abuja.",
      },
    ],
  },
  {
    title: "Portal access and login",
    items: [
      {
        q: "How do I log in to the Coop portal?",
        a: "Open cbn.coop.ng, select Member Portal, then enter your registered email address and password and select Login.",
      },
      {
        q: "How do I reset my password?",
        a: "From cbn.coop.ng, select Member Portal, then Reset Password, and enter your registered email address. A verification code is sent to your email; enter it, then set a new password.\nPasswords must contain at least one uppercase letter, one lowercase letter, one number and one special character (for example @ # $ % ^ & *), with a minimum of eight characters — for example Abcd@123.\nIf no code arrives, contact customerservice@cbncoopng.com or call 0909 679 7982.",
      },
      {
        q: "Why do I see “The login details cannot be located”?",
        a: "The email entered is not the one linked to your Coop account, or the account is inactive or not properly registered. Check the email address first; if it is correct and the message persists, contact the customer service channels on this page.",
      },
      {
        q: "What should I do if I use the correct email and the issue persists?",
        a: "Contact customerservice@cbncoopng.com or call 0909 679 7982 so the account can be checked.",
      },
    ],
  },
  {
    title: "Account and profile updates",
    items: [
      {
        q: "How can I update my employer data, grade level or status on my Coop account?",
        a: "Members cannot change employer data directly, for control purposes. Send your recent promotion letter, or the document supporting the change, to customerservice@cbncoopng.com. The Coop Secretariat processes the update after verification.",
      },
      {
        q: "How can I increase my monthly contribution?",
        a: "Use the Variation Request option on your Coop profile.",
      },
    ],
  },
  {
    title: "Loans and savings",
    items: [
      {
        q: "Can I take a normal loan at the same time as a special loan?",
        a: "No. A further loan is not permitted while a special loan is outstanding. The Society's systems block a second facility unless a waiver is granted.",
      },
      {
        q: "What is the maximum I can take on a special or investment loan?",
        a: "Under the Society's Credit Policy, a special loan is capped at three times your savings balance and an investment loan at four times your savings balance, in each case subject to your global limit and annual deductible limit. The Secretariat confirms the figure on application.",
      },
      {
        q: "How is the total amount I qualify for worked out?",
        a: "The amount is the lower of the facility limit calculated on your savings balance and your global limit for your grade, further limited by the annual deductible that can be recovered from your salary. The Secretariat confirms the figure before a facility is drawn.",
      },
      {
        q: "When is a guarantor form required for a loan application?",
        a: "A guarantor is required for special and investment loans where you have been a member of the Cooperative for less than five years.",
      },
      {
        q: "Do I need an insurance form for every loan application?",
        a: "An insurance form is not required for a normal loan. It is required for special and investment loans.",
      },
      {
        q: "Under what conditions would my loan be cancelled?",
        a: "A loan application may be cancelled where the required documents, such as the insurance or guarantor form, are not attached, or where the application is not properly completed and submitted.",
      },
      {
        q: "What are the conditions for withdrawing from my Coop savings?",
        a: "• You must have saved continuously for at least six months.\n• The withdrawal is limited to a maximum of 50% of your savings balance.\n• You must have no outstanding loan.\n• Withdrawals are allowed once every 90 days.",
      },
      {
        q: "Am I eligible to take the full amount allocated to me under my global limit?",
        a: "Yes, provided your savings balance meets the required status limit and your annual deductible limit allows it.",
      },
    ],
  },
  {
    title: "Cooperative services",
    items: [
      {
        q: "What services does the Cooperative provide?",
        a: "• Normal loan — up to two times your savings balance.\n• Special loan — up to three times your savings balance.\n• Quick loan — repayable within one to six months.\n• Investment loan — long-term finance for major projects, up to four times your savings balance.\n• Project loan — financing for Cooperative-approved property investments.\n• End-of-service loan — short-term finance for members nearing retirement.\n• Seasonal sales or commodity loan — available at least once a year.\n• Bond investment opportunities.",
      },
    ],
  },
  {
    title: "Payments and transactions",
    items: [
      {
        q: "How do I know which account to use for my transaction?",
        a: "The Society holds separate accounts for project payments, investment bond deposits, loan repayments and savings, shares, and seasonal sales. Confirm the account that applies to your transaction with the Accounts Department (finance-admin@cbncoopng.com) before paying. The only account published on this website is the Guaranty Trust Bank account for the ₦5,000 membership fee, shown on the membership page.",
      },
      {
        q: "What happens if I pay into the wrong Cooperative account?",
        a: "Notify the Accounts Department (finance-admin@cbncoopng.com) immediately with proof of payment, such as the deposit slip or transaction reference. The correction is processed after verification.",
      },
      {
        q: "What do I need to do if I wrongly pay money into a Cooperative account?",
        a: "Send an email or written application to the Accounts Department (finance-admin@cbncoopng.com) immediately, attaching proof of payment.",
      },
      {
        q: "How will I confirm that my payment has been received?",
        a: "Deposits are confirmed against the bank statement and reflected on your member profile within 24 hours. You receive a notification once the payment is posted.",
      },
      {
        q: "How do I top up my savings account?",
        a: "Pay into the Society's Guaranty Trust Bank account, quoting your membership ID and the purpose of payment in the narration. Once confirmed, usually within 24 hours, the amount is credited to your Coop profile. The account number is issued by the Accounts Department.",
      },
      {
        q: "How do I make a deposit for a Cooperative Investment Bond?",
        a: "Complete the investment form, pay the amount to the account stated on the form, and send a scanned copy of the form and your proof of payment to the addresses printed on it.",
      },
      {
        q: "How do I indicate interest in Cooperative projects?",
        a: "For projects advertised by the Cooperative, pay the expression of interest fee to the account stated in the project notice, then complete the project application form and send a scanned copy to the addresses provided.",
      },
      {
        q: "Where do I make loan repayments?",
        a: "Loan repayments are made into the Society's Guaranty Trust Bank account. Include your membership ID and the purpose of payment in the narration. The Accounts Department issues the account number.",
      },
      {
        q: "How do I purchase shares in the Cooperative?",
        a: "Pay the amount into the Society's shares account — the Accounts Department issues the details — then complete the shares form on your Coop profile. Shares are allocated after approval.",
      },
      {
        q: "Why is my deposit not reflecting on my profile?",
        a: "The payment may not have been posted because the transaction narration was missing or incomplete. Notify the Accounts Department (finance-admin@cbncoopng.com) with proof of payment so it can be traced and posted.",
      },
      {
        q: "My application shows as “posted” but I have not been credited. What does that mean?",
        a: "Check your bank app to confirm the payment went through. If it is not there, contact the Accounts Department (finance-admin@cbncoopng.com) for further assistance.",
      },
    ],
  },
  {
    title: "Investment fund",
    items: [
      {
        q: "Which investment series can I subscribe to?",
        a: "Three four-year series are open: Classic Diamond (2024–2028, maturing January 2028), Classic Excel (2025–2029, maturing January 2029) and the Classic Investment Fund (2025–2029, maturing September 2029). The Classic Triple Plan is a short-term option running for three, six or twelve months.",
      },
      {
        q: "Who is eligible to invest?",
        a: "All registered members of the Society, including serving staff and staff approaching retirement.",
      },
      {
        q: "What are the minimum and maximum investment amounts?",
        a: "Minimum investment: ₦1,000,000.\nMaximum investment: ₦50,000,000 for serving members, and ₦100,000,000 per tranche for retiring staff. Multiple tranches are allowed.",
      },
      {
        q: "How do I apply for the bond investment?",
        a: "Complete the investment application form, transfer the investment amount to the account stated on the form, then submit the form and proof of payment to the Coop Secretariat in Abuja or Lagos, or to the email addresses printed on the form.",
      },
      {
        q: "What are the benefits of investing?",
        a: "• Guaranteed stable income, paid monthly or annually\n• Competitive interest rates\n• Flexible interest payment options\n• Access to Coop loans up to the value of your investment\n• Exclusive access to Coop land banking opportunities",
      },
      {
        q: "What is the tenor of the investment?",
        a: "Four years, from 2025 to 2029, with maturity in January 2029.",
      },
      {
        q: "Can I switch between interest rate options during the investment period?",
        a: "Yes, once per investment anniversary.",
      },
      {
        q: "What is the penalty for early liquidation?",
        a: "Under the Diamond and Excel series, liquidating without 90 days' notice attracts a charge of 50% of total interest earned, and 25% of the interest paid upfront on the front-end option. The Classic Investment Fund applies a 40% charge and requires 90 days' notice, without which a further 10% applies. The Secretariat confirms the exact charge for your tranche before you commit.",
      },
      {
        q: "Can I use funds from my Coop savings account for this investment?",
        a: "No. Funds cannot be transferred from your Coop savings account into the investment series.",
      },
      {
        q: "What happens to my principal at maturity?",
        a: "The principal is repaid in full in January 2029, or rolled over if you indicate that you want it rolled over.",
      },
    ],
  },
  {
    title: "Real estate and housing",
    items: [
      {
        q: "What types of real estate projects does the Cooperative offer?",
        a: "The Cooperative primarily offers land for sale, which members develop to their own preference. It also undertakes housing projects and residential developments from time to time, based on demand.",
      },
      {
        q: "Are there ongoing or upcoming real estate projects?",
        a: "Yes. The Cooperative regularly embarks on real estate projects across Nigeria, based on members' locations and demand. Details are published in official announcements and in the projects section of this website; the Project Department can also confirm what is currently open.",
      },
      {
        q: "Who is eligible to participate in the housing schemes?",
        a: "All registered members whose accounts are financially up to date. Some projects carry additional financial requirements.",
      },
      {
        q: "How are properties allocated to members?",
        a: "Allocation follows a first-come, first-served basis, together with the member's ability to make payments as they fall due.",
      },
      {
        q: "Can I apply for more than one property?",
        a: "Generally a member may apply for one property per project, to keep allocation fair. Where additional units are available, a second application may be allowed, subject to meeting the payment plan as it falls due.",
      },
      {
        q: "What payment plans are available for property purchases?",
        a: "Instalment plans, subject to the terms and conditions prevailing at the time, and a full payment option.",
      },
      {
        q: "What if I cannot pay for the property by myself?",
        a: "You can apply for a project loan at the prevailing Cooperative loan rate, subject to approval.",
      },
      {
        q: "Can I use my Cooperative savings to finance a property?",
        a: "Yes. In line with Cooperative policy, up to 50% of savings can be applied to a property purchase, and only where you have no existing loan.",
      },
      {
        q: "What happens if I default on my payment?",
        a: "Penalties apply, which may include converting the outstanding balance into a loan or rebooking interest. In extreme cases the allocation may be revoked, or the payment plan adjusted after discussion with the member.",
      },
      {
        q: "When will I receive the title documents or allocation letter?",
        a: "Allocation letters are issued on full payment for the property.",
      },
      {
        q: "Are the properties covered by government approvals?",
        a: "Yes. The Cooperative's real estate projects go through the necessary approvals, including title deeds, building permits and environmental assessments.",
      },
      {
        q: "How long will it take to complete the housing project?",
        a: "Completion timelines vary with the size and complexity of each project. The estimated timeline is communicated at the start of the project.",
      },
      {
        q: "Can I sell or transfer my property before full payment?",
        a: "No. Selling or transferring before full payment is not allowed unless the Cooperative grants special approval. Review the terms and conditions of your specific project.",
      },
      {
        q: "Who can I contact for updates on my application or property?",
        a: "The Project Department, at projects@cbncoopng.com, or through the Cooperative's phone line or a visit to the office.",
      },
      {
        q: "How does the Cooperative handle disputes over property allocation?",
        a: "Disputes follow a structured process: a formal complaint is submitted, the Real Estate Committee reviews it, arbitration or mediation may follow, and the Management Committee makes the final decision.",
      },
    ],
  },
];
