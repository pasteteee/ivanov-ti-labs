import Link from "next/link";
import { siteConfig } from "@/config/site";
import { labsConfig } from "@/config/labs";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-medium text-neutral-800">
          {siteConfig.title}
        </h1>
        <p className="text-neutral-600">{siteConfig.student}</p>
      </header>

      <nav>
        <ul className="space-y-2">
          {labsConfig.map((lab) => (
            <li key={lab.id}>
              <Link
                href={lab.href}
                className="block rounded-lg border border-neutral-200 bg-white px-4 py-3 text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:shadow"
              >
                {lab.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
