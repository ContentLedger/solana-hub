import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export type CreateCollectionDetailsProps = {
  name: string;
  onChange?: (name: string) => void;
};

export function CreateCollectionDetails({
  name,
  onChange,
}: CreateCollectionDetailsProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    },
    [onChange]
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Collection Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                name="name"
                value={name}
                placeholder="Name of your collection"
                onChange={handleChange}
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
