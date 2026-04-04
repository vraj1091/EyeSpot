# EyeSpot Video Analytics: Real-World Use Case & Proof

## **Scenario 1: Retail Loss Prevention (Shoplifting)**
- **The Event:** A customer wearing a large coat enters an aisle known for high-shrink electronics.
- **The Engine Tracking:** EyeSpot immediately tracks the person using ByteTrack, mapping them frame-by-frame.
- **The Event Trigger:** The subject looks rapidly around (pose tracking), then initiates a fast concealment motion into the coat. Object tracking loses the item while pose tracking registers the suspicious limb path.
- **The Proof Alert:** The LP officer receives a push alert: "CRITICAL: Concealment detected on Camera 4. Suspect in blue jacket." The LP officer approaches before the suspect exits the store.
*(Internal Documentation: Note that this use-case completely eliminates "door-alarm" reactions, shifting action to the exact point of the incident).*

## **Scenario 2: Retail Queue Optimization**
- **The Event:** The checkout queue extends past a pre-defined threshold area.
- **The Engine Tracking:** Zone tracking logs `count > 5` people stagnant within the "Checkout Area" bounding box for 120 seconds.
- **The Proof Alert:** Store manager receives a notification: "WARNING: High queue density. Open Register 3." Customer satisfaction is upheld automatically.

## **Scenario 3: Corporate Policy / Safety (Phone Usage)**
- **The Event:** An employee operating a forklift in an industrial warehouse pulls out a mobile phone.
- **The Engine Tracking:** YOLOv8 identifies `person` and `cell phone` intersecting with high probability in a designated safety zone.
- **The Proof Alert:** A timestamped snapshot is instantly logged for the site safety manager, reading: "SAFETY BREACH: Phone usage in restricted equipment zone."
