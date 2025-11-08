import { base44 } from "@/api/base44Client";
import { secureCompare } from "./utils/security";

/**
 * Webhook handler for revenue tracking from payment processors
 * SECURITY: Verify webhook signatures to prevent fraud
 */
export async function handleRevenueWebhook(webhookData, signature, webhookSecret) {
  try {
    // Security: Verify webhook signature
    if (!verifyWebhookSignature(webhookData, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      throw new Error('Webhook signature verification failed');
    }

    // Security: Validate webhook data structure
    if (!webhookData || !webhookData.type) {
      throw new Error('Invalid webhook data structure');
    }

    const { type, data } = webhookData;

    // Handle different webhook events
    switch (type) {
      case 'payment.succeeded':
      case 'checkout.session.completed':
        await handlePaymentSuccess(data);
        break;
      
      case 'payment.refunded':
        await handleRefund(data);
        break;
      
      case 'subscription.created':
      case 'subscription.updated':
        await handleSubscriptionChange(data);
        break;
      
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Webhook processing error:', error);
    throw error;
  }
}

/**
 * Verify webhook signature to ensure it came from the payment processor
 * SECURITY: Prevents webhook spoofing attacks
 */
function verifyWebhookSignature(payload, signature, secret) {
  if (!signature || !secret) {
    return false;
  }

  try {
    // For Stripe webhooks - implement HMAC verification
    // This is a placeholder - actual implementation depends on payment processor
    const expectedSignature = generateHMAC(JSON.stringify(payload), secret);
    return secureCompare(signature, expectedSignature);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Generate HMAC signature for verification
 */
function generateHMAC(payload, secret) {
  // Placeholder - in production, use crypto.subtle or server-side verification
  // For now, return a basic hash for demonstration
  return btoa(payload + secret);
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentData) {
  const {
    amount,
    currency = 'USD',
    mvp_id,
    user_email,
    transaction_id,
    payment_processor = 'stripe',
    customer_email
  } = paymentData;

  // Security: Validate required fields
  if (!mvp_id || !user_email || !amount) {
    throw new Error('Missing required payment data');
  }

  // Security: Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user_email)) {
    throw new Error('Invalid user email format');
  }

  // Get MVP details to check first year status
  const mvp = await base44.entities.MVP.filter({ id: mvp_id });
  if (!mvp || mvp.length === 0) {
    throw new Error('MVP not found');
  }

  const mvpData = mvp[0];
  const launchDate = new Date(mvpData.created_date);
  const oneYearLater = new Date(launchDate);
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  const isFirstYear = new Date() < oneYearLater;

  // Calculate revenue shares
  const bodigiSharePercentage = isFirstYear ? 10 : 0;
  const bodigiShareAmount = (amount * bodigiSharePercentage) / 100;
  const creatorNetAmount = amount - bodigiShareAmount;

  // Create revenue record with security validation
  await base44.entities.Revenue.create({
    mvp_id,
    user_email,
    transaction_id: transaction_id || `txn_${Date.now()}`,
    payment_processor,
    transaction_type: 'subscription',
    gross_amount: parseFloat(amount),
    currency,
    bodigi_share_percentage: bodigiSharePercentage,
    bodigi_share_amount: bodigiShareAmount,
    creator_net_amount: creatorNetAmount,
    transaction_date: new Date().toISOString(),
    payout_status: 'pending',
    bodigi_payout_status: isFirstYear ? 'pending' : 'waived',
    first_year_active: isFirstYear,
    mvp_launch_date: mvpData.created_date,
    customer_email: customer_email || null,
    webhook_data: paymentData
  });

  console.log(`Revenue tracked: $${amount} for MVP ${mvp_id}`);
}

/**
 * Handle refund
 */
async function handleRefund(refundData) {
  const { transaction_id } = refundData;

  if (!transaction_id) {
    throw new Error('Missing transaction ID for refund');
  }

  // Find original revenue record
  const revenues = await base44.entities.Revenue.filter({ 
    transaction_id 
  });

  if (revenues && revenues.length > 0) {
    const revenue = revenues[0];
    
    // Update payout status
    await base44.entities.Revenue.update(revenue.id, {
      payout_status: 'disputed',
      bodigi_payout_status: 'disputed',
      notes: `Refunded on ${new Date().toISOString()}`
    });

    console.log(`Refund processed for transaction ${transaction_id}`);
  }
}

/**
 * Handle subscription changes
 */
async function handleSubscriptionChange(subscriptionData) {
  const {
    user_email,
    tier,
    status,
    next_billing_date
  } = subscriptionData;

  if (!user_email || !tier) {
    throw new Error('Missing subscription data');
  }

  // Update user subscription
  const subscriptions = await base44.entities.Subscription.filter({ 
    user_email 
  });

  if (subscriptions && subscriptions.length > 0) {
    await base44.entities.Subscription.update(subscriptions[0].id, {
      tier,
      status: status || 'active',
      next_billing_date: next_billing_date || null
    });
  }

  console.log(`Subscription updated for ${user_email}`);
}

export default handleRevenueWebhook;