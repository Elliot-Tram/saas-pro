import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createToken, setSession, hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const code = request.nextUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.redirect(new URL("/login?error=google", appUrl));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/login?error=google", appUrl));
    }

    const redirectUri = `${appUrl}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(new URL("/login?error=google", appUrl));
    }

    const tokens = await tokenResponse.json();

    // Fetch user info
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(new URL("/login?error=google", appUrl));
    }

    const googleUser = await userInfoResponse.json();
    const { email, name } = googleUser as { email: string; name: string };

    if (!email) {
      return NextResponse.redirect(new URL("/login?error=google", appUrl));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { team: true },
    });

    if (existingUser) {
      // User exists: log them in
      const token = await createToken({
        userId: existingUser.id,
        teamId: existingUser.teamId,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
      });
      await setSession(token);
      return NextResponse.redirect(new URL("/", appUrl));
    }

    // User doesn't exist: create account
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await hashPassword(randomPassword);

    const { user, team } = await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          name: name || email,
        },
      });

      const user = await tx.user.create({
        data: {
          name: name || email,
          email,
          password: hashedPassword,
          role: "admin",
          teamId: team.id,
        },
      });

      return { user, team };
    });

    const token = await createToken({
      userId: user.id,
      teamId: team.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    await setSession(token);
    return NextResponse.redirect(new URL("/onboarding", appUrl));
  } catch {
    return NextResponse.redirect(new URL("/login?error=google", appUrl));
  }
}
