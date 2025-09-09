import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <div>
        <footer className="w-full bg-slate-800 text-slate-200">
          <div className="mx-auto px-20 py-12 max-w-[1400px]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {/* Brand + Description */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="logos/logo.png"
                    alt="Byway Logo"
                    className="h-8 w-8"
                  />
                  <span className="text-xl font-semibold">Byway</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-sm max-w-md">
                  {t("footer.tagline", {
                    ns: "layout",
                    defaultValue:
                      "Empowering learners through accessible and engaging online education.",
                  })}
                </p>
                <p className="text-slate-300 leading-relaxed text-sm max-w-md mt-3">
                  {t("footer.desc", {
                    ns: "layout",
                    defaultValue:
                      "Byway is a leading online learning platform dedicated to providing high-quality, flexible, and affordable educational experiences.",
                  })}
                </p>
              </div>

              {/* Get Help */}
              <div>
                <h4 className="text-white font-semibold mb-4">
                  {t("footer.get_help", { ns: "layout", defaultValue: "Get Help" })}
                </h4>
                <ul className="space-y-3 text-slate-300 text-sm">
                  <li>
                    <a href="#" className="hover:text-white">
                      {t("footer.contact_us", {
                        ns: "layout",
                        defaultValue: "Contact Us",
                      })}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      {t("footer.latest_articles", {
                        ns: "layout",
                        defaultValue: "Latest Articles",
                      })}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      {t("footer.faq", { ns: "layout", defaultValue: "FAQ" })}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Programs */}
              <div>
                <h4 className="text-white font-semibold mb-4">
                  {t("footer.programs", { ns: "layout", defaultValue: "Programs" })}
                </h4>
                <ul className="space-y-3 text-slate-300 text-sm">
                  {["Art & Design", "Business", "IT & Software", "Languages", "Programming"].map(
                    (label) => (
                      <li key={label}>
                        <a href="#" className="hover:text-white">
                          {label}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-white font-semibold mb-4">
                  {t("footer.contact_us", { ns: "layout", defaultValue: "Contact Us" })}
                </h4>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>Address: 123 Main Street, Anytown, CA 12345</li>
                  <li>Tel: +(123) 456-7890</li>
                  <li>Mail: bywayedu@webkul.in</li>
                </ul>

                {/* Socials */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {[
                    "image/icons/iconfb.png",
                    "image/icons/icongithub.png",
                    "image/icons/icongg.png",
                    "image/icons/icontwitter.png",
                    "image/icons/iconmicrosoft.png",
                  ].map((src, i) => (
                    <a key={i} href="#" className="inline-block">
                      <img
                        src={src}
                        alt="social"
                        className="w-8 h-8 rounded-full bg-white p-1"
                      />
                    </a>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}
