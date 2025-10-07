// src/content/config.ts

import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content', 
  schema: z.object({
    // ... otras propiedades ...
    
    // CORRECCIÓN: Usar z.object() para imágenes importadas, o Image() si tienes la función importada
    heroImage: z.object({
        src: z.string(), 
        width: z.number(), 
        height: z.number(), 
        format: z.string(),
    }).optional(), 
    
  }),
});

export const collections = { blog };