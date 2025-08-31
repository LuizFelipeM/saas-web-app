# Stripe Setup for Pricing Page

## Overview
The pricing page now includes integration with Stripe checkout. Each plan tier is mapped to a specific Stripe price ID that will be used to create checkout sessions.

## Setup Steps

### 1. Create Products and Prices in Stripe Dashboard
1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** → **Add Product**
3. Create three products:
   - **Starter Plan**
   - **Professional Plan** 
   - **Enterprise Plan**

### 2. Create Price IDs
For each product, create a recurring price:
1. Click on the product
2. Click **Add Price**
3. Set the pricing:
   - **Starter**: $9/month
   - **Professional**: $29/month
   - **Enterprise**: $99/month
4. Copy the generated **Price ID** (starts with `price_`)

### 3. Update Configuration
Update the file `src/config/stripe.ts` with your actual price IDs:

```typescript
export const STRIPE_PRICE_IDS = {
  STARTER: {
    MONTHLY: "price_1ABC123DEF456", // Your actual Starter monthly price ID
    YEARLY: "price_1ABC123DEF789",  // Your actual Starter yearly price ID
  },
  PROFESSIONAL: {
    MONTHLY: "price_1DEF456GHI789", // Your actual Professional monthly price ID
    YEARLY: "price_1DEF456GHI012",  // Your actual Professional yearly price ID
  },
  ENTERPRISE: {
    MONTHLY: "price_1GHI789JKL012", // Your actual Enterprise monthly price ID
    YEARLY: "price_1GHI789JKL345",  // Your actual Enterprise yearly price ID
  },
} as const;
```

### 4. Environment Variables
Ensure these environment variables are set in your `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Your app URL
```

## How It Works

1. **User clicks "Get Started"** on a pricing plan
2. **Authentication check** - User must be signed in
3. **Organization check** - User must be part of an organization
4. **API call** to `/api/checkout` with:
   - `priceId`: The Stripe price ID for the selected plan
   - `organizationId`: The user's organization ID
5. **Stripe customer creation** (if user doesn't have one)
6. **Checkout session creation** with the selected plan
7. **Redirect to Stripe** checkout page
8. **Success/cancel handling** via webhook or redirect URLs

## Testing

1. Use Stripe test mode for development
2. Test with test credit card numbers:
   - **Success**: 4242 4242 4242 4242
   - **Decline**: 4000 0000 0000 0002
3. Check Stripe dashboard for successful test subscriptions

## Troubleshooting

- **"Price not found"**: Ensure price IDs are correct and active in Stripe
- **"Organization not found"**: User must be part of an organization
- **"Failed to create customer"**: Check Stripe API key permissions
- **Checkout session errors**: Verify success/cancel URLs are accessible

## Security Notes

- Price IDs are public (safe to expose in frontend)
- All checkout operations require authentication
- Organization membership is verified server-side
- Stripe handles payment security
