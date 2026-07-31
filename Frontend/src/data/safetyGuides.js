export const AQI_BANDS = ["good", "moderate", "usg", "unhealthy", "veryUnhealthy", "hazardous"]

export const AQI_BAND_LABEL = {
  good: "Good",
  moderate: "Moderate",
  usg: "Unhealthy for Sensitive Groups",
  unhealthy: "Unhealthy",
  veryUnhealthy: "Very Unhealthy",
  hazardous: "Hazardous",
}

export const AGE_GROUP_LABEL = {
  child: "Child",
  teen: "Teen",
  adult: "Adult",
  senior: "Senior",
}

const DISEASE_KEYWORDS = {
  asthma: ["asthma"],
  copd: ["copd", "emphysema", "chronic bronchitis"],
  heart: ["heart", "cardiac", "cardiovascular", "hypertension", "blood pressure", "angina", "stroke"],
  respiratory: ["respiratory", "lung", "pulmonary", "breathing", "bronchitis", "pneumonia", "tuberculosis", " tb", "sinus"],
  diabetes: ["diabetes", "diabetic"],
  pregnancy: ["pregnan", "expecting"],
  allergy: ["allerg", "rhinitis", "hay fever"],
  kidney: ["kidney", "renal", "nephr"],
  cancer: ["cancer", "tumor", "tumour", "oncolog", "chemo", "leukemia", "lymphoma", "immuno", "immune"],
  skin: ["eczema", "dermatit", "psoriasis", "skin"],
  migraine: ["migraine", "headache"],
}

export const DISEASE_LABEL = {
  asthma: "Asthma",
  copd: "COPD",
  heart: "Heart / Cardiovascular",
  respiratory: "Respiratory condition",
  diabetes: "Diabetes",
  pregnancy: "Pregnancy",
  allergy: "Allergy",
  kidney: "Kidney condition",
  cancer: "Cancer / weakened immunity",
  skin: "Skin condition",
  migraine: "Migraine",
}

export function getAqiBandKey(aqi) {
  const v = Number(aqi)
  if (aqi === "" || aqi == null || isNaN(v)) return null
  if (v <= 50) return "good"
  if (v <= 100) return "moderate"
  if (v <= 150) return "usg"
  if (v <= 200) return "unhealthy"
  if (v <= 300) return "veryUnhealthy"
  return "hazardous"
}

export function getAgeGroup(age) {
  const v = Number(age)
  if (age === "" || age == null || isNaN(v)) return null
  if (v <= 12) return "child"
  if (v <= 17) return "teen"
  if (v <= 59) return "adult"
  return "senior"
}

export function parseDiseases(text) {
  if (!text) return []
  const t = ` ${String(text).toLowerCase()} `
  const tags = []
  for (const [tag, words] of Object.entries(DISEASE_KEYWORDS)) {
    if (words.some((w) => t.includes(w))) tags.push(tag)
  }
  return tags
}

const ELEVATED = ["usg", "unhealthy", "veryUnhealthy", "hazardous"]

export const SAFETY_GUIDES = [
  {
    id: "good-enjoy",
    icon: "🌿",
    title: "Air quality is good, enjoy the outdoors",
    desc: "Conditions are ideal for outdoor activities, exercise and ventilation. Open windows to let fresh air in.",
    severity: "low",
    aqiBands: ["good"],
    ageGroups: "all",
    sensitivities: "all",
    diseases: "all",
  },
  {
    id: "moderate-watch",
    icon: "🙂",
    title: "Acceptable air, unusually sensitive people take note",
    desc: "Air quality is acceptable for most. If you are unusually sensitive, consider reducing prolonged or heavy outdoor exertion.",
    severity: "low",
    aqiBands: ["moderate"],
    ageGroups: "all",
    sensitivities: "all",
    diseases: "all",
  },
  {
    id: "usg-limit-exertion",
    icon: "🚶",
    title: "Limit prolonged or heavy outdoor exertion",
    desc: "Sensitive groups should cut back on long or intense outdoor activity and take more breaks. Others are unlikely to be affected.",
    severity: "medium",
    aqiBands: ["usg"],
    ageGroups: "all",
    sensitivities: "all",
    diseases: "all",
  },
  {
    id: "unhealthy-reduce-outdoor",
    icon: "⚠️",
    title: "Reduce outdoor activity",
    desc: "Everyone may begin to feel effects. Move workouts indoors and keep outdoor time short.",
    severity: "high",
    aqiBands: ["unhealthy"],
    ageGroups: "all",
    sensitivities: "all",
    diseases: "all",
  },
  {
    id: "mask-outdoors",
    icon: "😷",
    title: "Wear an N95 / KN95 mask outdoors",
    desc: "If you must go outside, wear a well-fitted N95 or KN95 respirator. Cloth and surgical masks do little against fine particulates.",
    severity: "high",
    aqiBands: ["unhealthy", "veryUnhealthy", "hazardous"],
    ageGroups: "all",
    sensitivities: "all",
    diseases: "all",
  },
  {
    id: "very-unhealthy-stay-indoors",
    icon: "🏠",
    title: "Stay indoors and keep air clean",
    desc: "Avoid outdoor activity. Stay inside with windows and doors closed and run an air purifier if you have one.",
    severity: "high",
    aqiBands: ["veryUnhealthy", "hazardous"],
    ageGroups: "all",
    sensitivities: "all",
    diseases: "all",
  },
  {
    id: "hazardous-emergency",
    icon: "🛑",
    title: "Health emergency, avoid all outdoor exposure",
    desc: "Everyone should remain indoors, seal gaps around windows and doors, and keep exertion to a minimum until air quality improves.",
    severity: "high",
    aqiBands: ["hazardous"],
    ageGroups: "all",
    sensitivities: "all",
    diseases: "all",
  },
  {
    id: "windows-closed",
    icon: "🪟",
    title: "Keep windows and doors closed",
    desc: "Prevent polluted outdoor air from coming inside. Use recirculate mode on air conditioning rather than fresh-air intake.",
    severity: "medium",
    aqiBands: ELEVATED,
    ageGroups: "all",
    sensitivities: "all",
    diseases: "all",
  },
  {
    id: "air-purifier",
    icon: "🌀",
    title: "Run a HEPA air purifier indoors",
    desc: "A HEPA purifier sized for the room lowers indoor particulate levels. Keep it running in the room where you spend the most time.",
    severity: "medium",
    aqiBands: ELEVATED,
    ageGroups: "all",
    sensitivities: "all",
    diseases: "all",
  },
  {
    id: "avoid-traffic",
    icon: "🚗",
    title: "Avoid busy roads and traffic fumes",
    desc: "Pollutant levels spike near heavy traffic. Choose quieter streets and avoid exercising alongside busy roads.",
    severity: "low",
    aqiBands: ELEVATED,
    ageGroups: "all",
    sensitivities: "all",
    diseases: "all",
  },
  {
    id: "stay-hydrated",
    icon: "💧",
    title: "Stay hydrated",
    desc: "Drinking water helps your body clear irritants. Keep fluids up, especially if you feel throat or eye irritation.",
    severity: "low",
    aqiBands: ELEVATED,
    ageGroups: "all",
    sensitivities: "all",
    diseases: "all",
  },

  {
    id: "children-reschedule-play",
    icon: "🧒",
    title: "Reschedule children's outdoor play & sports",
    desc: "Children breathe faster and take in more air per kilo of body weight. Move play and sports indoors and watch for coughing or wheezing.",
    severity: "high",
    aqiBands: ELEVATED,
    ageGroups: ["child", "teen"],
    sensitivities: "all",
    diseases: "all",
  },
  {
    id: "seniors-monitor",
    icon: "🧓",
    title: "Older adults: monitor breathing and heart symptoms",
    desc: "Ageing lungs and hearts are more vulnerable to polluted air. Rest often, keep medication handy and seek care if you feel unwell.",
    severity: "high",
    aqiBands: ELEVATED,
    ageGroups: ["senior"],
    sensitivities: "all",
    diseases: "all",
  },

  {
    id: "sensitive-act-early",
    icon: "❤️‍🩹",
    title: "You're in a sensitive group, act earlier than others",
    desc: "Because you flagged high sensitivity, start protective steps (masking, staying indoors) at a lower AQI than the general public.",
    severity: "high",
    aqiBands: ["moderate", "usg", "unhealthy", "veryUnhealthy", "hazardous"],
    ageGroups: "all",
    sensitivities: ["high"],
    diseases: "all",
  },

  {
    id: "asthma-inhaler",
    icon: "🫁",
    title: "Asthma: keep your reliever inhaler with you",
    desc: "Carry your quick-relief (reliever) inhaler at all times and follow your written asthma action plan. Pre-medicate before any unavoidable exposure.",
    severity: "high",
    aqiBands: ["moderate", "usg", "unhealthy", "veryUnhealthy", "hazardous"],
    ageGroups: "all",
    sensitivities: "all",
    diseases: ["asthma"],
  },
  {
    id: "copd-limit",
    icon: "🫁",
    title: "COPD: minimise exertion and keep medication close",
    desc: "Stay indoors during poor air, avoid physical strain, and have your bronchodilator and rescue medication within reach.",
    severity: "high",
    aqiBands: ["usg", "unhealthy", "veryUnhealthy", "hazardous"],
    ageGroups: "all",
    sensitivities: "all",
    diseases: ["copd"],
  },
  {
    id: "heart-watch",
    icon: "💓",
    title: "Heart condition: watch for chest pain or palpitations",
    desc: "Fine particles strain the cardiovascular system. Avoid exertion and seek medical help for chest tightness, palpitations or breathlessness.",
    severity: "high",
    aqiBands: ELEVATED,
    ageGroups: "all",
    sensitivities: "all",
    diseases: ["heart"],
  },
  {
    id: "respiratory-no-exercise",
    icon: "🌬️",
    title: "Respiratory condition: avoid outdoor exercise",
    desc: "Skip outdoor exercise while air quality is poor and keep any prescribed medication on hand. Report worsening symptoms to your doctor.",
    severity: "high",
    aqiBands: ["usg", "unhealthy", "veryUnhealthy", "hazardous"],
    ageGroups: "all",
    sensitivities: "all",
    diseases: ["respiratory"],
  },
  {
    id: "diabetes-monitor",
    icon: "🩸",
    title: "Diabetes: pollution can worsen control, monitor closely",
    desc: "Air pollution is linked to poorer glucose control and vascular stress. Keep to your medication schedule and monitor how you feel.",
    severity: "medium",
    aqiBands: ELEVATED,
    ageGroups: "all",
    sensitivities: "all",
    diseases: ["diabetes"],
  },
  {
    id: "pregnancy-minimise",
    icon: "🤰",
    title: "Pregnancy: minimise exposure to protect you and your baby",
    desc: "Reduce time outdoors during poor air, keep indoor air clean, and discuss any concerns with your antenatal care provider.",
    severity: "high",
    aqiBands: ["usg", "unhealthy", "veryUnhealthy", "hazardous"],
    ageGroups: "all",
    sensitivities: "all",
    diseases: ["pregnancy"],
  },
  {
    id: "allergy-rinse",
    icon: "🤧",
    title: "Allergy-prone: rinse off after being outdoors",
    desc: "Change clothes and rinse your face, nose and eyes after outdoor exposure to clear settled particles and pollen.",
    severity: "low",
    aqiBands: ["moderate", "usg", "unhealthy", "veryUnhealthy", "hazardous"],
    ageGroups: "all",
    sensitivities: "all",
    diseases: ["allergy"],
  },
  {
    id: "kidney-care",
    icon: "🫘",
    title: "Kidney condition: stay hydrated and avoid strain",
    desc: "Pollution adds oxidative and vascular stress. Drink enough water, avoid strenuous outdoor activity and keep to your medication and dialysis schedule.",
    severity: "medium",
    aqiBands: ELEVATED,
    ageGroups: "all",
    sensitivities: "all",
    diseases: ["kidney"],
  },
  {
    id: "immune-protect",
    icon: "🛡️",
    title: "Weakened immunity: guard against pollution and infection",
    desc: "If you are immunocompromised (e.g. cancer treatment), poor air raises infection and complication risk. Stay indoors with clean air, mask up outside and avoid crowds.",
    severity: "high",
    aqiBands: ["usg", "unhealthy", "veryUnhealthy", "hazardous"],
    ageGroups: "all",
    sensitivities: "all",
    diseases: ["cancer"],
  },
  {
    id: "skin-protect",
    icon: "🧴",
    title: "Skin condition: rinse and moisturise after exposure",
    desc: "Airborne particles can irritate eczema and other skin conditions. Rinse exposed skin, moisturise, and cover up when air quality is poor.",
    severity: "low",
    aqiBands: ["moderate", "usg", "unhealthy", "veryUnhealthy", "hazardous"],
    ageGroups: "all",
    sensitivities: "all",
    diseases: ["skin"],
  },
  {
    id: "migraine-triggers",
    icon: "🧠",
    title: "Migraine-prone: pollution can trigger attacks",
    desc: "Spikes in pollutants are a known migraine trigger. Limit exposure on bad-air days, stay hydrated and keep your usual relief medication handy.",
    severity: "medium",
    aqiBands: ELEVATED,
    ageGroups: "all",
    sensitivities: "all",
    diseases: ["migraine"],
  },
  {
    id: "seek-help",
    icon: "🚑",
    title: "Seek medical help if symptoms worsen",
    desc: "If you experience severe breathlessness, chest pain, dizziness or confusion, treat it as urgent and contact emergency services.",
    severity: "high",
    aqiBands: ["veryUnhealthy", "hazardous"],
    ageGroups: "all",
    sensitivities: "all",
    diseases: "all",
  },
]

const WEIGHTS = { aqi: 3, age: 2, sensitivity: 2, disease: 3 }
const SEVERITY_RANK = { high: 3, medium: 2, low: 1 }
const MAX_GENERAL_GUIDES = 3

function restricts(feature) {
  return Array.isArray(feature) && feature.length > 0
}

function titleCase(s) {
  return String(s)
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ")
}

function severityFor(band, rate) {
  const high = ["unhealthy", "veryUnhealthy", "hazardous"]
  if (rate === "Severe" || high.includes(band)) return "high"
  if (rate === "Moderate" || band === "usg") return "medium"
  return "low"
}

function buildPersonalizedGuide({ rawDisease, band, rate, aqi }) {
  const name = titleCase(rawDisease) || "your condition"
  const bandLabel = band ? AQI_BAND_LABEL[band] : null
  const severity = severityFor(band, rate)
  const elevated = ELEVATED.includes(band)

  let air
  if (!band) {
    air = "Select a location so the advice can factor in the current air quality."
  } else if (elevated) {
    air = `Air quality is ${bandLabel} right now, which can aggravate ${name.toLowerCase()}, so minimise time outdoors, keep windows closed and have your medication within reach.`
  } else {
    air = `Air quality is ${bandLabel} right now, which is relatively safe, so stay alert to any change in your symptoms and keep your treatment plan handy.`
  }
  const ratePhrase = rate
    ? ` As you rated it ${rate.toLowerCase()}, ${
        severity === "high"
          ? "take extra precautions and don't hesitate to seek medical help."
          : "keep monitoring how you feel through the day."
      }`
    : ""

  const aqiSuffix = aqi !== "" && aqi != null ? ` at AQI ${aqi}` : ""
  return {
    id: "personalized-condition",
    icon: "🩺",
    title: `Managing your ${name}${aqiSuffix}`,
    desc: `${air}${ratePhrase}`,
    severity,
    score: 100, 
    tailored: true,
    reasons: [
      `Condition: ${name}`,
      rate ? `Severity: ${rate}` : null,
      bandLabel ? `AQI: ${bandLabel}` : null,
    ].filter(Boolean),
  }
}

export function recommendGuides(input = {}, guides = SAFETY_GUIDES) {
  const band = getAqiBandKey(input.aqi)
  const ageGroup = getAgeGroup(input.age)
  const sensitivity = (input.sensitivity || "").toLowerCase() || null
  const rawDisease = (input.disease || "").trim()
  const rate = input.diseaseRate || ""
  const diseases = parseDiseases(rawDisease)
  const rateBoost = rate === "Severe" ? 2 : rate === "Moderate" ? 1 : 0

  const results = []

  for (const guide of guides || []) {
    let score = 0
    let tailored = false 
    const reasons = []

    if (restricts(guide.aqiBands)) {
      if (!band || !guide.aqiBands.includes(band)) continue
      score += WEIGHTS.aqi
      reasons.push(`AQI: ${AQI_BAND_LABEL[band]}`)
    } else {
      score += 0.5 
    }

    if (restricts(guide.ageGroups)) {
      if (!ageGroup || !guide.ageGroups.includes(ageGroup)) continue
      score += WEIGHTS.age
      reasons.push(`Age: ${AGE_GROUP_LABEL[ageGroup]}`)
      tailored = true
    } else if (ageGroup) {
      score += 0.25
    }

    if (restricts(guide.sensitivities)) {
      if (!sensitivity || !guide.sensitivities.includes(sensitivity)) continue
      score += WEIGHTS.sensitivity
      reasons.push(`Sensitivity: ${sensitivity.charAt(0).toUpperCase() + sensitivity.slice(1)}`)
      tailored = true
    } else if (sensitivity === "high") {
      score += 0.25
    }

    if (restricts(guide.diseases)) {
      const hit = guide.diseases.filter((d) => diseases.includes(d))
      if (hit.length === 0) continue
      score += WEIGHTS.disease * hit.length + rateBoost
      hit.forEach((d) => reasons.push(`Condition: ${DISEASE_LABEL[d] || d}`))
      if (rate) reasons.push(`Severity: ${rate}`)
      tailored = true
    }

    results.push({ ...guide, score, reasons, tailored })
  }

  if (rawDisease) {
    results.push(buildPersonalizedGuide({ rawDisease, band, rate, aqi: input.aqi }))
  }

  results.sort(
    (a, b) =>
      b.score - a.score ||
      (SEVERITY_RANK[b.severity] || 0) - (SEVERITY_RANK[a.severity] || 0) ||
      a.title.localeCompare(b.title)
  )

  const capped = []
  let generalCount = 0
  for (const r of results) {
    if (r.tailored) {
      capped.push(r)
    } else if (generalCount < MAX_GENERAL_GUIDES) {
      capped.push(r)
      generalCount++
    }
  }
  return capped
}
