'use client'
import { UseUploadingFiles } from "@/app/context/uploading-file-context";
import { ShowTooltipInContent } from "./tooltip-content";

export default function Attachements({ downloadAttachments, receiveProgress, isReceiveFinalizing }: any) {
    const { uploadingFiles } = UseUploadingFiles();
    const progress = Number(receiveProgress) ?? 0;

    // Files are truly ready only when progress is 100 AND finalization is complete
    const filesReady = progress === 100 && !isReceiveFinalizing;
    const isReceiving = progress !== 0 && progress !== 100;
    const isFinalizing = progress === 100 && isReceiveFinalizing;

    const buttonLabel = isReceiving
        ? 'Receiving Files…'
        : isFinalizing
            ? 'Preparing Files…'
            : 'Save Received Files';

    const tooltipLabel = (uploadingFiles.length === 0 && progress === 0)
        ? 'No files for download'
        : isReceiving
            ? 'Hang tight! Receiving your files…'
            : isFinalizing
                ? 'Almost there! Finalizing your files…'
                : 'Click to Download';

    return (
        <div className="rounded-2xl border p-8 shadow-md space-y-6 border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-xl font-semibold">
                Received Files
                {/* Show "keep tab open" warning during receiving AND finalizing */}
                {(isReceiving || isFinalizing) && (
                    <p className="flex lg:hidden mt-1 items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M10.29 3.86l-7.1 12.29A2 2 0 005 19h14a2 2 0 001.81-2.85l-7.1-12.29a2 2 0 00-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        Keep this tab open while the transfer is in progress.
                    </p>
                )}
            </h3>

            {/* Progress bar — visible during receiving, shows "Preparing…" pulse during finalization */}
            {(isReceiving || isFinalizing) && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                        <span>{isFinalizing ? 'Preparing file…' : 'Receiving…'}</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${isFinalizing ? 'animate-pulse bg-yellow-400' : 'bg-slate-900 dark:bg-white'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {uploadingFiles.length === 0 ? (
                <label className="flex items-center justify-center h-48 border-2 border-dashed rounded-xl
                    border-gray-300 dark:border-slate-700 hover:border-slate-400 transition text-gray-500">
                    <div className="font-medium">
                        {/* Context-aware empty state message */}
                        {isFinalizing ? 'Finalizing received files…' : 'No File Received Yet'}
                    </div>
                </label>
            ) : (
                <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-700 p-3 space-y-2 text-sm">
                    {uploadingFiles.map((file: any, i: number) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 truncate bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-md"
                        >
                            <span>📄</span>
                            <span className="truncate flex-1">{file.name ?? file.metaData ?? "Unnamed file"}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end">
                <ShowTooltipInContent
                    mainContent={buttonLabel}
                    toolTipContent={tooltipLabel}
                    className="w-full rounded-xl py-3 text-center font-medium transition bg-slate-900 text-white dark:bg-white dark:text-black"
                    useButton={false}
                    disabled={!filesReady || uploadingFiles.length === 0}
                    onClick={downloadAttachments}
                    receiveProgress={receiveProgress}
                    entity='attachments'
                />
            </div>
        </div>
    );
}
