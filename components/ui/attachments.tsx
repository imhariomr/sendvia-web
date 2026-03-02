'use client'
import { UseUploadingFiles } from "@/app/context/uploading-file-context";
import { useRef, useState } from "react";
import { ShowTooltipInContent } from "./tooltip-content";

export default function Attachements({downloadAttachments,receiveProgress}:any) {
    const { uploadingFiles, setUploadingFiles } = UseUploadingFiles();
    let progess = Number(receiveProgress) ?? 0;
    return (
        <div className={`rounded-2xl border p-8 shadow-md space-y-6 border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900`}>
            <h3 className="text-xl font-semibold">
                Received Files
            </h3>
            {
                uploadingFiles.length === 0 && (<label
                    className="flex items-center justify-center h-48 border-2 border-dashed rounded-xl cursor-pointer
                border-gray-300 dark:border-slate-700 hover:border-slate-400
                transition text-gray-500">
                    <div className="font-medium">No File Recieved Yet</div>
                </label>)
            }

            {uploadingFiles.length > 0 && (
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
                <ShowTooltipInContent mainContent={(progess!== 100 && progess!== 0) ? 'Recieving Files' : 'Download Files'} toolTipContent={(uploadingFiles.length === 0 && progess === 0) ? 'No Files for download' : (progess!== 100 && uploadingFiles.length !== 0 ) ? 'Hang tight! Receiving your files...' : 'Click to Download'}
                className={'w-full rounded-xl py-3 text-center font-medium transition bg-slate-900 text-white dark:bg-white dark:text-black'}
                useButton={false} disabled={uploadingFiles.length === 0 || progess!== 100} onClick={downloadAttachments} receiveProgress={receiveProgress} entity='attachments'/>
            </div>
        </div>
    );
}
