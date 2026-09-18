"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  EyeOffIcon,
  GripVerticalIcon,
  ImageIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
  AlertCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageUploadField } from "@/components/admin/image-upload-field";

interface DirectionItem {
  id: number;
  title: string;
  description: string;
  photoUrl: string | null;
  visible: boolean;
}

interface CategoryItem {
  id: number;
  title: string;
  visible: boolean;
  directions: DirectionItem[];
}

interface DirectionsEditorProps {
  initial: CategoryItem[];
}

type DragState =
  | { list: "category"; index: number }
  | { list: "direction"; categoryIndex: number; index: number }
  | null;

type ModalState =
  | null
  | {
      categoryIndex: number;
      directionIndex: number | null;
      title: string;
      description: string;
      photoUrl: string;
    };

let tempId = -1;
const nextTempId = () => tempId-- - 1;

function serialize(data: CategoryItem[]): string {
  return JSON.stringify(
    data.map((c) => ({
      title: c.title,
      visible: c.visible,
      directions: c.directions.map((d) => ({
        title: d.title,
        description: d.description,
        photoUrl: d.photoUrl ?? "",
        visible: d.visible,
      })),
    }))
  );
}

export function DirectionsEditor({ initial }: DirectionsEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<CategoryItem[]>(initial);
  const [drag, setDrag] = useState<DragState>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => serialize(draft) !== serialize(initial), [draft, initial]);

  useEffect(() => {
    if (!dirty) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  const mutate = (updater: (data: CategoryItem[]) => CategoryItem[]) => {
    setDraft((current) => updater(current.map((c) => ({ ...c, directions: [...c.directions] }))));
  };

  const moveCategory = (from: number, to: number) => {
    mutate((data) => {
      if (to < 0 || to >= data.length) return data;
      const copy = [...data];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const moveDirection = (catIndex: number, from: number, to: number) => {
    mutate((data) => {
      const category = data[catIndex];
      if (!category || to < 0 || to >= category.directions.length) return data;
      const directions = [...category.directions];
      const [item] = directions.splice(from, 1);
      directions.splice(to, 0, item);
      data[catIndex] = { ...category, directions };
      return data;
    });
  };

  const addCategory = () => {
    mutate((data) => [...data, { id: nextTempId(), title: "Новая категория", visible: true, directions: [] }]);
  };

  const removeCategory = (catIndex: number) => {
    const category = draft[catIndex];
    if (!category) return;
    const suffix =
      category.directions.length > 0 ? ` вместе с ${category.directions.length} направлениями` : "";
    if (!confirm(`Удалить категорию «${category.title}»${suffix}?`)) return;
    mutate((data) => data.filter((_, i) => i !== catIndex));
  };

  const addDirection = (catIndex: number) => {
    setModal({
      categoryIndex: catIndex,
      directionIndex: null,
      title: "",
      description: "",
      photoUrl: "",
    });
  };

  const removeDirection = (catIndex: number, dirIndex: number) => {
    const direction = draft[catIndex]?.directions[dirIndex];
    if (!direction || !confirm(`Удалить направление «${direction.title}»?`)) return;
    mutate((data) => {
      data[catIndex] = {
        ...data[catIndex],
        directions: data[catIndex].directions.filter((_, i) => i !== dirIndex),
      };
      return data;
    });
  };

  const applyModal = () => {
    if (!modal) return;
    const { categoryIndex, directionIndex, title, description, photoUrl } = modal;
    mutate((data) => {
      const category = data[categoryIndex];
      if (!category) return data;
      if (directionIndex === null) {
        category.directions = [
          ...category.directions,
          { id: nextTempId(), title: title.trim(), description: description.trim(), photoUrl: photoUrl.trim() || null, visible: true },
        ];
      } else {
        category.directions = category.directions.map((d, i) =>
          i === directionIndex
            ? { ...d, title: title.trim(), description: description.trim(), photoUrl: photoUrl.trim() || null }
            : d
        );
      }
      data[categoryIndex] = { ...category };
      return data;
    });
    setModal(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/content/directions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: draft }),
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
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-background p-6 shadow-inner">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-display text-xl font-semibold">Направления студии</p>
          <Button variant="outline" size="sm" onClick={addCategory}>
            <PlusIcon className="size-4" />
            Категория
          </Button>
        </div>

        <div className="space-y-10">
          {draft.map((category, catIndex) => (
            <section
              key={category.id}
              draggable
              onDragStart={() => setDrag({ list: "category", index: catIndex })}
              onDragEnd={() => setDrag(null)}
              onDragOver={(e) => {
                if (drag?.list === "category") e.preventDefault();
              }}
              onDrop={(e) => {
                if (drag?.list === "category") {
                  e.preventDefault();
                  moveCategory(drag.index, catIndex);
                  setDrag(null);
                }
              }}
              className={cn(
                "group/cat rounded-2xl border bg-card p-5",
                drag?.list === "category" && drag.index === catIndex && "opacity-50"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <GripVerticalIcon
                  aria-hidden
                  className="size-5 cursor-grab text-muted-foreground/40 active:cursor-grabbing"
                />
                <input
                  type="text"
                  value={category.title}
                  onChange={(e) =>
                    mutate((data) => {
                      data[catIndex] = { ...data[catIndex], title: e.target.value };
                      return data;
                    })
                  }
                  className="min-w-0 flex-1 border-none bg-transparent font-display text-2xl font-semibold outline-none focus:underline focus:decoration-primary/40"
                />
                {!category.visible && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    скрыта
                  </span>
                )}
                <div className="flex items-center gap-0.5">
                  <IconButton
                    label={category.visible ? "Скрыть категорию" : "Показать категорию"}
                    onClick={() =>
                      mutate((data) => {
                        data[catIndex] = { ...data[catIndex], visible: !data[catIndex].visible };
                        return data;
                      })
                    }
                  >
                    {category.visible ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                  </IconButton>
                  <IconButton label="Удалить категорию" danger onClick={() => removeCategory(catIndex)}>
                    <Trash2Icon className="size-4" />
                  </IconButton>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {category.directions.map((direction, dirIndex) => (
                  <article
                    key={direction.id}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDrag({ list: "direction", categoryIndex: catIndex, index: dirIndex });
                    }}
                    onDragEnd={() => setDrag(null)}
                    onDragOver={(e) => {
                      if (drag?.list === "direction") e.preventDefault();
                    }}
                    onDrop={(e) => {
                      if (drag?.list === "direction") {
                        e.preventDefault();
                        e.stopPropagation();
                        if (drag.categoryIndex === catIndex) {
                          moveDirection(catIndex, drag.index, dirIndex);
                        }
                        setDrag(null);
                      }
                    }}
                    className={cn(
                      "group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border bg-muted/40 transition-colors hover:border-primary/40",
                      !direction.visible && "opacity-50",
                      drag?.list === "direction" &&
                        drag.categoryIndex === catIndex &&
                        drag.index === dirIndex &&
                        "opacity-40"
                    )}
                    onClick={() =>
                      setModal({
                        categoryIndex: catIndex,
                        directionIndex: dirIndex,
                        title: direction.title,
                        description: direction.description,
                        photoUrl: direction.photoUrl ?? "",
                      })
                    }
                  >
                    <GripVerticalIcon
                      aria-hidden
                      className="absolute left-2 top-2 z-10 size-4 cursor-grab text-white/70 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {direction.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={direction.photoUrl}
                        alt={direction.title}
                        className="absolute inset-0 size-full object-cover"
                        draggable={false}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                        <ImageIcon className="size-10" />
                      </div>
                    )}
                    <div
                      className="absolute right-2 top-2 z-10 flex gap-0.5 rounded-full bg-background/85 p-0.5 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {iconButton(
                        direction.visible ? "Скрыть" : "Показать",
                        () =>
                          mutate((data) => {
                            const cat = data[catIndex];
                            cat.directions = cat.directions.map((d, i) =>
                              i === dirIndex ? { ...d, visible: !d.visible } : d
                            );
                            data[catIndex] = { ...cat };
                            return data;
                          }),
                        direction.visible ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />
                      )}
                      {iconButton("Удалить", () => removeDirection(catIndex, dirIndex), <Trash2Icon className="size-4" />, true)}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 via-white/70 to-transparent px-3 pb-3 pt-10">
                      <h4 className="text-sm font-semibold leading-snug text-foreground">
                        {direction.title}
                      </h4>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {direction.description}
                      </p>
                    </div>
                  </article>
                ))}

                <button
                  type="button"
                  onClick={() => addDirection(catIndex)}
                  className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground/70 transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <PlusIcon className="size-6" />
                  <span className="text-sm">Направление</span>
                </button>
              </div>
            </section>
          ))}

          <button
            type="button"
            onClick={addCategory}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed py-8 text-muted-foreground/70 transition-colors hover:border-primary/50 hover:text-primary"
          >
            <PlusIcon className="size-6" />
            <span className="text-sm">Добавить категорию</span>
          </button>
        </div>
      </div>

      {modal && (
        <DirectionModal
          value={modal}
          isNew={modal.directionIndex === null}
          busy={saving}
          onChange={(next) => setModal(next)}
          onClose={() => setModal(null)}
          onApply={applyModal}
        />
      )}

      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur">
          <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm text-muted-foreground">Есть несохранённые изменения</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={reset} disabled={saving}>
                Отменить
              </Button>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? "Сохраняем…" : "Сохранить изменения"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "rounded-full p-1.5 text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground",
        danger && "hover:text-destructive"
      )}
    >
      {children}
    </button>
  );
}

function DirectionModal({
  value,
  isNew,
  busy,
  onChange,
  onClose,
  onApply,
}: {
  value: NonNullable<ModalState>;
  isNew: boolean;
  busy: boolean;
  onChange: (next: NonNullable<ModalState>) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const valid = value.title.trim().length >= 2 && value.description.trim().length >= 10;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-card p-6 shadow-2xl md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">
            {isNew ? "Новое направление" : "Редактирование направления"}
          </h3>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground/70 hover:bg-accent hover:text-foreground"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <ImageUploadField
            value={value.photoUrl}
            onChange={(photoUrl) => onChange({ ...value, photoUrl })}
            prefix="directions"
            ratio="3/4"
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Название</span>
            <input
              type="text"
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
              placeholder="Например: Stretching"
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Описание</span>
            <textarea
              value={value.description}
              onChange={(e) => onChange({ ...value, description: e.target.value })}
              placeholder="Описание направления (10–2000 символов)"
              rows={4}
              className="resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Отмена
          </Button>
          <Button onClick={onApply} disabled={!valid}>
            Применить
          </Button>
        </div>
      </div>
    </div>
  );
}
