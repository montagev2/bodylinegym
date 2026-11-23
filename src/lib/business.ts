// Business constants for Body Line Fitness Center

export const BUSINESS = {
  name: 'Body Line Fitness Center',
  nameBengali: 'বডি লাইন ফিটনেস সেন্টার',
  tagline: 'Forge Your Limits',
  phone: '062949 02384',
  phoneRaw: '06294902384',
  whatsappNumber: '916294902384', // with country code, no +
  address: 'Near Basudevpur Maharaj Nandakumar High School, near Jana Steel Furnitures, Nandakumar, West Bengal 721632',
  area: 'Nandakumar, West Bengal',
  pincode: '721632',
  hours: 'Open 24 Hours',
  rating: 4.7,
  reviewCount: 9,
  mapsUrl: 'https://maps.app.goo.gl/Jd2YLd5KgyYTxBF26',
  mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3706.433456789!2d87.92041!3d22.20033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDEyJzAxLjIiTiA4N8KwNTUnMTMuNSJF!5e0!3m2!1sen!2sin!4v1234567890',
  plusCode: '6W2F+45 Nandakumar, West Bengal',
  established: '2020',
  features: [
    { icon: 'clock', title: '24/7 Open', desc: 'Train on your schedule, anytime day or night' },
    { icon: 'dumbbell', title: 'Modern Equipment', desc: 'Cable crossover, barbells, lat pulldown & more' },
    { icon: 'boxing', title: 'Boxing & Combat', desc: 'Heavy bags, boxing training & combat sports' },
    { icon: 'star', title: '4.7 Star Rated', desc: '9+ verified Google reviews from real members' },
  ],
} as const

export const WHATSAPP_INQUIRY_URL = (message: string) =>
  `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(message)}`

export const WHATSAPP_JOIN_URL = WHATSAPP_INQUIRY_URL(
  `Hi! I'm interested in joining Body Line Fitness Center, Nandakumar. Please share membership details.`
)

export const WHATSAPP_TRIAL_URL = WHATSAPP_INQUIRY_URL(
  `Hi! I'd like to book a free trial session at Body Line Fitness Center, Nandakumar.`
)

// Plan pricing (placeholder — confirm with client)
export const PLAN_NOTE = '* Pricing is indicative. Final rates confirmed at the gym.'
