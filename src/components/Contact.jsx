import React from "react";
import Link from "next/link";
import { SectionWrapper, Button } from "./ui";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { homeData, portfolioData } from "@/lib/data";
import SocialLinks from "./SocialLinks";
import ContactFormClient from "./ContactFormClient";
import { MotionDiv, MotionA } from "./ContactMotionClient";
import {
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";

const WhatsAppIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    width="24"
    height="24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M24.504 7.504A11.88 11.88 0 0 0 16.05 4C9.465 4 4.1 9.36 4.1 15.945a11.9 11.9 0 0 0 1.594 5.973L4 28.109l6.336-1.664a11.96 11.96 0 0 0 5.71 1.457h.005c6.586 0 11.945-5.359 11.949-11.949c0-3.191-1.242-6.191-3.496-8.45zM16.05 25.883h-.004a9.93 9.93 0 0 1-5.055-1.383l-.363-.215l-3.762.985l1.004-3.665l-.234-.375a9.9 9.9 0 0 1-1.52-5.285c0-5.472 4.457-9.925 9.938-9.925a9.86 9.86 0 0 1 7.02 2.91a9.88 9.88 0 0 1 2.905 7.023c0 5.477-4.457 9.93-9.93 9.93zm5.445-7.438c-.297-.148-1.766-.87-2.039-.968c-.273-.102-.473-.149-.672.148c-.2.3-.77.973-.945 1.172c-.172.195-.348.223-.645.074c-.3-.148-1.261-.465-2.402-1.484c-.887-.79-1.488-1.77-1.66-2.067c-.176-.3-.02-.46.129-.61c.136-.132.3-.347.449-.523c.148-.171.2-.296.3-.496c.098-.199.048-.375-.027-.523c-.074-.148-.671-1.621-.921-2.219c-.243-.582-.489-.5-.672-.511c-.172-.008-.371-.008-.57-.008c-.2 0-.524.074-.798.375c-.273.297-1.043 1.02-1.043 2.488c0 1.469 1.07 2.89 1.22 3.09c.148.195 2.105 3.21 5.1 4.504a17 17 0 0 0 1.7.629c.715.226 1.367.195 1.883.12c.574-.085 1.765-.722 2.015-1.421c.247-.695.247-1.293.172-1.418c-.074-.125-.273-.2-.574-.352"
    />
  </svg>
);

const IconMap = {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  WhatsApp: WhatsAppIcon,
};

const resolveIcon = (icon) => {
  if (typeof icon === "string") {
    return IconMap[icon] || MapPin;
  }
  return icon;
};

const ContactValue = ({ info }) => {
  if (info.label !== "Our Office") {
    return (
      <p
        className="text-sm font-bold text-foreground group-hover:text-accent transition-colors"
      >
        {info.value}
      </p>
    );
  }

  return (
    <address
      itemScope
      itemType="https://schema.org/PostalAddress"
      className="text-sm font-bold not-italic text-foreground group-hover:text-accent transition-colors"
    >
      <span itemProp="streetAddress">
        Chota, Mohlanwal Road, Badu Pura Chung
      </span>
      {", "}
      <span itemProp="addressLocality">Lahore</span>
      {", "}
      <span itemProp="postalCode">53720</span>
      {", "}
      <span itemProp="addressCountry">Pakistan</span>
    </address>
  );
};

const Contact = ({ isHomePage = false }) => {
  const { contactInfo, siteConfig } = portfolioData;
  const data = siteConfig.contactPage;
  const HeadingTag = isHomePage ? "h2" : "h1";

  return (
    <div className="relative overflow-hidden w-full">
      <SectionWrapper id="contact" title="Get In Touch" subtitle="Contact Me">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Context & Info */}
          <div className="lg:col-span-5 space-y-12">
            <MotionDiv
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold tracking-normal">
                <Clock className="w-3 h-3" />
                <span className="text-foreground">
                  {data.quickResponse}
                </span>
              </div>
              <HeadingTag className="text-5xl md:text-7xl font-bold tracking-tight leading-none text-foreground px-4 py-2 border-l-4 border-accent bg-accent/5 rounded-r-2xl italic">
                Let&apos;s connect
              </HeadingTag>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-md">
                Have an idea or project requirement? Share the details and I&apos;ll
                review your message to guide you with the right solution.
              </p>
            </MotionDiv>

            {/* Info Items */}
            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info, idx) => (
                <MotionA
                  key={idx}
                  href={info.href}
                  target={info.target}
                  rel={
                    info.target === "_blank" ? "noopener noreferrer" : undefined
                  }
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="theme-surface-depth group relative p-6 bg-card/80 dark:bg-card/40 backdrop-blur-3xl rounded-[2rem] border border-border hover:border-accent/50 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div
                    className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-accent/20`}
                  >
                    {(() => {
                      const Icon = resolveIcon(info.icon);
                      return <Icon className="w-6 h-6" />;
                    })()}
                  </div>
                  <p className="relative text-[10px] font-semibold tracking-normal text-muted-foreground/60 mb-1">
                    {info.label}
                  </p>
                  <ContactValue info={info} />
                </MotionA>
              ))}
            </div>

            {/* Socials Connection */}
            <div className="pt-8 border-t border-border/10">
              <p className="text-xs font-semibold text-muted-foreground/60 tracking-normal mb-6 italic">
                Find us on social media
              </p>
              <SocialLinks buttonClassName="w-12 h-12 bg-card rounded-2xl flex items-center justify-center text-muted-foreground transition-all duration-300 border border-border/50 shadow-lg" />
            </div>

            {isHomePage && (
              <MotionDiv
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass rounded-[2rem] border border-accent/20 p-6"
              >
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {homeData.contactCTA.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {homeData.contactCTA.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  {homeData.contactCTA.buttons.map((button) => (
                    <Link
                      key={button.href}
                      href={button.href}
                      prefetch={false}
                      className="rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-xs font-bold text-foreground transition-all hover:border-accent/40 hover:text-accent"
                    >
                      {button.label}
                    </Link>
                  ))}
                </div>
              </MotionDiv>
            )}
          </div>

          {/* Right Column: Premium Form (Client Component) */}
          <ContactFormClient />
        </div>

        {!isHomePage && (
          <>
            {/* What Happens Next Section */}
            <section className="mt-12 space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold tracking-tight text-foreground italic">
                  What happens <span className="text-accent">next?</span>
                </h2>
                <p className="text-muted-foreground font-semibold text-xs tracking-normal">
                  Simple 3-step process
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {data.process.map((item, idx) => (
                  <MotionDiv
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="theme-surface-depth relative p-8 glass rounded-[2.5rem] border border-border group hover:border-accent/30 transition-all"
                  >
                    <div className="text-5xl font-black text-foreground/5 group-hover:text-accent/10 transition-colors absolute top-6 right-8">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </MotionDiv>
                ))}
              </div>
            </section>

            {/* FAQ Section */}
            <section className="mt-12 mb-20">
              <div className="grid lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-5 sticky top-32">
                  <div className="space-y-6">
                    <h2 className="text-5xl font-bold tracking-tight text-foreground leading-none italic">
                      Common questions
                    </h2>
                    <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                      Here are some simple answers to questions we get asked
                      most often.
                    </p>
                    <div className="pt-8 flex flex-col gap-4">
                      <div className="flex items-center gap-4 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="text-xs font-semibold tracking-normal text-foreground/60 group-hover:text-foreground transition-colors">
                          Need more help?
                        </span>
                      </div>
                      <Link href="/services" prefetch={false}>
                        <MotionDiv whileHover={{ scale: 1.02 }}>
                          <Button variant="outline">
                            Explore our Services
                          </Button>
                        </MotionDiv>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  {data.faq.map((faq, idx) => (
                    <MotionDiv
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="group relative"
                    >
                      <details className="glass rounded-3xl border border-border px-8 py-6 cursor-pointer open:bg-accent/5 transition-colors overflow-hidden">
                        <summary className="list-none flex justify-between items-center text-sm font-bold text-foreground group-hover:text-accent transition-colors cursor-pointer">
                          {faq.q}
                          <ArrowRight className="w-4 h-4 transition-transform group-open:rotate-90 group-hover:translate-x-1" />
                        </summary>
                        <p className="mt-6 text-sm text-muted-foreground leading-relaxed font-medium">
                          {faq.a}
                        </p>
                      </details>
                    </MotionDiv>
                  ))}
                </div>
              </div>
            </section>

            {/* Immersive Map Integration */}
            <MotionDiv
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="theme-surface-depth mt-12 relative h-[500px] glass p-2 rounded-[3.5rem] overflow-hidden group"
            >
              <iframe
                title="Muhyo Tech Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13619.482275108292!2d74.15068534154764!3d31.417691950071564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3918ff320ce9fdf3%3A0x6f99df647443992f!2sMuhyo%20tech%20(%20private%20limited%20)%20company!5e0!3m2!1sen!2s!4v1786467602154!5m2!1sen!2s"
                width="100%"
                height="100%"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full border-0 rounded-[3rem] opacity-95 hover:opacity-100 transition-all duration-500"
              />


            </MotionDiv>
          </>
        )}
      </SectionWrapper>
    </div>
  );
};

export default Contact;
