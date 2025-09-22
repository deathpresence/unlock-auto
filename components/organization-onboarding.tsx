"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  createOrganization,
  setActiveOrganization,
  acceptInvitation,
} from "@/lib/auth-client";

export function OrganizationOnboarding() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [inviteId, setInviteId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await createOrganization({ name, slug });
      if (error) throw new Error(error.message || "Create failed");
      if (data?.id) {
        await setActiveOrganization({ organizationId: data.id });
        window.location.assign("/chat");
      }
    } catch (e: any) {
      setError(e.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptInvite() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await acceptInvitation({
        invitationId: inviteId,
      });
      if (error) throw new Error(error.message || "Accept failed");
      const orgId =
        (data as any)?.invitation?.organizationId ||
        (data as any)?.member?.organizationId;
      if (orgId) {
        await setActiveOrganization({ organizationId: orgId });
        window.location.assign("/chat");
      }
    } catch (e: any) {
      setError(e.message || "Accept failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 w-full">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Создайте организацию</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {error ? <div className="text-red-500 text-sm">{error}</div> : null}
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <Button onClick={handleCreate} disabled={!name || !slug || loading}>
              Создать
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Приглашение в организацию</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder="Invitation ID"
              value={inviteId}
              onChange={(e) => setInviteId(e.target.value)}
            />
            <Button
              onClick={handleAcceptInvite}
              disabled={!inviteId || loading}
            >
              Принять приглашение
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
