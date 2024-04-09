// components
import { observer } from "mobx-react-lite";
import { TIssue } from "@plane/types";
import { EstimateDropdown } from "@/components/dropdowns";
// types

type Props = {
  issue: TIssue;
  onClose: () => void;
  onChange: (issue: TIssue, data: Partial<TIssue>, updates: any) => void;
  disabled: boolean;
};

export const SpreadsheetEstimateColumn: React.FC<Props> = observer((props: Props) => {
  const { issue, onChange, disabled, onClose } = props;

  return (
    <div className="h-11 border-b-[0.5px] border-custom-border-200">
      <EstimateDropdown
        value={issue.estimate_point}
        onChange={(data) =>
          onChange(issue, { estimate_point: data }, { changed_property: "estimate_point", change_details: data })
        }
        placeholder="Estimate"
        projectId={issue.project_id ?? undefined}
        disabled={disabled}
        buttonVariant="transparent-with-text"
        buttonClassName="rounded-none text-left"
        buttonContainerClassName="w-full"
        onClose={onClose}
      />
    </div>
  );
});
