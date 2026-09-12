"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQ() {
  return (
    <section
      id="faq"
      className="w-full py-20 bg-gray-50 dark:bg-slate-900"
    >
      <div className="mx-auto max-w-4xl px-6">

        <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h2>

        <Accordion
          type="single"
          collapsible
          className="mt-10 w-full space-y-4"
        >

          <AccordionItem
            value="item-1"
            className="rounded-xl border border-gray-200 bg-white px-6 dark:bg-slate-950 dark:border-slate-800"
          >
            <AccordionTrigger className="text-left text-lg font-medium">
              Is Metube free to use?
            </AccordionTrigger>

            <AccordionContent className="text-gray-600 dark:text-gray-300 leading-7">
              Yes, Metube is completely free for file sharing between devices.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-2"
            className="rounded-xl border border-gray-200 bg-white px-6 dark:bg-slate-950 dark:border-slate-800"
          >
            <AccordionTrigger className="text-left text-lg font-medium">
              Does Metube store uploaded files?
            </AccordionTrigger>

            <AccordionContent className="text-gray-600 dark:text-gray-300 leading-7">
              No. Files are transferred directly between devices using
              peer-to-peer encrypted connections.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-3"
            className="rounded-xl border border-gray-200 bg-white px-6 dark:bg-slate-950 dark:border-slate-800"
          >
            <AccordionTrigger className="text-left text-lg font-medium">
              Is there a file size limit?
            </AccordionTrigger>

            <AccordionContent className="text-gray-600 dark:text-gray-300 leading-7">
              No, Metube supports sharing large files without traditional
              upload limits.
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>
    </section>
  )
}