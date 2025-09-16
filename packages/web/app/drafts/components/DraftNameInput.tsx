import { Input } from '@/app/invoice/components';

type Props = {
  draftName: string;
  setDraftName: (name: string) => void;
};

export function DraftNameInput({ draftName, setDraftName }: Props) {
  return (
    <Input
      type="text"
      placeholder="Draft name"
      value={draftName}
      onChange={(e) => setDraftName(e.target.value)}
      className="rounded-md border px-2 py-1"
    />
  );
}
