/**
 * Seed script for RAG legal documents database
 * 
 * IMPORTANT: Make sure your Next.js dev server is running first!
 * Run: npm run dev
 * Then in another terminal: node scripts/seed-legal-documents.mjs
 */

const LEGAL_DOCUMENTS = [
  // === CONSUMER PROTECTION ===
  {
    act_name: 'Consumer Protection Act, 2019',
    section_number: '2(7)',
    title: 'Definition of Consumer',
    content: `A "consumer" means any person who—
(i) buys any goods for a consideration which has been paid or promised or partly paid and partly promised, or under any system of deferred payment and includes any user of such goods other than the person who buys such goods for consideration paid or promised or partly paid or partly promised, or under any system of deferred payment, when such use is made with the approval of such person, but does not include a person who obtains such goods for resale or for any commercial purpose; or
(ii) hires or avails of any service for a consideration which has been paid or promised or partly paid and partly promised, or under any system of deferred payment and includes any beneficiary of such service other than the person who hires or avails of the services for consideration paid or promised, or partly paid and partly promised, or under any system of deferred payment, when such services are availed of with the approval of the first mentioned person, but does not include a person who avails of such service for any commercial purpose.`,
    plain_language_summary: 'A consumer is anyone who buys goods or services for personal use (not for resale or business). This includes users of the product/service if the buyer gave permission. You have legal rights as a consumer if you paid money or promised to pay.',
    keywords: ['consumer', 'buyer', 'goods', 'services', 'purchase', 'legal rights', 'consumer protection'],
    categories: ['consumer-protection', 'civil'],
    jurisdiction: 'Central',
    source_url: 'https://consumeraffairs.nic.in/sites/default/files/CP%20Act%202019.pdf',
  },
  {
    act_name: 'Consumer Protection Act, 2019',
    section_number: '2(9)',
    title: 'Definition of Defect',
    content: `"defect" means any fault, imperfection or shortcoming in the quality, quantity, potency, purity or standard which is required to be maintained by or under any law for the time being in force or under any contract, express or implied, or as is claimed by the trader in any manner whatsoever in relation to any goods.`,
    plain_language_summary: 'A defect is any problem with a product - wrong quality, quantity, or standard. This includes issues that break the law, violate a contract, or don\'t match what the seller promised.',
    keywords: ['defect', 'faulty product', 'quality issues', 'substandard goods', 'product complaint'],
    categories: ['consumer-protection', 'civil'],
    jurisdiction: 'Central',
    source_url: 'https://consumeraffairs.nic.in/sites/default/files/CP%20Act%202019.pdf',
  },
  {
    act_name: 'Consumer Protection Act, 2019',
    section_number: '2(47)',
    title: 'Definition of Unfair Trade Practice',
    content: `"unfair trade practice" means a trade practice which, for the purpose of promoting the sale, use or supply of any goods or for the provision of any service, adopts any unfair method or unfair or deceptive practice including any of the following practices, namely:—
(i) making any statement, whether orally or in writing or by visible representation including by means of electronic record, which—
(A) falsely represents that the goods are of a particular standard, quality, quantity, grade, composition, style or model;
(B) falsely represents that the services are of a particular standard, quality or grade;
(C) falsely represents any re-built, second-hand, renovated, reconditioned or old goods as new goods;
(D) represents that the goods or services have sponsorship, approval, performance, characteristics, accessories, uses or benefits which such goods or services do not have;`,
    plain_language_summary: 'Unfair trade practice includes false advertising, misleading claims about product quality, selling used items as new, or lying about product features/benefits. If a seller deceives you to make a sale, it\'s an unfair trade practice.',
    keywords: ['unfair trade', 'false advertising', 'misleading', 'deceptive practice', 'fake claims'],
    categories: ['consumer-protection', 'civil'],
    jurisdiction: 'Central',
    source_url: 'https://consumeraffairs.nic.in/sites/default/files/CP%20Act%202019.pdf',
  },

  // === CRIMINAL LAW - THEFT & PROPERTY ===
  {
    act_name: 'Bharatiya Nyaya Sanhita, 2023',
    section_number: '303',
    title: 'Theft',
    content: `Whoever intends to take dishonestly any movable property out of the possession of any person without that person's consent, moves that property in order to such taking, is said to commit theft.
Explanation 1.—A thing so long as it is attached to the earth, not being movable property, is not the subject of theft; but it becomes capable of being the subject of theft as soon as it is severed from the earth.
Explanation 2.—A moving effected by the same act which affects the severance may be a theft.
Explanation 3.—A person is said to cause a thing to move by removing an obstacle which prevented it from moving or by separating it from any other thing, as well as by actually moving it.`,
    plain_language_summary: 'Theft is taking someone else\'s movable property without their permission with dishonest intent. The moment you start moving the property to take it, theft occurs. Property must be movable (not attached to earth like buildings/trees). Removing obstacles to take something also counts as theft.',
    keywords: ['theft', 'stealing', 'property crime', 'dishonest taking', 'movable property', 'stolen goods'],
    categories: ['criminal', 'property-crime'],
    jurisdiction: 'Central',
    source_url: 'https://www.indiacode.nic.in/bitstream/123456789/2263/1/BNS_2023.pdf',
  },
  {
    act_name: 'Bharatiya Nyaya Sanhita, 2023',
    section_number: '304',
    title: 'Punishment for Theft',
    content: `Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.`,
    plain_language_summary: 'If convicted of theft, you can be imprisoned for up to 3 years, or fined, or both. The court decides the exact punishment based on the case.',
    keywords: ['theft punishment', 'theft penalty', 'imprisonment', 'fine for theft'],
    categories: ['criminal', 'property-crime'],
    jurisdiction: 'Central',
    source_url: 'https://www.indiacode.nic.in/bitstream/123456789/2263/1/BNS_2023.pdf',
  },
  {
    act_name: 'Bharatiya Nyaya Sanhita, 2023',
    section_number: '329',
    title: 'House-Breaking',
    content: `A person is said to commit "house-breaking" who commits house-trespass if he effects his entrance into the house or any part of it in any of the six ways hereinafter described; or if, being in the house or any part of it for the purpose of committing an offence, or having committed an offence therein, he quits the house or any part of it in any of such six ways, that is to say:—
(a) if he enters or quits through a passage made by himself, or by any abettor of the house-trespass, in order to the committing of the house-trespass;
(b) if he enters or quits through any passage not intended by any person, other than himself or an abettor of the offence, for human entrance; or through any passage to which he has obtained access by scaling or climbing over any wall or building;
(c) if he enters or quits through any passage which he or any abettor of the house-trespass has opened, in order to the committing of the house-trespass by any means by which that passage was not intended by the occupier of the house to be opened;`,
    plain_language_summary: 'House-breaking is entering or leaving a house illegally through unusual ways - like breaking a wall, climbing over walls, entering through windows/passages not meant for entry, or forcing open locked doors. If someone enters your property this way to commit a crime, it\'s house-breaking.',
    keywords: ['house breaking', 'burglary', 'illegal entry', 'home invasion', 'breaking and entering', 'trespass'],
    categories: ['criminal', 'property-crime'],
    jurisdiction: 'Central',
    source_url: 'https://www.indiacode.nic.in/bitstream/123456789/2263/1/BNS_2023.pdf',
  },

  // === CRIMINAL LAW - ASSAULT & HARASSMENT ===
  {
    act_name: 'Bharatiya Nyaya Sanhita, 2023',
    section_number: '351',
    title: 'Criminal Intimidation',
    content: `Whoever threatens another with any injury to his person, reputation or property, or to the person or reputation of any one in whom that person is interested, with intent to cause alarm to that person, or to cause that person to do any act which he is not legally bound to do, or to omit to do any act which that person is legally entitled to do, as the means of avoiding the execution of such threat, commits criminal intimidation.`,
    plain_language_summary: 'Criminal intimidation is threatening someone to harm them, their reputation, or property (or threatening their loved ones) to scare them or force them to do/not do something. Even if the threat isn\'t carried out, making the threat itself is a crime.',
    keywords: ['intimidation', 'threats', 'threatening behavior', 'criminal threat', 'harassment'],
    categories: ['criminal', 'violence', 'harassment'],
    jurisdiction: 'Central',
    source_url: 'https://www.indiacode.nic.in/bitstream/123456789/2263/1/BNS_2023.pdf',
  },
  {
    act_name: 'Bharatiya Nyaya Sanhita, 2023',
    section_number: '78',
    title: 'Sexual Harassment',
    content: `(1) A man committing any of the following acts—
(i) physical contact and advances involving unwelcome and explicit sexual overtures; or
(ii) a demand or request for sexual favours; or
(iii) showing pornography against the will of a woman; or
(iv) making sexually coloured remarks,
shall be guilty of the offence of sexual harassment.
(2) Any man who commits the offence specified in sub-section (1) shall be punished with rigorous imprisonment for a term which may extend to three years, or with fine, or with both.`,
    plain_language_summary: 'Sexual harassment includes: unwanted physical contact or sexual advances, asking for sexual favors, showing pornography without consent, or making sexual comments to a woman. If convicted, punishment is up to 3 years imprisonment, fine, or both.',
    keywords: ['sexual harassment', 'workplace harassment', 'unwanted advances', 'sexual misconduct', 'eve teasing'],
    categories: ['criminal', 'gender-based-violence', 'harassment', 'women-rights'],
    jurisdiction: 'Central',
    source_url: 'https://www.indiacode.nic.in/bitstream/123456789/2263/1/BNS_2023.pdf',
  },

  // === LABOUR RIGHTS ===
  {
    act_name: 'Minimum Wages Act, 1948',
    section_number: '3',
    title: 'Fixing of Minimum Wages',
    content: `(1) The appropriate Government shall—
(a) fix the minimum rates of wages payable to employees employed in an employment specified in Part I or Part II of the Schedule and in an employment added to either Part by notification under section 27;
(b) review at such intervals as it may think fit, such intervals not exceeding five years, the minimum rates of wages so fixed and revise the minimum rates, if necessary.
(2) In fixing or revising minimum rates of wages under this section, different minimum rates of wages may be fixed for—
(a) different scheduled employments;
(b) different classes of work in the same scheduled employment;
(c) adults, adolescents, children and apprentices;
(d) different localities.`,
    plain_language_summary: 'The government must set minimum wages for certain jobs and review them at least every 5 years. Different minimum wages can be set based on: type of work, skill level, age (adults vs children), and location. Employers must pay at least the minimum wage for your job category.',
    keywords: ['minimum wage', 'salary rights', 'wage payment', 'labour rights', 'fair wages', 'worker rights'],
    categories: ['labour', 'employment', 'civil'],
    jurisdiction: 'Central',
    source_url: 'https://labour.gov.in/sites/default/files/TheMinimumWagesAct1948.pdf',
  },
  {
    act_name: 'Payment of Wages Act, 1936',
    section_number: '5',
    title: 'Responsibility for Payment of Wages',
    content: `(1) Every employer shall be responsible for the payment to persons employed by him of all wages required to be paid under this Act.
(2) Where a contractor, undertakes to produce a given result for a principal by employing workmen, or to do any work for the principal, the contractor shall be responsible for payment of wages to such workmen.
(3) If the contractor fails to pay wages, the person who employed such contractor (principal) shall be liable to pay wages along with the contractor. Principal and contractor will be jointly and severally responsible.`,
    plain_language_summary: 'Your employer MUST pay your wages. If you work for a contractor, the contractor must pay you. If the contractor doesn\'t pay, the main company (principal) that hired the contractor is also responsible to pay you. Both can be held accountable.',
    keywords: ['wage payment', 'salary not paid', 'employer responsibility', 'contractor payment', 'wage dispute'],
    categories: ['labour', 'employment', 'civil'],
    jurisdiction: 'Central',
    source_url: 'https://labour.gov.in/sites/default/files/ThePaymentofWagesAct1936.pdf',
  },
  {
    act_name: 'Payment of Wages Act, 1936',
    section_number: '7',
    title: 'Time of Payment of Wages',
    content: `(1) Every person responsible for the payment of wages under section 3 shall, in the case of persons employed upon or in—
(a) any railway, factory or industrial or other establishment upon or in which less than one thousand persons are employed, before the expiry of the seventh day;
(b) any other railway, factory or industrial or other establishment, before the expiry of the tenth day,
after the last day of the wage-period in respect of which the wages are payable.
(2) Where the employment of any person is terminated by or on behalf of the employer, the wages earned by him shall be paid before the expiry of the second working day from the day on which his employment is terminated.`,
    plain_language_summary: 'Your salary must be paid within 7 days (for small employers under 1000 workers) or 10 days (for larger employers) after the month ends. If you are fired/leave the job, final settlement must be paid within 2 working days of termination. Late payment is illegal.',
    keywords: ['salary delay', 'wage payment time', 'final settlement', 'termination payment', 'salary date'],
    categories: ['labour', 'employment', 'civil'],
    jurisdiction: 'Central',
    source_url: 'https://labour.gov.in/sites/default/files/ThePaymentofWagesAct1936.pdf',
  },

  // === RIGHT TO INFORMATION ===
  {
    act_name: 'Right to Information Act, 2005',
    section_number: '3',
    title: 'Right to Information',
    content: `Subject to the provisions of this Act, all citizens shall have the right to information.`,
    plain_language_summary: 'Every Indian citizen has the legal right to get information from government offices and public authorities. This is a fundamental right under RTI Act.',
    keywords: ['RTI', 'right to information', 'government information', 'public records', 'transparency'],
    categories: ['civil', 'transparency', 'government-services'],
    jurisdiction: 'Central',
    source_url: 'https://rti.gov.in/rti-act.pdf',
  },
  {
    act_name: 'Right to Information Act, 2005',
    section_number: '6',
    title: 'Request for Information',
    content: `(1) A person, who desires to obtain any information under this Act, shall make a request in writing or through electronic means in English or Hindi or in the official language of the area in which the application is being made, to—
(a) the Central Public Information Officer or State Public Information Officer, as the case may be, of the concerned public authority;
(b) the Central Assistant Public Information Officer or State Assistant Public Information Officer, as the case may be,
specifying the particulars of the information sought by him or her:
Provided that where such request cannot be made in writing, the Central Public Information Officer or State Public Information Officer, as the case may be, shall render all reasonable assistance to the person making the request orally to reduce the same in writing.
(3) Where an application is made to a public authority requesting for an information,—
(i) which is held by another public authority; or
(ii) the subject matter of which is more closely connected with the functions of another public authority,
the public authority, to which such application is made, shall transfer the application or such part of it as may be appropriate to that other public authority and inform the applicant immediately about such transfer.`,
    plain_language_summary: 'To get information under RTI: Write an application in English/Hindi/local language to the Public Information Officer (PIO) of the government office. Clearly mention what information you want. Fee is usually ₹10. If you applied to the wrong office, they must forward your application to the correct office and inform you.',
    keywords: ['RTI application', 'how to file RTI', 'information request', 'PIO', 'RTI process'],
    categories: ['civil', 'transparency', 'government-services'],
    jurisdiction: 'Central',
    source_url: 'https://rti.gov.in/rti-act.pdf',
  },
  {
    act_name: 'Right to Information Act, 2005',
    section_number: '7',
    title: 'Disposal of RTI Request',
    content: `(1) Subject to the proviso to sub-section (2) of section 5 or the proviso to sub-section (3) of section 6, the Central Public Information Officer or State Public Information Officer, as the case may be, on receipt of a request under section 6 shall, as expeditiously as possible, and in any case within thirty days of the receipt of the request, either provide the information on payment of such fee as may be prescribed or reject the request for any of the reasons specified in sections 8 and 9:
Provided that where the information sought for concerns the life or liberty of a person, the same shall be provided within forty-eight hours of the receipt of the request.`,
    plain_language_summary: 'The government office must reply to your RTI request within 30 days. If the information relates to someone\'s life/liberty (emergency), reply must come within 48 hours. They can either give you the information or reject with valid reasons. Silence after 30 days is considered rejection - you can appeal.',
    keywords: ['RTI timeline', 'RTI reply', '30 days', 'RTI response time', 'information delay'],
    categories: ['civil', 'transparency', 'government-services'],
    jurisdiction: 'Central',
    source_url: 'https://rti.gov.in/rti-act.pdf',
  },

  // === ENVIRONMENTAL RIGHTS ===
  {
    act_name: 'Air (Prevention and Control of Pollution) Act, 1981',
    section_number: '21',
    title: 'Prohibition of Air Pollution',
    content: `(1) Subject to the provisions of this section, no person shall, without the previous consent of the State Board, establish or operate any industrial plant in an air pollution control area.
(2) An application for consent for the establishment of an industrial plant shall be made to the State Board in the prescribed manner.`,
    plain_language_summary: 'Industries cannot start operations in pollution control areas without getting permission from the State Pollution Control Board. If an industry is causing air pollution, they need prior approval to operate legally.',
    keywords: ['air pollution', 'industrial pollution', 'pollution control', 'environmental rights', 'pollution board'],
    categories: ['environmental', 'civil', 'public-health'],
    jurisdiction: 'Central',
    source_url: 'https://moef.gov.in/wp-content/uploads/2018/05/Air-Act-1981.pdf',
  },
  {
    act_name: 'Environment Protection Act, 1986',
    section_number: '15',
    title: 'Penalty for Contravention of Environmental Laws',
    content: `Whoever fails to comply with or contravenes any of the provisions of this Act, or the rules made or orders or directions issued thereunder, shall, in respect of each such failure or contravention, be punishable with imprisonment for a term which may extend to five years with fine which may extend to one lakh rupees, or with both, and in case the failure or contravention continues, with additional fine which may extend to five thousand rupees for every day during which such failure or contravention continues after conviction for the first such failure or contravention.`,
    plain_language_summary: 'Violating environmental protection laws can lead to imprisonment up to 5 years and fine up to ₹1 lakh. If violation continues after conviction, an additional fine of ₹5000 per day can be imposed. This applies to pollution, illegal dumping, or ignoring environmental protection orders.',
    keywords: ['environment violation', 'pollution penalty', 'environmental crime', 'pollution fine'],
    categories: ['environmental', 'civil', 'public-health'],
    jurisdiction: 'Central',
    source_url: 'https://moef.gov.in/wp-content/uploads/2018/05/EPA-1986.pdf',
  },

  // === TRAFFIC & MOTOR VEHICLES ===
  {
    act_name: 'Motor Vehicles Act, 1988',
    section_number: '3',
    title: 'Necessity for Driving License',
    content: `No person shall drive a motor vehicle in any public place unless he holds an effective driving licence issued to him authorising him to drive the vehicle; and no person shall so drive a transport vehicle [other than a motor cab or motor cycle hired for his own use or rented under any scheme made under sub-section (2) of section 75] unless his driving licence specifically entitles him so to do.`,
    plain_language_summary: 'You must have a valid driving license to drive any vehicle on public roads. For commercial vehicles (buses, trucks), you need a special commercial driving license. Driving without a license is illegal and punishable.',
    keywords: ['driving license', 'license requirement', 'vehicle license', 'DL', 'driving without license'],
    categories: ['traffic', 'civil'],
    jurisdiction: 'Central',
    source_url: 'https://morth.nic.in/sites/default/files/MVA_1988.pdf',
  },
  {
    act_name: 'Motor Vehicles Act, 1988',
    section_number: '165',
    title: 'Compensation for Hit and Run Cases',
    content: `(1) The Central Government shall constitute a scheme known as the Hit and Run Motor Accident Scheme for the purpose of providing compensation to the legal representatives of a person who died or a person who sustained grievous hurt in a hit and run motor accident.`,
    plain_language_summary: 'If you or your family member is injured/killed in a hit-and-run accident (driver fled), you can claim compensation under the Hit and Run Scheme even if the driver is unknown. This is a government scheme to help victims when the guilty party cannot be found.',
    keywords: ['hit and run', 'accident compensation', 'road accident', 'motor accident claim', 'traffic accident'],
    categories: ['traffic', 'civil', 'insurance'],
    jurisdiction: 'Central',
    source_url: 'https://morth.nic.in/sites/default/files/MVA_1988.pdf',
  },

  // === WOMEN'S RIGHTS ===
  {
    act_name: 'Protection of Women from Domestic Violence Act, 2005',
    section_number: '3',
    title: 'Definition of Domestic Violence',
    content: `For the purposes of this Act, any act, omission or commission or conduct of the respondent shall constitute domestic violence in case it—
(a) harms or injures or endangers the health, safety, life, limb or well-being, whether mental or physical, of the aggrieved person or tends to do so and includes causing physical abuse, sexual abuse, verbal and emotional abuse and economic abuse; or
(b) harasses, harms, injures or endangers the aggrieved person with a view to coerce her or any other person related to her to meet any unlawful demand for any dowry or other property or valuable security; or
(c) has the effect of threatening the aggrieved person or any person related to her by any conduct mentioned in clause (a) or clause (b); or
(d) otherwise injures or causes harm, whether physical or mental, to the aggrieved person.`,
    plain_language_summary: 'Domestic violence includes: physical abuse, sexual abuse, verbal/emotional abuse, economic abuse (denying money), and dowry harassment. It applies to violence by husband, in-laws, or live-in partner. Even threats and mental torture count as domestic violence. Women have legal protection against all these forms of abuse.',
    keywords: ['domestic violence', 'dowry harassment', 'marital abuse', 'women rights', 'protection order', 'DV Act'],
    categories: ['criminal', 'gender-based-violence', 'women-rights', 'family-law'],
    jurisdiction: 'Central',
    source_url: 'https://wcd.nic.in/sites/default/files/DV%20Act.pdf',
  },
  {
    act_name: 'Protection of Women from Domestic Violence Act, 2005',
    section_number: '12',
    title: 'Application to Magistrate',
    content: `(1) An aggrieved person or a Protection Officer or any other person on behalf of the aggrieved person may present an application to the Magistrate seeking one or more reliefs under this Act.`,
    plain_language_summary: 'If you face domestic violence, you (or someone on your behalf) can file a complaint with the Magistrate. You can seek protection orders, residence rights, monetary relief, custody of children, and compensation. You don\'t need a lawyer - Protection Officers can help you file.',
    keywords: ['domestic violence complaint', 'magistrate application', 'protection order', 'DV case filing', 'how to file DV case'],
    categories: ['criminal', 'gender-based-violence', 'women-rights', 'family-law'],
    jurisdiction: 'Central',
    source_url: 'https://wcd.nic.in/sites/default/files/DV%20Act.pdf',
  },

  // === CHILD RIGHTS ===
  {
    act_name: 'Right of Children to Free and Compulsory Education Act, 2009',
    section_number: '3',
    title: 'Right to Free and Compulsory Education',
    content: `(1) Every child of the age of six to fourteen years shall have a right to free and compulsory education in a neighbourhood school till completion of elementary education.
(2) For the purposes of sub-section (1), no child shall be liable to pay any kind of fee or charges or expenses which may prevent him or her from pursuing and completing elementary education.`,
    plain_language_summary: 'Every child aged 6-14 years has the right to FREE education until 8th standard (elementary education). Schools cannot charge any fee that prevents a child from studying. This is a fundamental right - no child can be denied education due to inability to pay.',
    keywords: ['right to education', 'RTE', 'free education', 'child education rights', 'school admission', 'elementary education'],
    categories: ['education', 'civil', 'child-rights'],
    jurisdiction: 'Central',
    source_url: 'https://www.education.gov.in/sites/upload_files/mhrd/files/upload_document/rte.pdf',
  },
  {
    act_name: 'Protection of Children from Sexual Offences Act, 2012',
    section_number: '19',
    title: 'Mandatory Reporting of Sexual Offences',
    content: `(1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973, any person (including the child), who has apprehension that an offence under this Act is likely to be committed or has knowledge that such an offence has been committed, shall provide such information to,—
(a) the Special Juvenile Police Unit; or
(b) the local police.
(6) Any person, who fails to report the commission of an offence under sub-section (1) or sub-section (2) or who fails to record such offence under sub-section (3) shall be punished with imprisonment of either description which may extend to six months or with fine or with both.`,
    plain_language_summary: 'If you know or suspect that a child is being sexually abused, YOU MUST report it to police or Child Welfare Committee. Not reporting is a crime - you can be imprisoned for 6 months or fined. This applies to everyone - teachers, doctors, parents, neighbors. Protecting children is everyone\'s legal duty.',
    keywords: ['child abuse', 'POCSO', 'child sexual abuse', 'mandatory reporting', 'child protection', 'sexual offence against child'],
    categories: ['criminal', 'child-rights', 'gender-based-violence'],
    jurisdiction: 'Central',
    source_url: 'https://wcd.nic.in/sites/default/files/POCSO%20Act%2C%202012.pdf',
  },

  // === DISABILITY RIGHTS ===
  {
    act_name: 'Rights of Persons with Disabilities Act, 2016',
    section_number: '20',
    title: 'Non-discrimination in Employment',
    content: `(1) No establishment shall discriminate against any person with disability in any matter relating to employment:
Provided that the appropriate Government may, having regard to the type of work carried on in any establishment, by notification and subject to such conditions, if any, as may be specified in such notification, exempt any establishment from the provisions of this section.
(2) Every establishment shall provide reasonable accommodation to persons with disabilities which shall not cause undue or disproportionate burden on the employer.`,
    plain_language_summary: 'Employers cannot discriminate against persons with disabilities in hiring, promotion, or job assignments. Workplaces must provide reasonable accommodations (like ramps, accessible toilets, assistive technology) unless it causes major financial burden. Disability cannot be a reason to deny employment if the person can do the job with reasonable adjustments.',
    keywords: ['disability rights', 'employment discrimination', 'PWD rights', 'reasonable accommodation', 'disability discrimination', 'RPWD Act'],
    categories: ['disability-rights', 'labour', 'employment', 'civil'],
    jurisdiction: 'Central',
    source_url: 'https://www.disabilityaffairs.gov.in/upload/uploadfiles/files/RPWD%20ACT%202016.pdf',
  },

  // === POLICE & ARREST RIGHTS ===
  {
    act_name: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
    section_number: '35',
    title: 'Rights of Arrested Person',
    content: `(1) Every police officer or other person arresting any person without warrant shall forthwith communicate to him full particulars of the offence for which he is arrested or other grounds for such arrest.
(3) The person arrested shall, save in exceptional circumstances, have a right to be informed about bail provisions. He shall be provided legal aid at the cost of the State, if he is not able to afford a legal counsel.
(4) The person arrested shall be informed that he has a right to have a relative or a friend informed about his arrest at the time of his arrest.`,
    plain_language_summary: 'If arrested, you have the right to: (1) Know the reason for arrest and charges against you, (2) Be informed about bail provisions, (3) Get free legal aid if you cannot afford a lawyer, (4) Have a family member or friend informed about your arrest immediately. Police MUST inform you of these rights.',
    keywords: ['arrest rights', 'police custody', 'arrested', 'legal rights when arrested', 'bail rights', 'right to lawyer'],
    categories: ['criminal', 'police', 'civil'],
    jurisdiction: 'Central',
    source_url: 'https://www.indiacode.nic.in/bitstream/123456789/2263/1/BNSS_2023.pdf',
  },
  {
    act_name: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
    section_number: '36',
    title: 'Medical Examination after Arrest',
    content: `(1) When any person is arrested, he shall be examined by a medical officer in the service of Central or State Government, and in case the medical officer is not available, by a registered medical practitioner soon after the arrest is made:
Provided that where the arrested person is a female, the examination of the body shall be made only by or under the supervision of a female medical officer, and in case the female medical officer is not available, by a female registered medical practitioner.`,
    plain_language_summary: 'After arrest, you must be medically examined by a government doctor or registered doctor to document any injuries on your body. For women, examination must be done by a female doctor. This protects you from false allegations and also documents if police used force during arrest. Get a copy of this medical report.',
    keywords: ['medical examination', 'arrest medical', 'police custody medical', 'medical report arrest', 'custody injuries'],
    categories: ['criminal', 'police', 'civil'],
    jurisdiction: 'Central',
    source_url: 'https://www.indiacode.nic.in/bitstream/123456789/2263/1/BNSS_2023.pdf',
  },
];

async function seedDocuments() {
  console.log('🌱 Starting legal documents seeding...\n');
  console.log('⚠️  Make sure your Next.js dev server is running (npm run dev)\n');

  const API_BASE = process.env.API_URL || 'http://localhost:3000';
  let successCount = 0;
  let failCount = 0;

  for (const doc of LEGAL_DOCUMENTS) {
    try {
      console.log(`📄 Adding: ${doc.act_name} - ${doc.section_number || 'General'}`);
      
      const response = await fetch(`${API_BASE}/api/rag/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`   ❌ Failed: ${error}`);
        failCount++;
      } else {
        const result = await response.json();
        console.log(`   ✅ Success (ID: ${result.document.id.substring(0, 8)}...)`);
        successCount++;
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📝 Total: ${LEGAL_DOCUMENTS.length}`);

  if (successCount > 0) {
    // Generate embeddings for all documents
    console.log('\n🔄 Generating embeddings for new documents...');
    try {
      const embedResponse = await fetch(`${API_BASE}/api/rag/embed`, {
        method: 'PUT',
      });

      if (embedResponse.ok) {
        const embedResult = await embedResponse.json();
        console.log(`✅ Embeddings generated: ${embedResult.processed} documents`);
      } else {
        console.error('❌ Failed to generate embeddings:', await embedResponse.text());
      }
    } catch (error) {
      console.error(`❌ Embedding generation error: ${error.message}`);
    }
  }

  console.log('\n✨ Seeding complete!');
}

// Execute
seedDocuments().catch(console.error);
