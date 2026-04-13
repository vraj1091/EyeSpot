import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Plan {
  id: string;
  name: string;
  type: 'monthly' | 'quarterly' | 'yearly';
  price: string;
  features: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  features: string[];
  iconIndex?: number;
  image?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  slogan: string;
  details: string;
  image?: string;
}

export interface Detection {
  id: string;
  name: string;
  description: string;
  status: 'live' | 'pilot' | 'coming-soon';
}

export interface Industry {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  status: 'live' | 'pilot' | 'coming-soon';
  detections: Detection[];
}

export interface SiteMedia {
  heroImage: string;
  architectureImage: string;
  industriesImage: string;
  aboutImage: string;
  productsHeroImage: string;
  pricingImage: string;
  contactImage: string;
  teamDefaultImage: string;
}

export interface SiteContentPayload {
  companyName: string;
  tagline: string;
  vision: string;
  mission: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  team: TeamMember[];
  products: Product[];
  plans: Plan[];
  industries: Industry[];
  media: SiteMedia;
}

type SyncSource = 'local' | 'remote';

interface AppState extends SiteContentPayload {
  contentVersion: number;
  lastSyncedAt: string | null;
  lastSyncSource: SyncSource;
  updateCompanyDetails: (data: Partial<Pick<AppState, 'companyName' | 'tagline' | 'vision' | 'mission' | 'aboutText' | 'contactEmail' | 'contactPhone' | 'contactAddress'>>) => void;
  updateTeam: (team: TeamMember[]) => void;
  updateProducts: (products: Product[]) => void;
  updatePlans: (plans: Plan[]) => void;
  updateIndustries: (industries: Industry[]) => void;
  updateMedia: (media: Partial<SiteMedia>) => void;
  replaceSiteContent: (
    content: Partial<SiteContentPayload>,
    meta?: { version?: number; updatedAt?: string | null; source?: SyncSource }
  ) => void;
  getSiteContent: () => SiteContentPayload;
}

const mediaDefaults: SiteMedia = {
  heroImage: 'https://images.pexels.com/photos/25391056/pexels-photo-25391056.jpeg?auto=compress&cs=tinysrgb&w=1600',
  architectureImage: 'https://images.pexels.com/photos/4597280/pexels-photo-4597280.jpeg?auto=compress&cs=tinysrgb&w=1600',
  industriesImage: 'https://images.pexels.com/photos/6838164/pexels-photo-6838164.jpeg?auto=compress&cs=tinysrgb&w=1600',
  aboutImage: 'https://images.pexels.com/photos/36733293/pexels-photo-36733293.jpeg?auto=compress&cs=tinysrgb&w=1600',
  productsHeroImage: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=1600',
  pricingImage: 'https://images.pexels.com/photos/8353837/pexels-photo-8353837.jpeg?auto=compress&cs=tinysrgb&w=1600',
  contactImage: 'https://images.pexels.com/photos/7709139/pexels-photo-7709139.jpeg?auto=compress&cs=tinysrgb&w=1600',
  teamDefaultImage: 'https://images.pexels.com/photos/36819476/pexels-photo-36819476.jpeg?auto=compress&cs=tinysrgb&w=900',
};

const productImageDefaults = [
  'https://images.pexels.com/photos/25391056/pexels-photo-25391056.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/5092815/pexels-photo-5092815.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/5408005/pexels-photo-5408005.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/5453824/pexels-photo-5453824.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/7658375/pexels-photo-7658375.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/6838164/pexels-photo-6838164.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/5203849/pexels-photo-5203849.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

const teamImageDefaults = [
  'https://images.pexels.com/photos/3912984/pexels-photo-3912984.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/35466542/pexels-photo-35466542.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/36819476/pexels-photo-36819476.jpeg?auto=compress&cs=tinysrgb&w=900',
];

const legacyMediaImageMap: Record<string, string> = {
  '/project-media/hero-detection.jpg': mediaDefaults.heroImage,
  '/project-media/architecture-detection.jpg': mediaDefaults.architectureImage,
  '/project-media/industries-detection.jpg': mediaDefaults.industriesImage,
  '/project-media/about-detection.jpg': mediaDefaults.aboutImage,
  '/project-media/products-hero-detection.jpg': mediaDefaults.productsHeroImage,
  '/project-media/pricing-detection.jpg': mediaDefaults.pricingImage,
  '/project-media/contact-detection.jpg': mediaDefaults.contactImage,
  '/project-media/team-default-detection.jpg': mediaDefaults.teamDefaultImage,
  'https://source.unsplash.com/1600x900/?security+operations+center,cctv': mediaDefaults.heroImage,
  'https://source.unsplash.com/1600x900/?edge+computing,server+rack': mediaDefaults.architectureImage,
  'https://source.unsplash.com/1600x900/?smart+city,traffic+monitoring': mediaDefaults.industriesImage,
  'https://source.unsplash.com/1600x900/?ai+team,technology+meeting': mediaDefaults.aboutImage,
  'https://source.unsplash.com/1600x900/?artificial+intelligence,video+analytics': mediaDefaults.productsHeroImage,
  'https://source.unsplash.com/1600x900/?analytics+dashboard,business+data': mediaDefaults.pricingImage,
  'https://source.unsplash.com/1600x900/?control+room,customer+support': mediaDefaults.contactImage,
  'https://source.unsplash.com/900x1200/?professional+portrait,office': mediaDefaults.teamDefaultImage,
};

const legacyProductImageMap: Record<string, string> = {
  '/project-media/product-shoplifting-vector.jpg': productImageDefaults[0],
  '/project-media/product-perimeter-pred.jpg': productImageDefaults[1],
  '/project-media/product-reid-tracking.jpg': productImageDefaults[2],
  '/project-media/product-thermal-fusion.jpg': productImageDefaults[3],
  '/project-media/product-checkout.jpg': productImageDefaults[4],
  '/project-media/product-lpr-velocity.jpg': productImageDefaults[5],
  '/project-media/product-custom-training.jpg': productImageDefaults[6],
  'https://source.unsplash.com/1200x900/?retail+security,camera': productImageDefaults[0],
  'https://source.unsplash.com/1200x900/?perimeter+security,fence+camera': productImageDefaults[1],
  'https://source.unsplash.com/1200x900/?facial+recognition,computer+vision': productImageDefaults[2],
  'https://source.unsplash.com/1200x900/?thermal+camera,infrared': productImageDefaults[3],
  'https://source.unsplash.com/1200x900/?self+checkout,retail+store': productImageDefaults[4],
  'https://source.unsplash.com/1200x900/?license+plate,traffic+camera': productImageDefaults[5],
  'https://source.unsplash.com/1200x900/?machine+learning,model+training': productImageDefaults[6],
};

const legacyTeamImageMap: Record<string, string> = {
  '/project-media/team-default-detection.jpg': teamImageDefaults[0],
  '/project-media/about-detection.jpg': teamImageDefaults[1],
  '/project-media/architecture-detection.jpg': teamImageDefaults[2],
  'https://source.unsplash.com/900x1200/?ceo,professional+portrait': teamImageDefaults[0],
  'https://source.unsplash.com/900x1200/?cto,engineer+portrait': teamImageDefaults[1],
  'https://source.unsplash.com/900x1200/?ai+engineer,developer+portrait': teamImageDefaults[2],
};

const isLegacyProjectImage = (value?: string): value is string =>
  typeof value === 'string' && value.startsWith('/project-media/');

const isLegacyUnsplashImage = (value?: string): value is string =>
  typeof value === 'string' && value.includes('source.unsplash.com/');

const normalizeRequiredImage = (
  value: string | undefined,
  fallback: string,
  legacyMap: Record<string, string>
): string => {
  if (!value) return fallback;
  const mapped = legacyMap[value];
  if (mapped) return mapped;
  if (isLegacyProjectImage(value) || isLegacyUnsplashImage(value)) return fallback;
  return value;
};

const normalizeOptionalImage = (
  value: string | undefined,
  fallback: string,
  legacyMap: Record<string, string>
): string | undefined => {
  if (!value) return value;
  const mapped = legacyMap[value];
  if (mapped) return mapped;
  if (isLegacyProjectImage(value) || isLegacyUnsplashImage(value)) return fallback;
  return value;
};

const normalizeSiteMedia = (media: Partial<SiteMedia> | SiteMedia): SiteMedia => ({
  heroImage: normalizeRequiredImage(media.heroImage, mediaDefaults.heroImage, legacyMediaImageMap),
  architectureImage: normalizeRequiredImage(media.architectureImage, mediaDefaults.architectureImage, legacyMediaImageMap),
  industriesImage: normalizeRequiredImage(media.industriesImage, mediaDefaults.industriesImage, legacyMediaImageMap),
  aboutImage: normalizeRequiredImage(media.aboutImage, mediaDefaults.aboutImage, legacyMediaImageMap),
  productsHeroImage: normalizeRequiredImage(media.productsHeroImage, mediaDefaults.productsHeroImage, legacyMediaImageMap),
  pricingImage: normalizeRequiredImage(media.pricingImage, mediaDefaults.pricingImage, legacyMediaImageMap),
  contactImage: normalizeRequiredImage(media.contactImage, mediaDefaults.contactImage, legacyMediaImageMap),
  teamDefaultImage: normalizeRequiredImage(media.teamDefaultImage, mediaDefaults.teamDefaultImage, legacyMediaImageMap),
});

const normalizeTeamMembers = (team: TeamMember[]) =>
  team.map((member, index) => ({
    ...member,
    image: normalizeOptionalImage(
      member.image,
      teamImageDefaults[index % teamImageDefaults.length],
      legacyTeamImageMap
    ),
  }));

const normalizeProducts = (products: Product[]) =>
  products.map((product, index) => ({
    ...product,
    image: normalizeOptionalImage(
      product.image,
      productImageDefaults[index % productImageDefaults.length],
      legacyProductImageMap
    ),
  }));

const defaultIndustries: Industry[] = [
  {
    id: 'retail',
    title: 'Retail & Supermarkets',
    subtitle: 'Eliminate shrinkage, optimize store operations, and deliver frictionless checkout experiences.',
    icon: 'Store',
    status: 'live',
    detections: [
      { id: 'r1', name: 'Predictive Shoplifting Detection', description: 'Tracks skeletal movement vectors to identify concealment gestures before merchandise exits the store.', status: 'live' },
      { id: 'r2', name: 'Customer Heatmap & Dwell Time', description: 'Visualize foot traffic density and time spent per aisle to optimize product placement and store layout.', status: 'live' },
      { id: 'r3', name: 'Queue Management & Alerts', description: 'Count people waiting at checkout lanes and alert staff to open new registers when thresholds are exceeded.', status: 'live' },
      { id: 'r4', name: 'Shelf Out-of-Stock Detection', description: 'Detect empty shelf spaces in real-time and trigger restocking notifications to warehouse teams.', status: 'pilot' },
      { id: 'r5', name: 'Autonomous Checkout Correlation', description: 'Multi-camera hand-to-shelf triangulation for scanless billing and shrinkage control.', status: 'pilot' },
    ],
  },
  {
    id: 'construction',
    title: 'Construction & Heavy Industry',
    subtitle: 'Enforce safety compliance and prevent accidents on high-risk job sites in real-time.',
    icon: 'HardHat',
    status: 'pilot',
    detections: [
      { id: 'c1', name: 'PPE Compliance Monitoring', description: 'Real-time verification of hard hats, safety vests, goggles, and steel-toe boots on all workers entering the site.', status: 'pilot' },
      { id: 'c2', name: 'Heavy Machinery Death Zone Perimeters', description: 'Virtual boundary enforcement around active cranes, excavators, and forklifts — triggering localized sirens if a human enters.', status: 'pilot' },
      { id: 'c3', name: 'Scaffolding Fall Detection', description: 'Pose estimation tracks rapid drops in human skeletal height, indicating a severe fall off elevated platforms.', status: 'coming-soon' },
      { id: 'c4', name: 'Material Delivery Counting', description: 'Automatically count steel beams, bricks, or timber bundles as they are offloaded from delivery trucks.', status: 'coming-soon' },
      { id: 'c5', name: 'Restricted Zone Breach Alerts', description: 'Detect unauthorized personnel entering hazardous zones under suspended loads or near open excavations.', status: 'pilot' },
    ],
  },
  {
    id: 'warehouse',
    title: 'Warehousing & Logistics',
    subtitle: 'Maximize throughput, prevent collisions, and eliminate operational blind spots across your supply chain.',
    icon: 'Warehouse',
    status: 'pilot',
    detections: [
      { id: 'w1', name: 'Forklift-Pedestrian Collision Avoidance', description: 'Track forklift speed and pedestrian proximity in real-time, triggering immediate audio/visual alerts for near-misses.', status: 'pilot' },
      { id: 'w2', name: 'Loading Dock Turnaround Tracking', description: 'Timestamp truck arrivals, loading durations, and departures to optimize bay utilization and reduce bottlenecks.', status: 'coming-soon' },
      { id: 'w3', name: 'Aisle Blockage & Spill Detection', description: 'Instantly alert managers when pallets block walking paths, fire exits, or when hazardous liquid spills occur.', status: 'coming-soon' },
      { id: 'w4', name: 'Cargo & Pallet Counting', description: 'Automated inventory tracking using object detection and OCR to count packages as they move through the facility.', status: 'coming-soon' },
      { id: 'w5', name: 'Unsafe Lifting Posture Detection', description: 'Pose estimation monitors workers lifting heavy objects and flags unsafe bending or twisting movements.', status: 'coming-soon' },
    ],
  },
  {
    id: 'pharma',
    title: 'Pharmaceuticals & Cleanrooms',
    subtitle: 'Enforce sterile protocols, verify SOPs, and prevent contamination in regulated manufacturing environments.',
    icon: 'FlaskConical',
    status: 'coming-soon',
    detections: [
      { id: 'p1', name: 'Sterile Gowning Verification', description: 'AI checkpoint ensuring workers have full hairnets, face masks, gloves, and booties before entering cleanroom zones.', status: 'coming-soon' },
      { id: 'p2', name: 'SOP Sequence Tracking', description: 'Verify that technicians follow mandated sequences — e.g., confirming 20-second handwash before touching bio-samples.', status: 'coming-soon' },
      { id: 'p3', name: 'Tailgating & Piggybacking Prevention', description: 'Count if two people enter a restricted laboratory door when only one RFID badge was scanned.', status: 'coming-soon' },
      { id: 'p4', name: 'Foreign Object Debris Detection', description: 'Spot contaminants, dropped tools, or debris on sterile assembly lines that could compromise product integrity.', status: 'coming-soon' },
      { id: 'p5', name: 'Temperature-Sensitive Area Monitoring', description: 'Thermal fusion detects if cold-chain storage areas deviate from required temperature ranges.', status: 'coming-soon' },
    ],
  },
  {
    id: 'manufacturing',
    title: 'Smart Manufacturing & Assembly',
    subtitle: 'Automate quality assurance, reduce downtime, and protect worker health on production floors.',
    icon: 'Factory',
    status: 'coming-soon',
    detections: [
      { id: 'm1', name: 'Assembly Line Defect QA', description: 'Identify millimeter-level scratches, dents, or incorrect placements on high-speed production belts.', status: 'coming-soon' },
      { id: 'm2', name: 'Machine Downtime Alerts', description: 'Detect if a conveyor belt, robot arm, or critical equipment unexpectedly ceases movement.', status: 'coming-soon' },
      { id: 'm3', name: 'Worker Ergonomics Analysis', description: 'Monitor human posture patterns to prevent repetitive strain injuries and reduce compensation claims.', status: 'coming-soon' },
      { id: 'm4', name: 'Production Line Counting', description: 'Accurate real-time unit counting on fast-moving lines for inventory reconciliation and shift reporting.', status: 'coming-soon' },
      { id: 'm5', name: 'Hazardous Material Spill Detection', description: 'Visual detection of chemical spills, smoke, or fire hazards before traditional sensors trigger.', status: 'coming-soon' },
    ],
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Hospitals',
    subtitle: 'Protect patient safety with privacy-preserving edge AI — no video leaves the facility.',
    icon: 'HeartPulse',
    status: 'coming-soon',
    detections: [
      { id: 'h1', name: 'Patient Fall Detection', description: 'Privacy-preserving edge monitoring alerts nurses the moment a patient falls or gets out of bed unsafely.', status: 'coming-soon' },
      { id: 'h2', name: 'Bed Occupancy Monitoring', description: 'Detect if patients leave their beds when they should remain resting, triggering nursing station alerts.', status: 'coming-soon' },
      { id: 'h3', name: 'ER Aggression Detection', description: 'Track escalating violent posture in emergency room waiting areas to dispatch security before incidents occur.', status: 'coming-soon' },
      { id: 'h4', name: 'Wandering Patient Alerts', description: 'Detect if dementia or at-risk patients cross exit thresholds or enter restricted hospital zones.', status: 'coming-soon' },
      { id: 'h5', name: 'Hand Hygiene Compliance', description: 'Monitor handwashing stations to verify staff sanitize before and after patient interactions.', status: 'coming-soon' },
    ],
  },
  {
    id: 'smart-cities',
    title: 'Smart Cities & Traffic',
    subtitle: 'Optimize urban mobility, enhance public safety, and enable data-driven infrastructure planning.',
    icon: 'Car',
    status: 'coming-soon',
    detections: [
      { id: 's1', name: 'High-Speed ALPR/ANPR', description: 'License plate recognition tracking vehicles at highway speeds across city-wide camera networks.', status: 'coming-soon' },
      { id: 's2', name: 'Wrong-Way Driving Detection', description: 'Instantly trigger alerts for vehicles traveling against the flow of traffic on highways or one-way streets.', status: 'coming-soon' },
      { id: 's3', name: 'Intersection Near-Miss Logging', description: 'Count how often pedestrians and vehicles come within dangerous proximity to optimize traffic light timing.', status: 'coming-soon' },
      { id: 's4', name: 'Parking Bay Optimization', description: 'Real-time counting of available parking bays in structured garages and open lots.', status: 'coming-soon' },
      { id: 's5', name: 'Crowd Density Mapping', description: 'Monitor public spaces for overcrowding events and trigger alerts when density exceeds safety thresholds.', status: 'coming-soon' },
    ],
  },
  {
    id: 'energy',
    title: 'Energy & Critical Infrastructure',
    subtitle: 'Secure perimeters, detect threats, and monitor remote assets in zero-light and extreme conditions.',
    icon: 'Lock',
    status: 'coming-soon',
    detections: [
      { id: 'e1', name: 'Thermal + Optical Perimeter Intrusion', description: 'Multispectral fusion provides 24/7 intrusion detection even in complete darkness and adverse weather.', status: 'coming-soon' },
      { id: 'e2', name: 'Vegetation Encroachment Detection', description: 'Monitor power line corridors for tree growth that could cause outages or fire hazards.', status: 'coming-soon' },
      { id: 'e3', name: 'Pipeline Leak Visual Detection', description: 'Detect visual signs of liquid or gas leaks along pipeline infrastructure using thermal anomaly detection.', status: 'coming-soon' },
      { id: 'e4', name: 'Unmanned Drone Incursion', description: 'Detect and track unauthorized drone activity over restricted energy facilities and substations.', status: 'coming-soon' },
      { id: 'e5', name: 'Fire & Smoke Early Warning', description: 'Visual smoke and flame detection provides faster alerting than traditional heat or particle sensors.', status: 'coming-soon' },
    ],
  },
];

const defaultContent: SiteContentPayload = {
  companyName: 'EyeSpot',
  tagline: 'See Everything. Predict Anything. The Pinnacle of Edge AI.',
  vision: 'To illuminate the unseen by transforming passive video feeds into proactive, intelligent guardians of physical environments on a global scale.',
  mission: 'At EyeSpot, we engineer state-of-the-art edge AI that analyzes human behavior and spatial dynamics in real-time. Our zero-latency neural networks empower enterprises to prevent incidents before they occur, optimize operational flow, and secure their environments with unparalleled precision.',
  aboutText: 'EyeSpot represents the culmination of research in spatial-temporal graph convolutional networks and computer vision. By moving deep learning inference directly to the edge, EyeSpot instantly interprets complex visual data to provide military-grade awareness and predictive analytics to retail, government, and enterprise sectors globally.',
  contactEmail: 'initialize@eyespot.ai',
  contactPhone: '+1 (800) EYE-SPOT',
  contactAddress: 'Quantum Tower, Level 42, 100 Neural Network Drive, Silicon Valley, CA 94025',
  team: [
    {
      id: '1',
      name: 'VRAJ PATEL',
      role: 'CEO & Founder',
      slogan: '"Execution over everything."',
      details: 'Pioneered EyeSpot core vision and enterprise AI rollout strategy across retail and industrial deployments.',
      image: teamImageDefaults[0],
    },
    {
      id: '2',
      name: 'UTSAV GUPTA',
      role: 'Chief Technology Officer',
      slogan: '"Latency is the enemy of truth."',
      details: 'Architected zero-latency edge inference pipelines and deployment orchestration for large camera fleets.',
      image: teamImageDefaults[1],
    },
    {
      id: '3',
      name: 'SANDIP RANGALIYA',
      role: 'Core AI Engineer',
      slogan: '"Data never lies."',
      details: 'Leads model evaluation, behavioral analytics tuning, and production-quality detection performance validation.',
      image: teamImageDefaults[2],
    },
  ],
  products: [
    {
      id: '1',
      name: 'Predictive Shoplifting',
      description: 'Tracks localized skeletal movement vectors to identify concealment gestures before merchandise exits.',
      longDescription: 'Our predictive module correlates body pose, hand trajectory, and item interaction in real time to flag high-risk behavior before checkout evasion happens.',
      features: ['Pose-Based Concealment Detection', 'Item Interaction Timeline', 'Risk Scoring with Early Alerts'],
      iconIndex: 0,
      image: productImageDefaults[0],
    },
    {
      id: '2',
      name: 'Perimeter Intrusion',
      description: 'Creates virtual tripwires and auto-tracks intruders across restricted zones.',
      longDescription: 'The intrusion engine identifies true human and vehicle movement while reducing noise from shadows, weather, and irrelevant motion patterns.',
      features: ['Virtual Boundary Rules', 'Automated PTZ Follow', 'False Positive Suppression'],
      iconIndex: 1,
      image: productImageDefaults[1],
    },
    {
      id: '3',
      name: 'Cognitive ReID Mapping',
      description: 'Maintains person identity across disconnected camera feeds.',
      longDescription: 'Person re-identification uses gait, clothing texture, and behavior signatures to continue tracking targets even across blind spots.',
      features: ['Cross-Camera Person Matching', 'Route Reconstruction', 'Appearance Drift Handling'],
      iconIndex: 2,
      image: productImageDefaults[2],
    },
    {
      id: '4',
      name: 'Thermal Fusion',
      description: 'Combines thermal and optical streams for low-light and no-light operations.',
      longDescription: 'Thermal fusion identifies anomalies and potential threats in harsh or dark environments where standard optical inputs degrade.',
      features: ['Multispectral Overlay', 'Low-Light Threat Detection', 'Heat Signature Event Alerts'],
      iconIndex: 3,
      image: productImageDefaults[3],
    },
    {
      id: '5',
      name: 'Autonomous Checkout',
      description: 'Correlates product interactions for scanless billing and shrinkage control.',
      longDescription: 'Object-hand interaction mapping across multiple angles supports fast checkout flows and reduces disputes with better event traceability.',
      features: ['Shelf Interaction Tracking', 'Occlusion-Resilient Matching', 'Billing Event Export'],
      iconIndex: 4,
      image: productImageDefaults[4],
    },
    {
      id: '6',
      name: 'Velocity LPR',
      description: 'High-speed plate capture with instant watchlist matching.',
      longDescription: 'The LPR engine is optimized for difficult angles, speed variation, and lighting changes to maintain reliable plate reads for security workflows.',
      features: ['High-Speed Plate Read', 'Regional Plate Normalization', 'Watchlist Match Alerts'],
      iconIndex: 5,
      image: productImageDefaults[5],
    },
    {
      id: '7',
      name: 'Custom Model Training',
      description: 'Fine-tunes bespoke models using your own video context and threat definitions.',
      longDescription: 'We design use-case-specific pipelines, train with curated datasets, and validate model behavior under your operational conditions.',
      features: ['Dataset Strategy & Labeling', 'Model Fine-Tuning', 'Deployment Validation & Handoff'],
      iconIndex: 0,
      image: productImageDefaults[6],
    },
  ],
  plans: [
    {
      id: '1',
      name: 'Starter Monitor',
      type: 'monthly',
      price: 'Get Quote',
      features: [
        'Up to 8 Camera Streams',
        'Shoplifting and Intrusion Detection',
        '7-Day Event Retention',
        'Email Alert Routing',
        'Business Hours Support',
      ],
    },
    {
      id: '2',
      name: 'Growth Control',
      type: 'monthly',
      price: 'Get Quote',
      features: [
        'Up to 30 Camera Streams',
        'Behavior Analytics and Zone Rules',
        '30-Day Event Retention',
        'Dashboard + API Access',
        'Priority Support Window',
      ],
    },
    {
      id: '3',
      name: 'Enterprise Command',
      type: 'monthly',
      price: 'Get Quote',
      features: [
        'Multi-Site Camera Federation',
        'Advanced ReID + LPR Workflows',
        '90-Day Event Retention',
        'SIEM / SOC Integration',
        'Dedicated Solution Architect',
      ],
    },
    {
      id: '4',
      name: 'Sovereign Ops',
      type: 'monthly',
      price: 'Get Quote',
      features: [
        'City-Scale Distributed Deployment',
        'Air-Gapped Environment Support',
        'Custom Model Lifecycle Program',
        '24/7 Incident Escalation',
        'Compliance and Audit Package',
      ],
    },
    {
      id: '5',
      name: 'Starter Monitor',
      type: 'quarterly',
      price: 'Get Quote',
      features: [
        'Up to 8 Camera Streams',
        'Shoplifting and Intrusion Detection',
        '7-Day Event Retention',
        'Quarterly Health Review',
        'Email Alert Routing',
      ],
    },
    {
      id: '6',
      name: 'Growth Control',
      type: 'quarterly',
      price: 'Get Quote',
      features: [
        'Up to 30 Camera Streams',
        'Behavior Analytics and Zone Rules',
        '30-Day Event Retention',
        'Quarterly Optimization Workshop',
        'Dashboard + API Access',
      ],
    },
    {
      id: '7',
      name: 'Enterprise Command',
      type: 'quarterly',
      price: 'Get Quote',
      features: [
        'Multi-Site Camera Federation',
        'Advanced ReID + LPR Workflows',
        '90-Day Event Retention',
        'Quarterly Threat Review',
        'Dedicated Solution Architect',
      ],
    },
    {
      id: '8',
      name: 'Sovereign Ops',
      type: 'quarterly',
      price: 'Get Quote',
      features: [
        'City-Scale Distributed Deployment',
        'Air-Gapped Environment Support',
        'Custom Model Lifecycle Program',
        '24/7 Incident Escalation',
        'Compliance and Audit Package',
      ],
    },
    {
      id: '9',
      name: 'Starter Monitor',
      type: 'yearly',
      price: 'Get Quote',
      features: [
        'Up to 8 Camera Streams',
        'Shoplifting and Intrusion Detection',
        '7-Day Event Retention',
        'Annual Deployment Audit',
        'Email Alert Routing',
      ],
    },
    {
      id: '10',
      name: 'Growth Control',
      type: 'yearly',
      price: 'Get Quote',
      features: [
        'Up to 30 Camera Streams',
        'Behavior Analytics and Zone Rules',
        '30-Day Event Retention',
        'Annual Optimization Roadmap',
        'Dashboard + API Access',
      ],
    },
    {
      id: '11',
      name: 'Enterprise Command',
      type: 'yearly',
      price: 'Get Quote',
      features: [
        'Multi-Site Camera Federation',
        'Advanced ReID + LPR Workflows',
        '90-Day Event Retention',
        'Annual Security Program Review',
        'Dedicated Solution Architect',
      ],
    },
    {
      id: '12',
      name: 'Sovereign Ops',
      type: 'yearly',
      price: 'Get Quote',
      features: [
        'City-Scale Distributed Deployment',
        'Air-Gapped Environment Support',
        'Custom Model Lifecycle Program',
        '24/7 Incident Escalation',
        'Compliance and Audit Package',
      ],
    },
  ],
  industries: defaultIndustries,
  media: mediaDefaults,
};

const withLocalSyncMeta = (version: number) => ({
  contentVersion: version + 1,
  lastSyncedAt: new Date().toISOString(),
  lastSyncSource: 'local' as const,
});

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...defaultContent,
      contentVersion: 1,
      lastSyncedAt: null,
      lastSyncSource: 'local',
      updateCompanyDetails: (data) =>
        set((state) => ({
          ...data,
          ...withLocalSyncMeta(state.contentVersion),
        })),
      updateTeam: (team) =>
        set((state) => ({
          team: normalizeTeamMembers(team),
          ...withLocalSyncMeta(state.contentVersion),
        })),
      updateProducts: (products) =>
        set((state) => ({
          products: normalizeProducts(products),
          ...withLocalSyncMeta(state.contentVersion),
        })),
      updatePlans: (plans) =>
        set((state) => ({
          plans,
          ...withLocalSyncMeta(state.contentVersion),
        })),
      updateIndustries: (industries) =>
        set((state) => ({
          industries,
          ...withLocalSyncMeta(state.contentVersion),
        })),
      updateMedia: (media) =>
        set((state) => ({
          media: normalizeSiteMedia({ ...state.media, ...media }),
          ...withLocalSyncMeta(state.contentVersion),
        })),
      replaceSiteContent: (content, meta) =>
        set((state) => {
          const incomingVersion = typeof meta?.version === 'number' ? meta.version : state.contentVersion + 1;
          return {
            companyName: content.companyName ?? state.companyName,
            tagline: content.tagline ?? state.tagline,
            vision: content.vision ?? state.vision,
            mission: content.mission ?? state.mission,
            aboutText: content.aboutText ?? state.aboutText,
            contactEmail: content.contactEmail ?? state.contactEmail,
            contactPhone: content.contactPhone ?? state.contactPhone,
            contactAddress: content.contactAddress ?? state.contactAddress,
            team: content.team ? normalizeTeamMembers(content.team) : state.team,
            products: content.products ? normalizeProducts(content.products) : state.products,
            plans: content.plans ?? state.plans,
            industries: content.industries ?? state.industries,
            media: content.media ? normalizeSiteMedia({ ...state.media, ...content.media }) : state.media,
            contentVersion: Math.max(incomingVersion, state.contentVersion),
            lastSyncedAt: meta?.updatedAt ?? new Date().toISOString(),
            lastSyncSource: meta?.source ?? 'remote',
          };
        }),
      getSiteContent: () => {
        const state = get();
        return {
          companyName: state.companyName,
          tagline: state.tagline,
          vision: state.vision,
          mission: state.mission,
          aboutText: state.aboutText,
          contactEmail: state.contactEmail,
          contactPhone: state.contactPhone,
          contactAddress: state.contactAddress,
          team: state.team,
          products: state.products,
          plans: state.plans,
          industries: state.industries,
          media: state.media,
        };
      },
    }),
    {
      name: 'eyespot-storage-v10',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Partial<AppState>;
        return {
          ...state,
          team: normalizeTeamMembers(Array.isArray(state.team) ? state.team : defaultContent.team),
          products: normalizeProducts(Array.isArray(state.products) ? state.products : defaultContent.products),
          media: normalizeSiteMedia(state.media ? { ...mediaDefaults, ...state.media } : mediaDefaults),
        };
      },
      partialize: (state) => ({
        companyName: state.companyName,
        tagline: state.tagline,
        vision: state.vision,
        mission: state.mission,
        aboutText: state.aboutText,
        contactEmail: state.contactEmail,
        contactPhone: state.contactPhone,
        contactAddress: state.contactAddress,
        team: state.team,
        products: state.products,
        plans: state.plans,
        industries: state.industries,
        media: state.media,
        contentVersion: state.contentVersion,
        lastSyncedAt: state.lastSyncedAt,
        lastSyncSource: state.lastSyncSource,
      }),
    }
  )
);
