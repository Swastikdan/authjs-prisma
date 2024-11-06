import prisma from '@/lib/prisma';
import { hash } from 'bcrypt';
import { NextResponse } from 'next/server';
import { signUpSchema } from '@/lib/zod';
import { ZodError } from 'zod';
import { Resend } from 'resend';
import OtpEmail from '@/components/email/otp';
import { randomInt } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const { email, password, name } = await signUpSchema.parseAsync(body);
    const hashedPassword = await hash(password, 10);

    // Check if the user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Generate a 6-digit OTP and set its expiry time
    const code = randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 30 * 60 * 1000);

    // Create a new user in the database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        otp: code,
        otpExpires: expiry,
      },
    });

    // Send the OTP email
    await resend.emails.send({
      from: 'Binge Box <bingebox@mail.swastikdan.in>',
      to: email,
      subject: `${code} - Binge Box Sign-in Verification`,
      react: OtpEmail({ code, type: 'verify' }),
    });

    // Return the created user as the response
    return NextResponse.json(user);
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    // Handle other errors
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    // Handle unknown errors
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 400 }
    );
  }
}
