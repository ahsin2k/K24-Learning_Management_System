import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Footer from "../components/layout/Footer";
import { useApi } from "../hooks/useAPI";
import { useLocation, useNavigate } from "react-router-dom";
import { beFileUrl } from "../utils/base.util";

/* ---------- Helpers ---------- */
function Stars({ value }: { value: number }) {
  const stars = Math.round(value);
  return (
    <span className="text-yellow-500 text-sm select-none">
      {"★".repeat(stars)}
      {"☆".repeat(5 - stars)}
    </span>
  );
}

const sortOptions = ["popular", "rating", "price_low", "price_high"] as const;
type SortBy = (typeof sortOptions)[number];

// chuẩn hoá để so khớp chuỗi không dấu
const normalize = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "");

// gán category giả định (demo) – để filter chạy được dù API không trả field category
const CATEGORIES = ["UI/UX", "Graphic Design", "Web", "Mobile"] as const;
type Category = typeof CATEGORIES[number];
const hashCategory = (_id: string): Category => {
  const sum = (_id || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return CATEGORIES[sum % CATEGORIES.length];
};

export type Course = {
  _id: string;
  title: string;
  description: string;
  avgRating: number;
  totalRating: number;
  totalChapter: number;
  totalCertificate: number;
  totalFavorite: number;
  totalOrder: number;
  totalHour: number;
  price: number;
  level: string;
  introVideo: string;
  introImage: string;
  showLanguage: string;
  status: string;
  createdAt: string;
};

export type Instructor = {
  _id: string;
  name: string;
  bio: string;
  position: string;
  avgRating: number;
  totalReviews: number;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`w-4 h-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`}>
      <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccordionSection({
  title,
  children,
  defaultOpen = true,
  borderTop = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  borderTop?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`${borderTop ? "border-t border-slate-200" : ""}`}>
      <button type="button" className="w-full flex items-center justify-between py-4 cursor-pointer" onClick={() => setOpen((v) => !v)}>
        <span className="font-medium text-slate-900">{title}</span>
        <Chevron open={open} />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

export default function ListCourses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { getListPublishedCourses, getTrendingCourses, getTopInstructors } = useApi();

  const [courses, setCourses] = useState<Course[]>([]);
  const [trendingCourses, setTrendingCourses] = useState<Course[]>([]);
  const [topInstructors, setTopInstructors] = useState<Instructor[]>([]);

  /* ===== fetch ===== */
  useEffect(() => {
    (async () => {
      try {
        const r = await getListPublishedCourses();
        setCourses(r.data);
      } catch {
        setCourses([]);
      }
    })();
    (async () => {
      try {
        const r = await getTrendingCourses();
        setTrendingCourses(r.data);
      } catch {
        setTrendingCourses([]);
      }
    })();
    (async () => {
      try {
        const r = await getTopInstructors(8);
        setTopInstructors(r.data);
      } catch {
        setTopInstructors([]);
      }
    })();
  }, []);

  /* ===== SORT + SEARCH + FILTERS ===== */
  const [sortBy, setSortBy] = useState<SortBy>("popular");

  // filters
  const [ratingChoices, setRatingChoices] = useState<number[]>([]);
  const [chapterChoices, setChapterChoices] = useState<Array<[number, number]>>([]);
  const [priceChoices, setPriceChoices] = useState<Array<"free" | "<20" | "20-50" | ">50">>([]);
  const [categoryChoices, setCategoryChoices] = useState<Category[]>([]);
  const [showMoreChapters, setShowMoreChapters] = useState(false);

  // SEARCH keyword lấy từ query
  const keywordRaw = new URLSearchParams(location.search).get("search") || "";
  const terms = normalize(keywordRaw).split(/\s+/).filter(Boolean);

  // lọc + sắp xếp
  const filteredCourses = useMemo(() => {
    const byFilter = courses.filter((c) => {
      // search theo tiêu đề – tất cả từ phải khớp (AND)
      if (terms.length) {
        const titleN = normalize(c.title);
        if (!terms.every((w) => titleN.includes(w))) return false;
      }
      // rating: chọn exact sau khi làm tròn
      if (ratingChoices.length) {
        const rounded = Math.round(c.avgRating ?? 0);
        if (!ratingChoices.includes(rounded)) return false;
      }
      // chapters
      if (chapterChoices.length) {
        const ok = chapterChoices.some(([min, max]) => c.totalChapter >= min && c.totalChapter <= max);
        if (!ok) return false;
      }
      // price
      if (priceChoices.length) {
        const ok = priceChoices.some((p) => {
          if (p === "free") return c.price === 0;
          if (p === "<20") return c.price > 0 && c.price < 20;
          if (p === "20-50") return c.price >= 20 && c.price <= 50;
          if (p === ">50") return c.price > 50;
          return true;
        });
        if (!ok) return false;
      }
      // category
      if (categoryChoices.length) {
        const cat = hashCategory(c._id);
        if (!categoryChoices.includes(cat)) return false;
      }
      return true;
    });

    let arr = [...byFilter];
    if (sortBy === "price_low") arr.sort((a, b) => a.price - b.price);
    if (sortBy === "price_high") arr.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") arr.sort((a, b) => b.avgRating - a.avgRating);
    return arr;
  }, [courses, terms.join("|"), ratingChoices, chapterChoices, priceChoices, categoryChoices, sortBy]);

  // pagination
  const pageSize = 9;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filteredCourses.length / pageSize);
  const pagedCourses = useMemo(() => filteredCourses.slice((page - 1) * pageSize, page * pageSize), [filteredCourses, page]);

  // về trang 1 khi tiêu chí đổi
  useEffect(() => {
    setPage(1);
  }, [keywordRaw, ratingChoices, chapterChoices, priceChoices, categoryChoices, sortBy]);

  // helpers toggle
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const baseChapters: Array<[number, number]> = [
    [1, 10],
    [10, 15],
    [15, 20],
    [20, 25],
  ];
  const extraChapters: Array<[number, number]> = [
    [25, 30],
    [30, 35],
    [35, 40],
    [40, 45],
    [45, 50],
  ];

  return (
    <>
      {/* Header */}
          <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          {t("title", { ns: "dashboard" })}
        </h1>
      </div>


      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-12">
        <section className="bg-transparent p-0">
          <header className="mb-5">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{t("design_courses", { ns: "dashboard" })}</h2>
            <p className="text-slate-500 mt-1">{t("all_development_courses", { ns: "dashboard" })}</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-3">
              <div className="mb-3">
                <button type="button" className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium bg-white hover:bg-slate-50 w-full justify-center cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h18M6 12h12M10 20h4" />
                  </svg>
                  {t("filter", { ns: "dashboard" })}
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 px-4">
                {/* Rating */}
                <AccordionSection title={t("rating", { ns: "dashboard" })} defaultOpen borderTop={false}>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((v) => (
                      <label key={v} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300"
                          checked={ratingChoices.includes(v)}
                          onChange={() => setRatingChoices((arr) => toggle(arr, v))}
                        />
                        <Stars value={v} /> <span className="text-xs text-slate-500">&nbsp;{t("and_up", { ns: "dashboard", defaultValue: "" })}</span>
                      </label>
                    ))}
                  </div>
                </AccordionSection>

                {/* Number of Chapters */}
                <AccordionSection title={t("number_of_chapters", { ns: "dashboard" })} defaultOpen>
                  <div className="space-y-2 text-sm text-slate-600">
                    {[...baseChapters, ...(showMoreChapters ? extraChapters : [])].map((rng) => {
                      const key = rng.join("-");
                      const checked = chapterChoices.some(([a, b]) => a === rng[0] && b === rng[1]);
                      return (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300"
                            checked={checked}
                            onChange={() =>
                              setChapterChoices((arr) =>
                                checked ? arr.filter(([a, b]) => !(a === rng[0] && b === rng[1])) : [...arr, rng]
                              )
                            }
                          />
                          {rng[0]}-{rng[1]}
                        </label>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setShowMoreChapters((v) => !v)}
                      className="mt-2 text-xs text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      {showMoreChapters ? t("see_less", { ns: "dashboard" }) : t("see_more", { ns: "dashboard" })}
                      <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 transition-transform ${showMoreChapters ? "rotate-180" : "rotate-0"}`}>
                        <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </AccordionSection>

                {/* Price */}
                <AccordionSection title={t("price", { ns: "dashboard" })} defaultOpen={false}>
                  {(["free", "<20", "20-50", ">50"] as const).map((p) => (
                    <label key={p} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={priceChoices.includes(p)}
                        onChange={() => setPriceChoices((arr) => toggle(arr, p))}
                      />
                      {p === "free" ? t("price_free", { ns: "dashboard" }) : p}
                    </label>
                  ))}
                </AccordionSection>

                {/* Category */}
                <AccordionSection title={t("category", { ns: "dashboard" })} defaultOpen={false}>
                  {CATEGORIES.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={categoryChoices.includes(c)}
                        onChange={() => setCategoryChoices((arr) => toggle(arr, c))}
                      />
                      {c}
                    </label>
                  ))}
                </AccordionSection>
              </div>
            </aside>

            {/* Grid */}
            <div className="lg:col-span-9">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-slate-600">{filteredCourses.length} {t("results", { ns: "dashboard" })}</div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">{t("sort_by", { ns: "dashboard" })}</label>
                  <select
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                  >
                    <option value="popular">{t("sort_popular", { ns: "dashboard" })}</option>
                    <option value="rating">{t("sort_rating", { ns: "dashboard" })}</option>
                    <option value="price_low">{t("sort_price_low", { ns: "dashboard" })}</option>
                    <option value="price_high">{t("sort_price_high", { ns: "dashboard" })}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {pagedCourses.map((c) => {
                  const cat = hashCategory(c._id);
                  return (
                    <div
                      key={c._id}
                      onClick={() => { window.scrollTo(0, 0); navigate(`/courses/${c._id}`); }}
                      className="group border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="aspect-video overflow-hidden bg-slate-100">
                        <img
                          src={c.introImage ? beFileUrl(c.introImage) : `https://picsum.photos/seed/course${c._id}/400/200`}
                          alt={c.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="text-slate-900 font-semibold leading-snug line-clamp-2">{c.title}</h3>
                        <p className="text-sm text-slate-500">John Doe · {cat}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Stars value={c.avgRating} />
                            <span className="text-sm text-slate-500">({c.totalRating})</span>
                          </div>
                          <div className="text-slate-900 font-semibold">${c.price.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <nav className="inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-sm divide-x divide-slate-200" aria-label="Pagination">
            <button className="px-4 py-2 text-slate-600 disabled:text-slate-300 hover:bg-slate-50 cursor-pointer" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={"px-4 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer " + (p === page ? "bg-slate-700 text-white hover:bg-slate-700" : "")}
              >
                {p}
              </button>
            ))}
            <button className="px-4 py-2 text-slate-600 disabled:text-slate-300 hover:bg-slate-50 cursor-pointer" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              ›
            </button>
          </nav>
        </div>

        {/* Popular mentors */}
        <section className="bg-transparent p-0">
          <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">{t("popular_mentors", { ns: "dashboard" })}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {topInstructors.map((m) => (
              <div key={m._id} className="border border-slate-200 rounded-xl bg-white p-4 flex items-center gap-4 shadow-sm cursor-pointer">
                <img src={`https://picsum.photos/seed/avatar${m._id}/300/300`} alt={m.name} className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{m.name}</div>
                  <div className="text-sm text-slate-500">{m.position}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Stars value={m.avgRating} />
                    <span className="text-xs text-slate-500">
                      {m.avgRating} · {m.totalReviews} {t("reviews", { ns: "dashboard" })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section className="bg-transparent p-0">
          <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">{t("featured_courses", { ns: "dashboard" })}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {trendingCourses.map((c) => (
              <div
                key={c._id}
                onClick={() => { window.scrollTo(0, 0); navigate(`/courses/${c._id}`); }}
                className="group border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={c.introImage ? beFileUrl(c.introImage) : `https://picsum.photos/seed/course${c._id}/400/200`}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="text-slate-900 font-semibold leading-snug line-clamp-2">{c.title}</h4>
                  <p className="text-sm text-slate-500">John Doe</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Stars value={c.avgRating} />
                      <span className="text-sm text-slate-500">({c.totalRating})</span>
                    </div>
                    <div className="text-slate-900 font-semibold">${c.price.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
