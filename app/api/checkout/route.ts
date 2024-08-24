import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
const prisma = new PrismaClient();

type PlanName = 'Free' | 'Pro' | 'Enterprise';

interface Plan {
  priceMonthly?: number;
  priceYearly?: number;
}

const plans: Record<PlanName, Plan> = {
  Free: { priceMonthly: 0, priceYearly: 0 },
  Pro: { priceMonthly: 49900, priceYearly: 499900 },
  Enterprise: { priceMonthly: 99900, priceYearly: 999900 },
};

export async function POST(req: Request) {
  try {
    const { planName, planType } = await req.json();

    if (!Object.keys(plans).includes(planName)) {
      return NextResponse.json({ error: 'Invalid plan name' }, { status: 400 });
    }

    const selectedPlan = plans[planName as PlanName];
    const price = planType === 'monthly'
      ? selectedPlan.priceMonthly
      : selectedPlan.priceYearly;

    if (price === undefined) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'zar',
            product_data: {
              name: planName,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      metadata: {
        planType,
      },
    });

    return NextResponse.json({ redirectUrl: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
