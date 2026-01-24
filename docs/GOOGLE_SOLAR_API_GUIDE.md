# Google Solar API Setup Guide

This guide explains how to obtain and configure Google API keys for the PEI Solar Panel Advisor application.

---

## Prerequisites

- A Google account
- A credit card for billing (required for API access, but free tier is generous)

---

## 1. Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click **"New Project"**
4. Enter a project name (e.g., "PEI Solar Advisor")
5. Click **"Create"**
6. Wait for the project to be created, then select it

### Step 2: Enable Billing

1. In the Cloud Console, go to **Billing** (hamburger menu > Billing)
2. Link a billing account to your project
3. Note: You won't be charged unless you exceed free tier limits

---

## 2. Enable Required APIs

### Google Maps Geocoding API (for address lookup)

1. Go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search for **"Geocoding API"**
3. Click on it and press **"Enable"**
4. Pricing: $5 per 1,000 requests (first $200/month free)

### Google Solar API (for solar potential data)

1. In the API Library, search for **"Solar API"**
2. Click on it and press **"Enable"**
3. Pricing: See [Solar API Pricing](https://developers.google.com/maps/documentation/solar/usage-and-billing)

**Note:** The Solar API provides:
- Building insights (roof area, solar potential)
- Data layers (annual flux, monthly flux, shade)
- Hourly shade information

---

## 3. Create API Keys

### Step 1: Go to Credentials

1. Navigate to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"API key"**

### Step 2: Create Geocoding API Key

1. After creating, click on the key to edit it
2. Rename it to "Geocoding API Key"
3. Under **API restrictions**, select "Restrict key"
4. Choose **"Geocoding API"** from the list
5. Click **Save**
6. Copy the key - this is your `GEOCODE_API_KEY`

### Step 3: Create Solar API Key (if using Solar API)

1. Create another API key
2. Rename it to "Solar API Key"
3. Under **API restrictions**, select "Restrict key"
4. Choose **"Solar API"** from the list
5. Click **Save**
6. Copy the key - this is your `SOLAR_API_KEY`

---

## 4. Google AI (Gemini) API Setup

The Gemini API is separate from Google Cloud and uses Google AI Studio.

### Step 1: Access Google AI Studio

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Accept the terms of service

### Step 2: Get API Key

1. Click on **"Get API key"** in the left sidebar
2. Click **"Create API key"**
3. Select your Google Cloud project (or create a new one)
4. Copy the generated API key

### Step 3: Create Multiple Keys (Recommended)

For this application, we use two separate Gemini keys:
- **GOOGLE_AI_API_KEY_1**: For roof image analysis (vision)
- **GOOGLE_AI_API_KEY_2**: For text summarization

You can create multiple keys by repeating Step 2.

### Gemini API Pricing

| Model | Free Tier | Paid Tier |
|-------|-----------|-----------|
| Gemini 1.5 Flash | 15 requests/minute, 1 million tokens/day | $0.075 per 1M input tokens |
| Gemini 1.5 Pro | 2 requests/minute, 32K tokens/day | $1.25 per 1M input tokens |

For this app, **Gemini 1.5 Flash** is recommended for cost-effectiveness.

---

## 5. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Google Maps Geocoding
GEOCODE_API_KEY=your_geocoding_api_key_here

# Google Solar API (optional - for advanced solar data)
SOLAR_API_KEY=your_solar_api_key_here

# Google AI (Gemini) - for roof analysis
GOOGLE_AI_API_KEY_1=your_gemini_key_for_vision_here

# Google AI (Gemini) - for text summarization
GOOGLE_AI_API_KEY_2=your_gemini_key_for_text_here
```

---

## 6. API Usage Limits & Best Practices

### Geocoding API
- Free: $200/month credit (~40,000 requests)
- Implement caching for repeated addresses
- Use address validation before geocoding

### Solar API
- Provides building-level solar potential
- Data available for US, some international coverage
- Cache results as building data doesn't change often

### Gemini API
- Free tier: 15 requests/minute
- Implement retry logic with exponential backoff
- Use structured prompts for consistent responses

---

## 7. Security Best Practices

1. **Never commit API keys to git**
   - Add `.env.local` to `.gitignore`
   - Use `.env.example` with placeholder values

2. **Restrict API keys**
   - Limit keys to specific APIs
   - Set referrer restrictions for client-side keys
   - Use IP restrictions for server-side keys

3. **Monitor usage**
   - Set up billing alerts in Google Cloud
   - Review usage regularly in the console

4. **Rotate keys periodically**
   - Create new keys before disabling old ones
   - Update environment variables accordingly

---

## 8. Troubleshooting

### "API key not valid" Error
- Check key is correctly copied (no extra spaces)
- Verify the API is enabled for your project
- Ensure billing is set up

### "Quota exceeded" Error
- Check your usage in Cloud Console
- Upgrade billing plan or wait for quota reset
- Implement request throttling

### "Permission denied" Error
- Verify API restrictions on the key
- Check project permissions
- Ensure correct project is selected

---

## 9. Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google AI Studio](https://aistudio.google.com/)
- [Geocoding API Documentation](https://developers.google.com/maps/documentation/geocoding)
- [Solar API Documentation](https://developers.google.com/maps/documentation/solar)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Billing & Pricing](https://cloud.google.com/pricing)

---

## 10. Quick Reference: API Endpoints

### Geocoding API
```
GET https://maps.googleapis.com/maps/api/geocode/json
  ?address={address}
  &key={GEOCODE_API_KEY}
```

### Solar API - Building Insights
```
GET https://solar.googleapis.com/v1/buildingInsights:findClosest
  ?location.latitude={lat}
  &location.longitude={lng}
  &key={SOLAR_API_KEY}
```

### Gemini API
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```
