import { getTeamAdmin } from "@/lib/content";
import { TeamEditor } from "@/components/admin/team-editor";

export const metadata = {
  title: "Команда · Админ-панель",
  robots: { index: false, follow: false },
};

export default async function AdminContentTeamPage() {
  const members = await getTeamAdmin();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Команда</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">
        Карточки тренеров на страницах «Команда» и «О нас». Изменения появляются на сайте сразу
        после сохранения.
      </p>
      <TeamEditor
        initial={members.map((m) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          groupSpecializations: m.groupSpecializations,
          personalSpecializations: m.personalSpecializations,
          philosophy: m.philosophy,
          experience: m.experience,
          education: m.education,
          photoUrl: m.photoUrl,
          visible: m.visible,
        }))}
      />
    </div>
  );
}
