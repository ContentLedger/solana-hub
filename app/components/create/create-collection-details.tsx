import { Card, CardHeader } from "../ui/card";

export type CreateCollectionDetailsProps = {
  name: string;
};
export function CreateCollectionDetails({
  name,
}: CreateCollectionDetailsProps) {
  return (
    <Card className="w-full">
      <CardHeader>{name}</CardHeader>
    </Card>
  );
}
