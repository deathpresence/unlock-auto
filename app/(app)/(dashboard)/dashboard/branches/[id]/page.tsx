import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBranchById } from "@/db/tenant/queries";
import { requireActiveOrgSession } from "@/lib/session";
import { updateBranchAction } from "./../actions";

export default async function EditBranchPage(props: {
  params: Promise<{ id: string }>;
}) {
  await requireActiveOrgSession();
  const params = await props.params;
  const branch = await getBranchById(params.id);
  if (!branch) {
    return notFound();
  }

  return (
    <div className="mx-auto w-full max-w-xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Branch</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateBranchAction} className="space-y-4">
            <input name="id" type="hidden" value={String(params.id)} />
            <div>
              <Label className="mb-2 block font-medium text-sm" htmlFor="name">
                Name
              </Label>
              <Input
                defaultValue={String(branch.name)}
                id="name"
                name="name"
                required
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium text-sm" htmlFor="slug">
                Slug
              </Label>
              <Input defaultValue={branch.slug ?? ""} id="slug" name="slug" />
            </div>
            <div>
              <Label
                className="mb-2 block font-medium text-sm"
                htmlFor="address"
              >
                Address
              </Label>
              <Input
                defaultValue={branch.address ?? ""}
                id="address"
                name="address"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
