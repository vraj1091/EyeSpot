import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Plan { id: string; name: string; type: 'monthly' | 'quarterly' | 'yearly'; price: string; features: string[]; }
export interface Product { id: string; name: string; description: string; longDescription: string; features: string[]; iconIndex?: number; }
export interface TeamMember { id: string; name: string; role: string; slogan: string; details: string; }

interface AppState {
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
  
  updateCompanyDetails: (data: Partial<Pick<AppState, 'companyName' | 'tagline' | 'vision' | 'mission' | 'aboutText' | 'contactEmail' | 'contactPhone' | 'contactAddress'>>) => void;
  updateTeam: (team: TeamMember[]) => void;
  updateProducts: (products: Product[]) => void;
  updatePlans: (plans: Plan[]) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
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
          details: 'Pioneered EyeSpot\'s core vision. Expert in scaling AI enterprise infrastructure and spearheading strategic global deployments.' 
        },
        { 
          id: '2', 
          name: 'UTSAV GUPTA', 
          role: 'Chief Technology Officer', 
          slogan: '"Latency is the enemy of truth."', 
          details: 'Architect of the zero-latency neural inference engine. Holds multiple optimizations accelerating spatial-temporal convolutional networks on edge hardware.' 
        },
        { 
          id: '3', 
          name: 'SANDIP RANGALIYA', 
          role: 'Core AI Engineer', 
          slogan: '"Data never lies."', 
          details: 'Specializes in behavioral biometrics and unstructured data pipelines. Designed the proprietary Loitering & Intrusion algorithms operating at >99% accuracy.' 
        }
      ],
      products: [
        { 
          id: '1', 
          name: 'Predictive Shoplifting', 
          description: 'Tracks localized skeletal movement vectors to identify concealment gestures before merchandise leaves the shelf.', 
          longDescription: 'Our flagship predictive module utilizes an advanced skeleton-tracking heuristic combined with object-interaction recognition. By analyzing the micro-movements associated with item grabbing and concealment, EyeSpot accurately triggers an actionable alert literally before the suspect exits the premises.',
          features: ['Skeletal Vector Analysis', 'Real-time Object Interaction Matching', 'Concealment Confidence Scoring'],
          iconIndex: 0 
        },
        { 
          id: '2', 
          name: 'Perimeter Intrusion', 
          description: 'Draw infinite virtual tripwires with autonomous PTZ tracking upon breach detection.', 
          longDescription: 'Establish military-grade virtual perimeters instantly. Our intrusion engine distinguishes between harmless environmental movement (animals, shadows, wind) and actual human or vehicular threats with zero false positives. It automatically syncs with Pan-Tilt-Zoom (PTZ) cameras to track the intruder hands-free.',
          features: ['Infinite Virtual Boundaries', 'Autonomous PTZ Handoff', 'Zero False Positives via Object Classification'],
          iconIndex: 1 
        },
        { 
          id: '3', 
          name: 'Cognitive ReID Mapping', 
          description: 'Maintains unique identification of targets across hundreds of unconnected camera streams.', 
          longDescription: 'Person Re-Identification (ReID) across blind spots without using facial recognition. By analyzing clothing texture, gait, and macroscopic behavior, our AI can persist a physical profile across a massive campus composed of disparate, overlapping, or totally separated camera feeds.',
          features: ['Non-Facial Re-Identification', 'Cross-Camera Spatial Tracking', 'Historical Route Tracing'],
          iconIndex: 2 
        },
        { 
          id: '4', 
          name: 'Thermal Fusion', 
          description: 'Thermal-fusion overlays allowing zero-light detection of anomalies in critical infrastructure.', 
          longDescription: 'Designed for absolute pitch-black environments. EyeSpot merges thermal metadata with optical sensors to provide a unified threat view. Ideal for vast power grids, server farms, and borders, ensuring that no organic or mechanical heat signature goes unnoticed.',
          features: ['Multispectral Data Fusion', 'Pitch-Black Anomaly Detection', 'Equipment Overheat Pre-Alerts'],
          iconIndex: 3 
        },
        { 
          id: '5', 
          name: 'Autonomous Checkout', 
          description: 'Grab-and-go analytics correlating object interaction for frictionless retail.', 
          longDescription: 'Redefining the shopping experience by mapping products taken directly off shelves to a customer\'s virtual cart using vision alone. Forget scanning. Walk in, grab what you need, and walk out. Our multi-angle camera triangulation engine ensures billing accuracy.',
          features: ['No-Barcode Grasp Verification', 'Crowd-Occlusion Resistant', 'Instantaneous Billing Sync'],
          iconIndex: 4 
        },
        { 
          id: '6', 
          name: 'Velocity LPR', 
          description: 'Captures and cross-references plates at 150mph with instant criminal database matching.', 
          longDescription: 'A robust Automatic License Plate Recognition (ALPR) system engineered to capture plates at extreme speeds and terrible lighting. It instantly cross-references read characters against local hotlists and criminal databases, notifying authorities covertly within milliseconds.',
          features: ['150mph High-Speed Capture', 'Sub-Optimal Weather Correction', 'Instant Database Cross-Referencing'],
          iconIndex: 5 
        },
        { 
          id: '7', 
          name: 'Custom Model Training', 
          description: 'Personalized AI modeling. We ingest your proprietary video data and train bespoke logic models for highly specific use cases.', 
          longDescription: 'Do you have a use case that doesn\'t fit standard security protocols? EyeSpot\'s dedicated data science team will build, annotate, and train a fully personalized neural pathway. From factory defect detection to highly specific compliance monitoring, we build AI tailored exclusively to your visual environment.',
          features: ['Proprietary Data Ingestion & Annotation', 'Hyper-Parameter Fine Tuning', 'White-Glove Deployment & Inference Hardware Setup'],
          iconIndex: 0 
        },
      ],
      plans: [
        { id: '1', name: 'Standard Node', type: 'monthly', price: '$199', features: ['Up to 5 Cameras', 'Base Detections', 'Standard Support'] },
        { id: '2', name: 'Starter', type: 'monthly', price: '$899', features: ['Up to 25 Cameras', 'Core Anomaly Detection', '14-Day Vector Retention', 'Email Support'] },
        { id: '3', name: 'Grid', type: 'monthly', price: '$4,500', features: ['Unlimited AI Nodes', 'Full Behavioral Suite', 'API Interconnectivity', 'Dedicated AI Architect'] },
        { id: '4', name: 'Sovereign', type: 'monthly', price: 'Custom', features: ['City-Wide Grid', 'Air-Gapped Ops', 'Custom Model Training Access', '24/7 Red-Team Support'] },
        
        { id: '5', name: 'Standard Node', type: 'quarterly', price: '$540', features: ['Up to 5 Cameras', 'Base Detections', 'Standard Support'] },
        { id: '6', name: 'Starter', type: 'quarterly', price: '$2,400', features: ['Up to 25 Cameras', 'Core Anomaly Detection', '14-Day Vector Retention', 'Email Support'] },
        { id: '7', name: 'Grid', type: 'quarterly', price: '$12,000', features: ['Unlimited AI Nodes', 'Full Behavioral Suite', 'API Interconnectivity', 'Dedicated AI Architect'] },
        { id: '8', name: 'Sovereign', type: 'quarterly', price: 'Custom', features: ['City-Wide Grid', 'Air-Gapped Ops', 'Custom Model Training Access', '24/7 Red-Team Support'] },
        
        { id: '9', name: 'Standard Node', type: 'yearly', price: '$1,900', features: ['Up to 5 Cameras', 'Base Detections', 'Standard Support'] },
        { id: '10', name: 'Starter', type: 'yearly', price: '$8,990', features: ['Up to 25 Cameras', 'Core Anomaly Detection', '14-Day Vector Retention', 'Priority Phone Support'] },
        { id: '11', name: 'Grid', type: 'yearly', price: '$45,000', features: ['Unlimited AI Nodes', 'Full Behavioral Suite', 'API Interconnectivity', 'On-Site Integration'] },
        { id: '12', name: 'Sovereign', type: 'yearly', price: 'Custom', features: ['City-Wide Grid', 'Air-Gapped Ops', 'Custom Model Training Included', 'Hardware Provisioning'] }
      ],
      updateCompanyDetails: (data) => set((state) => ({ ...state, ...data })),
      updateTeam: (team) => set({ team }),
      updateProducts: (products) => set({ products }),
      updatePlans: (plans) => set({ plans }),
    }),
    {
      name: 'eyespot-storage-v7', // Bump version forcefully
    }
  )
);
