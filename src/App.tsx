/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { 
  Upload, 
  Link as LinkIcon, 
  FileText, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Download,
  Trash2,
  ChevronRight,
  Volume2,
  Video,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createClient } from '@supabase/supabase-js';
import { AdUnit } from './components/AdUnit';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Supabase Initialization ---
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// --- Constants & Types ---

const MODELS = {
  TRANSCRIPTION: "gemini-3-flash-preview",
  SUMMARY: "gemini-3-flash-preview",
};

type AppState = 'idle' | 'uploading' | 'transcribing' | 'summarizing' | 'error';
type View = 'home' | 'blog' | 'about' | 'contact' | 'privacy' | 'terms' | 'article' | 'cookies';

interface TranscriptionResult {
  text: string;
  summary?: string;
  fileName?: string;
  fileType?: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  image: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: '0',
    title: 'Nueva Función: Resúmenes Ejecutivos con IA en TranscriAI',
    excerpt: 'Ahora no solo transcribimos tus audios, sino que extraemos la esencia con nuestra nueva herramienta de resúmenes inteligentes.',
    date: '22 de Marzo, 2026',
    category: 'Actualizaciones',
    image: 'https://picsum.photos/seed/ai-summary/800/400',
    content: `
# Nueva Función: Resúmenes Ejecutivos con IA en TranscriAI

Estamos emocionados de anunciar nuestra actualización más importante hasta la fecha: **Resúmenes Ejecutivos Inteligentes**.

## ¿Qué hay de nuevo?
Ya no tienes que leer transcripciones de 20 páginas para encontrar lo importante. Con un solo clic, TranscriAI analiza el texto y genera:
1. **Contexto General:** De qué trata el contenido.
2. **Puntos Clave:** Los hitos más importantes.
3. **Conclusiones:** Qué acciones o decisiones se derivan del audio.

## Cómo usarlo
Simplemente sube tu archivo o pega un enlace de YouTube, espera a que la transcripción termine y presiona el botón **"Generar Resumen Inteligente"**. ¡Es así de fácil!
    `
  },
  {
    id: '1',
    title: 'Cómo transcribir videos de YouTube con TranscriAI en 2026',
    excerpt: 'Aprende a usar nuestra herramienta para obtener el texto de cualquier video de YouTube de forma ética y ultra rápida.',
    date: '20 de Marzo, 2026',
    category: 'Guías',
    image: 'https://picsum.photos/seed/youtube-transcribe/800/400',
    content: `
# Cómo transcribir videos de YouTube con TranscriAI en 2026

La transcripción de videos se ha vuelto una herramienta esencial. En TranscriAI, hemos optimizado el proceso para que solo tengas que pegar un enlace.

## Ventajas de usar TranscriAI para YouTube
- **Sin instalaciones:** Todo ocurre en tu navegador.
- **Contexto inteligente:** Nuestra IA entiende el tema del video para mejorar la precisión.
- **Multilingüe:** Transcribimos videos en más de 50 idiomas automáticamente.

## Pasos para el éxito
1. Copia la URL del video de YouTube.
2. Pégala en la pestaña "Enlace" de TranscriAI.
3. Deja que nuestra IA haga el trabajo pesado por ti.
    `
  },
  {
    id: '2',
    title: 'TranscriAI vs Transcripción Manual: El fin de una era',
    excerpt: '¿Por qué seguir pagando por hora cuando puedes tener resultados profesionales en segundos con TranscriAI?',
    date: '18 de Marzo, 2026',
    category: 'Tecnología',
    image: 'https://picsum.photos/seed/ai-vs-human/800/400',
    content: `
# TranscriAI vs Transcripción Manual: El fin de una era

La precisión de la IA ha alcanzado niveles humanos, pero con una fracción del costo y el tiempo.

## Comparativa Directa
| Característica | Transcripción Manual | TranscriAI |
| :--- | :--- | :--- |
| **Tiempo (1h audio)** | 4-6 horas | < 1 minuto |
| **Costo** | Alto ($$$) | Gratuito/Bajo ($) |
| **Disponibilidad** | Horario laboral | 24/7 |
| **Resumen IA** | No incluido | Sí, con un clic |

En TranscriAI utilizamos **Gemini 3 Flash**, lo que nos permite ofrecer una velocidad sin precedentes sin sacrificar la calidad.
    `
  },
  {
    id: '3',
    title: '5 Consejos para transcripciones perfectas con TranscriAI',
    excerpt: 'Si quieres resultados impecables, necesitas un audio limpio. Aprende cómo optimizar tus grabaciones para nuestra IA.',
    date: '15 de Marzo, 2026',
    category: 'Tips',
    image: 'https://picsum.photos/seed/audio-tips/800/400',
    content: `
# 5 Consejos para transcripciones perfectas con TranscriAI

Para obtener una transcripción de alta calidad con nuestra IA, el audio original debe ser lo más claro posible. Aquí te dejamos 5 consejos prácticos:

1. **Elimina el ruido de fondo:** Busca un lugar silencioso. Apaga ventiladores o aires acondicionados.
2. **Usa un micrófono externo:** Incluso los auriculares de tu móvil suelen ser mejores que el micrófono integrado del portátil.
3. **Mantén una distancia constante:** Habla a unos 15-20 cm del micrófono para evitar distorsiones.
4. **Evita las interrupciones:** TranscriAI identifica hablantes, pero es más preciso si no se pisan al hablar.
5. **Formato de alta calidad:** Sube archivos en WAV o MP3 de alta tasa de bits para mejores resultados.
    `
  },
  {
    id: '4',
    title: 'TranscriAI: La mejor opción gratuita para audio a texto en 2026',
    excerpt: '¿Necesitas pasar un audio a texto sin gastar dinero? Te mostramos por qué TranscriAI es la herramienta líder.',
    date: '12 de Marzo, 2026',
    category: 'Guías',
    image: 'https://picsum.photos/seed/free-ai/800/400',
    content: `
# TranscriAI: La mejor opción gratuita para audio a texto en 2026

Existen muchas herramientas, pero TranscriAI ofrece una combinación única de potencia y accesibilidad.

## ¿Por qué elegirnos?
- **Sin registro obligatorio:** Empieza a transcribir al instante.
- **Tecnología Gemini:** Usamos los modelos más avanzados de Google.
- **Privacidad:** No almacenamos tus archivos permanentemente.

## Comparativa con otros
A diferencia de Google Docs o YouTube, TranscriAI te permite subir archivos locales y obtener resúmenes inteligentes en una sola interfaz limpia y sin anuncios intrusivos.
    `
  },
  {
    id: '5',
    title: 'La tecnología detrás de TranscriAI: ¿Cómo funciona?',
    excerpt: 'Entiende la tecnología ASR y los modelos de lenguaje que hacen posible TranscriAI.',
    date: '10 de Marzo, 2026',
    category: 'Tecnología',
    image: 'https://picsum.photos/seed/transcriai-tech/800/400',
    content: `
# La tecnología detrás de TranscriAI: ¿Cómo funciona?

TranscriAI utiliza una tecnología de vanguardia llamada ASR (Automatic Speech Recognition) potenciada por los modelos **Gemini 3** de Google.

## El flujo de trabajo de TranscriAI
1. **Captura y Limpieza:** Nuestra IA recibe el audio y aplica filtros para reducir el ruido.
2. **Análisis de Fonemas:** El sistema identifica los sonidos básicos del habla.
3. **Contextualización:** A diferencia de otros sistemas, TranscriAI analiza el tema completo para elegir la palabra correcta en caso de homófonos.
4. **Resumen Inteligente:** Una capa adicional de IA procesa el texto final para extraer conclusiones.

Gracias a esta arquitectura, logramos una precisión superior al 95% en condiciones normales.
    `
  },
  {
    id: '6',
    title: 'TranscriAI para estudiantes: Aprueba tus exámenes con IA',
    excerpt: 'Convierte tus grabaciones de clase en apuntes perfectos y resúmenes de estudio en segundos.',
    date: '08 de Marzo, 2026',
    category: 'Educación',
    image: 'https://picsum.photos/seed/student-ai/800/400',
    content: `
# TranscriAI para estudiantes: Aprueba tus exámenes con IA

Tomar apuntes a mano es cosa del pasado. Con TranscriAI, puedes concentrarte en entender la clase mientras nosotros escribimos por ti.

## Cómo usar TranscriAI en la universidad
- **Graba la clase:** Usa tu móvil para capturar el audio del profesor.
- **Sube el archivo:** TranscriAI convertirá la hora de clase en texto en menos de un minuto.
- **Genera el resumen:** Usa nuestra función de resumen para obtener los conceptos clave que entrarán en el examen.

## Ahorro de tiempo
Un estudiante promedio ahorra hasta 10 horas semanales de transcripción y organización de apuntes usando TranscriAI.
    `
  },
  {
    id: '7',
    title: 'TranscriAI y el Futuro del Procesamiento de Voz',
    excerpt: '¿Hacia dónde vamos? Traducción en tiempo real, análisis de sentimientos y transcripciones perfectas con TranscriAI.',
    date: '05 de Marzo, 2026',
    category: 'Tecnología',
    image: 'https://picsum.photos/seed/future-ai/800/400',
    content: `
# TranscriAI y el Futuro del Procesamiento de Voz

La IA no solo está aprendiendo a escribir lo que decimos, sino a entender nuestras emociones y el contexto cultural de nuestras palabras. En TranscriAI, estamos integrando estas capacidades para ofrecerte más que solo texto.

## Tendencias que estamos implementando
- **Traducción Instantánea:** Pronto podrás transcribir en un idioma y obtener el texto en otro al instante.
- **Detección de Tono:** Identificar si un hablante está siendo sarcástico, está enojado o entusiasmado.
- **Integración con Flujos de Trabajo:** Conectar TranscriAI directamente con tus herramientas de gestión de proyectos.

El futuro es apasionante y en TranscriAI estamos a la vanguardia de estos cambios para maximizar tu productividad.
    `
  },
  {
    id: '8',
    title: 'Domina el SEO de tus Videos con TranscriAI',
    excerpt: 'El contenido en video es genial, pero el texto es lo que Google lee. Aprende a posicionar tu web usando TranscriAI.',
    date: '03 de Marzo, 2026',
    category: 'Marketing',
    image: 'https://picsum.photos/seed/seo-marketing/800/400',
    content: `
# Domina el SEO de tus Videos con TranscriAI

Google todavía no puede "ver" videos de la misma forma que lee texto. Por eso, las transcripciones generadas por TranscriAI son tu mejor aliado para el SEO.

## Estrategia SEO Ganadora
1. **Publica la Transcripción Completa:** Añádela debajo de tu video en tu blog para que Google indexe cada palabra clave.
2. **Crea Artículos Derivados:** Usa el texto de TranscriAI para crear hilos de redes sociales o newsletters.
3. **Mejora la Accesibilidad:** El texto permite que los usuarios consuman el contenido incluso sin audio, mejorando tus métricas de retención.

Una web con texto optimizado por TranscriAI siempre posicionará mejor que una que solo tiene videos incrustados.
    `
  },
  {
    id: '9',
    title: 'Transcripción vs Subtitulado: ¿Qué necesitas?',
    excerpt: 'Parecen lo mismo, pero tienen objetivos diferentes. Te explicamos cómo TranscriAI te ayuda en ambos casos.',
    date: '01 de Marzo, 2026',
    category: 'Guías',
    image: 'https://picsum.photos/seed/subtitles-guide/800/400',
    content: `
# Transcripción vs Subtitulado: ¿Qué necesitas?

Mucha gente confunde estos términos, pero en el mundo profesional son cosas distintas. En TranscriAI, nos especializamos en darte la base perfecta para ambos.

## Transcripción con TranscriAI
Es el proceso de convertir audio a texto plano. Ideal para actas de reuniones, apuntes de clase o artículos de blog. Nuestra IA limpia el texto para que sea legible de inmediato.

## Subtitulado
Es la transcripción adaptada para video. Aunque TranscriAI entrega texto fluido, este sirve como el guion perfecto para tus herramientas de edición de video, ahorrándote horas de escritura manual.

En TranscriAI nos enfocamos en la transcripción y el resumen inteligente para que tú te enfoques en crear.
    `
  },
  {
    id: '10',
    title: 'Periodismo Ágil: Transcribe Entrevistas en Segundos',
    excerpt: 'Guía para periodistas: de la grabadora al papel sin perder la esencia, gracias a TranscriAI.',
    date: '28 de Febrero, 2026',
    category: 'Periodismo',
    image: 'https://picsum.photos/seed/journalism-ai/800/400',
    content: `
# Periodismo Ágil: Transcribe Entrevistas en Segundos

Para un periodista, transcribir una entrevista de una hora puede tomar hasta 4 horas de trabajo manual. Con TranscriAI, ese tiempo se reduce a menos de un minuto.

## Flujo de Trabajo para Periodistas
1. **Graba con Calidad:** Usa una grabadora digital o tu smartphone.
2. **Sube a TranscriAI:** Obtén el texto en bruto y el resumen ejecutivo rápidamente.
3. **Edita y Pule:** Revisa el texto para asegurar que las citas sean exactas y tengan el tono adecuado.

Ahorrar tiempo en la transcripción te permite dedicar más energía a la investigación y a la redacción de grandes historias.
    `
  },
  {
    id: '11',
    title: 'Potencia tu Podcast con Transcripciones de TranscriAI',
    excerpt: '¿Tienes un podcast? Aprende cómo TranscriAI te ayuda a llegar a una audiencia global y mejorar tu alcance.',
    date: '25 de Febrero, 2026',
    category: 'Podcasting',
    image: 'https://picsum.photos/seed/podcast-ai/800/400',
    content: `
# Potencia tu Podcast con Transcripciones de TranscriAI

El podcasting es un formato increíble, pero tiene una barrera: no es fácil de buscar ni de consumir para personas con problemas auditivos.

## Por qué usar TranscriAI para tu Podcast
- **Accesibilidad Total:** Haz que tu contenido sea inclusivo para todos.
- **SEO para Audio:** Google indexará el texto de tu podcast, atrayendo tráfico orgánico a tu sitio web.
- **Notas del Episodio:** Usa el resumen inteligente de TranscriAI para crear notas detalladas automáticamente.

Con TranscriAI, puedes procesar tus episodios en segundos y mejorar drásticamente el alcance de tu marca personal o corporativa.
    `
  },
  {
    id: '12',
    title: 'Productividad en Reuniones: Zoom y Teams con TranscriAI',
    excerpt: 'No pierdas ni un detalle de tus reuniones de trabajo. La guía definitiva para usar TranscriAI en la oficina.',
    date: '22 de Febrero, 2026',
    category: 'Productividad',
    image: 'https://picsum.photos/seed/meetings-ai/800/400',
    content: `
# Productividad en Reuniones: Zoom y Teams con TranscriAI

Las reuniones son necesarias, pero a veces se pierde información crítica. TranscriAI es tu mejor aliado para documentar cada acuerdo.

## Pasos para una Reunión Productiva
1. **Graba la Sesión:** Asegúrate de tener el consentimiento de los participantes.
2. **Sube el Archivo a TranscriAI:** Obtén el texto completo de la reunión.
3. **Genera un Resumen Ejecutivo:** Extrae los acuerdos, tareas pendientes y responsables automáticamente.

Tener un registro escrito de tus reuniones con TranscriAI mejora la transparencia y la ejecución de proyectos en cualquier equipo.
    `
  },
  {
    id: '13',
    title: 'Privacidad de Datos: Tu Seguridad en TranscriAI',
    excerpt: '¿Es seguro subir tus audios a la nube? Te explicamos cómo protegemos tu información en TranscriAI.',
    date: '20 de Febrero, 2026',
    category: 'Seguridad',
    image: 'https://picsum.photos/seed/security-ai/800/400',
    content: `
# Privacidad de Datos: Tu Seguridad en TranscriAI

La privacidad es nuestra prioridad absoluta. Cuando utilizas TranscriAI, nos aseguramos de que tus datos estén protegidos bajo los más altos estándares.

## Compromisos de TranscriAI
- **Encriptación de Extremo a Extremo:** Tus datos viajan seguros.
- **No Almacenamiento Permanente:** No guardamos tus archivos de audio una vez procesados.
- **Infraestructura Segura:** Utilizamos la potencia de Google Cloud para garantizar que tu información no sea accesible por terceros.

Puedes confiar en que tu información confidencial se maneja con el máximo cuidado profesional en nuestra plataforma.
    `
  },
  {
    id: '14',
    title: 'Transcribe Reels, TikToks e Instagram con TranscriAI',
    excerpt: 'Aprende a extraer el texto de los videos cortos más populares para reutilizar tu contenido con TranscriAI.',
    date: '18 de Febrero, 2026',
    category: 'Redes Sociales',
    image: 'https://picsum.photos/seed/social-ai/800/400',
    content: `
# Transcribe Reels, TikToks e Instagram con TranscriAI

Los videos cortos dominan las redes sociales, pero a veces necesitas el texto para subtitular o para crear un post en otra plataforma.

## Estrategia de Reutilización
1. **Descarga tu Video:** Obtén el archivo de tu red social favorita.
2. **Sube a TranscriAI:** Procesa el audio del video corto en segundos.
3. **Crea Contenido Derivado:** Usa el texto para crear hilos de Twitter, posts de LinkedIn o descripciones optimizadas.

Reutilizar contenido es la clave para crecer en múltiples plataformas sin trabajar el doble, y TranscriAI es la herramienta perfecta para lograrlo.
    `
  },
  {
    id: '15',
    title: 'Formatos de Audio: ¿Cuál es mejor para TranscriAI?',
    excerpt: 'MP3, WAV, AAC... Te enseñamos a elegir el formato ideal para obtener transcripciones perfectas.',
    date: '15 de Febrero, 2026',
    category: 'Tecnología',
    image: 'https://picsum.photos/seed/formats-ai/800/400',
    content: `
# Formatos de Audio: ¿Cuál es mejor para TranscriAI?

No todos los archivos de audio son iguales. El formato que elijas puede afectar la precisión de nuestra inteligencia artificial.

## Recomendaciones de TranscriAI
- **WAV:** El estándar de oro. Sin compresión, ideal para máxima precisión.
- **MP3 (Alta Calidad):** Excelente para archivos largos, siempre que la tasa de bits sea alta.
- **FLAC:** El equilibrio perfecto entre tamaño y fidelidad.

Para obtener los mejores resultados en TranscriAI, evita archivos con mucho ruido de fondo o excesivamente comprimidos que distorsionen la voz.
    `
  }
];

// --- Components ---

export default function App() {
  const [view, setView] = useState<View>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [state, setState] = useState<AppState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'link' | 'file'>('file');
  
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for cookie consent on mount
  useEffect(() => {
    const consent = localStorage.getItem('transcriai_cookie_consent');
    if (!consent) {
      setShowCookieConsent(true);
    }
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("El archivo es demasiado grande. El límite para esta demo es 50MB.");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleApiError = (err: any) => {
    console.error("Error de API detectado:", err);
    let message = err.message || "Error desconocido al procesar la solicitud.";
    
    // Detectar error de cuota (429)
    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED") || message.includes("quota")) {
      return "⚠️ Has agotado el límite de uso gratuito de la IA por ahora. Esto sucede porque Google limita las peticiones gratuitas por minuto/día. \n\nSOLUCIÓN: Espera 1 o 2 minutos e inténtalo de nuevo. Si el error persiste, es posible que hayas alcanzado el límite diario.";
    }
    
    // Detectar error de API Key
    if (message.includes("API_KEY_INVALID") || message.includes("invalid API key")) {
      return "❌ La clave de API de Gemini no es válida. Por favor, revisa la configuración en 'Settings > Secrets'.";
    }

    return message;
  };

  const transcribeFile = async () => {
    if (!file) return;
    setState('transcribing');
    setError(null);
    try {
      console.log("Iniciando transcripción de archivo...");
      let apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'undefined' || apiKey === '') {
        throw new Error("API Key de Gemini no encontrada. Por favor, ve a 'Settings > Secrets', añade una clave llamada GEMINI_API_KEY con tu valor, pulsa 'Save' y luego pulsa 'Apply changes'.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const base64Data = await fileToBase64(file);
      const mimeType = file.type || 'application/octet-stream';
      console.log("Enviando a Gemini (modelo: gemini-3-flash-preview)...");
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: "Analiza este archivo multimedia y genera una transcripción profesional, perfectamente ordenada, estructurada y completa. Incluye un resumen ejecutivo al inicio." },
          ],
        },
        config: {
          systemInstruction: `Eres TranscriAI, la IA líder en transcripción profesional y análisis de contenido multimedia.
          
TU MISIÓN ES ENTREGAR UN DOCUMENTO IMPECABLE Y PERFECTAMENTE ORDENADO:
1. **Resumen Ejecutivo:** Comienza con un breve resumen (3-5 líneas) de lo que trata el audio/video.
2. **Transcripción Estructurada y Ordenada:** Organiza el contenido por temas o secciones usando títulos de Markdown (##, ###). Asegúrate de que el flujo sea lógico y fácil de seguir.
3. **Identificación de Hablantes:** Usa negritas para los nombres (ej: **Entrevistador:**, **Invitado:**).
4. **Marcas de Tiempo:** Si es posible, incluye marcas de tiempo aproximadas [00:00] al inicio de cada sección importante.
5. **Limpieza Profesional:** Elimina muletillas, tartamudeos y ruidos sin perder el sentido original. Corrige la puntuación para que sea fluida y profesional.
6. **Notas de Contexto:** Para videos, describe acciones clave entre corchetes [ej: El presentador señala una gráfica de ventas].

REGLAS DE ORO:
- Tono: Formal, ejecutivo y preciso.
- Formato: Usa Markdown rico (listas, negritas, tablas si hay datos numéricos).
- Idioma: Responde siempre en el idioma en el que se habla en el archivo, a menos que se pida traducción.`,
        },
      });
      if (!response.text) throw new Error("No se pudo obtener texto del archivo.");
      setResult({ text: response.text, fileName: file.name, fileType: file.type });
      setState('idle');
    } catch (err: any) {
      setError(handleApiError(err));
      setState('error');
    }
  };

  const transcribeLink = async () => {
    if (!link) return;
    setState('transcribing');
    setError(null);
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'undefined' || apiKey === '') {
        throw new Error("API Key de Gemini no encontrada. Por favor, ve a 'Settings > Secrets', añade una clave llamada GEMINI_API_KEY con tu valor, pulsa 'Save' y luego pulsa 'Apply changes'.");
      }
      const ai = new GoogleGenAI({ apiKey });
      console.log("Enviando a Gemini con URL Context y Google Search...");
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [{ text: `Analiza este enlace: ${link}. Genera un informe profesional que incluya la transcripción (o análisis minuto a minuto) y un resumen ejecutivo.` }] },
        config: {
          tools: [{ urlContext: {} }, { googleSearch: {} }],
          systemInstruction: `Eres TranscriAI, un consultor experto en análisis de medios digitales y transcripción de alta fidelidad.

TU OBJETIVO ES CREAR UN INFORME PROFESIONAL:
1. **Ficha Técnica:** Título, Canal/Autor, Duración (si está disponible) y Fecha.
2. **Resumen Ejecutivo:** Un párrafo potente que resuma el valor principal del contenido.
3. **Contenido Estructurado:** Si no puedes obtener la transcripción literal, crea un desglose detallado por secciones de tiempo (ej: [00:00 - 05:00] Introducción y Contexto).
4. **Puntos Clave:** Una lista de "Takeaways" o conclusiones principales.
5. **Análisis de Valor:** ¿A quién le sirve este contenido? ¿Cuál es el mensaje central?

REGLAS:
- Usa Markdown avanzado: Títulos, separadores (---), negritas y listas.
- Si el enlace falla, agota todas las posibilidades usando Google Search para encontrar el guion, transcripción o artículos relacionados.
- El texto debe ser limpio, sin errores gramaticales y con un tono de experto.`,
        },
      });
      if (!response.text) throw new Error("No se pudo procesar el enlace.");
      setResult({ text: response.text, fileName: link });
      setState('idle');
    } catch (err: any) {
      setError(handleApiError(err));
      setState('error');
    }
  };

  const generateSummary = async () => {
    if (!result?.text) return;
    setState('summarizing');
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [{ text: `Genera un resumen ejecutivo, estructurado y profesional de la siguiente transcripción: ${result.text}` }] },
        config: {
          systemInstruction: `Eres un experto en síntesis de información corporativa. 
          
TU OBJETIVO:
1. Crear un resumen de alto nivel que capture la esencia del contenido.
2. Usar una estructura clara: Contexto, Puntos Clave, Conclusiones y Próximos Pasos (si aplica).
3. Mantener un tono profesional, eliminando cualquier redundancia.
4. Usar Markdown avanzado (negritas, listas con viñetas, separadores).`,
        },
      });
      setResult(prev => prev ? { ...prev, summary: response.text } : null);
      setState('idle');
    } catch (err: any) {
      setError(handleApiError(err));
      setState('idle');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const reset = () => {
    setFile(null);
    setLink('');
    setResult(null);
    setError(null);
    setState('idle');
  };

  const renderHome = () => (
    <>
      {/* Hero Section */}
      {!result && (
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4"
          >
            Tus videos y audios, <span className="text-indigo-600">convertidos en texto</span>.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Transcripciones precisas y resúmenes inteligentes impulsados por IA. 
            Sube un archivo o pega un enlace para comenzar.
          </motion.p>
        </div>
      )}

      {/* Action Area */}
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div 
            key="input-area"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-xl shadow-indigo-500/5 border border-gray-100 overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button 
                onClick={() => setActiveTab('file')}
                className={cn(
                  "flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                  activeTab === 'file' ? "text-indigo-600 bg-indigo-50/30 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Upload className="w-4 h-4" />
                Subir Archivo
              </button>
              <button 
                onClick={() => setActiveTab('link')}
                className={cn(
                  "flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                  activeTab === 'link' ? "text-indigo-600 bg-indigo-50/30 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <LinkIcon className="w-4 h-4" />
                Pegar Enlace
              </button>
            </div>

            <div className="p-8 sm:p-12">
              {activeTab === 'file' ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
                    file ? "border-indigo-400 bg-indigo-50/20" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                  )}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="audio/*,video/*"
                  />
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    {file?.type.startsWith('video') ? <Video className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">
                      {file ? file.name : "Haz clic para subir o arrastra un archivo"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      MP3, MP4, WAV, MOV (Máx 50MB)
                    </p>
                  </div>
                  {file && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        transcribeFile();
                      }}
                      disabled={state !== 'idle'}
                      className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-200"
                    >
                      {state === 'transcribing' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      {state === 'transcribing' ? "Transcribiendo..." : "Comenzar Transcripción"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="max-w-xl mx-auto">
                  <div className="relative">
                    <input 
                      type="url" 
                      placeholder="https://www.youtube.com/watch?v=..." 
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  <button 
                    onClick={transcribeLink}
                    disabled={!link || state !== 'idle'}
                    className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                  >
                    {state === 'transcribing' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {state === 'transcribing' ? "Analizando enlace..." : "Transcribir desde Enlace"}
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-6 p-6 bg-red-50 border border-red-100 rounded-3xl flex flex-col gap-4 text-red-600">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">Ha ocurrido un problema</p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{error}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (activeTab === 'file') transcribeFile();
                      else transcribeLink();
                    }}
                    className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                  >
                    <Loader2 className={cn("w-4 h-4", state === 'transcribing' && "animate-spin")} />
                    {state === 'transcribing' ? "Reintentando..." : "Intentar de nuevo ahora"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="result-area"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Column: Transcription */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">Transcripción</h3>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{result.fileName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => copyToClipboard(result.text)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
                      title="Copiar texto"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={reset}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                      title="Nueva transcripción"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-8 prose prose-indigo max-w-none max-h-[600px] overflow-y-auto custom-scrollbar">
                  <Markdown>{result.text}</Markdown>
                </div>
              </div>

              {/* Ad Unit: Below Result */}
              <div className="mt-8">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center mb-2">Publicidad</p>
                <AdUnit slot="1234567890" />
              </div>
            </div>

            {/* Right Column: Actions & Summary */}
            <div className="space-y-6">
              <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Resumen Inteligente
                </h3>
                
                {!result.summary ? (
                  <div className="space-y-4">
                    <p className="text-indigo-100 text-sm leading-relaxed">
                      Genera un resumen automático con los puntos clave y conclusiones más importantes.
                    </p>
                    <button 
                      onClick={generateSummary}
                      disabled={state === 'summarizing'}
                      className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {state === 'summarizing' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                      {state === 'summarizing' ? "Resumiendo..." : "Generar Resumen"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="prose prose-invert text-sm leading-relaxed">
                      <Markdown>{result.summary}</Markdown>
                    </div>
                    {error && error.includes("cuota") && (
                      <button 
                        onClick={generateSummary}
                        className="w-full bg-white/10 text-white py-2 rounded-xl text-xs font-bold hover:bg-white/20 transition-all"
                      >
                        Reintentar resumen
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEO & Informative Content Section */}
      {!result && (
        <div className="mt-24 space-y-24">
          {/* How it works */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto font-bold text-xl">1</div>
              <h3 className="text-xl font-bold">Sube tu Contenido</h3>
              <p className="text-gray-500 text-sm">Sube archivos MP3, WAV, MP4 o simplemente pega un enlace de YouTube.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto font-bold text-xl">2</div>
              <h3 className="text-xl font-bold">Procesamiento IA</h3>
              <p className="text-gray-500 text-sm">Nuestra IA avanzada analiza el audio y lo convierte en texto estructurado en segundos.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto font-bold text-xl">3</div>
              <h3 className="text-xl font-bold">Obtén tu Resultado</h3>
              <p className="text-gray-500 text-sm">Copia la transcripción completa o genera un resumen inteligente con un solo clic.</p>
            </div>
          </section>

          {/* Benefits */}
          <section className="bg-white rounded-[3rem] p-12 sm:p-20 border border-gray-100 shadow-sm">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">¿Por qué elegir TranscriAI?</h2>
              <p className="text-gray-600">La herramienta de transcripción más completa y accesible del mercado.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Precisión Superior</h4>
                  <p className="text-gray-500 text-sm">Utilizamos modelos Gemini de última generación para garantizar una precisión del 95% o superior.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Resúmenes Inteligentes</h4>
                  <p className="text-gray-500 text-sm">No solo transcribimos, extraemos los puntos clave para que ahorres tiempo de lectura.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Velocidad Increíble</h4>
                  <p className="text-gray-500 text-sm">Procesamos horas de audio en apenas unos segundos, optimizando tu flujo de trabajo.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <X className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Sin Registro</h4>
                  <p className="text-gray-500 text-sm">Creemos en la simplicidad. Usa nuestra herramienta sin necesidad de crear una cuenta.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SEO Content / Detailed Explanation */}
          <section className="prose prose-indigo max-w-none bg-indigo-50/30 rounded-[3rem] p-12 sm:p-20">
            <h2 className="text-3xl font-bold text-indigo-900">La Revolución de la Transcripción con Inteligencia Artificial</h2>
            <p className="text-indigo-800/70">
              En la era digital actual, la cantidad de contenido multimedia que generamos y consumimos es abrumadora. Desde podcasts y seminarios web hasta reuniones de Zoom y videos educativos en YouTube, la información fluye constantemente en formato de audio y video. Sin embargo, el texto sigue siendo la forma más eficiente de buscar, organizar y archivar conocimiento. Aquí es donde entra **TranscriAI**.
            </p>
            
            <h3 className="text-2xl font-bold text-indigo-900 mt-8">¿Qué es TranscriAI?</h3>
            <p className="text-indigo-800/70">
              TranscriAI es una plataforma avanzada de **Speech-to-Text** (voz a texto) que utiliza los modelos de lenguaje más potentes del mundo para convertir cualquier archivo multimedia en texto estructurado. Nuestra misión es simple: hacer que cada palabra pronunciada sea accesible y útil. Ya seas un estudiante que necesita pasar sus clases a apuntes, un periodista transcribiendo entrevistas, o un profesional que desea documentar sus reuniones, TranscriAI es tu aliado perfecto.
            </p>

            <h3 className="text-2xl font-bold text-indigo-900 mt-8">Casos de Uso Comunes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="font-bold text-indigo-900">Educación y Estudiantes</h4>
                <p className="text-sm text-indigo-800/70">Convierte grabaciones de clases magistrales en apuntes editables. Ahorra horas de escritura manual y concéntrate en el aprendizaje activo.</p>
              </div>
              <div>
                <h4 className="font-bold text-indigo-900">Periodismo y Medios</h4>
                <p className="text-sm text-indigo-800/70">Transcribe entrevistas de larga duración en segundos. Nuestra IA identifica cambios de contexto y facilita la redacción de noticias.</p>
              </div>
              <div>
                <h4 className="font-bold text-indigo-900">Empresas y Reuniones</h4>
                <p className="text-sm text-indigo-800/70">Documenta actas de reuniones de Zoom, Teams o Google Meet. Genera resúmenes ejecutivos para que todo el equipo esté alineado.</p>
              </div>
              <div>
                <h4 className="font-bold text-indigo-900">Creadores de Contenido</h4>
                <p className="text-sm text-indigo-800/70">Transforma tus videos de YouTube o TikTok en artículos de blog o hilos de redes sociales para maximizar tu alcance.</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-indigo-900 mt-8">Optimización SEO y Accesibilidad</h3>
            <p className="text-indigo-800/70">
              Para los creadores de contenido, la transcripción no es solo una cuestión de comodidad; es una estrategia vital de **SEO (Search Engine Optimization)**. Los motores de búsqueda como Google no pueden "escuchar" un video, pero sí pueden indexar el texto. Al transcribir tus videos con TranscriAI y publicar el texto, estás permitiendo que tu contenido sea descubierto por miles de personas más. Además, mejoras la accesibilidad para personas con discapacidad auditiva, cumpliendo con los estándares modernos de la web inclusiva.
            </p>

            <h3 className="text-2xl font-bold text-indigo-900 mt-8">Tecnología de Vanguardia: Gemini 3 Flash</h3>
            <p className="text-indigo-800/70">
              A diferencia de las herramientas de transcripción tradicionales que a menudo cometen errores gramaticales o pierden el contexto, TranscriAI utiliza la potencia de **Gemini 3 Flash**. Esta tecnología de Google no solo reconoce palabras, sino que entiende el contexto, la intención y la estructura del lenguaje. Esto nos permite ofrecer transcripciones limpias, eliminando muletillas y ruidos innecesarios, entregando un documento listo para ser compartido o publicado.
            </p>
            <p className="text-indigo-800/70">
              Nuestra arquitectura en la nube permite procesar archivos de gran tamaño con una latencia mínima. Mientras que otros servicios tardan minutos u horas, TranscriAI entrega resultados en una fracción del tiempo, permitiéndote mantener un flujo de trabajo ágil y productivo.
            </p>

            <h3 className="text-2xl font-bold text-indigo-900 mt-8">Compromiso con la Calidad y la Innovación</h3>
            <p className="text-indigo-800/70">
              En TranscriAI, estamos constantemente actualizando nuestros algoritmos para soportar más idiomas, dialectos y acentos. Entendemos que el lenguaje es vivo y cambiante, por lo que nuestra IA aprende de millones de interacciones para ser cada vez más precisa. Además, nuestra función de **Resumen Inteligente** utiliza procesamiento de lenguaje natural (NLP) avanzado para destilar horas de conversación en los puntos más relevantes, ahorrándote el recurso más valioso: el tiempo.
            </p>

            <h3 className="text-2xl font-bold text-indigo-900 mt-8">Beneficios Detallados de la Transcripción Automática</h3>
            <p className="text-indigo-800/70">
              La adopción de herramientas de transcripción automática como TranscriAI ofrece una serie de ventajas competitivas tanto para individuos como para organizaciones. A continuación, desglosamos los beneficios más significativos:
            </p>
            <ul className="text-indigo-800/70 list-disc pl-6 space-y-2">
              <li><strong>Ahorro de Tiempo Crítico:</strong> La transcripción manual es una tarea tediosa que puede llevar hasta cinco veces la duración del audio original. Con nuestra IA, este proceso se reduce a segundos, liberando tiempo para tareas de mayor valor estratégico.</li>
              <li><strong>Mejora de la Accesibilidad:</strong> Al proporcionar una versión textual de tus contenidos en audio y video, haces que tu información sea accesible para personas con deficiencias auditivas o para aquellos que prefieren consumir contenido en entornos donde no pueden activar el sonido.</li>
              <li><strong>Facilidad de Búsqueda y Recuperación:</strong> El texto es infinitamente más fácil de buscar que el audio. Con una transcripción, puedes encontrar rápidamente una cita específica o un punto de discusión utilizando la función de búsqueda de tu navegador o sistema operativo.</li>
              <li><strong>Reutilización de Contenido (Content Repurposing):</strong> Una sola entrevista grabada puede convertirse en un artículo de blog, varios posts para redes sociales, un boletín informativo y un guion para un nuevo video. La transcripción es la base de esta estrategia de marketing de contenidos.</li>
              <li><strong>Documentación y Cumplimiento:</strong> Para muchas industrias, mantener un registro escrito de las comunicaciones es un requisito legal o de cumplimiento. TranscriAI facilita esta tarea de manera automatizada y precisa.</li>
            </ul>

            <h3 className="text-2xl font-bold text-indigo-900 mt-8">Caso de Uso: Empresas y Corporaciones</h3>
            <p className="text-indigo-800/70">
              En el entorno corporativo, la eficiencia es la clave del éxito. Las empresas modernas generan una cantidad masiva de datos no estructurados en forma de reuniones, llamadas de ventas y sesiones de formación. TranscriAI ayuda a transformar este "ruido" en activos de conocimiento accionables.
            </p>
            <p className="text-indigo-800/70">
              Imagina una reunión de junta directiva de dos horas. Tradicionalmente, alguien tendría que tomar notas meticulosas, lo que a menudo lleva a la pérdida de matices importantes. Con TranscriAI, la reunión se graba y se transcribe íntegramente. Posteriormente, nuestra IA genera un resumen ejecutivo que destaca los acuerdos alcanzados, las tareas asignadas y los plazos establecidos. Esto no solo mejora la transparencia, sino que también garantiza que todos los miembros del equipo estén en la misma página, reduciendo malentendidos y aumentando la productividad global.
            </p>

            <h3 className="text-2xl font-bold text-indigo-900 mt-8">Nuestra Tecnología de Inteligencia Artificial</h3>
            <p className="text-indigo-800/70">
              El corazón de TranscriAI es una arquitectura de red neuronal profunda diseñada específicamente para el procesamiento del lenguaje natural. Utilizamos modelos de vanguardia como **Gemini 3 Flash**, que han sido entrenados en conjuntos de datos masivos y diversos para comprender no solo las palabras, sino también la semántica y el contexto cultural.
            </p>
            <p className="text-indigo-800/70">
              Nuestra tecnología ASR (Automatic Speech Recognition) emplea técnicas de aprendizaje por refuerzo para mejorar continuamente su precisión. Además, implementamos algoritmos de diarización de hablantes, lo que permite al sistema distinguir entre diferentes voces en una conversación, asignando correctamente cada intervención a su autor. Todo esto se ejecuta en una infraestructura de nube escalable que garantiza que, sin importar cuántos usuarios estén procesando archivos simultáneamente, la experiencia sea siempre fluida y rápida.
            </p>

            <h3 className="text-2xl font-bold text-indigo-900 mt-8">Guía de Inicio Rápido: De Audio a Texto en 3 Pasos</h3>
            <p className="text-indigo-800/70">
              Comenzar con TranscriAI es extremadamente sencillo. Hemos diseñado la interfaz para que sea intuitiva y no requiera conocimientos técnicos previos. Aquí tienes una guía paso a paso para obtener tu primera transcripción:
            </p>
            <ol className="text-indigo-800/70 list-decimal pl-6 space-y-2">
              <li><strong>Selecciona tu Origen:</strong> Elige entre subir un archivo local desde tu dispositivo o pegar un enlace directo de una plataforma como YouTube. Soportamos una amplia variedad de formatos para tu comodidad.</li>
              <li><strong>Inicia el Procesamiento:</strong> Una vez seleccionado el archivo o pegado el enlace, haz clic en el botón de transcripción. Nuestra IA comenzará a trabajar de inmediato, analizando cada segundo de tu contenido.</li>
              <li><strong>Revisa y Exporta:</strong> En cuestión de segundos, verás el texto estructurado en tu pantalla. Puedes copiarlo directamente al portapapeles o generar un resumen inteligente si necesitas una versión condensada.</li>
            </ol>

            <h3 className="text-2xl font-bold text-indigo-900 mt-8">Nuestra Visión: El Futuro de la Comunicación</h3>
            <p className="text-indigo-800/70">
              En TranscriAI, creemos que la tecnología debe servir para eliminar las barreras de la comunicación. Nuestra visión a largo plazo es crear un ecosistema donde cualquier forma de habla, sin importar el idioma o el dialecto, pueda ser instantáneamente comprendida y documentada. Estamos trabajando en integrar funciones de traducción en tiempo real y análisis de sentimientos para proporcionar una capa de comprensión aún más profunda a tus transcripciones.
            </p>
            <p className="text-indigo-800/70">
              La inteligencia artificial no es solo una herramienta de automatización; es un catalizador para la creatividad y la colaboración humana. Al encargarnos de las tareas repetitivas y laboriosas como la transcripción, permitimos que las personas se concentren en lo que realmente importa: generar ideas, contar historias y construir conexiones significativas. Únete a nosotros en este viaje hacia un futuro más conectado y eficiente.
            </p>
          </section>

          {/* FAQ Section */}
          <section className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Preguntas Frecuentes</h2>
            <div className="space-y-6">
              {[
                {
                  q: "¿Es TranscriAI gratuito?",
                  a: "Sí, actualmente ofrecemos una versión gratuita funcional para que cualquier usuario pueda probar la potencia de nuestra IA sin compromiso."
                },
                {
                  q: "¿Qué formatos de archivo soportan?",
                  a: "Soportamos los formatos más comunes incluyendo MP3, WAV, AAC para audio, y MP4, MOV, AVI para video. Prácticamente cualquier archivo multimedia moderno es compatible."
                },
                {
                  q: "¿Cómo garantizan mi privacidad?",
                  a: "Tu privacidad es nuestra prioridad absoluta. No almacenamos tus archivos de forma permanente. Una vez procesada la transcripción, los datos temporales se eliminan de nuestros servidores de forma segura."
                },
                {
                  q: "¿Puedo transcribir videos de YouTube?",
                  a: "¡Por supuesto! Solo tienes que pegar la URL del video en nuestra pestaña de 'Enlace' y nosotros nos encargamos del resto, analizando el contenido mediante URL Context."
                },
                {
                  q: "¿Cuánto tiempo tarda la transcripción?",
                  a: "La mayoría de los archivos se procesan en menos de un minuto. La velocidad depende de la duración del audio, pero nuestra IA está optimizada para ser ultra rápida."
                },
                {
                  q: "¿En qué idiomas funciona?",
                  a: "TranscriAI es multilingüe. Detecta automáticamente el idioma hablado y genera la transcripción en consecuencia. Soporta español, inglés, francés, alemán, italiano y muchos más."
                }
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-indigo-600 mb-2">{item.q}</h4>
                  <p className="text-gray-500 text-sm">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );

  const renderBlog = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-4xl font-bold tracking-tight">Blog de TranscriAI</h2>
        <p className="text-gray-600 mt-2">Aprende sobre transcripción, IA y productividad.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {BLOG_POSTS.map((post, index) => (
          <React.Fragment key={post.id}>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm cursor-pointer"
              onClick={() => {
                setSelectedPost(post);
                setView('article');
              }}
            >
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
              <div className="p-6">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{post.category}</span>
                <h3 className="text-xl font-bold mt-2 leading-tight">{post.title}</h3>
                <p className="text-gray-500 text-sm mt-3 line-clamp-2">{post.excerpt}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{post.date}</span>
                  <ChevronRight className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
            </motion.div>
            {/* Insert Ad after 3rd post */}
            {index === 2 && (
              <div className="col-span-full py-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center mb-2">Publicidad</p>
                <AdUnit slot="0987654321" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderArticle = () => (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
      <button onClick={() => setView('blog')} className="text-indigo-600 font-bold flex items-center gap-2 mb-8 hover:underline">
        <ChevronRight className="w-4 h-4 rotate-180" />
        Volver al Blog
      </button>
      {selectedPost && (
        <article className="prose prose-indigo max-w-none">
          <img src={selectedPost.image} alt={selectedPost.title} className="w-full rounded-2xl mb-8" referrerPolicy="no-referrer" />
          <Markdown>{selectedPost.content}</Markdown>
          
          {/* Ad Unit: Bottom of Article */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center mb-2">Publicidad</p>
            <AdUnit slot="1122334455" />
          </div>
        </article>
      )}
    </div>
  );

  const renderAbout = () => (
    <div className="max-w-3xl mx-auto space-y-8 bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
      <h2 className="text-4xl font-bold text-indigo-600">Sobre TranscriAI</h2>
      <p className="text-lg text-gray-600 leading-relaxed">
        TranscriAI nació con una misión clara: democratizar el acceso a la información contenida en formatos multimedia. 
        Creemos que el conocimiento no debería estar limitado por el tiempo que toma escuchar un audio o ver un video largo.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
        <div className="p-6 bg-indigo-50 rounded-2xl">
          <h4 className="font-bold text-indigo-900 mb-2">Nuestra Misión</h4>
          <p className="text-sm text-indigo-700">Hacer que cada palabra en audio o video sea accesible, buscable y útil para todos.</p>
        </div>
        <div className="p-6 bg-emerald-50 rounded-2xl">
          <h4 className="font-bold text-emerald-900 mb-2">Tecnología</h4>
          <p className="text-sm text-emerald-700">Utilizamos los modelos de IA más avanzados del mundo para garantizar precisión y velocidad.</p>
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-12 shadow-sm border border-gray-100 prose prose-indigo">
      <h1>Política de Privacidad</h1>
      <p>Última actualización: 21 de Marzo, 2026</p>
      <p>En TranscriAI, valoramos tu privacidad. Esta política explica cómo manejamos tus datos.</p>
      <h2>1. Recopilación de Datos</h2>
      <p>No almacenamos los archivos de audio o video que subes. El procesamiento se realiza en tiempo real y los datos se eliminan inmediatamente después de la transcripción.</p>
      <h2>2. Uso de Cookies</h2>
      <p>Utilizamos cookies esenciales para el funcionamiento del sitio y para Google AdSense con el fin de mostrar anuncios relevantes.</p>
      <h2>3. Seguridad</h2>
      <p>Implementamos medidas de seguridad estándar de la industria para proteger tu información durante la transmisión.</p>
    </div>
  );

  const renderCookies = () => (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-12 shadow-sm border border-gray-100 prose prose-indigo">
      <h1>Política de Cookies</h1>
      <p>Última actualización: 24 de Marzo, 2026</p>
      <p>En TranscriAI utilizamos cookies propias y de terceros para mejorar tu experiencia de navegación, analizar el tráfico del sitio y mostrar publicidad relevante a través de Google AdSense.</p>
      
      <h2>1. ¿Qué son las cookies?</h2>
      <p>Las cookies son pequeños archivos de texto que los sitios web envían al navegador y que se almacenan en el terminal del usuario (ordenador, teléfono móvil o tablet). Estos archivos permiten que el sitio web recuerde información sobre su visita, lo que puede facilitar su próxima visita y hacer que el sitio le resulte más útil.</p>

      <h2>2. Tipos de cookies que utilizamos</h2>
      <ul>
        <li><strong>Cookies técnicas (Necesarias):</strong> Son aquellas que permiten al usuario la navegación a través de una página web y la utilización de las diferentes opciones o servicios que en ella existan, como controlar el tráfico y la comunicación de datos, identificar la sesión o utilizar elementos de seguridad.</li>
        <li><strong>Cookies de personalización:</strong> Permiten al usuario acceder al servicio con algunas características de carácter general predefinidas en función de una serie de criterios en el terminal del usuario como por ejemplo el idioma o el tipo de navegador.</li>
        <li><strong>Cookies de análisis:</strong> Son aquellas que, tratadas por nosotros o por terceros, nos permiten cuantificar el número de usuarios y así realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio ofertado.</li>
        <li><strong>Cookies publicitarias (Google AdSense):</strong> Google utiliza cookies para servir anuncios en este sitio web. El uso de cookies de publicidad permite a Google y a sus socios servir anuncios basados en las visitas de los usuarios a sus sitios o a otros sitios en Internet.</li>
      </ul>

      <h2>3. Cookies de terceros</h2>
      <p>En particular, este sitio utiliza Google AdSense, un servicio de publicidad proporcionado por Google, Inc. Para ello, Google utiliza cookies que recopilan información, incluida la dirección IP del usuario, que será transmitida, tratada y almacenada por Google en los términos fijados en la web Google.com. Incluyendo la posible transmisión de dicha información a terceros por razones de exigencia legal o cuando dichos terceros procesen la información por cuenta de Google.</p>

      <h2>4. Cómo gestionar y desactivar las cookies</h2>
      <p>El usuario puede en cualquier momento elegir qué cookies quiere que funcionen en este sitio web mediante la configuración del navegador:</p>
      <ul>
        <li><strong>Chrome:</strong> Configuración -&gt; Mostrar opciones avanzadas -&gt; Privacidad -&gt; Configuración de contenido.</li>
        <li><strong>Firefox:</strong> Herramientas -&gt; Opciones -&gt; Privacidad -&gt; Historial -&gt; Configuración Personalizada.</li>
        <li><strong>Internet Explorer:</strong> Herramientas -&gt; Opciones de Internet -&gt; Privacidad -&gt; Configuración.</li>
        <li><strong>Safari:</strong> Preferencias -&gt; Seguridad.</li>
      </ul>
      <p>Si bloqueas el uso de cookies en tu navegador es posible que algunos servicios o funcionalidades del sitio web no estén disponibles.</p>
    </div>
  );

  const renderTerms = () => (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-12 shadow-sm border border-gray-100 prose prose-indigo">
      <h1>Términos y Condiciones</h1>
      <p>Al usar TranscriAI, aceptas los siguientes términos:</p>
      <ul>
        <li>El servicio se proporciona "tal cual" sin garantías de precisión absoluta.</li>
        <li>Eres responsable del contenido que transcribes y debes tener los derechos necesarios.</li>
        <li>No está permitido el uso abusivo o automatizado del servicio sin autorización.</li>
      </ul>
    </div>
  );

  const renderContact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!supabase) {
        setError("Supabase no está configurado correctamente.");
        setStatus('error');
        return;
      }

      setStatus('submitting');
      try {
        const { error: sbError } = await supabase
          .from('contacts')
          .insert([
            { 
              name: formData.name, 
              email: formData.email, 
              message: formData.message,
              created_at: new Date().toISOString()
            }
          ]);

        if (sbError) throw sbError;
        
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } catch (err: any) {
        console.error("Error al enviar mensaje:", err);
        setError("No se pudo enviar el mensaje. Por favor, inténtalo de nuevo.");
        setStatus('error');
      }
    };

    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold mb-6">Contáctanos</h2>
        <p className="text-gray-600 mb-8">¿Tienes alguna duda o sugerencia? Estamos aquí para escucharte.</p>
        
        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 border border-emerald-100 p-8 rounded-2xl text-center"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-emerald-900 mb-2">¡Mensaje Enviado!</h3>
            <p className="text-emerald-700 text-sm mb-6">Gracias por contactarnos. Te responderemos lo antes posible.</p>
            <button 
              onClick={() => setStatus('idle')}
              className="text-emerald-600 font-bold hover:underline"
            >
              Enviar otro mensaje
            </button>
          </motion.div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold mb-1">Nombre</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="Tu nombre" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Email</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="tu@email.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Mensaje</label>
              <textarea 
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-32 focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="¿En qué podemos ayudarte?"
              ></textarea>
            </div>
            <button 
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'submitting' ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {status === 'submitting' ? "Enviando..." : "Enviar Mensaje"}
            </button>
            {status === 'error' && (
              <p className="text-red-500 text-xs text-center mt-2">Hubo un error al enviar el mensaje. Verifica la configuración de Supabase.</p>
            )}
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-indigo-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('home'); setIsMenuOpen(false); }}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">TranscriAI</h1>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-500">
            <button onClick={() => setView('home')} className={cn("hover:text-indigo-600 transition-colors", view === 'home' && "text-indigo-600")}>Herramienta</button>
            <button onClick={() => setView('blog')} className={cn("hover:text-indigo-600 transition-colors", (view === 'blog' || view === 'article') && "text-indigo-600")}>Blog</button>
            <button onClick={() => setView('about')} className={cn("hover:text-indigo-600 transition-colors", view === 'about' && "text-indigo-600")}>Sobre Nosotros</button>
            <button onClick={() => setView('contact')} className={cn("hover:text-indigo-600 transition-colors", view === 'contact' && "text-indigo-600")}>Contacto</button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="sm:hidden p-2 text-gray-500 hover:text-indigo-600 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4 text-base font-medium text-gray-600">
                <button 
                  onClick={() => { setView('home'); setIsMenuOpen(false); }} 
                  className={cn("flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all", view === 'home' && "bg-indigo-50 text-indigo-600")}
                >
                  Herramienta
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { setView('blog'); setIsMenuOpen(false); }} 
                  className={cn("flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all", (view === 'blog' || view === 'article') && "bg-indigo-50 text-indigo-600")}
                >
                  Blog
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { setView('about'); setIsMenuOpen(false); }} 
                  className={cn("flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all", view === 'about' && "bg-indigo-50 text-indigo-600")}
                >
                  Sobre Nosotros
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { setView('contact'); setIsMenuOpen(false); }} 
                  className={cn("flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all", view === 'contact' && "bg-indigo-50 text-indigo-600")}
                >
                  Contacto
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'home' && renderHome()}
            {view === 'blog' && renderBlog()}
            {view === 'article' && renderArticle()}
            {view === 'about' && renderAbout()}
            {view === 'contact' && renderContact()}
            {view === 'privacy' && renderPrivacy()}
            {view === 'terms' && renderTerms()}
            {view === 'cookies' && renderCookies()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span className="text-lg font-bold">TranscriAI</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs">
                La herramienta definitiva para convertir tus contenidos multimedia en texto útil y accionable mediante IA.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><button onClick={() => setView('privacy')} className="hover:text-indigo-600">Privacidad</button></li>
                <li><button onClick={() => setView('terms')} className="hover:text-indigo-600">Términos</button></li>
                <li><button onClick={() => setView('cookies')} className="hover:text-indigo-600">Cookies</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider">Sitio</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><button onClick={() => setView('home')} className="hover:text-indigo-600">Herramienta</button></li>
                <li><button onClick={() => setView('blog')} className="hover:text-indigo-600">Blog</button></li>
                <li><button onClick={() => setView('about')} className="hover:text-indigo-600">Sobre Nosotros</button></li>
                <li><button onClick={() => setView('contact')} className="hover:text-indigo-600">Contacto</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col sm:row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © 2026 TranscriAI. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 cursor-pointer transition-all">
                <Copy className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>

      {/* Cookie Consent Banner */}
      <AnimatePresence>
        {showCookieConsent && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 z-[100] max-w-lg mx-auto"
          >
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Utilizamos cookies para mejorar tu experiencia y mostrar publicidad relevante. Al continuar navegando, aceptas nuestra <button onClick={() => { setView('cookies'); setShowCookieConsent(false); }} className="text-indigo-600 font-bold hover:underline">Política de Cookies</button>.
                </p>
              </div>
              <button 
                onClick={() => {
                  localStorage.setItem('transcriai_cookie_consent', 'true');
                  setShowCookieConsent(false);
                }}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all whitespace-nowrap shadow-lg shadow-indigo-200"
              >
                Aceptar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
