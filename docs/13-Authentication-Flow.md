# Authentication Flow

## Purpose

This document defines the user authentication flows and entry methods for CineMatch. It maps user experiences and system transitions to the technical implementations described in the FRS, Domain-Driven Design (DDD) model, and Supabase database architecture.

The guiding principles of the authentication system are:
1. **Delegate Infrastructure:** Supabase handles core authentication mechanics (hashing, credential storage, tokens, OAuth providers, email verification, session state).
2. **Focus on Business Logic:** CineMatch manages application-specific user profiles, sessions metadata, and personalization preferences.
3. **Data Integrity:** Guest data (watchlists, ratings, preferences) must never be lost during account creation/migration.
4. **Extensibility:** The authentication flow must be designed to support future third-party identity providers (e.g., Apple Sign-In, GitHub, Microsoft) with minimal refactoring.

## Entry Methods

Users can access CineMatch through three distinct entry methods:

### 1. Email + Password
A standard registration method utilizing email address verification.
*   **Flow:**
    Register ➡️ Verify Email ➡️ Login ➡️ Onboarding (First time only) ➡️ Home

### 2. Google Sign-In
A frictionless login mechanism utilizing Google Account credentials.
*   **Flow:**
    Google OAuth Button ➡️ Supabase OAuth Provider ➡️ Check User Exists?
    *   **Yes:** Login ➡️ Home
    *   **No:** Create User ➡️ Onboarding ➡️ Home

### 3. Guest Mode
A path enabling anonymous discovery with temporary local-first personalization.
*   **Flow:**
    Continue as Guest ➡️ Create Guest Session ➡️ Generate Guest ID (Secure Browser Cookie) ➡️ Home

### Entry Method Comparison

| Method | Verification | Onboarding | Multi-device |
| :--- | :--- | :--- | :--- |
| **Email** | Yes | Yes | Yes |
| **Google** | Google | Yes | Yes |
| **Guest** | No | No | No |

## Email Sign Up Flow

## Google Sign In Flow

## Guest Session Flow

## Guest → Registered Migration

## Email Verification Flow

## Login Flow

## Forgot Password Flow

## Password Reset Flow

## Logout Flow

## Session Management

## Multi-device Behaviour

## Account Deletion Flow
