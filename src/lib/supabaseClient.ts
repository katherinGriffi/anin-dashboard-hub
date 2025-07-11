import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'URL_DE_TU_PROYECTO' // Pega tu URL aquí
const supabaseAnonKey = 'CLAVE_ANON_PUBLICA_AQUI' // Pega tu clave anon aquí

export const supabase = createClient(supabaseUrl, supabaseAnonKey)