"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  EyeOffIcon,
  GripVerticalIcon,
  ImageIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  EditorIconButton,
  ModalShell,
  SaveBar,
  useUnloadGuard,
} from "@/components/admin/editor-shared";
import { ImageUploadField } from "@/components/admin/image-upload-field";

interface MemberItem {
  id: number;
  name: string;
  role: string;
  groupSpecializations: string[];
  personalSpecializations: string[];
  philosophy: string;
  experience: string;
  education: string[];
  photoUrl: string | null;
  visible: boolean;
}

interface TeamEditorProps {
  initial: MemberItem[];
}

type ModalState = null | (Omit<MemberItem, "visible" | "photoUrl" | "id"> & {
  photoUrl: string;
}) & {
  index: number | null;
};

let tempId = -1;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function serialize(data: MemberItem[]): string {
  return JSON.stringify(
    data.map((m) => ({
      name: m.name,
      role: m.role,
      group: m.groupSpecializations,
      personal: m.personalSpecializations,
      philosophy: m.philosophy,
      experience: m.experience,
      education: m.education,
      photoUrl: m.photoUrl ?? "",
      visible: m.visible,
    }))
  );
}

export function TeamEditor({ initial }: TeamEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<MemberItem[]>(initial);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => serialize(draft) !== serialize(initial), [draft, initial]);
  useUnloadGuard(dirty);

  const mutate = (updater: (data: MemberItem[]) => MemberItem[]) => setDraft(updater);

  const move = (from: number, to: number) => {
    mutate((data) => {
      if (to < 0 || to >= data.length) return data;
      const copy = [...data];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const remove = (index: number) => {
    const member = draft[index];
    if (!member || !confirm(`Удалить тренера «${member.name}»?`)) return;
    mutate((data) => data.filter((_, i) => i !== index));
  };

  const applyModal = () => {
    if (!modal) return;
    const { index, ...fields } = modal;
    mutate((data) => {
      if (index === null) return [...data, { ...fields, id: tempId--, visible: true }];
      return data.map((m, i) => (i === index ? { ...m, ...fields } : m));
    });
    setModal(null);
  };

  const save = async () => {
    if (draft.length === 0) {
      setError("Нельзя сохранить пустую команду — добавьте хотя бы одного тренера");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/content/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: draft }),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!response.ok || !data?.ok) {
        setError(data?.error ?? "Не удалось сохранить");
        return;
      }
      router.refresh();
    } catch {
      setError("Нет соединения с сервером");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (!dirty || confirm("Отменить все несохранённые изменения?")) {
      setDraft(initial);
      setError(null);
    }
  };

  return (
    <div className="pb-28">
      {error && (
        <p className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="rounded-2xl bg-background p-6 shadow-inner">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-display text-xl font-semibold">Команда студии</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setModal({
                index: null,
                name: "",
                role: "Тренер",
                groupSpecializations: [],
                personalSpecializations: [],
                philosophy: "",
                experience: "",
                education: [],
                photoUrl: "",
              })
            }
          >
            <PlusIcon className="size-4" />
            Тренер
          </Button>
        </div>

        <div className="grid items-start gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {draft.map((member, index) => (
            <div
              key={member.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(e) => dragIndex !== null && e.preventDefault()}
              onDrop={(e) => {
                if (dragIndex !== null) {
                  e.preventDefault();
                  move(dragIndex, index);
                  setDragIndex(null);
                }
              }}
              className={cn(
                "group cursor-pointer overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/40",
                !member.visible && "opacity-50",
                dragIndex === index && "opacity-40"
              )}
              onClick={() =>
                setModal({
                  index,
                  name: member.name,
                  role: member.role,
                  groupSpecializations: member.groupSpecializations,
                  personalSpecializations: member.personalSpecializations,
                  philosophy: member.philosophy,
                  experience: member.experience,
                  education: member.education,
                  photoUrl: member.photoUrl ?? "",
                })
              }
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/40">
                <GripVerticalIcon
                  aria-hidden
                  className="absolute left-2 top-2 z-10 size-4 cursor-grab text-white/70 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                  onClick={(e) => e.stopPropagation()}
                />

                {member.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="absolute inset-0 size-full object-cover"
                    draggable={false}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-24 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground/60">
                      {initials(member.name) || "?"}
                    </span>
                  </div>
                )}

                <div
                  className="absolute right-2 top-2 z-10 flex gap-0.5 rounded-full bg-background/85 p-0.5 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EditorIconButton
                    label={member.visible ? "Скрыть" : "Показать"}
                    onClick={() =>
                      mutate((data) =>
                        data.map((m, i) => (i === index ? { ...m, visible: !m.visible } : m))
                      )
                    }
                  >
                    {member.visible ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                  </EditorIconButton>
                  <EditorIconButton label="Удалить" danger onClick={() => remove(index)}>
                    <Trash2Icon className="size-4" />
                  </EditorIconButton>
                </div>

                <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-xl bg-card/95 px-3 py-2 shadow-md backdrop-blur-sm">
                  <h4 className="text-sm font-semibold leading-snug text-foreground">{member.name}</h4>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">{member.role}</p>
                </div>
              </div>

              <div className="p-3">
                <div className="flex flex-wrap gap-1.5">
                  {member.groupSpecializations.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {member.personalSpecializations.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                  {member.groupSpecializations.length + member.personalSpecializations.length > 5 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      +{member.groupSpecializations.length + member.personalSpecializations.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setModal({
                index: null,
                name: "",
                role: "Тренер",
                groupSpecializations: [],
                personalSpecializations: [],
                philosophy: "",
                experience: "",
                education: [],
                photoUrl: "",
              })
            }
            className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground/70 transition-colors hover:border-primary/50 hover:text-primary"
          >
            <PlusIcon className="size-6" />
            <span className="text-sm">Тренер</span>
          </button>
        </div>
      </div>

      {modal && (
        <MemberModal
          value={modal}
          isNew={modal.index === null}
          onChange={(next) => setModal(next)}
          onClose={() => setModal(null)}
          onApply={applyModal}
        />
      )}

      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} />
    </div>
  );
}

function MemberModal({
  value,
  isNew,
  onChange,
  onClose,
  onApply,
}: {
  value: NonNullable<ModalState>;
  isNew: boolean;
  onChange: (next: NonNullable<ModalState>) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  const valid =
    value.name.trim().length >= 2 &&
    value.role.trim().length >= 2 &&
    value.experience.trim().length >= 10;

  return (
    <ModalShell title={isNew ? "Новый тренер" : "Редактирование тренера"} onClose={onClose}>
      <div className="space-y-4">
        <ImageUploadField
          value={value.photoUrl}
          onChange={(photoUrl) => onChange({ ...value, photoUrl })}
          prefix="team"
          ratio="3/4"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">ФИО</span>
            <input
              type="text"
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
              autoFocus
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Роль</span>
            <input
              type="text"
              value={value.role}
              onChange={(e) => onChange({ ...value, role: e.target.value })}
              placeholder="Тренер / Основатель студии"
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            Направления в групповом расписании <span className="text-muted-foreground">(через запятую)</span>
          </span>
          <input
            type="text"
            value={value.groupSpecializations.join(", ")}
            onChange={(e) =>
              onChange({ ...value, groupSpecializations: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
            }
            className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            Персональные направления <span className="text-muted-foreground">(через запятую)</span>
          </span>
          <input
            type="text"
            value={value.personalSpecializations.join(", ")}
            onChange={(e) =>
              onChange({ ...value, personalSpecializations: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
            }
            className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Философия</span>
          <textarea
            value={value.philosophy}
            onChange={(e) => onChange({ ...value, philosophy: e.target.value })}
            rows={2}
            className="resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Опыт и подход</span>
          <textarea
            value={value.experience}
            onChange={(e) => onChange({ ...value, experience: e.target.value })}
            rows={3}
            className="resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            Образование и сертификации <span className="text-muted-foreground">(по строке на пункт)</span>
          </span>
          <textarea
            value={value.education.join("\n")}
            onChange={(e) =>
              onChange({ ...value, education: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })
            }
            rows={4}
            className="resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Отмена
        </Button>
        <Button onClick={onApply} disabled={!valid}>
          Применить
        </Button>
      </div>
    </ModalShell>
  );
}
