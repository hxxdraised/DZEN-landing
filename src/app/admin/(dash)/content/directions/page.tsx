import { getDirectionsAdmin } from "@/lib/content";
import { DirectionsEditor } from "@/components/admin/directions-editor";

export const metadata = {
  title: "Направления · Админ-панель",
  robots: { index: false, follow: false },
};

export default async function AdminContentDirectionsPage() {
  const categories = await getDirectionsAdmin();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Направления</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">
        Категории и карточки направлений на странице сайта. Изменения появляются на сайте сразу
        после сохранения.
      </p>
      <DirectionsEditor
        initial={categories.map((c) => ({
          id: c.id,
          title: c.title,
          visible: c.visible,
          directions: c.directions.map((d) => ({
            id: d.id,
            title: d.title,
            description: d.description,
            photoUrl: d.photoUrl,
            visible: d.visible,
          })),
        }))}
      />
    </div>
  );
}
