import { DraftDetails } from '@/app/drafts/_lib/getDraftsByUser';

type Props = {
  drafts: DraftDetails[];
  currentDraftName: string;
  onSelect: (draft: DraftDetails) => void;
};

export function DraftSelector({ drafts, currentDraftName, onSelect }: Props) {
  return (
    <select
      value={currentDraftName}
      onChange={(e) => {
        const draft = drafts.find((d) => d.name === e.target.value);
        if (draft) onSelect(draft);
      }}
      className="rounded-md border px-2 py-1"
    >
      <option value="">-- Select Draft --</option>
      {drafts.map((d) => (
        <option key={d.name} value={d.name}>
          {d.name}
        </option>
      ))}
    </select>
  );
}
