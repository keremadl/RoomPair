"use client";

import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { Modal } from "../ui";
import { useApp, today } from "../app/controller";
import type { Preferences } from "@/lib/types";

export function FiltersDialog() {
  const { t, setState, setDialog, filterDraft, setFilterDraft, notify } =
    useApp();
  return (
    <Modal title={t("discover.filters")} onClose={() => setDialog(null)}>
      <div className="modal-eyebrow">
        <SlidersHorizontal size={20} />
        {t("A LITTLE MORE YOU")}
      </div>
      <h2>{t("Find your kind of people.")}</h2>
      <p className="modal-description">
        {t("Your must-haves come first. Always.")}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (filterDraft.budgetMin >= filterDraft.budgetMax) {
            notify(t("Your maximum budget must be above your minimum."));
            return;
          }
          if (filterDraft.moveDate < today()) {
            notify(t("ob.dateError"));
            return;
          }
          setState((s) => ({
            ...s,
            preferences: {
              ...filterDraft,
              city: filterDraft.city.trim(),
            },
            decisions: s.decisions.filter((d) => d.action === "like"),
          }));
          setDialog(null);
          notify(t("Your search feels a little more like you."));
        }}
        className="filters-form"
      >
        <label>
          {t("City")}
          <input
            required
            maxLength={70}
            value={filterDraft.city}
            onChange={(e) =>
              setFilterDraft({ ...filterDraft, city: e.target.value })
            }
          />
        </label>
        <label>
          {t("I’m here to")}
          <select
            value={filterDraft.intent}
            onChange={(e) =>
              setFilterDraft({
                ...filterDraft,
                intent: e.target.value as Preferences["intent"],
              })
            }
          >
            <option value="find-room">
              {t("Find a room or search together")}
            </option>
            <option value="have-room">
              {t("Find someone for my spare room")}
            </option>
            <option value="either">{t("Explore both")}</option>
          </select>
        </label>
        <div className="form-row">
          <label>
            {t("Monthly budget, from")}
            <div className="input-currency">
              <span>€</span>
              <input
                type="number"
                min="100"
                max="4999"
                required
                value={filterDraft.budgetMin}
                onChange={(e) =>
                  setFilterDraft({
                    ...filterDraft,
                    budgetMin: Number(e.target.value),
                  })
                }
              />
            </div>
          </label>
          <label>
            {t("Up to")}
            <div className="input-currency">
              <span>€</span>
              <input
                type="number"
                min="101"
                max="5000"
                required
                value={filterDraft.budgetMax}
                onChange={(e) =>
                  setFilterDraft({
                    ...filterDraft,
                    budgetMax: Number(e.target.value),
                  })
                }
              />
            </div>
          </label>
        </div>
        <div className="form-row">
          <label>
            {t("Move-in date")}
            <input
              type="date"
              required
              min={today()}
              value={filterDraft.moveDate}
              onChange={(e) =>
                setFilterDraft({
                  ...filterDraft,
                  moveDate: e.target.value,
                })
              }
            />
          </label>
          <label>
            {t("Stay in months")}
            <input
              type="number"
              min="1"
              max="24"
              step="1"
              required
              value={filterDraft.stayMonths}
              onChange={(e) =>
                setFilterDraft({
                  ...filterDraft,
                  stayMonths: Number(e.target.value),
                })
              }
            />
          </label>
        </div>
        {[
          {
            key: "smokeFree",
            label: "A smoke-free home",
            sub: "A must-have, not a suggestion.",
          },
          {
            key: "petsOkay",
            label: "Pets are welcome",
            sub: "Room for a four-legged flatmate.",
          },
          {
            key: "verifiedOnly",
            label: "Student badge only",
            sub: "Show demo student-verified profiles.",
          },
        ].map((item) => (
          <label className="toggle-row" key={item.key}>
            <span>
              <strong>{t(item.label)}</strong>
              <small>{t(item.sub)}</small>
            </span>
            <input
              className="switch-input"
              type="checkbox"
              checked={filterDraft[item.key as keyof Preferences] as boolean}
              onChange={(e) =>
                setFilterDraft({
                  ...filterDraft,
                  [item.key]: e.target.checked,
                })
              }
            />
          </label>
        ))}
        <button type="submit" className="button primary full-width">
          {t("Show my people")}
          <ArrowRight size={18} />
        </button>
      </form>
    </Modal>
  );
}
