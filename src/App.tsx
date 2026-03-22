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

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants & Types ---

const MODELS = {
  TRANSCRIPTION: "gemini-3-flash-preview",
  SUMMARY: "gemini-3-flash-preview",
};

type AppState = 'idle' | 'uploading' | 'transcribing' | 'summarizing' | 'error';
type View = 'home' | 'blog' | 'about' | 'contact' | 'privacy' | 'terms' | 'article';

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
    id: '1',
    title: 'Cómo transcribir videos de YouTube legalmente en 2026',
    excerpt: 'Descubre las mejores prácticas y herramientas para obtener el texto de cualquier video de forma ética y rápida.',
    date: '20 de Marzo, 2026',
    category: 'Guías',
    image: 'https://picsum.photos/seed/youtube/800/400',
    content: `
# Cómo transcribir videos de YouTube legalmente en 2026

La transcripción de videos se ha vuelto una herramienta esencial para creadores de contenido, estudiantes y profesionales. En esta guía, exploramos cómo TranscriAI utiliza inteligencia artificial avanzada para procesar contenido de manera legal.

## ¿Por qué transcribir videos?
1. **Accesibilidad:** Permite que personas con discapacidad auditiva consuman tu contenido.
2. **SEO:** Los buscadores como Google pueden indexar el texto, mejorando tu posicionamiento.
3. **Reutilización:** Convierte un video en un artículo de blog o un hilo de Twitter en segundos.

## El proceso legal
Es importante recordar que siempre debes tener los derechos o el permiso para utilizar el contenido que transcribes si planeas publicarlo. TranscriAI facilita el proceso técnico, pero la ética del contenido depende de ti.
    `
  },
  {
    id: '2',
    title: 'IA vs Transcripción Manual: ¿Cuál elegir?',
    excerpt: 'Analizamos los costos, la precisión y el tiempo de entrega entre los servicios humanos y la nueva era de la IA.',
    date: '18 de Marzo, 2026',
    category: 'Tecnología',
    image: 'https://picsum.photos/seed/tech/800/400',
    content: `
# IA vs Transcripción Manual: ¿Cuál elegir?

Hace apenas unos años, la transcripción manual era la única opción si buscabas precisión. Hoy, modelos como Gemini 3 han cambiado las reglas del juego.

## Ventajas de la IA
- **Velocidad:** Transcribe una hora de audio en menos de un minuto.
- **Costo:** Fracción del precio de un transcriptor humano.
- **Disponibilidad:** 24/7 sin esperas.

## ¿Cuándo usar transcripción manual?
Aún es preferible en casos de audio extremadamente ruidoso o con tecnicismos legales muy específicos que requieren una revisión humana final.
    `
  },
  {
    id: '3',
    title: '5 Consejos para mejorar la calidad de tus audios',
    excerpt: 'Si quieres transcripciones perfectas, necesitas un audio limpio. Aquí te enseñamos cómo lograrlo sin equipo profesional.',
    date: '15 de Marzo, 2026',
    category: 'Tips',
    image: 'https://picsum.photos/seed/audio/800/400',
    content: `
# 5 Consejos para mejorar la calidad de tus audios

Para obtener una transcripción de alta calidad con IA, el audio original debe ser lo más claro posible. Aquí te dejamos 5 consejos prácticos:

1. **Elimina el ruido de fondo:** Busca un lugar silencioso. Apaga ventiladores o aires acondicionados.
2. **Usa un micrófono externo:** Incluso los auriculares de tu móvil suelen ser mejores que el micrófono integrado del portátil.
3. **Mantén una distancia constante:** Habla a unos 15-20 cm del micrófono para evitar distorsiones.
4. **Evita las interrupciones:** Si es una entrevista, intenta que las personas no hablen al mismo tiempo.
5. **Formato de alta calidad:** Siempre que sea posible, graba en formatos sin pérdida como WAV o FLAC.
    `
  },
  {
    id: '4',
    title: 'Cómo convertir audio a texto online gratis en 2026',
    excerpt: '¿Necesitas pasar un audio a texto sin gastar dinero? Te mostramos las mejores opciones gratuitas y cómo aprovecharlas.',
    date: '12 de Marzo, 2026',
    category: 'Guías',
    image: 'https://picsum.photos/seed/free/800/400',
    content: `
# Cómo convertir audio a texto online gratis en 2026

Existen muchas herramientas para convertir audio a texto, pero no todas son gratuitas o de buena calidad. En TranscriAI ofrecemos una opción potente y accesible.

## Herramientas gratuitas populares
- **Google Docs:** Su función de dictado por voz es excelente para transcripciones en tiempo real.
- **TranscriAI (Demo):** Nuestra herramienta permite procesar archivos y enlaces de forma rápida.
- **YouTube:** Puedes subir un video de forma privada y esperar a que genere los subtítulos automáticos.

## Limitaciones de lo gratuito
Normalmente, las herramientas gratuitas tienen límites de tiempo o de tamaño de archivo. Para proyectos profesionales, siempre es recomendable usar servicios de IA dedicados.
    `
  },
  {
    id: '5',
    title: '¿Qué es una transcripción automática y cómo funciona?',
    excerpt: 'Entiende la tecnología detrás de la magia: desde el procesamiento de ondas sonoras hasta el texto final.',
    date: '10 de Marzo, 2026',
    category: 'Tecnología',
    image: 'https://picsum.photos/seed/ai-tech/800/400',
    content: `
# ¿Qué es una transcripción automática y cómo funciona?

La transcripción automática utiliza una tecnología llamada ASR (Automatic Speech Recognition). Pero, ¿cómo funciona realmente?

## El proceso paso a paso
1. **Captura de audio:** El sistema recibe las ondas sonoras.
2. **Procesamiento de señal:** Se limpia el ruido y se identifican los fonemas.
3. **Modelado de lenguaje:** La IA predice qué palabras tienen más sentido según el contexto.
4. **Salida de texto:** El resultado final que ves en pantalla.

Gracias a modelos como Gemini, la precisión ha pasado del 70% a más del 95% en los últimos años.
    `
  },
  {
    id: '6',
    title: 'Transcripción para estudiantes: Cómo ahorrar horas de estudio',
    excerpt: 'Convierte tus grabaciones de clase en apuntes perfectos. La técnica definitiva para mejorar tus notas.',
    date: '08 de Marzo, 2026',
    category: 'Educación',
    image: 'https://picsum.photos/seed/study/800/400',
    content: `
# Transcripción para estudiantes: Cómo ahorrar horas de estudio

Tomar apuntes a mano mientras escuchas al profesor puede ser estresante. La transcripción por IA es la solución perfecta.

## Beneficios para el estudiante
- **Atención total:** Escucha la clase sin preocuparte por escribir cada palabra.
- **Búsqueda rápida:** Encuentra conceptos específicos en tus apuntes digitales en segundos.
- **Resúmenes automáticos:** Usa TranscriAI para obtener los puntos clave de una clase de 2 horas.

## Consejos de estudio
Graba la clase (con permiso), transcríbela y luego revisa el texto para añadir tus propias notas y comentarios.
    `
  },
  {
    id: '7',
    title: 'El futuro de la inteligencia artificial en el procesamiento de voz',
    excerpt: '¿Hacia dónde vamos? Traducción en tiempo real, clonación de voz y transcripciones perfectas.',
    date: '05 de Marzo, 2026',
    category: 'Tecnología',
    image: 'https://picsum.photos/seed/future/800/400',
    content: `
# El futuro de la inteligencia artificial en el procesamiento de voz

La IA no solo está aprendiendo a escribir lo que decimos, sino a entender nuestras emociones y el contexto cultural de nuestras palabras.

## Tendencias para los próximos años
- **Traducción instantánea:** Hablar en español y que te escuchen en japonés en tiempo real.
- **Detección de emociones:** Sistemas que adaptan su respuesta según tu tono de voz.
- **Integración total:** Asistentes virtuales que transcriben todas tus reuniones de forma invisible.

El futuro es apasionante y en TranscriAI estamos a la vanguardia de estos cambios.
    `
  },
  {
    id: '8',
    title: 'Cómo usar TranscriAI para mejorar tu SEO',
    excerpt: 'El contenido en video es genial, pero el texto es lo que Google lee. Aprende a posicionar tu web con transcripciones.',
    date: '03 de Marzo, 2026',
    category: 'Marketing',
    image: 'https://picsum.photos/seed/seo/800/400',
    content: `
# Cómo usar TranscriAI para mejorar tu SEO

Google todavía no puede "ver" videos de la misma forma que lee texto. Por eso, las transcripciones son tu mejor aliado para el SEO.

## Estrategia SEO con transcripciones
1. **Publica la transcripción:** Añádela debajo de tu video en tu blog.
2. **Crea artículos derivados:** Usa partes de la transcripción para crear nuevos posts.
3. **Mejora el tiempo de permanencia:** El texto permite que los usuarios consuman el contenido a su ritmo.

Una web con texto e imágenes siempre posicionará mejor que una que solo tiene videos incrustados.
    `
  },
  {
    id: '9',
    title: 'Diferencias entre transcripción y subtitulado',
    excerpt: 'Parecen lo mismo, pero tienen objetivos y procesos técnicos muy diferentes. Te lo explicamos.',
    date: '01 de Marzo, 2026',
    category: 'Guías',
    image: 'https://picsum.photos/seed/subtitles/800/400',
    content: `
# Diferencias entre transcripción y subtitulado

Mucha gente confunde estos términos, pero en el mundo profesional son cosas distintas.

## Transcripción
Es el proceso de convertir audio a texto plano. No suele tener marcas de tiempo y se usa para actas, apuntes o artículos.

## Subtitulado
Es la transcripción adaptada para ser leída mientras se ve el video. Requiere sincronización temporal (timecodes) y límites de caracteres por línea para que sea legible.

En TranscriAI nos enfocamos en la transcripción y el resumen inteligente para maximizar tu productividad.
    `
  },
  {
    id: '10',
    title: 'Cómo transcribir una entrevista periodística en minutos',
    excerpt: 'Guía para periodistas: de la grabadora al papel sin perder la esencia de la entrevista.',
    date: '28 de Febrero, 2026',
    category: 'Periodismo',
    image: 'https://picsum.photos/seed/journalism/800/400',
    content: `
# Cómo transcribir una entrevista periodística en minutos

Para un periodista, transcribir una entrevista de una hora puede tomar hasta 4 horas de trabajo manual. Con la IA, ese tiempo se reduce a minutos.

## Flujo de trabajo eficiente
1. **Graba con calidad:** Usa una grabadora digital o una app profesional.
2. **Sube a TranscriAI:** Obtén el texto en bruto rápidamente.
3. **Edita y pule:** Revisa el texto para asegurar que las citas sean exactas y tengan el tono adecuado.

Ahorrar tiempo en la transcripción te permite dedicar más energía a la investigación y a la redacción de la historia.
    `
  },
  {
    id: '11',
    title: 'Transcripción de podcasts: Lleva tu contenido a más personas',
    excerpt: '¿Tienes un podcast? Aprende cómo las transcripciones pueden ayudarte a llegar a una audiencia global.',
    date: '25 de Febrero, 2026',
    category: 'Podcasting',
    image: 'https://picsum.photos/seed/podcast/800/400',
    content: `
# Transcripción de podcasts: Lleva tu contenido a más personas

El podcasting es un formato increíble, pero tiene una barrera: no es fácil de buscar ni de consumir para personas con problemas auditivos.

## Por qué transcribir tu podcast
- **Accesibilidad:** Haz que tu contenido sea inclusivo.
- **SEO para audio:** Google indexará el texto de tu podcast, atrayendo tráfico orgánico.
- **Notas del episodio:** Usa la transcripción para crear notas detalladas y resúmenes.

Con TranscriAI, puedes procesar tus episodios en segundos y mejorar el alcance de tu marca.
    `
  },
  {
    id: '12',
    title: 'Cómo transcribir reuniones de Zoom y Microsoft Teams',
    excerpt: 'No pierdas ni un detalle de tus reuniones de trabajo. La guía definitiva para la productividad corporativa.',
    date: '22 de Febrero, 2026',
    category: 'Productividad',
    image: 'https://picsum.photos/seed/meetings/800/400',
    content: `
# Cómo transcribir reuniones de Zoom y Microsoft Teams

Las reuniones son necesarias, pero a veces se pierde información importante. La transcripción automática es tu mejor aliada.

## Pasos para una reunión productiva
1. **Graba la sesión:** Asegúrate de que todos los participantes estén de acuerdo.
2. **Sube el archivo:** Usa TranscriAI para obtener el texto de la reunión.
3. **Genera un resumen:** Extrae los acuerdos y tareas pendientes automáticamente.

Tener un registro escrito de tus reuniones mejora la transparencia y la ejecución de proyectos.
    `
  },
  {
    id: '13',
    title: 'Seguridad y privacidad en la transcripción por IA',
    excerpt: '¿Es seguro subir tus audios a la nube? Analizamos cómo protegemos tus datos en TranscriAI.',
    date: '20 de Febrero, 2026',
    category: 'Seguridad',
    image: 'https://picsum.photos/seed/security/800/400',
    content: `
# Seguridad y privacidad en la transcripción por IA

La privacidad es nuestra prioridad. Cuando subes un archivo a TranscriAI, nos aseguramos de que tus datos estén protegidos.

## Nuestras medidas de seguridad
- **Encriptación:** Los datos se transmiten de forma segura.
- **No almacenamiento:** No guardamos tus archivos más tiempo del necesario para el procesamiento.
- **IA Ética:** Utilizamos modelos de Google que cumplen con los más altos estándares de seguridad.

Puedes confiar en que tu información confidencial se maneja con el máximo cuidado profesional.
    `
  },
  {
    id: '14',
    title: 'Cómo transcribir videos de Instagram y TikTok',
    excerpt: 'Aprende a extraer el texto de los videos cortos más populares para reutilizar el contenido.',
    date: '18 de Febrero, 2026',
    category: 'Redes Sociales',
    image: 'https://picsum.photos/seed/social/800/400',
    content: `
# Cómo transcribir videos de Instagram y TikTok

Los videos cortos dominan las redes sociales, pero a veces necesitas el texto para un subtitulado manual o para un post en otra plataforma.

## Proceso de transcripción
1. **Descarga el video:** Usa herramientas externas para obtener el archivo MP4.
2. **Sube a TranscriAI:** Procesa el audio del video corto.
3. **Adapta el contenido:** Usa el texto para crear hilos de Twitter o descripciones de YouTube.

Reutilizar contenido es la clave para crecer en múltiples plataformas sin trabajar el doble.
    `
  },
  {
    id: '15',
    title: 'Guía completa de formatos de audio para transcripción',
    excerpt: 'MP3, WAV, AAC... ¿Cuál es el mejor formato para obtener resultados precisos?',
    date: '15 de Febrero, 2026',
    category: 'Tecnología',
    image: 'https://picsum.photos/seed/formats/800/400',
    content: `
# Guía completa de formatos de audio para transcripción

No todos los archivos de audio son iguales. El formato que elijas puede afectar drásticamente la precisión de la IA.

## Formatos recomendados
- **WAV:** Sin compresión, ideal para máxima precisión.
- **MP3 (320kbps):** Buen equilibrio entre tamaño y calidad.
- **FLAC:** Compresión sin pérdida, excelente para archivos largos.

Evita formatos muy comprimidos o de baja calidad, ya que el ruido digital puede confundir a los algoritmos de transcripción.
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const transcribeFile = async () => {
    if (!file) return;
    setState('transcribing');
    setError(null);
    try {
      console.log("Iniciando transcripción de archivo...");
      let apiKey = process.env.GEMINI_KEY || process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'undefined' || apiKey === '') {
        throw new Error("API Key de Gemini no encontrada. Por favor, ve a 'Settings > Secrets', añade una clave llamada GEMINI_KEY con tu valor, pulsa 'Save' y luego MUY IMPORTANTE: pulsa el botón 'Apply changes' para reiniciar el servidor.");
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
            { text: "Analiza este archivo multimedia y genera una transcripción profesional, estructurada y completa. Incluye un resumen ejecutivo al inicio." },
          ],
        },
        config: {
          systemInstruction: `Eres TranscriAI, la IA líder en transcripción profesional y análisis de contenido multimedia.
          
TU MISIÓN ES ENTREGAR UN DOCUMENTO IMPECABLE:
1. **Resumen Ejecutivo:** Comienza con un breve resumen (3-5 líneas) de lo que trata el audio/video.
2. **Transcripción Estructurada:** Organiza el contenido por temas o secciones usando títulos de Markdown (##, ###).
3. **Identificación de Hablantes:** Usa negritas para los nombres (ej: **Entrevistador:**, **Invitado:**).
4. **Marcas de Tiempo:** Si es posible, incluye marcas de tiempo aproximadas [00:00] al inicio de cada sección importante.
5. **Limpieza Profesional:** Elimina muletillas, tartamudeos y ruidos sin perder el sentido original. Corrige la puntuación para que sea fluida.
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
      setError(err.message || "Error al procesar el archivo.");
      setState('error');
    }
  };

  const transcribeLink = async () => {
    if (!link) return;
    setState('transcribing');
    setError(null);
    try {
      const apiKey = process.env.GEMINI_KEY || process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'undefined' || apiKey === '') {
        throw new Error("API Key de Gemini no encontrada. Por favor, ve a 'Settings > Secrets', añade una clave llamada GEMINI_KEY con tu valor, pulsa 'Save' y luego MUY IMPORTANTE: pulsa el botón 'Apply changes' para reiniciar el servidor.");
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
      setError(err.message || "Error al procesar el enlace.");
      setState('error');
    }
  };

  const generateSummary = async () => {
    if (!result?.text) return;
    setState('summarizing');
    try {
      const apiKey = process.env.GEMINI_KEY || process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
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
      setError("Error al generar el resumen.");
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
                      MP3, MP4, WAV, MOV (Máx 20MB para demo)
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
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
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
                  <div className="prose prose-invert text-sm leading-relaxed">
                    <Markdown>{result.summary}</Markdown>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  const renderBlog = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-4xl font-bold tracking-tight">Blog de TranscriAI</h2>
        <p className="text-gray-600 mt-2">Aprende sobre transcripción, IA y productividad.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {BLOG_POSTS.map((post) => (
          <motion.div 
            key={post.id}
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

  const renderContact = () => (
    <div className="max-w-xl mx-auto bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
      <h2 className="text-3xl font-bold mb-6">Contáctanos</h2>
      <p className="text-gray-600 mb-8">¿Tienes alguna duda o sugerencia? Estamos aquí para escucharte.</p>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-bold mb-1">Nombre</label>
          <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="Tu nombre" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Email</label>
          <input type="email" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="tu@email.com" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Mensaje</label>
          <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-32" placeholder="¿En qué podemos ayudarte?"></textarea>
        </div>
        <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all">
          Enviar Mensaje
        </button>
      </form>
    </div>
  );

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
                <li><button onClick={() => setView('contact')} className="hover:text-indigo-600">Cookies</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider">Sitio</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><button onClick={() => setView('home')} className="hover:text-indigo-600">Herramienta</button></li>
                <li><button onClick={() => setView('blog')} className="hover:text-indigo-600">Blog</button></li>
                <li><button onClick={() => setView('about')} className="hover:text-indigo-600">Sobre Nosotros</button></li>
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
    </div>
  );
}
