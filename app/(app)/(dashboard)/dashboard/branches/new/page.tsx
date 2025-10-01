import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireActiveOrgSession } from "@/lib/session";
import { createBranchAction } from "./../actions";

export default async function NewBranchPage() {
  await requireActiveOrgSession();

  return (
    <div className="mx-auto w-full max-w-xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>New Branch</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createBranchAction} className="space-y-4">
            <div>
              <Label className="mb-2 block font-medium text-sm" htmlFor="name">
                Name
              </Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label className="mb-2 block font-medium text-sm" htmlFor="slug">
                Slug
              </Label>
              <Input id="slug" name="slug" />
            </div>
            <div>
              <Label
                className="mb-2 block font-medium text-sm"
                htmlFor="address"
              >
                Address
              </Label>
              <Input id="address" name="address" />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
