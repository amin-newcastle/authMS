import { z } from 'zod';

// A schema is a checklist for the data a client sends to the API.
// TypeScript checks our code; Zod checks the actual data when a request arrives.
// z.object keeps only the fields listed here, so extra fields are removed.
export const registrationSchema = z.object({
  username: z
    .string({ error: 'Username is required and must be a string' })
    // Remove spaces at the start and end: " alex " becomes "alex".
    // Check the length of that cleaned username before it is saved.
    .trim()
    .min(3, 'Username must be at least 3 characters long')
    .max(32, 'Username must be at most 32 characters long'),
  password: z
    .string({ error: 'Password is required and must be a string' })
    // Keep spaces exactly as typed because they can be part of the password.
    .min(8, 'Password must be at least 8 characters long')
    .max(72, 'Password must be at most 72 characters long')
    // Bytes measure storage size; some characters, such as emoji, use several.
    // bcrypt only reads the first 72 bytes of a password. Check the byte count
    // too, so no part of an accepted password is silently ignored.
    .refine((password) => Buffer.byteLength(password, 'utf8') <= 72, {
      message: 'Password must be at most 72 bytes in UTF-8',
    }),
});

// Older accounts may have shorter usernames or passwords than new accounts allow.
// Login checks that both fields are filled in and keeps their exact characters.
export const loginSchema = z.object({
  username: z
    .string({ error: 'Username is required and must be a string' })
    // Check a copy with spaces removed from the ends to reject blank input.
    // Keep the original username when looking up the account.
    .refine((username) => username.trim().length > 0, {
      message: 'Username is required',
    }),
  password: z
    .string({ error: 'Password is required and must be a string' })
    .min(1, 'Password is required'),
});

// Build the TypeScript input types from the same checklists used above.
// Changing a schema also updates its type, so we do not maintain two definitions.
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
