import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState } from "react";

interface props{
 mainContent: string,
 toolTipContent: string,
 className: string,
 useButton: boolean,
 disabled?:any,
 setCopyToClipboard?: () => void,
 onMouseLeave?: () => void;
 onClick?:() => void,
 progress?:any,
 receiveProgress?:any;
 entity?:any
}

export function ShowTooltipInContent({mainContent,toolTipContent,className,useButton,setCopyToClipboard,onMouseLeave,disabled,onClick,progress,receiveProgress,entity}: props) {

  const [isCopied, setIsCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(mainContent);
    setIsCopied(true);
    setCopyToClipboard?.();
  }

  const cssClass = `${className} ${disabled ? 'cursor-not-allowed opacity-30' : ''}`;
  let label = mainContent;

  if (entity === "fileUpload") {
    if (progress > 0 && progress < 100) {
      label = `${mainContent} ${progress}%`;
    } else if (progress === 100) {
      label = "Reshare";
    }
  }

  else if (entity === "attachments") {
    if (receiveProgress > 0 && receiveProgress < 100) {
      label = `${mainContent} ${receiveProgress}%`;
    }
  }

  const content = useButton
    ? <Button className={cssClass} variant="outline" onClick={!disabled ? onClick : undefined} disabled={disabled}>
    {label}
  </Button>
    : <div className={cssClass} onClick={!disabled ? onClick : undefined}>{label}</div>;

  if (!toolTipContent?.trim()) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {content}
      </TooltipTrigger>

      <TooltipContent>
        <p onClick={handleCopy} onMouseLeave={onMouseLeave}>
          {toolTipContent}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

