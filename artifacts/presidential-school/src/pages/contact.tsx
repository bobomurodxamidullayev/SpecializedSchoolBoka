import { useLanguage } from "@/hooks/useLanguage";
import { useCmsContact } from "@/hooks/useCms";
import { pickLang } from "@/lib/cms";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(5),
});

type FormState = "idle" | "loading" | "success" | "error";

export default function Contact() {
  const { t, language } = useLanguage();
  const { data: contact } = useCmsContact();
  const [formState, setFormState] = useState<FormState>("idle");

  const addressFallback = language === "uz" ? "Toshkent viloyati, Bekobod tumani" : language === "en" ? "Bekobod District, Tashkent Region" : "Ташкентская область, Бекабадский район";
  const address = contact ? pickLang(contact.address, language) : addressFallback;
  const phones = [contact?.phone, contact?.phone2].filter(Boolean).join("\n") || "+998 71 123 45 67";
  const emails = [contact?.email, contact?.email2].filter(Boolean).join("\n") || "info@bekobod-school.uz";
  const hours = contact ? pickLang(contact.workingHours, language) : "";
  const mapUrl = contact?.mapUrl ?? "";
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", phone: "", email: "", subject: "", message: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setFormState("loading");
    setErrorMessage("");

    try {
      const res = await fetch("https://691e0c54edc24.xvest6.ru/BekobodIM/send.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          email: values.email,
          subject: values.subject,
          message: values.message,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }

      if (res.status === 200 && data.status === true) {
        setFormState("success");
        form.reset();
        setTimeout(() => setFormState("idle"), 6000);
      } else {
        throw new Error("Xabar yuborishda xatolik yuz berdi");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Xabar yuborishda xatolik yuz berdi");
      setFormState("error");
      setTimeout(() => setFormState("idle"), 5000);
    }
  }

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f1b4d] via-[#1a2a7a] to-[#0d1a5c] py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px]" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mb-6"
          >
            <Mail className="h-8 w-8 text-accent" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-serif text-accent mb-3"
          >
            {t("nav.contact")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-slate-300 text-lg max-w-2xl mx-auto"
          >
            {t("contact.heroSubtitle")}
          </motion.p>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-12">

            {/* Left column — contact info + hours */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h3 className="text-2xl font-bold font-serif mb-6">{t("contact.contactInfoTitle")}</h3>
                <div className="space-y-6">
                  {[
                    {
                      icon: MapPin,
                      color: "bg-primary/10 text-primary",
                      label: t("contact.addressLabel"),
                      value: address,
                    },
                    {
                      icon: Phone,
                      color: "bg-accent/10 text-accent",
                      label: t("contact.phoneLabel"),
                      value: phones,
                    },
                    {
                      icon: Mail,
                      color: "bg-blue-500/10 text-blue-500",
                      label: t("contact.emailLabel"),
                      value: emails,
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{item.label}</h4>
                        <p className="text-muted-foreground whitespace-pre-line">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {hours && (
              <div>
                <h3 className="text-2xl font-bold font-serif mb-6">{t("contact.officeHoursTitle")}</h3>
                <div className="bg-card border border-border rounded-xl p-6">
                  <p className="text-muted-foreground whitespace-pre-line">{hours}</p>
                </div>
              </div>
              )}
            </div>

            {/* Right column — form */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-lg relative overflow-hidden min-h-[520px]">

                {/* Success overlay */}
                <AnimatePresence>
                  {formState === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-card z-20 flex flex-col items-center justify-center text-center p-8 rounded-2xl"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        className="w-24 h-24 bg-green-500/15 text-green-500 rounded-full flex items-center justify-center mb-6"
                      >
                        <CheckCircle2 className="h-12 w-12" />
                      </motion.div>
                      <h3 className="text-3xl font-bold font-serif mb-3">{t("contact.messageSent")}</h3>
                      <p className="text-muted-foreground text-lg max-w-sm leading-relaxed">{t("contact.thankYou")}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error banner */}
                <AnimatePresence>
                  {formState === "error" && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-4 left-4 right-4 z-10 flex items-center gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-4 py-3"
                    >
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <span className="text-sm font-medium">
                        {errorMessage || "Something went wrong. Please try again."}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <h3 className="text-3xl font-bold font-serif mb-8">{t("contact.sendMessageTitle")}</h3>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.formLabels.name")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("contact.formPlaceholders.name")}
                                className="bg-background"
                                disabled={formState === "loading"}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.formLabels.phone")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("contact.formPlaceholders.phone")}
                                className="bg-background"
                                disabled={formState === "loading"}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.formLabels.email")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("contact.formPlaceholders.email")}
                                className="bg-background"
                                disabled={formState === "loading"}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.formLabels.subject")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("contact.formPlaceholders.subject")}
                                className="bg-background"
                                disabled={formState === "loading"}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.formLabels.message")}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("contact.formPlaceholders.message")}
                              className="min-h-[150px] bg-background resize-none"
                              disabled={formState === "loading"}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      disabled={formState === "loading"}
                      className="w-full md:w-auto px-8 h-12 text-base min-w-[180px]"
                    >
                      {formState === "loading" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("contact.sendButton")}...
                        </>
                      ) : (
                        <>
                          {t("contact.sendButton")}
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>

          <div className="mt-20 w-full h-[400px] bg-muted rounded-2xl border border-border overflow-hidden relative">
            {mapUrl ? (
              <iframe title="map" src={mapUrl} className="w-full h-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
            <div className="absolute inset-0 flex items-center justify-center flex-col text-muted-foreground">
              <MapPin className="h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium text-lg">{t("contact.mapText")}</p>
              <p className="text-sm">{t("contact.mapSubtext")}</p>
            </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
