import { AssetTrackerView } from "@/components/tracker/AssetTrackerView";

export default function TrackerLaptopPage() {
  return (
    <AssetTrackerView
      deviceFamily="LAPTOP"
      title="Tracker Laptop"
      description="Lihat asset laptop dan riwayat user yang pernah memakainya."
    />
  );
}
