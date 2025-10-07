import { defineCollection, z } from 'astro:content';

// 1. Define tu colección de blog
const blog = defineCollection({
  // Tipo de esquema (opcional, pero ayuda a la autocompletación)
  type: 'content', 
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Ejemplo de fecha para ordenamiento
    pubDate: z.coerce.date(), 
    // Etiqueta del post (Estrategia, Prompts, Automatización)
    tag: z.string(), 
    // Imagen principal del post
    heroImage: z.string().optional(), 
  }),
});

// 2. Exporta el objeto de colecciones
export const collections = { blog };