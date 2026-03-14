"use client"

import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"

export default function HowToSharePage() {
  return (
    <main className="min-h-screen bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors">

      <Navbar page="HowToSharePage" />

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 space-y-12">

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-semibold">
              How to Share Files Online with SendVia
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().getFullYear()}
            </p>

            <p className="text-gray-600 dark:text-gray-300">
              SendVia allows you to share files instantly using secure
              peer-to-peer technology. Files transfer directly between
              devices without uploading them to any server. Follow the
              simple steps below to start sending files online.
            </p>
          </div>

          <TermBlock title="Step 1 — Start a Sharing Session">
            Click on the <strong>Start Sharing</strong> button or navigate to{" "}
            <strong>https://sendvia.site/sharing</strong>. This will generate a
            unique connection code for your device which allows other devices
            to connect securely.
          </TermBlock>

          <TermBlock title="Step 2 — Open SendVia on the Other Device">
            On the second device, repeat the same process by opening{" "}
            <strong>https://sendvia.site/sharing</strong>. A unique code will
            appear on that device as well. Now both devices will have their own
            connection codes displayed on screen.
          </TermBlock>

          <TermBlock title="Step 3 — Connect the Devices">
            From the device that will send the files, enter the connection code
            shown on the other device and click the <strong>Connect</strong>{" "}
            button. Make sure the receiving device is online and has the
            sharing page open.
          </TermBlock>

          <TermBlock title="Step 4 — Devices Are Now Connected">
            Once the connection is successful, both devices will establish a
            direct peer-to-peer link. This secure connection allows files to be
            transferred instantly without any server storage.
          </TermBlock>

          <TermBlock title="Step 5 — Select or Drag Your Files">
            Drag and drop your files into the transfer section or choose files
            from your device. Then click the <strong>Tap to Share</strong>{" "}
            button to begin the transfer.
          </TermBlock>

          <TermBlock title="Step 6 — File Transfer Begins">
            SendVia will start transferring the files directly between the two
            connected devices. Because the transfer is peer-to-peer, it is fast
            and does not require uploading files to the cloud.
          </TermBlock>

          <TermBlock title="Step 7 — Save the Received Files">
            After the transfer is completed, the receiving device can download
            the files by clicking the <strong>Save Received Files</strong>{" "}
            button. The files will then be saved locally on the device.
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