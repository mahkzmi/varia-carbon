import React from "react";

const EMAIL = "mah.kzmi21@gmail.com";

const ContactUs = () => {
  return (
    <footer className="mx-auto w-full max-w-3xl px-4 pb-10">
      <div className="border-t border-gray-300 pt-10 text-center">
        <p className="text-sm font-medium text-gray-900">
          VARIA — Soil Intelligence for a Regenerative Future
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Contact:{" "}
          <a
            href={`mailto:${EMAIL}`}
            className="rounded-sm text-[#1b4d35] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b4d35]"
          >
            {EMAIL}
          </a>
        </p>

        <p className="mt-1 text-xs text-gray-500">© 2026 VARIA</p>
      </div>
    </footer>
  );
};

export default ContactUs;
