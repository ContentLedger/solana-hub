import { useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export type CreateCollectionDetailsProps = {
  name: string;
  duration: number;
  onChange?: (name: string, duration: number) => void;
};

export function CreateCollectionDetails({
  name,
  duration,
  onChange,
}: CreateCollectionDetailsProps) {
  const formRefs = useRef({
    name: null as HTMLInputElement | null,
    duration: null as HTMLInputElement | null,
  });

  const handleChange = useCallback(() => {
    onChange?.(
      formRefs.current["name"]?.value ?? "",
      parseInt(formRefs.current["duration"]?.value ?? "", 10)
    );
  }, [onChange]);

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
                ref={(el) => void (formRefs.current["name"] = el)}
                name="name"
                value={name}
                placeholder="Name of your collection"
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="duration">Auction Duration (sec)</Label>
              <Input
                ref={(el) => void (formRefs.current["duration"] = el)}
                name="duration"
                type="number"
                value={duration}
                placeholder="360"
                onChange={handleChange}
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
