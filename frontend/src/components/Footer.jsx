import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

const columns = [
  {
    title: "Tools",
    links: [
      { to: "/quiz", label: "Career quiz" },
      { to: "/resume-generation", label: "Resume builder" },
      { to: "/jobkey", label: "JobKey matcher" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/login", label: "Log in" },
      { to: "/pricing", label: "Pricing" },
      { to: "/result", label: "My career report" },
    ],
  },
];

const socials = [
  {
    href: "https://linkedin.com",
    label: "LinkedIn",
    path: "M19 0h-14C2.238 0 0 2.238 0 5v14c0 2.762 2.238 5 5 5h14c2.762 0 5-2.238 5-5V5c0-2.762-2.238-5-5-5zM7 19H4V9h3v10zm-1.5-11.25c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zM20 19h-3v-5.604c0-3.338-4-3.083-4 0V19h-3V9h3v1.304C14.667 8.333 20 8.083 20 13.396V19z",
  },
  {
    href: "https://twitter.com",
    label: "X (Twitter)",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    href: "https://instagram.com",
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.584.012 4.849.07 1.17.055 1.962.24 2.625.51a5.49 5.49 0 012.018 1.318 5.49 5.49 0 011.318 2.018c.27.663.455 1.455.51 2.625.058 1.265.07 1.649.07 4.849s-.012 3.584-.07 4.849c-.055 1.17-.24 1.962-.51 2.625a5.49 5.49 0 01-1.318 2.018 5.49 5.49 0 01-2.018 1.318c-.663.27-1.455.455-2.625.51-1.265.058-1.649.07-4.849.07s-3.584-.012-4.849-.07c-1.17-.055-1.962-.24-2.625-.51a5.49 5.49 0 01-2.018-1.318 5.49 5.49 0 01-1.318-2.018c-.27-.663-.455-1.455-.51-2.625C2.212 15.584 2.2 15.2 2.2 12s.012-3.584.07-4.849c.055-1.17.24-1.962.51-2.625A5.49 5.49 0 014.098 2.51 5.49 5.49 0 016.116 1.192c.663-.27 1.455-.455 2.625-.51C8.416 2.212 8.8 2.2 12 2.2zM12 5.8a6.2 6.2 0 100 12.4A6.2 6.2 0 0012 5.8zm0 10.2a4 4 0 110-8 4 4 0 010 8zm6.6-11.2a1.4 1.4 0 110 2.8 1.4 1.4 0 010-2.8z",
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-night text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo inverted />
          <p className="mt-4 text-sm leading-relaxed">
            Career guidance for students and early-career professionals: a career quiz, a written report and a resume builder.
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold text-white">{column.title}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 py-6 text-center text-sm">
        &copy; {currentYear} Career Compass. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
