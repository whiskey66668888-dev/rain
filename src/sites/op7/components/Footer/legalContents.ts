export type LegalLinkKey = 'terms' | 'privacy' | 'responsible';

export const LEGAL_LINK_ITEMS: Array<{ key: LegalLinkKey; label: string }> = [
  { key: 'terms', label: 'Terms and Conditions' },
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'responsible', label: 'Responsible Gambling' },
];

export const LEGAL_CONTENTS: Record<LegalLinkKey, { title: string; body: string }> = {
  terms: {
    title: 'Terms and Conditions',
    body: `1. Preamble
1.1 By accessing OP7.io (hereinafter “this Website”) or by opening an account through this Website, the Customer (hereinafter “the Player”) shall be deemed to have agreed to the Terms of Use, the Privacy Policy, the rules of casino games and promotions, the promotional rules and conditions for special offers, and all other terms available on the official site. All of the above may be viewed on the “User Agreement” page; please read them carefully before accepting. If you cannot comply with, or do not agree with, the User Agreement, do not proceed to open an account or continue to use this Website. Use of this Website constitutes acceptance of the User Agreement. This new version of the User Agreement takes effect on 16 January 2025.

2. This Website
2.1 This Website is owned by SKY SPORTS N.V. (registered address: Hanchi Snoa 19 Trias Building, Curaçao; hereinafter “the Company”), which holds a licence issued by the Curaçao Gaming Control Board (OGL/2024/434/0469) and operates the online casino website lawfully in accordance with the relevant regulations. All gaming products are available.

3. Changes to the Terms
3.1 The Company reserves the right to amend, modify, update, or change the Terms for commercial and legal reasons (including to comply with new laws and regulations) and to serve the Customer better. The latest Terms and their effective date will be published on the Website. It is the user’s responsibility to remain aware of the Terms; please review them regularly. The Company also reserves the right, without prior notice, to modify the Website, its services, and the systems used to deliver those services.
3.2 If you do not agree with the changes to the Terms or systems, stop using the Website, review Section 12, and contact customer service to close your account. Any use of any function of the Website on or after the effective date of the revised Terms is deemed acceptance of the additions, deletions, substitutions or other changes (including any changes to the Company’s information) on the basis set out in section 2.1, regardless of whether the user knew of or read the updated Terms.

4. Legal Requirements
4.1 Under any circumstances, use of this Website requires that you be at least 18 years old, or the age of majority required by law or the relevant judicial authorities, whichever is higher. Use by a minor is considered a breach of the Terms. To ensure that no minor uses the Website, the Company has the right to require proof of age. In the absence of such proof, or where a user is suspected of being a minor, the Company reserves the right to terminate the Customer’s account.
4.2 Online gambling may be regarded as illegal in some jurisdictions. The Company cannot provide legal advice or guarantees regarding the Customer, nor represent the legality of the Website’s services in the user’s jurisdiction. Use of the Website is at the Customer’s own discretion, policy, and risk; verifying the legality of use in the Customer’s jurisdiction is the Customer’s responsibility.
4.3 The Company will not tolerate any illegal conduct by the Customer. The Customer represents, warrants, and agrees that use of this Website will comply with all applicable laws, regulations, and rules. The Company is not responsible for any illegal or unauthorised conduct by the Customer on this Website.
4.4 The Website prohibits Customers residing in Aruba, Bonaire, Curaçao, the Netherlands, Saba, Sint Maarten, Singapore, or the United States from opening an account, depositing funds, or using the account. This list of prohibited regions may be updated at any time, with or without prior notice. If you are a resident of any listed country or a jurisdiction under a listed country, you are not permitted to open an account and are not permitted to use one. The Company shall have discretion over how to handle deposits and balances in blocked accounts and any other decisions relating to such funds.
4.5 Any tax or fees payable on winnings obtained via this Website are the Customer’s responsibility. If the Customer’s jurisdiction taxes winnings, the Customer must declare them to the relevant authorities responsible for the administration of winnings.

5. Opening an Account
5.1 To open an account, the Customer must provide an email address, password, name, date of birth, telephone number, residential address, and other personal information at registration.
5.2 The name and address on the account must match those on the Customer’s ID and any related verification documents; the address on the ID must match the address on the address-verification document. To confirm the Customer’s identity, the Website may at any time require identification documents (including a valid passport, ID card, address-verification document, and images of payment cards). If identification is not provided, the Website may temporarily close the Customer’s account.
5.3 The Customer must provide accurate personal information at registration and update the information whenever it changes. Failure to do so may result in account closure, restrictions on account use, or invalidation of deposits (or bonuses/winnings).
5.4 Using a VPN, proxy server, or similar means to conceal your actual location is prohibited. If the Website determines that you are using it from a prohibited region, we reserve the right to close your account immediately.
5.5 For any questions, including any issues that arise during registration, contact customer service by email at support@OP7.io.
5.6 Only one player account may be registered per person, address, household, or IP address. Under no circumstances may a player, account, shared computer, or shared IP address register more than one account. If the same player registers more than one account on this Website, these will be treated as “duplicate accounts” and blocked. If the system’s checks indicate registration from the same IP, an investigation for fraudulent behaviour will be required, and the player must provide ID. Please attach a document bearing the account holder’s photograph, a copy of a recent utility bill, or a digital copy thereof.
5.6.1 All transactions using duplicate accounts will be deemed void.
5.6.2 All winnings, rewards, or bonuses obtained via duplicate accounts will be forfeited; any amounts withdrawn must be returned to the Website.
5.6.3 The Company is under no obligation to refund bonuses or deposits, or any amount, held in duplicate accounts. The Website reserves the sole right to determine matters relating to bets placed via duplicate accounts and the return of amounts lost through such use.
5.6.4 If a duplicate account is intentionally created to receive casino bonuses or other promotions, and if the duplicate account returns the first deposit of a previously created account, this is treated as improper conduct. Even where a duplicate account is created for the purpose of receiving such benefits, we will require the funds lost by the duplicate account, or the funds from the first deposit, to be returned to the duplicate account. Where the Website determines that a duplicate account has engaged in the fraudulent or improper conduct described above, none of the funds obtained via that duplicate account will be returned.

6. Identity Verification (Anti-Money Laundering)
6.1 The Customer’s right to use the Website’s services is conditional on the Customer agreeing to the following representations, warranties, and undertakings:
6.1.1 The Customer is not under 18 years of age, or the age of majority as designated by the laws applicable to the Customer.
6.1.2 The Customer is the lawful owner of the funds in the account. Personal information provided at and after registration (including on payment and deposit) must be truthful and accurate and must be updated as details change; it must be complete. The name of the account holder must match the name on the credit card, debit card, or other payment method used to deposit funds into or withdraw funds from the account on this Website.
6.1.3 The Customer must clearly understand and accept the risk of financial loss when betting through the Company’s services. Use of the services is at the Customer’s own opinion, policy, and risk, and the Customer may not claim any compensation from the Company or the Website for losses.
6.1.4 The Customer must understand betting generally on the Internet and all services, rules, and procedures of this Website. It is the Customer’s responsibility to confirm that the detailed information about a bet or game is correct.
6.2 A Customer who accepts the Terms must agree to provide the Website with ID and contact address, and to allow necessary verification procedures to be conducted by third parties (including regulatory bodies) (“the Review”).
6.3 During the Review, withdrawals from the Customer’s account may be restricted.
6.4 If the Customer supplies incorrect, inaccurate, misleading, or incomplete information to the Website, this shall be treated as a breach of contract; the Company will immediately block the Customer’s account or prohibit further play. The Company also reserves the right to judge the matter and take other measures.
6.5 An account may be closed where the Customer’s age has not been confirmed as adult. If the Customer is determined to be a minor after engaging in gambling activity, the account will be closed, all transactions will be treated as void, and the funds deposited by the Customer will be forfeited. Bets placed during that period will also be void. All winnings obtained by the Customer and all funds transferred from the Customer’s account to the player account will also be forfeited in full.

7. Username, Password, and Security
7.1 After opening an account, the Customer shall not disclose the username or password (whether voluntarily or otherwise). If the password is lost, use the “Forgot password?” link at the bottom of the login page to reset it.
7.2 The Customer is responsible for maintaining the confidentiality of the password and for all activity on the account. Any loss suffered by the Customer or a third party arising from account use is the Customer’s responsibility.
7.3 In the event of unauthorised use, theft of the Customer’s account, or other breach of security, notify the Company immediately. Where necessary, the Customer must also provide evidence of the unauthorised use or theft.

8. Deposits and Withdrawals
8.1 To play games on this Website, the player must deposit funds into their account.
8.2 The Customer must agree to the following:
8.2.1 The Customer warrants that funds deposited into the account are entirely lawful and are not obtained through any special illegal act.
8.2.2 Funds successfully deposited into the Customer’s account are deposited with the Customer’s consent. Once deposited, they cannot be cancelled, nor can they be returned to a third party to evade legal liability.
8.2.3 Funds successfully deposited into the account may only be withdrawn once effective wagering of 100% of the total deposit has been reached.
* Effective wagering: the amount of a bet that produces a win-or-loss outcome. (Example: on a Banker/Player bet that results in a Tie, the amount does not count towards effective wagering.)
8.3 The Website does not permit deposits into the Customer’s account from third parties including friends, relatives, partners, husband, or wife. Please use your own bank account or credit card to deposit. If a third-party deposit into a Customer’s account is detected, all bonuses and winnings will be forfeited and the deposit amount will not be returned to the owner.
8.4 Where funds are returned by bank transfer with legitimate reason, all fees shall be borne by the recipient.
8.5 The Website does not accept cash deposits directly from players. The Company may entrust the handling of money-related processing to third-party payment providers and other financial institutions. Where such third-party rules do not conflict with the Company’s Terms, the Customer is deemed to have accepted the third-party payment provider’s and financial institution’s terms.
8.6 Once a player has deposited, the deposit cannot be refunded or cancelled. If the Company suffers loss as a result, the Company will seek compensation from the Customer.
8.7 Where a stolen credit card is used, other fraudulent conduct is engaged in (including refund or chargeback), or deposits are made for the purpose of converting funds between payment systems (suspected fraudulent payments), the Website reserves the right to block the Customer’s account and reclaim all winnings paid out. The Company may report the Customer’s fraudulent or unlawful payment conduct to relevant bodies and agencies (including credit bureaus) and may commission recovery services. However, under no circumstances is the Company liable for use of a credit card not authorised by the Website, even if the card was stolen.
8.8 If it is detected a second time that a Customer has attempted to bet via duplicate accounts, collusion, fraud, criminal conduct, or network attacks, the Website may at any time deduct amounts owed by the Customer to the Company from the balance in the account.
8.9 Accounts on this Website are not bank accounts and therefore do not enjoy the safeguards, guarantees, or support offered by banks or insurance systems. Deposits do not earn interest.
8.9.1 The Customer acknowledges and agrees that exchange rates across all funding channels, including cryptocurrencies, may fluctuate. The Website is not responsible for exchange-rate fluctuations.
8.10 Subject to the conditions below, the Customer may withdraw funds at any time:
8.10.1 Confirm that the funds deposited into the account are not the subject of a full refund or cancellation.
8.10.2 Complete the Review described in Section 6 of the Terms.
8.11 When submitting a withdrawal request, note the following:
8.11.1 After completing all required personal information, verify a phone number. The Company will periodically check the validity of the phone number.
8.11.2 On the first withdrawal application or first credit-card deposit, identity verification is required to check for fraud. Please provide a document with the Customer's photograph, a copy of a utility bill, or a digital copy thereof. When submitting an image of the credit card used for deposit, mask the six digits in the middle and the CVV2 code, leaving only the first six and last four digits visible (e.g., 1231 23** **** 1231). For embossed cards, also mask the embossed numbers on the back.
8.11.3 After the withdrawal application, the withdrawal can proceed only if there are no active bonuses (free spins), active free bets in sports betting, or risk-free bets. Also confirm that no sports bets, free bets, or risk-free bets remain with undetermined outcomes. To complete a withdrawal, bonuses, free bets, and risk-free bets must be used up or cancelled.
8.11.4 Where a reward is obtained from a promotion, tournament, or event organised solely by the Website, a service fee must be paid from the reward. The amount varies with the content of the tournament/promotion/event; however, if a jackpot is hit in a slot game, no service fee will be charged, and the full jackpot may be withdrawn.
8.12 When a player submits a withdrawal request, the Company reserves the right to review the player's gaming records from the last 48 hours.
8.13 The withdrawal methods currently available on this Website are shown in the personal funds account. Players cannot withdraw to an account that has not previously been used to deposit. The deposit and withdrawal methods must be consistent. If the player wishes to use a withdrawal method other than the deposit method, the Company reserves the right to require the Customer to change the withdrawal method.

9. Betting and Gaming
9.1 All betting activity and content of the Customer are the Customer's own responsibility.
9.2 According to Company rules, we reserve the right to refuse part or all of any fund transactions requested by the Customer. Do not consider the transaction approved until the Company sends a confirmation. If no confirmation is received, contact online customer service.

10. Prohibited Behaviour
10.1 The Company reserves the right, at any time and for any reason, to review gaming history. On re-examination, the Company may in its discretion void bonuses, winnings, and rebates of any player found to have abused the game or engaged in loophole-exploiting play.
10.2 If a player who participates in a promotion engages in fraudulent conduct (including but not limited to the acts listed below) to obtain more money than the actual reward amount, we will immediately cancel the promotion and disqualify the player from all promotions.
10.2.1 Placing bets on both red and black simultaneously on roulette in order to inflate turnover, or attempting to bet on all numbers with the minimum stake.
10.3 The following betting behaviours violate the Terms:
10.3.1 Opposing bets (roulette: betting simultaneously on red and black; baccarat: betting simultaneously on the Tie and the Player).
10.3.2 When using this promotion, a player playing roulette must not bet on 25 or more numbers in a single bet, including combination bets and 25-number bets.
10.3.3 Using risk-reduction techniques, strategy software, or similar methods.
10.3.4 In collection-type games during a promotion, accumulating symbols speculatively to extract free-spin winnings.
10.4 Where bonus abuse or misuse is determined, the Company reserves the right to cancel the bonus and winnings and to close the account immediately.

11. Collusion, Cheating, Fraud, and Criminal Conduct
11.1 The following are considered breaches of the Terms:
11.1.1 Disclosing information to a third party.
11.1.2 Using bugs, exploiting loopholes, system manipulation, computer attacks, or other improper means (“cheating”), or using automated play (“bots”) to obtain improper benefit.
11.1.3 Stealing, copying, or using without authorisation credit or debit cards to deposit funds and obtain improper benefit.
11.1.4 Money laundering and all other unlawful conduct.
11.1.5 Attempting, directly or indirectly, to collude with other players while playing.
11.2 Abusing free promotions obtained from this Website is prohibited.
11.3 Where accomplices are identified, we shall have sufficient grounds to take appropriate measures. We shall not be liable for the Customer's losses.
11.4 If you suspect collusion, cheating, or other criminal conduct, notify this Website by email as soon as possible.
11.5 If a Customer engages in money laundering or other unlawful or improper conduct, access to customer service inquiries will be terminated immediately, and the account may be blocked. In this case, the Website has no obligation to return the funds in the player account. The Website reserves the right to report the Customer's unlawful, fraudulent, or improper conduct to relevant companies, online-service providers, banks, credit-card companies, electronic-transaction providers, and financial institutions.
11.6 If a Customer is found to use the Website's services and software with malicious intent, the Website may block the account and forfeit the funds within.
11.7 If a player distorts the way a game is played in order to meet withdrawal conditions, or attempts to abuse or maliciously exploit the game's structure, the Website may forfeit all bonuses and winnings, or close the account directly.

12. Other Prohibited Matters
12.1 Insulting or threatening other players or the Company with abusive language or imagery is prohibited.
12.2 Any act that impairs the functioning of the Website or interferes with its normal operation is prohibited (for example, the spread of viruses, worms, or logic bombs, or other similar acts). Sending duplicate or harassing messages to the Website is prohibited. Do not interfere with, forge, delete, or otherwise alter any information on the Website.
12.3 The Website is for personal entertainment only. Without express consent, do not copy or use the Website or any part of it in any form.
12.4 Do not attempt improper operations against the servers, connected servers, computers, or databases used by the Website. Do not launch denial-of-service or other attacks against the Website. Violations may be reported to relevant enforcement agencies, we may request that authorities disclose your identity, and your right to use the Website may be terminated in a timely fashion.
12.5 The Company is not liable for denial-of-service attacks, viruses, or other issues affecting the Customer's computer or data as a result of downloading content from the Website.
12.6 Intentionally losing in a game so that other players win, or selling or transferring accounts between players, is prohibited. If such behaviour is discovered, all bonuses and winnings obtained to date will be forfeited.
12.7 The Company has the right to verify or review players' betting records. If access-restricted sports betting is detected, or if a loophole is exploited during maintenance to obtain benefit, the account may be suspended temporarily or permanently. In such cases, the method of any payment shall be determined by the Website.

13. Contract Term and Termination
13.1 Until the Customer's account is frozen or terminated, all account activity remains the Customer's own responsibility.
13.2 The Company may charge fees incurred before the player closes the account. No refund will be made even if the account is terminated, frozen, or cancelled.
13.3 Upon termination of the account, both the Company and the Customer lose any granted obligations and rights under these Terms.
13.4 The Company reserves the right to block or suspend the Customer's account (including player name and password) at any time without prior notice.
13.4.1 The Company may, for any reason, stop general service or service to specific players.
13.4.2 Where the Customer's account is found to be in contact with a previously blocked account.
13.4.3 Where the Customer's account is found to be related or connected to a previously blocked account, the account will be blocked regardless of the actual relationship, registration information provided, or any other reason. On termination, any balance will be refunded within a reasonable period following your request, but if you have unpaid fees, the Company reserves the right to deduct that amount from the balance.
13.4.4 When the Customer attempts to manipulate information in the software code, or participates in a scheme.
13.4.5 Attempting or modifying the software in any form.
13.4.6 Playing games from a jurisdiction that treats casino gaming as illegal will be treated as a criminal act.
13.4.7 Where the Customer publishes harmful, offensive, discriminatory, obscene, or similar language.
13.5 If the Customer does not use the account for 6 months or more, the Website may block the account without prior notice. Where an account is closed for this reason, the effectiveness of the Terms also ends with the closure.
13.6 For accounts that have been inactive, we will send a notice of discontinuation to the contact email you have provided.

14. Changes to the Website
14.1 The Website reserves the right to change service content at the Company's discretion.

15. System Failures
15.1 If unexpected error messages, problems, or bugs appear in the software or hardware used to operate the Website, we will resolve them as soon as possible. The Website is not responsible for failures of the Customer's computer or network system while using the Website.

16. Errors and Malfunctions
16.1 The Company's error messages may cause the system to treat a bet as successful and require payment from the Customer (for example: problems caused by incomplete computer functions, unclear rules of betting, or winnings and Customer benefits paid due to a tutorial or automatic error). In many cases, the Company may incorrectly accept a bet or make a payment (for example, where game conditions are conveyed incorrectly due to obvious error messages or entered data), or errors may occur due to computer barriers or incorrect automatic entry of bonuses or refunds already paid to you. Under any circumstances, the Company reserves the right to refuse, restrict, or cancel a bet.
16.2 Errors arising from human operation, bugs, software error messages, or malfunctions - and any winnings obtained by the Customer due to defects (Errors) in the game itself or the software running the game - do not oblige the Company to pay such winnings. The Customer must notify the Company of the error, and where a payment is made because of an error message or mistake, the Customer must return the funds to the Company.
16.3 The Company (its employees and agents) shall not be liable for losses suffered by the Company's partners and suppliers, or by the Company or the Customer, arising from error messages, nor for the loss of winnings.
16.4 The Company shall not be liable for CEOs, operators, or employees of the parent, subsidiary, or affiliated companies obstructing information transmission or committing abuse on the Internet.

17. Exclusion of Liability
17.1 You are free to choose to use our services and agree to use this Website at your own opinion, policy, and risk.
17.2 In accordance with the Terms, the Company will provide proper technical skill and maintenance for the Website. The Company cannot provide binding representations or warranties concerning the services on the Website and therefore does not bear associated warranties (except as required by law).
17.3 For unforeseeable losses arising in the present stage in connection with your use of, or links related to, this Website - including loss of data, profits, business, opportunity, good faith, or reputation, and business interruption - the Company assumes no liability in contract, tort, negligence, or otherwise.

18. Breach of the Terms
18.1 The Customer is liable for costs and expenses (including legal fees) arising from claims and obligations resulting from breach of the Terms.
18.2 The Customer agrees to indemnify against obligations, claims, damages, losses, costs, and expenses (including legal fees) arising from the following:
18.2.1 The Customer breaches the Website's Terms.
18.2.2 The Customer infringes the rights of the law or a third party.
18.2.3 Use of another person's account, whether or not with consent.
18.3 In cases of serious breach, the Company enjoys all the following rights, whether or not the Customer has any privilege:
18.3.1 Where a breach is found, the Website will send a breach warning using the contact information provided at registration.
18.3.2 Close the account and terminate the right to bet or play games on the Website.
18.3.3 Close the Customer's account without prior notice.
18.3.4 Cancel bonuses, winnings, rebates, and withdrawals obtained as a result of the Customer's serious breach.
18.4 The Company reserves the right to suspend the account used by the Customer where a breach occurs.

19. Intellectual Property Rights
19.1 Copyright and ownership of the content on the Website belong to the Company or are used under lawful third-party licences held by the Company. The information on the Website may not be downloaded or printed for commercial or personal use.
19.2 Under no circumstances may any part of the intellectual property (copyrighted works, know-how, trademarks, etc.) of the Company or a third party be transferred to the Customer.
19.3 Copying or using the trademark names, logos, and other content produced by the Website is prohibited.
19.4 The Customer is responsible for all costs arising from any prohibited conduct or related conduct that causes the Customer loss or cost. If another user is found to be engaging in prohibited conduct, notify the Company immediately and assist with the investigation.

20. The Customer's Personal Information
20.1 The personal information provided by the Customer during use of the Website will be appropriately protected. The Company will use the Customer's personal information with care and manage it in accordance with the privacy policy.
20.2 By providing information to us, the Customer is deemed to have consented to our use of the personal information under the operating terms and conditions of this Website and under statutory and regulatory obligations.
20.3 In accordance with the Company's policy, the Customer's personal information will be provided to the relevant staff.

21. Use of Cookies on this Website
21.1 To provide certain functions on this Website, the Company uses “cookies”. Cookies are small data files placed on the Customer's computer when browsing the Website, so that on a subsequent visit the Website can identify the visitor. For information on managing and removing cookies, see www.aboutcookies.org. Please note that removing or disabling cookies for this Website may prevent some browsing features and functions from being used.

22. Complaints and Notices
22.1 For any dissatisfaction with the Website, please contact online customer service first.
22.2 If a problem occurs, you agree that the server logs shall be the final basis for any determination of your claim.
22.3 The Customer must understand that game results on the Website are randomly generated and must accept all game results. If the results on the Company's server differ from those on the Customer's computer, the Company's server results prevail. Even in relation to account balances, if there is a discrepancy between the Company's server and what is displayed on the Customer's screen, the Company's server data prevail. Balances displayed in a player account as a result of human error or mechanical defect will be forfeited.

23. Situations Beyond the Company's Control
23.1 The Company shall not be liable for losses or delays in performance caused by natural disasters, war, civil unrest, public-communication network anomalies or interruptions of service, labour disputes, DDoS (distributed denial-of-service) attacks, or other similar adverse effects (force majeure).
23.2 If the force majeure situation described in 23.1 continues, the Website undertakes to do everything possible to resolve the issue and to fulfil its commitments.

24. Waiver
24.1 The Company's failure to perform any obligation to the Customer, or failure to exercise any right or remedy, does not mean that we waive those rights, remedies, or the Customer's legally applicable rights.
24.2 A waiver by the Company of an unpaid obligation does not constitute waiver in the future. Waiver of any provision under the Company's Terms is effective only where communicated to the Customer, subject to the above.

25. Severability
25.1 Any provision of the Terms deemed invalid, unlawful, or unenforceable shall, to the extent permitted by law, remain effective and be removed from the Terms, conditions, and rules. In such cases, the invalid or unenforceable portion is also subject to that law and will be amended in accordance with the Company's original intent.

26. Governing Law
26.1 The Terms shall be interpreted and governed in accordance with the laws of Curaçao. Any dispute (including complaints, mutual disputes, or counterclaims) between the Customer and the Company arising from or in connection with the effectiveness, effects, interpretation, or performance of the Terms shall, in the interests of the Company, be subject to the jurisdiction of the courts of Curaçao.

27. Links
27.1 The Website may include links to third-party websites that are beyond the Terms and the Company's jurisdiction. The Company is not responsible for the content, actions, service delays, or advertising and sponsorship of such third-party websites or their owners. Links to other websites are provided for informational purposes. Please use such links at your own risk.

28. Data Protection Provisions
This section explains how the Company uses and protects the information it obtains.
28.1 Rights and Obligations
28.1.1 The Customer's Rights
The Website recognises the following rights in respect of the Customer's personal information:
• The right of access to the Customer's personal information (also known as a request to read personal information).
• The right to view specific personal information in a machine-readable format.
• The right to correct inaccurate personal information.
• The right to require that the Customer's personal information be processed and maintained. The Customer may object where they are unable to provide a clear legal basis.
• The right to have specific personal information deleted, including where processing or retention is not necessary as described above, where the Customer has objected as described below, or where the Customer's personal information has been unlawfully processed. This is described as the specific right to erasure of personal information.
• Where the legitimate interests of the Company are processed on the basis of the law, the Customer may object. However, where processing is on another lawful basis, or where the user's rights, interests, or freedoms cannot be corrected and there is an unavoidable reason to continue processing, the Company will continue to manage the Customer's personal information.
• The right to seek an explanation where decisions concerning the Customer are made by automated means.
• The right to complain to the user's national data-protection authority.
• The right to opt out of the Customer's account or communications settings that may involve direct marketing. The Customer also has the right to object to marketing-related activities.
Where the Customer's rights are unclear or the Customer has doubts about how personal information is processed, we recommend contacting the Customer's national data-protection authority.
If the Customer wishes to exercise their rights, please contact the Company using the means below. The Company will endeavour to address all such requests but does not guarantee to satisfy them. This means that in some cases the Customer's request must be refused, or some requests cannot be answered.
When exercising customer rights, the Customer must provide personal identification. The Customer may also be required to state the request clearly. The Company will endeavour to respond to all requests within one month of confirming the Customer's identity. If duplicate or improper requests are received, the Company reserves the right not to respond.
28.1.2 The Customer's Obligations
Whether at registration or at any time thereafter, the Customer must provide the Company with detailed, truthful, up-to-date, accurate, and complete information, as part of the deposit process and including occupation-related information.
The user account opened by the Company is for the user's personal use only. The user's use of the Service and the software carries the responsibility not to allow any third party (including blood relatives) to use the user's account or password; the user is responsible for any third-party use of the account. The user must not disclose the account name and password to any third party. If the user suspects that a third party is improperly using the account or has obtained the ID and password, the user must report directly to the Company; we will investigate. The user is obliged to cooperate with the Company's investigation.
28.1.3 The Company's Rights
To comply with our policies, or where necessary to protect the Company's interests, the Company may refuse or close any player's account.
The Company is entitled to change the Terms of Use without notice.
28.1.4 The Company's Obligations
The Customer's personal information may be shared with relevant parties for the reasons stated above, and such parties will be required to process the information in accordance with this privacy policy.
Personal information may also be provided to service agents operating on the Company's behalf. Where such processing is delegated, the Customer's personal information will be handled in accordance with the privacy policy, and the Company will enter into contracts with processors to safeguard the security of the Customer's personal information.
The Company will share the Customer's information publicly in the following circumstances:
• Where government agencies, regulatory authorities, or enforcement agencies require the information under applicable laws and regulations.
• Where necessary to defend the Company in legal and legal-procedural matters.
• Where the Company re-recruits a team or transfers operational rights of the Website to another company.
• Where the Company chooses to outsource operation of the Website to a third party, or engages in negotiations or implementation of corporate matters such as sale, purchase, merger, financing, investment, reorganisation, or the sale, transfer, or other procedures relating to part or all of the Company's business or assets.
28.2 Confirmation, Modification, and Deletion of Personal Information
To confirm, modify, or delete personal information stored on this Website, contact support@OP7.io. To verify identity, please send an identification document with a photograph attached.
The Company reserves the right to refuse excessive requests.
28.3 Cookies
Cookies are simple text files stored in the web browser that identify the Customer when browsing the Company's website. Cookies are important for the operation of the Website and can also be used to provide the Customer with a more personalised range of services.
Cookies collect certain personal information about you when you visit our website. Different cookies collect different information.
Cookie settings can be managed via the settings on your personal computer or phone. Note that without cookies you may not be able to use the Website. If you require the use of additional cookie functions on the Website, contact the Website.`,
  },
  privacy: {
    title: 'Privacy Policy',
    body: `OP7 (hereinafter referred to as "this Website") protects the personal information of all players who register an account on this Website (hereinafter referred to as "the Customer") in accordance with the data protection laws and regulations of the country in which it operates. The Company will manage and safeguard your information; please use the Website with confidence.

This Website places great importance on the Customer's personal information and will operate in accordance with the following principles, demonstrating our social responsibility.

Customer Personal Information Protection
We will under no circumstances disclose or provide to any third party the personal information (name, telephone number, email address, residential address, date of birth, etc.) supplied by the Customer when registering on this Website.

Domain-Authenticated SSL
To protect the Customer's personal information, this Website uses the SSL (Secure Socket Layer) security system. Personal data entered by the Customer - such as name, address and telephone number - together with win/loss results and deposit/withdrawal amounts, are automatically encrypted by SSL so that no external third party can obtain the Customer's personal information. The Company rigorously enforces protective procedures for confidential matters. Please use the Website with confidence.`,
  },
  responsible: {
    title: 'Responsible Gambling',
    body: `1. Play safe – play wise!
As thrilling, absorbing, and distracting as gambling can be, it can also be addictive.
We believe that everyone should be able to enjoy their gambling experience in a safe, controlled way.
Our aim is to help players take control of their gambling and foster healthier patterns of play. Below, you can find our essential toolkit to help identify and tackle problem gambling habits.

2. Understand the risk
Whether you're a new player or an experienced gambler, the risk of addiction developing should never be taken lightly. Although we all want to be winners, it's important to understand and prepare for the fact that losing is also part of the experience. Therefore, it's important not to play with money you cannot afford to lose.
Those who become addicted to gambling are at risk of losing more than just money; we want our players to be able to enjoy gambling as part of a balanced, fulfilling lifestyle. If you feel like your gambling is affecting your mental health, it's time to take action and seek support.
Through our responsible gambling toolkit, we can help you to implement gambling limits, examine your own playing behaviour, and reach out to support organisations if needed.

3. Helpful Tips
Don't know where to start? Check out our handy tips to help you keep track of your gambling.
3.1 Play for fun
You can't fix your financial problems through gambling, or making increasingly risky bets. Gambling is purely there for entertainment purposes, not to make a living. Only play when you're having fun.
3.2 Stick to your budget
Only play with money you can afford. If you gamble often, consider setting yourself a monthly budget that falls well within your means. This helps keep your gameplay sustainable!
3.3 Take a break
Gambling can easily consume a lot of your time, so take breaks and enjoy a change of scenery. Stretch your legs. Catch up with your loved ones. Try something new. You'll feel re-energised!
3.4 Know yourself
Regularly checking in on your gambling habits is a great way of helping you to avoid the pitfalls of unhealthy gambling. Think about whether gambling has changed the way you live your life; it might be time to take a step back.
3.5 Stay sober
Lowered inhibitions don't pair well with gambling. Keeping alcohol and drugs separate from your gambling experience is always a sensible decision!
3.6 Keep a diary
If you want to monitor your behaviour, a gambling diary can be a good place to start. You can make a note of the details every time you play, and even record your feelings.
3.7 Look at the big picture
How important is gambling in your life? Keep your priorities in mind and ask yourself whether gambling is taking any time or attention away from them.

4. Set your Limits
Our site comes fully equipped with the tools to help you set gambling limits that suit your needs, budgets, and boundaries. Take the opportunity to personalise your playing experience and nip unhealthy gambling behaviour in the bud.
Check your account to see what limits are available for you.
4.1 Self-Exclusion
If you are experiencing problems controlling your gambling habits, Self-Exclusion can be an excellent option. You may choose to block access to your account for a selected period of time, or even close it indefinitely.
Accounts that have been self-excluded indefinitely may or may not be reopened at our discretion.
4.2 Account Closure
We would be very sorry to hear that you are unsatisfied with your experience. In this event, when you choose to close your account, we ask that you select a reason for your decision from the drop-down menu in order to help us improve our services.

5. Underage Gambling
It can be harder for young people to make safe, informed choices when it comes to difficult topics such as gambling. Research has shown us that gamblers who start playing as minors face a significantly increased risk of developing an addiction.
Protecting children from underage gambling is not just a legal obligation – it's the right thing to do.
5.1 How can we protect our kids?
We believe this is a joint effort, and we're ready to do our part. We can recommend several tips and resources to keep minors safe from underage gambling.
Our agents are under strict instructions to investigate and suspend any account suspected of underage activity. If we find an account to be suspicious, we will request that a player verify their identity and age.
We can also recommend a number of tips for players who do not wish to expose their children to gambling:
Do not use autofill to log in to your gambling accounts
Make sure to log out after each session
Keep your credit card details private
Use parental control software to restrict gambling sites
Educate your children about the risks involved

5.2 Who can help?
If you are concerned about an underaged family member or friend, there are resources at hand and trained professionals you can deal with. Remember that aside from financial and behavioural risk, underage gambling may come with legal ramifications.
We recommend using applications from one of the following third-party companies to help restrict your child's access to potentially harmful sites:
www.fosi.org | www.netnanny.com

6. Frequently Asked Questions
We want to give you the opportunity to set your own gambling limits, budgets and boundaries. We provide you with tools to prevent unhealthy gambling behaviour and enable you to play responsibly.
6.1 What are limits and how can they help me?
Gambling limits are a useful tool to help you control your gambling. We offer limits, self-exclusion and account closure. These options can help gamblers to stick to healthy playing habits and can also help problem gamblers to step away from playing should they feel that it's time for a break.
6.2 I think I may have a gambling problem-what can I do?
Though it can be difficult, it's always good to examine your own behaviour. Should you wish to take it a step further, we are able to recommend several organisations which can offer help to anyone suffering from gambling addiction. Our trained customer service team is also standing by to offer support and recommendations.
6.3 What are some signs of problem gambling?
Like many addictions, problem gambling can present in a number of different ways. In broad strokes, it can be defined as the uncontrollable urge to gamble, which often leads to severe personal and social consequences.
Gambling addicts may become irritable when they are unable to gamble or spend large amounts of time thinking about their next bet. They may also lie to conceal the extent of their gambling habits and experience feelings of shame or guilt over their excessive playing.
Many problem gamblers experience feelings of denial regarding their condition, often making it difficult to seek support. If you feel that your gambling has grown beyond your control, we are always willing to hear what you have to say.
6.4 How can I help someone with a gambling addiction?
If you suspect that one of your loved ones is struggling with gambling addiction, we recommend that you get in touch with a professional support organisation. We can recommend a number of resources in the Help and Support section below.

7. Help & Support Organisations
If you feel like you may have a problem controlling your gambling, reaching out for support is a step in the right direction. We can recommend a number of professional organisations dedicated to offering guidance to gamblers and their loved ones.
Gordon Moody
Gamblers Anonymous

8. Contact us
Not sure where to start? Our customer care agents are standing by to help you. You may find the live-chat icon on the screen to contact us.`,
  },
};
