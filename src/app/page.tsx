import Image from "next/image";
import { siteConfig } from "@/shared/config/site-config";
import { Button, Copyright } from "@/shared/ui";

const { name, description, author, license } = siteConfig;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background p-8 font-sans">
      <main className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance">
            {name}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground text-pretty">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg">
            <a
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="mr-2 invert dark:invert-0"
                src="/vercel.svg"
                alt="Vercel logomark"
                width={16}
                height={16}
              />
              Deploy Now
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
          </Button>
        </div>
      </main>
      <footer className="mt-auto py-6">
        <Copyright author={author} license={license} />
      </footer>
    </div>
  );
}
