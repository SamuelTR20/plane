import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
// hooks
import { IGanttBlock, useChart } from "components/gantt-chart";
// helpers
import { cn } from "helpers/common.helper";

type Props = {
  block: IGanttBlock;
  blockToRender: (data: any, textDisplacement: number) => React.ReactNode;
  handleBlock: (totalBlockShifts: number, dragDirection: "left" | "right" | "move") => void;
  enableBlockLeftResize: boolean;
  enableBlockRightResize: boolean;
  enableBlockMove: boolean;
};

export const ChartDraggable: React.FC<Props> = (props) => {
  const { block, blockToRender, handleBlock, enableBlockLeftResize, enableBlockRightResize, enableBlockMove } = props;
  // states
  const [isLeftResizing, setIsLeftResizing] = useState(false);
  const [isRightResizing, setIsRightResizing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [posFromLeft, setPosFromLeft] = useState<number | null>(null);
  // refs
  const resizableRef = useRef<HTMLDivElement>(null);
  // chart hook
  const { currentViewData, scrollLeft } = useChart();
  // check if cursor reaches either end while resizing/dragging
  const checkScrollEnd = (e: MouseEvent): number => {
    const SCROLL_THRESHOLD = 70;

    let delWidth = 0;

    const ganttContainer = document.querySelector("#gantt-container") as HTMLDivElement;
    const ganttSidebar = document.querySelector("#gantt-sidebar") as HTMLDivElement;

    const scrollContainer = document.querySelector("#scroll-container") as HTMLDivElement;

    if (!ganttContainer || !ganttSidebar || !scrollContainer) return 0;

    const posFromLeft = e.clientX;
    // manually scroll to left if reached the left end while dragging
    if (posFromLeft - (ganttContainer.getBoundingClientRect().left + ganttSidebar.clientWidth) <= SCROLL_THRESHOLD) {
      if (e.movementX > 0) return 0;

      delWidth = -5;

      scrollContainer.scrollBy(delWidth, 0);
    } else delWidth = e.movementX;

    // manually scroll to right if reached the right end while dragging
    const posFromRight = ganttContainer.getBoundingClientRect().right - e.clientX;
    if (posFromRight <= SCROLL_THRESHOLD) {
      if (e.movementX < 0) return 0;

      delWidth = 5;

      scrollContainer.scrollBy(delWidth, 0);
    } else delWidth = e.movementX;

    return delWidth;
  };
  // handle block resize from the left end
  const handleBlockLeftResize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!currentViewData || !resizableRef.current || !block.position) return;

    if (e.button !== 0) return;

    const resizableDiv = resizableRef.current;

    const columnWidth = currentViewData.data.width;

    const blockInitialWidth = resizableDiv.clientWidth ?? parseInt(block.position.width.toString(), 10);

    let initialWidth = resizableDiv.clientWidth ?? parseInt(block.position.width.toString(), 10);
    let initialMarginLeft = parseInt(resizableDiv.style.marginLeft);

    const handleMouseMove = (e: MouseEvent) => {
      let delWidth = 0;

      delWidth = checkScrollEnd(e);

      // calculate new width and update the initialMarginLeft using -=
      const newWidth = Math.round((initialWidth -= delWidth) / columnWidth) * columnWidth;
      // calculate new marginLeft and update the initial marginLeft to the newly calculated one
      const newMarginLeft = initialMarginLeft - (newWidth - (block.position?.width ?? 0));
      initialMarginLeft = newMarginLeft;

      // block needs to be at least 1 column wide
      if (newWidth < columnWidth) return;

      resizableDiv.style.width = `${newWidth}px`;
      resizableDiv.style.marginLeft = `${newMarginLeft}px`;

      if (block.position) {
        block.position.width = newWidth;
        block.position.marginLeft = newMarginLeft;
      }
    };

    // remove event listeners and call block handler with the updated start date
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      const totalBlockShifts = Math.ceil((resizableDiv.clientWidth - blockInitialWidth) / columnWidth);

      handleBlock(totalBlockShifts, "left");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  // handle block resize from the right end
  const handleBlockRightResize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!currentViewData || !resizableRef.current || !block.position) return;

    if (e.button !== 0) return;

    const resizableDiv = resizableRef.current;

    const columnWidth = currentViewData.data.width;

    const blockInitialWidth = resizableDiv.clientWidth ?? parseInt(block.position.width.toString(), 10);

    let initialWidth = resizableDiv.clientWidth ?? parseInt(block.position.width.toString(), 10);

    const handleMouseMove = (e: MouseEvent) => {
      let delWidth = 0;

      delWidth = checkScrollEnd(e);

      // calculate new width and update the initialMarginLeft using +=
      const newWidth = Math.round((initialWidth += delWidth) / columnWidth) * columnWidth;

      // block needs to be at least 1 column wide
      if (newWidth < columnWidth) return;

      resizableDiv.style.width = `${Math.max(newWidth, 80)}px`;
      if (block.position) block.position.width = Math.max(newWidth, 80);
    };

    // remove event listeners and call block handler with the updated target date
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      const totalBlockShifts = Math.ceil((resizableDiv.clientWidth - blockInitialWidth) / columnWidth);

      handleBlock(totalBlockShifts, "right");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  // handle block x-axis move
  const handleBlockMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!enableBlockMove || !currentViewData || !resizableRef.current || !block.position) return;

    if (e.button !== 0) return;

    const resizableDiv = resizableRef.current;

    const columnWidth = currentViewData.data.width;

    const blockInitialMarginLeft = parseInt(resizableDiv.style.marginLeft);

    let initialMarginLeft = parseInt(resizableDiv.style.marginLeft);

    const handleMouseMove = (e: MouseEvent) => {
      setIsMoving(true);

      let delWidth = 0;

      delWidth = checkScrollEnd(e);

      // calculate new marginLeft and update the initial marginLeft using -=
      const newMarginLeft = Math.round((initialMarginLeft += delWidth) / columnWidth) * columnWidth;

      resizableDiv.style.marginLeft = `${newMarginLeft}px`;

      if (block.position) block.position.marginLeft = newMarginLeft;
    };

    // remove event listeners and call block handler with the updated dates
    const handleMouseUp = () => {
      setIsMoving(false);

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      const totalBlockShifts = Math.ceil(
        (parseInt(resizableDiv.style.marginLeft) - blockInitialMarginLeft) / columnWidth
      );

      handleBlock(totalBlockShifts, "move");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  // scroll to a hidden block
  const handleScrollToBlock = () => {
    const scrollContainer = document.querySelector("#scroll-container") as HTMLDivElement;
    if (!scrollContainer || !block.position) return;
    // update container's scroll position to the block's position
    scrollContainer.scrollLeft = block.position.marginLeft - 4;
  };
  // update block position from viewport's left end on scroll
  useEffect(() => {
    const block = resizableRef.current;

    if (!block) return;

    setPosFromLeft(block.getBoundingClientRect().left);
  }, [scrollLeft]);
  // check if block is hidden on either side
  const isBlockHiddenOnLeft =
    block.position?.marginLeft &&
    block.position?.width &&
    scrollLeft > block.position.marginLeft + block.position.width;
  const isBlockHiddenOnRight = posFromLeft && window && posFromLeft > window.innerWidth;

  const textDisplacement = scrollLeft - (block.position?.marginLeft ?? 0);

  return (
    <>
      {/* move to left side hidden block button */}
      {isBlockHiddenOnLeft && (
        <div
          className="absolute top-1/2 z-[1] grid h-8 w-8 cursor-pointer place-items-center rounded border border-custom-border-300 bg-custom-background-80 text-custom-text-200 hover:text-custom-text-100"
          onClick={handleScrollToBlock}
          style={{
            transform: `translate(${scrollLeft + 4}px, -50%)`,
          }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </div>
      )}
      {/* move to right side hidden block button */}
      {isBlockHiddenOnRight && (
        <div
          className="absolute top-1/2 z-[1] grid h-8 w-8 cursor-pointer place-items-center rounded border border-custom-border-300 bg-custom-background-80 text-custom-text-200 hover:text-custom-text-100"
          onClick={handleScrollToBlock}
          style={{
            transform: `translate(${(block.position?.marginLeft ?? 0) - posFromLeft + window.innerWidth - 36}px, -50%)`,
          }}
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      )}
      <div
        id={`block-${block.id}`}
        ref={resizableRef}
        className="group relative inline-flex h-full cursor-pointer items-center font-medium transition-all"
        style={{
          marginLeft: `${block.position?.marginLeft}px`,
          width: `${block.position?.width}px`,
        }}
      >
        {/* left resize drag handle */}
        {enableBlockLeftResize && (
          <>
            <div
              onMouseDown={handleBlockLeftResize}
              onMouseEnter={() => setIsLeftResizing(true)}
              onMouseLeave={() => setIsLeftResizing(false)}
              className="absolute -left-2.5 top-1/2 -translate-y-1/2 z-[3] h-full w-6 cursor-col-resize rounded-md"
            />
            <div
              className={cn(
                "absolute left-1 top-1/2 -translate-y-1/2 h-7 w-1 rounded-sm bg-custom-background-100 transition-all duration-300",
                {
                  "-left-2.5": isLeftResizing,
                }
              )}
            />
          </>
        )}
        <div
          className={cn("relative z-[2] flex h-8 w-full items-center rounded", {
            "pointer-events-none": isMoving,
          })}
          onMouseDown={handleBlockMove}
        >
          {blockToRender(block.data, textDisplacement)}
        </div>
        {/* right resize drag handle */}
        {enableBlockRightResize && (
          <>
            <div
              onMouseDown={handleBlockRightResize}
              onMouseEnter={() => setIsRightResizing(true)}
              onMouseLeave={() => setIsRightResizing(false)}
              className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-[2] h-full w-6 cursor-col-resize rounded-md"
            />
            <div
              className={cn(
                "absolute right-1 top-1/2 -translate-y-1/2 h-7 w-1 rounded-sm bg-custom-background-100 transition-all duration-300",
                {
                  "-right-2.5": isRightResizing,
                }
              )}
            />
          </>
        )}
      </div>
    </>
  );
};
