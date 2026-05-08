import { footerContent } from '@/lib/footer-content';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-[linear-gradient(180deg,#f4f7f6,#eef3f1)] text-foreground">
      <div className="mx-auto flex w-full max-w-[126rem] flex-col gap-8 px-5 py-8 sm:px-7 lg:px-10">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          {footerContent.legalLinks.map((item) => (
            <a
              className="text-foreground/78 transition-colors hover:text-foreground"
              href={item.href}
              key={item.label}
              rel="noreferrer"
              target="_blank"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-foreground/62">
            {footerContent.registry.map((item) => (
              <div className="flex items-center gap-2" key={item.label}>
                {item.href ? (
                  <a
                    className="flex items-center gap-2 text-foreground/62 transition-colors hover:text-foreground"
                    href={item.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {item.icon ? (
                      <img
                        alt=""
                        className="h-[17px] w-[17px]"
                        src={item.icon}
                      />
                    ) : null}
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <>
                    {item.icon ? (
                      <img
                        alt=""
                        className="h-[17px] w-[17px]"
                        src={item.icon}
                      />
                    ) : null}
                    <span>{item.label}</span>
                  </>
                )}
              </div>
            ))}

            <img
              alt={footerContent.scamShield.tooltip}
              className="hidden h-10 w-auto md:block"
              src={footerContent.scamShield.href}
              title={footerContent.scamShield.tooltip}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {footerContent.socialLinks.map((item) => (
              <a
                className="rounded-full border border-border/80 bg-background/78 px-3 py-2 text-xs font-medium tracking-[0.03em] text-foreground/72 transition-colors hover:border-primary/25 hover:bg-card hover:text-foreground"
                href={item.href}
                key={item.label}
                rel="noreferrer"
                target="_blank"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
