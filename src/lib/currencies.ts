/**
 * Comprehensive list of world currencies with ISO 4217 codes
 * Includes major and minor currencies from around the world
 */

export interface Currency {
  code: string
  name: string
  symbol: string
  country: string
}

export const CURRENCIES: Currency[] = [
  // Major Global Currencies
  { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States' },
  { code: 'EUR', name: 'Euro', symbol: '€', country: 'European Union' },
  { code: 'GBP', name: 'British Pound Sterling', symbol: '£', country: 'United Kingdom' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', country: 'Japan' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', country: 'Switzerland' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', country: 'Canada' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', country: 'Australia' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', country: 'New Zealand' },

  // Asian Currencies
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', country: 'China' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', country: 'Hong Kong' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', country: 'Singapore' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', country: 'South Korea' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', country: 'India' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', country: 'Thailand' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', country: 'Malaysia' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', country: 'Indonesia' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', country: 'Philippines' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', country: 'Vietnam' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', country: 'Taiwan' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', country: 'Pakistan' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', country: 'Bangladesh' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨', country: 'Sri Lanka' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', country: 'Nepal' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', country: 'Myanmar' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', country: 'Cambodia' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭', country: 'Laos' },
  { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', country: 'Brunei' },

  // European Currencies
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', country: 'Sweden' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', country: 'Norway' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', country: 'Denmark' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', country: 'Poland' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', country: 'Czech Republic' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', country: 'Hungary' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', country: 'Romania' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', country: 'Bulgaria' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', country: 'Croatia' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин', country: 'Serbia' },
  { code: 'BAM', name: 'Bosnia and Herzegovina Mark', symbol: 'КМ', country: 'Bosnia and Herzegovina' },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', country: 'North Macedonia' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L', country: 'Albania' },
  { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', country: 'Iceland' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', country: 'Ukraine' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', country: 'Belarus' },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', country: 'Moldova' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾', country: 'Georgia' },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏', country: 'Armenia' },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', country: 'Azerbaijan' },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', country: 'Kazakhstan' },
  { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с', country: 'Kyrgyzstan' },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'SM', country: 'Tajikistan' },
  { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'T', country: 'Turkmenistan' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: 'сўм', country: 'Uzbekistan' },

  // Middle Eastern & African Currencies
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', country: 'United Arab Emirates' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', country: 'Saudi Arabia' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', country: 'Qatar' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', country: 'Kuwait' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', country: 'Bahrain' },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼', country: 'Oman' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', country: 'Jordan' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', country: 'Lebanon' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', country: 'Israel' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', country: 'Egypt' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', country: 'Turkey' },
  { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', country: 'Iran' },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'د.ع', country: 'Iraq' },
  { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', country: 'Afghanistan' },

  // African Currencies
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', country: 'South Africa' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', country: 'Nigeria' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', country: 'Kenya' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', country: 'Ghana' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', country: 'Ethiopia' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', country: 'Uganda' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', country: 'Tanzania' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF', country: 'Rwanda' },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', country: 'Burundi' },
  { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', country: 'Djibouti' },
  { code: 'SOS', name: 'Somali Shilling', symbol: 'S', country: 'Somalia' },
  { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk', country: 'Eritrea' },
  { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س', country: 'Sudan' },
  { code: 'SSP', name: 'South Sudanese Pound', symbol: '£', country: 'South Sudan' },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', country: 'Libya' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', country: 'Tunisia' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', country: 'Algeria' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', country: 'Morocco' },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', country: 'Mauritius' },
  { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨', country: 'Seychelles' },
  { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', country: 'Comoros' },
  { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', country: 'Madagascar' },
  { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', country: 'Maldives' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨', country: 'Sri Lanka' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', country: 'Nepal' },
  { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.', country: 'Bhutan' },
  { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$', country: 'Macau' },
  { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', country: 'Brunei' },

  // American Currencies
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', country: 'Brazil' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', country: 'Argentina' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', country: 'Chile' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', country: 'Colombia' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', country: 'Peru' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', country: 'Uruguay' },
  { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲', country: 'Paraguay' },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs', country: 'Bolivia' },
  { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.S', country: 'Venezuela' },
  { code: 'GYD', name: 'Guyanese Dollar', symbol: 'G$', country: 'Guyana' },
  { code: 'SRD', name: 'Surinamese Dollar', symbol: '$', country: 'Suriname' },
  { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: 'TT$', country: 'Trinidad and Tobago' },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$', country: 'Barbados' },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', country: 'Jamaica' },
  { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$', country: 'Belize' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', country: 'Guatemala' },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', country: 'Honduras' },
  { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', country: 'Nicaragua' },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', country: 'Costa Rica' },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', country: 'Panama' },
  { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', country: 'Dominican Republic' },
  { code: 'HTG', name: 'Haitian Gourde', symbol: 'G', country: 'Haiti' },
  { code: 'CUP', name: 'Cuban Peso', symbol: '$', country: 'Cuba' },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$', country: 'Eastern Caribbean' },

  // Oceanian Currencies
  { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', country: 'Fiji' },
  { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', country: 'Papua New Guinea' },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$', country: 'Solomon Islands' },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'Vt', country: 'Vanuatu' },
  { code: 'WST', name: 'Samoan Tala', symbol: 'WS$', country: 'Samoa' },
  { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', country: 'Tonga' },
  { code: 'KID', name: 'Kiribati Dollar', symbol: '$', country: 'Kiribati' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', country: 'New Zealand' },

  // Cryptocurrencies (for completeness)
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', country: 'Global' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', country: 'Global' },
  { code: 'LTC', name: 'Litecoin', symbol: 'Ł', country: 'Global' },
  { code: 'XRP', name: 'Ripple', symbol: 'XRP', country: 'Global' },
  { code: 'ADA', name: 'Cardano', symbol: '₳', country: 'Global' },
  { code: 'DOT', name: 'Polkadot', symbol: '●', country: 'Global' },
  { code: 'LINK', name: 'Chainlink', symbol: 'LINK', country: 'Global' },
  { code: 'UNI', name: 'Uniswap', symbol: 'UNI', country: 'Global' },
  { code: 'AAVE', name: 'Aave', symbol: 'AAVE', country: 'Global' },
  { code: 'SOL', name: 'Solana', symbol: '◎', country: 'Global' },
]

/**
 * Get currency by code
 */
export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find(currency => currency.code === code)
}

/**
 * Get currencies by country
 */
export function getCurrenciesByCountry(country: string): Currency[] {
  return CURRENCIES.filter(currency => 
    currency.country.toLowerCase().includes(country.toLowerCase())
  )
}

/**
 * Get major currencies (most commonly used)
 */
export function getMajorCurrencies(): Currency[] {
  const majorCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY', 'INR', 'BRL']
  return CURRENCIES.filter(currency => majorCodes.includes(currency.code))
}

/**
 * Get all currency codes
 */
export function getAllCurrencyCodes(): string[] {
  return CURRENCIES.map(currency => currency.code)
}

/**
 * Format currency for display
 */
export function formatCurrencyDisplay(currency: Currency): string {
  return `${currency.code} - ${currency.name} (${currency.symbol})`
}

/**
 * Search currencies by name or code
 */
export function searchCurrencies(query: string): Currency[] {
  const lowercaseQuery = query.toLowerCase()
  return CURRENCIES.filter(currency => 
    currency.code.toLowerCase().includes(lowercaseQuery) ||
    currency.name.toLowerCase().includes(lowercaseQuery) ||
    currency.country.toLowerCase().includes(lowercaseQuery)
  )
}
