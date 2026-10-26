import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/modules/auth";
import { listAssets, SLOTS, slotAssignments } from "@/modules/media";
import { type AssetView, MediaManager, type SlotView } from "@/modules/media/ui/media-manager";
import { MEDIA, type MediaKey } from "@/shared/content/media";
import { PanelHeader, PanelSkeleton } from "../../_componentes/panel-header";

export const metadata: Metadata = { title: "Imágenes" };

export default function ImagenesPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Manager />
    </Suspense>
  );
}

async function Manager() {
  await requireUser("media.edit");
  const [assets, assigned] = await Promise.all([listAssets(), slotAssignments()]);
  const byId = new Map(assets.map((a) => [a.id, a]));

  // lectura directa, sin caché: el panel siempre ve el estado real
  const slots: SlotView[] = (Object.keys(SLOTS) as MediaKey[]).map((key) => {
    const asset = byId.get(assigned.get(key)?.assetId ?? "");
    return {
      key,
      current: asset ? { src: asset.src, alt: asset.alt } : { src: MEDIA[key].src, alt: MEDIA[key].alt },
      custom: Boolean(asset),
    };
  });
  const library: AssetView[] = assets.map((a) => ({
    id: a.id,
    src: a.src,
    alt: a.alt,
    width: a.width,
    height: a.height,
    bytes: a.bytes,
    originalName: a.originalName,
    createdAt: a.createdAt,
    createdBy: a.createdBy,
    usedIn: a.usedIn,
    creditAuthor: a.creditAuthor,
    creditSource: a.creditSource,
    creditUrl: a.creditUrl,
    creditLicense: a.creditLicense,
  }));

  return (
    <>
      <PanelHeader
        title="Imágenes"
        lede="Cada espacio es un lugar del sitio. Al cambiar su imagen, cambia en todas las páginas donde aparece. Las imágenes se ajustan, comprimen y limpian de datos de ubicación al subirse."
      />
      <MediaManager slots={slots} assets={library} />
    </>
  );
}
