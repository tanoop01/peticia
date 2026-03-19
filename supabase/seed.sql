
INSERT INTO legal_documents (
  act_name, 
  section_number, 
  chapter, 
  title, 
  content, 
  plain_language_summary, 
  keywords, 
  categories, 
  jurisdiction, 
  source_url, 
  effective_from
) VALUES 
-- Constitution of India - Fundamental Rights
(
  'Constitution of India, 1950',
  '14',
  'III - Fundamental Rights',
  'Equality before law',
  'The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.',
  'Every person in India has the right to equal treatment under the law. No discrimination is allowed.',
  ARRAY['equality', 'fundamental rights', 'discrimination', 'constitutional rights'],
  ARRAY['constitutional', 'rights'],
  'Central',
  'https://legislative.gov.in/constitution-of-india',
  '1950-01-26'
),
(
  'Constitution of India, 1950',
  '19',
  'III - Fundamental Rights',
  'Protection of certain rights regarding freedom of speech, etc.',
  'All citizens shall have the right to freedom of speech and expression; to assemble peaceably and without arms; to form associations or unions; to move freely throughout the territory of India; to reside and settle in any part of the territory of India; and to practise any profession, or to carry on any occupation, trade or business.',
  'Citizens have the freedom to speak, assemble peacefully, form groups, move anywhere in India, and work in any profession (with reasonable restrictions).',
  ARRAY['freedom of speech', 'assembly', 'movement', 'profession', 'fundamental rights'],
  ARRAY['constitutional', 'rights', 'freedom'],
  'Central',
  'https://legislative.gov.in/constitution-of-india',
  '1950-01-26'
),
(
  'Constitution of India, 1950',
  '21',
  'III - Fundamental Rights',
  'Protection of life and personal liberty',
  'No person shall be deprived of his life or personal liberty except according to procedure established by law.',
  'Everyone has the right to life and personal freedom. These can only be taken away by proper legal process.',
  ARRAY['right to life', 'personal liberty', 'fundamental rights', 'human rights'],
  ARRAY['constitutional', 'rights', 'life'],
  'Central',
  'https://legislative.gov.in/constitution-of-india',
  '1950-01-26'
),

-- Indian Penal Code - Common Crimes
(
  'Indian Penal Code, 1860',
  '379',
  'XVII - Of Offences Against Property',
  'Punishment for theft',
  'Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.',
  'Stealing someone else''s property without permission is a crime. Punishment: Up to 3 years in prison and/or fine.',
  ARRAY['theft', 'stealing', 'property', 'crime', 'punishment'],
  ARRAY['property', 'criminal'],
  'Central',
  'https://indiankanoon.org/doc/1459557/',
  '1860-10-06'
),
(
  'Indian Penal Code, 1860',
  '323',
  'XVI - Of Offences Affecting the Human Body',
  'Punishment for voluntarily causing hurt',
  'Whoever, except in the case provided for by section 334, voluntarily causes hurt, shall be punished with imprisonment of either description for a term which may extend to one year, or with fine which may extend to one thousand rupees, or with both.',
  'Causing physical hurt to someone intentionally is a crime. Punishment: Up to 1 year in prison and/or fine up to ₹1000.',
  ARRAY['assault', 'hurt', 'violence', 'injury', 'crime'],
  ARRAY['violence', 'criminal'],
  'Central',
  'https://indiankanoon.org/doc/1128779/',
  '1860-10-06'
),

-- Consumer Protection
(
  'Consumer Protection Act, 2019',
  '2(7)',
  'I - Preliminary',
  'Definition of consumer',
  'Consumer means any person who buys any goods for a consideration which has been paid or promised or partly paid and partly promised, or under any system of deferred payment and includes any user of such goods other than the person who buys such goods for consideration paid or promised or partly paid or partly promised, or under any system of deferred payment, when such use is made with the approval of such person, but does not include a person who obtains such goods for resale or for any commercial purpose.',
  'A consumer is someone who buys goods or services for personal use (not for resale or business). You have rights as a consumer if you buy products or services.',
  ARRAY['consumer', 'buyer rights', 'goods', 'services', 'consumer protection'],
  ARRAY['consumer', 'commerce'],
  'Central',
  'https://legislative.gov.in/consumer-protection-act',
  '2019-08-09'
),

-- Right to Information
(
  'Right to Information Act, 2005',
  '6',
  'II - Right to Information and Obligations of Public Authorities',
  'Request for obtaining information',
  'A person, who desires to obtain any information under this Act, shall make a request in writing or through electronic means in English or Hindi or in the official language of the area in which the application is being made, to the Public Information Officer of the concerned public authority, specifying the particulars of the information sought by him.',
  'You have the right to ask for information from government departments. Submit a written request (in English, Hindi, or local language) to the Public Information Officer. They must respond within 30 days.',
  ARRAY['rti', 'right to information', 'government information', 'transparency', 'public information'],
  ARRAY['transparency', 'government', 'rights'],
  'Central',
  'https://legislative.gov.in/right-to-information-act',
  '2005-06-21'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE AUTHORITIES (for testing)
-- ============================================
INSERT INTO authorities (
  name, 
  designation, 
  department, 
  email, 
  phone, 
  city, 
  state, 
  categories,
  response_rate,
  average_response_time
) VALUES 
(
  'Sample Municipal Commissioner',
  'Chief Commissioner',
  'Municipal Corporation',
  'commissioner@example.gov.in',
  '+91-11-12345678',
  'Delhi',
  'Delhi',
  ARRAY['infrastructure', 'sanitation', 'water'],
  75.5,
  7
),
(
  'Sample Police Commissioner',
  'Commissioner of Police',
  'Delhi Police',
  'cp@delhipolice.gov.in',
  '+91-11-23456789',
  'Delhi',
  'Delhi',
  ARRAY['safety', 'crime', 'traffic'],
  82.3,
  5
),
(
  'Sample Health Officer',
  'Chief Medical Officer',
  'Health Department',
  'cmo@example.gov.in',
  '+91-11-34567890',
  'Delhi',
  'Delhi',
  ARRAY['health', 'sanitation', 'hospitals'],
  68.9,
  10
)
ON CONFLICT DO NOTHING;

