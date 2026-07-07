/**
 * Validation schemas for Contact Form and Admin Operations
 * Using Zod for type-safe validation
 */

import { z } from 'zod';

// Contact Form Submission Schema
export const ContactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase(),
  
  subject: z
    .string()
    .max(200, 'Subject must not exceed 200 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must not exceed 5000 characters')
    .trim(),
  
  service: z
    .union([
      z.enum([
        'general', 
        'web-development', 
        'ui-ux-design', 
        'api-development', 
        'mobile-app-development', 
        'cloud-devops', 
        'seo-optimization',
        'other'
      ]),
      z.literal(''),
      z.null()
    ])
    .transform((val) => (val === '' || val === null ? 'general' : val))
    .default('general'),
});

// Admin Reply Schema
export const AdminReplySchema = z.object({
  messageId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid message ID'),
  
  reply: z
    .string()
    .min(10, 'Reply must be at least 10 characters')
    .max(5000, 'Reply must not exceed 5000 characters')
    .trim(),
});

// Message Query/Filter Schema
export const MessageQuerySchema = z.object({
  page: z
    .union([z.string(), z.number(), z.null()])
    .transform((val) => {
      if (!val || val === '' || val === 'null') return 1;
      const num = parseInt(String(val), 10);
      return isNaN(num) || num < 1 ? 1 : num;
    })
    .default(1)
    .optional()
    .or(z.number()),
  
  limit: z
    .union([z.string(), z.number(), z.null()])
    .transform((val) => {
      if (!val || val === '' || val === 'null') return 10;
      const num = parseInt(String(val), 10);
      if (isNaN(num) || num < 1) return 10;
      if (num > 100) return 100;
      return num;
    })
    .default(10)
    .optional()
    .or(z.number()),
  
  service: z
    .union([z.string().max(160), z.null(), z.literal('')])
    .optional()
    .transform((val) => val === null || val === '' ? undefined : val),
  
  status: z
    .union([
      z.enum(['new', 'read', 'seen', 'replied', 'confirmed', 'completed', 'rejected', 'cancelled']),
      z.null(),
      z.literal('')
    ])
    .optional()
    .transform((val) => val === null || val === '' ? undefined : val),
  
  search: z
    .union([z.string(), z.null()])
    .transform((val) => val === null || val === '' ? undefined : val)
    .optional(),
  
  sortBy: z
    .union([z.enum(['latest', 'oldest', 'name', 'email']), z.null(), z.literal('')])
    .default('latest')
    .optional()
    .transform((val) => val === null || val === '' ? 'latest' : val),
}).passthrough();

/**
 * @typedef {z.infer<typeof ContactFormSchema>} ContactFormInput
 */

/**
 * @typedef {z.infer<typeof AdminReplySchema>} AdminReplyInput
 */

/**
 * @typedef {z.infer<typeof MessageQuerySchema>} MessageQueryInput
 */
