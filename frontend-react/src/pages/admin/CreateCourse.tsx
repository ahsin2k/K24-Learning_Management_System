import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useAPI";
import toast from "react-hot-toast";

/* ---- Reusable inputs ---- */
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-sm font-medium text-slate-700 block mb-1">{children}</label>
);
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...p}
    className={
      "w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 " +
      (p.className || "")
    }
  />
);
const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...p}
    className={
      "w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 " +
      (p.className || "")
    }
  />
);

/* ---- Tabs ---- */
function TabsLine({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div className="flex items-center gap-8 border-b border-slate-200">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={
            "relative -mb-px py-3 text-sm font-medium cursor-pointer transition-colors " +
            (active === t ? "text-slate-900" : "text-slate-600 hover:text-slate-900")
          }
        >
          {t}
          {active === t && (
            <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-blue-600 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

/* ---- Dropzone (click/drag & drop) ---- */
function Dropzone({
  hint,
  accept,
  file,
  onChange,
  onDrop,
}: {
  hint?: string;
  accept?: string;
  file?: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {/* Khối upload */}
      <div
        className="relative rounded-lg border border-dashed border-slate-300 bg-white cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept}
          onChange={onChange}
        />
        <div className="flex h-44 items-center justify-center text-sm text-slate-600">
          <div className="text-center">
            <div className="mb-2">
              <span className="inline-block mr-2 align-middle">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
              <b>
                {t("drop.drag", {
                  ns: "createcourse",
                  defaultValue: "Drag and drop files",
                })}
              </b>
              ,{" "}
              <span
                className="text-blue-600 underline underline-offset-2"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                {t("drop.browse", {
                  ns: "createcourse",
                  defaultValue: "or Browse",
                })}
              </span>
            </div>
            {hint ? (
              <div className="text-xs text-slate-500">{hint}</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Khối preview */}
      {file && accept === "image/*" && (
        <div className="relative rounded-lg border border-slate-200 overflow-hidden">
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="h-full mx-auto object-cover max-h-60"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // tránh trigger chọn file lại
              onChange({
                target: { files: null } as any, // reset input file
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow hover:bg-red-600"
          >
            {t("delete", { ns: "createcourse" })}
          </button>
        </div>
      )}
      {file && accept === "video/*" && (
        <div className="relative rounded-lg border border-slate-200 overflow-hidden">
          <video
            src={URL.createObjectURL(file)}
            className="h-full mx-auto object-cover max-h-60"
            controls
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // tránh trigger chọn file lại
              onChange({
                target: { files: null } as any, // reset input file
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow hover:bg-red-600"
          >
            {t("delete", { ns: "createcourse" })}
          </button>
        </div>
      )}
    </div>
  );
}

type CourseForm = {
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
  status: 'draft' | 'public';
  level: string;
  showLanguage: string;
  introVideo?: File | null;
  introImage?: File | null;
};
/* ========================================================= */
export default function CreateCourse() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createCourse } = useApi();

  const [formData, setFormData] = useState<CourseForm>({
    title: '',
    description: '',
    price: 0,
    showLanguage: '',
    level: '',
    avgRating: 0,
    totalRating: 0,
    totalChapter: 0,
    totalCertificate: 0,
    totalFavorite: 0,
    totalOrder: 0,
    totalHour: 0,
    status: 'draft',
    introVideo: null,
    introImage: null,
  });

  const updateForm = <K extends keyof CourseForm>(key: K, value: CourseForm[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleChangeIntroVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // dùng optional chaining
    setFormData(prev => ({ ...prev, introVideo: file || null }));
  };

  const handleDropIntroVideoFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return

    setFormData(prev => ({ ...prev, introVideo: file }));
  };

  const handleChangeIntroImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData(prev => ({ ...prev, introImage: file || null }));
  };

  const handleDropIntroImageFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return

    setFormData(prev => ({ ...prev, introImage: file }));
  };

  const handleSubmit = async (status: 'draft' | 'public') => {
    const draftCourse: CourseForm = {
      title: formData.title,
      description: formData.description,
      introVideo: formData.introVideo,
      introImage: formData.introImage,
      avgRating: formData.avgRating,
      totalRating: formData.totalRating,
      totalChapter: formData.totalChapter,
      totalCertificate: formData.totalCertificate,
      totalFavorite: formData.totalFavorite,
      totalOrder: formData.totalOrder,
      totalHour: formData.totalHour,
      level: formData.level,
      price: formData.price,
      status: status,
      showLanguage: formData.showLanguage,
    };

    const formPayload = new FormData();
    for (const [key, value] of Object.entries(draftCourse)) {
      if (value instanceof File) {
        formPayload.append(key, value); // append file
      } else if (value !== null && value !== undefined) {
        formPayload.append(key, String(value)); // append chuỗi/number
      }
    }

    try {
      await createCourse(formPayload);
      navigate("/admin/dashboard");
      toast.success(t("create_success", { ns: "createcourse" }));
    } catch (error) {
      toast.error(t("create_error", { ns: "createcourse" }));
    }
  };

  /* Only 2 top tabs: Chapters + Detail */
  const topTabs = [
    t("tab_detail", { ns: "createcourse", defaultValue: "Detail" }),
  ];
  const [activeTop, setActiveTop] = useState<string>(topTabs[0]);

  /* Inner tabs in Detail */
  const innerTabs = [
    t("tab_description", { ns: "createcourse", defaultValue: "Description" }),
    // t("tab_syllabus", { ns: "createcourse", defaultValue: "Syllabus" }),
    // t("tab_faqs", { ns: "createcourse", defaultValue: "FAQ's" }),
  ];
  const [activeInner, setActiveInner] = useState<string>(innerTabs[0]);

  /* Right column states */
  const [languageOpen, setLanguageOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);

  /* Chapters mock + pagination */
  type Row = {
    id: number;
    chapter: number;
    title: string;
    type: "PDF" | "PPT" | "PPT+Video" | "Video";
    date: string;
    status: "Publish" | "Draft";
    price: string;
  };
  const rows: Row[] = Array.from({ length: 28 }).map((_, i) => ({
    id: i + 1,
    chapter: i + 1,
    title:
      [
        "The Solid State",
        "Solutions",
        "Electrochemistry",
        "Chemical Kinetics",
        "Surface Chemistry",
        "General Principles and Processes of Isolation of Elements",
        "The p-Block Elements",
        "The d & f Block Elements",
        "Coordination Compounds",
        "Haloalkanes and Haloarenes",
      ][i % 10],
    type: (["PDF", "PDF", "PPT", "PPT+Video", "PDF", "Video", "PPT", "PDF", "Video", "PDF"] as Row["type"][])[i % 10],
    date: "15 May 2020 9:00 am",
    status: (["Publish", "Publish", "Draft", "Publish", "Publish", "Publish", "Draft", "Publish", "Publish", "Draft"] as Row["status"][])[i % 10],
    price: i % 10 === 0 ? "Free" : "$50.00",
  }));

  const pageSize = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(rows.length / pageSize);
  const pageRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page]);

  return (
    <div className="ml-60 min-h-screen bg-slate-50">
      {/* Header giữ nguyên */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t("create_course", { ns: "createcourse", defaultValue: "Create Course" })}
          </h1>
        </div>
      </div>

      {/* Course title dưới header */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-12">
        {/* Top tabs + ACTIONS (đã đổi Draft thành button) */}
        <div className="flex items-center justify-between">
          <TabsLine tabs={topTabs} active={activeTop} onChange={setActiveTop} />
          <div className="flex items-center gap-2">
            {/* DRAFT BUTTON (outlined) */}
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="h-9 px-4 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 cursor-pointer"
            >
              {t("cancel", { ns: "createcourse" })}
            </button>

            <button onClick={() => handleSubmit('draft')} className="h-9 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 cursor-pointer">
              {t("status_draft", { ns: "createcourse", defaultValue: "Save" })}
            </button>
            <button onClick={() => handleSubmit('public')} className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 cursor-pointer">
              {t("actions.publish", { ns: "createcourse", defaultValue: "Publish" })}
            </button>
          </div>
        </div>

        {/* ===== TAB: CHAPTERS ===== */}
        {activeTop === topTabs[1] && (
          <div className="mt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr className="[&>th]:py-3 [&>th]:px-4 text-left">
                      <th className="w-16">
                        {t("tbl.id", { ns: "createcourse", defaultValue: "ID" })}<span className="ml-1 opacity-60">↕</span>
                      </th>
                      <th className="w-24">
                        {t("tbl.chapter", { ns: "createcourse", defaultValue: "Chapter" })}<span className="ml-1 opacity-60">↕</span>
                      </th>
                      <th className="min-w-[240px]">
                        {t("tbl.title", { ns: "createcourse", defaultValue: "Title" })}<span className="ml-1 opacity-60">↕</span>
                      </th>
                      <th className="w-28">
                        {t("tbl.type", { ns: "createcourse", defaultValue: "Type" })}<span className="ml-1 opacity-60">↕</span>
                      </th>
                      <th className="w-48">
                        {t("tbl.date", { ns: "createcourse", defaultValue: "Date" })}<span className="ml-1 opacity-60">↕</span>
                      </th>
                      <th className="w-24">
                        {t("tbl.status", { ns: "createcourse", defaultValue: "Status" })}<span className="ml-1 opacity-60">↕</span>
                      </th>
                      <th className="w-24">
                        {t("tbl.price", { ns: "createcourse", defaultValue: "Price" })}<span className="ml-1 opacity-60">↕</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageRows.map((r) => (
                      <tr key={r.id} className="[&>td]:py-3 [&>td]:px-4">
                        <td className="text-slate-600">{r.id}</td>
                        <td className="text-slate-600">{r.chapter}</td>
                        <td className="text-slate-800">{r.title}</td>
                        <td className="text-slate-600">{r.type}</td>
                        <td className="text-slate-600">{r.date}</td>
                        <td>
                          <span
                            className={
                              "inline-flex items-center rounded-full px-2 h-6 text-xs font-medium " +
                              (r.status === "Publish" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")
                            }
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="text-slate-600">{r.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-1 p-3 border-t border-slate-200">
                <button
                  className="px-3 h-8 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={
                      "px-3 h-8 rounded-lg border cursor-pointer " +
                      (p === page ? "bg-slate-700 text-white border-slate-700" : "border-slate-300 text-slate-700 hover:bg-slate-50")
                    }
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="px-3 h-8 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: DETAIL ===== */}
        {activeTop === topTabs[0] && (
          <div className="mt-6">
            <h3 className="text-base font-semibold text-slate-900 mb-3">
              {t("details", { ns: "createcourse", defaultValue: "Details" })}
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left */}
              <div className="lg:col-span-8 space-y-5">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">
                    {t("course_details", { ns: "createcourse", defaultValue: "Course Details" })}
                  </h4>

                  <div className="mb-4">
                    <div className="text-xs text-slate-500 mb-1">
                      {t("field.course_name", { ns: "createcourse", defaultValue: "Course Name" })}
                    </div>
                    <Input onChange={(e) => updateForm("title", e.target.value)} defaultValue="" placeholder={t("field.course_name", { ns: "createcourse" })} />
                  </div>

                  <div>
                    <Label>{t("upload_intro_video", { ns: "createcourse", defaultValue: "Upload Intro Video" })}</Label>
                    <Dropzone
                      accept="video/*"
                      file={formData.introVideo}
                      hint={t("hint_video", { ns: "createcourse", defaultValue: "Upload Video in Mov, MP4." })}
                      onChange={handleChangeIntroVideoFile}
                      onDrop={handleDropIntroVideoFile}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <Label>{t("upload_intro_image", { ns: "createcourse", defaultValue: "Upload Intro Image" })}</Label>
                  <Dropzone
                    accept="image/*"
                    file={formData.introImage}
                    hint={t("hint_image", { ns: "createcourse", defaultValue: "Upload Thumbnail in JPEG, PNG." })}
                    onChange={handleChangeIntroImageFile}
                    onDrop={handleDropIntroImageFile}
                  />
                </div>

                {/* Inner tabs + editor mock */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3">
                    <TabsLine tabs={innerTabs} active={activeInner} onChange={setActiveInner} />
                  </div>

                  {activeInner === innerTabs[0] && (
                    <>
                      <Textarea
                        onChange={(e) => updateForm("description", e.target.value)}
                        rows={12}
                        placeholder={t("desc_placeholder", {
                          ns: "createcourse",   
                          defaultValue: "Write your description…",
                        })}
                      />
                    </>
                  )}

                  {activeInner === innerTabs[1] && (
                    <div className="flex items-center justify-center h-56 rounded-lg bg-slate-50">
                      <button className="text-sm text-blue-600 hover:underline cursor-pointer">
                        {t("add_section", { ns: "createcourse", defaultValue: "Add Section" })} +
                      </button>
                    </div>
                  )}

                  {activeInner === innerTabs[2] && (
                    <div className="text-sm text-slate-500">
                      {t("faqs_hint", { ns: "createcourse", defaultValue: "Add common questions for your course." })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right */}
              <div className="lg:col-span-4 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>{t("field.course_price", { ns: "createcourse", defaultValue: "Course Price" })}</Label>
                      <Input type="number" onChange={(e) => updateForm("price", Number(e.target.value))} defaultValue={0} />
                    </div>

                    {/* Language dropdown via button */}
                    <div className="relative">
                      <Label>{t("field.language", { ns: "createcourse", defaultValue: "Language" })}</Label>
                      <div className="relative">
                        <Input value={formData.showLanguage ? t(formData.showLanguage, { ns: "createcourse"}) : ""} readOnly />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
                          onClick={() => setLanguageOpen((v) => !v)}
                        >
                          <svg viewBox="0 0 24 24" className={"w-4 h-4 " + (languageOpen ? "rotate-180" : "")}>
                            <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        </button>
                      </div>
                      {languageOpen && (
                        <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                          {["english", "vietnamese", "spanish"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                              onClick={() => {
                                updateForm("showLanguage", opt);
                                setLanguageOpen(false);
                              }}
                            >
                              {t(opt, { ns: "createcourse"})}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Total hours */}
                    <div>
                      <Label>{t("field.total_hours", { ns: "createcourse", defaultValue: "Total Hours" })}</Label>
                      <Input type="number" onChange={(e) => updateForm("totalHour", Number(e.target.value))} defaultValue={0} />
                    </div>

                    {/* Level dropdown via button */}
                    <div className="relative">
                      <Label>{t("field.level", { ns: "createcourse", defaultValue: "Level" })}</Label>
                      <div className="relative">
                        <Input value={formData.level ? t(`level.${formData.level}`, { ns: "createcourse"}) : ""} readOnly className="text-amber-600 font-medium" />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
                          onClick={() => setLevelOpen((v) => !v)}
                        >
                          <svg viewBox="0 0 24 24" className={"w-4 h-4 " + (levelOpen ? "rotate-180" : "")}>
                            <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        </button>
                      </div>
                      {levelOpen && (
                        <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                          {[
                            'beginner',
                            'intermediate',
                            'advanced',
                            'all_level'
                          ].map((opt) => (
                            <button
                              key={String(opt)}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                              onClick={() => {
                                updateForm("level", opt);
                                setLevelOpen(false);
                              }}
                            >
                              {t(`level.${opt}`, { ns: "createcourse"})}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* end right */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
