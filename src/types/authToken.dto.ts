/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CredentialResponse, TokenResponse } from '@react-oauth/google';
import z from 'zod';

export function isCredentialResponse(args: any): args is CredentialResponse {
  return args?.credential;
}

export function isTokenResponse(args: any): args is TokenResponse {
  return args?.access_token;
}

export const AuthToken = z.preprocess((args, ctx) => {
  if (typeof args !== 'object') throw ctx.addIssue({
    path: ctx.path,
    code: z.ZodIssueCode.invalid_type,
    expected: "object",
    received: typeof args,
  });
  
  if (isCredentialResponse(args)) {
    return {
      access_token: args.credential,
      expires_in: 0,
      expires_at: Date.now() + 1000 * 60 * 60,
    }
  } else if (isTokenResponse(args)) {
    return {
      access_token: args.access_token,
      expires_in: args.expires_in,
      expires_at: Date.now() + args.expires_in * 1000,
    }
  }
  
  return args;
}, z.object({
  access_token: z.string(),
  expires_in: z.number(),
  expires_at: z.number(),
}));

export type AuthToken = z.infer<typeof AuthToken>;