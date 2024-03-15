import { Selection } from "@tiptap/pm/state";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
interface EditorClassNames {
  noBorder?: boolean;
  borderOnFocus?: boolean;
  customClassName?: string;
}

export const getEditorClassNames = ({ noBorder, borderOnFocus, customClassName }: EditorClassNames) =>
  cn(
    "relative w-full max-w-full sm:rounded-lg mt-2 p-3 relative focus:outline-none rounded-md",
    noBorder ? "" : "border border-custom-border-200",
    borderOnFocus ? "focus:border border-custom-border-300" : "focus:border-0",
    customClassName
  );

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to find the parent node of a specific type
export function findParentNodeOfType(selection: Selection, typeName: string) {
  let depth = selection.$anchor.depth;
  while (depth > 0) {
    const node = selection.$anchor.node(depth);
    if (node.type.name === typeName) {
      return { node, pos: selection.$anchor.start(depth) - 1 };
    }
    depth--;
  }
  return null;
}

export const findTableAncestor = (node: Node | null): HTMLTableElement | null => {
  while (node !== null && node.nodeName !== "TABLE") {
    node = node.parentNode;
  }
  return node as HTMLTableElement;
};

export const getTrimmedHTML = (html: string) => {
  html = html.replace(/^(<p><\/p>)+/, "");
  html = html.replace(/(<p><\/p>)+$/, "");
  return html;
};

export const isValidHttpUrl = (string: string): boolean => {
  let url: URL;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};
