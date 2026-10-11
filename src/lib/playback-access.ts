export function canPlayContent(access: { signedIn: boolean; active: boolean; admin: boolean; agent: boolean; agentOnly: boolean }) {
  return access.admin || (access.signedIn && access.active && (!access.agentOnly || access.agent));
}

export function subscriptionIsActive(subscription: { active: boolean; endDate: string } | null, now: number) {
  return !!subscription?.active && new Date(subscription.endDate).getTime() > now;
}