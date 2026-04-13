import { AssetTrackerView } from "@/components/tracker/AssetTrackerView";

export default function TrackerPcPage() {
  return (
    <AssetTrackerView
      deviceFamily="PC"
      title="Tracker PC"
      description="Lihat asset PC dan history user yang pernah menggunakannya."
    />
  );
}
