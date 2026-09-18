"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  EyeOffIcon,
  GripVerticalIcon,
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

interface PlanItem {
  id: number;
  name: string;
  label: string;
  details: string;
  audience: string;
  duration: string;
  fullPrice: number | null;
  discountPrice: number | null;
  ctaText: string;
  visible: boolean;
}

interface BlockItem {
  id: number;
  title: string;
  subtitle: string;
  note: string;
  visible: boolean;
  plans: PlanItem[];
}

interface PricingEditorProps {
  initial: BlockItem[];
}

type ModalState = null | {
  blockIndex: number;
  planIndex: number | null;
  plan: PlanItem;
};

type DragState =
  | { list: "block"; index: number }
  | { list: "plan"; blockIndex: number; index: number }
  | null;

let tempId = -1;

function price(value: number | null): string {
  if (value === null) return "—";
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

function serialize(data: BlockItem[]): string {
  return JSON.stringify(
    data.map((b) => ({
      title: b.title,
      subtitle: b.subtitle,
      note: b.note,
      visible: b.visible,
      plans: b.plans.map((p) => ({
        name: p.name,
        label: p.label,
        details: p.details,
        audience: p.audience,
        duration: p.duration,
        fullPrice: p.fullPrice,
        discountPrice: p.discountPrice,
        ctaText: p.ctaText,
        visible: p.visible,
      })),
    }))
  );
}

export function PricingEditor({ initial }: PricingEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<BlockItem[]>(initial);
  const [drag, setDrag] = useState<DragState>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => serialize(draft) !== serialize(initial), [draft, initial]);
  useUnloadGuard(dirty);

  const mutate = (updater: (data: BlockItem[]) => BlockItem[]) =>
    setDraft((current) => updater(current.map((b) => ({ ...b, plans: [...b.plans] }))));

  const moveBlock = (from: number, to: number) => {
    mutate((data) => {
      if (to < 0 || to >= data.length) return data;
      const copy = [...data];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const movePlan = (blockIndex: number, from: number, to: number) => {
    mutate((data) => {
      const block = data[blockIndex];
      if (!block || to < 0 || to >= block.plans.length) return data;
      const plans = [...block.plans];
      const [item] = plans.splice(from, 1);
      plans.splice(to, 0, item);
      data[blockIndex] = { ...block, plans };
      return data;
    });
  };

  const addBlock = () => {
    mutate((data) => [
      ...data,
      {
        id: tempId--,
        title: "Новый блок",
        subtitle: "",
        note: "",
        visible: true,
        plans: [],
      },
    ]);
  };

  const removeBlock = (blockIndex: number) => {
    const block = draft[blockIndex];
    if (!block || !confirm(`Удалить блок «${block.title}» вместе с тарифами?`)) return;
    mutate((data) => data.filter((_, i) => i !== blockIndex));
  };

  const removePlan = (blockIndex: number, planIndex: number) => {
    const plan = draft[blockIndex]?.plans[planIndex];
    if (!plan || !confirm(`Удалить тариф «${plan.name}»?`)) return;
    mutate((data) => {
      data[blockIndex] = {
        ...data[blockIndex],
        plans: data[blockIndex].plans.filter((_, i) => i !== planIndex),
      };
      return data;
    });
  };

  const openPlanModal = (blockIndex: number, planIndex: number | null) => {
    const plan =
      planIndex === null
        ? {
            id: tempId--,
            name: "",
            label: "",
            details: "",
            audience: "",
            duration: "",
            fullPrice: null,
            discountPrice: null,
            ctaText: "Записаться",
            visible: true,
          }
        : draft[blockIndex].plans[planIndex];
    setModal({ blockIndex, planIndex, plan });
  };

  const applyModal = () => {
    if (!modal) return;
    const { blockIndex, planIndex, plan } = modal;
    mutate((data) => {
      const block = data[blockIndex];
      if (!block) return data;
      if (planIndex === null) {
        data[blockIndex] = { ...block, plans: [...block.plans, plan] };
      } else {
        data[blockIndex] = {
          ...block,
          plans: block.plans.map((p, i) => (i === planIndex ? plan : p)),
        };
      }
      return data;
    });
    setModal(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/content/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocks: draft.map((b) => ({
            ...b,
            plans: b.plans.map((p) => ({
              ...p,
              fullPrice: p.fullPrice ?? 0,
              discountPrice: p.discountPrice,
            })),
          })),
        }),
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
          <p className="font-display text-xl font-semibold">Абонементы и цены</p>
          <Button variant="outline" size="sm" onClick={addBlock}>
            <PlusIcon className="size-4" />
            Блок
          </Button>
        </div>

        <div className="space-y-8">
          {draft.map((block, blockIndex) => (
            <section
              key={block.id}
              draggable
              onDragStart={() => setDrag({ list: "block", index: blockIndex })}
              onDragEnd={() => setDrag(null)}
              onDragOver={(e) => drag?.list === "block" && e.preventDefault()}
              onDrop={(e) => {
                if (drag?.list === "block") {
                  e.preventDefault();
                  moveBlock(drag.index, blockIndex);
                  setDrag(null);
                }
              }}
              className={cn(
                "rounded-2xl border bg-card p-5",
                !block.visible && "opacity-60",
                drag?.list === "block" && drag.index === blockIndex && "opacity-50"
              )}
            >
              <div className="flex items-start gap-2">
                <GripVerticalIcon
                  aria-hidden
                  className="mt-1.5 size-5 cursor-grab text-muted-foreground/40 active:cursor-grabbing"
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={block.title}
                    onChange={(e) =>
                      mutate((data) => {
                        data[blockIndex] = { ...data[blockIndex], title: e.target.value };
                        return data;
                      })
                    }
                    className="w-full border-none bg-transparent font-display text-2xl font-semibold outline-none focus:underline focus:decoration-primary/40"
                  />
                  <input
                    type="text"
                    value={block.subtitle}
                    onChange={(e) =>
                      mutate((data) => {
                        data[blockIndex] = { ...data[blockIndex], subtitle: e.target.value };
                        return data;
                      })
                    }
                    placeholder="Подзаголовок блока"
                    className="w-full border-none bg-transparent text-sm text-muted-foreground outline-none focus:underline focus:decoration-primary/40"
                  />
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <EditorIconButton
                    label={block.visible ? "Скрыть блок" : "Показать блок"}
                    onClick={() =>
                      mutate((data) => {
                        data[blockIndex] = { ...data[blockIndex], visible: !data[blockIndex].visible };
                        return data;
                      })
                    }
                  >
                    {block.visible ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                  </EditorIconButton>
                  <EditorIconButton label="Удалить блок" danger onClick={() => removeBlock(blockIndex)}>
                    <Trash2Icon className="size-4" />
                  </EditorIconButton>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {block.plans.map((plan, planIndex) => (
                  <article
                    key={plan.id}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDrag({ list: "plan", blockIndex, index: planIndex });
                    }}
                    onDragEnd={() => setDrag(null)}
                    onDragOver={(e) => drag?.list === "plan" && e.preventDefault()}
                    onDrop={(e) => {
                      if (drag?.list === "plan") {
                        e.preventDefault();
                        e.stopPropagation();
                        if (drag.blockIndex === blockIndex) {
                          movePlan(blockIndex, drag.index, planIndex);
                        }
                        setDrag(null);
                      }
                    }}
                    className={cn(
                      "group relative cursor-pointer rounded-xl border bg-card p-4 transition-colors hover:border-primary/40",
                      !plan.visible && "opacity-50",
                      drag?.list === "plan" &&
                        drag.blockIndex === blockIndex &&
                        drag.index === planIndex &&
                        "opacity-40"
                    )}
                    onClick={() => openPlanModal(blockIndex, planIndex)}
                  >
                    <GripVerticalIcon
                      aria-hidden
                      className="absolute right-2 top-2 z-10 size-4 cursor-grab text-foreground/30 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div
                      className="absolute left-2 top-2 z-10 flex gap-0.5 rounded-full bg-background/85 p-0.5 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EditorIconButton
                        label={plan.visible ? "Скрыть" : "Показать"}
                        onClick={() =>
                          mutate((data) => {
                            const b = data[blockIndex];
                            b.plans = b.plans.map((p, i) =>
                              i === planIndex ? { ...p, visible: !p.visible } : p
                            );
                            data[blockIndex] = { ...b };
                            return data;
                          })
                        }
                      >
                        {plan.visible ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                      </EditorIconButton>
                      <EditorIconButton label="Удалить" danger onClick={() => removePlan(blockIndex, planIndex)}>
                        <Trash2Icon className="size-4" />
                      </EditorIconButton>
                    </div>

                    <h4 className="pr-6 font-semibold">{plan.name}</h4>
                    {plan.label && <p className="mt-0.5 text-sm font-medium text-primary">{plan.label}</p>}
                    {plan.details && (
                      <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{plan.details}</p>
                    )}
                    <div className="mt-2 space-y-0.5">
                      {plan.discountPrice !== null && (
                        <p className="text-xs text-muted-foreground line-through">
                          {price(plan.fullPrice)}
                        </p>
                      )}
                      <p className="text-lg font-semibold">{price(plan.discountPrice ?? plan.fullPrice)}</p>
                    </div>
                    {plan.duration && (
                      <p className="mt-1 text-xs text-muted-foreground">{plan.duration}</p>
                    )}
                  </article>
                ))}

                <button
                  type="button"
                  onClick={() => openPlanModal(blockIndex, null)}
                  className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground/70 transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <PlusIcon className="size-6" />
                  <span className="text-sm">Тариф</span>
                </button>
              </div>

              <textarea
                value={block.note}
                onChange={(e) =>
                  mutate((data) => {
                    data[blockIndex] = { ...data[blockIndex], note: e.target.value };
                    return data;
                  })
                }
                placeholder="Примечание к блоку (условия активации, скидки…)"
                rows={2}
                className="mt-4 w-full resize-y rounded-lg border border-dashed bg-background px-3 py-2 text-xs text-muted-foreground outline-none focus:border-primary"
              />
            </section>
          ))}

          <button
            type="button"
            onClick={addBlock}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed py-8 text-muted-foreground/70 transition-colors hover:border-primary/50 hover:text-primary"
          >
            <PlusIcon className="size-6" />
            <span className="text-sm">Добавить блок</span>
          </button>
        </div>
      </div>

      {modal && (
        <PlanModal
          value={modal.plan}
          isNew={modal.planIndex === null}
          onChange={(plan) => setModal({ ...modal, plan })}
          onClose={() => setModal(null)}
          onApply={applyModal}
        />
      )}

      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} />
    </div>
  );
}

function PlanModal({
  value,
  isNew,
  onChange,
  onClose,
  onApply,
}: {
  value: PlanItem;
  isNew: boolean;
  onChange: (next: PlanItem) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  const valid =
    value.name.trim().length >= 2 &&
    value.fullPrice !== null &&
    value.ctaText.trim().length >= 2 &&
    (value.discountPrice === null || value.discountPrice < value.fullPrice);

  return (
    <ModalShell title={isNew ? "Новый тариф" : "Редактирование тарифа"} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Название</span>
            <input
              type="text"
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
              autoFocus
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Надзаголовок (кол-во занятий)</span>
            <input
              type="text"
              value={value.label}
              onChange={(e) => onChange({ ...value, label: e.target.value })}
              placeholder="4 занятия / Безлимит"
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Суть</span>
          <input
            type="text"
            value={value.details}
            onChange={(e) => onChange({ ...value, details: e.target.value })}
            placeholder="Одно занятие на любом направлении"
            className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Для кого</span>
          <input
            type="text"
            value={value.audience}
            onChange={(e) => onChange({ ...value, audience: e.target.value })}
            placeholder="Хочу попробовать разово"
            className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Срок действия</span>
            <input
              type="text"
              value={value.duration}
              onChange={(e) => onChange({ ...value, duration: e.target.value })}
              placeholder="4 недели"
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Текст кнопки</span>
            <input
              type="text"
              value={value.ctaText}
              onChange={(e) => onChange({ ...value, ctaText: e.target.value })}
              placeholder="Записаться / Купить / Выбрать"
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">
              Полная цена, ₽ {value.discountPrice !== null && <span className="text-muted-foreground">(зачёркнутая)</span>}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={value.fullPrice ?? ""}
              onChange={(e) =>
                onChange({ ...value, fullPrice: e.target.value === "" ? null : Number(e.target.value) })
              }
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm tabular-nums outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Цена со скидкой, ₽</span>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={value.discountPrice ?? ""}
                onChange={(e) =>
                  onChange({
                    ...value,
                    discountPrice: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm tabular-nums outline-none focus:border-primary"
              />
              {value.discountPrice !== null && (
                <Button variant="ghost" size="sm" onClick={() => onChange({ ...value, discountPrice: null })}>
                  <Trash2Icon className="size-4" />
                </Button>
              )}
            </div>
          </label>
        </div>
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
