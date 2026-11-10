"use client";
import { useRef, useState } from "react";
import { ImagePlus, Plus, Star, X } from "@/design-system/icons";
import { Button } from "@/design-system";
import { useI18n } from "@/lib/i18n";
import { readPhoto } from "./photos";
import p from "./profile.module.css";

/**
 * Up to `max` photo slots. The first is the main photo (it goes on the
 * swipe card). Tap a photo to make it the main one; × removes it.
 */
export function PhotoGrid({
  photos,
  max,
  label,
  onChange,
  onError,
  addLabel,
}: {
  photos: string[];
  max: number;
  label: string;
  onChange: (photos: string[]) => void;
  onError: (message: string) => void;
  /** Text of a full-width add button under the grid. Without it, the empty
   *  tiles are the only way to add, which is enough on a short screen. */
  addLabel?: string;
}) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  // While one batch is being read, a second pick would be built on the old
  // list and drop the first batch, so it waits.
  const [reading, setReading] = useState(false);
  const add = async (files: FileList | null) => {
    if (!files?.length || reading) return;
    setReading(true);
    const room = max - photos.length;
    const results = await Promise.allSettled(
      [...files].slice(0, room).map((f) => readPhoto(f)),
    );
    setReading(false);
    // Keep the photos that worked; one bad file does not reject the rest.
    const added = results.flatMap((r) =>
      r.status === "fulfilled" ? [r.value] : [],
    );
    if (added.length) onChange([...photos, ...added]);
    if (added.length < results.length)
      onError(t("That file is not a photo. Try a JPG or PNG."));
  };
  return (
    <div>
      <ul className={p.photos} aria-label={label}>
        {Array.from({ length: max }, (_, i) => {
          const src = photos[i];
          return (
            <li key={i} className={p.slot} data-filled={!!src || undefined}>
              {src ? (
                <>
                  <button
                    type="button"
                    className={p.photoButton}
                    onClick={() =>
                      i > 0 &&
                      onChange([src, ...photos.filter((_, k) => k !== i)])
                    }
                    aria-label={
                      i === 0
                        ? `${t("Main photo")}`
                        : `${t("Photo")} ${i + 1}: ${t("make main")}`
                    }
                  >
                    <img src={src} alt="" />
                  </button>
                  <span className={p.badge}>
                    {i === 0 ? (
                      <>
                        <Star aria-hidden="true" /> {t("Main")}
                      </>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <button
                    type="button"
                    className={p.remove}
                    aria-label={`${t("Remove photo")} ${i + 1}`}
                    onClick={() => onChange(photos.filter((_, k) => k !== i))}
                  >
                    <X />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={p.add}
                  onClick={() => input.current?.click()}
                  aria-label={`${t("Add photo")} ${i + 1}`}
                >
                  <Plus aria-hidden="true" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          void add(e.target.files);
          e.target.value = "";
        }}
      />
      {addLabel && (
        <Button
          className={p.addAll}
          leadingIcon={<ImagePlus />}
          onClick={() => input.current?.click()}
          disabled={photos.length >= max}
          fullWidth
        >
          {addLabel}
        </Button>
      )}
      {(addLabel || photos.length > 1) && (
        <p className={p.hint}>{t("Tap a photo to make it the main one.")}</p>
      )}
    </div>
  );
}
