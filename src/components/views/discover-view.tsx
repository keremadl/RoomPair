"use client";

import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Coffee,
  Compass,
  DoorOpen,
  Heart,
  Leaf,
  ListFilter,
  MapPin,
  MoreHorizontal,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sofa,
  Sparkles,
  Sprout,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { EmptyState, HomeIllustration } from "../ui";
import { SwipeSurface } from "../swipe-surface";
import { RoomCard } from "../shared";
import { useApp } from "../app/controller";

export function DiscoverView() {
  const {
    t,
    state,
    setState,
    dateLabel,
    setDialog,
    setSelected,
    setSelectedRoom,
    mode,
    setMode,
    listView,
    setListView,
    direction,
    ranked,
    queue,
    current,
    next,
    match,
    activeFilters,
    visibleRooms,
    photoIndex,
    setPhotoIndex,
    openFilters,
    openProfile,
    decide,
    undo,
    toggleRoom,
  } = useApp();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="discover-page"
    >
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span />
            {t("FIND YOUR PEOPLE")}
          </div>
          <h1>{t("discover.title")}</h1>
          <p>{t("discover.subtitle")}</p>
        </div>
        <div className="community-proof">
          <div className="avatar-stack">
            {["leo", "sofia", "noah"].map((name) => (
              <img key={name} src={`/images/${name}.jpg`} alt="" />
            ))}
          </div>
          <span>
            {t("{count} people, one new chapter", {
              count: ranked.length,
            })}
            <small>{t("Your Riga demo community")}</small>
          </span>
        </div>
      </div>
      <div className="discover-toolbar">
        <div className="segmented">
          <button
            className={mode === "people" ? "selected" : ""}
            onClick={() => setMode("people")}
          >
            <Users size={17} />
            {t("discover.people")}
          </button>
          <button
            className={mode === "rooms" ? "selected" : ""}
            onClick={() => setMode("rooms")}
          >
            <DoorOpen size={17} />
            {t("discover.rooms")}
          </button>
        </div>
        <div className="toolbar-right">
          <span className="sort-label">{t("Made for your lifestyle")}</span>
          <button
            className={`icon-button view-toggle ${listView ? "selected" : ""}`}
            aria-label={
              listView ? t("Switch to swipe view") : t("Switch to list view")
            }
            onClick={() => setListView(!listView)}
          >
            {listView ? <Compass size={19} /> : <ListFilter size={19} />}
          </button>
          <button className="filter-button" onClick={openFilters}>
            <SlidersHorizontal size={16} />
            {t("discover.filters")}
            {activeFilters > 0 && <span>{activeFilters}</span>}
          </button>
        </div>
      </div>
      {mode === "rooms" ? (
        <>
          <div className="section-intro">
            <h2>{t("A space for your next chapter.")}</h2>
            <p>
              {t(
                "Thoughtfully picked demo homes. Save a place and explore it together.",
              )}
            </p>
          </div>
          <div className="room-grid">
            {visibleRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                saved={state.savedRooms.includes(room.id)}
                onSave={() => toggleRoom(room.id)}
                onOpen={() => {
                  setSelectedRoom(room);
                  setDialog("room");
                }}
              />
            ))}
            {visibleRooms.length === 0 && (
              <EmptyState
                icon={DoorOpen}
                title={t("No rooms fit your must-haves yet.")}
                body={t(
                  "Rooms follow your budget, smoking and pet preferences. Adjust them to see more.",
                )}
                action={openFilters}
                label={t("discover.filters")}
              />
            )}
          </div>
        </>
      ) : listView ? (
        <div className="people-grid">
          {queue.map(({ profile, match }) => (
            <button
              key={profile.id}
              className="person-tile"
              onClick={() => openProfile(profile)}
            >
              <div className="person-tile-image">
                <img src={profile.photo} alt={profile.name} />
                <span className="tile-score">
                  <Leaf size={14} />
                  {match.score}% {t("fit")}
                </span>
              </div>
              <h3>
                {profile.name}
                {profile.age > 0 && `, ${profile.age}`}
                {profile.verified && <BadgeCheck size={18} />}
              </h3>
              <p>
                {profile.occupation} · {profile.neighborhood}
              </p>
              <span>
                €{profile.budget[0]}–{profile.budget[1]} / {t("month")}
              </span>
            </button>
          ))}
          {queue.length === 0 && (
            <EmptyState
              icon={Compass}
              title={t("A fresh start?")}
              body={t(
                "You’ve met everyone who fits your search. Try adjusting your preferences.",
              )}
              action={openFilters}
              label={t("discover.filters")}
            />
          )}
        </div>
      ) : (
        <div className="discovery-layout">
          <section
            className="swipe-column"
            aria-label={t("Roommate discovery")}
          >
            <div className="card-stage">
              {current && next && (
                <div className="back-card">
                  <img src={next.photo} alt="" />
                </div>
              )}
              <AnimatePresence mode="popLayout" custom={direction}>
                {current ? (
                  <SwipeSurface
                    key={current.id}
                    onDecision={(action) => decide(action, current)}
                  >
                    <img
                      className="profile-photo"
                      src={current.photos[photoIndex] || current.photo}
                      alt={
                        photoIndex === 0
                          ? `${current.name}, ${current.occupation}`
                          : t("A look at the home")
                      }
                      draggable="false"
                    />
                    <div className="photo-shade" />
                    <div className="photo-indicators">
                      {current.photos.map((_, i) => (
                        <button
                          key={i}
                          className={photoIndex === i ? "active" : ""}
                          aria-label={t("View photo {number}", {
                            number: i + 1,
                          })}
                          onClick={() => setPhotoIndex(i)}
                        />
                      ))}
                    </div>
                    <div className="card-topline">
                      <span className="available-pill">
                        <span />
                        {current.intent === "have-room"
                          ? t("Has a room")
                          : t("Looking for a room")}
                      </span>
                      <button
                        className="photo-more"
                        aria-label={t("Profile options")}
                        onClick={() => {
                          setSelected(current);
                          setDialog("report");
                        }}
                      >
                        <MoreHorizontal size={23} />
                      </button>
                    </div>
                    {current.photos.length > 1 && (
                      <button
                        className="next-photo"
                        aria-label={t("Next photo")}
                        onClick={() =>
                          setPhotoIndex(
                            (photoIndex + 1) % current.photos.length,
                          )
                        }
                      >
                        <ChevronRight size={20} />
                      </button>
                    )}
                    <div className="profile-card-content">
                      <div className="card-location">
                        <MapPin size={13} />
                        {current.neighborhood}, {current.city}
                      </div>
                      <div className="profile-name">
                        <h2>
                          {current.name}
                          {current.age > 0 && <span>, {current.age}</span>}
                        </h2>
                        {current.verified && (
                          <BadgeCheck className="verified-icon" size={25} />
                        )}
                        <button
                          className="profile-expand"
                          aria-label={t("View {name}'s profile", {
                            name: current.name,
                          })}
                          onClick={() => openProfile(current)}
                        >
                          <ArrowUpRight size={22} />
                        </button>
                      </div>
                      <p className="profile-occupation">
                        {current.occupation} <span>·</span> {t("Moving in")}{" "}
                        {dateLabel(current.moveDate)} <span>·</span>{" "}
                        {current.room
                          ? `€${current.room.price}`
                          : `€${current.budget[0]}–${current.budget[1]}`}{" "}
                        / {t("month")}
                      </p>
                      <p className="profile-bio">{current.bio}</p>
                      <div className="profile-tags">
                        {current.tags.map((tag, i) => (
                          <span key={tag}>
                            {i === 0 ? (
                              <Sprout size={13} />
                            ) : i === 1 ? (
                              <Coffee size={13} />
                            ) : (
                              <Sparkles size={13} />
                            )}{" "}
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </SwipeSurface>
                ) : (
                  <motion.div
                    key="empty"
                    className="no-profiles"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <HomeIllustration />
                    <h2>{t("You’re all caught up.")}</h2>
                    <p>
                      {t(
                        "Good people are worth the wait. Adjust your filters or revisit the people you liked.",
                      )}
                    </p>
                    <button className="button primary" onClick={openFilters}>
                      {t("Adjust my search")}
                      <SlidersHorizontal size={16} />
                    </button>
                    {state.decisions.some((d) => d.action === "pass") && (
                      <button
                        className="text-button"
                        onClick={() =>
                          // Likes and matches are kept; only passes return.
                          setState((s) => ({
                            ...s,
                            decisions: s.decisions.filter(
                              (d) => d.action === "like",
                            ),
                          }))
                        }
                      >
                        {t("Browse everyone again")}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="swipe-controls">
              <button
                className="action undo"
                disabled={!state.decisions.length}
                aria-label={t("discover.undo")}
                title={t("discover.undo")}
                onClick={undo}
              >
                <RotateCcw size={21} />
              </button>
              <button
                className="action pass"
                disabled={!current}
                aria-label={t("discover.pass")}
                onClick={() => decide("pass")}
              >
                <X size={30} strokeWidth={1.8} />
              </button>
              <button
                className="action like"
                disabled={!current}
                aria-label={t("discover.like")}
                onClick={() => decide("like")}
              >
                <Heart size={29} strokeWidth={1.8} />
              </button>
              <button
                className="action info"
                disabled={!current}
                aria-label={t("Why you fit")}
                onClick={() => {
                  setSelected(current!);
                  setDialog("compatibility");
                }}
              >
                <Sparkles size={21} />
              </button>
            </div>
            <div className="swipe-hint">
              <span>
                <kbd>←</kbd>
                {t("Pass")}
              </span>
              <span>{t("A good home starts with a hello.")}</span>
              <span>
                {t("Like")}
                <kbd>→</kbd>
              </span>
            </div>
          </section>
          <aside className="insights-column">
            {current && match ? (
              <>
                <div className="compatibility-card">
                  <div className="compatibility-heading">
                    <span className="eyebrow">
                      {t("THE EVERYDAY KIND OF COMPATIBLE")}
                    </span>
                    <span className="leaf-mark">
                      <Leaf size={20} />
                    </span>
                  </div>
                  <div className="compatibility-score">
                    <strong>
                      {match.score}
                      <span>%</span>
                    </strong>
                    <span>
                      {t("You could live")}
                      <br />
                      {t("well together.")}
                    </span>
                  </div>
                  <p>
                    {t("It’s the little things that make a home feel right.")}
                  </p>
                  <div className="compatibility-line" />
                  <ul className="fit-reasons">
                    {match.reasons.slice(0, 3).map((reason, i) => (
                      <li key={reason}>
                        <span>
                          {i === 0 ? (
                            <Wallet size={16} />
                          ) : i === 1 ? (
                            <Sparkles size={16} />
                          ) : (
                            <Sofa size={16} />
                          )}
                        </span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="fit-link"
                    onClick={() => {
                      setSelected(current);
                      setDialog("compatibility");
                    }}
                  >
                    {t("See why you fit")}
                    <ArrowUpRight size={17} />
                  </button>
                </div>
                <div className="quick-facts">
                  <div>
                    <span>
                      <Wallet size={16} />
                      {current.intent === "have-room"
                        ? t("The room")
                        : t("Monthly budget")}
                    </span>
                    <strong>
                      {current.room
                        ? `€${current.room.price}`
                        : `€${current.budget[0]}–${current.budget[1]}`}
                      <small> / {t("month")}</small>
                    </strong>
                  </div>
                  <div>
                    <span>
                      <CalendarDays size={16} />
                      {t("Ready to move")}
                    </span>
                    <strong>
                      {dateLabel(current.moveDate)}
                      <small>
                        {" "}
                        · {current.stayMonths} {t("months")}
                      </small>
                    </strong>
                  </div>
                </div>
                <div className="prompt-note">
                  <span className="quote-mark">“</span>
                  <span className="tiny-eyebrow">
                    {current.prompt.question}
                  </span>
                  <p>{current.prompt.answer}</p>
                  <span className="note-signature">
                    — {current.name}
                    <svg viewBox="0 0 70 20" fill="none">
                      <path
                        d="M3 14c21-8 34-9 59-8M16 18c16-7 31-5 46-5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </div>
                <div className="intent-note">
                  <ShieldCheck size={17} />
                  <p>
                    {t("People first. No pressure.")}
                    <span>{t("Only a mutual like opens a conversation.")}</span>
                  </p>
                </div>
              </>
            ) : (
              <div className="end-note">
                <HomeIllustration />
                <h3>{t("Quality over endless swiping.")}</h3>
                <p>
                  {t(
                    "Your must-haves always come first. We never loosen them just to fill your feed.",
                  )}
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
      <div className="discover-footer">
        <span>
          <Leaf size={14} />
          {t("Built around real life, not just a profile.")}
        </span>
        <button onClick={() => setDialog("help")}>
          {t("The RoomPair way")}
          <ArrowUpRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}
