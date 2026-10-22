import type { ReactNode } from "react";

export type BrandIconName = "evidence" | "practice" | "care" | "articles" | "courses" | "discussion" | "products" | "search" | "events" | "sprout" | "contact" | "help";

const drawings: Record<BrandIconName, ReactNode> = {
  contact: (
    <>
      <path d="M18 33H78V73H18V33ZM18 33L48 55L78 33M18 73L37 48M78 73L59 48" fill="#faf9f6" />
      <path d="M48 33C39 29 35 22 37 16C44 18 48 24 48 33ZM48 33C49 24 54 19 62 18C62 26 57 31 48 33Z" fill="#eadfe9" stroke="#630a79" />
    </>
  ),
  help: (
    <>
      <path d="M26 69L22 82L39 73C62 81 80 66 79 45C78 24 58 14 40 19C19 23 12 49 26 69Z" fill="#faf9f6" />
      <path d="M38 37C38 25 59 25 59 37C59 44 48 45 48 53" stroke="#630a79" strokeWidth="2.5" />
      <circle cx="48" cy="63" r="1.7" fill="#630a79" stroke="#630a79" />
    </>
  ),
  products: (
    <>
      <path d="M26 34H70L75 77H21L26 34ZM36 38V28C36 12 60 12 60 28V38" />
      <path d="M48 66C36 62 32 52 35 43C45 46 49 54 48 66ZM48 66C48 54 55 47 64 46C64 56 58 64 48 66Z" fill="#eadfe9" stroke="#630a79" />
      <path d="M48 72V61" stroke="#630a79" />
    </>
  ),
  search: (
    <>
      <circle cx="42" cy="41" r="22" fill="#faf9f6" />
      <path d="M58 57L77 77M31 40C31 33 36 29 42 29" />
      <path d="M41 50C40 39 46 32 54 30C57 40 50 48 41 50Z" fill="#eadfe9" stroke="#630a79" />
    </>
  ),
  events: (
    <>
      <path d="M23 26H73V76H23V26ZM23 39H73M34 20V32M62 20V32M33 50H39M48 50H54M33 62H39" />
      <path d="M58 67C54 61 54 54 58 50C64 54 64 61 58 67ZM58 67C65 57 72 56 77 59C73 66 66 69 58 67Z" fill="#eadfe9" stroke="#630a79" />
    </>
  ),
  sprout: (
    <>
      <path d="M47 78C49 59 49 38 53 20" />
      <path d="M49 60C29 57 19 43 22 30C39 33 49 44 49 60Z" fill="#faf9f6" />
      <path d="M49 49C50 30 61 19 76 19C76 35 64 46 49 49Z" fill="#eadfe9" stroke="#630a79" />
      <path d="M29 77C39 82 55 83 68 77" stroke="#630a79" />
    </>
  ),
  evidence: (
    <>
      <path d="M22 27C32 24 40 26 48 31C56 26 64 24 74 27V64C64 61 56 63 48 68C40 63 32 61 22 64V27ZM48 31V68M29 36C34 35 38 36 42 38M29 44C34 43 38 44 42 46M29 52C34 51 38 52 42 54" />
      <g stroke="#630a79">
        <path d="M59 35H67M59 42H67" />
        <circle cx="68" cy="63" r="13" fill="#faf9f6" />
        <path d="M62 63L66 67L74 58" />
      </g>
    </>
  ),
  practice: (
    <>
      <path d="M25 25V41C25 53 47 58 52 43C54 38 53 31 53 25M39 53V63C39 79 72 79 72 59V53" />
      <path d="M23 24H29M49 24H55" stroke="#630a79" strokeWidth="4" />
      <circle cx="72" cy="46" r="9" fill="#faf9f6" stroke="#630a79" />
      <circle cx="72" cy="46" r="3" stroke="#630a79" />
      <path d="M29 42C30 48 36 51 41 50" strokeOpacity=".45" />
    </>
  ),
  care: (
    <>
      <path d="M17 53L27 73C31 79 41 77 48 72M79 53L69 73C65 79 55 77 48 72M22 63V44C22 37 29 37 30 43L33 55M74 63V44C74 37 67 37 66 43L63 55" />
      <path d="M33 62L29 55C26 49 32 46 36 51L48 62L60 51C64 46 70 49 67 55L63 62M48 62V72" />
      <path d="M48 41C40 35 32 30 34 23C36 16 44 17 48 23C52 17 60 16 62 23C64 30 56 35 48 41Z" stroke="#630a79" fill="#eadfe9" />
    </>
  ),
  articles: (
    <>
      <path d="M30 21H63L74 32V71H30V21ZM63 21V33H74M30 29H22V79H65V71M39 43H64M39 52H64M39 61H54" />
      <path d="M41 21V35L47 31L53 35V21" fill="#eadfe9" stroke="#630a79" />
    </>
  ),
  courses: (
    <>
      <path d="M18 28C30 24 39 28 48 34C57 28 66 24 78 28V68C67 65 57 68 48 74C39 68 29 65 18 68V28ZM48 34V74M24 75C33 74 40 76 48 80C56 76 64 74 73 75" />
      <path d="M26 39C31 39 35 40 40 43M26 47C31 47 35 48 40 51M26 55C31 55 35 56 40 59" />
      <path d="M58 40L70 48L58 56V40Z" fill="#eadfe9" stroke="#630a79" />
    </>
  ),
  discussion: (
    <>
      <path d="M58 54C54 63 41 67 31 63L20 69L22 57C10 46 17 28 31 25C48 20 65 30 62 43" />
      <path d="M56 40C71 34 84 43 83 56C83 62 80 67 75 70L77 80L66 75C53 78 42 69 43 57C43 49 48 43 56 40Z" stroke="#630a79" fill="#faf9f6" />
      <path d="M28 39H48M28 47H38M53 55H73M53 63H66" />
    </>
  ),
};

export function BrandIcon({ kind, className = "size-24" }: { kind: BrandIconName; className?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" focusable="false" className={className}>
      <path d="M13 31C20 10 52 5 74 18C95 31 93 61 77 77C60 94 27 89 15 71C8 60 8 44 13 31Z" fill="#e4eeeb" />
      <path d="M76 17C88 29 91 48 84 64M12 65C20 85 45 92 62 85" stroke="#956486" strokeOpacity=".45" strokeWidth="1.2" strokeLinecap="round" />
      <g stroke="#146b71" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {drawings[kind]}
      </g>
    </svg>
  );
}
