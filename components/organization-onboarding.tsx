"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  acceptInvitation,
  createOrganization,
  setActiveOrganization,
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
      if (error) {
        throw new Error(error.message || "Accept failed");
      }
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
    <div className="mx-auto w-full max-w-xl p-6">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Создайте организацию</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {error ? <div className="text-red-500 text-sm">{error}</div> : null}
            <Input
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              value={name}
            />
            <Input
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Slug"
              value={slug}
            />
            <Button
              disabled={!(name && slug) || loading}
              onClick={handleCreate}
            >
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
              onChange={(e) => setInviteId(e.target.value)}
              placeholder="Invitation ID"
              value={inviteId}
            />
            <Button
              disabled={!inviteId || loading}
              onClick={handleAcceptInvite}
            >
              Принять приглашение
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
