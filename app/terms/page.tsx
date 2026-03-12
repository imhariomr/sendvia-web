"use client"

import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors">

      <Navbar page="terms" />

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 space-y-12">
    
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-semibold">
              Terms of Service
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().getFullYear()}
            </p>

            <p className="text-gray-600 dark:text-gray-300">
              These Terms of Service govern your use of SendVia. By accessing or
              using the service, you agree to comply with these terms.
            </p>
          </div>


          <TermBlock title="Acceptable Use">
            You agree to use SendVia only for lawful purposes. You must not use
            the service to distribute harmful, illegal, or unauthorized content.
          </TermBlock>

          <TermBlock title="Service Availability">
            We strive to provide a fast and reliable experience. However, we do
            not guarantee uninterrupted or error-free operation of the service at
            all times.
          </TermBlock>

          <TermBlock title="No Data Storage">
            SendVia transfers files directly between connected devices using
            peer-to-peer technology. We do not store or retain your files on our
            servers.
          </TermBlock>

          <TermBlock title="Limitation of Liability">
            SendVia is provided "as is" without warranties of any kind. We are
            not liable for any loss of data, failed transfers, or damages arising
            from the use of the service.
          </TermBlock>

          <TermBlock title="User Responsibility">
            You are solely responsible for the files you share and must ensure
            that your usage complies with applicable laws and regulations.
          </TermBlock>

          <TermBlock title="Changes to These Terms">
            We may update these terms from time to time. Continued use of the
            service after updates constitutes acceptance of the revised terms.
          </TermBlock>

          <TermBlock title="Contact">
            If you have questions regarding these Terms, please contact us
            through our official support channels.
          </TermBlock>

        </div>
      </section>

      <Footer />
    </main>
  )
}

function TermBlock({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        {children}
      </p>
    </div>
  )
}
